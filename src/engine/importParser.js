/**
 * ENGINE: importParser.js
 * Parse and validate JSON or CSV import files.
 * Pure JavaScript — no React dependency.
 */

import { validateImportSchema, validateLamp, validateRoom } from './validator.js';
import { sanitizeStr } from './calculator.js';

// ─── JSON import ──────────────────────────────────────────────────

/**
 * Parse a JSON string into validated app state.
 * Throws descriptive Error on any validation failure.
 * @returns {{ projectName, lightingDB, rooms }}
 */
export function parseJSONImport(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('File is not valid JSON');
  }

  // Prototype pollution guard
  if (Object.prototype.hasOwnProperty.call(parsed, '__proto__') ||
      Object.prototype.hasOwnProperty.call(parsed, 'constructor') ||
      Object.prototype.hasOwnProperty.call(parsed, 'prototype')) {
    throw new Error('Malformed JSON: prototype pollution detected');
  }

  validateImportSchema(parsed);

  const lightingDB = parsed.lightingDatabase.map((l, i) => {
    try {
      return { code: `L${i + 1}`, ...validateLamp(l) };
    } catch (e) {
      throw new Error(`Lamp row ${i + 1}: ${e.message}`);
    }
  });

  const rooms = parsed.rooms.map((r, i) => {
    try {
      return { id: crypto.randomUUID(), ...validateRoom(r) };
    } catch (e) {
      throw new Error(`Room row ${i + 1}: ${e.message}`);
    }
  });

  return {
    projectName: sanitizeStr(parsed.meta?.projectName ?? parsed.projectName ?? ''),
    lightingDB,
    rooms,
  };
}

// ─── CSV import ───────────────────────────────────────────────────

/**
 * Parse a two-section CSV string into validated app state.
 * Throws descriptive Error on any validation failure.
 * @returns {{ projectName, lightingDB, rooms }}
 */
export function parseCSVImport(csvString) {
  // Normalise line endings
  const lines = csvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let section = null;
  let lampHeaders = null;
  let roomHeaders = null;
  const rawLamps = [];
  const rawRooms = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue; // skip blanks & comments

    const cells = parseCSVLine(line);

    if (cells[0] === 'SECTION') {
      section = cells[1];
      lampHeaders = null;
      roomHeaders = null;
      continue;
    }

    if (section === 'LIGHTING_DATABASE') {
      if (!lampHeaders) { lampHeaders = cells; continue; }
      const obj = zipObj(lampHeaders, cells);
      rawLamps.push(obj);
    } else if (section === 'ROOMS') {
      if (!roomHeaders) { roomHeaders = cells; continue; }
      const obj = zipObj(roomHeaders, cells);

      // Rebuild lamps array from dynamic lamp_code_N / lamp_points_N columns
      const lamps = [];
      let n = 1;
      while (obj[`lamp_code_${n}`] !== undefined || obj[`lamp_points_${n}`] !== undefined) {
        const code   = String(obj[`lamp_code_${n}`]   ?? '').trim();
        const points = parseFloat(obj[`lamp_points_${n}`] ?? 0) || 0;
        if (code) lamps.push({ code, points });
        n++;
      }
      obj.lamps = lamps;
      rawRooms.push(obj);
    }
  }

  if (rawLamps.length === 0 && rawRooms.length === 0) {
    throw new Error('No data found. Make sure the file uses the correct CSV template format.');
  }

  const lightingDB = rawLamps.map((l, i) => {
    try {
      return { code: `L${i + 1}`, ...validateLamp(l) };
    } catch (e) {
      throw new Error(`Lamp row ${i + 1}: ${e.message}`);
    }
  });

  const rooms = rawRooms.map((r, i) => {
    try {
      return { id: crypto.randomUUID(), ...validateRoom(r) };
    } catch (e) {
      throw new Error(`Room row ${i + 1}: ${e.message}`);
    }
  });

  return { projectName: '', lightingDB, rooms };
}

// ─── Helpers ──────────────────────────────────────────────────────

/** Parse a single CSV line respecting quoted fields */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Zip header array and values array into an object */
function zipObj(headers, values) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
  return obj;
}
