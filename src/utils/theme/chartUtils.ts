/**
 * 图表主题工具：与架构配色体系统一
 *
 * - 颜色一律从 ThemeCssVars（src/types/systems/theme.d.ts）对应的 :root CSS 变量解析，
 *   与 engine.ts、primevuePreset.ts 使用同一套 token；ECharts 需要 rgb(r,g,b)，
 *   故在此做「读 computedStyle → 规范化逗号格式」，而非 PrimeVue 的 rgb(var(--xxx))。
 * - 尺寸：`getChartSizeTokens` / `getChartSystemVariables` 中的 px 一律由
 *   `constants/sizeScale.ts` 倍率表 + `SizePreset`（spacingBase / radius / fontSizeBase）推导，
 *   与 `sizeEngine.generateSizeVars` 公式一致；禁止 `spacingBase * 裸系数`。
 *
 * ChartSizeTokens 与阶梯映射（SSOT）：
 * - 间距类 → `spacingPx(preset, key)`
 * - 圆角类 → `radiusPx(preset, key)`
 * - 字号类 → `fontPx(preset, key)`
 * - 布局：`gapXs`/`paddingXs` 等与 `--spacing-*` 同阶；ECharts `${gapXs}%` 表示左右留白百分比数字
 * - 线宽：ECharts 1px/2px 惯例常量，不经间距阶梯
 * - px 阶梯：`@/utils/theme/sizeMetrics`（与 `generateSizeVars` 同源）
 */
import { SIZE_SCALE_KEYS } from '@/constants/sizeScale'
import type { SizeScaleKey } from '@/constants/sizeScale'
import {
  containerPaddingPx,
  fontPx,
  gapPx,
  marginPx,
  paddingPx,
  radiusPx,
  spacingPx,
} from '@/utils/theme/sizeMetrics'
import { useSizeStore } from '@/stores/modules/size'

/** `SizeScaleKey` → camelCase 后缀（用于 `gapXs`、`gap2xl` 等属性名） */
const CHART_SCALE_SUFFIX: Record<SizeScaleKey, string> = {
  xs: 'Xs',
  sm: 'Sm',
  md: 'Md',
  lg: 'Lg',
  xl: 'Xl',
  // SizeScaleKey 含 2xl…5xl，键名与 sizeScale 一致
  /* eslint-disable @typescript-eslint/naming-convention -- 阶梯键名 */
  '2xl': '2xl',
  '3xl': '3xl',
  '4xl': '4xl',
  '5xl': '5xl',
  /* eslint-enable @typescript-eslint/naming-convention */
}

/** 图表正文行高倍率（无全局行高 CSS 变量时与既有视觉对齐） */
const CHART_LINE_HEIGHT_RATIO_MD = 1.4
const CHART_LINE_HEIGHT_RATIO_LG = 1.4
const CHART_LINE_HEIGHT_RATIO_SM = 1.35

/** ECharts 线宽：不映射到 spacing 阶梯 */
const CHART_STROKE_HAIRLINE_PX = 1
const CHART_STROKE_AXIS_PX = 2
const CHART_STROKE_GRID_PX = 1
const CHART_STROKE_SERIES_PX = 2

/** ThemeCssVars 的 key 去掉 '--' 后的 token 名，与 engine / primevuePreset 一致 */
type ThemeCssVarName = keyof ThemeCssVars extends `--${infer T}` ? T : never

/** 主题色 token（与 ThemeCssVars 解析结果一致） */
export type ChartColorTokens = {
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
}

/** `gap-*` 全阶梯 px（与 `gapPx` / `--spacing-*` 同源） */
export type ChartGapLadder = {
  gapXs: number
  gapSm: number
  gapMd: number
  gapLg: number
  gapXl: number
  gap2xl: number
  gap3xl: number
  gap4xl: number
  gap5xl: number
}

/** `padding-*` 全阶梯 px */
export type ChartPaddingLadder = {
  paddingXs: number
  paddingSm: number
  paddingMd: number
  paddingLg: number
  paddingXl: number
  padding2xl: number
  padding3xl: number
  padding4xl: number
  padding5xl: number
}

/** `margin-*` 全阶梯 px */
export type ChartMarginLadder = {
  marginXs: number
  marginSm: number
  marginMd: number
  marginLg: number
  marginXl: number
  margin2xl: number
  margin3xl: number
  margin4xl: number
  margin5xl: number
}

/** `--font-size-*` 全阶梯 px */
export type ChartFontSizeLadder = {
  fontSizeXs: number
  fontSizeSm: number
  fontSizeMd: number
  fontSizeLg: number
  fontSizeXl: number
  fontSize2xl: number
  fontSize3xl: number
  fontSize4xl: number
  fontSize5xl: number
}

/** `--radius-*` 全阶梯 px */
export type ChartRadiusLadder = {
  radiusXs: number
  radiusSm: number
  radiusMd: number
  radiusLg: number
  radiusXl: number
  radius2xl: number
  radius3xl: number
  radius4xl: number
  radius5xl: number
}

