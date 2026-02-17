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
import { LAYOUT_DIMENSION_KEYS, SIZE_BASE_VAR_KEYS } from './src/constants/size'
import { SIZE_SCALE_KEYS } from './src/constants/sizeScale'
import { COLOR_FAMILIES } from './src/utils/theme/metadata'

// 约束：上述 src 下被引用的文件必须为纯数据（仅导出常量/类型），禁止 import .vue 或使用 window/document 等浏览器 API，否则 Node 构建会报错。
/** 阶梯键模式 (xs|sm|...|5xl)，SSOT: SIZE_SCALE_KEYS；具名捕获用 (?<size>scalePattern)，避免依赖捕获顺序 */
const scalePattern = SIZE_SCALE_KEYS.join('|')

// ----------------------------------------------------------------------
// Design System Rule Map (SSOT 与分层职责)
// ----------------------------------------------------------------------
// 语义尺寸（业务推荐）：p-padding-{scale} / m-margin-{scale} / gap-{scale} / gap-x-{scale} / gap-y-{scale} / m-gap-* / scroll-m-gap-*
//   → var(--spacing-*)。业务组件只允许使用此类，禁止直接使用 p-scale-*。gap 仅支持 gap-* / gap-x-* / gap-y-*，不再使用 gap-gap-*。
// 阶梯尺寸（Token 级）：fs-{scale} / p-scale-* / m-scale-* / gap-scale-* / rounded-scale-* / duration-scale-*
//   → 对应 CSS 变量。与语义尺寸二选一，shortcuts 内部可用。
// 布局变量：w-* / h-* / min-w-* / max-w-* / min-h-* / max-h-* 仅当 * 属于 LAYOUT_DIMENSION_KEYS 生效；新增 key 时勿与 presetUno 保留字冲突（如 full/screen），否则会覆盖默认 w-full 等行为。
// 基础变量：p-* / px-* / py-* 等仅当 * 属于 SIZE_BASE_VAR_KEYS 的 kebab 形式生效。
// SSOT：sizeScale.ts | size.ts | breakpoints.ts | src/utils/theme/metadata.ts
// AI：业务层推荐只使用 shortcuts；spacing 推荐 p-padding-* / m-margin-* / gap-*，不直接使用 p-scale-*。

// ----------------------------------------------------------------------
// 1. 常量定义 (断点 SSOT: src/constants/breakpoints.ts)
// ----------------------------------------------------------------------
const breakpoints: Record<string, string> = Object.fromEntries(
  Object.entries(BREAKPOINTS).map(([k, v]) => [k, typeof v === 'number' ? `${v}px` : (v as string)])
)

/** 布局变量白名单 (SSOT: src/constants/size.ts LAYOUT_DIMENSION_KEYS) */
const LAYOUT_SIZES = [...LAYOUT_DIMENSION_KEYS] as const

// ----------------------------------------------------------------------
// 2. 动态规则生成引擎 (The Rule Engine)
// ----------------------------------------------------------------------

/** 方向后缀映射 (padding/margin/scale 共用)；无方向语义统一由此表表达 */
const DIR_SUFFIX_MAP: Record<string, string[]> = {
  t: ['-top'],
  b: ['-bottom'],
  l: ['-left'],
  r: ['-right'],
  x: ['-left', '-right'],
  y: ['-top', '-bottom'],
  all: [], // 语义规则“无方向” → 四边 (padding/margin)
  default: [''], // 阶梯规则“无方向” → 单属性 (padding/margin)
}

/** camelCase -> kebab-case，用于 CSS 变量名 */
const toKebab = (s: string) => s.replace(/([A-Z])/g, '-$1').toLowerCase()

/** 按方向 key 取后缀列表，defaultKey：语义用 'all'（四边），阶梯用 'default'（单属性） */
function getDirectionSuffixes(dir: string | undefined, defaultKey: 'all' | 'default'): string[] {
  return DIR_SUFFIX_MAP[dir || defaultKey]
}

/** 根据方向生成单属性或多边 CSS 对象，避免各 Rule 内重复 DIR_SUFFIX_MAP 逻辑 */
function applyDirection(
  prop: string,
  dir: string | undefined,
  value: string,
  defaultKey: 'all' | 'default'
): Record<string, string> {
  const suffixes = getDirectionSuffixes(dir, defaultKey)
  if (suffixes.length === 0) return { [prop]: value }
  const out: Record<string, string> = {}
  suffixes.forEach(s => {
    out[`${prop}${s}`] = value
  })
  return out
}

/**
 * 生成语义化尺寸规则 (SSOT: SIZE_SCALE_KEYS)，使用具名捕获组 (?<name>...) 避免依赖捕获顺序
 */
