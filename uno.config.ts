import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { semanticShortcuts } from './apps/web-demo/src/design-engine/shortcuts/semanticShortcuts'
import {
  getEngineSafelist,
  getPresetIconsCollections,
} from './apps/web-demo/src/design-engine/safelist'
import { theme } from './apps/web-demo/src/design-engine/theme'

/** Uno easing utilities resolve from `theme.easing`; keep it aligned with the design engine motion map. */
const transitionTimingFunction = theme.transitionTimingFunction as Record<string, string>
const themeResolved = {
  ...theme,
  easing: {
    ...transitionTimingFunction,
  },
} as typeof theme & { easing: Record<string, string> }

// 约束：上述 src 下被引用的文件必须为纯数据（仅导出常量/类型），禁止 import .vue 或使用 window/document 等浏览器 API，否则 Node 构建会报错。
//
// Runtime SSOT:
// - 颜色、尺寸、布局 token 映射：apps/web-demo/src/design-engine/theme/index.ts
// - 语义 shortcuts：apps/web-demo/src/design-engine/shortcuts/semanticShortcuts.ts
// - safelist：apps/web-demo/src/design-engine/safelist/index.ts
//
// 说明：
// - `p-*` / `m-*` / `gap-*` / `rounded-*` / `duration-*` 等阶梯能力由 `themeResolved` 提供
// - `w-sidebarWidth` / `h-headerHeight` 等布局尺寸由 `theme.width/height` 提供
// - `p-container-padding` 等基础变量由 `theme.spacing` 提供
// - 已移除未接入运行时的 legacy Rule DSL，避免“声明支持”与“实际运行”分叉

const iconCollections = getPresetIconsCollections()

// Keep TS/JS extraction project-local. Broad `[jt]s` pipeline scans dependency
// internals such as Zod's `$constructor(...)` helpers, which Attributify can
// misread as attribute utilities and emit invalid CSS in `/__uno.css`.
const PROJECT_TS_JS_GLOB = 'apps/web-demo/src/**/*.{js,ts}'
const PIPELINE_INCLUDE = [
  /\.(vue|svelte|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
  PROJECT_TS_JS_GLOB,
]
const PIPELINE_EXCLUDE = [
  /[\\/]node_modules[\\/]/,
  /[\\/]\.pnpm[\\/]/,
  /[\\/]dist[\\/]/,
  /[\\/]\.git[\\/]/,
  /[\\/]\.ai[\\/]/,
  /[\\/]\.cursor[\\/]/,
  /[\\/]src-tauri[\\/]target[\\/]/,
  /\.d\.ts($|\?)/,
]

export default defineConfig({
  presets: [
    presetUno({ dark: 'class' }),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      prefix: 'i-',
      extraProperties: { display: 'inline-block' },
      collections: iconCollections,
    }),
  ],

  safelist: getEngineSafelist(),

  content: {
    pipeline: {
      include: PIPELINE_INCLUDE,
      exclude: PIPELINE_EXCLUDE,
    },
  },

  transformers: [transformerDirectives(), transformerVariantGroup()],

  // 业务层：优先使用 semantic shortcuts + theme-native token utilities（如 p-md、gap-sm、bg-card、text-muted-foreground）
  shortcuts: [semanticShortcuts],

  rules: [
    ['group', {}],
    ['safe-top', { 'padding-top': 'var(--safe-top)' }],
    ['safe-bottom', { 'padding-bottom': 'var(--safe-bottom)' }],
    ['safe-left', { 'padding-left': 'var(--safe-left)' }],
    ['safe-right', { 'padding-right': 'var(--safe-right)' }],
  ],

  theme: themeResolved,
})
