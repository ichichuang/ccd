import postcssPxToRem from 'postcss-pxtorem'
import { defineConfig, loadEnv, type ConfigEnv, type UserConfigExport } from 'vite'
import { exclude, include } from './build/optimize'
import { getPluginsList } from './build/plugins'
import {
  __APP_INFO__,
  alias,
  ensureTauriDevUrlSync,
  pathResolve,
  root,
  wrapperEnv,
} from './build/utils'

// ----------------------------------------------------------------------
// PostCSS PxToRem 忽略选择器配置
// 策略：排除 UnoCSS 生成的原子类，仅转换手写的 CSS/SCSS 中的 px
// ----------------------------------------------------------------------
const PX_TO_REM_SELECTOR_BLACKLIST: (string | RegExp)[] = [
  // 排除 UnoCSS 常用工具类
  /^\.w-(full|auto|screen|min|max|fit)/,
  /^\.h-(full|auto|screen|min|max|fit)/,
  /^\.text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
  /^\.p-(auto|px|py)/,
  /^\.m-(auto|px|py)/,
  /^\.bg-/,
  /^\.border-(?![\d])/,
  /^\.rounded-(?![\d])/,
  /^\.flex/,
  /^\.grid/,
  /^\.absolute|\.relative|\.fixed|\.sticky/,
  /^\.justify-|\.items-|\.content-/,
  /^\.overflow-|\.cursor-|\.select-/,
  // 排除响应式前缀
  /^\.([0-9]+|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl):/,
  // 排除系统类
  /^html$/,
  /^:root$/,
  // 排除第三方组件库 (防止破坏 UI 库样式)
  /^\.el-/,
  /^\.ant-/,
  /^\.van-/,
  /^\.p-/, // PrimeVue v4 组件内部 class 前缀，必须排除（防止 pxtorem 破坏组件样式）
  // 排除明确标记的类
  /no-rem/,
]

function normalizeBasePath(basePath: string): string {
  if (!basePath) {
    return '/'
  }

  if (basePath === './' || basePath === '/') {
    return basePath
  }

  return basePath.endsWith('/') ? basePath : `${basePath}/`
}

export default ({ mode, command }: ConfigEnv): UserConfigExport => {
  // 1. 加载环境变量
  const env = wrapperEnv(loadEnv(mode, root))
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
  const isTauriBuild = Boolean(process.env.TAURI_ENV_PLATFORM || process.env.TAURI_ENV_ARCH)
  const resolvedBase = isTauriBuild ? './' : normalizeBasePath(VITE_PUBLIC_PATH)
  ensureTauriDevUrlSync(VITE_PORT)

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
    base: resolvedBase,
    root,
    logLevel: isDev ? 'info' : 'warn',
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_ENV_'],

    resolve: {
      alias,
    },

    server: {
      port: VITE_PORT,
      host: process.env.TAURI_DEV_HOST || false,
      open: true,
      cors: true,
      strictPort: true,
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
      hmr: {
        overlay: isDev,
        timeout: 30000,
      },
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      },
      proxy: isDev
        ? {
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
      command,
      resolvedBase
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
            /\.(css|scss|sass)$/.test(id) ||
            id.includes('animate.css') ||
            id.includes('uno.css') ||
            id.startsWith('virtual:'),
        },
        input: {
          index: pathResolve('./index.html', import.meta.url),
        },
        output: {
          // 静态资源分类打包
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',

          // Rollup 4 碎片合并：<2KB 的 chunk 自动归并到最近的父模块
          // 消除 40+ 个微型碎片，减少 HTTP 请求数和压缩文件数
          experimentalMinChunkSize: 2 * 1024,

          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              // ── 1. Vue Core (保持纯净) ──
              if (id.includes('/vue/') || id.includes('vue-router') || id.includes('/pinia/'))
                return 'vendor-vue'

              // ── 2. Vue 生态核心 (首屏同步: i18n + persistedstate + HTTP 客户端) ──
              // overlayscrollbars / @tanstack/vue-virtual 为非首屏依赖，
              // 交由 Rollup 按需切分到对应路由 chunk，减轻首屏同步负载
              if (
                id.includes('vue-i18n') ||
                id.includes('pinia-plugin-persistedstate') ||
                id.includes('/alova/')
              )
                return 'vendor-ecosystem'

              // ── 3. ECharts 生态 (defineAsyncComponent 异步加载) ──
              if (id.includes('echarts') || id.includes('zrender') || id.includes('vue-echarts'))
                return 'vendor-echarts'

              // ── 4. GSAP 动画库 (仅登录页使用，独立拆包避免污染首屏) ──
              if (id.includes('/gsap/')) return 'vendor-gsap'

              // ── 5. Lottie 生态 (defineAsyncComponent 异步加载) ──
              if (id.includes('lottie-web') || id.includes('vue3-lottie')) return 'vendor-lottie'

              // ── 6. PrimeVue UI 框架 (主题数据 + 核心运行时统一打包) ──
              // @primeuix/themes 与 @primevue/core、primevue/* 组件基础模块高度耦合，
              // 合并为单一 chunk 避免 BaseStyle/utils 碎片散落在各路由 chunk 中
              if (id.includes('@primeuix') || id.includes('@primevue') || id.includes('/primevue/'))
                return 'vendor-primevue'

              // ── 7. 工具库（按需拆分，避免污染 vendor-vue） ──
              if (id.includes('@vueuse') || id.includes('lodash-es')) return 'vendor-utils'
              if (id.includes('dayjs') || id.includes('crypto-es') || id.includes('yup'))
                return 'vendor-utils'

              // 其余小型依赖 (<20KB) → Rollup 原生异步切分
              return undefined
            }
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
      // 仅在非常必要时保留 processEnv，通常 import.meta.env 足够使用
      processEnv: env,
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
            exclude: /node_modules/i,
          }),
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
