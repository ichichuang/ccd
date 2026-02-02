import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
  type Rule,
} from 'unocss'
import { getDynamicSafelist, getPresetIconsCollections } from './build/uno-icons'
import { BREAKPOINTS } from './src/constants/breakpoints'
import { SIZE_SCALE_KEYS } from './src/constants/sizeScale'
import { COLOR_FAMILIES } from './src/utils/theme/metadata'
/** 阶梯正则片段 (xs|sm|md|...|5xl)，SSOT 来自 SIZE_SCALE_KEYS */
const scaleRegex = `(${SIZE_SCALE_KEYS.join('|')})`

// ----------------------------------------------------------------------
// 1. 常量定义 (断点 SSOT: src/constants/breakpoints.ts)
// ----------------------------------------------------------------------
const breakpoints: Record<string, string> = Object.fromEntries(
  Object.entries(BREAKPOINTS).map(([k, v]) => [k, `${v}px`])
)

/**
 * 布局变量白名单
 *
 * 用于自动生成 UnoCSS 类名规则（w-*, h-*, min-w-*, max-h-* 等）
 * 这些变量对应 SizePreset 中的布局尺寸字段（camelCase）
 *
 * 注意：contentHeight 和 contentsHeight 已移除，因为受布局模式影响，
 * 应在页面中根据实际布局模式动态计算。
 */
const LAYOUT_SIZES = [
  'sidebarWidth',
  'sidebarCollapsedWidth',
  'headerHeight',
  'breadcrumbHeight',
  'footerHeight',
  'tabsHeight',
] as const

// ----------------------------------------------------------------------
// 2. 动态规则生成引擎 (The Rule Engine)
// ----------------------------------------------------------------------

/** 方向映射表 (padding/margin 用) */
const dirMap: Record<string, string[]> = {
  t: ['-top'],
  b: ['-bottom'],
  l: ['-left'],
  r: ['-right'],
  x: ['-left', '-right'],
  y: ['-top', '-bottom'],
  default: [], // all sides
}

/**
 * 生成语义化尺寸规则 (SSOT: SIZE_SCALE_KEYS)
 * 1. 新规则：p-padding-{scale}, m-margin-{scale}, gap-gap-{scale} -> var(--spacing-{scale})
 * 2. [deprecated] 旧规则：p-padding(s|x|l)? 等，基于 --spacing-unit 倍数，保留兼容
 */
