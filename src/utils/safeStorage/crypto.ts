import { AES, Utf8 } from 'crypto-es'

/**
 * 异步加密（OpenSSL 标准格式）
 * - crypto-es 会自动生成随机 Salt 和 IV，并将其编码到字符串中
 * - 相同明文 + 相同密钥，每次结果仍然不同（安全性更好）
 */
export async function encrypt(plain: string, secret: string): Promise<string> {
  if (!plain || !secret) return ''
  try {
    return AES.encrypt(plain, secret).toString()
  } catch (e) {
    console.error('[Crypto] Encrypt failed:', e)
    return ''
  }
}

/**
 * 异步解密（自动解析 OpenSSL 格式）
 */
export async function decrypt(encrypted: string, secret: string): Promise<string | null> {
  if (!encrypted || !secret) return null
  try {
    const bytes = AES.decrypt(encrypted, secret)
    const result = bytes.toString(Utf8)
    return result || null
  } catch {
    // 密钥错误或数据损坏时解密失败
    return null
  }
}

/**
 * 同步加密（用于 Pinia / LocalStorage）
 */
export function encryptSync(plain: string, secret: string): string {
  if (!plain || !secret) return ''
  try {
    return AES.encrypt(plain, secret).toString()
  } catch (e) {
    console.error('[Crypto] EncryptSync failed:', e)
    return ''
  }
}

/**
 * 同步解密
 */
export function decryptSync(encrypted: string, secret: string): string | null {
  if (!encrypted || !secret) return null
  try {
    const bytes = AES.decrypt(encrypted, secret)
    const result = bytes.toString(Utf8)
    return result || null
  } catch {
    return null
  }
}
