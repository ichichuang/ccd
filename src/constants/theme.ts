/**
 * 核心主题预设池
 * 数据来源参考: AI Colors
 */
export const THEME_PRESETS: ThemePreset[] = [
  // 1. 深蓝 + 天空蓝 (经典与通透)
  // Primary 是稳重的深蓝，Accent 是明亮的天空蓝，两者无缝衔接，像海洋到天空的过渡
  {
    name: 'deep-blue',
    primary: '#2563eb', // blue-600
    accent: '#38bdf8', // sky-400 (更浅、更亮)
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
          default: '#38bdf8', // sky-400
          hover: '#0ea5e9', // sky-500
          foreground: '#0f172a', // ⚠️ 浅色背景配深色字
          light: '#f0f9ff',
          lightForeground: '#0c4a6e',
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
          default: '#0ea5e9', // sky-500 (暗色模式下稍微加深一点以防刺眼)
          hover: '#38bdf8',
          foreground: '#ffffff',
          light: '#0c4a6e',
          lightForeground: '#e0f2fe',
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

  // 2. 紫罗兰 + 梦幻粉 (神秘与浪漫)
  // Primary 是高贵的紫，Accent 是邻近的粉/紫红，过渡非常柔和
  {
    name: 'violet',
    primary: '#7c3aed', // violet-600
    accent: '#d946ef', // fuchsia-500 (同色系偏粉)
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
          default: '#e879f9', // fuchsia-400 (更亮的粉紫)
          hover: '#d946ef',
          foreground: '#ffffff', // 粉紫色足够深，可以用白字
          light: '#fdf4ff',
          lightForeground: '#86198f',
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
          lightForeground: '#e5e7eb',
        },
        accent: {
          default: '#c026d3', // fuchsia-600
          hover: '#d946ef',
          foreground: '#ffffff',
          light: '#701a75',
          lightForeground: '#fce7f3',
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

  // 3. 森林绿 + 薄荷青 (自然渐变)
  // Primary 是深绿，Accent 是清新的薄荷绿/青色，看起来非常干净
  {
    name: 'emerald',
    primary: '#059669', // emerald-600
    accent: '#2dd4bf', // teal-400 (清爽的青绿)
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
          default: '#2dd4bf', // teal-400
          hover: '#14b8a6', // teal-500
          foreground: '#0f172a', // ⚠️ 浅绿背景配深色字
          light: '#f0fdfa',
          lightForeground: '#115e59',
        },
        background: '#ffffff',
        foreground: '#064e3b',
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
          default: '#14b8a6', // teal-500
          hover: '#2dd4bf',
          foreground: '#0f172a',
          light: '#134e4a',
          lightForeground: '#ccfbf1',
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

  // 4. 玫瑰红 + 珊瑚橙 (暖色渐变)
  // Primary 是玫红，Accent 是邻近的橙色，像晚霞一样自然过渡
  {
    name: 'ruby',
    primary: '#e11d48', // rose-600
    accent: '#fb923c', // orange-400
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
          default: '#fb923c', // orange-400
          hover: '#f97316', // orange-500
          foreground: '#0f172a', // ⚠️ 浅橙色配深色字
          light: '#fff7ed',
          lightForeground: '#9a3412',
        },
        background: '#ffffff',
        foreground: '#4c0519',
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
          default: '#f97316', // orange-500
          hover: '#fb923c',
          foreground: '#ffffff',
          light: '#7c2d12',
          lightForeground: '#fed7aa',
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

  // 5. 墨玉 + 豆绿 (新中式同色系)
  // Primary 是深沉的青色，Accent 是清透的黄绿，非常有质感
  {
    name: 'jadeite',
    primary: '#0f766e', // teal-700 (更深沉的玉色)
    accent: '#84cc16', // lime-500 (鲜活的嫩绿)
    colors: {
      light: {
        primary: {
          default: '#0f766e', // teal-700
          hover: '#115e59', // teal-800
          foreground: '#ffffff',
          light: '#f0fdfa',
          lightForeground: '#134e4a',
        },
        accent: {
          default: '#84cc16', // lime-500
          hover: '#65a30d', // lime-600
          foreground: '#ffffff',
          light: '#f7fee7',
          lightForeground: '#365314',
        },
        background: '#fafaf9', // Stone-50
        foreground: '#1c1917', // Stone-900
        neutral: {
          base: '#d6d3d1',
          bg: '#f5f5f4',
          foreground: '#57534e',
        },
      },
      dark: {
        primary: {
          default: '#14b8a6', // teal-500 (暗模式下提亮)
          hover: '#2dd4bf',
          foreground: '#0f172a',
          light: '#134e4a',
          lightForeground: '#ccfbf1',
        },
        accent: {
          default: '#a3e635', // lime-400
          hover: '#84cc16',
          foreground: '#1a2e05',
          light: '#365314',
          lightForeground: '#ecfccb',
        },
        background: '#0c0a09', // Stone-950
        foreground: '#f5f5f4',
        neutral: {
          base: '#292524',
          bg: '#1c1917',
          foreground: '#a8a29e',
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
