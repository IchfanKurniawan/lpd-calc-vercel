import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sanitizeNum,
  sanitizeStr,
  getSNILPD,
  getRoomDesignWatts,
  computeResults,
  isRoomComplete,
  countLampUsage,
} from '../src/engine/calculator.js';

const LAMPS = [
  { code: 'L1', name: 'LED panel', watts: 10 },
  { code: 'L2', name: 'Downlight', watts: 20 },
];

test('sanitizeStr trims but does not HTML-escape', () => {
  assert.equal(sanitizeStr('  R & D <lab>  '), 'R & D <lab>');
});

test('sanitizeNum clamps and rejects non-finite values', () => {
  assert.equal(sanitizeNum('12.5'), 12.5);
  assert.equal(sanitizeNum(-4), 0);
  assert.equal(sanitizeNum('nope'), 0);
  assert.equal(sanitizeNum(Infinity), 0);
});

test('getSNILPD returns the SNI value for a real room type', () => {
  assert.equal(getSNILPD('Perkantoran', 'resepsionis_pk'), 7.97);
  assert.equal(getSNILPD('Perkantoran', 'does_not_exist'), 0);
  assert.equal(getSNILPD('Unknown', 'resepsionis_pk'), 0);
});

test('getRoomDesignWatts sums watts × points', () => {
  const room = { lamps: [{ code: 'L1', points: 5 }, { code: 'L2', points: 2 }] };
  assert.equal(getRoomDesignWatts(room, LAMPS), 10 * 5 + 20 * 2);
});

test('isRoomComplete requires every documented field', () => {
  const base = {
    roomName: 'Reception',
    typology: 'Perkantoran',
    roomType: 'resepsionis_pk',
    area: 10,
    lamps: [{ code: 'L1', points: 4 }],
  };

  assert.equal(isRoomComplete(base), true);
  assert.equal(isRoomComplete({ ...base, roomName: '  ' }), false);
  assert.equal(isRoomComplete({ ...base, typology: '' }), false);
  assert.equal(isRoomComplete({ ...base, roomType: '' }), false);
  assert.equal(isRoomComplete({ ...base, area: 0 }), false);
  assert.equal(isRoomComplete({ ...base, lamps: [{ code: '', points: 4 }] }), false);
});

test('countLampUsage counts distinct room rows using a lamp code', () => {
  const rooms = [
    { lamps: [{ code: 'L1' }, { code: 'L1' }] },
    { lamps: [{ code: 'L2' }] },
    { lamps: [{ code: 'L1' }] },
    { lamps: [] },
  ];

  assert.equal(countLampUsage(rooms, 'L1'), 2);
  assert.equal(countLampUsage(rooms, 'L2'), 1);
  assert.equal(countLampUsage(rooms, 'L3'), 0);
  assert.equal(countLampUsage(rooms, ''), 0);
});

test('computeResults calculates baseline, design and reduction', () => {
  const rooms = [
    {
      roomName: 'Reception',
      typology: 'Perkantoran',
      roomType: 'resepsionis_pk',
      area: 10,
      lamps: [{ code: 'L1', points: 5 }],
    },
  ];

  const result = computeResults(LAMPS, rooms);
  assert.equal(result.totalArea, 10);
  assert.ok(Math.abs(result.lpdBaseline - 7.97) < 1e-9);
  assert.ok(Math.abs(result.lpdDesign - 5) < 1e-9);
  assert.ok(Math.abs(result.reductionPct - ((7.97 - 5) / 7.97) * 100) < 1e-9);
  assert.equal(result.incompleteRoomCount, 0);
  assert.equal(result.incompleteArea, 0);
});

test('computeResults excludes rooms with incomplete row data', () => {
  const rooms = [
    {
      roomName: 'Complete',
      typology: 'Perkantoran',
      roomType: 'resepsionis_pk',
      area: 10,
      lamps: [{ code: 'L1', points: 5 }],
    },
    {
      roomName: 'No room type',
      typology: 'Perkantoran',
      roomType: '',
      area: 20,
      lamps: [{ code: 'L1', points: 5 }],
    },
    {
      roomName: 'No lamps',
      typology: 'Perkantoran',
      roomType: 'rapat_pk',
      area: 30,
      lamps: [],
    },
    {
      roomName: '',
      typology: 'Perkantoran',
      roomType: 'rapat_pk',
      area: 5,
      lamps: [{ code: 'L1', points: 1 }],
    },
  ];

  const result = computeResults(LAMPS, rooms);
  assert.equal(result.totalArea, 10);
  assert.equal(result.incompleteRoomCount, 3);
  assert.equal(result.incompleteArea, 55);
  assert.ok(Math.abs(result.lpdDesign - 5) < 1e-9);
});

test('a selected lighting system is enough to mark the row complete', () => {
  const rooms = [
    {
      roomName: 'Zero points',
      typology: 'Perkantoran',
      roomType: 'rapat_pk',
      area: 10,
      lamps: [{ code: 'L1', points: 0 }],
    },
  ];

  const result = computeResults(LAMPS, rooms);
  assert.equal(result.totalArea, 10);
  assert.equal(result.lpdDesign, 0);
  assert.equal(result.incompleteRoomCount, 0);
});
