import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'
import UnoCSS from 'unocss/vite'
import progress from 'vite-plugin-progress'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import type { PluginOption, ViteDevServer } from 'vite'
import { invalidateIconCaches } from './design-engine/safelist'
import type { ViteEnv } from './utils'
import { configLegacyPlugin } from './legacy'

// ✅ 引入模块化的构建插件
import { configCompressPlugin } from './compress'
import { configHtmlPlugin } from './html'
import { viteBuildInfo } from './info'
import { viteBuildPerformancePlugin } from './performance'

export function getPluginsList(env: ViteEnv, command: 'build' | 'serve'): PluginOption[] {
  const { VITE_COMPRESSION, VITE_BUILD_ANALYZE, VITE_LEGACY } = env
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

    // 自动导入 API（仅 hooks + stores，减少噪音；api/constants 需显式 import）
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core', { '@/locales': [['t', '$t']] }],
      dirs: ['src/stores/modules', 'src/hooks/**/*'],
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

  // Legacy 浏览器兼容（仅构建阶段且显式开启时）
  if (isBuild && VITE_LEGACY) {
    plugins.push(configLegacyPlugin())
  }

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
