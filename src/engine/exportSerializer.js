/**
 * ENGINE: exportSerializer.js
 * Serialize app state to JSON string for download.
 * Pure JavaScript — no React dependency.
 */

// ─── JSON export ──────────────────────────────────────────────────

/**
 * Serialize full app state to a formatted JSON string.
 * @param {{ projectName, lightingDB, rooms }} state
 */
export function exportToJSON(state) {
  const payload = {
    version: 1,
    meta: {
      projectName: state.projectName || '',
      exportedAt:  new Date().toISOString(),
      standard:    'SNI 03-6197-2020',
      tool:        'Greenship NB 1.3 LPD Calculator',
    },
    lightingDatabase: state.lightingDB.map((l) => ({
      code:         l.code,
      name:         l.name,
      manufacturer: l.manufacturer,
      type:         l.type,
      watts:        l.watts,
    })),
    rooms: state.rooms.map((r) => ({
      roomName: r.roomName,
      typology: r.typology,
      roomType: r.roomType,
      area:     r.area,
      lamps:    r.lamps.map((l) => ({ code: l.code, points: l.points })),
    })),
  };
  return JSON.stringify(payload, null, 2);
}
