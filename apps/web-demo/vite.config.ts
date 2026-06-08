import postcssPxToRem from 'postcss-pxtorem'
import {
  defineConfig,
  type ConfigEnv,
  type SassPreprocessorOptions,
  type UserConfigExport,
} from 'vite'
import { loadAppViteEnv, localViteCors, localViteHost } from '../vite.shared'
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
  /(?:^|[/\\])packages[/\\](?:vue-ui|vue-primevue-adapter|vue-charts)[/\\]dist[/\\]/i,
  /(?:^|[/\\])uno\.css(?:\?|$)/i,
  /(?:^|[/\\])__uno(?:\.css)?(?:\?|$)/i,
  /virtual:uno/i,
  /@unocss/i,
  /@primeuix/i,
  /@primevue/i,
  /(?:^|[/\\])primevue(?:[/\\]|$)/i,
]

function shouldExcludePxToRemFile(file: string): boolean {
  return PX_TO_REM_FILE_EXCLUDES.some(pattern => pattern.test(file))
}

type ModernScssPreprocessorOptions = SassPreprocessorOptions & {
  api?: 'modern' | 'modern-compiler' | 'legacy'
  charset?: boolean
}

const scssPreprocessorOptions: ModernScssPreprocessorOptions = {
  api: 'modern-compiler',
  charset: false,
}

function createPnpmAwarePackagePattern(packages: string[]): RegExp {
  const packageAlternates = packages
    .map(packageName => packageName.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'))
    .join('|')

  return new RegExp(
    `node_modules[\\\\/](?:\\.pnpm[\\\\/](?:${packageAlternates})(?:@|[\\\\/+])[^\\\\/]*[\\\\/]node_modules[\\\\/])?(?:${packageAlternates})(?:[\\\\/]|$)`
  )
}

const vendorCorePattern = createPnpmAwarePackagePattern(['vue', 'vue-router', 'pinia'])
const vendorHeavyPattern = createPnpmAwarePackagePattern([
  'echarts',
  'zrender',
  'vue-echarts',
  'gsap',
  'lottie-web',
  'vue3-lottie',
])
const vendorUiPattern = createPnpmAwarePackagePattern(['@primeuix', '@primevue', 'primevue'])

export default ({ mode, command }: ConfigEnv): UserConfigExport => {
  // 1. 加载环境变量
  const env = wrapperEnv(loadAppViteEnv(mode, root))
  const {
    VITE_PORT,
    VITE_PUBLIC_PATH,
    VITE_BUILD_SOURCEMAP,
    VITE_API_BASE_URL,
    VITE_DROP_DEBUGGER,
    VITE_DROP_CONSOLE,
    VITE_COMPRESSION,
    VITE_PROXY_TIMEOUT,
    VITE_SERVER_OPEN,
  } = env

  const isDev = mode === 'development'
  const isBuild = command === 'build'
  const lifecycleEvent = process.env.npm_lifecycle_event ?? ''
  const isAutomatedServer =
    process.env.CI === 'true' ||
    process.env.CI === '1' ||
    lifecycleEvent.startsWith('e2e') ||
    VITE_SERVER_OPEN === 'false'
  const shouldOpenDevServer = isDev && !isAutomatedServer
  const shouldOpenPreview = VITE_SERVER_OPEN === 'true' && !isAutomatedServer

  // 2. 动态控制 Oxc/Rolldown 压缩选项
  //    保留 console.error 和 console.warn 用于生产环境错误可见性。
  //    使用 manualPureFunctions 而非 dropConsole，避免丢弃 console 参数副作用。
  const consolePureFunctions: string[] = []
  if (VITE_DROP_CONSOLE) {
    consolePureFunctions.push(
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
      host: localViteHost,
      open: shouldOpenDevServer,
      cors: localViteCors,
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
      open: shouldOpenPreview,
      cors: localViteCors,
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
      rolldownOptions: {
        output: {
          keepNames: isDev,
        },
      },
    },

    oxc: {
      target: 'es2020',
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

      rolldownOptions: {
        treeshake: {
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

          codeSplitting: {
            minSize: 2 * 1024,
            groups: [
              {
                name: 'vendor-core',
                test: vendorCorePattern,
                priority: 30,
              },
              {
                name: 'vendor-heavy',
                test: vendorHeavyPattern,
                priority: 20,
              },
              {
                name: 'vendor-ui',
                test: vendorUiPattern,
                priority: 10,
              },
            ],
          },
          minify: {
            compress: {
              dropDebugger: VITE_DROP_DEBUGGER,
              treeshake: consolePureFunctions.length
                ? { manualPureFunctions: consolePureFunctions }
                : undefined,
            },
          },
        },
      },

      reportCompressedSize: !isDev,
      copyPublicDir: true,
      minify: 'oxc' as const,
      cssMinify: 'lightningcss',
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
        scss: scssPreprocessorOptions,
      },
    },
  })
}
