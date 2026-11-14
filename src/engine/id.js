/**
 * Shared ID factory.
 * Uses crypto.randomUUID when available (secure contexts, Node 19+) and
 * falls back to a random string so the app still works on plain HTTP.
 */
export function createId() {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}