function createSemanticSizeRules(): Rule[] {
  return [
    [
      new RegExp(`^p(?<dir>[tblrxy])?-padding-(?<size>${scalePattern})$`),
      (match: RegExpMatchArray) => {
        const { dir, size } = (match.groups ?? {}) as { dir?: string; size: string }
        return applyDirection('padding', dir, `var(--spacing-${size})`, 'all')
      },
    ],
    [
      new RegExp(`^m(?<dir>[tblrxy])?-margin-(?<size>${scalePattern})$`),
      (match: RegExpMatchArray) => {
        const { dir, size } = (match.groups ?? {}) as { dir?: string; size: string }
        return applyDirection('margin', dir, `var(--spacing-${size})`, 'all')
      },
    ],
    [
      new RegExp(`^gap(?<axisGroup>-(?<axis>x|y))?-(?<size>${scalePattern})$`),
      (match: RegExpMatchArray) => {
        const { axis, size } = (match.groups ?? {}) as { axis?: string; size: string }
        const v = `var(--spacing-${size})`
        if (!axis) return { gap: v }
        if (axis === 'x') return { 'column-gap': v }
        return { 'row-gap': v }
      },
    ],
    [
      new RegExp(`^scroll-m(?<dir>[tblrxy])?-gap-(?<size>${scalePattern})$`),
      (match: RegExpMatchArray) => {
        const { dir, size } = (match.groups ?? {}) as { dir?: string; size: string }
        return applyDirection('scroll-margin', dir, `var(--spacing-${size})`, 'all')
      },
    ],
    [
      new RegExp(`^m(?<dir>[tblrxy])?-gap-(?<size>${scalePattern})$`),
      (match: RegExpMatchArray) => {
        const { dir, size } = (match.groups ?? {}) as { dir?: string; size: string }
        return applyDirection('margin', dir, `var(--spacing-${size})`, 'all')
      },
    ],
  ]
}

/** 布局变量自动映射规则（仅白名单 LAYOUT_SIZES；key 不得与 presetUno 保留类名如 full/screen 重合，见 size.ts 注释） */
function createLayoutVariableRules(): Rule[] {
  const properties = [
    ['w', 'width'],
    ['h', 'height'],
    ['min-w', 'min-width'],
    ['max-w', 'max-width'],
    ['min-h', 'min-height'],
    ['max-h', 'max-height'],
  ] as const
  const layoutKeys = (LAYOUT_SIZES as readonly string[]).join('|')

  return properties.map(([prefix, cssProperty]) => [
    new RegExp(`^${prefix}-(${layoutKeys})$`),
    ([, name]: string[]) => {
      const cssVarName = `var(--${toKebab(name)})`
      return { [cssProperty]: cssVarName }
    },
  ])
}

/** 阶梯规则生成器 (字体、间距、圆角、过渡 xs-5xl)，使用具名捕获组避免依赖捕获顺序 */
function createScaleRules(): Rule[] {
  const fontRule: Rule = [
    new RegExp(`^fs-(?<size>${scalePattern})$`),
    (match: RegExpMatchArray) => {
      const { size } = (match.groups ?? {}) as { size: string }
      return { 'font-size': `var(--font-size-${size})` }
    },
  ]

  const paddingMarginRule: Rule = [
    new RegExp(`^(?<type>[pm])(?<dir>[tblrxy])?-scale-(?<size>${scalePattern})$`),
    (match: RegExpMatchArray) => {
      const { type, dir, size } = (match.groups ?? {}) as {
        type: string
        dir?: string
        size: string
      }
      const prop = type === 'p' ? 'padding' : 'margin'
      return applyDirection(prop, dir, `var(--spacing-${size})`, 'default')
    },
  ]

  const gapRule: Rule = [
    new RegExp(`^gap(?<axisGroup>-(?<axis>x|y))?-scale-(?<size>${scalePattern})$`),
    (match: RegExpMatchArray) => {
      const { axis, size } = (match.groups ?? {}) as { axis?: string; size: string }
      const v = `var(--spacing-${size})`
      if (!axis) return { gap: v }
      if (axis === 'x') return { 'column-gap': v }
      return { 'row-gap': v }
    },
  ]

  const roundedRule: Rule = [
    new RegExp(`^rounded-scale-(?<size>${scalePattern})$`),
    (match: RegExpMatchArray) => {
      const { size } = (match.groups ?? {}) as { size: string }
      return { 'border-radius': `var(--radius-${size})` }
    },
  ]

  const durationRule: Rule = [
    new RegExp(`^duration-scale-(?<size>${scalePattern})$`),
    (match: RegExpMatchArray) => {
      const { size } = (match.groups ?? {}) as { size: string }
      return { 'transition-duration': `var(--transition-${size})` }
    },
  ]

  return [fontRule, paddingMarginRule, gapRule, roundedRule, durationRule]
}

