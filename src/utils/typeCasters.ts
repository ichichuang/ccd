/**
 * Safe Generic Type Casters
 *
 * Encapsulates necessary type bridging to avoid inline `as unknown as` in business logic.
 * These functions are identity at runtime and only satisfy the TypeScript compiler via generics.
 */

/**
 * Bridge for a single value (e.g. column render function, emit signature).
 * Use when you need to narrow or widen a type at a boundary.
 */
export function castValue<T>(value: unknown): T {
  return value as T
}

/**
 * Bridge for a single DataTable column (covariant cast).
 * Use when column config comes from mixed sources or generic boundaries.
 */
export function castColumn<T = unknown>(col: unknown): T {
  return col as T
}

/**
 * Bridge for column arrays (e.g. DataTableColumn<object>[]).
 */
export function castColumns<T = unknown>(cols: unknown): T[] {
  return (Array.isArray(cols) ? cols : []) as T[]
}

/**
 * Bridge for generic records/objects (e.g. row as Record<string, unknown>).
 */
export function castRecord<T extends object>(obj: T): Record<string, unknown> {
  return obj as Record<string, unknown>
}

/**
 * Bridge for arrays when element type differs at boundary (e.g. T[] → U[]).
 */
export function castArray<T, U>(arr: T[]): U[] {
  return arr as unknown as U[]
}
