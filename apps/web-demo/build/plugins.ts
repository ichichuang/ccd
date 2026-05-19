import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'node:fs'
import path from 'node:path'
import UnoCSS from 'unocss/vite'
import progress from 'vite-plugin-progress'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import type { PluginOption, ViteDevServer } from 'vite'
import { getCustomIconClasses, invalidateIconCaches } from '../src/design-engine/safelist'
import type { ViteEnv } from './utils'

// ✅ 引入模块化的构建插件
import { configCompressPlugin } from './compress'
import { configHtmlPlugin } from './html'
import { viteBuildInfo } from './info'
import { viteBuildPerformancePlugin } from './performance'

export function getPluginsList(env: ViteEnv, command: 'build' | 'serve'): PluginOption[] {
  const { VITE_COMPRESSION, VITE_BUILD_ANALYZE } = env
  const isDev = command === 'serve'
  const isBuild = command === 'build'

  const plugins: (PluginOption | false)[] = [
    // ECharts tree-shaking 增强：覆盖 echarts package.json 中 sideEffects 声明，
    // 使 Rollup 能完全消除未使用的图表/组件安装模块
    isBuild &&
      ({
        name: 'echarts-treeshake-enhance',
        enforce: 'pre',
        resolveId: {
          order: 'pre',
          async handler(source, importer, options) {
            if (!importer || !source.includes('echarts')) return null
            const resolved = await this.resolve(source, importer, {
              ...options,
              skipSelf: true,
            })
            if (
              resolved &&
              !resolved.external &&
              /echarts[\\/]lib[\\/](chart|component)[\\/]/.test(resolved.id)
            ) {
              return { ...resolved, moduleSideEffects: false }
            }
            return null
          },
        },
      } as PluginOption),

    // ✅ 构建信息看板
    viteBuildInfo(),

    // ✅ 构建阶段进度条（终端输出，仅 build）
    isBuild &&
      progress({
        format: 'Building [:bar] :percent',
        width: 60,
      }),

    // ✅ HTML 注入品牌配置 + API 域名资源提示（VITE_API_BASE_URL）
    configHtmlPlugin(env),

    // 图标示例页列表：从 @iconify-json 与 src/assets/icons 动态生成
    generateIconListsPlugin(),

    // 图标变更监听（仅开发环境启用）
    isDev && createIconsWatcherPlugin(),

    // UnoCSS 原子化 CSS
    UnoCSS(),

    // Vue 核心插件
    vue({
      template: {
        compilerOptions: {
          hoistStatic: true,
          cacheHandlers: true,
        },
      },
    }),

    // JSX/TSX 语法支持
    vueJsx(),

    // 自动导入 API（仅 hooks + 分组 stores，减少噪音；api/constants 需显式 import）
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core', { '@/locales': [['t', '$t']] }],
      dirs: [
        'src/stores/modules/system',
        'src/stores/modules/session',
        'src/stores/modules/ui',
        'src/hooks/**/*',
      ],
      dirsScanOptions: {
        filePatterns: ['*.ts'],
        fileFilter: file => file.endsWith('.ts') && !file.endsWith('/index.ts'),
        types: true,
      },
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: 'readonly',
      },
    }),

    /**
     * ✅ 自动导入组件配置
     * 1. 仅包含 src/components 目录，确保通用组件自动导入
     * 2. 显式排除 src/layouts 目录，符合你对“布局组件需手动引入”的设计要求
     */
    Components({
      // 💡 仅扫描业务组件目录
      dirs: ['src/components'],
      extensions: ['vue', 'tsx'],
      deep: true,
      directoryAsNamespace: false,
      dts: 'src/types/components.d.ts',
      // 💡 排除布局目录，防止 Layout 管理组件被意外自动加载
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]src[\\/]layouts[\\/]/],
      transformer: 'vue3',
      version: 3,
      include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
      // PrimeVue 按需解析：模板中用到的组件自动 import，支持 Tree-shaking
      resolvers: [PrimeVueResolver()],
    }),
  ]

  // 构建阶段的压缩与体积分析
  if (isBuild && VITE_COMPRESSION !== 'none') {
    const compressPlugins = configCompressPlugin(VITE_COMPRESSION, false)
    if (Array.isArray(compressPlugins)) {
      plugins.push(...compressPlugins)
    } else {
      plugins.push(compressPlugins)
    }
  }

  if (isBuild && VITE_BUILD_ANALYZE) {
    plugins.push(viteBuildPerformancePlugin(true))
  }

  return plugins.filter(Boolean) as PluginOption[]
}

