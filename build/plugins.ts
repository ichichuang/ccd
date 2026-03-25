import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'node:fs'
import path from 'node:path'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import type { PluginOption, ViteDevServer } from 'vite'
import {
  getCustomIconClasses,
  getIconifyIconNamesSubset,
  ICON_SUBSET_LIMITS,
  invalidateIconCaches,
} from '../src/design-engine/safelist'
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
    // ✅ 构建信息看板
    viteBuildInfo(),

    // ✅ HTML 注入品牌配置（来自 src/constants/brand.ts）
    configHtmlPlugin(),

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
 * 图标示例页列表生成插件
 * 在构建/开发启动时从 @iconify-json 与 src/assets/icons 生成 iconLists.generated.ts（仅子集，与 safelist 一致）
 */
function generateIconListsPlugin(): PluginOption {
  const generatedPath = path.resolve(
    process.cwd(),
    'src/views/example/icons-example/configs/iconLists.generated.ts'
  )
  return {
    name: 'generate-icon-lists',
    config() {
      const isDemo = process.env.UNO_DEMO === 'true'

      let lucide: string[]
      let solar: string[]
      let ph: string[]
      let logos: string[]

      if (isDemo) {
        lucide = getIconifyIconNamesSubset('lucide', ICON_SUBSET_LIMITS.lucide)
        solar = getIconifyIconNamesSubset('solar', ICON_SUBSET_LIMITS.solar)
        ph = getIconifyIconNamesSubset('ph', ICON_SUBSET_LIMITS.ph)
        logos = getIconifyIconNamesSubset('logos', ICON_SUBSET_LIMITS.logos)
      } else {
        // UNO_DEMO=false 时使用精简子集，避免在开发模式加载过多图标
        const liteLimit = 32
        lucide = getIconifyIconNamesSubset('lucide', liteLimit)
        solar = getIconifyIconNamesSubset('solar', liteLimit)
        ph = getIconifyIconNamesSubset('ph', liteLimit)
        logos = getIconifyIconNamesSubset('logos', liteLimit)
      }

      const custom = getCustomIconClasses()
      const content = `/** 由 build/plugins.ts generateIconListsPlugin 在构建时生成，请勿手改 */\n\nexport const LUCIDE_ICONS: string[] = ${JSON.stringify(
        lucide
      )}\nexport const SOLAR_ICONS: string[] = ${JSON.stringify(
        solar
      )}\nexport const PH_ICONS: string[] = ${JSON.stringify(
        ph
      )}\nexport const LOGOS_ICONS: string[] = ${JSON.stringify(
        logos
      )}\nexport const CUSTOM_ICONS: string[] = ${JSON.stringify(
        custom
      )}\nexport const IS_LITE_MODE: boolean = ${!isDemo}\n`
      fs.mkdirSync(path.dirname(generatedPath), { recursive: true })
      fs.writeFileSync(generatedPath, content, 'utf-8')
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
