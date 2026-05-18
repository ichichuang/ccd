import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'

/**
 * 使用 uuid 生成唯一 id
 */
export function generateUniqueId(): string {
  return uuidv4()
}

/**
 * 传入 key，根据固定命名空间生成稳定的 UUID
 * - key 为空：回退到 uuidv4
 * - uuidv5 失败：回退到 uuidv4
 */
export function generateIdFromKey(key: string | number | boolean | null | undefined): string {
  const stringKey = String(key || '')
  if (!stringKey) {
    return generateUniqueId()
  }

  try {
    const NAMESPACE = uuidv5.DNS
    return uuidv5(stringKey, NAMESPACE)
  } catch {
    return generateUniqueId()
  }
}
