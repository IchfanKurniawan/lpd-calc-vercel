/**
 * ENGINE: importParser.js
 * Parse and validate JSON import files.
 * Pure JavaScript — no React dependency.
 */

import { validateImportSchema, validateLamp, validateRoom } from './validator.js';
import { sanitizeStr } from './calculator.js';
import { createId } from './id.js';

// ─── JSON import ──────────────────────────────────────────────────

/**
 * Parse a JSON string into validated app state.
 * Throws descriptive Error on any validation failure.
 * @returns {{ projectName, lightingDB, rooms }}
 */
export function parseJSONImport(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString.replace(/^\uFEFF/, ''));
  } catch {
    throw new Error('File is not valid JSON');
  }

  validateImportSchema(parsed);

  // Prototype pollution guard
  if (Object.prototype.hasOwnProperty.call(parsed, '__proto__') ||
      Object.prototype.hasOwnProperty.call(parsed, 'constructor') ||
      Object.prototype.hasOwnProperty.call(parsed, 'prototype')) {
    throw new Error('Malformed JSON: prototype pollution detected');
  }

  const { lightingDB, codeMap } = buildImportLightingDB(parsed.lightingDatabase);

  const rooms = parsed.rooms.map((r, i) => {
    try {
      return { id: createId(), ...validateRoom(r, { mapLampCode: (code) => mapImportedCode(code, codeMap) }) };
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

function buildImportLightingDB(rawLamps) {
  const codeMap = new Map();
  const lightingDB = rawLamps.map((lamp, index) => {
    try {
      const sourceCode = sanitizeStr(lamp.code ?? `L${index + 1}`, 20);
      if (!sourceCode || codeMap.has(sourceCode)) throw new Error(`Missing or duplicate lamp code "${sourceCode}"`);
      const code = `L${index + 1}`;
      codeMap.set(sourceCode, code);
      return { code, ...validateLamp(lamp) };
    } catch (error) {
      throw new Error(`Lamp row ${index + 1}: ${error.message}`);
    }
  });
  return { lightingDB, codeMap };
}

function mapImportedCode(code, codeMap) {
  if (!codeMap.has(code)) throw new Error(`Unknown lamp code "${code}"`);
  return codeMap.get(code);
}