/** 与 `sizeMetrics` / CSS 变量一致的度量阶梯（供图表与 ThemeConfig 共用） */
export type ChartMetricLadders = ChartGapLadder &
  ChartPaddingLadder &
  ChartMarginLadder &
  ChartFontSizeLadder &
  ChartRadiusLadder & {
    /** 与 `--container-padding` 一致 */
    containerPadding: number
  }

/**
 * 图表系统变量：主题色 + 全度量阶梯（无独立 legacy 字段）
 */
export type ChartSystemVariables = ChartColorTokens & ChartMetricLadders

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

/**
 * 生成图表尺寸 Tokens（px）
 *
 * - spacingUnit：`preset.spacingBase`（与 `--spacing-unit` 一致）
 * - 其余 px 均通过 `spacingPx` / `radiusPx` / `fontPx` + `SizeScaleKey` 推导，与 `generateSizeVars` 同源
 */
export function getChartSizeTokens(): ChartSizeTokens {
  const sizeStore = useSizeStore()
  const preset = sizeStore.currentPreset

  const spacingUnit = preset.spacingBase
  const fontMd = fontPx(preset, 'md')
  const fontLg = fontPx(preset, 'lg')
  const fontSm = fontPx(preset, 'sm')

  const radiusMd = radiusPx(preset, 'md')
  const radiusSm = radiusPx(preset, 'sm')

  const lineHeightMd = Math.round(fontMd * CHART_LINE_HEIGHT_RATIO_MD)
  const lineHeightLg = Math.round(fontLg * CHART_LINE_HEIGHT_RATIO_LG)
  const lineHeightSm = Math.round(fontSm * CHART_LINE_HEIGHT_RATIO_SM)

  const padSm = spacingPx(preset, 'sm')
  const padMd = spacingPx(preset, 'md')
  const padLg = spacingPx(preset, 'lg')

  const itemGapSm = spacingPx(preset, 'sm')
  const itemGapMd = spacingPx(preset, 'md')

  const axisLabelMargin = spacingPx(preset, 'sm')
  const axisLabelPadding = spacingPx(preset, 'xs')

  const strokeHairline = CHART_STROKE_HAIRLINE_PX
  const strokeAxis = CHART_STROKE_AXIS_PX
  const strokeGrid = CHART_STROKE_GRID_PX
  const strokeSeries = CHART_STROKE_SERIES_PX

  const symbolSm = spacingPx(preset, 'sm')
  const symbolMd = spacingPx(preset, 'md')
  const symbolLg = spacingPx(preset, 'lg')

  const tickLen = spacingPx(preset, 'sm')
  const minorTickLen = spacingPx(preset, 'xs')

  const tooltipPadding = spacingPx(preset, 'md')
  const tooltipRadius = radiusPx(preset, 'md')
  const tooltipBorderWidth = strokeHairline

  const legendItemWidth = spacingPx(preset, 'lg')
  const legendItemHeight = spacingPx(preset, 'md')
  const legendItemGap = spacingPx(preset, 'sm')
  const legendPadding = padSm

  const toolboxItemSize = spacingPx(preset, 'md')
  const toolboxItemGap = spacingPx(preset, 'sm')

  const visualMapItemWidth = spacingPx(preset, 'lg')
  const visualMapItemHeight = spacingPx(preset, 'md')
  const visualMapItemGap = spacingPx(preset, 'sm')
  const visualMapPadding = padSm
  const visualMapBorderWidth = strokeHairline

  const dataZoomHeight = spacingPx(preset, 'lg')
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
  ChartColorTokens,
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
    ChartColorTokens,
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
 * 构建 gap / padding / margin / fontSize / radius 全阶梯及 `containerPadding`（与 `sizeMetrics` 同源）
 */
function buildChartMetricLadders(preset: SizePreset): ChartMetricLadders {
  const out: Record<string, number> = {
    containerPadding: containerPaddingPx(preset),
  }
  for (const k of SIZE_SCALE_KEYS) {
    const suffix: string = CHART_SCALE_SUFFIX[k]
    out[`gap${suffix}`] = gapPx(preset, k)
    out[`padding${suffix}`] = paddingPx(preset, k)
    out[`margin${suffix}`] = marginPx(preset, k)
    out[`fontSize${suffix}`] = fontPx(preset, k)
    out[`radius${suffix}`] = radiusPx(preset, k)
  }
  return out as ChartMetricLadders
}

/**
 * 统一抽取图表所需的系统级变量
 *
 * 颜色按 CHART_THEME_TOKEN_NAMES 从 ThemeCssVars 解析（key 为 camelCase）；
 * 度量全阶梯见 `ChartMetricLadders`（`gapXs`、`paddingMd`、`fontSizeSm`、`radiusMd` 等）。
 */
export function getChartSystemVariables(): ChartSystemVariables {
  const sizeStore = useSizeStore()
  const preset = sizeStore.currentPreset
  const colorPart = Object.fromEntries(
    CHART_THEME_TOKEN_NAMES.map(token => [themeCssVarToCamel(token), getCssRgbColor(token)])
  ) as Pick<
    ChartColorTokens,
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
    ...buildChartMetricLadders(preset),
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
