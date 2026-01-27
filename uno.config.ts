/**
 * UnoCSS 全量配置 (CCD Architecture v3.4 Ultimate)
 * 核心特性：全排列语义化规则生成、ESLint 规范兼容、动态尺寸引擎深度集成
 */
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

/** * 生成语义化尺寸规则 (全排列覆盖) 🌟
 * 覆盖：p/m/gap + 方向(t/b/l/r/x/y) + 尺寸后缀(s/x/l)
 * 示例：pt-padding-s, mx-gap-x, gap-y-unit
 */
function createSemanticSizeRules(): Rule[] {
  // 1. 尺寸倍率表 (基于 --spacing-unit)
  const multipliers: Record<string, number> = {
    s: 2, // small
    default: 4, // normal (base)
    x: 6, // extra
    l: 8, // large
  }

  // 2. 方向映射表
  const directions: Record<string, string[]> = {
    t: ['-top'],
    b: ['-bottom'],
    l: ['-left'],
    r: ['-right'],
    x: ['-left', '-right'],
    y: ['-top', '-bottom'],
    default: [], // all sides
  }

  const rules: Rule[] = []

  // --- A. 内边距 (Padding) ---
  // 匹配：p-padding, pt-padding, px-paddings ...
  rules.push([
    /^p([tblxy])?-padding(s|x|l)?$/,
    ([, dir, size]) => {
      const m = multipliers[size || 'default']
      const props = directions[dir || 'default']

      if (props.length === 0) return { padding: `calc(var(--spacing-unit) * ${m})` }

      const styles: Record<string, string> = {}
      props.forEach(p => {
        styles[`padding${p}`] = `calc(var(--spacing-unit) * ${m})`
      })
      return styles
    },
  ])

  // --- B. 外边距 (Margin) ---
  // 匹配：m-gap, mt-gap, mx-gaps ... (同时支持 m-margin 别名)
  rules.push([
    /^m([tblxy])?-(?:gap|margin)(s|x|l)?$/,
    ([, dir, size]) => {
      const m = multipliers[size || 'default']
      const props = directions[dir || 'default']

      if (props.length === 0) return { margin: `calc(var(--spacing-unit) * ${m})` }

      const styles: Record<string, string> = {}
      props.forEach(p => {
        styles[`margin${p}`] = `calc(var(--spacing-unit) * ${m})`
      })
      return styles
    },
  ])

  // --- C. 间隙 (Gap) ---
  // 匹配：gap-unit, gap-x-unit, gap-y-units ...
  rules.push([
    /^gap-([xy]-)?unit(s|x|l)?$/,
    ([, dirStr, size]) => {
      const m = multipliers[size || 'default']
      // gap-x-unit -> dirStr='x-' -> dir='x'
      const dir = dirStr ? dirStr.replace('-', '') : 'default'

      if (dir === 'default') return { gap: `calc(var(--spacing-unit) * ${m})` }
      if (dir === 'x') return { 'column-gap': `calc(var(--spacing-unit) * ${m})` }
      if (dir === 'y') return { 'row-gap': `calc(var(--spacing-unit) * ${m})` }
      return undefined
    },
  ])

  // --- D. 字体大小 ---
  rules.push([
    /^fs-appFontSize(s|x|l)?$/,
    ([, suffix]) => {
      const map: Record<string, string> = {
        s: '0.875rem',
        default: '1rem',
        x: '1.25rem',
        l: '1.5rem',
      }
      return { 'font-size': map[suffix || 'default'] }
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

/** 阶梯规则生成器 (字体与间距 xs-5xl) */
function createScaleRules(): Rule[] {
  const scaleSizes = '(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl)'

  // 字体阶梯: fs-xs, fs-5xl
  const fontRule: Rule = [
    new RegExp(`^fs-${scaleSizes}$`),
    ([, size]: string[]) => ({ 'font-size': `var(--font-size-${size})` }),
  ]

  // 间距阶梯 (带方向): p-scale-xl, mt-scale-xs, gap-scale-md
  const paddingMarginRule: Rule = [
    new RegExp(`^([pm])([tblxy])?-scale-${scaleSizes}$`),
    ([, type, dir, size]: string[]) => {
      const prop = type === 'p' ? 'padding' : 'margin'
      const dirMap: Record<string, string[]> = {
        t: ['-top'],
        b: ['-bottom'],
        l: ['-left'],
        r: ['-right'],
        x: ['-left', '-right'],
        y: ['-top', '-bottom'],
      }
      const suffixes = dir ? dirMap[dir] : ['']
      const out: Record<string, string> = {}
      suffixes.forEach(s => {
        out[`${prop}${s}`] = `var(--spacing-${size})`
      })
      return out
    },
  ]

  // Gap 阶梯: gap-scale-xl, gap-x-scale-md
  const gapRule: Rule = [
    new RegExp(`^gap-([xy]-)?scale-${scaleSizes}$`),
    ([, dirStr, size]: string[]) => {
      const v = `var(--spacing-${size})`
      if (!dirStr) return { gap: v }
      if (dirStr.startsWith('x')) return { 'column-gap': v }
      return { 'row-gap': v }
    },
  ]

  return [fontRule, paddingMarginRule, gapRule]
}

/** 像素级万能规则 (所有数值自动转 px) */
function createPixelRules(): Rule[] {
  const properties = [
    ['w', 'width'],
    ['h', 'height'],
    ['min-w', 'min-width'],
    ['max-w', 'max-width'],
    ['min-h', 'min-height'],
    ['max-h', 'max-height'],
    ['fs', 'font-size'],
    ['lh', 'line-height'],
    ['p', 'padding'],
    ['pt', 'padding-top'],
    ['pb', 'padding-bottom'],
    ['pl', 'padding-left'],
    ['pr', 'padding-right'],
    ['m', 'margin'],
    ['mt', 'margin-top'],
    ['mb', 'margin-bottom'],
    ['ml', 'margin-left'],
    ['mr', 'margin-right'],
    ['t', 'top'],
    ['b', 'bottom'],
    ['l', 'left'],
    ['r', 'right'],
    ['gap', 'gap'],
    ['rounded', 'border-radius'],
    ['border', 'border-width'],
  ] as const

  const combined: readonly [string, string[]][] = [
    ['px', ['padding-left', 'padding-right']],
    ['py', ['padding-top', 'padding-bottom']],
    ['mx', ['margin-left', 'margin-right']],
    ['my', ['margin-top', 'margin-bottom']],
  ]

  const rules: Rule[] = []

  // 单属性映射
  properties.forEach(([prefix, property]) => {
    rules.push([new RegExp(`^${prefix}-(\\d+)$`), ([, d]: string[]) => ({ [property]: `${d}px` })])
  })

  // 组合属性映射 (px-*, py-*)
  combined.forEach(([prefix, props]) => {
    rules.push([
      new RegExp(`^${prefix}-(\\d+)$`),
      ([, d]: string[]) => Object.fromEntries(props.map(prop => [prop, `${d}px`])),
    ])
  })

  return rules
}

// ----------------------------------------------------------------------
// 3. 配置主体
// ----------------------------------------------------------------------

const iconCollections = getPresetIconsCollections()

/** Theme 示例页动态类名 safelist */
const themeDemoSafelist = [
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
  'text-primary-foreground',
  'text-primary-light-foreground',
  'text-secondary-foreground',
  'text-muted-foreground',
  'text-accent-foreground',
  'text-accent-light-foreground',
  'text-destructive-foreground',
  'text-destructive-light-foreground',
  'text-warn-foreground',
  'text-warn-light-foreground',
  'text-success-foreground',
  'text-success-light-foreground',
  'text-card-foreground',
  'bg-sidebar',
  'bg-sidebar-primary',
  'bg-sidebar-accent',
  'text-sidebar-foreground',
  'text-sidebar-primary-foreground',
  'text-sidebar-accent-foreground',
  'border-sidebar-border',
  'bg-destructive/10',
  'bg-primary/5',
  'hover:bg-sidebar-accent/50',
  'text-primary',
  'border-destructive/50',
  'border-primary/20',
  ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => `bg-primary/${v}`),
  // 尺寸系统阶梯类名 (动态类名需要 safelist)
  'fs-xs',
  'fs-sm',
  'fs-md',
  'fs-lg',
  'fs-xl',
  'fs-2xl',
  'fs-3xl',
  'fs-4xl',
  'fs-5xl',
  // Padding 阶梯
  'p-scale-xs',
  'p-scale-sm',
  'p-scale-md',
  'p-scale-lg',
  'p-scale-xl',
  'p-scale-2xl',
  'p-scale-3xl',
  'p-scale-4xl',
  'p-scale-5xl',
  'pt-scale-md',
  'pb-scale-lg',
  'pl-scale-sm',
  'pr-scale-xl',
  'px-scale-2xl',
  'py-scale-3xl',
  // Margin 阶梯
  'm-scale-xs',
  'm-scale-sm',
  'm-scale-md',
  'm-scale-lg',
  'm-scale-xl',
  'm-scale-2xl',
  'm-scale-3xl',
  'm-scale-4xl',
  'm-scale-5xl',
  'mt-scale-xs',
  'mt-scale-sm',
  'mt-scale-md',
  'mt-scale-lg',
  'mt-scale-xl',
  'mt-scale-2xl',
  'mt-scale-3xl',
  'mt-scale-4xl',
  'mt-scale-5xl',
  'mb-scale-xs',
  'mb-scale-sm',
  'mb-scale-md',
  'mb-scale-lg',
  'mb-scale-xl',
  'mb-scale-2xl',
  'mb-scale-3xl',
  'mb-scale-4xl',
  'mb-scale-5xl',
  'ml-scale-xs',
  'ml-scale-sm',
  'ml-scale-md',
  'ml-scale-lg',
  'ml-scale-xl',
  'ml-scale-2xl',
  'ml-scale-3xl',
  'ml-scale-4xl',
  'ml-scale-5xl',
  'mr-scale-xs',
  'mr-scale-sm',
  'mr-scale-md',
  'mr-scale-lg',
  'mr-scale-xl',
  'mr-scale-2xl',
  'mr-scale-3xl',
  'mr-scale-4xl',
  'mr-scale-5xl',
  'mx-scale-xs',
  'mx-scale-sm',
  'mx-scale-md',
  'mx-scale-lg',
  'mx-scale-xl',
  'mx-scale-2xl',
  'mx-scale-3xl',
  'mx-scale-4xl',
  'mx-scale-5xl',
  'my-scale-xs',
  'my-scale-sm',
  'my-scale-md',
  'my-scale-lg',
  'my-scale-xl',
  'my-scale-2xl',
  'my-scale-3xl',
  'my-scale-4xl',
  'my-scale-5xl',
  // Gap 阶梯
  'gap-scale-xs',
  'gap-scale-sm',
  'gap-scale-md',
  'gap-scale-lg',
  'gap-scale-xl',
  'gap-scale-2xl',
  'gap-scale-3xl',
  'gap-scale-4xl',
  'gap-scale-5xl',
  'gap-x-scale-md',
  'gap-y-scale-lg',
]

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

  transformers: [transformerDirectives(), transformerVariantGroup()],

  shortcuts: {
    full: 'w-full h-full',
    container: 'full bg-background text-foreground',
    screen: 'min-h-screen',
    center: 'flex items-center justify-center',
    'center-col': 'flex flex-col items-center justify-center',
    between: 'flex items-center justify-between',
    'text-ellipsis': 'text-ellipsis overflow-hidden whitespace-nowrap',

    // 组件快捷方式 (自动联动 SizeStore)
    'c-card':
      'center gap-unit p-padding rounded-lg bg-card text-card-foreground border border-border shadow-sm transition-all duration-300',
    'c-card-hover': 'hover:shadow-md hover:border-primary/50',
    'c-cp': 'cursor-pointer',
    'c-transition': 'transition-all duration-300 ease-in-out',
  },

  rules: [
    ...createSemanticSizeRules(), // 优先级高：语义化尺寸 (p-padding)
    ...createLayoutVariableRules(), // 优先级中：布局变量 (w-sidebarWidth)
    ...createScaleRules(), // 优先级中：阶梯尺寸 (fs-xl, p-scale-lg)
    ...createPixelRules(), // 优先级低：像素兜底 (w-20)

    // 安全区域
    ['safe-top', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['safe-bottom', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],

  theme: {
    breakpoints,
    // 颜色系统 (Shadcn RGB 规范)
    colors: {
      border: 'rgb(var(--border) / <alpha-value>)',
      input: 'rgb(var(--input) / <alpha-value>)',
      ring: 'rgb(var(--ring) / <alpha-value>)',
      background: 'rgb(var(--background) / <alpha-value>)',
      foreground: 'rgb(var(--foreground) / <alpha-value>)',
      primary: {
        DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
        foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        hover: 'rgb(var(--primary-hover) / <alpha-value>)',
        light: 'rgb(var(--primary-light) / <alpha-value>)',
        'light-foreground': 'rgb(var(--primary-light-foreground) / <alpha-value>)',
      },
      secondary: {
        DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
        foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
      },
      muted: {
        DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
        foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
      },
      accent: {
        DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
        foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        hover: 'rgb(var(--accent-hover) / <alpha-value>)',
        light: 'rgb(var(--accent-light) / <alpha-value>)',
        'light-foreground': 'rgb(var(--accent-light-foreground) / <alpha-value>)',
      },
      destructive: {
        DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
        foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        hover: 'rgb(var(--destructive-hover) / <alpha-value>)',
        light: 'rgb(var(--destructive-light) / <alpha-value>)',
        'light-foreground': 'rgb(var(--destructive-light-foreground) / <alpha-value>)',
      },
      warn: {
        DEFAULT: 'rgb(var(--warn) / <alpha-value>)',
        foreground: 'rgb(var(--warn-foreground) / <alpha-value>)',
        hover: 'rgb(var(--warn-hover) / <alpha-value>)',
        light: 'rgb(var(--warn-light) / <alpha-value>)',
        'light-foreground': 'rgb(var(--warn-light-foreground) / <alpha-value>)',
      },
      success: {
        DEFAULT: 'rgb(var(--success) / <alpha-value>)',
        foreground: 'rgb(var(--success-foreground) / <alpha-value>)',
        hover: 'rgb(var(--success-hover) / <alpha-value>)',
        light: 'rgb(var(--success-light) / <alpha-value>)',
        'light-foreground': 'rgb(var(--success-light-foreground) / <alpha-value>)',
      },
      card: {
        DEFAULT: 'rgb(var(--card) / <alpha-value>)',
        foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
      },
      popover: {
        DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
        foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
      },
      sidebar: {
        DEFAULT: 'rgb(var(--sidebar-background) / <alpha-value>)',
        foreground: 'rgb(var(--sidebar-foreground) / <alpha-value>)',
        primary: 'rgb(var(--sidebar-primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--sidebar-primary-foreground) / <alpha-value>)',
        accent: 'rgb(var(--sidebar-accent) / <alpha-value>)',
        border: 'rgb(var(--sidebar-border) / <alpha-value>)',
      },
    },
    // 圆角系统 (自动联动 SizeStore)
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
    // 间距基数 (提供给 grid/flex 等标准工具使用)
    spacing: {
      unit: 'var(--spacing-unit)',
    },
  },
})