function createSemanticSizeRules(): Rule[] {
  const rules: Rule[] = []

  // --- 1. 新规则：阶梯语义 (p-padding-xs ~ 5xl, m-margin-*, gap-gap-*) ---
  // Padding: p-padding-md, pt-padding-lg, px-padding-xl ...
  rules.push([
    new RegExp(`^p([tblxy])?-padding-${scaleRegex}$`),
    ([, dir, size]: string[]) => {
      const v = `var(--spacing-${size})`
      const suffixes = dirMap[dir || 'default']
      if (suffixes.length === 0) return { padding: v }
      const out: Record<string, string> = {}
      suffixes.forEach(s => {
        out[`padding${s}`] = v
      })
      return out
    },
  ])

  // Margin: m-margin-md, mt-margin-lg, mx-margin-xl ...
  rules.push([
    new RegExp(`^m([tblxy])?-margin-${scaleRegex}$`),
    ([, dir, size]: string[]) => {
      const v = `var(--spacing-${size})`
      const suffixes = dirMap[dir || 'default']
      if (suffixes.length === 0) return { margin: v }
      const out: Record<string, string> = {}
      suffixes.forEach(s => {
        out[`margin${s}`] = v
      })
      return out
    },
  ])

  // Gap: gap-gap-md, gap-x-gap-lg, gap-y-gap-xl ...
  rules.push([
    new RegExp(`^gap(-[xy])?-gap-${scaleRegex}$`),
    ([, dirStr, size]: string[]) => {
      const v = `var(--spacing-${size})`
      if (!dirStr) return { gap: v }
      if (dirStr === '-x') return { 'column-gap': v }
      return { 'row-gap': v }
    },
  ])

  // --- 2. [deprecated] 旧规则：s/x/l 三档，基于 --spacing-unit 倍数 ---
  const multipliers: Record<string, number> = {
    s: 2,
    default: 4,
    x: 6,
    l: 8,
  }
  rules.push([
    /^p([tblxy])?-padding(s|x|l)?$/,
    ([, dir, size]) => {
      const m = multipliers[size || 'default']
      const props = dirMap[dir || 'default']
      if (props.length === 0) return { padding: `calc(var(--spacing-unit) * ${m})` }
      const styles: Record<string, string> = {}
      props.forEach(p => {
        styles[`padding${p}`] = `calc(var(--spacing-unit) * ${m})`
      })
      return styles
    },
  ])
  rules.push([
    /^m([tblxy])?-(?:gap|margin)(s|x|l)?$/,
    ([, dir, size]) => {
      const m = multipliers[size || 'default']
      const props = dirMap[dir || 'default']
      if (props.length === 0) return { margin: `calc(var(--spacing-unit) * ${m})` }
      const styles: Record<string, string> = {}
      props.forEach(p => {
        styles[`margin${p}`] = `calc(var(--spacing-unit) * ${m})`
      })
      return styles
    },
  ])
  rules.push([
    /^gap-([xy]-)?unit(s|x|l)?$/,
    ([, dirStr, size]) => {
      const m = multipliers[size || 'default']
      const dir = dirStr ? dirStr.replace('-', '') : 'default'
      if (dir === 'default') return { gap: `calc(var(--spacing-unit) * ${m})` }
      if (dir === 'x') return { 'column-gap': `calc(var(--spacing-unit) * ${m})` }
      if (dir === 'y') return { 'row-gap': `calc(var(--spacing-unit) * ${m})` }
      return undefined
    },
  ])

  return rules
}

/** 布局变量自动映射规则 */
function createLayoutVariableRules(): Rule[] {
  // 支持 w-, h-, min-w-, max-w-, min-h-, max-h-
  const properties = [
    ['w', 'width'],
    ['h', 'height'],
    ['min-w', 'min-width'],
    ['max-w', 'max-width'],
    ['min-h', 'min-height'],
    ['max-h', 'max-height'],
  ] as const

  return properties.map(([prefix, cssProperty]) => [
    new RegExp(`^${prefix}-([a-zA-Z_][\\w]*)$`),
    ([, name]: string[]) => {
      if ((LAYOUT_SIZES as readonly string[]).includes(name as any)) {
        const cssVarName = `var(--${name.replace(/([A-Z])/g, '-$1').toLowerCase()})`
        return { [cssProperty]: cssVarName }
      }
      return undefined
    },
  ])
}

/** 阶梯规则生成器 (字体、间距、圆角、过渡 xs-5xl，SSOT: SIZE_SCALE_KEYS) */
function createScaleRules(): Rule[] {
  // 字体阶梯: fs-xs, fs-5xl
  const fontRule: Rule = [
    new RegExp(`^fs-${scaleRegex}$`),
    ([, size]: string[]) => ({ 'font-size': `var(--font-size-${size})` }),
  ]

  // 间距阶梯 (带方向): p-scale-xl, mt-scale-xs, gap-scale-md
  const scaleDirMap: Record<string, string[]> = {
    t: ['-top'],
    b: ['-bottom'],
    l: ['-left'],
    r: ['-right'],
    x: ['-left', '-right'],
    y: ['-top', '-bottom'],
  }
  const paddingMarginRule: Rule = [
    new RegExp(`^([pm])([tblxy])?-scale-${scaleRegex}$`),
    ([, type, dir, size]: string[]) => {
      const prop = type === 'p' ? 'padding' : 'margin'
      const suffixes = dir ? scaleDirMap[dir] : ['']
      const out: Record<string, string> = {}
      suffixes.forEach(s => {
        out[`${prop}${s}`] = `var(--spacing-${size})`
      })
      return out
    },
  ]

  // Gap 阶梯: gap-scale-xl, gap-x-scale-md
  const gapRule: Rule = [
    new RegExp(`^gap-([xy]-)?scale-${scaleRegex}$`),
    ([, dirStr, size]: string[]) => {
      const v = `var(--spacing-${size})`
      if (!dirStr) return { gap: v }
      if (dirStr.startsWith('x')) return { 'column-gap': v }
      return { 'row-gap': v }
    },
  ]

  // 圆角阶梯: rounded-scale-xs, rounded-scale-5xl
  const roundedRule: Rule = [
    new RegExp(`^rounded-scale-${scaleRegex}$`),
    ([, size]: string[]) => ({ 'border-radius': `var(--radius-${size})` }),
  ]

  // 过渡时长阶梯: duration-scale-xs, duration-scale-5xl
  const durationRule: Rule = [
    new RegExp(`^duration-scale-${scaleRegex}$`),
    ([, size]: string[]) => ({ 'transition-duration': `var(--transition-${size})` }),
  ]

  return [fontRule, paddingMarginRule, gapRule, roundedRule, durationRule]
}

