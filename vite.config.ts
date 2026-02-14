import postcssPxToRem from 'postcss-pxtorem'
import { defineConfig, loadEnv, type ConfigEnv, type UserConfigExport } from 'vite'
import { exclude, include } from './build/optimize'
import { getPluginsList } from './build/plugins'
import { __APP_INFO__, alias, pathResolve, root, wrapperEnv } from './build/utils'

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
  /^\.p-/, // 如果引入 PrimeVue，建议加上这个前缀排除
  // 排除明确标记的类
  /no-rem/,
]

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

  // 2. 动态控制 esbuild 的 drop 选项
  const esbuildDrop: Array<'console' | 'debugger'> = []
  if (VITE_DROP_CONSOLE) esbuildDrop.push('console')
  if (VITE_DROP_DEBUGGER) esbuildDrop.push('debugger')

  return defineConfig({
    base: VITE_PUBLIC_PATH,
    root,
    logLevel: isDev ? 'info' : 'warn',

    resolve: {
      alias,
    },

    server: {
      port: VITE_PORT,
      host: '0.0.0.0',
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
    },

    // 5. 构建配置
    build: {
      target: 'es2020',
      sourcemap: VITE_BUILD_SOURCEMAP,
      chunkSizeWarningLimit: 1500, // 1.5MB，单 chunk 过大仍会警告，配合 manualChunks 控制
      cssCodeSplit: true, // 启用 CSS 代码分割
      assetsInlineLimit: 4096, // < 4kb 转 base64

      rollupOptions: {
        input: {
          index: pathResolve('./index.html', import.meta.url),
        },
        output: {
          // 静态资源分类打包
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',

          // 手动拆包，避免 vendor-libs 单 chunk 过大
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('echarts') || id.includes('zrender')) return 'vendor-echarts'
              if (id.includes('primevue') || id.includes('@primeuix') || id.includes('primeicons'))
                return 'vendor-primevue'
              if (id.includes('lodash') || id.includes('dayjs')) return 'vendor-utils'
              if (
                id.includes('vue/') ||
                id.includes('vue-router') ||
                id.includes('pinia') ||
                id.includes('vue-i18n') ||
                id.includes('pinia-plugin-persistedstate') ||
                id.includes('/alova/') ||
                id.includes('@vueuse')
              )
                return 'vendor-vue'
              return 'vendor-libs'
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
    },

    // 6. 全局常量注入 (已移除冗余的 VITE_ 变量)
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
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
