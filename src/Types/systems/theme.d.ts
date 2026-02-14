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

  /** 主题切换过渡时长 (ms) */
  export type ThemeTransitionDuration = 400 | 600 | 800 | 1200 | 1600

  /**
   * 单个颜色 Token 的完整状态定义
   * 用于精确控制 Default / Light / Dark / Hover 等状态
   */
  export interface ColorTokenState {
    default: string // e.g. blue-600
    foreground: string // e.g. white
    hover?: string // e.g. blue-700
    active?: string
    light?: string // 背景色 tint (e.g. blue-50)
    lightForeground?: string // light 变体上的文字色
  }

  /**
   * 单一模式（Light/Dark）下的完整配色配置
   */
  export interface ThemeModeConfig {
    /* 品牌色系 */
    primary?: Partial<ColorTokenState>
    accent?: Partial<ColorTokenState>
    destructive?: Partial<ColorTokenState>
    warn?: Partial<ColorTokenState>
    success?: Partial<ColorTokenState>
    info?: Partial<ColorTokenState>
    help?: Partial<ColorTokenState>

    /* 基础色 */
    background?: string
    foreground?: string

    /* 中性色系统 (Border, Input, Ring, Secondary, Muted) */
    neutral?: {
      base?: string // 用于 border, input, ring
      bg?: string // 用于 card, popover, secondary, muted
      foreground?: string // 用于 card-foreground, popover-foreground
      secondaryForeground?: string
      mutedForeground?: string
    }

    /* 侧边栏专用 */
    sidebar?: {
      background?: string
      foreground?: string
      primary?: string
      primaryForeground?: string
      accent?: string
      accentForeground?: string
      border?: string
      ring?: string
    }
  }

  export interface ThemePreset {
    name: string

    /* =========================================================
       1. 简易模式 (Legacy / Simple Mode)
       仅需定义核心色，其余由引擎自动计算
       ========================================================= */
    primary?: string
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
    /** 信息色，蓝色系；未提供时使用引擎默认 */
    info?: string
    /** 帮助色，紫色系；未提供时使用引擎默认 [NEW] */
    help?: string

    /* =========================================================
       2. 专业配置模式 (Configuration Mode) [NEW]
       精确定义每种模式下的颜色值，优先级高于简易模式
       ========================================================= */
    colors?: {
      light?: ThemeModeConfig
      dark?: ThemeModeConfig
    }
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
    '--primary-hover-foreground': string
    '--primary-light': string
    '--primary-light-foreground': string

    /* ==================== 辅助层 ==================== */
    '--secondary': string
    '--secondary-foreground': string
    '--muted': string
    '--muted-foreground': string
    '--accent': string
    '--accent-foreground': string
    '--accent-hover': string
    '--accent-hover-foreground': string
    '--accent-light': string
    '--accent-light-foreground': string

    /* ==================== 状态层 ==================== */
    '--destructive': string
    '--destructive-foreground': string
    '--destructive-hover': string
    '--destructive-hover-foreground': string
    '--destructive-light': string
    '--destructive-light-foreground': string
    '--warn': string
    '--warn-foreground': string
    '--warn-hover': string
    '--warn-hover-foreground': string
    '--warn-light': string
    '--warn-light-foreground': string
    '--success': string
    '--success-foreground': string
    '--success-hover': string
    '--success-hover-foreground': string
    '--success-light': string
    '--success-light-foreground': string
    '--info': string
    '--info-foreground': string
    '--info-hover': string
    '--info-hover-foreground': string
    '--info-light': string
    '--info-light-foreground': string
    '--help': string
    '--help-foreground': string
    '--help-hover': string
    '--help-hover-foreground': string
    '--help-light': string
    '--help-light-foreground': string

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