/** Flex 对齐快捷类：{justify}-{items} 全排列，如 between-center、end-start */
function createFlexShortcuts(): Record<string, string> {
  const justifies = ['start', 'end', 'center', 'between', 'around', 'evenly'] as const
  const items = ['start', 'end', 'center', 'baseline', 'stretch'] as const
  const out: Record<string, string> = {}
  for (const j of justifies) {
    for (const i of items) {
      out[`${j}-${i}`] = `flex justify-${j} items-${i}`
    }
  }
  return out
}

// ----------------------------------------------------------------------
// 3. 配置主体
// ----------------------------------------------------------------------

const iconCollections = getPresetIconsCollections()

/** Theme 示例页动态类名 safelist */
const themeDemoSafelist = [
  // ====== 背景色（四元家族 + 基础 + 侧边栏） ======
  'bg-primary',
  'bg-primary-hover',
  'bg-primary-light',
  'bg-secondary',
  'bg-muted',
  'bg-accent',
  'bg-accent-hover',
  'bg-accent-light',
  'bg-destructive',
  'bg-destructive-hover',
  'bg-destructive-light',
  'bg-warn',
  'bg-warn-hover',
  'bg-warn-light',
  'bg-success',
  'bg-success-hover',
  'bg-success-light',
  'bg-card',
  'bg-popover',
  'bg-background',
  'bg-foreground',
  'bg-sidebar',
  'bg-sidebar-foreground',
  'bg-sidebar-primary',
  'bg-sidebar-primary-foreground',
  'bg-sidebar-accent',
  'bg-sidebar-accent-foreground',
  'bg-sidebar-border',
  'bg-sidebar-ring',

  // ====== 文本色（四元家族 + 基础） ======
  'text-primary',
  'text-primary-foreground',
  'text-primary-hover-foreground',
  'text-primary-light-foreground',
  'text-secondary-foreground',
  'text-muted-foreground',
  'text-accent',
  'text-accent-foreground',
  'text-accent-hover-foreground',
  'text-accent-light-foreground',
  'text-destructive',
  'text-destructive-foreground',
  'text-destructive-hover-foreground',
  'text-destructive-light-foreground',
  'text-warn',
  'text-warn-foreground',
  'text-warn-hover-foreground',
  'text-warn-light-foreground',
  'text-success',
  'text-success-foreground',
  'text-success-hover-foreground',
  'text-success-light-foreground',
  'text-card-foreground',
  'text-popover-foreground',
  'text-foreground',
  'text-background',
  'text-sidebar',
  'text-sidebar-foreground',
  'text-sidebar-primary-foreground',
  'text-sidebar-accent-foreground',

  // ====== 边框色（四元家族 + 基础） ======
  'border-primary',
  'border-primary-hover',
  'border-primary-light',
  'border-accent',
  'border-accent-hover',
  'border-accent-light',
  'border-destructive',
  'border-destructive-hover',
  'border-destructive-light',
  'border-warn',
  'border-warn-hover',
  'border-warn-light',
  'border-success',
  'border-success-hover',
  'border-success-light',
  'border-border',
  'border-input',
  'border-ring',
  'border-sidebar-border',
  'border-destructive/50',
  'border-primary/20',

  // ====== 透明度变体（四元家族） ======
  ...COLOR_FAMILIES.quadFamilies.flatMap(family =>
    [10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => `bg-${family}/${v}`)
  ),

  // ====== 尺寸系统阶梯类名 ======
  ...SIZE_SCALE_KEYS.flatMap(k => [
    `fs-${k}`,
    `p-scale-${k}`,
    `m-scale-${k}`,
    `gap-scale-${k}`,
    `px-scale-${k}`,
    `py-scale-${k}`,
    `pl-scale-${k}`,
    `pr-scale-${k}`,
    `pt-scale-${k}`,
    `pb-scale-${k}`,
    `mx-scale-${k}`,
    `my-scale-${k}`,
    `ml-scale-${k}`,
    `mr-scale-${k}`,
    `mt-scale-${k}`,
    `mb-scale-${k}`,
    `p-padding-${k}`,
    `m-margin-${k}`,
    `gap-gap-${k}`,
    `text-${k}`,
    `rounded-scale-${k}`,
    `duration-scale-${k}`,
  ]),
  'pt-scale-md',
  'pb-scale-lg',
  'px-scale-2xl',
  'py-scale-3xl',
  'gap-x-scale-md',
  'gap-y-scale-lg',

  // ====== PrimeVue 组件悬停态 ======
  'hover:bg-sidebar-accent/50',
  'bg-destructive/10',
  'bg-primary/5',
]

