import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { shortcuts } from './src/design-engine'
import { getEngineSafelist, getPresetIconsCollections } from './src/design-engine/safelist'
import { theme } from './src/design-engine/theme'

/** 与 shortcuts 中 `ease-spring` 对齐（Uno 从 `theme.easing` 解析） */
const themeResolved = {
  ...theme,
  easing: {
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as typeof theme & { easing: { spring: string } }

// 约束：上述 src 下被引用的文件必须为纯数据（仅导出常量/类型），禁止 import .vue 或使用 window/document 等浏览器 API，否则 Node 构建会报错。
//
// Runtime SSOT:
// - 颜色、尺寸、布局 token 映射：src/design-engine/theme/index.ts
// - 语义 shortcuts：src/design-engine/shortcuts/semanticShortcuts.ts
// - safelist：src/design-engine/safelist/index.ts
//
// 说明：
// - `p-*` / `m-*` / `gap-*` / `rounded-*` / `duration-*` 等阶梯能力由 `themeResolved` 提供
// - `w-sidebarWidth` / `h-headerHeight` 等布局尺寸由 `theme.width/height` 提供
// - `p-container-padding` 等基础变量由 `theme.spacing` 提供
// - 已移除未接入运行时的 legacy Rule DSL，避免“声明支持”与“实际运行”分叉

const iconCollections = getPresetIconsCollections()

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
      include: [/\.(vue|svelte|[jt]s|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/],
    },
  },

  transformers: [transformerDirectives(), transformerVariantGroup()],

  // 业务层：优先使用 semantic shortcuts + theme-native token utilities（如 p-md、gap-sm、bg-card、text-muted-foreground）
  shortcuts,

  rules: [
    ['group', {}],
    ['safe-top', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['safe-bottom', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],

  theme: themeResolved,
})
