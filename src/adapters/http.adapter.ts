/**
 * Type Boundary: HTTP & Storage Adapter
 * Validates raw parsed JSON or HTTP data and guarantees a safe object return.
 */
export function parseSafeObject<T extends object>(raw: unknown, fallback: T): T {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fallback
  }
  return raw as T
}