/** 从 SIZE_BASE_VAR_KEYS 生成基础变量规则 (SSOT: constants/size.ts) */
function createBaseVarRules(): Rule[] {
  const rules: Rule[] = []
  for (const key of SIZE_BASE_VAR_KEYS) {
    const cssVar = `var(--${toKebab(key)})`
    rules.push([`p-${toKebab(key)}`, { padding: cssVar }])
    rules.push([`px-${toKebab(key)}`, { 'padding-left': cssVar, 'padding-right': cssVar }])
    rules.push([`py-${toKebab(key)}`, { 'padding-top': cssVar, 'padding-bottom': cssVar }])
    rules.push([`pt-${toKebab(key)}`, { 'padding-top': cssVar }])
    rules.push([`pb-${toKebab(key)}`, { 'padding-bottom': cssVar }])
    rules.push([`pl-${toKebab(key)}`, { 'padding-left': cssVar }])
    rules.push([`pr-${toKebab(key)}`, { 'padding-right': cssVar }])
  }
  return rules
}

// ----------------------------------------------------------------------
// 3. 配置主体
// ----------------------------------------------------------------------

const iconCollections = getPresetIconsCollections()

/** Theme 示例页动态类名 safelist (SSOT: COLOR_FAMILIES, SIZE_SCALE_KEYS) */
function buildThemeDemoSafelist(): string[] {
  const list: string[] = []

  // ====== 配色类（从 COLOR_FAMILIES 动态生成） ======
  for (const token of COLOR_FAMILIES.singleTokens) {
    list.push(`bg-${token}`, `text-${token}`)
    if (['border', 'input', 'ring'].includes(token)) list.push(`border-${token}`)
  }
  for (const family of COLOR_FAMILIES.pairFamilies) {
    list.push(`bg-${family}`, `text-${family}-foreground`, `border-${family}`)
  }
  // quadFamilies: *-light 用于 PrimeVue Button text/outlined 变体 hover 背景，详见 docs/PRIMEVUE_THEME.md
  for (const family of COLOR_FAMILIES.quadFamilies) {
    list.push(
      `bg-${family}`,
      `bg-${family}-hover`,
      `bg-${family}-light`,
      `text-${family}`,
      `text-${family}-foreground`,
      `text-${family}-hover-foreground`,
      `text-${family}-light-foreground`,
      `border-${family}`,
      `border-${family}-hover`,
      `border-${family}-light`
    )
  }
  const sidebarKeys = Object.keys(COLOR_FAMILIES.sidebar) as (keyof typeof COLOR_FAMILIES.sidebar)[]
  for (const key of sidebarKeys) {
    const varName = COLOR_FAMILIES.sidebar[key]
    list.push(`bg-${varName}`, `text-${varName}`)
    if (key === 'border' || key === 'ring') list.push(`border-${varName}`)
  }
  list.push(
    'border-danger/50',
    'border-primary/20',
    'border-primary/30',
    'border-primary/50',
    'dark:bg-primary-light',
    'dark:border-primary/50',
    'bg-info/10',
    ...COLOR_FAMILIES.quadFamilies.flatMap(family =>
      [10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => `bg-${family}/${v}`)
    )
  )

  // ====== 基础变量类 (SIZE_BASE_VAR_KEYS) ======
  for (const key of SIZE_BASE_VAR_KEYS) {
    const kebab = toKebab(key)
    list.push(
      `p-${kebab}`,
      `px-${kebab}`,
      `py-${kebab}`,
      `pt-${kebab}`,
      `pb-${kebab}`,
      `pl-${kebab}`,
      `pr-${kebab}`
    )
  }

  // ====== 尺寸阶梯类 + 语义 gap（gap-* / gap-x-* / gap-y-*） ======
  list.push(
    ...SIZE_SCALE_KEYS.flatMap(k => [
      `fs-${k}`,
      `gap-${k}`,
      `gap-x-${k}`,
      `gap-y-${k}`,
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
      `gap-x-scale-${k}`,
      `gap-y-scale-${k}`,
      `text-${k}`,
      `rounded-scale-${k}`,
      `duration-scale-${k}`,
      // margin + spacing 语义化类
      `m-gap-${k}`,
      `mx-gap-${k}`,
      `my-gap-${k}`,
      `mt-gap-${k}`,
      `mb-gap-${k}`,
      `ml-gap-${k}`,
      `mr-gap-${k}`,
      // scroll-margin + spacing 语义化类
      `scroll-m-gap-${k}`,
      `scroll-mx-gap-${k}`,
      `scroll-my-gap-${k}`,
      `scroll-mt-gap-${k}`,
      `scroll-mb-gap-${k}`,
      `scroll-ml-gap-${k}`,
      `scroll-mr-gap-${k}`,
    ])
  )

  // ====== 主题切换动画图标 (Transition Effect) ======
  list.push(
    'i-lucide-circle-dot',
    'i-lucide-panel-left',
    'i-lucide-diamond',
    'i-lucide-sun-moon',
    'i-lucide-sparkles',
    'i-lucide-minimize-2'
  )

  // ====== PrimeVue 组件悬停态（Button text/outlined 使用 *-light 作为 hover 背景） ======
  list.push(
    'hover:bg-sidebar-accent/50',
    'hover:bg-danger-light',
    'hover:bg-primary-light',
    'hover:bg-success-light',
    'hover:bg-info-light',
    'hover:bg-warn-light',
    'hover:bg-help-light',
    'bg-danger/10',
    'bg-primary/5',
    'bg-info/10'
  )

  return list
}

