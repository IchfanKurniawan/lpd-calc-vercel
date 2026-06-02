/**
 * STORE: AppContext.jsx
 * Single global state via useReducer + Context.
 * All mutations go through dispatch — no direct state writes.
 */

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { persist, hydrate, clearStorage } from './localStorage.js';
import { computeResults } from '../engine/calculator.js';

// ─── Initial state ────────────────────────────────────────────────

const INITIAL_STATE = {
  projectName: '',
  language: 'id',
  lightingDB: [],
  rooms: [],
};

// ─── Helpers ──────────────────────────────────────────────────────

function nextLampCode(lightingDB) {
  return `L${lightingDB.length + 1}`;
}

function recodeLamps(lamps) {
  return lamps.map((l, i) => ({ ...l, code: `L${i + 1}` }));
}

// ─── Reducer ─────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    // ── Meta ──
    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.payload };

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'RESET':
      clearStorage();
      return { ...INITIAL_STATE };

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
      const recoded  = recodeLamps(filtered);

      // Remove any lamp references in rooms that no longer exist
      const validCodes = new Set(recoded.map((l) => l.code));
      const rooms = state.rooms.map((r) => ({
        ...r,
        lamps: r.lamps.filter((l) => validCodes.has(l.code)),
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
            id:       crypto.randomUUID(),
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
      const copy = { ...src, id: crypto.randomUUID(), roomName: src.roomName + ' (copy)' };
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
                  { id: crypto.randomUUID(), code: '', points: 0 },
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
  const saved  = hydrate();
  const [state, dispatch] = useReducer(reducer, saved ?? INITIAL_STATE);

  // Derived calculation — computed on every render, memoised by the consumer
  const computed = computeResults(state.lightingDB, state.rooms);

  // Persist on every state change
  useEffect(() => {
    persist(state);
  }, [state]);

  const value = { state, dispatch, computed };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