/**
 * 图标示例页列表生成插件
 *
 * 约定：
 * - 默认（UNO_DEMO=false）：仅生成精简子集，避免开发模式加载过多图标导致卡顿
 * - demo 模式（UNO_DEMO=true）：生成更完整的图标列表，供 icons 示例页“加载更多”使用
 */
function generateIconListsPlugin(): PluginOption {
  const cwd = process.cwd()
  const generatedPath = path.resolve(
    cwd,
    'src/views/example/components/icons/configs/iconLists.generated.ts'
  )

  /**
   * 从 @iconify-json/<collection>/icons.json 中提取前 N 个图标名
   *
   * 关键点：不能 JSON.parse（某些集合 icons.json 很大，会导致 dev:demo OOM）。
   * 这里用增量扫描 + 简单状态机，只在 "icons": { ... } 的顶层抓取 key：
   * depth === 1 时的 "name": 视为图标名，其余嵌套字段（body/width/height 等）忽略。
   */
  const readIconifyCollectionNames = (collection: string, limit: number): string[] => {
    try {
      const filePath = path.resolve(cwd, `node_modules/@iconify-json/${collection}/icons.json`)
      if (!fs.existsSync(filePath)) return []

      const fd = fs.openSync(filePath, 'r')
      try {
        const bufferSize = 256 * 1024
        const buffer = Buffer.allocUnsafe(bufferSize)
        const names: string[] = []
        let bytesRead = 0
        let position = 0
        let carry = ''
        let inIconsObject = false
        let depth = 0
        let i = 0

        while ((bytesRead = fs.readSync(fd, buffer, 0, bufferSize, position)) > 0) {
          position += bytesRead
          const chunk = carry + buffer.toString('utf-8', 0, bytesRead)
          // 只保留末尾一小段以覆盖边界截断
          carry = chunk.slice(-1024)

          const len = chunk.length
          i = 0

          while (i < len) {
            if (!inIconsObject) {
              // 查找 "icons":{
              const idx = chunk.indexOf('"icons"', i)
              if (idx === -1) break
              let j = idx + '"icons"'.length
              while (j < len && /\s|:/.test(chunk[j])) j++
              if (chunk[j] === '{') {
                inIconsObject = true
                depth = 1
                i = j + 1
                continue
              }
              i = j
              continue
            }

            const ch = chunk[i]

            if (ch === '{') {
              depth++
              i++
              continue
            }
            if (ch === '}') {
              depth--
              if (depth === 0) {
                // 结束 icons 对象
                return names
              }
              i++
              continue
            }

            // 仅在 depth === 1 时采集 key，避免抓到内部字段 body/width/height 等
            // 性能关键：禁止逐字符拼接字符串（会导致大量临时对象与 OOM）
            if (depth === 1 && ch === '"') {
              const j = chunk.indexOf('"', i + 1)
              if (j === -1) break
              const key = chunk.slice(i + 1, j)

              // 跳过紧随其后的空白，确保是 "key":（不要求后面立刻是 {，但会进入深层后被 depth 保护）
              let k = j + 1
              while (k < len && /\s/.test(chunk[k])) k++
              if (chunk[k] === ':') {
                // 简单过滤合法 icon 名（与 preset-icons 约定一致）
                if (/^[a-z0-9_-]+$/.test(key)) {
                  names.push(key)
                  if (names.length >= limit) return names
                }
                i = k + 1
              } else {
                i = j + 1
              }
              continue
            }

            i++
          }
        }

        return names
      } finally {
        fs.closeSync(fd)
      }
    } catch {
      return []
    }
  }

  const toUnoIconClasses = (collection: string, names: string[], limit?: number): string[] => {
    const sliced = typeof limit === 'number' ? names.slice(0, Math.max(0, limit)) : names
    return sliced.map(n => `i-${collection}-${n}`)
  }

  const unique = <T>(items: readonly T[]): T[] => Array.from(new Set(items))

  return {
    name: 'generate-icon-lists',
    config() {
      const isDemo = process.env.UNO_DEMO === 'true'

      // Lite 模式只取少量子集；Demo 模式尽可能完整（仍保留上限避免极端 OOM）
      const liteLimit = 32
      // ⚠️ 注意：demo 模式下图标类会被 UnoCSS 扫描并触发 preset-icons 生成 SVG/CSS。
      // 若每库数量过大（例如 800×4），dev 启动期容易出现内存爆炸（OOM）。
      // 因此按集合分级限制数量：Lucide 相对轻；Solar/Logos 更重。
      const demoLimits = {
        lucide: 260,
        solar: 80,
        ph: 160,
        logos: 120,
      } as const

      const lucideNames = unique(
        readIconifyCollectionNames('lucide', isDemo ? demoLimits.lucide : liteLimit)
      )
      const solarNames = unique(
        readIconifyCollectionNames('solar', isDemo ? demoLimits.solar : liteLimit)
      )
      const phNames = unique(readIconifyCollectionNames('ph', isDemo ? demoLimits.ph : liteLimit))
      const logosNames = unique(
        readIconifyCollectionNames('logos', isDemo ? demoLimits.logos : liteLimit)
      )

      const LUCIDE_ICONS = unique(toUnoIconClasses('lucide', lucideNames))
      const SOLAR_ICONS = unique(toUnoIconClasses('solar', solarNames))
      const PH_ICONS = unique(toUnoIconClasses('ph', phNames))
      const LOGOS_ICONS = unique(toUnoIconClasses('logos', logosNames))
      const CUSTOM_ICONS = unique(getCustomIconClasses())

      const content =
        `/** 由 build/plugins.ts generateIconListsPlugin 在构建时生成，请勿手改 */\n\n` +
        `export const LUCIDE_ICONS: string[] = ${JSON.stringify(LUCIDE_ICONS)}\n` +
        `export const SOLAR_ICONS: string[] = ${JSON.stringify(SOLAR_ICONS)}\n` +
        `export const PH_ICONS: string[] = ${JSON.stringify(PH_ICONS)}\n` +
        `export const LOGOS_ICONS: string[] = ${JSON.stringify(LOGOS_ICONS)}\n` +
        `export const CUSTOM_ICONS: string[] = ${JSON.stringify(CUSTOM_ICONS)}\n` +
        `export const IS_LITE_MODE: boolean = ${JSON.stringify(!isDemo)}\n`

      fs.mkdirSync(path.dirname(generatedPath), { recursive: true })
      fs.writeFileSync(generatedPath, content, 'utf-8')

      // 自定义图标缓存可能依赖文件系统状态，生成期刷新一次以保持一致
      invalidateIconCaches('custom')
    },
  }
}

