/**
 * Color Usage Contract - 语义 → Token 映射规则
 *
 * ⭐ SSOT (Single Source of Truth)：本文件是颜色语义决策的唯一权威。
 * - Rules 必须引用本文件，不得在文档中重新定义 primary/accent/ring/neutral 语义
 * - Preset 不解释语义，仅实现 Token 映射
 * - Uno 示例必须遵守本映射
 *
 * 供 UI 层参考，不读取 DOM、不修改 engine、不生成 CSS
 */
export const COLOR_USAGE = {
  /* 品牌 */
  brand: 'primary',
  brandForeground: 'primary-foreground',

  /* 交互反馈 — 统一使用 primary 色系 */
  hover: 'primary-hover',
  hoverForeground: 'primary-foreground',
  active: 'primary-hover',
  focus: 'ring',

  /* 聚焦预选态（列表项键盘聚焦、下拉选项聚焦） */
  focusHighlight: 'primary-light',
  focusHighlightForeground: 'primary-light-foreground',

  /* 强调/高亮 — 独立互补色，用于特殊视觉标记 */
  accent: 'accent',
  accentForeground: 'accent-foreground',
  /** accent 适用场景：Tab 激活指示线、特殊标记、badge、navlink 高亮 */

  /* 选中态 */
  selection: 'primary',
  selectionForeground: 'primary-foreground',

  /* 中性 */
  subtleBg: 'secondary',
  mutedText: 'muted-foreground',
} as const

/** 使用 primary 的推荐场景 */
export const PRIMARY_USAGE = [
  'logo',
  'primary-button',
  'brand-badge',
  'loading-animation',
  'chart-primary-series',
  'hover-border',
  'hover-background',
  'selected-state',
  'focus-highlight',
] as const

/** accent 的推荐场景（独立互补高亮色，非 hover） */
export const ACCENT_USAGE = [
  'tab-active-indicator',
  'special-badge',
  'navlink-highlight',
  'feature-callout',
] as const
