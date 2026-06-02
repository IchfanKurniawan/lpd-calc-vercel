/**
 * ENGINE: exportSerializer.js
 * Serialize app state to JSON or CSV strings for download.
 * Pure JavaScript — no React dependency.
 */

import { stripFormula } from './calculator.js';

// ─── CSV helpers ──────────────────────────────────────────────────

function csvCell(v) {
  const s = stripFormula(String(v ?? ''));
  // Wrap in quotes if value contains comma, double-quote, or newline
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(cells) {
  return cells.map(csvCell).join(',');
}

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

// ─── CSV export ───────────────────────────────────────────────────

/**
 * Serialize full app state to a CSV string.
 * Two-section format:
 *   SECTION,LIGHTING_DATABASE
 *   code,name,manufacturer,type,watts
 *   L1,…
 *
 *   SECTION,ROOMS
 *   room_name,typology,room_type,area_m2,lamp_code_1,lamp_points_1,…
 *   …
 */
export function exportToCSV(state) {
  const maxLamps = Math.max(0, ...state.rooms.map((r) => r.lamps.length));
  const lampHeaders = [];
  for (let i = 1; i <= maxLamps; i++) {
    lampHeaders.push(`lamp_code_${i}`, `lamp_points_${i}`);
  }

  const lines = [
    // Section A
    'SECTION,LIGHTING_DATABASE',
    csvRow(['code', 'name', 'manufacturer', 'type', 'watts']),
    ...state.lightingDB.map((l) =>
      csvRow([l.code, l.name, l.manufacturer, l.type, l.watts])
    ),
    '',
    // Section B
    'SECTION,ROOMS',
    csvRow(['room_name', 'typology', 'room_type', 'area_m2', ...lampHeaders]),
    ...state.rooms.map((r) => {
      const lampCells = [];
      for (let i = 0; i < maxLamps; i++) {
        const lamp = r.lamps[i];
        lampCells.push(lamp ? lamp.code : '', lamp ? lamp.points : '');
      }
      return csvRow([r.roomName, r.typology, r.roomType, r.area, ...lampCells]);
    }),
  ];

  return lines.join('\n');
}
