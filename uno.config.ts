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

/** 与 shortcuts 中 `ease-spring` 对齐（Uno 从 `theme.easing` 解析） */
const themeResolved = {
  ...theme,
  easing: {
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as typeof theme & { easing: { spring: string } }
import { shortcuts } from './src/design-engine'
import { BREAKPOINTS } from './src/constants/breakpoints'
import { LAYOUT_DIMENSION_KEYS, SIZE_BASE_VAR_KEYS } from './src/constants/size'
import { SIZE_SCALE_KEYS } from './src/constants/sizeScale'

// 约束：上述 src 下被引用的文件必须为纯数据（仅导出常量/类型），禁止 import .vue 或使用 window/document 等浏览器 API，否则 Node 构建会报错。
/** 阶梯键模式 (xs|sm|...|5xl)，SSOT: SIZE_SCALE_KEYS；具名捕获用 (?<size>scalePattern)，避免依赖捕获顺序 */
const scalePattern = SIZE_SCALE_KEYS.join('|')

// ----------------------------------------------------------------------
// Design System Rule Map (SSOT 与分层职责)
// ----------------------------------------------------------------------
// 运行时配置使用 presetUno + `theme`（见 `src/design-engine/theme`）：标准 Uno 工具类映射到 CSS 变量。
// Spacing：`p-*` / `m-*` / `gap-*` 等 → `var(--spacing-*)`（阶梯键见 SIZE_SCALE_KEYS）；颜色：`bg-*` / `text-*` → `theme.colors`（见 COLOR_FAMILIES）。
// 布局尺寸：`w-*` / `h-*` 等仅当 token 属于 LAYOUT_DIMENSION_KEYS 时映射到布局变量；新增 key 时勿与 presetUno 保留字冲突（如 full/screen）。
// 基础变量：`p-*` / `px-*` / `py-*` 等亦支持 SIZE_BASE_VAR_KEYS 的 kebab 形式（如 container-padding）。
// 具名 shortcuts 仅来自 `src/design-engine/shortcuts/semanticShortcuts.ts`；禁止臆造未在仓库中定义的「宏类名」。
// SSOT：sizeScale.ts | size.ts | breakpoints.ts | src/utils/theme/metadata.ts

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

// 颜色映射 SSOT：`src/design-engine/theme` + `theme/colors.ts` 的 `<alpha-value>` 占位符；下方合并 `easing.spring`。

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

  safelist: getEngineSafelist(),

  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]s|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/],
    },
  },

  transformers: [transformerDirectives(), transformerVariantGroup()],

  // 业务层：优先使用 `semanticShortcuts` 中的具名 shortcut + 标准 Uno 主题工具类（如 `p-md`、`gap-sm`、`bg-card`、`text-muted-foreground`）。
  // 禁止臆造未在 theme/shortcuts 中定义的类名；详见 `.cursor/rules/design-system/01-design-tokens.mdc`。
  shortcuts,

  // 规则优先级设计：UnoCSS 按顺序匹配，新规则必须归入对应分组。
  // ① 安全区（静态）其余 DSL 映射走 shortcuts（含动态快捷规则）
  rules: [
    ['group', {}],
    ['safe-top', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['safe-bottom', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],

  theme: themeResolved,
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