// ----------------------------------------------------------------------
// 4. 颜色系统动态映射 (与 ThemeEngine / COLOR_FAMILIES 对齐)
// ----------------------------------------------------------------------

const rgbVar = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

function buildThemeColors() {
  const colors: Record<string, any> = {}

  // 单一 token：直接映射到同名 CSS 变量
  for (const token of COLOR_FAMILIES.singleTokens) {
    colors[token] = rgbVar(token)
  }

  // 成对家族：DEFAULT + foreground
  for (const family of COLOR_FAMILIES.pairFamilies) {
    colors[family] = {
      DEFAULT: rgbVar(family),
      foreground: rgbVar(`${family}-foreground`),
    }
  }

  // 扩展家族：DEFAULT + foreground + hover + hover-foreground + light + light-foreground
  for (const family of COLOR_FAMILIES.quadFamilies) {
    colors[family] = {
      DEFAULT: rgbVar(family),
      foreground: rgbVar(`${family}-foreground`),
      hover: rgbVar(`${family}-hover`),
      'hover-foreground': rgbVar(`${family}-hover-foreground`),
      light: rgbVar(`${family}-light`),
      'light-foreground': rgbVar(`${family}-light-foreground`),
    }
  }

  // Sidebar 家族：使用 sidebar 专用 CSS 变量
  colors.sidebar = {
    DEFAULT: rgbVar(COLOR_FAMILIES.sidebar.background),
    foreground: rgbVar(COLOR_FAMILIES.sidebar.foreground),
    primary: rgbVar(COLOR_FAMILIES.sidebar.primary),
    'primary-foreground': rgbVar(COLOR_FAMILIES.sidebar['primary-foreground']),
    accent: rgbVar(COLOR_FAMILIES.sidebar.accent),
    'accent-foreground': rgbVar(COLOR_FAMILIES.sidebar['accent-foreground']),
    border: rgbVar(COLOR_FAMILIES.sidebar.border),
    ring: rgbVar(COLOR_FAMILIES.sidebar.ring),
  }

  return colors
}

