export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function toRecord(
  val: Map<string, boolean> | Record<string, boolean> | null | undefined
): Record<string, boolean> {
  if (!val) return {}
  if (val instanceof Map) return Object.fromEntries(val) as Record<string, boolean>
  return val
}

export function applyUniqueRoot(
  nextKeys: Record<string, boolean>,
  rootKeys: string[],
  expandedRootKey: string
): Record<string, boolean> {
  const result = { ...nextKeys }
  for (const root of rootKeys) {
    if (root !== expandedRootKey) result[root] = false
  }
  return result
}

export function areExpandedKeyRecordsEqual(
  a: Record<string, boolean>,
  b: Record<string, boolean>
): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every(key => a[key] === b[key])
}
