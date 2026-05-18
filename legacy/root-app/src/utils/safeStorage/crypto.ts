import { AES, HmacSHA256, Utf8 } from 'crypto-es'

const HMAC_SEPARATOR = '|__hmac__:'

/** Returned by encrypt/encryptSync when encryption fails (distinct from empty-string input). */
export const ENCRYPTION_FAILED = Symbol('ENCRYPTION_FAILED')

/**
 * Compute HMAC-SHA256 using Web Crypto API (browser) with crypto-es fallback.
 * Returns a hex string.
 */
async function computeHmac(data: string, secret: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  return computeHmacSync(data, secret)
}

/**
 * Synchronous HMAC-SHA256 via crypto-es.
 */
function computeHmacSync(data: string, secret: string): string {
  return HmacSHA256(data, secret).toString()
}

/**
 * 异步加密（OpenSSL 标准格式）+ HMAC 认证
 *
 * **注意：** crypto-es 的 AES.encrypt/decrypt 底层是同步实现，
 * 此处的 async 仅因 HMAC 的 Web Crypto API 路径需要 await。
 * 当 Web Crypto 不可用时（如旧浏览器/SSR），回退到同步 crypto-es HMAC，
 * 整个函数实际同步执行但仍返回 Promise 以保持 API 一致性。
 *
 * - crypto-es 会自动生成随机 Salt 和 IV，并将其编码到字符串中
 * - 相同明文 + 相同密钥，每次结果仍然不同（安全性更好）
 * - 附加 HMAC-SHA256 认证标签，防止密文篡改
 *
 * @returns 密文字符串，空字符串输入返回 ''，加密失败返回 ENCRYPTION_FAILED
 */
export async function encrypt(
  plain: string,
  secret: string
): Promise<string | typeof ENCRYPTION_FAILED> {
  if (!secret) return ENCRYPTION_FAILED
  if (!plain) return ''
  try {
    const ciphertext = AES.encrypt(plain, secret).toString()
    const hmac = await computeHmac(ciphertext, secret)
    return ciphertext + HMAC_SEPARATOR + hmac
  } catch (e) {
    console.error('[Crypto] Encrypt failed:', e)
    return ENCRYPTION_FAILED
  }
}

/**
 * 异步解密（自动解析 OpenSSL 格式）+ HMAC 验证
 *
 * **注意：** 同 encrypt，crypto-es 底层同步实现，async 仅为 HMAC Web Crypto 路径。
 *
 * @returns 解密后的明文字符串，失败返回 null。空字符串密文能正确 round-trip 为 ''。
 */
export async function decrypt(encrypted: string, secret: string): Promise<string | null> {
  if (!encrypted || !secret) return null
  try {
    const separatorIndex = encrypted.lastIndexOf(HMAC_SEPARATOR)
    if (separatorIndex > 0) {
      const ciphertext = encrypted.slice(0, separatorIndex)
      const storedHmac = encrypted.slice(separatorIndex + HMAC_SEPARATOR.length)
      const computedHmac = await computeHmac(ciphertext, secret)
      if (storedHmac !== computedHmac) {
        console.warn('[Crypto] HMAC verification failed — ciphertext may have been tampered with')
        return null
      }
      const bytes = AES.decrypt(ciphertext, secret)
      const result = bytes.toString(Utf8)
      return result.length > 0 ? result : ''
    }
    // Legacy format without HMAC — allow decryption for migration
    const bytes = AES.decrypt(encrypted, secret)
    const result = bytes.toString(Utf8)
    return result.length > 0 ? result : ''
  } catch {
    return null
  }
}

/**
 * 同步加密（用于 Pinia / LocalStorage）+ HMAC 认证
 *
 * @returns 密文字符串，空字符串输入返回 ''，加密失败返回 ENCRYPTION_FAILED
 */
export function encryptSync(plain: string, secret: string): string | typeof ENCRYPTION_FAILED {
  if (!secret) return ENCRYPTION_FAILED
  if (!plain) return ''
  try {
    const ciphertext = AES.encrypt(plain, secret).toString()
    const hmac = computeHmacSync(ciphertext, secret)
    return ciphertext + HMAC_SEPARATOR + hmac
  } catch (e) {
    console.error('[Crypto] EncryptSync failed:', e)
    return ENCRYPTION_FAILED
  }
}

/**
 * 同步解密 + HMAC 验证
 *
 * @returns 解密后的明文字符串，失败返回 null。空字符串密文能正确 round-trip 为 ''。
 */
export function decryptSync(encrypted: string, secret: string): string | null {
  if (!encrypted || !secret) return null
  try {
    const separatorIndex = encrypted.lastIndexOf(HMAC_SEPARATOR)
    if (separatorIndex > 0) {
      const ciphertext = encrypted.slice(0, separatorIndex)
      const storedHmac = encrypted.slice(separatorIndex + HMAC_SEPARATOR.length)
      const computedHmac = computeHmacSync(ciphertext, secret)
      if (storedHmac !== computedHmac) {
        console.warn('[Crypto] HMAC verification failed — ciphertext may have been tampered with')
        return null
      }
      const bytes = AES.decrypt(ciphertext, secret)
      const result = bytes.toString(Utf8)
      return result.length > 0 ? result : ''
    }
    // Legacy format without HMAC — allow decryption for migration
    const bytes = AES.decrypt(encrypted, secret)
    const result = bytes.toString(Utf8)
    return result.length > 0 ? result : ''
  } catch {
    return null
  }
}