export default defineConfig({
  presets: [
    presetUno({ dark: 'class' }), // 默认预设 (提供 flex, grid, text-center 等标准能力)
    presetAttributify(),
    presetTypography(),
    presetIcons({
      prefix: 'i-',
      extraProperties: { display: 'inline-block' },
      collections: iconCollections,
    }),
  ],

  safelist: [...getDynamicSafelist(), ...themeDemoSafelist],

  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        'src/plugins/modules/primevue-tokens.ts',
      ],
    },
  },

  transformers: [transformerDirectives(), transformerVariantGroup()],

  shortcuts: {
    full: 'w-full h-full',
    container: 'full bg-background text-foreground',
    screen: 'min-h-screen',
    center: 'flex items-center justify-center',
    'center-col': 'flex flex-col items-center justify-center',
    ...createFlexShortcuts(),
    between: 'flex items-center justify-between',
    'text-ellipsis': 'text-ellipsis overflow-hidden whitespace-nowrap',

    // 布局类
    stack: 'flex flex-col gap-gap-md',
    cluster: 'flex flex-wrap gap-gap-md',
    'grid-center': 'grid place-items-center',
    'absolute-center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',

    // 交互类
    clickable: 'cursor-pointer select-none active:scale-95 transition-transform duration-100',
    /* eslint-disable-next-line @typescript-eslint/naming-convention -- Uno 快捷类名 truncate-2 */
    'truncate-2': 'line-clamp-2 text-ellipsis overflow-hidden',

    // 组件快捷方式 (自动联动 SizeStore，统一使用 p-padding-* / gap-gap-*)
    'c-card':
      'center gap-gap-md p-padding-md rounded-scale-md bg-card text-card-foreground border border-border shadow-sm transition-all duration-scale-md',
    'c-card-hover': 'hover:shadow-md hover:border-primary/50',
    'c-cp': 'cursor-pointer',
    'c-transition': 'transition-all duration-scale-md ease-in-out',

    // 阶梯默认级别 (bare utilities default to md)
    'rounded-scale': 'rounded-scale-md',
    'duration-scale': 'duration-scale-md',
    'p-scale': 'p-scale-md',
    'm-scale': 'm-scale-md',
    'gap-scale': 'gap-scale-md',
    'fs-scale': 'fs-md',
  },

  rules: [
    ...createSemanticSizeRules(), // 优先级高：语义化尺寸 (p-padding)
    ...createLayoutVariableRules(), // 优先级中：布局变量 (w-sidebarWidth)
    ...createScaleRules(), // 优先级中：阶梯尺寸 (fs-xl, p-scale-lg)
    // REMOVED: createPixelRules (彻底移除，解决与 presetUno 的规则冲突)
    // 安全区域
    ['safe-top', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['safe-bottom', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],

  theme: {
    breakpoints,
    // 颜色系统 (设计系统 RGB 规范) - 由 COLOR_FAMILIES 动态映射
    colors: buildThemeColors(),
    // 显式设置 borderColor 以确保 border-{color} 类正确工作
    borderColor: buildThemeColors(),

    // 字体系统：由 SIZE_SCALE_KEYS 动态生成，text-base 别名 md
    fontSize: (() => {
      /* eslint-disable @typescript-eslint/naming-convention -- Tailwind 阶梯键 2xl/3xl/4xl/5xl */
      const lineHeightMap: Record<string, string> = {
        xs: '1',
        sm: '1.25',
        md: '1.5',
        lg: '1.75',
        xl: '1.75',
        '2xl': '2',
        '3xl': '2.25',
        '4xl': '2.5',
        '5xl': '1',
      }
      /* eslint-enable @typescript-eslint/naming-convention */
      const out: Record<string, [string, { 'line-height': string }]> = {}
      for (const k of SIZE_SCALE_KEYS) {
        out[k] = [`var(--font-size-${k})`, { 'line-height': lineHeightMap[k] ?? '1.5' }]
      }
      out.base = out.md
      return out
    })(),
    // 间距系统：基于 SIZE_SCALE_KEYS 生成语义阶梯，全部基于 --spacing-unit 动态计算
    spacing: (() => {
      const base: Record<string, string> = {
        unit: 'var(--spacing-unit)',
        px: '1px',
        0: '0',
      }
      const scaleEntries = SIZE_SCALE_KEYS.map(k => [k, `var(--spacing-${k})`] as const)
      return { ...base, ...Object.fromEntries(scaleEntries) }
    })(),
  },
})
