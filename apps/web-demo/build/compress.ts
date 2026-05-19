import type { PluginOption } from 'vite'
import compression from 'vite-plugin-compression'

/** 压缩文件类型过滤：仅压缩 js/mjs/json/css/html/svg，涵盖 JSON 配置与自定义 SVG 图标等静态资源 */
const COMPRESS_FILTER = /\.(js|mjs|json|css|html|svg)$/i

/**
 * 代码压缩配置
 * @param compress 压缩类型
 * @param deleteOriginFile 是否删除原文件，默认 false，保留源文件以避免 Nginx 无预压缩时 404
 */
export function configCompressPlugin(
  compress: 'gzip' | 'brotli' | 'both' | 'none',
  deleteOriginFile = false
): PluginOption | PluginOption[] {
  const plugins: PluginOption[] = []

  if (compress === 'none') {
    return []
  }

  const compressList = compress.split(',')

  // Gzip 压缩
  if (compressList.includes('gzip') || compress === 'both') {
    plugins.push(
      compression({
        ext: '.gz',
        algorithm: 'gzip',
        deleteOriginFile,
        filter: COMPRESS_FILTER,
        // 只压缩大于 1KB 的文件 (避免小文件压缩后反而变大)
        threshold: 1024,
        compressionOptions: {
          level: 9, // 最高压缩级别
        },
      })
    )
  }

  // Brotli 压缩
  if (compressList.includes('brotli') || compress === 'both') {
    plugins.push(
      compression({
        ext: '.br',
        algorithm: 'brotliCompress',
        deleteOriginFile,
        filter: COMPRESS_FILTER,
        threshold: 1024,
        compressionOptions: {
          // Brotli 压缩级别 (1-11)，6 是性能和压缩率的最佳平衡点
          // 11 虽然压缩率最高但构建极慢
          level: 6,
        },
      })
    )
  }

  return plugins
}
