import test from 'node:test';
import assert from 'node:assert/strict';

import { parseJSONImport } from '../src/engine/importParser.js';

const VALID_FILE = {
  version: 1,
  meta: { projectName: 'Test & <Project>' },
  lightingDatabase: [
    { code: 'X1', name: 'Panel', manufacturer: 'ACME', type: 'LED', watts: 10 },
    { code: 'X2', name: 'Downlight', manufacturer: 'ACME', type: 'LED', watts: 20 },
  ],
  rooms: [
    {
      roomName: 'Reception',
      typology: 'Perkantoran',
      roomType: 'resepsionis_pk',
      area: 10,
      lamps: [
        { code: 'X1', points: 5 },
        { code: 'X2', points: 2 },
      ],
    },
  ],
};

test('parseJSONImport normalises lamp codes and maps room references', () => {
  const imported = parseJSONImport(JSON.stringify(VALID_FILE));

  assert.deepEqual(imported.lightingDB.map((lamp) => lamp.code), ['L1', 'L2']);
  assert.deepEqual(imported.rooms[0].lamps.map((lamp) => lamp.code), ['L1', 'L2']);
});

test('parseJSONImport gives every room and lamp slot a unique id', () => {
  const imported = parseJSONImport(JSON.stringify(VALID_FILE));
  const room = imported.rooms[0];

  assert.equal(typeof room.id, 'string');
  assert.ok(room.id.length > 0);
  for (const lamp of room.lamps) {
    assert.equal(typeof lamp.id, 'string');
    assert.ok(lamp.id.length > 0);
  }
  assert.equal(new Set(room.lamps.map((lamp) => lamp.id)).size, room.lamps.length);
});

test('parseJSONImport does not double-escape HTML characters', () => {
  const imported = parseJSONImport(JSON.stringify(VALID_FILE));
  assert.equal(imported.projectName, 'Test & <Project>');
});

test('parseJSONImport tolerates a UTF-8 BOM', () => {
  const imported = parseJSONImport(`\uFEFF${JSON.stringify(VALID_FILE)}`);
  assert.equal(imported.lightingDB.length, 2);
});

test('parseJSONImport rejects malformed JSON', () => {
  assert.throws(() => parseJSONImport('{not json'), /not valid JSON/i);
});

test('parseJSONImport rejects an unsupported version', () => {
  const file = { ...VALID_FILE, version: 2 };
  assert.throws(() => parseJSONImport(JSON.stringify(file)), /Unsupported file version/);
});

test('parseJSONImport rejects an unknown typology', () => {
  const file = structuredClone(VALID_FILE);
  file.rooms[0].typology = 'Not_A_Typology';
  assert.throws(() => parseJSONImport(JSON.stringify(file)), /Unknown typology/);
});

test('parseJSONImport rejects a lamp code that is not in the database', () => {
  const file = structuredClone(VALID_FILE);
  file.rooms[0].lamps[0].code = 'MISSING';
  assert.throws(() => parseJSONImport(JSON.stringify(file)), /Unknown lamp code/);
});

test('parseJSONImport rejects duplicate lamp codes', () => {
  const file = structuredClone(VALID_FILE);
  file.lightingDatabase[1].code = 'X1';
  assert.throws(() => parseJSONImport(JSON.stringify(file)), /duplicate lamp code/);
});
