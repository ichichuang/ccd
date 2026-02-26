/**
 * 核心主题预设池
 * 数据来源参考: AI Colors
 *
 * 配色原则：
 * - primary = 品牌主色（用于按钮填充、选中态、品牌标识）
 * - accent = 独立互补高亮色（与 primary 形成对比/互补关系，用于 Tab 激活指示线、特殊标记、badge）
 * - accent 不是 primary 的 hover 变体，hover 应使用 primary-hover
 */
export const THEME_PRESETS: ThemePreset[] = [
  // 1. 深蓝 + 琥珀金 (经典互补：蓝↔金)
  // Primary 是稳重的深蓝，Accent 是明亮的琥珀金，形成经典的蓝金互补对比
  {
    name: 'deep-blue',
    primary: '#2563eb', // blue-600
    accent: '#f59e0b', // amber-500 (蓝色的互补高亮)
    colors: {
      light: {
        primary: {
          default: '#2563eb',
          hover: '#1d4ed8',
          foreground: '#ffffff',
          light: '#eff6ff',
          lightForeground: '#1e40af',
        },
        accent: {
          default: '#f59e0b', // amber-500 (醒目的金色高亮)
          hover: '#d97706', // amber-600
          foreground: '#0f172a', // 浅色金背景配深色字
          light: '#fffbeb', // amber-50
          lightForeground: '#92400e', // amber-800
        },
        background: '#ffffff',
        foreground: '#0f172a',
        neutral: {
          base: '#e2e8f0',
          bg: '#f8fafc',
          foreground: '#334155',
        },
      },
      dark: {
        primary: {
          default: '#3b82f6', // blue-500
          hover: '#60a5fa',
          foreground: '#ffffff',
          light: '#1e3a8a',
          lightForeground: '#bfdbfe',
        },
        accent: {
          default: '#fbbf24', // amber-400 (暗色模式下稍亮，更醒目)
          hover: '#fcd34d', // amber-300
          foreground: '#0f172a', // 金色配深色字
          light: '#78350f', // amber-900
          lightForeground: '#fef3c7', // amber-100
        },
        background: '#020617',
        foreground: '#f8fafc',
        neutral: {
          base: '#1e293b',
          bg: '#0f172a',
          foreground: '#94a3b8',
        },
      },
    },
  },

  // 2. 紫罗兰 + 翡翠青 (紫↔青对比：神秘与清透)
  // Primary 是高贵的紫，Accent 是清透的青绿色，形成鲜明的冷暖对比
  {
    name: 'violet',
    primary: '#7c3aed', // violet-600
    accent: '#14b8a6', // teal-500 (紫色的对比高亮)
    colors: {
      light: {
        primary: {
          default: '#7c3aed',
          hover: '#6d28d9',
          foreground: '#ffffff',
          light: '#f5f3ff',
          lightForeground: '#5b21b6',
        },
        accent: {
          default: '#14b8a6', // teal-500 (清透的青绿高亮)
          hover: '#0d9488', // teal-600
          foreground: '#ffffff',
          light: '#f0fdfa', // teal-50
          lightForeground: '#115e59', // teal-800
        },
        background: '#ffffff',
        foreground: '#0f172a',
        neutral: {
          base: '#e5e7eb',
          bg: '#f9fafb',
          foreground: '#374151',
        },
      },
      dark: {
        primary: {
          default: '#8b5cf6', // violet-500
          hover: '#a78bfa',
          foreground: '#ffffff',
          light: '#4c1d95',
          lightForeground: '#ddd6fe',
        },
        accent: {
          default: '#2dd4bf', // teal-400 (暗色模式下更亮)
          hover: '#5eead4', // teal-300
          foreground: '#0f172a',
          light: '#134e4a', // teal-900
          lightForeground: '#ccfbf1', // teal-100
        },
        background: '#0a0a0a',
        foreground: '#fafafa',
        neutral: {
          base: '#262626',
          bg: '#171717',
          foreground: '#a3a3a3',
        },
      },
    },
  },

  // 3. 森林绿 + 琥珀金 (绿↔金对比：自然与丰收)
  // Primary 是深沉的绿，Accent 是温暖的琥珀金，像大自然的绿叶与阳光
  {
    name: 'emerald',
    primary: '#059669', // emerald-600
    accent: '#f59e0b', // amber-500 (绿色的暖色高亮)
    colors: {
      light: {
        primary: {
          default: '#059669',
          hover: '#047857',
          foreground: '#ffffff',
          light: '#ecfdf5',
          lightForeground: '#064e3b',
        },
        accent: {
          default: '#f59e0b', // amber-500 (温暖的金色高亮)
          hover: '#d97706', // amber-600
          foreground: '#0f172a', // 浅色金背景配深色字
          light: '#fffbeb', // amber-50
          lightForeground: '#92400e', // amber-800
        },
        background: '#ffffff',
        foreground: '#0f172a',
        neutral: {
          base: '#e2e8f0',
          bg: '#f8fafc',
          foreground: '#334155',
        },
      },
      dark: {
        primary: {
          default: '#10b981', // emerald-500
          hover: '#34d399',
          foreground: '#022c22',
          light: '#064e3b',
          lightForeground: '#d1fae5',
        },
        accent: {
          default: '#fbbf24', // amber-400 (暗色模式下更亮)
          hover: '#fcd34d', // amber-300
          foreground: '#0f172a',
          light: '#78350f', // amber-900
          lightForeground: '#fef3c7', // amber-100
        },
        background: '#022c22',
        foreground: '#ecfdf5',
        neutral: {
          base: '#064e3b',
          bg: '#065f46',
          foreground: '#a7f3d0',
        },
      },
    },
  },

  // 4. 玫瑰红 + 冰蓝青 (红↔青对比：热情与冷静)
  // Primary 是热烈的玫红，Accent 是清冷的冰蓝青，形成强烈的冷暖对比
  {
    name: 'ruby',
    primary: '#e11d48', // rose-600
    accent: '#06b6d4', // cyan-500 (红色的冷色对比高亮)
    colors: {
      light: {
        primary: {
          default: '#e11d48',
          hover: '#be123c',
          foreground: '#ffffff',
          light: '#fff1f2',
          lightForeground: '#881337',
        },
        accent: {
          default: '#06b6d4', // cyan-500 (冰蓝色高亮)
          hover: '#0891b2', // cyan-600
          foreground: '#ffffff',
          light: '#ecfeff', // cyan-50
          lightForeground: '#155e75', // cyan-800
        },
        background: '#ffffff',
        foreground: '#0f172a',
        neutral: {
          base: '#e5e5e5',
          bg: '#fafafa',
          foreground: '#404040',
        },
      },
      dark: {
        primary: {
          default: '#f43f5e', // rose-500
          hover: '#fb7185',
          foreground: '#ffffff',
          light: '#881337',
          lightForeground: '#ffe4e6',
        },
        accent: {
          default: '#22d3ee', // cyan-400 (暗色模式下更亮)
          hover: '#67e8f9', // cyan-300
          foreground: '#0f172a',
          light: '#164e63', // cyan-900
          lightForeground: '#cffafe', // cyan-100
        },
        background: '#000000',
        foreground: '#fff1f2',
        neutral: {
          base: '#262626',
          bg: '#171717',
          foreground: '#d4d4d4',
        },
      },
    },
  },
]

export const DEFAULT_THEME_NAME = 'violet'

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
