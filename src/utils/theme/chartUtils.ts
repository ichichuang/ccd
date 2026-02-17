/**
 * 图表主题工具：与架构配色体系统一
 *
 * - 颜色一律从 ThemeCssVars（src/types/systems/theme.d.ts）对应的 :root CSS 变量解析，
 *   与 engine.ts、primevue-preset.ts 使用同一套 token；ECharts 需要 rgb(r,g,b)，
 *   故在此做「读 computedStyle → 规范化逗号格式」，而非 PrimeVue 的 rgb(var(--xxx))。
 * - 尺寸来自 SizeStore，与全局尺寸阶梯一致。
 */
import { useSizeStore } from '@/stores/modules/size'

/** ThemeCssVars 的 key 去掉 '--' 后的 token 名，与 engine / primevue-preset 一致 */
type ThemeCssVarName = keyof ThemeCssVars extends `--${infer T}` ? T : never

/**
 * 图表系统变量：颜色与 theme.d.ts ThemeCssVars 命名对齐（camelCase），尺寸来自 SizeStore
 */
export interface ChartSystemVariables {
  foreground: string
  mutedForeground: string
  background: string
  card: string
  border: string
  primary: string
  primaryForeground: string
  accent: string
  secondary: string
  success: string
  warn: string
  danger: string
  info: string
  help: string

  fontSize: number
  fontSizeSmall: number
  paddings: number
  gap: number
  gapl: number
}

/**
 * 图表尺寸 Tokens（与 SizeStore / 尺寸系统对齐）
 *
 * 说明：
 * - ECharts 大多接收 number(px) 的尺寸，本 tokens 层输出统一的 px number（或数组）。
 * - 仅用于「默认值补齐」：apply*Styles 中必须遵循 existing ?? token 的规则，禁止覆盖用户显式配置。
 * - 单一数据源：由当前 SizeMode（SizeStore.currentPreset）推导，切换 compact/comfortable/loose 时应同步变化。
 */
export interface ChartSizeTokens {
  // Inputs（便于调试与验收）
  spacingUnit: number
  fontMd: number
  /** 较大字号（用于标题等），由 fontMd 推导 */
  fontLg: number
  fontSm: number
  radiusMd: number
  /** 小号圆角（用于 handle/breadcrumb 等） */
  radiusSm: number

  // Typography
  lineHeightMd: number
  lineHeightLg: number
  lineHeightSm: number

  // Spacing
  padSm: number
  padMd: number
  padLg: number
  itemGapSm: number
  itemGapMd: number
  axisLabelMargin: number
  axisLabelPadding: number

  // Stroke widths
  strokeHairline: number
  strokeAxis: number
  strokeGrid: number
  strokeSeries: number

  // Symbols
  symbolSm: number
  symbolMd: number
  symbolLg: number

  // Axis ticks
  tickLen: number
  minorTickLen: number

  // Tooltip
  tooltipPadding: number
  tooltipRadius: number
  tooltipBorderWidth: number

  // Legend
  legendItemWidth: number
  legendItemHeight: number
  legendItemGap: number
  legendPadding: number

  // Toolbox
  toolboxItemSize: number
  toolboxItemGap: number

  // VisualMap
  visualMapItemWidth: number
  visualMapItemHeight: number
  visualMapItemGap: number
  visualMapPadding: number
  visualMapBorderWidth: number

  // DataZoom
  dataZoomHeight: number
  dataZoomBorderWidth: number
}

const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * 生成图表尺寸 Tokens（px）
 *
 * - spacingUnit 来自当前尺寸预设的 spacingBase（与 sizeEngine 注入的 --spacing-unit 等价）
 * - fontMd / fontSm 来自 SizeStore getters（与 --font-size-md / --font-size-sm 语义一致）
 */