const themeDemoSafelist = buildThemeDemoSafelist()

/** 生产环境仅保留必要动态类；日常 dev 不加 themeDemoSafelist，避免冷启动变慢 */
const isProd = process.env.NODE_ENV === 'production'
/** 仅需跑主题/配色 demo 页时设为 true（如 UNO_DEMO=true pnpm dev），此时才合并 themeDemoSafelist */
const isDemo = process.env.UNO_DEMO === 'true'

// ----------------------------------------------------------------------
// 4. 颜色系统动态映射 (与 ThemeEngine / COLOR_FAMILIES 对齐)
// ----------------------------------------------------------------------

const rgbVar = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

type ThemeColorValue = string | Record<string, string>

function buildThemeColors(): Record<string, ThemeColorValue> {
  const colors: Record<string, ThemeColorValue> = {}

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
  // light 用于 PrimeVue Button text/outlined 变体 hover 背景，详见 docs/PRIMEVUE_THEME.md
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

  safelist: isProd
    ? getDynamicSafelist()
    : isDemo
      ? [...getDynamicSafelist(), ...themeDemoSafelist]
      : getDynamicSafelist(),

  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/],
    },
  },

  transformers: [transformerDirectives(), transformerVariantGroup()],

  // 业务层推荐只使用 shortcuts，不直接拼原子类。
  // spacing 推荐 p-padding-* / m-margin-* / gap-*，禁止在业务中直接使用 p-scale-*。
  // Shortcuts 依赖规则：允许低层→高层（density/behavior/hover-* → layout-*/component-*）；严禁反向或形成环。
  shortcuts: {
    // =========================================================
    // ① 密度语义（Density Token，便于紧凑/舒适/宽松模式切换）
    // =========================================================
    'density-compact': 'gap-sm p-padding-sm',
    'density-normal': 'gap-md p-padding-md',
    'density-comfortable': 'gap-lg p-padding-lg',
    'density-responsive': 'density-compact md:density-normal',

    // =========================================================
    // ② Flex 布局基础（方向即含义；使用 main-* / cross-* 时须显式配合 row 或 column）
    // =========================================================
    center: 'flex justify-center items-center',
    row: 'flex flex-row',
    column: 'flex flex-col',
    'flex-row': 'flex flex-row',
    'flex-col': 'flex flex-col',
    'flex-wrap': 'flex flex-wrap',
    'flex-nowrap': 'flex flex-nowrap',

    // =========================================================
    // ② Flex 主轴对齐（控制 justify-content）
    // 说明：主轴 = flex-direction 方向
    // =========================================================
    'main-start': 'justify-start',
    'main-center': 'justify-center',
    'main-end': 'justify-end',
    'main-between': 'justify-between',
    'main-around': 'justify-around',
    'main-evenly': 'justify-evenly',

    // =========================================================
    // ③ Flex 交叉轴对齐（控制 align-items）
    // 说明：交叉轴 = 与主轴垂直方向
    // =========================================================
    'cross-start': 'items-start',
    'cross-center': 'items-center',
    'cross-end': 'items-end',
    'cross-stretch': 'items-stretch',

    // =========================================================
    // ④ 高频语义化 Flex 组合（只保留最常用场景）
    // =========================================================
    'row-center': 'flex flex-row items-center justify-center',
    'row-between': 'flex flex-row items-center justify-between',
    'row-start': 'flex flex-row items-start justify-start',
    'column-center': 'flex flex-col items-center justify-center',
    'column-between': 'flex flex-col justify-between',

    // =========================================================
    // ⑤ 布局结构类（Layout Patterns）
    // 说明：用于整体结构、容器、定位等“空间结构语义”
    // =========================================================
    'layout-full': 'w-full h-full',
    'layout-screen': 'w-screen h-screen',
    'layout-container': 'bg-background text-foreground',
    'layout-stack': 'flex flex-col density-normal',
    'layout-wrap': 'flex flex-wrap density-normal',
    'layout-grid-center': 'grid place-items-center',
    'layout-absolute-center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',

    // =========================================================
    // ⑥ 文本与排版工具类（Typography Utilities）
    // 说明：文本展示、溢出、省略等
    // =========================================================
    'text-single-line-ellipsis': 'overflow-hidden whitespace-nowrap text-ellipsis',
    'text-two-line-ellipsis': 'line-clamp-2 overflow-hidden',
    'text-muted': 'text-muted-foreground',
    'text-secondary': 'text-secondary-foreground',

    // =========================================================
    // ⑦ 交互行为类（Interaction Patterns）
    // 说明：行为与风格解耦，便于统一调整 hover/focus 策略
    // =========================================================
    'behavior-hover-transition': 'transition-all duration-scale-md',
    'hover-elevated': 'hover:shadow-md hover:border-primary/50',
    'interactive-hover': 'behavior-hover-transition hover-elevated',
    'interactive-click':
      'cursor-pointer select-none active:scale-95 transition-transform duration-scale-xs',
    'interactive-focus-ring': 'focus:outline-none focus:ring-2 focus:ring-primary/50',

    // =========================================================
    // ⑧a 边框快捷类（Border Shortcuts）
    // 说明：仅设 border-width + border-color 不设 border-style 会导致边框不显示，
    //       此处统一为 1px solid + 语义色，业务层优先使用此类，避免漏写 border-solid。
    // =========================================================
    'component-border': 'border border-solid border-border',
    'border-b-default': 'border-b border-solid border-border',
    'border-t-default': 'border-t border-solid border-border',

    // =========================================================
    // ⑧ 组件语义基础（Component Base Styles）
    // 说明：设计系统中的基础组件语义；卡片边框使用 component-border 保证可见。
    // =========================================================
    'component-card-base':
      'rounded-scale-md bg-card text-card-foreground component-border shadow-sm',
    'component-card-hoverable': 'behavior-hover-transition hover-elevated',
    'component-card-layout': 'density-normal',
    'component-card-content': 'row-center',
    'component-card':
      'component-card-base component-card-hoverable component-card-layout component-card-content',

    // =========================================================
    // ⑨ 尺寸与视觉工具类（Size & Visual Utilities）
    // 说明：无对应 w-* / min-w-* 语义类，故用任意值引用 spacing 变量
    // =========================================================
    'size-theme-swatch': 'w-[var(--spacing-lg)] h-[var(--spacing-lg)] rounded-full',
    'size-select-min': 'min-w-[var(--spacing-3xl)]',
    'sidebar-width-transition': 'transition-[width] duration-scale-lg ease-in-out',

    // =========================================================
    // ⑩ 设计系统默认等级（Design Token Defaults）
    // 说明：与业务推荐一致，使用语义类 p-padding-* / m-margin-* / gap-*
    // =========================================================
    'default-rounded': 'rounded-scale-md',
    'default-duration': 'duration-scale-md',
    'default-padding': 'p-padding-md',
    'default-margin': 'm-margin-md',
    'default-gap': 'gap-md',
    'default-font-size': 'fs-md',
  },

  // 规则优先级设计：UnoCSS 按顺序匹配，新规则必须归入对应分组。
  // ① 语义业务规则 > ② 布局变量 > ③ 设计系统阶梯 > ④ 基础变量 > ⑤ 安全区
  rules: [
    // ====== ① 业务语义规则（最高优先级） ======
    ...createSemanticSizeRules(),
    // ====== ② 布局变量规则 ======
    ...createLayoutVariableRules(),
    // ====== ③ 设计系统阶梯规则 ======
    ...createScaleRules(),
    // ====== ④ 基础尺寸变量（最低优先级） ======
    ...createBaseVarRules(),
    // ====== ⑤ 安全区规则 ======
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
      const lineHeightMap: Record<string, string> = {
        xs: '1',
        sm: '1.25',
        md: '1.5',
        lg: '1.75',
        xl: '1.75',
        ['2xl']: '2',
        ['3xl']: '2.25',
        ['4xl']: '2.5',
        ['5xl']: '1',
      }
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