/**
 * 图标监听插件
 */
function createIconsWatcherPlugin(): PluginOption {
  const cwd = process.cwd()
  const normalize = (value: string) => value.replace(/\\/g, '/')
  const routeDir = path.resolve(cwd, 'src/router/modules')
  // API 目录已扁平化：src/api/<module>/<feature>.ts（不再使用 src/api/modules）
  const apiDir = path.resolve(cwd, 'src/api')
  const directories = [routeDir, apiDir].map(normalize)
  let reloadTimer: NodeJS.Timeout | null = null

  const scheduleReload = (server: ViteDevServer) => {
    if (reloadTimer) clearTimeout(reloadTimer)
    reloadTimer = setTimeout(() => {
      invalidateIconCaches('all')
      server.ws.send({ type: 'full-reload' })
      reloadTimer = null
    }, 150)
  }

  return {
    name: 'icon-watcher',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add([
        `${normalize(routeDir)}/**/*.{ts,vue}`,
        `${normalize(apiDir)}/**/*.{ts,vue}`,
      ])
      const handle = (file: string) => {
        const normalizedFile = normalize(file)
        if (directories.some(dir => normalizedFile.startsWith(dir))) {
          scheduleReload(server)
        }
      }
      server.watcher.on('add', handle)
      server.watcher.on('change', handle)
      server.watcher.on('unlink', handle)
    },
  }
}
