import { appLogger } from '@/adapters/logger.adapter'
import * as Crypto from './crypto'
import { ENCRYPTION_FAILED } from './crypto'
import * as LZ from './lzstring'

/**
 * 混淆密钥策略（三级降级）：
 * 1. 优先使用构建时注入的 VITE_PUBLIC_STORAGE_OBFUSCATION_KEY（客户端可见的 public 值）
 * 2. 若为空，使用基于部署环境的运行时指纹（origin + app name + version）
 * 3. 兜底硬编码值（仅保证不崩溃，混淆强度最低）
 *
 * ⚠️ 前端“加密”本质仍是客户端可见混淆，不是真正的 secret 管理。此设计仅防止 localStorage 裸奔。
 */

const STORAGE_KEY_VERSION = 'v2'

function resolveObfuscationKey(): string {
  const injected = import.meta.env.VITE_PUBLIC_STORAGE_OBFUSCATION_KEY?.trim()
  if (injected && injected !== '${VITE_PUBLIC_STORAGE_OBFUSCATION_KEY:-}') return injected

  if (typeof window !== 'undefined') {
    // Include app name as a per-application discriminator so that same-origin
    // apps do not share the same encryption key.
    // VITE_APP_TITLE is set at build time; document.title is the runtime fallback.
    const appName = import.meta.env.VITE_APP_TITLE || document?.title || 'ccd'
    return `obfs:${window.location.origin}:${appName}:${STORAGE_KEY_VERSION}`
  }

  // SSR / Node fallback — lowest security, prevents crash only
  if (!import.meta.env.PROD) {
    appLogger.warn(
      '[SafeStorage] Using hardcoded fallback key. Set VITE_PUBLIC_STORAGE_OBFUSCATION_KEY in your .env for client-visible storage obfuscation.'
    )
  }
  return 'app-template-fallback-key'
}

function normalizeSecret(secret?: string): string | undefined {
  const normalized = secret?.trim()
  return normalized ? normalized : undefined
}

// Warn once at module load when VITE_PUBLIC_STORAGE_OBFUSCATION_KEY is missing in production builds
if (import.meta.env.PROD && typeof window !== 'undefined') {
  const injected = import.meta.env.VITE_PUBLIC_STORAGE_OBFUSCATION_KEY?.trim()
  if (!injected || injected === '${VITE_PUBLIC_STORAGE_OBFUSCATION_KEY:-}') {
    appLogger.warn(
      '[SafeStorage] VITE_PUBLIC_STORAGE_OBFUSCATION_KEY is not set. Storage obfuscation uses a browser-derived key. ' +
        'Set VITE_PUBLIC_STORAGE_OBFUSCATION_KEY to a client-visible public value if you need stable obfuscation across deployments.'
    )
  }
}

const DEFAULT_SECRET: string = resolveObfuscationKey()

/**
 * Previous keys for key rotation support.
 * Set VITE_PUBLIC_STORAGE_OBFUSCATION_KEY_PREVIOUS (comma-separated) to decrypt data obfuscated with older client-visible keys.
 * New data is always encrypted with DEFAULT_SECRET.
 */
const PREVIOUS_SECRETS: string[] = (() => {
  const prev = import.meta.env.VITE_PUBLIC_STORAGE_OBFUSCATION_KEY_PREVIOUS?.trim()
  if (prev && prev !== '${VITE_PUBLIC_STORAGE_OBFUSCATION_KEY_PREVIOUS:-}') {
    return prev
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
  }
  return []
})()

/**
 * 核心序列化流程: Object -> JSON -> Compress(Base64) -> Encrypt(AES)
 *
 * @returns 密文字符串。空值输入返回 ''，加密失败也返回 ''（调用方无需区分，因为
 * unpack 对 '' 返回 null，等同于"无数据"语义）。
 */
