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
import { theme } from './src/design-engine/theme'
import { getEngineSafelist, getPresetIconsCollections } from './src/design-engine/safelist'
import { rules as designEngineRules, shortcuts } from './src/design-engine'
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
//   → var(--spacing-*)。业务组件只允许使用此类，禁止直接使用 p-{scale}。gap 仅支持 gap-* / gap-x-* / gap-y-*，不再使用 gap-gap-*。
// 阶梯尺寸（Token 级）：fs-{scale} / p-* / m-* / gap-* / rounded-* / duration-*
//   → 对应 CSS 变量。与语义尺寸二选一，shortcuts 内部可用。
// 布局变量：w-* / h-* / min-w-* / max-w-* / min-h-* / max-h-* 仅当 * 属于 LAYOUT_DIMENSION_KEYS 生效；新增 key 时勿与 presetUno 保留字冲突（如 full/screen），否则会覆盖默认 w-full 等行为。
// 基础变量：p-* / px-* / py-* 等仅当 * 属于 SIZE_BASE_VAR_KEYS 的 kebab 形式生效。
// SSOT：sizeScale.ts | size.ts | breakpoints.ts | src/utils/theme/metadata.ts
// AI：业务层推荐只使用 shortcuts；spacing 推荐 p-padding-* / m-margin-* / gap-*，不直接使用 p-{scale}。

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
      new RegExp(`^p(?<dir>[tblrxy])?-padding-(?<size>${scalePattern})(!)?$`),
      (match: RegExpMatchArray) => {
        const { dir, size } = (match.groups ?? {}) as { dir?: string; size: string }
        return applyDirection('padding', dir, `var(--spacing-${size})`, 'all')
      },
    ],
    [
      new RegExp(`^m(?<dir>[tblrxy])?-margin-(?<size>${scalePattern})(!)?$`),
      (match: RegExpMatchArray) => {
        const { dir, size } = (match.groups ?? {}) as { dir?: string; size: string }
        return applyDirection('margin', dir, `var(--spacing-${size})`, 'all')
      },
    ],
    [
      new RegExp(`^gap(?<axisGroup>-(?<axis>x|y))?-(?<size>${scalePattern})(!)?$`),
      (match: RegExpMatchArray) => {
        const { axis, size } = (match.groups ?? {}) as { axis?: string; size: string }
        const v = `var(--spacing-${size})`
        if (!axis) return { gap: v }
        if (axis === 'x') return { 'column-gap': v }
        return { 'row-gap': v }
      },
    ],
    [
      new RegExp(`^scroll-m(?<dir>[tblrxy])?-gap-(?<size>${scalePattern})(!)?$`),
      (match: RegExpMatchArray) => {
        const { dir, size } = (match.groups ?? {}) as { dir?: string; size: string }
        return applyDirection('scroll-margin', dir, `var(--spacing-${size})`, 'all')
      },
    ],
    [
      new RegExp(`^m(?<dir>[tblrxy])?-gap-(?<size>${scalePattern})(!)?$`),
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
    new RegExp(`^${prefix}-(${layoutKeys})(!)?$`),
    ([, name]: string[]) => {
      const cssVarName = `var(--${toKebab(name)})`
      return { [cssProperty]: cssVarName }
    },
  ])
}

