/**
 * STORE: localStorage.js
 * Persist and hydrate app state from localStorage.
 * Validates on hydration so tampered/stale data is safely discarded.
 */

const STORAGE_KEY = 'lpd_calculator_state';
const CURRENT_VERSION = 1;

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
 * Returns null if nothing is stored or data fails validation.
 */
export function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Basic structure guard
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (parsed.version !== CURRENT_VERSION) return null;
    if (!Array.isArray(parsed.lightingDB)) return null;
    if (!Array.isArray(parsed.rooms)) return null;

    // Sanitise lightingDB
    const lightingDB = parsed.lightingDB
      .filter((l) => l && typeof l === 'object' && typeof l.code === 'string')
      .map((l) => ({
        code:         String(l.code         ?? '').slice(0, 20),
        name:         String(l.name         ?? '').slice(0, 200),
        manufacturer: String(l.manufacturer ?? '').slice(0, 200),
        type:         String(l.type         ?? '').slice(0, 200),
        watts:        Math.max(0, parseFloat(l.watts) || 0),
      }));

    // Sanitise rooms
    const rooms = parsed.rooms
      .filter((r) => r && typeof r === 'object')
      .map((r) => ({
        id:       String(r.id       ?? crypto.randomUUID()),
        roomName: String(r.roomName ?? '').slice(0, 200),
        typology: String(r.typology ?? '').slice(0, 100),
        roomType: String(r.roomType ?? '').slice(0, 100),
        area:     Math.max(0, parseFloat(r.area) || 0),
        lamps: Array.isArray(r.lamps)
          ? r.lamps
              .filter((l) => l && typeof l === 'object')
              .map((l) => ({
                id:     String(l.id     ?? crypto.randomUUID()),
                code:   String(l.code   ?? '').slice(0, 20),
                points: Math.max(0, parseFloat(l.points) || 0),
              }))
          : [],
      }));

    return {
      projectName: String(parsed.projectName ?? '').slice(0, 200),
      language:    ['id', 'en'].includes(parsed.language) ? parsed.language : 'id',
      lightingDB,
      rooms,
    };
  } catch {
    return null;
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
