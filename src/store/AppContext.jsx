/**
 * STORE: AppContext.jsx
 * Single global state via useReducer + Context.
 * All mutations go through dispatch — no direct state writes.
 */

import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { persist, hydrate } from './localStorage.js';
import { computeResults } from '../engine/calculator.js';
import { createId } from '../engine/id.js';

// ─── Initial state ────────────────────────────────────────────────

const INITIAL_STATE = {
  projectName: '',
  lightingDB: [],
  rooms: [],
};

// ─── Helpers ──────────────────────────────────────────────────────

function nextLampCode(lightingDB) {
  let max = 0;
  for (const lamp of lightingDB) {
    const match = /^L(\d+)$/.exec(lamp.code);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `L${Math.max(max, lightingDB.length) + 1}`;
}

// ─── Reducer ─────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    // ── Meta ──
    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.payload };

    case 'RESET':
      return { ...INITIAL_STATE, projectName: '' };

    case 'IMPORT':
      // Replace entire state from import
      return {
        ...state,
        projectName: action.payload.projectName || state.projectName,
        lightingDB:  action.payload.lightingDB,
        rooms:       action.payload.rooms,
      };

    // ── Lighting DB (Section A) ──
    case 'ADD_LAMP':
      return {
        ...state,
        lightingDB: [
          ...state.lightingDB,
          {
            code:         nextLampCode(state.lightingDB),
            name:         '',
            manufacturer: '',
            type:         '',
            watts:        0,
          },
        ],
      };

    case 'UPDATE_LAMP': {
      const { index, field, value } = action.payload;
      const updated = state.lightingDB.map((l, i) =>
        i === index ? { ...l, [field]: value } : l
      );
      return { ...state, lightingDB: updated };
    }

    case 'DELETE_LAMP': {
      const filtered = state.lightingDB.filter((_, i) => i !== action.payload);
      const codeMap = new Map(filtered.map((lamp, index) => [lamp.code, `L${index + 1}`]));
      const recoded = filtered.map((lamp, index) => ({ ...lamp, code: `L${index + 1}` }));

      // Preserve assignments to surviving lamps while their display codes change.
      const rooms = state.rooms.map((r) => ({
        ...r,
        lamps: r.lamps.flatMap((lamp) => {
          const code = codeMap.get(lamp.code);
          return code ? [{ ...lamp, code }] : [];
        }),
      }));

      return { ...state, lightingDB: recoded, rooms };
    }

    case 'DUPLICATE_LAMP': {
      const index = action.payload;
      const source = state.lightingDB[index];
      if (!source) return state;
      const copy = { ...source, code: nextLampCode(state.lightingDB) };
      const lightingDB = [...state.lightingDB];
      lightingDB.splice(index + 1, 0, copy);
      // Recode all to maintain sequential codes
      const recoded = lightingDB.map((lamp, i) => ({ ...lamp, code: `L${i + 1}` }));

      // Build a map from old codes to new codes for preserving room assignments
      const oldCodes = state.lightingDB.map((lamp, i) => lamp.code);
      const newCodes = recoded.map((lamp, i) => lamp.code);
      const codeMap = new Map();
      // For lamps before the insertion point, codes stay the same
      for (let i = 0; i <= index; i++) {
        codeMap.set(oldCodes[i], newCodes[i]);
      }
      // For lamps after the insertion point, their codes shift
      for (let i = index + 1; i < oldCodes.length; i++) {
        codeMap.set(oldCodes[i], newCodes[i + 1]);
      }

      // Preserve assignments to surviving lamps while their display codes change
      const rooms = state.rooms.map((r) => ({
        ...r,
        lamps: r.lamps.map((lamp) => {
          const newCode = codeMap.get(lamp.code);
          return newCode ? { ...lamp, code: newCode } : lamp;
        }),
      }));

      return { ...state, lightingDB: recoded, rooms };
    }

    // ── Rooms (Section B) ──
    case 'ADD_ROOM':
      return {
        ...state,
        rooms: [
          ...state.rooms,
          {
            id:       createId(),
            roomName: '',
            typology: '',
            roomType: '',
            area:     0,
            lamps:    [],
          },
        ],
      };

    case 'UPDATE_ROOM': {
      const { id, field, value } = action.payload;
      return {
        ...state,
        rooms: state.rooms.map((r) => {
          if (r.id !== id) return r;
          // When typology changes, clear the roomType
          if (field === 'typology') {
            return { ...r, typology: value, roomType: '' };
          }
          return { ...r, [field]: value };
        }),
      };
    }

    case 'DELETE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter((r) => r.id !== action.payload),
      };

    case 'DUPLICATE_ROOM': {
      const src = state.rooms.find((r) => r.id === action.payload);
      if (!src) return state;
      const idx = state.rooms.indexOf(src);
      const copy = {
        ...src,
        id: createId(),
        roomName: src.roomName + ' (copy)',
        lamps: src.lamps.map((lamp) => ({ ...lamp, id: createId() })),
      };
      const rooms = [...state.rooms];
      rooms.splice(idx + 1, 0, copy);
      return { ...state, rooms };
    }

    // ── Room Lamps ──
    case 'ADD_ROOM_LAMP': {
      const roomId = action.payload;
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id !== roomId
            ? r
            : {
                ...r,
                lamps: [
                  ...r.lamps,
                  { id: createId(), code: '', points: 0 },
                ],
              }
        ),
      };
    }

    case 'UPDATE_ROOM_LAMP': {
      const { roomId, lampId, field, value } = action.payload;
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id !== roomId
            ? r
            : {
                ...r,
                lamps: r.lamps.map((l) =>
                  l.id !== lampId ? l : { ...l, [field]: value }
                ),
              }
        ),
      };
    }

    case 'DELETE_ROOM_LAMP': {
      const { roomId, lampId } = action.payload;
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id !== roomId
            ? r
            : { ...r, lamps: r.lamps.filter((l) => l.id !== lampId) }
        ),
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const hydration = useRef(null);
  if (hydration.current === null) hydration.current = hydrate();

  const [state, dispatch] = useReducer(reducer, hydration.current.state ?? INITIAL_STATE);
  const skipPersist = useRef(Boolean(hydration.current.issue));

  // Derived calculation — recomputed whenever state changes
  const computed = computeResults(state.lightingDB, state.rooms);

  // Persist on every state change. The first run is skipped when stored data
  // was rejected so a refresh does not destroy recoverable user data.
  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    persist(state);
  }, [state]);

  const value = {
    state,
    dispatch,
    computed,
    storageIssue: hydration.current.issue,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
