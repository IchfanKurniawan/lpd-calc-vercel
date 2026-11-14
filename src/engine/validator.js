/**
 * ENGINE: validator.js
 * Schema validation for imported data and runtime inputs.
 * Pure JavaScript — no React dependency.
 */

import SNI_DATABASE, { TYPOLOGY_KEYS } from '../data/sniDatabase.js';
import { sanitizeNum, sanitizeStr } from './calculator.js';
import { createId } from './id.js';

const NUMERIC_LIMIT = 1e9;

/** Validate a single lighting DB entry from imported data */
export function validateLamp(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Invalid lamp entry');
  return {
    name:         sanitizeStr(obj.name         ?? ''),
    manufacturer: sanitizeStr(obj.manufacturer ?? ''),
    type:         sanitizeStr(obj.type         ?? ''),
    watts:        sanitizeNum(obj.watts,  0, NUMERIC_LIMIT),
  };
}

/** Validate a single room from imported data */
export function validateRoom(obj, { mapLampCode } = {}) {
  if (!obj || typeof obj !== 'object') throw new Error('Invalid room entry');
  const typology = sanitizeStr(obj.typology ?? '');
  const roomType = sanitizeStr(obj.roomType ?? obj.room_type ?? '');
  if (roomType && !typology) {
    throw new Error('Room type requires a typology');
  }

  // Whitelist check — typology must be one of the known keys (or empty for partial data)
  if (typology && !TYPOLOGY_KEYS.includes(typology)) {
    throw new Error(`Unknown typology: "${typology}"`);
  }

  // Whitelist check — roomType must exist within the typology (if both provided)
  if (typology && roomType) {
    const rooms = SNI_DATABASE[typology]?.rooms ?? [];
    if (!rooms.find((r) => r.id === roomType)) {
      throw new Error(`Room type "${roomType}" not found in typology "${typology}"`);
    }
  }

  const lamps = Array.isArray(obj.lamps) ? obj.lamps : [];

  return {
    roomName: sanitizeStr(obj.roomName ?? obj.room_name ?? ''),
    typology,
    roomType,
    area:     sanitizeNum(obj.area ?? obj.area_m2, 0, NUMERIC_LIMIT),
    lamps:    lamps.map((l) => validateRoomLamp(l, mapLampCode)),
  };
}

function validateRoomLamp(obj, mapLampCode) {
  if (!obj || typeof obj !== 'object') throw new Error('Invalid lamp slot');
  const code = sanitizeStr(obj.code ?? '');
  return {
    id: createId(),
    code: code && mapLampCode ? mapLampCode(code) : code,
    points: sanitizeNum(obj.points, 0, NUMERIC_LIMIT),
  };
}

/** Validate the top-level imported JSON schema */
export function validateImportSchema(obj) {
  if (typeof obj !== 'object' || obj === null)
    throw new Error('File does not contain a valid JSON object');
  if (obj.version !== undefined && obj.version !== 1)
    throw new Error('Unsupported file version');
  if (!Array.isArray(obj.lightingDatabase))
    throw new Error('Missing or invalid "lightingDatabase" array');
  if (!Array.isArray(obj.rooms))
    throw new Error('Missing or invalid "rooms" array');
}
