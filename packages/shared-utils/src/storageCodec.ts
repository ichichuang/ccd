export type JsonStorageStringifyResult = { ok: true; value: string } | { ok: false; error: unknown }

export type JsonStorageParseResult<T> = { ok: true; value: T } | { ok: false; error: unknown }

export function stringifyJsonStorageValue(value: unknown): JsonStorageStringifyResult {
  try {
    const json = JSON.stringify(value)
    return typeof json === 'string'
      ? { ok: true, value: json }
      : { ok: false, error: new TypeError('Storage value is not JSON serializable') }
  } catch (error) {
    return { ok: false, error }
  }
}

export function parseJsonStorageValue<T = unknown>(value: string): JsonStorageParseResult<T> {
  try {
    return { ok: true, value: JSON.parse(value) as T }
  } catch (error) {
    return { ok: false, error }
  }
}
