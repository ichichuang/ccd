// @/components/SchemaForm/utils/constants.ts
/**
 * SchemaForm 常量配置
 * - 默认 Props 配置
 * - 默认布局/样式配置
 * - IndexedDB 相关常量
 * - 定时器间隔配置
 * - 响应式断点配置
 */

import type { LayoutConfig, StyleConfig } from './types'

/** 默认网格间距对应的语义变量（与 spacing-md 一致），当 schema 未指定 gap 时使用 */
const DEFAULT_GRID_GAP_VAR = 'var(--spacing-md)'

// ==================== 时间常量 ====================

/** 选项缓存默认 TTL（5分钟） */
export const DEFAULT_OPTIONS_CACHE_TTL = 1000 * 60 * 5

/** 持久化默认 TTL（24小时） */
export const DEFAULT_PERSIST_TTL = 24 * 60 * 60 * 1000

/** 表单值同步定时器间隔（500ms） */
export const VALUES_SYNC_INTERVAL = 500

/** 记忆保存节流间隔（500ms） */
export const REMEMBER_SAVE_THROTTLE = 500

/** 持久化节流间隔（300ms） */
export const PERSIST_THROTTLE = 300

// ==================== IndexedDB 常量 ====================

/** IndexedDB 数据库名称 */
export const IDB_DB_NAME = 'CCAdminFormMemory'

/** IndexedDB 存储名称 */
export const IDB_STORE_NAME = 'forms'

/** IndexedDB Key 前缀 */
export const IDB_KEY_PREFIX = 'schemaform:'

// ==================== 布局常量 ====================

/** 默认容器宽度（桌面端） */
export const DEFAULT_CONTAINER_WIDTH = 1200

/** 响应式断点配置 */
export interface ResponsiveBreakpoint {
  /** 断点宽度 */
  width: number
  /** 对应的栅格 span */
  span: number
}

/** 响应式断点列表（从大到小） */
export const RESPONSIVE_BREAKPOINTS: ResponsiveBreakpoint[] = [
  { width: 2560, span: 2 },
  { width: 1920, span: 3 },
  { width: 1080, span: 4 },
  { width: 768, span: 6 },
  { width: 0, span: 12 }, // 默认移动端
]

// ==================== 默认配置生成函数 ====================

/** 创建默认布局配置 */
export const getDefaultLayoutConfig = (): LayoutConfig => {
  return {
    cols: 0,
    labelWidth: 'var(--form-label-width, var(--spacing-5xl))',
    labelPosition: 'right',
    labelAlign: 'left',
    showLabel: true,
  }
}

/** 创建默认样式配置 */
export const getDefaultStyleConfig = (): StyleConfig => {
  return {}
}

/** 合并布局配置（优先级：fieldLayout > globalLayout > 默认值） */
export const mergeLayoutConfig = (
  globalLayout?: LayoutConfig,
  fieldLayout?: LayoutConfig
): LayoutConfig => {
  const defaultLayout = getDefaultLayoutConfig()
  return {
    ...defaultLayout,
    ...globalLayout,
    ...fieldLayout, // 表单项配置优先级最高
  }
}

/** 合并样式配置（优先级：fieldStyle > globalStyle > 默认值） */
export const mergeStyleConfig = (
  globalStyle?: StyleConfig,
  fieldStyle?: StyleConfig
): StyleConfig => {
  const defaultStyle = getDefaultStyleConfig()
  return {
    ...defaultStyle,
    ...globalStyle,
    ...fieldStyle, // 表单项配置优先级最高
  }
}

/**
 * 数值到语义间距的映射（与 SIZE_SCALE 对应，单位 px）
 * 当 schema 传入的数字匹配时，使用 var(--spacing-*) 替代硬编码 px
 */
const GAP_TO_SPACING_VAR: Record<number, string> = {
  4: 'var(--spacing-xs)',
  8: 'var(--spacing-sm)',
  16: 'var(--spacing-md)',
  24: 'var(--spacing-lg)',
  32: 'var(--spacing-xl)',
  48: 'var(--spacing-2xl)',
  64: 'var(--spacing-3xl)',
  96: 'var(--spacing-4xl)',
  128: 'var(--spacing-5xl)',
}

function toGapValue(value: number): string {
  return GAP_TO_SPACING_VAR[value] ?? `${value}px`
}

/** 生成网格间距样式 */
export const getGridGapStyle = (
  gap?: number,
  gapX?: number,
  gapY?: number
): Record<string, string> => {
  const style: Record<string, string> = {}

  // 若传入 gapX 或 gapY，则优先使用它们；否则使用 gap 默认值
  if (gapX !== undefined || gapY !== undefined) {
    if (gapY !== undefined) {
      style.rowGap = toGapValue(gapY)
    }
    if (gapX !== undefined) {
      style.columnGap = toGapValue(gapX)
    }
  } else if (gap !== undefined) {
    style.gap = toGapValue(gap)
  } else {
    style.gap = DEFAULT_GRID_GAP_VAR
  }

  return style
}

// ==================== 默认 Props 配置 ====================

/** 默认 SchemaForm Props 配置对象 */
export const DEFAULT_SCHEMA_FORM_PROPS = {
  optionsCacheTTL: DEFAULT_OPTIONS_CACHE_TTL,
  disabled: false,
  remember: false,
  preview: false,
} as const

/** 创建默认 SchemaForm Props（兼容函数形式） */
export const createDefaultSchemaFormProps = () => ({ ...DEFAULT_SCHEMA_FORM_PROPS })

// ==================== 工具函数 ====================

/**
 * 根据容器宽度获取响应式 span
 * - customCols: 每行列数（如 2 = 两列布局，每项 span 6）
 * - 当 customCols 未配置时，按断点返回 span
 */
export const getResponsiveSpan = (width: number, customCols?: number): number => {
  if (customCols && customCols > 0) {
    const cols = Math.min(12, Math.max(1, customCols))
    return Math.floor(12 / cols)
  }

  // 根据断点获取对应的 span
  for (const breakpoint of RESPONSIVE_BREAKPOINTS) {
    if (width >= breakpoint.width) {
      return breakpoint.span
    }
  }

  // 默认返回 12（移动端）
  return 12
}

/** 验证并规范化容器宽度 */
export const normalizeContainerWidth = (width: number | undefined | null): number => {
  if (width === undefined || width === null || isNaN(width) || !isFinite(width) || width < 0) {
    return DEFAULT_CONTAINER_WIDTH
  }
  return width
}
