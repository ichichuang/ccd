import postcssPxToRem from 'postcss-pxtorem'
import { defineConfig, loadEnv, type ConfigEnv, type UserConfigExport } from 'vite'
import { exclude, include } from './build/optimize'
import { getPluginsList } from './build/plugins'
import { __APP_INFO__, alias, pathResolve, root, wrapperEnv } from './build/utils'

// ----------------------------------------------------------------------
// PostCSS PxToRem 忽略选择器配置
// ----------------------------------------------------------------------
const PX_TO_REM_SELECTOR_BLACKLIST: (string | RegExp)[] = [
  // ✅ 排除传统 UnoCSS 工具类（非数字值）
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
  // ✅ 排除响应式前缀
  /^\.([0-9]+|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl):/,
  // ✅ 排除系统类
  /^html$/,
  /^:root$/,
  // ✅ 排除第三方组件
  /^\.el-/,
  /^\.ant-/,
  /^\.van-/,
  // ✅ 排除明确标记的类
  /no-rem/,
  // ✅ 排除媒体查询
  /^@media.*\.(xs|sm|md|lg|xl|2xl):/,
]

export default ({ mode }: ConfigEnv): UserConfigExport => {
  // 1. 加载环境变量 (wrapperEnv 已自动处理类型转换)
  const env = wrapperEnv(loadEnv(mode, root))
  const {
    VITE_PORT,
    VITE_PUBLIC_PATH,
    VITE_BUILD_SOURCEMAP,
    VITE_API_BASE_URL,
    VITE_APP_TITLE,
    VITE_APP_ENV,
    VITE_PINIA_PERSIST_KEY_PREFIX,
    VITE_ROOT_REDIRECT,
    VITE_DROP_DEBUGGER,
    VITE_DROP_CONSOLE,
    VITE_COMPRESSION,
    VITE_LEGACY,
    VITE_CDN,
  } = env

  const isDev = mode === 'development'

  // 2. 动态控制 esbuild 的 drop 选项
  const esbuildDrop: Array<'console' | 'debugger'> = []
  if (VITE_DROP_CONSOLE) esbuildDrop.push('console')
  if (VITE_DROP_DEBUGGER) esbuildDrop.push('debugger')

  return defineConfig({
    base: VITE_PUBLIC_PATH,
    root,
    logLevel: isDev ? 'info' : 'warn', // 生产环境减少噪音

    resolve: {
      alias,
      // 默认扩展名已包含 .mjs, .js, .ts, .jsx, .tsx, .json
      // 除非有特殊需求，否则建议使用默认值
    },

    server: {
      port: VITE_PORT, // wrapperEnv 已转为 number
      host: '0.0.0.0',
      open: true,
      cors: true,
      strictPort: false,
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
      // 优化 HMR
      hmr: {
        overlay: isDev,
        timeout: 30000,
      },
      // 文件监听优化
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      },
      proxy: isDev
        ? {
            '/api': {
              target: VITE_API_BASE_URL,
              changeOrigin: true,
              rewrite: path => path.replace(/^\/api/, ''),
              timeout: env.VITE_PROXY_TIMEOUT ?? 15000,
            },
          }
        : {},
    },

    // 3. 插件配置 (来自于 build/plugins.ts)
    plugins: getPluginsList({
      ...env,
      // 确保类型匹配
      VITE_COMPRESSION: (['none', 'gzip', 'brotli', 'both'].includes(VITE_COMPRESSION)
        ? VITE_COMPRESSION
        : 'none') as 'none' | 'gzip' | 'brotli' | 'both',
    }),

    // 4. 依赖优化
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
    },

    // 5. 构建配置
    build: {
      // 生产环境建议使用 es2020 或更高，避免 babel 转译过多
      target: 'es2020',
      sourcemap: VITE_BUILD_SOURCEMAP,
      chunkSizeWarningLimit: 2000,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,

      rollupOptions: {
        input: {
          index: pathResolve('./index.html', import.meta.url),
        },
        output: {
          // 手动分包策略
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('echarts') || id.includes('zrender')) return 'vendor-echarts'
              if (id.includes('lodash') || id.includes('dayjs')) return 'vendor-utils'
              // 其他依赖统一打包
              return 'vendor-libs'
            }
          },
        },
        external: isDev ? [] : undefined,
      },

      // 防止 CommonJS 转换时的 TDZ 问题
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: false,
      },

      reportCompressedSize: !isDev,
      copyPublicDir: true,
    },

    // 6. 全局常量注入
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
      processEnv: env,
      __VITE_APP_TITLE__: JSON.stringify(VITE_APP_TITLE),
      __VITE_APP_VERSION__: JSON.stringify(__APP_INFO__.pkg.version),
      __VITE_APP_ENV__: JSON.stringify(VITE_APP_ENV),
      __VITE_PINIA_PERSIST_KEY_PREFIX__: JSON.stringify(VITE_PINIA_PERSIST_KEY_PREFIX),
      __VITE_ROOT_REDIRECT__: JSON.stringify(VITE_ROOT_REDIRECT),
      __VITE_COMPRESSION__: JSON.stringify(VITE_COMPRESSION),
      __VITE_LEGACY__: JSON.stringify(VITE_LEGACY),
      __VITE_CDN__: JSON.stringify(VITE_CDN),
    },

    // 7. CSS 配置
    css: {
      postcss: {
        plugins: [
          // 移除 charset 警告
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
          // Px 转 Rem
          postcssPxToRem({
            rootValue: 16, // 基准大小
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
          // ✅ 修复：将整个对象断言为 any，彻底解决 "api 不在类型中" 的报错
          api: 'modern-compiler',
          charset: false,
        } as any,
      },
    },
  })
}
