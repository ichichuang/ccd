export type ThemeMode = 'light' | 'dark' | 'auto' | 'glass'

export type ThemeTransitionMode =
  | 'circle'
  | 'curtain'
  | 'diamond'
  | 'implosion'
  | 'glitch'
  | 'fade'

export type ThemeTransitionDuration = 400 | 600 | 800 | 1200 | 1600

export interface ColorTokenState {
  default: string
  foreground: string
  hover?: string
  active?: string
  light?: string
  lightForeground?: string
}

export interface ThemeModeConfig {
  primary?: Partial<ColorTokenState>
  accent?: Partial<ColorTokenState>
  danger?: Partial<ColorTokenState>
  warn?: Partial<ColorTokenState>
  success?: Partial<ColorTokenState>
  info?: Partial<ColorTokenState>
  help?: Partial<ColorTokenState>
  background?: string
  foreground?: string
  neutral?: {
    base?: string
    bg?: string
    foreground?: string
    secondaryForeground?: string
    mutedForeground?: string
  }
  secondary?: string
  secondaryForeground?: string
  muted?: string
  mutedForeground?: string
  border?: string
  input?: string
  ring?: string
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

export interface CompleteColorTokenState {
  default: string
  foreground: string
  hover: string
  active?: string
  light: string
  lightForeground: string
}

export interface CompleteThemeModeConfig {
  primary: CompleteColorTokenState
  accent: CompleteColorTokenState
  danger: CompleteColorTokenState
  warn: CompleteColorTokenState
  success: CompleteColorTokenState
  info: CompleteColorTokenState
  help: CompleteColorTokenState
  background: string
  foreground: string
  neutral: {
    base: string
    bg: string
    foreground: string
    secondaryForeground: string
    mutedForeground: string
  }
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  border: string
  input: string
  ring: string
  sidebar: {
    background: string
    foreground: string
    primary: string
    primaryForeground: string
    accent: string
    accentForeground: string
    border: string
    ring: string
  }
}

export interface ThemePreset {
  name: string
  primary?: string
  backgroundDark?: string
  backgroundLight?: string
  neutral?: string
  accent?: string
  warn?: string
  success?: string
  info?: string
  help?: string
  colors?: {
    light?: ThemeModeConfig
    dark?: ThemeModeConfig
  }
}

export interface CompleteThemePreset extends Omit<ThemePreset, 'colors'> {
  colors: {
    light: CompleteThemeModeConfig
    dark: CompleteThemeModeConfig
  }
}

export interface ThemeCssVars {
  '--background': string
  '--foreground': string
  '--card': string
  '--card-foreground': string
  '--popover': string
  '--popover-foreground': string
  '--primary': string
  '--primary-foreground': string
  '--primary-hover': string
  '--primary-hover-foreground': string
  '--primary-light': string
  '--primary-light-foreground': string
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
  '--danger': string
  '--danger-foreground': string
  '--danger-hover': string
  '--danger-hover-foreground': string
  '--danger-light': string
  '--danger-light-foreground': string
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
  '--border': string
  '--input': string
  '--ring': string
  '--sidebar-background': string
  '--sidebar-foreground': string
  '--sidebar-primary': string
  '--sidebar-primary-foreground': string
  '--sidebar-accent': string
  '--sidebar-accent-foreground': string
  '--sidebar-border': string
  '--sidebar-ring': string
}

export type SizeMode = 'compact' | 'comfortable' | 'loose'

export interface SizePreset {
  name: SizeMode
  label: string
  radius: number
  spacingBase: number
  fontSizeBase: number
  sidebarWidth: number
  sidebarCollapsedWidth: number
  headerHeight: number
  breadcrumbHeight: number
  footerHeight: number
  tabsHeight: number
}

export interface SizeCssVars {
  '--spacing-unit': string
  '--container-padding': string
  '--control-height': string
  '--control-height-sm': string
  '--control-height-lg': string
  '--control-action-size': string
  '--control-action-size-sm': string
  '--control-action-size-lg': string
  '--sidebar-width': string
  '--sidebar-collapsed-width': string
  '--header-height': string
  '--breadcrumb-height': string
  '--footer-height': string
  '--tabs-height': string
  '--font-size-xs': string
  '--font-size-sm': string
  '--font-size-md': string
  '--font-size-lg': string
  '--font-size-xl': string
  '--font-size-2xl': string
  '--font-size-3xl': string
  '--font-size-4xl': string
  '--font-size-5xl': string
  '--spacing-xs': string
  '--spacing-sm': string
  '--spacing-md': string
  '--spacing-lg': string
  '--spacing-xl': string
  '--spacing-2xl': string
  '--spacing-3xl': string
  '--spacing-4xl': string
  '--spacing-5xl': string
  '--radius-xs': string
  '--radius-sm': string
  '--radius-md': string
  '--radius-lg': string
  '--radius-xl': string
  '--radius-2xl': string
  '--radius-3xl': string
  '--radius-4xl': string
  '--radius-5xl': string
  '--transition-xs': string
  '--transition-sm': string
  '--transition-md': string
  '--transition-lg': string
  '--transition-xl': string
  '--transition-2xl': string
  '--transition-3xl': string
  '--transition-4xl': string
  '--transition-5xl': string
}
