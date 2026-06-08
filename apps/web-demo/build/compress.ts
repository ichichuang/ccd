import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'
import type { Plugin, PluginOption, ResolvedConfig } from 'vite'
import compression from 'vite-plugin-compression'

/** 压缩文件类型过滤：仅压缩 js/mjs/json/css/html/svg，涵盖 JSON 配置与自定义 SVG 图标等静态资源 */
const COMPRESS_FILTER = /\.(js|mjs|json|css|html|svg)$/i
const COMPRESS_THRESHOLD_BYTES = 1024

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return []

  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absPath = join(dir, entry.name)
    return entry.isDirectory() ? walkFiles(absPath) : [absPath]
  })
}

function resolveOutDir(config: ResolvedConfig): string {
  return isAbsolute(config.build.outDir)
    ? config.build.outDir
    : join(config.root, config.build.outDir)
}

function createDualCompressionPlugin(deleteOriginFile: boolean): Plugin {
  let config: ResolvedConfig
  let outputPath: string

  return {
    name: 'ccd:compression-both',
    apply: 'build',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig
      outputPath = resolveOutDir(resolvedConfig)
    },
    closeBundle() {
      const files = walkFiles(outputPath).filter(file => {
        if (!COMPRESS_FILTER.test(file)) return false
        return statSync(file).size >= COMPRESS_THRESHOLD_BYTES
      })

      for (const file of files) {
        const content = readFileSync(file)
        writeFileSync(file + '.gz', gzipSync(content, { level: 9 }))
        writeFileSync(
          file + '.br',
          brotliCompressSync(content, {
            params: {
              [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
              [constants.BROTLI_PARAM_QUALITY]: 6,
            },
          })
        )

        if (deleteOriginFile) {
          rmSync(file)
        }
      }

      config.logger.info(
        `ccd:compression-both generated gzip and brotli artifacts for ${files.length} files.`
      )
    },
  }
}

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

  if (compress === 'both') {
    return createDualCompressionPlugin(deleteOriginFile)
  }

  const compressList = compress.split(',')

  // Gzip 压缩
  if (compressList.includes('gzip')) {
    plugins.push(
      compression({
        ext: '.gz',
        algorithm: 'gzip',
        deleteOriginFile,
        filter: COMPRESS_FILTER,
        // 只压缩大于 1KB 的文件 (避免小文件压缩后反而变大)
        threshold: COMPRESS_THRESHOLD_BYTES,
        compressionOptions: {
          level: 9, // 最高压缩级别
        },
      })
    )
  }

  // Brotli 压缩
  if (compressList.includes('brotli')) {
    plugins.push(
      compression({
        ext: '.br',
        algorithm: 'brotliCompress',
        deleteOriginFile,
        filter: COMPRESS_FILTER,
        threshold: COMPRESS_THRESHOLD_BYTES,
        compressionOptions: {
          // Brotli 压缩级别 (1-11)，6 是性能和压缩率的最佳平衡点
          // 11 虽然压缩率最高但构建极慢
          params: {
            [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
            [constants.BROTLI_PARAM_QUALITY]: 6,
          },
        },
      })
    )
  }

  return plugins
}
