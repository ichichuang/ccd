import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import type { PluginOption, ViteDevServer } from 'vite'
import { invalidateIconCaches } from '@ccd/unocss-preset'
import type { ViteEnv } from './utils'
import { createPrimeVueComponentResolver } from './resolvers/primevue'

// ✅ 引入模块化的构建插件
import { configCompressPlugin } from './compress'
import { configHtmlPlugin } from './html'
import { viteBuildInfo } from './info'
import { viteBuildPerformancePlugin } from './performance'

export const BUILD_PLUGIN_COMPATIBILITY_NOTES = [
  {
    id: 'echarts-treeshake-enhance',
    keep: true,
    owner: 'web-demo build',
    value:
      'Marks unused ECharts chart/component modules as side-effect free during production builds.',
    vite8Risk:
      'Revalidate resolveId moduleSideEffects behavior under Rolldown before any Vite major lane.',
  },
  {
    id: 'viteBuildInfo',
    keep: true,
    owner: 'web-demo build',
    value: 'Injects deterministic build metadata used by the generated index shell.',
    vite8Risk: 'Low; HTML/build metadata hook should be rechecked with Vite plugin API changes.',
  },
  {
    id: 'vite-plugin-progress',
    keep: false,
    owner: 'removed from active plugin list',
    value: 'Terminal cosmetics only; no bundle, runtime, or CI artifact value.',
    vite8Risk: 'Avoid carrying cosmetic plugin compatibility into the future Vite 8 lane.',
  },
  {
    id: 'configHtmlPlugin',
    keep: true,
    owner: 'web-demo build',
    value: 'Owns HTML brand injection and API origin resource hints.',
    vite8Risk: 'Medium; revalidate transformIndexHtml behavior during Vite major migration.',
  },
  {
    id: 'configCompressPlugin',
    keep: true,
    owner: 'deploy/build',
    value: 'Optional gzip/brotli artifacts when VITE_COMPRESSION requests precompression.',
    vite8Risk:
      'Medium; serving strategy should decide whether this stays in build or moves to CDN/CD.',
  },
  {
    id: 'viteBuildPerformancePlugin',
    keep: true,
    owner: 'bundle analysis',
    value: 'Opt-in visualizer artifact for bundle budget investigations.',
    vite8Risk: 'Low; remains disabled unless VITE_BUILD_ANALYZE=true.',
  },
] as const

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

    // ✅ HTML 注入品牌配置 + API 域名资源提示（VITE_API_BASE_URL）
    configHtmlPlugin(env),

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
      include: [
        /[\\/]src[\\/].*\.[cm]?[jt]sx?$/,
        /[\\/]src[\\/].*\.vue$/,
        /[\\/]src[\\/].*\.vue\?vue/,
      ],
      exclude: [
        /[\\/]node_modules[\\/]/,
        /[\\/]\.git[\\/]/,
        /[\\/]packages[\\/][^\\/]+[\\/]dist[\\/]/,
      ],
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
      resolvers: [sharedArchitectureComponentResolver(), createPrimeVueComponentResolver()],
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

function sharedArchitectureComponentResolver() {
  const packageComponents: Record<string, string> = {
    AnimateWrapper: '@ccd/vue-ui',
    CScrollbar: '@ccd/vue-ui',
    EmptyState: '@ccd/vue-ui',
    Icons: '@ccd/vue-ui',
    ProForm: '@ccd/vue-ui',
    ProTable: '@ccd/vue-ui',
  }

  return (name: string) => {
    const from = packageComponents[name]
    if (from) return { name, from }
    if (name === 'UseEcharts') return { name: 'default', from: '@/adapters/charts/UseEcharts.vue' }
    return undefined
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
