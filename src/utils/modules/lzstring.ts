// src/utils/modules/lzstring.ts
import LZString from 'lz-string'

/**
 * 高性能前端字符串压缩工具（基于 lz-string）
 * - 2025 年体积最小（4.8kB）、最活跃、TS 原生支持的压缩库
 * - 专为 localStorage / IndexedDB / URL 传参设计，压缩比极高
 * - 所有方法均为同步、零依赖、SSR 安全
 */
const lzstring = {
  /**
   * 压缩字符串 → 推荐用于 localStorage 存储（压缩比最高）
   * @param str 要压缩的字符串
   * @returns 压缩后的字符串（UTF-16 编码）
   */
  compress(str: string): string {
    if (typeof str !== 'string' || str === '') {
      return ''
    }
    return LZString.compressToUTF16(str)
  },

  /**
   * 解压通过 compress() 压缩的字符串
   * @param compressed 压缩后的字符串
   * @returns 原始字符串，失败返回 null
   */
  decompress(compressed: string): string | null {
    if (typeof compressed !== 'string' || compressed === '') {
      return null
    }
    try {
      return LZString.decompressFromUTF16(compressed) ?? null
    } catch {
      return null
    }
  },

  /**
   * 压缩为 Base64 字符串 → 适合 URL 传参或嵌入 HTML
   * @param str 要压缩的字符串
   * @returns Base64 格式的压缩字符串
   */
  compressToBase64(str: string): string {
    if (typeof str !== 'string' || str === '') {
      return ''
    }
    return LZString.compressToBase64(str)
  },

  /**
   * 从 Base64 压缩字符串解压
   * @param base64 压缩后的 Base64 字符串
   * @returns 原始字符串，失败返回 null
   */
  decompressFromBase64(base64: string): string | null {
    if (typeof base64 !== 'string' || base64 === '') {
      return null
    }
    try {
      return LZString.decompressFromBase64(base64) ?? null
    } catch {
      return null
    }
  },
}

// 默认导出实例（与 mitt.ts 风格完全一致）
export default lzstring

// 提供组合式 API（setup 中直接解构使用）
export const useLzString = () => ({
  compress: lzstring.compress,
  decompress: lzstring.decompress,
  compressToBase64: lzstring.compressToBase64,
  decompressFromBase64: lzstring.decompressFromBase64,
})
