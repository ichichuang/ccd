/**
 * 业务序列号展示（前端生成）。
 * @param prefix 含连字符的前缀，如 ORD-、A-
 * @param index 从 1 起始的序号（与 pad 位数对齐）
 */
export function formatSerialId(prefix: string, index: number, padLength: number): string {
  return `${prefix}${String(index).padStart(padLength, '0')}`
}