export function getChartSizeTokens(): ChartSizeTokens {
  const sizeStore = useSizeStore()

  const spacingUnit = sizeStore.currentPreset.spacingBase
  const fontMd = sizeStore.getFontSizeValue
  const fontLg = Math.round(fontMd * 1.3)
  const fontSm = sizeStore.getFontSizeSmValue

  // 圆角：图表内部组件（tooltip 等）使用中号圆角语义；无需严格等同 rem，保持随 SizeMode 缩放即可
  const radiusMd = Math.round(spacingUnit * 1.5)
  const radiusSm = Math.round(spacingUnit * 1.0)

  const lineHeightMd = Math.round(fontMd * 1.4)
  const lineHeightLg = Math.round(fontLg * 1.4)
  const lineHeightSm = Math.round(fontSm * 1.35)

  const padSm = Math.round(spacingUnit * 1.5)
  const padMd = Math.round(spacingUnit * 2)
  const padLg = Math.round(spacingUnit * 3)

  const itemGapSm = Math.round(spacingUnit * 2)
  const itemGapMd = Math.round(spacingUnit * 3)

  const axisLabelMargin = Math.round(spacingUnit * 2)
  const axisLabelPadding = Math.round(spacingUnit * 1)

  const strokeHairline = clamp(1, Math.round(spacingUnit / 4), 2)
  const strokeAxis = clamp(1, Math.round(spacingUnit / 3), 2)
  const strokeGrid = clamp(1, Math.round(spacingUnit / 4), 2)
  const strokeSeries = clamp(2, Math.round(spacingUnit / 2), 4)

  const symbolSm = clamp(6, Math.round(spacingUnit * 2), 16)
  const symbolMd = clamp(8, Math.round(spacingUnit * 2.5), 20)
  const symbolLg = clamp(10, Math.round(spacingUnit * 3), 24)

  const tickLen = Math.round(spacingUnit * 1.5)
  const minorTickLen = Math.round(spacingUnit * 1.0)

  const tooltipPadding = Math.round(spacingUnit * 2)
  const tooltipRadius = radiusMd
  const tooltipBorderWidth = strokeHairline

  const legendItemWidth = Math.round(spacingUnit * 6)
  const legendItemHeight = Math.round(spacingUnit * 3.5)
  const legendItemGap = Math.round(spacingUnit * 2.5)
  const legendPadding = padSm

  const toolboxItemSize = Math.round(spacingUnit * 4)
  const toolboxItemGap = Math.round(spacingUnit * 2.5)

  const visualMapItemWidth = Math.round(spacingUnit * 5)
  const visualMapItemHeight = Math.round(spacingUnit * 3.5)
  const visualMapItemGap = Math.round(spacingUnit * 2.5)
  const visualMapPadding = padSm
  const visualMapBorderWidth = strokeHairline

  const dataZoomHeight = Math.round(spacingUnit * 6)
  const dataZoomBorderWidth = strokeHairline

  return {
    spacingUnit,
    fontMd,
    fontLg,
    fontSm,
    radiusMd,
    radiusSm,
    lineHeightMd,
    lineHeightLg,
    lineHeightSm,
    padSm,
    padMd,
    padLg,
    itemGapSm,
    itemGapMd,
    axisLabelMargin,
    axisLabelPadding,
    strokeHairline,
    strokeAxis,
    strokeGrid,
    strokeSeries,
    symbolSm,
    symbolMd,
    symbolLg,
    tickLen,
    minorTickLen,
    tooltipPadding,
    tooltipRadius,
    tooltipBorderWidth,
    legendItemWidth,
    legendItemHeight,
    legendItemGap,
    legendPadding,
    toolboxItemSize,
    toolboxItemGap,
    visualMapItemWidth,
    visualMapItemHeight,
    visualMapItemGap,
    visualMapPadding,
    visualMapBorderWidth,
    dataZoomHeight,
    dataZoomBorderWidth,
  }
}

/** 图表用到的 ThemeCssVars token 名（无 '--'），单一数据源与 theme.d.ts 一致 */
const CHART_THEME_TOKEN_NAMES: ThemeCssVarName[] = [
  'foreground',
  'muted-foreground',
  'background',
  'card',
  'border',
  'primary',
  'primary-foreground',
  'accent',
  'secondary',
  'success',
  'warn',
  'danger',
  'info',
  'help',
]

