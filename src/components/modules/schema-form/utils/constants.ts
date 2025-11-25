// @/components/schema-form/utils/constants.ts
/**
 * SchemaForm 常量配置
 * - 默认 Props 配置
 * - 默认布局/样式配置
 * - IndexedDB 相关常量
 * - 定时器间隔配置
 * - 响应式断点配置
 */

import { useSizeStore } from '@/stores'
import type { LayoutConfig, StyleConfig } from './types'

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

/** 获取系统变量（用于动态配置） */
const getSystemVariables = () => {
  const sizeStore = useSizeStore()

  return {
    gap: sizeStore.getGap,
  }
}

/** 创建默认布局配置 */
export const getDefaultLayoutConfig = (): LayoutConfig => {
  return {
    cols: 0,
    labelWidth: '120px',
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

/** 生成网格间距样式 */
export const getGridGapStyle = (
  gap?: number,
  gapX?: number,
  gapY?: number
): Record<string, string> => {
  const style: Record<string, string> = {}
  const systemVars = getSystemVariables()

  // 若传入 gapX 或 gapY，则优先使用它们；否则使用 gap 默认值
  if (gapX !== undefined || gapY !== undefined) {
    if (gapY !== undefined) {
      style.rowGap = `${gapY}px`
    }
    if (gapX !== undefined) {
      style.columnGap = `${gapX}px`
    }
  } else if (gap !== undefined) {
    style.gap = `${gap}px`
  } else {
    // 使用系统默认 gap
    style.gap = `${systemVars.gap}px`
  }

  return style
}

// ==================== 默认 Props 配置 ====================

/** 默认 SchemaForm Props 配置对象 */
export const DEFAULT_SCHEMA_FORM_PROPS = {
  optionsCacheTTL: DEFAULT_OPTIONS_CACHE_TTL,
  disabled: false,
  remember: false,
} as const

/** 创建默认 SchemaForm Props（兼容函数形式） */
export const createDefaultSchemaFormProps = () => ({ ...DEFAULT_SCHEMA_FORM_PROPS })

// ==================== 工具函数 ====================

/** 根据容器宽度获取响应式 span */
export const getResponsiveSpan = (width: number, customCols?: number): number => {
  // 如果配置了自定义 cols，优先使用
  if (customCols && customCols > 0) {
    return Math.min(12, Math.max(1, customCols))
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
