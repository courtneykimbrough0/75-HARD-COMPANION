/**
 * Stable id for locally-created records. Prefers `crypto.randomUUID`, with a
 * fallback because it isn't reliably present in the jsdom test environment.
 */
export function newId(): string {
  const cryptoObj = globalThis.crypto
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
