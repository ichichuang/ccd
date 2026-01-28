import { packDataSync, unpackDataSync } from './core'

/**
 * Pinia Plugin Persistedstate 加密序列化器
 * 使用 safeStorage 的加密和压缩逻辑
 *
 * @param secret 加密密钥，不传则使用 core 中的默认密钥
 * @returns Pinia 持久化插件所需的序列化器对象
 */
export const createPiniaEncryptedSerializer = (secret?: string) => {
  return {
    /**
     * 序列化：将数据加密并压缩后存储
     * 流程：Object → JSON.stringify → LZ-String(Base64) 压缩 → AES 同步加密
     */
    serialize: (value: unknown): string => {
      return secret ? packDataSync(value, secret) : packDataSync(value)
    },

    /**
     * 反序列化：解密并解压缩数据
     * 流程：AES 解密 → LZ-String(Base64) 解压 → JSON.parse
     * 简单降级：若解包失败，尝试直接 JSON.parse
     */
    deserialize: (value: string): any => {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        if (import.meta.env.DEV) {
          console.warn('[PiniaSerializer] 反序列化收到空值或非法字符串，视为无数据:', value)
        }
        return undefined
      }

      // 1. 标准解密解压流程
      const result = secret ? unpackDataSync(value, secret) : unpackDataSync(value)
      if (result !== null) {
        return result
      }

      if (import.meta.env.DEV) {
        console.warn(
          '[PiniaSerializer] 解密/解压失败，尝试直接 JSON.parse。原始值预览:',
          value.slice(0, 120)
        )
      }

      // 2. 降级：尝试直接解析 JSON（开发阶段未加密或旧数据）
      try {
        return JSON.parse(value)
      } catch {
        // 3. 彻底失败：返回 undefined，Pinia 使用初始状态
        return undefined
      }
    },
  }
}

// 默认导出使用环境变量密钥的实例
export default createPiniaEncryptedSerializer()
