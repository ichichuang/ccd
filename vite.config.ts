import postcssPxToRem from 'postcss-pxtorem'
import { type ConfigEnv, defineConfig, loadEnv, type UserConfigExport } from 'vite'
import { exclude, include } from './build/optimize'
import { getPluginsList } from './build/plugins'
import { __APP_INFO__, alias, pathResolve, root, wrapperEnv } from './build/utils'

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

const VENDOR_CHUNK_GROUPS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'vue-core', pattern: /node_modules\/(vue|vue-router)\// },
  { name: 'state-management', pattern: /node_modules\/(pinia|pinia-plugin-persistedstate)\// },
  { name: 'ui-library', pattern: /node_modules\/(@primevue|primevue|@primevue\/themes)\// },
  { name: 'utilities', pattern: /node_modules\/(lodash-es|dayjs|@vueuse\/core)\// },
  { name: 'echarts-core', pattern: /node_modules\/(echarts|vue-echarts)\// },
  { name: 'ag-grid-core', pattern: /node_modules\/(ag-grid-community|ag-grid-vue3)\// },
  { name: 'http-client', pattern: /node_modules\/alova\// },
  { name: 'i18n', pattern: /node_modules\/(vue-i18n)\// },
]

const VIEW_CHUNK_PREFIX = 'view-'

function resolveViewChunk(id: string): string | null {
  const normalized = id.replace(/\\/g, '/')
  if (!normalized.includes('/src/views/')) {
    return null
  }

  const relative = normalized.split('/src/views/')[1]
  if (!relative) {
    return null
  }

  const topLevel = relative.split('/')[0]
  if (!topLevel) {
    return null
  }

  return `${VIEW_CHUNK_PREFIX}${topLevel.replace(/[^a-zA-Z0-9-]/g, '-')}`
}

// 移除本地ViteEnv类型声明

export default ({ mode }: ConfigEnv): UserConfigExport => {
  // 直接使用全局@env.d.ts类型
  const env = wrapperEnv(loadEnv(mode, root))
  const {
    VITE_PORT,
    VITE_PUBLIC_PATH,
    VITE_BUILD_SOURCEMAP,
    VITE_API_BASE_URL,
    VITE_APP_TITLE,
    VITE_APP_VERSION,
    VITE_APP_ENV,
    VITE_PINIA_PERSIST_KEY_PREFIX,
    VITE_ROOT_REDIRECT,
    VITE_LOADING_SIZE,
    VITE_DEBUG,
    VITE_DROP_DEBUGGER,
    VITE_DROP_CONSOLE,
    VITE_COMPRESSION,
    VITE_LEGACY,
    VITE_CDN,
  } = env

  const isDev = mode === 'development'

  return defineConfig({
    base: VITE_PUBLIC_PATH,
    root,
    logLevel: isDev ? 'info' : 'info',
    resolve: {
      alias,
      extensions: ['.mjs', '.ts', '.tsx', '.json', '.vue'],
    },
    server: {
      port: Number(VITE_PORT),
      host: '0.0.0.0',
      open: true,
      cors: true,
      strictPort: false,
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
      hmr: {
        overlay: isDev,
        // 优化HMR连接，减少扩展冲突
        timeout: 30000,
      },
      // 🔥 新增：增强文件监听配置
      watch: {
        // 监听所有相关文件类型
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
        // 增加轮询间隔，提高响应速度
        usePolling: false,
        // 监听深度
        depth: 10,
      },
      proxy: isDev
        ? {
            ['/api']: {
              target: VITE_API_BASE_URL,
              changeOrigin: true,
              rewrite: path => path.replace(/^\/api/, ''),
              timeout: 10000,
            },
          }
        : {},
    },
    plugins: getPluginsList({
      ...env,
      VITE_PORT: Number(env.VITE_PORT),
      VITE_CDN: env.VITE_CDN,
      VITE_LEGACY: env.VITE_LEGACY,
      VITE_COMPRESSION: (['none', 'gzip', 'brotli', 'both'].includes(env.VITE_COMPRESSION)
        ? env.VITE_COMPRESSION
        : 'none') as 'none' | 'gzip' | 'brotli' | 'both',
    }),
    optimizeDeps: {
      include,
      exclude,
      force: false,
      // 开发环境性能优化
      esbuildOptions: {
        target: 'esnext',
        // 保持类名用于调试
        keepNames: isDev,
      },
    },
    build: {
      target: 'es2015',
      sourcemap: VITE_BUILD_SOURCEMAP,
      minify: isDev ? false : 'terser',
      chunkSizeWarningLimit: 8000, // 降低警告阈值以优化包大小
      cssCodeSplit: true, // 启用 CSS 代码分割
      assetsInlineLimit: 4096, // 小于 4kb 的资源内联
      terserOptions: {
        compress: {
          drop_console: VITE_DROP_CONSOLE,
          drop_debugger: VITE_DROP_DEBUGGER,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          pure_funcs: VITE_DROP_CONSOLE ? ['console.log', 'console.info', 'console.debug'] : [],
          // 移除无用代码
          /* eslint-disable-next-line @typescript-eslint/naming-convention */
          dead_code: true,
          // 移除未使用的变量
          unused: true,
        },
        mangle: {
          // 保持 PrimeVue 组件名称
          reserved: ['PrimeVue', 'ToastService', 'ConfirmationService'],
        },
      },
      rollupOptions: {
        input: {
          index: pathResolve('./index.html', import.meta.url),
        },
        output: {
          entryFileNames: 'static/js/[name]-[hash:8].js',
          assetFileNames: 'static/[ext]/[name]-[hash:8].[ext]',
          // 优化代码分割策略
          manualChunks: id => {
            const normalizedId = id.replace(/\\/g, '/')

            if (normalizedId.includes('node_modules')) {
              const vendorGroup = VENDOR_CHUNK_GROUPS.find(group =>
                group.pattern.test(normalizedId)
              )
              if (vendorGroup) {
                return vendorGroup.name
              }
              return 'vendor'
            }

            const viewChunk = resolveViewChunk(normalizedId)
            if (viewChunk) {
              return viewChunk
            }

            return undefined
          },
          // 优化 chunk 分割 - 智能命名
          chunkFileNames: chunkInfo => {
            const { name } = chunkInfo
            if (name.includes('node_modules')) {
              return 'static/vendor/[name]-[hash:8].js'
            }
            return 'static/js/[name]-[hash:8].js'
          },
        },
        // 外部依赖优化
        external: isDev ? [] : undefined,
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true, // 转换混合 ES 模块
      },
      // 启用实验性功能提升构建性能
      reportCompressedSize: !isDev, // 仅生产环境报告压缩大小
      copyPublicDir: true,
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
      processEnv: env,
      __VITE_APP_TITLE__: JSON.stringify(VITE_APP_TITLE),
      __VITE_APP_VERSION__: JSON.stringify(VITE_APP_VERSION),
      __VITE_APP_ENV__: JSON.stringify(VITE_APP_ENV),
      __VITE_PINIA_PERSIST_KEY_PREFIX__: JSON.stringify(VITE_PINIA_PERSIST_KEY_PREFIX),
      __VITE_ROOT_REDIRECT__: JSON.stringify(VITE_ROOT_REDIRECT),
      __VITE_LOADING_SIZE__: JSON.stringify(VITE_LOADING_SIZE),
      __VITE_DEBUG__: JSON.stringify(VITE_DEBUG),
      __VITE_COMPRESSION__: JSON.stringify(VITE_COMPRESSION),
      __VITE_LEGACY__: JSON.stringify(VITE_LEGACY),
      __VITE_CDN__: JSON.stringify(VITE_CDN),
    },
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
          // postcss-pxtorem 配置
          postcssPxToRem({
            // 基准字体大小，从环境变量读取
            // 注意：这里使用桌面端基准值 16px
            // 移动端适配通过 JavaScript 动态调整根字体大小实现
            rootValue: 16,
            // 需要转换的CSS属性，* 表示所有属性
            propList: [
              '*',
              // 不转换边框相关，避免出现 0.5px 等问题
              '!border',
              '!border-width',
              '!border-top-width',
              '!border-right-width',
              '!border-bottom-width',
              '!border-left-width',
            ],
            // 过滤不需要转换的选择器 - 修复设计稿映射兼容性
            selectorBlackList: PX_TO_REM_SELECTOR_BLACKLIST,
            // 替换规则
            replace: true,
            // 允许在媒体查询中转换px
            mediaQuery: true,
            // 设置要转换的最小像素值
            minPixelValue: 1,
            // 保留单位精度
            unitPrecision: 4,
            // 排除文件或文件夹
            exclude: /node_modules/i,
          }),
        ],
      },
      preprocessorOptions: {
        scss: {
          charset: false,
        },
      },
    },
  })
}
