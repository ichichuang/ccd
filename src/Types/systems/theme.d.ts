/**
 * 全局主题类型定义 (v3.1 - 完整对齐 Shadcn 最新标准)
 * 作用范围：src/utils/theme/engine.ts 及相关 Store
 */
declare global {
  export type ThemeMode = 'light' | 'dark' | 'auto'

  export type ThemeTransitionMode =
    | 'circle'
    | 'curtain'
    | 'diamond'
    | 'implosion'
    | 'glitch'
    | 'fade'

  export interface ThemePreset {
    name: string
    label: string
    primary: string
    /** 深色模式下的自定义背景色，未提供时使用引擎默认 */
    backgroundDark?: string
    /** 浅色模式下的自定义背景色，未提供时使用引擎默认 */
    backgroundLight?: string
    neutral?: string
    /** 强调色，在 constants 中定义；未提供时由引擎按主色与中性色混合回退 */
    accent?: string
    /** 警告色，暗黄系；未提供时使用引擎默认 */
    warn?: string
    /** 成功色，绿色系；未提供时使用引擎默认 */
    success?: string
  }

  /**
   * Shadcn/UnoCSS 需要的 CSS 变量映射
   * ⚠️ 值必须是 RGB 通道格式 (e.g., "255 10 20") 以支持透明度语法
   */
  export interface ThemeCssVars {
    /* ==================== 基础层 ==================== */
    '--background': string
    '--foreground': string

    /* ==================== 容器层 ==================== */
    '--card': string
    '--card-foreground': string
    '--popover': string
    '--popover-foreground': string

    /* ==================== 品牌层 ==================== */
    '--primary': string
    '--primary-foreground': string
    /* [NEW] 衍生色及其文本色 (修复文字看不清的问题) */
    '--primary-hover': string
    '--primary-light': string
    '--primary-light-foreground': string // <--- 新增：专门用于浅色背景上的文字

    /* ==================== 辅助层 ==================== */
    '--secondary': string
    '--secondary-foreground': string
    '--muted': string
    '--muted-foreground': string
    '--accent': string
    '--accent-foreground': string
    '--accent-hover': string
    '--accent-light': string
    '--accent-light-foreground': string

    /* ==================== 状态层 ==================== */
    '--destructive': string
    '--destructive-foreground': string
    '--destructive-hover': string
    '--destructive-light': string
    '--destructive-light-foreground': string
    '--warn': string
    '--warn-foreground': string
    '--warn-hover': string
    '--warn-light': string
    '--warn-light-foreground': string
    '--success': string
    '--success-foreground': string
    '--success-hover': string
    '--success-light': string
    '--success-light-foreground': string

    /* ==================== 边框与线条 ==================== */
    '--border': string
    '--input': string
    '--ring': string

    /* ==================== 侧边栏专用 (Sidebar) ==================== */
    // 允许侧边栏拥有独立的背景逻辑（如深色侧边栏+浅色内容）
    '--sidebar-background': string
    '--sidebar-foreground': string
    '--sidebar-primary': string
    '--sidebar-primary-foreground': string
    '--sidebar-accent': string
    '--sidebar-accent-foreground': string
    '--sidebar-border': string
    '--sidebar-ring': string
  }
}

export {}
