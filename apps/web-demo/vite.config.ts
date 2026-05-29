import postcssPxToRem from 'postcss-pxtorem'
import { defineConfig, loadEnv, type ConfigEnv, type UserConfigExport } from 'vite'
import { exclude, include } from './build/optimize'
import { getPluginsList } from './build/plugins'
import { __APP_INFO__, alias, pathResolve, root, wrapperEnv } from './build/utils'

// ----------------------------------------------------------------------
// PostCSS PxToRem 忽略选择器配置
// 策略：UnoCSS/generated CSS 由 file-level exclude 保护；selector blacklist 只保留
// 无法通过文件路径稳定区分的 root / third-party / explicit opt-out 例外。
// ----------------------------------------------------------------------
const PX_TO_REM_SELECTOR_BLACKLIST: (string | RegExp)[] = [
  /^html$/,
  /^:root$/,
  /^\.el-/,
  /^\.ant-/,
  /^\.van-/,
  /no-rem/,
]

const PX_TO_REM_FILE_EXCLUDES: RegExp[] = [
  /node_modules/i,
  /(?:^|[/\\])uno\.css(?:\?|$)/i,
  /(?:^|[/\\])__uno(?:\.css)?(?:\?|$)/i,
  /virtual:uno/i,
  /@unocss/i,
]

function shouldExcludePxToRemFile(file: string): boolean {
  return PX_TO_REM_FILE_EXCLUDES.some(pattern => pattern.test(file))
}

