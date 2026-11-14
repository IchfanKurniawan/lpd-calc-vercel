import test from 'node:test';
import assert from 'node:assert/strict';

import { persist, hydrate, clearStorage } from '../src/store/localStorage.js';

const STORAGE_KEY = 'lpd_calculator_state';

function installStorage(initial) {
  const map = new Map(Object.entries(initial ?? {}));
  globalThis.localStorage = {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
  return map;
}

const VALID_STATE = {
  projectName: 'Demo',
  lightingDB: [
    { code: 'L1', name: 'Panel', manufacturer: 'ACME', type: 'LED', watts: 10 },
  ],
  rooms: [
    {
      id: 'room-1',
      roomName: 'Reception',
      typology: 'Perkantoran',
      roomType: 'resepsionis_pk',
      area: 10,
      lamps: [{ id: 'slot-1', code: 'L1', points: 4 }],
    },
  ],
};

test('hydrate returns nothing when storage is empty', () => {
  installStorage();
  const { state, issue } = hydrate();
  assert.equal(state, null);
  assert.equal(issue, null);
});

test('persist then hydrate round-trips state', () => {
  const map = installStorage();
  persist(VALID_STATE);

  assert.ok(map.has(STORAGE_KEY));

  const { state, issue } = hydrate();
  assert.equal(issue, null);
  assert.equal(state.projectName, 'Demo');
  assert.equal(state.rooms[0].lamps[0].code, 'L1');
});

test('hydrate rejects an unsupported stored version and keeps the payload', () => {
  const map = installStorage({
    [STORAGE_KEY]: JSON.stringify({ version: 99, lightingDB: [], rooms: [] }),
  });

  const { state, issue } = hydrate();
  assert.equal(state, null);
  assert.match(issue, /unsupported version/i);
  assert.ok(map.has(STORAGE_KEY), 'invalid payload must not be deleted');
});

test('hydrate rejects unknown room types', () => {
  installStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 1,
      projectName: '',
      lightingDB: [{ code: 'L1', name: 'Panel', watts: 10 }],
      rooms: [
        {
          id: 'room-1',
          roomName: 'Bad',
          typology: 'Perkantoran',
          roomType: 'not_a_room',
          area: 10,
          lamps: [],
        },
      ],
    }),
  });

  const { state, issue } = hydrate();
  assert.equal(state, null);
  assert.match(issue, /unknown stored room type/i);
});

test('hydrate renormalises lamp codes, remaps references and restores IDs', () => {
  installStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 1,
      projectName: 'Old',
      lightingDB: [
        { code: 'A', name: 'Panel', watts: 10 },
        { code: 'B', name: 'Downlight', watts: 20 },
      ],
      rooms: [
        {
          id: 'room-1',
          roomName: 'Reception',
          typology: 'Perkantoran',
          roomType: 'resepsionis_pk',
          area: 10,
          lamps: [
            { id: 'slot-1', code: 'B', points: 2 },
            { code: 'A', points: 1 },
          ],
        },
      ],
    }),
  });

  const { state, issue } = hydrate();
  assert.equal(issue, null);
  assert.deepEqual(state.lightingDB.map((lamp) => lamp.code), ['L1', 'L2']);
  assert.deepEqual(state.rooms[0].lamps.map((lamp) => lamp.code), ['L2', 'L1']);
  assert.equal(state.rooms[0].lamps[0].id, 'slot-1');
  assert.ok(state.rooms[0].lamps[1].id, 'missing slot id must be regenerated');
});

test('hydrate regenerates duplicate room IDs', () => {
  installStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 1,
      projectName: '',
      lightingDB: [{ code: 'L1', name: 'Panel', watts: 10 }],
      rooms: [
        { id: 'same', roomName: 'One', typology: '', roomType: '', area: 1, lamps: [] },
        { id: 'same', roomName: 'Two', typology: '', roomType: '', area: 1, lamps: [] },
      ],
    }),
  });

  const { state, issue } = hydrate();
  assert.equal(issue, null);
  assert.notEqual(state.rooms[0].id, state.rooms[1].id);
});

test('clearStorage removes the stored payload', () => {
  const map = installStorage();
  persist(VALID_STATE);
  clearStorage();
  assert.equal(map.has(STORAGE_KEY), false);
});