/** 阶梯规则生成器 (字体、间距、圆角、过渡 xs-5xl)，使用具名捕获组避免依赖捕获顺序 */
function createScaleRules(): Rule[] {
  const fontRule: Rule = [
    new RegExp(`^fs-(?<size>${scalePattern})(!)?$`),
    (match: RegExpMatchArray) => {
      const { size } = (match.groups ?? {}) as { size: string }
      return { 'font-size': `var(--font-size-${size})` }
    },
  ]

  const paddingMarginRule: Rule = [
    new RegExp(`^(?<type>[pm])(?<dir>[tblrxy])?-(?<size>${scalePattern})(!)?$`),
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
    new RegExp(`^gap(?<axisGroup>-(?<axis>x|y))?-(?<size>${scalePattern})(!)?$`),
    (match: RegExpMatchArray) => {
      const { axis, size } = (match.groups ?? {}) as { axis?: string; size: string }
      const v = `var(--spacing-${size})`
      if (!axis) return { gap: v }
      if (axis === 'x') return { 'column-gap': v }
      return { 'row-gap': v }
    },
  ]

  const roundedRule: Rule = [
    new RegExp(`^rounded-(?<size>${scalePattern})(!)?$`),
    (match: RegExpMatchArray) => {
      const { size } = (match.groups ?? {}) as { size: string }
      return { 'border-radius': `var(--radius-${size})` }
    },
  ]

  /** 方向性 rounded 规则：rounded-{dir}-{size} → 对应角的 border-radius */
  const ROUNDED_DIR_MAP: Record<string, string[]> = {
    t: ['border-top-left-radius', 'border-top-right-radius'],
    b: ['border-bottom-left-radius', 'border-bottom-right-radius'],
    l: ['border-top-left-radius', 'border-bottom-left-radius'],
    r: ['border-top-right-radius', 'border-bottom-right-radius'],
    tl: ['border-top-left-radius'],
    tr: ['border-top-right-radius'],
    bl: ['border-bottom-left-radius'],
    br: ['border-bottom-right-radius'],
  }

  const roundedDirRule: Rule = [
    new RegExp(`^rounded-(?<dir>tl|tr|bl|br|t|b|l|r)-(?<size>${scalePattern})(!)?$`),
    (match: RegExpMatchArray) => {
      const { dir, size } = (match.groups ?? {}) as { dir: string; size: string }
      const props: string[] = ROUNDED_DIR_MAP[dir] ?? []
      const value: string = `var(--radius-${size})`
      const result: Record<string, string> = {}
      for (const p of props) result[p] = value
      return result
    },
  ]

  const durationRule: Rule = [
    new RegExp(`^duration-(?<size>${scalePattern})(!)?$`),
    (match: RegExpMatchArray) => {
      const { size } = (match.groups ?? {}) as { size: string }
      return { 'transition-duration': `var(--transition-${size})` }
    },
  ]

  return [fontRule, paddingMarginRule, gapRule, roundedRule, roundedDirRule, durationRule]
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
    'bg-info/10'
  )

  // Explicitly add specific opacity layers only generated dynamically in the documentation loops
  list.push(
    ...COLOR_FAMILIES.quadFamilies.flatMap(family =>
      [5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90].map(v => `bg-${family}/${v}`)
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
      `p-${k}`,
      `m-${k}`,
      `gap-${k}`,
      `px-${k}`,
      `py-${k}`,
      `pl-${k}`,
      `pr-${k}`,
      `pt-${k}`,
      `pb-${k}`,
      `mx-${k}`,
      `my-${k}`,
      `ml-${k}`,
      `mr-${k}`,
      `mt-${k}`,
      `mb-${k}`,
      `gap-x-${k}`,
      `gap-y-${k}`,
      `text-${k}`,
      `rounded-${k}`,
      `rounded-t-${k}`,
      `rounded-b-${k}`,
      `rounded-l-${k}`,
      `rounded-r-${k}`,
      `rounded-tl-${k}`,
      `rounded-tr-${k}`,
      `rounded-bl-${k}`,
      `rounded-br-${k}`,
      `duration-${k}`,
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

  safelist: getEngineSafelist(isDemo),

  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/],
    },
  },

  transformers: [transformerDirectives(), transformerVariantGroup()],

  // 业务层推荐只使用 shortcuts，不直接拼原子类。
  // spacing 推荐 p-padding-* / m-margin-* / gap-*，禁止在业务中直接使用 p-{scale}。
  // Shortcuts 依赖规则：允许低层→高层（density/behavior/hover-* → layout-*/component-*）；严禁反向或形成环。
  shortcuts,

  // 规则优先级设计：UnoCSS 按顺序匹配，新规则必须归入对应分组。
  // ① 语义业务规则 > ② 布局变量 > ③ 设计系统阶梯 > ④ 基础变量 > ⑤ 安全区
  rules: [
    ['group', {}],
    ['safe-top', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['safe-bottom', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
    ...designEngineRules,
  ],

  theme,
})

// ---------------------------------------------------------------------------
// The following declarations remain in this file for now, but are no longer
// used by the runtime config after extracting logic into `uno.theme.ts` and
// `src/design-engine`. They are referenced to satisfy `noUnusedLocals` in tsconfig.node.json.
// ---------------------------------------------------------------------------
void breakpoints
void createSemanticSizeRules
void createLayoutVariableRules
void createScaleRules
void createBaseVarRules
void buildThemeDemoSafelist
void themeDemoSafelist
void buildThemeColors
void rgbVar
