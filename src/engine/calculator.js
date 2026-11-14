/**
 * ENGINE: calculator.js
 * Pure JavaScript — zero React/UI dependency.
 * All functions are stateless and testable in isolation.
 *
 * Formula reference (SNI 03-6197-2020, ruang demi ruang):
 *   LPD_Baseline = Σ(SNI_LPD_i × Area_i) / Σ(Area_i)
 *   LPD_Design   = Σ(Σ(Watt_lamp_j × Points_j)_room_i) / Σ(Area_i)
 *   % Reduction  = (LPD_Baseline − LPD_Design) / LPD_Baseline × 100
 */

import SNI_DATABASE from '../data/sniDatabase.js';

// ─── Sanitisation ────────────────────────────────────────────────

/**
 * Clamp a numeric value to a valid finite range.
 * Returns 0 for NaN / Infinity.
 */
export function sanitizeNum(v, min = 0, max = 1e9) {
  const n = parseFloat(v);
  if (!isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
}

/**
 * Sanitise a string: trim and cap length.
 * Values are rendered as React text nodes, so HTML escaping here would
 * double-encode user input (e.g. "R & D" becoming "R &amp; D").
 */
export function sanitizeStr(s, maxLen = 200) {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, maxLen);
}

// ─── Lookups ─────────────────────────────────────────────────────

/**
 * Returns the SNI standard LPD (W/m²) for a given typology + room ID.
 * Returns 0 if not found (room not yet selected or unknown).
 */
export function getSNILPD(typologyKey, roomId) {
  if (!typologyKey || !roomId) return 0;
  const typology = SNI_DATABASE[typologyKey];
  if (!typology) return 0;
  const room = typology.rooms.find((r) => r.id === roomId);
  return room ? room.lpd : 0;
}

/**
 * Returns the wattage of a single lamp by its code (e.g. "L1").
 * Returns 0 if lamp not found.
 */
export function getLampWatts(code, lightingDB) {
  if (!code || !lightingDB?.length) return 0;
  const lamp = lightingDB.find((l) => l.code === code);
  return lamp ? sanitizeNum(lamp.watts) : 0;
}

/**
 * Number of room rows that currently reference a lamp code.
 * Used to warn before deleting a lighting system that is still in use.
 */
export function countLampUsage(rooms, code) {
  if (!code || !Array.isArray(rooms)) return 0;
  return rooms.filter((room) =>
    Array.isArray(room?.lamps) && room.lamps.some((lamp) => lamp?.code === code)
  ).length;
}

// ─── Per-room helpers ─────────────────────────────────────────────

/**
 * Total design wattage for a single room.
 * Sum of (lamp_watts × lamp_points) for all lamps assigned to the room.
 */
export function getRoomDesignWatts(room, lightingDB) {
  if (!room.lamps?.length) return 0;
  return room.lamps.reduce((sum, lamp) => {
    const w = getLampWatts(lamp.code, lightingDB);
    return sum + w * sanitizeNum(lamp.points);
  }, 0);
}

/**
 * Design LPD (W/m²) for a single room row (for inline display).
 */
export function getRoomDesignLPD(room, lightingDB) {
  const area = sanitizeNum(room.area);
  if (area === 0) return 0;
  return getRoomDesignWatts(room, lightingDB) / area;
}

// ─── Main computation ─────────────────────────────────────────────

/**
 * A room row is complete when the user has supplied every required field:
 * room name, typology, room type, a positive area, and at least one selected
 * lighting system. This same rule drives the row status icons and the
 * calculation gate, so the UI and the results can never disagree.
 */
export function isRoomComplete(room) {
  if (!room || typeof room !== 'object') return false;
  const hasSelectedLamp = Array.isArray(room.lamps) && room.lamps.some(
    (lamp) => lamp && typeof lamp.code === 'string' && lamp.code.trim() !== ''
  );
  return Boolean(
    sanitizeStr(room.roomName) &&
    sanitizeStr(room.typology) &&
    sanitizeStr(room.roomType) &&
    sanitizeNum(room.area) > 0 &&
    hasSelectedLamp
  );
}

/**
 * Compute all three output metrics from current app state.
 *
 * @param {Array} lightingDB  - Array of lamp objects { code, watts, … }
 * @param {Array} rooms       - Array of room objects { typology, roomType, area, lamps }
 * @returns {{ totalArea, lpdBaseline, lpdDesign, reductionPct, incompleteRoomCount, incompleteArea }}
 */
export function computeResults(lightingDB, rooms) {
  const roomsWithArea = rooms.filter((r) => sanitizeNum(r.area) > 0);
  const valid = roomsWithArea.filter((r) => isRoomComplete(r));
  const incomplete = roomsWithArea.filter((r) => !isRoomComplete(r));

  const totalArea = valid.reduce((s, r) => s + sanitizeNum(r.area), 0);
  const incompleteArea = incomplete.reduce((s, r) => s + sanitizeNum(r.area), 0);
  const incompleteRoomCount = incomplete.length;
  const emptyResult = {
    totalArea: 0,
    lpdBaseline: 0,
    lpdDesign: 0,
    reductionPct: 0,
    incompleteRoomCount,
    incompleteArea,
  };

  if (totalArea === 0) return emptyResult;

  // Baseline: area-weighted average of SNI standard LPDs
  const baselineWattArea = valid.reduce((s, r) => {
    const stdLPD = getSNILPD(r.typology, r.roomType);
    return s + stdLPD * sanitizeNum(r.area);
  }, 0);

  // Design: sum of all actual lamp watts across all complete rooms
  const totalDesignWatts = valid.reduce(
    (s, r) => s + getRoomDesignWatts(r, lightingDB),
    0
  );

  const lpdBaseline = baselineWattArea / totalArea;
  const lpdDesign = totalDesignWatts / totalArea;
  const reductionPct =
    lpdBaseline > 0 ? ((lpdBaseline - lpdDesign) / lpdBaseline) * 100 : 0;

  return { totalArea, lpdBaseline, lpdDesign, reductionPct, incompleteRoomCount, incompleteArea };
}