/** kebab-case → camelCase，用于 TS 对象 key */
function themeCssVarToCamel(
  token: ThemeCssVarName
): keyof Pick<
  ChartSystemVariables,
  | 'foreground'
  | 'mutedForeground'
  | 'background'
  | 'card'
  | 'border'
  | 'primary'
  | 'primaryForeground'
  | 'accent'
  | 'secondary'
  | 'success'
  | 'warn'
  | 'danger'
  | 'info'
  | 'help'
> {
  return token.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof Pick<
    ChartSystemVariables,
    | 'foreground'
    | 'mutedForeground'
    | 'background'
    | 'card'
    | 'border'
    | 'primary'
    | 'primaryForeground'
    | 'accent'
    | 'secondary'
    | 'success'
    | 'warn'
    | 'danger'
    | 'info'
    | 'help'
  >
}

const getRootStyle = () => {
  if (typeof window === 'undefined') return null
  return getComputedStyle(document.documentElement)
}

/** 从 :root 读取 ThemeCssVars 并格式化为 ECharts 可用的 rgb(r,g,b) */
const getCssRgbColor = (token: ThemeCssVarName): string => {
  const style = getRootStyle()
  if (!style) return ''
  const raw = style.getPropertyValue(`--${token}`).trim()
  if (!raw) return ''
  // ThemeEngine 以 "r g b" 形式写入；ECharts 只认 rgb(r,g,b) 逗号分隔，需规范化
  const normalized = raw.includes(',') ? raw : raw.split(/\s+/).filter(Boolean).join(',')
  return `rgb(${normalized})`
}

/**
 * 统一抽取图表所需的系统级变量
 *
 * 颜色按 CHART_THEME_TOKEN_NAMES 从 ThemeCssVars 解析（key 为 camelCase）；
 * 尺寸从 SizeStore 读取，与全局 Size 系统一致。
 */
export function getChartSystemVariables(): ChartSystemVariables {
  const sizeStore = useSizeStore()
  const colorPart = Object.fromEntries(
    CHART_THEME_TOKEN_NAMES.map(token => [themeCssVarToCamel(token), getCssRgbColor(token)])
  ) as Pick<
    ChartSystemVariables,
    | 'foreground'
    | 'mutedForeground'
    | 'background'
    | 'card'
    | 'border'
    | 'primary'
    | 'primaryForeground'
    | 'accent'
    | 'secondary'
    | 'success'
    | 'warn'
    | 'danger'
    | 'info'
    | 'help'
  >

  return {
    ...colorPart,
    fontSize: sizeStore.getFontSizeValue,
    fontSizeSmall: sizeStore.getFontSizeSmValue,
    paddings: sizeStore.getPaddingsValue,
    gap: sizeStore.getGap,
    gapl: sizeStore.getGapl,
  }
}

/** 调色盘使用的 ThemeCssVars Light 变体，与 theme.d.ts 状态层一致 */
const CHART_PALETTE_LIGHT_TOKENS: ThemeCssVarName[] = [
  'primary-light',
  'accent-light',
  'success-light',
  'warn-light',
  'danger-light',
  'info-light',
  'help-light',
]

/**
 * 生成图表用调色盘
 *
 * - 前 8 项按色相分散排列，保证多系列时前若干条线/图例使用不同色系：
 *   primary, success, danger, warn, info, help, accent, secondary
 * - 其次 primaryForeground，再追加各 *-light 变体
 * - 当 count 大于可用颜色数量时，循环复用，保证长度满足要求
 */
export function generateChartPalette(baseColor: string, count: number): string[] {
  const vars = getChartSystemVariables()
  const lightColors = CHART_PALETTE_LIGHT_TOKENS.map(token => getCssRgbColor(token))

  const basePalette: string[] = [
    baseColor || vars.primary,
    vars.success,
    vars.danger,
    vars.warn,
    vars.info,
    vars.help,
    vars.accent,
    vars.secondary,
    vars.primaryForeground,
    ...lightColors,
  ]

  // 去重并过滤空值，保证颜色语义明确
  const unique = Array.from(new Set(basePalette.filter(Boolean)))

  if (unique.length === 0) {
    return []
  }

  if (count <= unique.length) {
    return unique.slice(0, count)
  }

  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(unique[i % unique.length])
  }
  return result
}