export function packDataSync(value: unknown, secret?: string): string {
  const actualSecret = normalizeSecret(secret) ?? DEFAULT_SECRET
  try {
    const json = JSON.stringify(value)
    if (!json) return ''
    const compressed = LZ.compress(json)
    if (!compressed) return ''
    const encrypted = Crypto.encryptSync(compressed, actualSecret)
    return encrypted === ENCRYPTION_FAILED ? '' : encrypted
  } catch (e) {
    appLogger.warn('[SafeStorage] Pack failed:', e)
    return ''
  }
}

/**
 * 核心反序列化流程: Decrypt -> Decompress(Base64) -> JSON -> Object
 * Tries the provided secret first, then falls back to PREVIOUS_SECRETS for key rotation.
 *
 * 生产环境解密失败时会输出有限诊断信息（不含密文/密钥），便于排查持久化数据损坏问题。
 */
export function unpackDataSync<T>(value: string, secret?: string): T | null {
  if (!value) return null
  const primarySecret = normalizeSecret(secret) ?? DEFAULT_SECRET

  // Try primary key first
  const result = tryUnpackSync<T>(value, primarySecret)
  if (result !== undefined) return result

  // Try previous keys (key rotation fallback)
  for (const oldSecret of PREVIOUS_SECRETS) {
    const fallback = tryUnpackSync<T>(value, oldSecret)
    if (fallback !== undefined) return fallback
  }

  // All keys exhausted — log diagnostic in all environments
  appLogger.warn(
    `[SafeStorage] Failed to unpack data (length=${value.length}). ` +
      'Data may be corrupted or encrypted with an unknown key.'
  )
  return null
}

/**
 * @returns T on success, null if the decrypted value represents "empty",
 *          undefined if decryption/decompression failed (try next key).
 */
function tryUnpackSync<T>(value: string, secret: string): T | null | undefined {
  try {
    const decrypted = Crypto.decryptSync(value, secret)
    if (decrypted === null) return undefined // HMAC failed or decrypt error — try next key
    if (decrypted === '') return null // empty string was encrypted as empty — valid round-trip
    const decompressed = LZ.decompress(decrypted)
    if (decompressed === null) return undefined
    return JSON.parse(decompressed) as T
  } catch {
    return undefined
  }
}

/**
 * 异步版核心序列化流程
 */
export async function packData(value: unknown, secret?: string): Promise<string> {
  const actualSecret = normalizeSecret(secret) ?? DEFAULT_SECRET
  try {
    const json = JSON.stringify(value)
    if (!json) return ''
    const compressed = LZ.compress(json)
    if (!compressed) return ''
    const encrypted = await Crypto.encrypt(compressed, actualSecret)
    return encrypted === ENCRYPTION_FAILED ? '' : encrypted
  } catch (e) {
    appLogger.warn('[SafeStorage] Async Pack failed:', e)
    return ''
  }
}

export async function unpackData<T>(value: string, secret?: string): Promise<T | null> {
  if (!value) return null
  const primarySecret = normalizeSecret(secret) ?? DEFAULT_SECRET

  // Try primary key first
  const result = await tryUnpack<T>(value, primarySecret)
  if (result !== undefined) return result

  // Try previous keys (key rotation fallback)
  for (const oldSecret of PREVIOUS_SECRETS) {
    const fallback = await tryUnpack<T>(value, oldSecret)
    if (fallback !== undefined) return fallback
  }

  // All keys exhausted — log diagnostic in all environments
  appLogger.warn(
    `[SafeStorage] Failed to unpack data (length=${value.length}). ` +
      'Data may be corrupted or encrypted with an unknown key.'
  )
  return null
}

/**
 * @returns T on success, null if the decrypted value represents "empty",
 *          undefined if decryption/decompression failed (try next key).
 */
async function tryUnpack<T>(value: string, secret: string): Promise<T | null | undefined> {
  try {
    const decrypted = await Crypto.decrypt(value, secret)
    if (decrypted === null) return undefined
    if (decrypted === '') return null
    const decompressed = LZ.decompress(decrypted)
    if (decompressed === null) return undefined
    return JSON.parse(decompressed) as T
  } catch {
    return undefined
  }
}
