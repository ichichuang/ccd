// Pinia 持久化加密序列化器适配器
import crypto from '@/utils/safeStorage/crypto'
import lzstring from '@/utils/safeStorage/lzstring'

/**
 * Pinia Plugin Persistedstate 加密序列化器
 * 使用 safeStorage 的加密和压缩逻辑
 *
 * @param secret 加密密钥，默认使用 import.meta.env.VITE_APP_SECRET
 * @returns Pinia 持久化插件所需的序列化器对象
 */
export const createPiniaEncryptedSerializer = (secret?: string) => {
  const encryptionSecret = secret || import.meta.env.VITE_APP_SECRET

  return {
    /**
     * 序列化：将数据加密并压缩后存储
     * 流程：JSON.stringify → LZ-String 压缩 → AES 加密
     */
    serialize: (value: unknown): string => {
      try {
        // 1. JSON 序列化
        const json = JSON.stringify(value)
        if (!json || json === 'null' || json === 'undefined') {
          return ''
        }

        // 2. LZ-String 压缩为 Base64（避免 UTF-16/UTF-8 编码损耗）
        const compressed = lzstring.compressToBase64(json)
        if (!compressed) {
          console.warn('[PiniaSerializer] 压缩失败，使用原始 JSON')
          return json
        }

        // 3. AES 加密（同步版本，CBC 模式 + 随机 IV）
        const encrypted = crypto.encryptSync(compressed, encryptionSecret)
        if (!encrypted) {
          console.warn('[PiniaSerializer] 加密失败，使用压缩数据')
          return compressed
        }

        return encrypted
      } catch (error) {
        console.error('[PiniaSerializer] 序列化失败:', error)
        // 降级：返回原始 JSON（确保不会导致应用崩溃）
        try {
          return JSON.stringify(value)
        } catch {
          return ''
        }
      }
    },

    /**
     * 反序列化：解密并解压缩数据
     * 流程：AES 解密 → LZ-String 解压 → JSON.parse
     * 支持向后兼容：自动处理未加密的旧数据
     */
    deserialize: (value: string): any => {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return undefined
      }

      // 步骤1: 检查是否是 OpenSSL 格式（以 U2FsdGVkX1 开头）
      if (value.startsWith('U2FsdGVkX1')) {
        // OpenSSL 格式：直接解密
        let decrypted: string | null = null
        try {
          decrypted = crypto.decryptSync(value, encryptionSecret)
        } catch (error) {
          console.warn('[PiniaSerializer] 解密失败:', error)
          return undefined
        }

        if (decrypted && decrypted.length > 0) {
          // 解密成功，尝试解压
          const decompressed = lzstring.decompressFromBase64(decrypted)
          if (decompressed && decompressed.trim().length > 0) {
            try {
              const result = JSON.parse(decompressed)
              if (
                result !== undefined &&
                (typeof result === 'object' || Array.isArray(result) || result === null)
              ) {
                return result
              }
            } catch (error) {
              console.warn(
                '[PiniaSerializer] JSON 解析失败:',
                error,
                '解压后数据预览:',
                decompressed.substring(0, 100)
              )
            }
          } else {
            console.warn(
              '[PiniaSerializer] Base64 解压失败，解密后数据长度:',
              decrypted.length,
              '前50字符:',
              decrypted.substring(0, 50)
            )
          }
        } else {
          console.warn('[PiniaSerializer] 解密后数据为空')
        }

        return undefined
      }

      // 步骤2: 检查是否是加密格式（包含 : 分隔符，表示 IV:密文，旧格式）
      const isEncrypted = value.includes(':')

      if (isEncrypted) {
        // 尝试解密
        let decrypted: string | null = null
        try {
          decrypted = crypto.decryptSync(value, encryptionSecret)
        } catch (error) {
          console.warn('[PiniaSerializer] 解密失败:', error)
          return undefined
        }

        if (decrypted && decrypted.length > 0) {
          // 解密成功，尝试多种解压方式
          // 方式1: Base64 解压缩（新格式，compressToBase64）
          // 新数据：compressToBase64 -> encryptSync -> decryptSync(Latin1) -> decompressFromBase64
          let decompressed = lzstring.decompressFromBase64(decrypted)
          if (decompressed && decompressed.trim().length > 0) {
            try {
              const result = JSON.parse(decompressed)
              // 验证解析结果是否为有效对象或数组（包括 null，因为 null 也是有效值）
              if (
                result !== undefined &&
                (typeof result === 'object' || Array.isArray(result) || result === null)
              ) {
                return result
              }
            } catch (error) {
              // JSON 解析失败，继续尝试其他方式
              console.debug('[PiniaSerializer] Base64 解压后 JSON 解析失败:', error)
            }
          } else {
            // Base64 解压失败，检查解密后的数据格式
            console.warn(
              '[PiniaSerializer] Base64 解压失败。解密后数据长度:',
              decrypted.length,
              '前100字符:',
              decrypted.substring(0, 100),
              '是否为 Base64 格式:',
              /^[A-Za-z0-9+/=]+$/.test(decrypted.substring(0, 100))
            )
          }

          // 方式2: UTF16 解压缩（旧格式兼容，compress UTF16）
          // 旧数据：compress(UTF16) -> encryptSync -> decryptSync(UTF8) -> decompress(UTF16)
          // 注意：如果 decryptSync 返回的是 UTF8 解码的结果，应该直接用 decompress
          decompressed = lzstring.decompress(decrypted)
          if (decompressed && decompressed.trim().length > 0) {
            try {
              const result = JSON.parse(decompressed)
              // 验证解析结果是否为有效对象或数组（包括 null）
              if (
                result !== undefined &&
                (typeof result === 'object' || Array.isArray(result) || result === null)
              ) {
                return result
              }
            } catch {
              // JSON 解析失败，继续尝试其他方式
            }
          }

          // 方式3: 直接解析 JSON（未压缩的数据）
          try {
            // 检查是否是有效的 JSON 字符串（以 { 或 [ 开头）
            const trimmed = decrypted.trim()
            if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && trimmed.length > 0) {
              const result = JSON.parse(decrypted)
              // 验证解析结果是否为有效对象或数组（包括 null）
              if (
                result !== undefined &&
                (typeof result === 'object' || Array.isArray(result) || result === null)
              ) {
                return result
              }
            }
          } catch {
            // JSON 解析失败
          }

          // 所有方式都失败，说明数据格式不兼容
          // 这通常是因为旧数据使用了不同的压缩/加密方式，或者数据已损坏
          // 注意：返回 undefined 后，pinia-plugin-persistedstate 会使用 Store 的初始值
          // Store 会重新序列化并存储，从而自动用新格式重新存储数据
          console.warn(
            '[PiniaSerializer] 数据格式不兼容，将使用初始值。Store 会自动用新格式重新存储。解密后数据长度:',
            decrypted.length
          )
          return undefined
        } else {
          // 解密失败，返回 undefined
          return undefined
        }
      }

      // 步骤2: 尝试直接解压缩原始值（可能是压缩但未加密的数据）
      const decompressed = lzstring.decompressFromBase64(value)
      if (decompressed && decompressed.trim().length > 0) {
        try {
          const result = JSON.parse(decompressed)
          if (result !== null && (typeof result === 'object' || Array.isArray(result))) {
            return result
          }
        } catch {
          // 继续尝试
        }
      }

      // 步骤3: 尝试直接解析 JSON（可能是未压缩未加密的旧数据）
      try {
        const result = JSON.parse(value)
        if (result !== null && (typeof result === 'object' || Array.isArray(result))) {
          return result
        }
      } catch {
        // 解析失败
      }

      // 所有方式都失败，返回 undefined
      return undefined
    },
  }
}

// 默认导出使用环境变量的密钥
export default createPiniaEncryptedSerializer()
