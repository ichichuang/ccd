/**
 * 核心主题预设池
 * 数据来源参考: AI Colors
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'zinc',
    primary: '#18181b',
    accent: '#3f3f46', // 锌灰强调，与主色协调
  },
  {
    name: 'deep-blue',
    primary: '#3665f9', // 兼容旧逻辑的兜底
    colors: {
      light: {
        primary: {
          default: '#3665f9',
          hover: '#2563eb',
          foreground: '#ffffff',
          light: '#eff6ff', // explicitly set light tint
          lightForeground: '#1e3a8a',
        },
        background: '#ffffff',
        foreground: '#0f172a',
        neutral: {
          base: '#e2e8f0', // slate-200 for borders
          bg: '#f8fafc', // slate-50 for cards
          foreground: '#0f172a',
        },
      },
      dark: {
        primary: {
          default: '#60a5fa', // lighter blue for dark mode
          hover: '#3b82f6',
          foreground: '#000000',
          light: '#1e3a8a',
          lightForeground: '#ffffff',
        },
        background: '#020617', // slate-950
        foreground: '#f8fafc', // slate-50
        neutral: {
          base: '#1e293b', // slate-800
          bg: '#0f172a', // slate-900
          foreground: '#f8fafc',
        },
      },
    },
  },
  {
    name: 'violet',
    primary: '#7c3aed',
    colors: {
      light: {
        primary: {
          default: '#7c3aed', // violet-600
          hover: '#6d28d9', // violet-700
          foreground: '#ffffff',
          light: '#f5f3ff', // violet-50
          lightForeground: '#5b21b6', // violet-800
        },
        background: '#ffffff',
        foreground: '#0f172a',
        neutral: {
          base: '#e5e7eb', // gray-200
          bg: '#f9fafb', // gray-50
          foreground: '#111827',
        },
      },
      dark: {
        primary: {
          default: '#a78bfa', // violet-400 (lighter for dark mode)
          hover: '#8b5cf6', // violet-500
          foreground: '#ffffff',
          light: '#4c1d95', // violet-900
          lightForeground: '#e5e7eb',
        },
        background: '#0a0a0a', // neutral-950 (deep void)
        foreground: '#fafafa', // neutral-50
        neutral: {
          base: '#262626', // neutral-800
          bg: '#171717', // neutral-900
          foreground: '#fafafa',
        },
      },
    },
  },
  {
    name: 'emerald',
    primary: '#059669',
    colors: {
      light: {
        primary: {
          default: '#059669', // emerald-600
          hover: '#047857', // emerald-700
          foreground: '#ffffff',
          light: '#ecfdf5', // emerald-50
          lightForeground: '#064e3b', // emerald-800
        },
        background: '#ffffff',
        foreground: '#064e3b', // deep green text for organic feel
        neutral: {
          base: '#e2e8f0',
          bg: '#f8fafc',
          foreground: '#334155',
        },
      },
      dark: {
        primary: {
          default: '#34d399', // emerald-400
          hover: '#10b981', // emerald-500
          foreground: '#022c22', // emerald-950
          light: '#064e3b', // emerald-900
          lightForeground: '#d1fae5',
        },
        background: '#022c22', // emerald-950 (very deep green bg)
        foreground: '#ecfdf5', // emerald-50
        neutral: {
          base: '#064e3b', // emerald-900
          bg: '#065f46', // emerald-800
          foreground: '#ecfdf5',
        },
      },
    },
  },
  {
    name: 'ruby',
    primary: '#e11d48',
    colors: {
      light: {
        primary: {
          default: '#e11d48', // rose-600
          hover: '#be123c', // rose-700
          foreground: '#ffffff',
          light: '#fff1f2', // rose-50
          lightForeground: '#881337', // rose-900
        },
        background: '#ffffff',
        foreground: '#4c0519', // rose-950
        neutral: {
          base: '#e5e5e5', // neutral-200
          bg: '#fafafa', // neutral-50
          foreground: '#404040',
        },
      },
      dark: {
        primary: {
          default: '#fb7185', // rose-400
          hover: '#f43f5e', // rose-500
          foreground: '#4c0519', // rose-950
          light: '#881337', // rose-900
          lightForeground: '#ffe4e6',
        },
        background: '#000000', // pure black
        foreground: '#fff1f2', // rose-50
        neutral: {
          base: '#262626',
          bg: '#171717',
          foreground: '#fff1f2',
        },
      },
    },
  },
]

export const DEFAULT_THEME_NAME = 'deep-blue'

/**
 * 获取预设的主色（用于 UI 展示，如配色选择小球）
 * 若定义了 colors.light/dark 则根据 isDark 取对应 primary.default，否则取 preset.primary
 */
export function getPresetPrimaryColor(preset: ThemePreset, isDark: boolean): string {
  const modeKey = isDark ? 'dark' : 'light'
  const primary = preset.colors?.[modeKey]?.primary?.default ?? preset.primary
  return primary ?? '#6b7280'
}

/** 主题切换过渡时长默认值 (ms) */
export const DEFAULT_TRANSITION_DURATION: ThemeTransitionDuration = 600

/** 过渡时长选项（主色色块从浅到深 + i18n labelKey）
 * swatchStyle 使用 CSS 变量，随当前主题主色变化 */
export const TRANSITION_DURATION_OPTIONS: {
  value: ThemeTransitionDuration
  swatchStyle: string
  labelKey: string
}[] = [
  {
    value: 400,
    swatchStyle: 'rgb(var(--primary-hover))',
    labelKey: 'settings.durationUltraFast',
  },
  { value: 600, swatchStyle: 'rgb(var(--primary))', labelKey: 'settings.durationFast' },
  {
    value: 800,
    swatchStyle: 'rgb(var(--primary) / 0.5)',
    labelKey: 'settings.durationComfortable',
  },
  {
    value: 1200,
    swatchStyle: 'rgb(var(--primary) / 0.3)',
    labelKey: 'settings.durationSlow',
  },
  {
    value: 1600,
    swatchStyle: 'rgb(var(--primary-light))',
    labelKey: 'settings.durationUltraSlow',
  },
]
