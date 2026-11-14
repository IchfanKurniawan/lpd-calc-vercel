/**
 * STORE: localStorage.js
 * Persist and hydrate app state from localStorage.
 * Hydration validates the stored schema, recreates missing IDs, and discards
 * state that cannot be reconciled with the embedded SNI database.
 */

import SNI_DATABASE, { TYPOLOGY_KEYS } from '../data/sniDatabase.js';
import { createId } from '../engine/id.js';

const STORAGE_KEY = 'lpd_calculator_state';
const CURRENT_VERSION = 1;
const NUMERIC_LIMIT = 1e9;

function toText(value, maxLen = 200) {
  return typeof value === 'string' ? value.slice(0, maxLen) : '';
}

function toNumber(value, max = NUMERIC_LIMIT) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

function toCode(value) {
  return typeof value === 'string' ? value.trim().slice(0, 20) : '';
}

/**
 * Save state to localStorage.
 * Silently fails if storage is unavailable (private browsing, quota exceeded).
 */
export function persist(state) {
  try {
    const payload = JSON.stringify({ version: CURRENT_VERSION, ...state });
    localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Storage unavailable — continue without persistence
  }
}

/**
 * Load and validate state from localStorage.
 *
 * @returns {{ state: object|null, issue: string|null }}
 *   `state` is null when nothing is stored or the stored payload is invalid.
 *   `issue` explains why invalid data was skipped; the caller should not
 *   overwrite the stored payload until the user takes an action.
 */
export function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: null, issue: null };

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { state: null, issue: 'Stored data is malformed.' };
    }
    if (parsed.version !== CURRENT_VERSION) {
      return { state: null, issue: 'Stored data uses an unsupported version.' };
    }
    if (!Array.isArray(parsed.lightingDB) || !Array.isArray(parsed.rooms)) {
      return { state: null, issue: 'Stored data is missing required collections.' };
    }

    // Normalise lamp codes to L1…Ln and remember the old → new mapping.
    const codeMap = new Map();
    const lightingDB = [];

    for (const rawLamp of parsed.lightingDB) {
      if (!rawLamp || typeof rawLamp !== 'object') throw new Error('Invalid lamp entry in stored data.');
      const sourceCode = toCode(rawLamp.code);
      if (!sourceCode) throw new Error('Stored lamp is missing its code.');
      if (codeMap.has(sourceCode)) throw new Error(`Duplicate stored lamp code "${sourceCode}".`);

      const code = `L${lightingDB.length + 1}`;
      codeMap.set(sourceCode, code);
      lightingDB.push({
        code,
        name: toText(rawLamp.name),
        manufacturer: toText(rawLamp.manufacturer),
        type: toText(rawLamp.type),
        watts: toNumber(rawLamp.watts),
      });
    }

    const roomIds = new Set();
    const rooms = [];

    for (const rawRoom of parsed.rooms) {
      if (!rawRoom || typeof rawRoom !== 'object') throw new Error('Invalid room entry in stored data.');

      let id = toText(rawRoom.id, 100) || createId();
      if (roomIds.has(id)) id = createId();
      roomIds.add(id);

      const typology = toText(rawRoom.typology, 100);
      const rawRoomType = toText(rawRoom.roomType, 100);

      if (typology && !TYPOLOGY_KEYS.includes(typology)) {
        throw new Error(`Unknown stored typology "${typology}".`);
      }
      if (rawRoomType && !typology) {
        throw new Error('Stored room has a room type but no typology.');
      }

      let roomType = '';
      if (rawRoomType) {
        const match = SNI_DATABASE[typology]?.rooms.find((r) => r.id === rawRoomType);
        if (!match) throw new Error(`Unknown stored room type "${rawRoomType}".`);
        roomType = match.id;
      }

      const rawLamps = Array.isArray(rawRoom.lamps) ? rawRoom.lamps : [];
      const slotIds = new Set();
      const lamps = rawLamps.map((rawLamp) => {
        if (!rawLamp || typeof rawLamp !== 'object') throw new Error('Invalid lamp slot in stored data.');

        let slotId = toText(rawLamp.id, 100) || createId();
        if (slotIds.has(slotId)) slotId = createId();
        slotIds.add(slotId);

        const sourceCode = toCode(rawLamp.code);
        let code = '';
        if (sourceCode) {
          if (!codeMap.has(sourceCode)) throw new Error(`Unknown stored lamp code "${sourceCode}".`);
          code = codeMap.get(sourceCode);
        }

        return { id: slotId, code, points: toNumber(rawLamp.points) };
      });

      rooms.push({
        id,
        roomName: toText(rawRoom.roomName),
        typology,
        roomType,
        area: toNumber(rawRoom.area),
        lamps,
      });
    }

    return {
      state: {
        projectName: toText(parsed.projectName),
        lightingDB,
        rooms,
      },
      issue: null,
    };
  } catch (error) {
    return {
      state: null,
      issue: error instanceof Error ? error.message : 'Stored data could not be read.',
    };
  }
}

/** Clear all stored state */
export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}