export default ({ mode, command }: ConfigEnv): UserConfigExport => {
  // 1. 加载环境变量
  const env = wrapperEnv({
    ...loadEnv(mode, pathResolve('../../..')),
    ...loadEnv(mode, root),
  })
  const {
    VITE_PORT,
    VITE_PUBLIC_PATH,
    VITE_BUILD_SOURCEMAP,
    VITE_API_BASE_URL,
    VITE_DROP_DEBUGGER,
    VITE_DROP_CONSOLE,
    VITE_COMPRESSION,
    VITE_PROXY_TIMEOUT,
  } = env

  const isDev = mode === 'development'
  const isBuild = command === 'build'

  // 2. 动态控制 esbuild 的 drop / pure 选项
  //    保留 console.error 和 console.warn 用于生产环境错误可见性
  const esbuildDrop: Array<'debugger'> = []
  if (VITE_DROP_DEBUGGER) esbuildDrop.push('debugger')
  const esbuildPure: string[] = []
  if (VITE_DROP_CONSOLE) {
    esbuildPure.push(
      'console.log',
      'console.info',
      'console.debug',
      'console.trace',
      'console.dir',
      'console.table',
      'console.time',
      'console.timeEnd',
      'console.group',
      'console.groupEnd',
      'console.groupCollapsed'
    )
  }

  return defineConfig({
    base: VITE_PUBLIC_PATH,
    root,
    logLevel: isDev ? 'info' : 'warn',

    resolve: {
      alias,
    },

    server: {
      port: VITE_PORT,
      host: '127.0.0.1',
      open: true,
      cors: true,
      strictPort: false,
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
      hmr: {
        overlay: isDev,
        timeout: 30000,
      },
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/src-tauri/target/**',
          '**/src-tauri/gen/**',
        ],
      },
      proxy: isDev
        ? {
            '/api/jsonplaceholder': {
              target: 'https://jsonplaceholder.typicode.com',
              changeOrigin: true,
              rewrite: path => path.replace(/^\/api\/jsonplaceholder/, ''),
              timeout: VITE_PROXY_TIMEOUT ?? 15000,
            },
            '/api': {
              target: VITE_API_BASE_URL,
              changeOrigin: true,
              rewrite: path => path.replace(/^\/api/, ''),
              timeout: VITE_PROXY_TIMEOUT ?? 15000,
            },
          }
        : {},
    },

    preview: {
      port: 4173,
      host: 'localhost',
      open: true,
      cors: true,
    },

    // 3. 插件配置 (传入 command 以正确判断构建阶段)
    plugins: getPluginsList(
      {
        ...env,
        VITE_COMPRESSION: (['none', 'gzip', 'brotli', 'both'].includes(VITE_COMPRESSION)
          ? VITE_COMPRESSION
          : 'none') as 'none' | 'gzip' | 'brotli' | 'both',
      },
      command
    ),

    // 4. 依赖优化 (清理了僵尸依赖后的 clean version)
    optimizeDeps: {
      include,
      exclude,
      force: false,
      esbuildOptions: {
        target: 'esnext',
        keepNames: isDev,
      },
    },

    esbuild: {
      drop: esbuildDrop.length ? esbuildDrop : undefined,
      pure: esbuildPure.length ? esbuildPure : undefined,
    },

    // 5. 构建配置
    build: {
      target: 'es2020',
      sourcemap: VITE_BUILD_SOURCEMAP,
      // 企业级依赖（PrimeVue 主题 / ECharts）天然较大，1.5MB 作为合理上限
      chunkSizeWarningLimit: 1500,
      cssCodeSplit: true, // 启用 CSS 代码分割
      assetsInlineLimit: 4096, // < 4kb 转 base64
      modulePreload: { polyfill: false },

      rollupOptions: {
        treeshake: {
          preset: 'smallest',
          moduleSideEffects: id =>
            /\.(css|scss|sass)$/.test(id) || id.includes('uno.css') || id.startsWith('virtual:'),
        },
        input: {
          index: pathResolve('./index.html', import.meta.url),
        },
        output: {
          // 静态资源分类打包
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',

          // Rollup 4 碎片合并：<2KB 的 chunk 自动归并到最近的父模块。
          // Vite 7 当前仍走 Rollup output；迁移 Rolldown 时需复核该实验选项是否仍被支持。
          // 消除 40+ 个微型碎片，减少 HTTP 请求数和压缩文件数。
          experimentalMinChunkSize: 2 * 1024,

          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              // ── 1. Core framework: startup-critical and shared by most routes ──
              if (id.includes('/vue/') || id.includes('vue-router') || id.includes('/pinia/'))
                return 'vendor-core'

              // ── 2. Heavy visual runtimes: async-only consumers should not leak into core ──
              if (
                id.includes('echarts') ||
                id.includes('zrender') ||
                id.includes('vue-echarts') ||
                id.includes('/gsap/') ||
                id.includes('lottie-web') ||
                id.includes('vue3-lottie')
              )
                return 'vendor-heavy'

              // ── 3. PrimeVue UI framework and theme runtime ──
              // @primeuix/themes 与 @primevue/core、primevue/* 组件基础模块高度耦合，
              // 合并为单一 chunk 避免 BaseStyle/utils 碎片散落在各路由 chunk 中
              if (id.includes('@primeuix') || id.includes('@primevue') || id.includes('/primevue/'))
                return 'vendor-ui'

              // Other dependencies are left to Rollup so small async chains can co-locate
              // with the route or feature that actually imports them.
              return undefined
            }
            return undefined
          },
        },
      },

      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: false,
      },

      reportCompressedSize: !isDev,
      copyPublicDir: true,
      minify: 'esbuild' as const, // 使用 esbuild 默认压缩器（速度快，产物质量与 terser 接近）
    },

    // 6. 全局常量注入：仅向客户端注入最小应用信息（避免大 JSON 导致 define 替换异常）
    define: {
      __APP_INFO__: JSON.stringify({
        pkg: { name: __APP_INFO__.pkg.name, version: __APP_INFO__.pkg.version },
        lastBuildTime: __APP_INFO__.lastBuildTime,
      }),
    },

    // 7. CSS 配置
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: atRule => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              },
            },
          },
          ...(isBuild
            ? [
                postcssPxToRem({
                  rootValue: 16,
                  propList: [
                    '*',
                    '!border',
                    '!border-width',
                    '!border-top-width',
                    '!border-right-width',
                    '!border-bottom-width',
                    '!border-left-width',
                  ],
                  selectorBlackList: PX_TO_REM_SELECTOR_BLACKLIST,
                  replace: true,
                  mediaQuery: true,
                  minPixelValue: 1,
                  unitPrecision: 4,
                  exclude: shouldExcludePxToRemFile,
                }),
              ]
            : []),
        ],
      },
      preprocessorOptions: {
        scss: {
          // 消除 Sass 现代编译器警告
          api: 'modern-compiler',
          charset: false,
        } as any,
      },
    },
  })
}
