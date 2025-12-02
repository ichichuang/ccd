import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import type { PluginOption, ViteDevServer } from 'vite'
import { invalidateIconCaches } from '../unocss/utils/icons'
import { name, version } from '../package.json'
import type { ViteEnv } from './utils'

/**
 * 自定义启动信息插件
 * 在开发服务器启动时显示项目信息
 */
function startupInfoPlugin(): PluginOption {
  let hasShown = false

  return {
    name: 'startup-info',
    configureServer(server) {
      // 使用 Vite 的服务器启动钩子
      server.middlewares.use((req, res, next) => {
        // 只在第一次请求时显示启动信息
        if (!hasShown) {
          // 延迟显示，确保 Vite 的默认信息已经显示
          setTimeout(() => {
            console.log()
            console.log(`\x1b[36m╭─────────────────────────────────────────╮\x1b[0m`)
            console.log(
              `\x1b[36m│\x1b[0m \x1b[1m\x1b[32m${name.toUpperCase()}\x1b[0m \x1b[90mv${version}\x1b[0m`
            )
            console.log(`\x1b[36m│\x1b[0m \x1b[90m现代化的 Vue3 + TypeScript 管理后台\x1b[0m    `)
            console.log(`\x1b[36m╰─────────────────────────────────────────╯\x1b[0m`)
            console.log()
          }, 1000) // 进一步增加延迟时间
          hasShown = true
        }
        next()
      })
    },
  }
}

/**
 * 创建自定义组件解析器
 * 优化组件解析逻辑
 */
function createCustomComponentResolver() {
  return (name: string) => {
    // Layout* 组件映射到 modules 目录
    if (name.startsWith('Layout')) {
      return {
        name: 'default',
        from: `@/layouts/modules/${name}.vue`,
      }
    }

    // App* 组件映射到 components 目录
    if (name.startsWith('App')) {
      return {
        name: 'default',
        from: `@/layouts/components/${name}.vue`,
      }
    }

    return null
  }
}

export function getPluginsList(env: ViteEnv): PluginOption[] {
  const { VITE_COMPRESSION, VITE_BUILD_ANALYZE } = env
  const isDev = process.env.NODE_ENV === 'development'
  const isBuild = process.env.npm_lifecycle_event === 'build'

  const plugins: PluginOption[] = [
    // 启动信息插件 - 重新启用，优化显示时机
    isDev && startupInfoPlugin(),

    // 图标变更监听，驱动 UnoCSS safelist 热更新
    isDev && createIconsWatcherPlugin(),

    // UnoCSS 原子化 CSS - 必须在 Vue 插件之前
    UnoCSS(),

    // Vue 核心插件
    vue({
      // 优化选项
      template: {
        compilerOptions: {
          // 跳过一些非必要的编译检查以提升性能
          hoistStatic: true,
          cacheHandlers: true,
        },
      },
    }),

    // JSX/TSX 语法支持
    vueJsx(),

    // 自动导入 API - 优化配置
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'auto-imports.d.ts',
      // 已禁用 ESLint 的 no-undef 检查，不需要生成 eslintrc 文件
      eslintrc: {
        enabled: false,
      },
    }),

    Components({
      // ✅ 修复 1：将 dirs 改回简单的相对路径，这是最稳定的方式
      // 确保组件（包括 Loading, PrimeMenu 等）能被扫描到
      dirs: ['src/components'],

      extensions: ['vue', 'tsx'],

      deep: true,
      dts: 'components.d.ts',

      // 保持 resolvers 不变，确保 PrimeVue 组件能被解析
      resolvers: [PrimeVueResolver(), createCustomComponentResolver()],

      // ✅ 修复 2：优化 exclude 规则，确保它只排除 layouts 目录
      // 使用更精确的排除规则，且确保不干扰 node_modules 和 git 目录
      exclude: [
        /[\\/]node_modules[\\/]/,
        /[\\/]\.git[\\/]/,
        // 排除所有位于 src/layouts/ 目录下的 .vue 和 .tsx 文件
        /src[\\/]layouts[\\/].*\.(vue|tsx)$/,
      ],

      transformer: 'vue3',
      version: 3,
      include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],

      ...(isDev && {
        debug: env.VITE_DEBUG,
      }),
    }),

    // 🔥 注释掉：避免与自定义监听器重复
    // isDev && createFileWatcherPlugin(),
  ].filter(Boolean) as PluginOption[]

  // 生产环境优化插件
  if (isBuild) {
    // 压缩插件 - 直接导入而非延迟加载
    if (VITE_COMPRESSION !== 'none') {
      plugins.push(createCompressionPlugin(VITE_COMPRESSION))
    }

    // 构建分析插件
    if (VITE_BUILD_ANALYZE) {
      plugins.push(createAnalyzerPlugin())
    }
  }

  return plugins
}

