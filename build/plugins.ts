import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import type { PluginOption, ViteDevServer } from 'vite'
import { invalidateIconCaches } from './uno-icons'
import type { ViteEnv } from './utils'

// ✅ 引入模块化的构建插件
import { configCompressPlugin } from './compress'
import { viteBuildInfo } from './info'
import { viteBuildPerformancePlugin } from './performance'

export function getPluginsList(env: ViteEnv): PluginOption[] {
  const { VITE_COMPRESSION, VITE_BUILD_ANALYZE } = env
  const isDev = process.env.NODE_ENV === 'development'
  const isBuild = process.env.npm_lifecycle_event === 'build'

  const plugins: PluginOption[] = [
    // ✅ 构建信息看板
    viteBuildInfo(),

    // 图标变更监听
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

    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core', { '@/locales': [['t', '$t']] }],
      dirs: [
        'src/stores/modules',
        'src/hooks/**/*',
        'src/api/*',
        'src/utils/**/*',
        'src/constants/*',
      ],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: 'readonly',
      },
    }),

    /**
     * ✅ 自动导入组件配置 (核心修改点)
     * 1. 仅包含 src/components 目录，确保通用组件自动导入
     * 2. 显式排除 src/layouts 目录，符合你对“布局组件需手动引入”的设计要求
     * 3. 启用 directoryAsNamespace 解决 Shadcn-vue 嵌套结构识别问题
     */
    Components({
      // 💡 仅扫描通用组件目录
      dirs: ['src/components/ui', 'src/components'],
      extensions: ['vue', 'tsx'],
      deep: true,
      directoryAsNamespace: true,
      dts: 'src/types/components.d.ts',
      // 💡 排除布局目录，防止 Layout 管理组件被意外自动加载
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]src[\\/]layouts[\\/]/],
      transformer: 'vue3',
      version: 3,
      include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
    }),
  ].filter(Boolean) as PluginOption[]

  // 生产环境优化
  if (isBuild) {
    if (VITE_COMPRESSION !== 'none') {
      const compressPlugins = configCompressPlugin(VITE_COMPRESSION, false)
      if (Array.isArray(compressPlugins)) {
        plugins.push(...compressPlugins)
      } else {
        plugins.push(compressPlugins)
      }
    }

    if (VITE_BUILD_ANALYZE) {
      plugins.push(viteBuildPerformancePlugin(true))
    }
  }

  return plugins
}

/**
 * 图标监听插件
 */
function createIconsWatcherPlugin(): PluginOption {
  const cwd = process.cwd()
  const normalize = (value: string) => value.replace(/\\/g, '/')
  const routeDir = path.resolve(cwd, 'src/router/modules')
  const apiDir = path.resolve(cwd, 'src/api/modules')
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