/**
 * 创建优化的压缩插件
 * 简化实现，去除复杂的延迟加载逻辑
 */
function createCompressionPlugin(compression: ViteEnv['VITE_COMPRESSION']): PluginOption {
  return {
    name: 'optimized-compression',
    apply: 'build',
    configResolved() {
      console.log(`📦 启用 ${compression} 压缩`)
    },
    async generateBundle(...args: any[]) {
      try {
        // 动态导入压缩插件
        const { default: compressionPlugin } = await import('vite-plugin-compression')

        const plugins: any[] = []

        if (compression === 'gzip' || compression === 'both') {
          plugins.push(
            compressionPlugin({
              ext: '.gz',
              algorithm: 'gzip',
              threshold: 1024,
              deleteOriginFile: false,
              compressionOptions: { level: 9 },
            })
          )
        }

        if (compression === 'brotli' || compression === 'both') {
          plugins.push(
            compressionPlugin({
              ext: '.br',
              algorithm: 'brotliCompress',
              threshold: 1024,
              deleteOriginFile: false,
              compressionOptions: { level: 6 },
            })
          )
        }

        // 应用压缩插件
        for (const plugin of plugins) {
          if (plugin.generateBundle) {
            await plugin.generateBundle.call(this, ...args)
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn('⚠️ 压缩插件执行失败:', errorMessage)
      }
    },
  }
}

/**
 * 创建优化的构建分析插件
 */
function createAnalyzerPlugin(): PluginOption {
  return {
    name: 'optimized-analyzer',
    apply: 'build',
    configResolved() {
      console.log('📊 启用构建分析，报告将生成到 dist/stats.html')
    },
    async closeBundle() {
      try {
        const { visualizer } = await import('rollup-plugin-visualizer')
        const analyzerPlugin = visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap',
          sourcemap: true,
        })

        // 直接调用分析插件的生成逻辑
        if (typeof analyzerPlugin.generateBundle === 'function') {
          await analyzerPlugin.generateBundle.call(this, {} as any, {} as any, false)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn('⚠️ 构建分析插件执行失败:', errorMessage)
      }
    },
  }
}

function createIconsWatcherPlugin(): PluginOption {
  const cwd = process.cwd()
  const routeDir = path.resolve(cwd, 'src/router/modules')
  const apiDir = path.resolve(cwd, 'src/api/modules')
  let reloadTimer: NodeJS.Timeout | null = null

  const normalize = (value: string) => value.replace(/\\/g, '/')
  const directories = [routeDir, apiDir].map(normalize)

  const scheduleReload = (server: ViteDevServer, reason: string) => {
    if (process.env.VITE_DEBUG === 'true') {
      console.log(`♻️  Icon watcher detected change in ${reason}, reloading...`)
    }

    if (reloadTimer) {
      clearTimeout(reloadTimer)
    }

    reloadTimer = setTimeout(() => {
      invalidateIconCaches('all')
      server.ws.send({ type: 'full-reload' })
      reloadTimer = null
    }, 150)
  }

  const shouldHandle = (file: string) => {
    const normalizedFile = normalize(file)
    return directories.some(dir => normalizedFile.startsWith(dir))
  }

  return {
    name: 'icon-watcher',
    apply: 'serve',
    configureServer(server) {
      const watcher = server.watcher
      watcher.add([`${normalize(routeDir)}/**/*.{ts,vue}`, `${normalize(apiDir)}/**/*.{ts,vue}`])

      const handle = (file: string) => {
        if (shouldHandle(file)) {
          scheduleReload(server, file)
        }
      }

      watcher.on('add', handle)
      watcher.on('change', handle)
      watcher.on('unlink', handle)
    },
  }
}
