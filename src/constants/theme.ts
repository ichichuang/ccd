/**
 * 核心主题预设池 (全状态极致定制版 - The Ultimate 7)
 * * 核心设计理念：
 * 1. 彻底绕过引擎的自动计算，为每一个主题的 Light/Dark 模式显式指定所有状态色。
 * 2. WCAG 严格对比度：深色背景必配白字 (#ffffff)，亮色背景必配极深色字。
 * 3. 色相融合 (Hue Harmony)：状态色不再是干巴巴的纯红纯绿，而是根据主色调做了冷暖偏移。
 */
export const THEME_PRESETS: ThemePreset[] = [
  // =========================================================================
  // 1. 经典蓝 (Classic Blue) - 致敬 GitHub / Tailwind
  // 语境：最经典的 B2B 后台。状态色标准、清晰，毫不花哨。
  // =========================================================================
  {
    name: 'classic-blue',
    colors: {
      light: {
        background: '#f8fafc',
        foreground: '#0f172a',
        neutral: { base: '#e2e8f0', bg: '#ffffff', foreground: '#334155' },
        primary: {
          default: '#0f62fe',
          foreground: '#ffffff',
          hover: '#0043ce',
          light: '#edf5ff',
          lightForeground: '#001d6c',
        },
        accent: {
          default: '#f59e0b',
          foreground: '#ffffff',
          hover: '#d97706',
          light: '#fffbeb',
          lightForeground: '#92400e',
        },
        success: {
          default: '#198038',
          foreground: '#ffffff',
          hover: '#0e6027',
          light: '#defbe6',
          lightForeground: '#073215',
        },
        info: {
          default: '#00539a',
          foreground: '#ffffff',
          hover: '#003a6d',
          light: '#e5f6ff',
          lightForeground: '#001c39',
        },
        warn: {
          default: '#f1c21b',
          foreground: '#000000',
          hover: '#d2a106',
          light: '#fcf4d6',
          lightForeground: '#5b4300',
        }, // 黄底必须黑字
        danger: {
          default: '#da1e28',
          foreground: '#ffffff',
          hover: '#a2191f',
          light: '#fff1f1',
          lightForeground: '#750e13',
        },
        help: {
          default: '#8a3ffc',
          foreground: '#ffffff',
          hover: '#6929c4',
          light: '#f6f2ff',
          lightForeground: '#31135e',
        },
      },
      dark: {
        background: '#020617',
        foreground: '#e6edf3',
        neutral: { base: '#30363d', bg: '#0f172a', foreground: '#8b949e' },
        primary: {
          default: '#2f81f7',
          foreground: '#ffffff',
          hover: '#58a6ff',
          light: '#112240',
          lightForeground: '#79c0ff',
        },
        accent: {
          default: '#d29922',
          foreground: '#ffffff',
          hover: '#e3b341',
          light: '#3d2e05',
          lightForeground: '#e3b341',
        },
        success: {
          default: '#238636',
          foreground: '#ffffff',
          hover: '#2ea043',
          light: '#092111',
          lightForeground: '#56d364',
        },
        info: {
          default: '#388bfd',
          foreground: '#ffffff',
          hover: '#58a6ff',
          light: '#0d223d',
          lightForeground: '#79c0ff',
        },
        warn: {
          default: '#9e6a03',
          foreground: '#ffffff',
          hover: '#d29922',
          light: '#2e2000',
          lightForeground: '#e3b341',
        }, // 暗色下的 Warn 更深邃，用白字
        danger: {
          default: '#f85149',
          foreground: '#ffffff',
          hover: '#ff7b72',
          light: '#3d1213',
          lightForeground: '#ffa198',
        },
        help: {
          default: '#bc8cff',
          foreground: '#ffffff',
          hover: '#d2a8ff',
          light: '#2d1c4d',
          lightForeground: '#e2c5ff',
        },
      },
    },
  },

  // =========================================================================
  // 2. 皇家紫 (Royal Violet) - 致敬 Stripe
  // 语境：高质感的现代 SaaS。所有的状态色都融入了一丝冷色调，显得极具科技感。
  // =========================================================================
  {
    name: 'royal-violet',
    colors: {
      light: {
        background: '#f3f4f6',
        foreground: '#111827',
        neutral: { base: '#e5e7eb', bg: '#ffffff', foreground: '#4b5563' },
        primary: {
          default: '#635bff',
          foreground: '#ffffff',
          hover: '#544de8',
          light: '#f2f1ff',
          lightForeground: '#3c31d6',
        },
        accent: {
          default: '#00d4ff',
          foreground: '#003b4d',
          hover: '#00b8db',
          light: '#e0fbff',
          lightForeground: '#005f7a',
        },
        success: {
          default: '#0ca678',
          foreground: '#ffffff',
          hover: '#099268',
          light: '#e6fcf5',
          lightForeground: '#087f5b',
        },
        info: {
          default: '#339af0',
          foreground: '#ffffff',
          hover: '#228be6',
          light: '#e7f5ff',
          lightForeground: '#1864ab',
        },
        warn: {
          default: '#fcc419',
          foreground: '#000000',
          hover: '#fab005',
          light: '#fff9db',
          lightForeground: '#e67700',
        },
        danger: {
          default: '#ff6b6b',
          foreground: '#ffffff',
          hover: '#fa5252',
          light: '#fff5f5',
          lightForeground: '#e03131',
        },
        help: {
          default: '#cc5de8',
          foreground: '#ffffff',
          hover: '#b197fc',
          light: '#f3d9fa',
          lightForeground: '#862e9c',
        },
      },
      dark: {
        background: '#030712',
        foreground: '#f3f4f6',
        neutral: { base: '#1f2937', bg: '#111827', foreground: '#9ca3af' },
        primary: {
          default: '#7b73ff',
          foreground: '#ffffff',
          hover: '#8e86ff',
          light: '#232159',
          lightForeground: '#d4d1ff',
        },
        accent: {
          default: '#00e5ff',
          foreground: '#00262b',
          hover: '#33ebff',
          light: '#003f47',
          lightForeground: '#99f5ff',
        },
        success: {
          default: '#20c997',
          foreground: '#ffefef',
          hover: '#38d9a9',
          light: '#093d2e',
          lightForeground: '#63e6be',
        },
        info: {
          default: '#4dabf7',
          foreground: '#fefefe',
          hover: '#74c0fc',
          light: '#143652',
          lightForeground: '#a5d8ff',
        },
        warn: {
          default: '#ffd43b',
          foreground: '#000000',
          hover: '#ffe066',
          light: '#4d3e00',
          lightForeground: '#ffec99',
        },
        danger: {
          default: '#cf364c',
          foreground: '#eeeeee',
          hover: '#f1455e',
          light: '#f1696e',
          lightForeground: '#f1455e',
        },
        help: {
          default: '#da77f2',
          foreground: '#000000',
          hover: '#e599f7',
          light: '#421d4d',
          lightForeground: '#f0b3ff',
        },
      },
    },
  },

  // =========================================================================
  // 3. 极光青 (Aurora Cyan) - Vercel / Web3 风格
  // 语境：科技、前沿。状态色全部采用高明度的霓虹质感，暗色模式表现极其惊艳。
  // =========================================================================
  {
    name: 'aurora-cyan',
    colors: {
      light: {
        background: '#f8fafc',
        foreground: '#164e63',
        neutral: { base: '#cffafe', bg: '#ffffff', foreground: '#155e75' },
        primary: {
          default: '#0891b2',
          foreground: '#ffffff',
          hover: '#0e7490',
          light: '#ecfeff',
          lightForeground: '#164e63',
        },
        accent: {
          default: '#ec4899',
          foreground: '#ffffff',
          hover: '#db2777',
          light: '#fdf2f8',
          lightForeground: '#9d174d',
        },
        success: {
          default: '#10b981',
          foreground: '#ffffff',
          hover: '#059669',
          light: '#ecfdf5',
          lightForeground: '#064e3b',
        },
        info: {
          default: '#3b82f6',
          foreground: '#ffffff',
          hover: '#2563eb',
          light: '#eff6ff',
          lightForeground: '#1e3a8a',
        },
        warn: {
          default: '#f59e0b',
          foreground: '#ffffff',
          hover: '#d97706',
          light: '#fffbeb',
          lightForeground: '#92400e',
        },
        danger: {
          default: '#f43f5e',
          foreground: '#ffffff',
          hover: '#e11d48',
          light: '#fff1f2',
          lightForeground: '#881337',
        },
        help: {
          default: '#8b5cf6',
          foreground: '#ffffff',
          hover: '#7c3aed',
          light: '#f5f3ff',
          lightForeground: '#4c1d95',
        },
      },
      dark: {
        background: '#020617',
        foreground: '#ecfeff',
        neutral: { base: '#164e63', bg: '#082f49', foreground: '#67e8f9' },
        primary: {
          default: '#22d3ee',
          foreground: '#000000',
          hover: '#67e8f9',
          light: '#083344',
          lightForeground: '#cffafe',
        },
        accent: {
          default: '#f472b6',
          foreground: '#000000',
          hover: '#f9a8d4',
          light: '#500724',
          lightForeground: '#fbcfe8',
        },
        success: {
          default: '#34d399',
          foreground: '#000000',
          hover: '#6ee7b7',
          light: '#022c22',
          lightForeground: '#a7f3d0',
        },
        info: {
          default: '#60a5fa',
          foreground: '#000000',
          hover: '#93c5fd',
          light: '#172554',
          lightForeground: '#bfdbfe',
        },
        warn: {
          default: '#fbbf24',
          foreground: '#000000',
          hover: '#fcd34d',
          light: '#451a03',
          lightForeground: '#fde68a',
        },
        danger: {
          default: '#fb7185',
          foreground: '#000000',
          hover: '#fda4af',
          light: '#4c0519',
          lightForeground: '#fecdd3',
        },
        help: {
          default: '#a78bfa',
          foreground: '#000000',
          hover: '#c4b5fd',
          light: '#2e1065',
          lightForeground: '#ddd6fe',
        },
      },
    },
  },

  // =========================================================================
  // 4. 琥珀晚霞 (Sunset Amber) - Linear 暖色系风格
  // 语境：极具活力、创意平台。以橙红为主，状态色整体偏暖。
  // =========================================================================
  {
    name: 'sunset-amber',
    colors: {
      light: {
        background: '#fff7ed',
        foreground: '#431407',
        neutral: { base: '#fed7aa', bg: '#ffffff', foreground: '#9a3412' },
        primary: {
          default: '#f97316',
          foreground: '#ffffff',
          hover: '#ea580c',
          light: '#ffedd5',
          lightForeground: '#9a3412',
        },
        accent: {
          default: '#6366f1',
          foreground: '#ffffff',
          hover: '#4f46e5',
          light: '#e0e7ff',
          lightForeground: '#3730a3',
        },
        success: {
          default: '#14b8a6',
          foreground: '#ffffff',
          hover: '#0d9488',
          light: '#ccfbf1',
          lightForeground: '#115e59',
        }, // 暖主题用青绿做成功色更高级
        info: {
          default: '#0ea5e9',
          foreground: '#ffffff',
          hover: '#0284c7',
          light: '#e0f2fe',
          lightForeground: '#075985',
        },
        warn: {
          default: '#eab308',
          foreground: '#000000',
          hover: '#ca8a04',
          light: '#fef9c3',
          lightForeground: '#854d0e',
        },
        danger: {
          default: '#ef4444',
          foreground: '#ffffff',
          hover: '#dc2626',
          light: '#fee2e2',
          lightForeground: '#991b1b',
        },
        help: {
          default: '#d946ef',
          foreground: '#ffffff',
          hover: '#c026d3',
          light: '#fae8ff',
          lightForeground: '#86198f',
        },
      },
      dark: {
        background: '#0a0a0a',
        foreground: '#fafaf9',
        neutral: { base: '#292524', bg: '#171717', foreground: '#a8a29e' },
        primary: {
          default: '#fb923c',
          foreground: '#000000',
          hover: '#fdba74',
          light: '#431407',
          lightForeground: '#ffedd5',
        },
        accent: {
          default: '#818cf8',
          foreground: '#000000',
          hover: '#a5b4fc',
          light: '#312e81',
          lightForeground: '#e0e7ff',
        },
        success: {
          default: '#2dd4bf',
          foreground: '#000000',
          hover: '#5eead4',
          light: '#042f2e',
          lightForeground: '#ccfbf1',
        },
        info: {
          default: '#38bdf8',
          foreground: '#000000',
          hover: '#7dd3fc',
          light: '#082f49',
          lightForeground: '#e0f2fe',
        },
        warn: {
          default: '#facc15',
          foreground: '#000000',
          hover: '#fef08a',
          light: '#422006',
          lightForeground: '#fef9c3',
        },
        danger: {
          default: '#f87171',
          foreground: '#000000',
          hover: '#fca5a5',
          light: '#450a0a',
          lightForeground: '#fee2e2',
        },
        help: {
          default: '#e879f9',
          foreground: '#000000',
          hover: '#f0abfc',
          light: '#4a044e',
          lightForeground: '#fae8ff',
        },
      },
    },
  },

  // =========================================================================
  // 5. 森林生态 (Forest Eco) - Shopify 风格
  // 语境：医疗、电商、大自然。色彩饱和度适中，极其护眼。
  // =========================================================================
  {
    name: 'forest-eco',
    colors: {
      light: {
        background: '#f4fbf7',
        foreground: '#064e3b',
        neutral: { base: '#d1fae5', bg: '#ffffff', foreground: '#065f46' },
        primary: {
          default: '#059669',
          foreground: '#ffffff',
          hover: '#047857',
          light: '#ecfdf5',
          lightForeground: '#064e3b',
        },
        accent: {
          default: '#d97706',
          foreground: '#ffffff',
          hover: '#b45309',
          light: '#fffbeb',
          lightForeground: '#92400e',
        },
        success: {
          default: '#65a30d',
          foreground: '#ffffff',
          hover: '#4d7c0f',
          light: '#ecfccb',
          lightForeground: '#3f6212',
        }, // 偏草绿的成功色
        info: {
          default: '#0284c7',
          foreground: '#ffffff',
          hover: '#0369a1',
          light: '#e0f2fe',
          lightForeground: '#075985',
        },
        warn: {
          default: '#eab308',
          foreground: '#000000',
          hover: '#ca8a04',
          light: '#fef9c3',
          lightForeground: '#854d0e',
        },
        danger: {
          default: '#dc2626',
          foreground: '#ffffff',
          hover: '#b91c1c',
          light: '#fee2e2',
          lightForeground: '#991b1b',
        },
        help: {
          default: '#9333ea',
          foreground: '#ffffff',
          hover: '#7e22ce',
          light: '#f3e8ff',
          lightForeground: '#581c87',
        },
      },
      dark: {
        background: '#022c22',
        foreground: '#ecfdf5',
        neutral: { base: '#065f46', bg: '#064e3b', foreground: '#6ee7b7' },
        primary: {
          default: '#10b981',
          foreground: '#000000',
          hover: '#34d399',
          light: '#064e3b',
          lightForeground: '#d1fae5',
        },
        accent: {
          default: '#f59e0b',
          foreground: '#000000',
          hover: '#fbbf24',
          light: '#78350f',
          lightForeground: '#fef3c7',
        },
        success: {
          default: '#84cc16',
          foreground: '#000000',
          hover: '#a3e635',
          light: '#3f6212',
          lightForeground: '#d9f99d',
        },
        info: {
          default: '#38bdf8',
          foreground: '#000000',
          hover: '#7dd3fc',
          light: '#082f49',
          lightForeground: '#e0f2fe',
        },
        warn: {
          default: '#fde047',
          foreground: '#000000',
          hover: '#fef08a',
          light: '#713f12',
          lightForeground: '#fef9c3',
        },
        danger: {
          default: '#ef4444',
          foreground: '#ffffff',
          hover: '#f87171',
          light: '#7f1d1d',
          lightForeground: '#fecaca',
        },
        help: {
          default: '#c084fc',
          foreground: '#000000',
          hover: '#d8b4fe',
          light: '#3b0764',
          lightForeground: '#e9d5ff',
        },
      },
    },
  },

  // =========================================================================
  // 6. 胭脂魅影 (Ruby Phantom) - 偏生活方式、设计平台
  // 语境：感性、优雅。以玫瑰红为主调，危险色使用更深邃的暗红以示区分。
  // =========================================================================
  {
    name: 'ruby-phantom',
    colors: {
      light: {
        background: '#fff5f7',
        foreground: '#4c0519',
        neutral: { base: '#ffe4e6', bg: '#ffffff', foreground: '#9f1239' },
        primary: {
          default: '#e11d48',
          foreground: '#ffffff',
          hover: '#be123c',
          light: '#ffe4e6',
          lightForeground: '#881337',
        },
        accent: {
          default: '#0f766e',
          foreground: '#ffffff',
          hover: '#0f766e',
          light: '#ccfbf1',
          lightForeground: '#115e59',
        }, // 深青色点缀
        success: {
          default: '#059669',
          foreground: '#ffffff',
          hover: '#047857',
          light: '#d1fae5',
          lightForeground: '#064e3b',
        },
        info: {
          default: '#2563eb',
          foreground: '#ffffff',
          hover: '#1d4ed8',
          light: '#dbeafe',
          lightForeground: '#1e40af',
        },
        warn: {
          default: '#d97706',
          foreground: '#ffffff',
          hover: '#b45309',
          light: '#fef3c7',
          lightForeground: '#92400e',
        }, // 优雅的深橙黄，白字
        danger: {
          default: '#9f1239',
          foreground: '#ffffff',
          hover: '#881337',
          light: '#ffe4e6',
          lightForeground: '#4c0519',
        }, // 危险色必须比 Primary 更深
        help: {
          default: '#7c3aed',
          foreground: '#ffffff',
          hover: '#6d28d9',
          light: '#ede9fe',
          lightForeground: '#5b21b6',
        },
      },
      dark: {
        background: '#2e020f',
        foreground: '#fff1f2',
        neutral: { base: '#881337', bg: '#4c0519', foreground: '#fda4af' },
        primary: {
          default: '#fb7185',
          foreground: '#000000',
          hover: '#fda4af',
          light: '#881337',
          lightForeground: '#ffe4e6',
        },
        accent: {
          default: '#14b8a6',
          foreground: '#000000',
          hover: '#2dd4bf',
          light: '#134e4a',
          lightForeground: '#ccfbf1',
        },
        success: {
          default: '#10b981',
          foreground: '#000000',
          hover: '#34d399',
          light: '#064e3b',
          lightForeground: '#d1fae5',
        },
        info: {
          default: '#60a5fa',
          foreground: '#000000',
          hover: '#93c5fd',
          light: '#1e3a8a',
          lightForeground: '#bfdbfe',
        },
        warn: {
          default: '#fbbf24',
          foreground: '#000000',
          hover: '#fcd34d',
          light: '#78350f',
          lightForeground: '#fef3c7',
        },
        danger: {
          default: '#f43f5e',
          foreground: '#ffffff',
          hover: '#fb7185',
          light: '#4c0519',
          lightForeground: '#fecdd3',
        },
        help: {
          default: '#a78bfa',
          foreground: '#000000',
          hover: '#c4b5fd',
          light: '#4c1d95',
          lightForeground: '#ddd6fe',
        },
      },
    },
  },

  // =========================================================================
  // 7. 深空灰 (Space Graphite) - 终极修复版 (Apple 质感)
  // 语境：极致专业。告别生硬死黑。所有状态色都降低了饱和度(Muted)，显得极为高级。
  // =========================================================================
  {
    name: 'space-graphite',
    colors: {
      light: {
        background: '#f1f5f9',
        foreground: '#0f172a',
        neutral: { base: '#e2e8f0', bg: '#ffffff', foreground: '#475569' },
        primary: {
          default: '#475569',
          foreground: '#ffffff',
          hover: '#334155',
          light: '#f1f5f9',
          lightForeground: '#0f172a',
        }, // Slate
        accent: {
          default: '#0ea5e9',
          foreground: '#ffffff',
          hover: '#0284c7',
          light: '#e0f2fe',
          lightForeground: '#075985',
        }, // Apple Blue
        success: {
          default: '#059669',
          foreground: '#ffffff',
          hover: '#047857',
          light: '#ecfdf5',
          lightForeground: '#064e3b',
        }, // 降低饱和度的绿
        info: {
          default: '#4f46e5',
          foreground: '#ffffff',
          hover: '#4338ca',
          light: '#e0e7ff',
          lightForeground: '#3730a3',
        }, // Indigo
        warn: {
          default: '#d97706',
          foreground: '#ffffff',
          hover: '#b45309',
          light: '#fffbeb',
          lightForeground: '#92400e',
        }, // 深琥珀，强行白字
        danger: {
          default: '#dc2626',
          foreground: '#ffffff',
          hover: '#b91c1c',
          light: '#fee2e2',
          lightForeground: '#991b1b',
        },
        help: {
          default: '#7c3aed',
          foreground: '#ffffff',
          hover: '#6d28d9',
          light: '#f5f3ff',
          lightForeground: '#5b21b6',
        },
      },
      dark: {
        background: '#09090b',
        foreground: '#f8fafc',
        neutral: { base: '#1e293b', bg: '#18181b', foreground: '#94a3b8' },
        primary: {
          default: '#94a3b8',
          foreground: '#020617',
          hover: '#cbd5e1',
          light: '#334155',
          lightForeground: '#f1f5f9',
        },
        accent: {
          default: '#38bdf8',
          foreground: '#020617',
          hover: '#7dd3fc',
          light: '#0c4a6e',
          lightForeground: '#e0f2fe',
        },
        success: {
          default: '#10b981',
          foreground: '#020617',
          hover: '#34d399',
          light: '#022c22',
          lightForeground: '#a7f3d0',
        },
        info: {
          default: '#818cf8',
          foreground: '#020617',
          hover: '#a5b4fc',
          light: '#312e81',
          lightForeground: '#e0e7ff',
        },
        warn: {
          default: '#f59e0b',
          foreground: '#020617',
          hover: '#fbbf24',
          light: '#451a03',
          lightForeground: '#fde68a',
        }, // 暗色下黄底黑字
        danger: {
          default: '#ef4444',
          foreground: '#ffffff',
          hover: '#f87171',
          light: '#450a0a',
          lightForeground: '#fecaca',
        }, // 暗色危险按钮依然白字，最高警戒
        help: {
          default: '#a78bfa',
          foreground: '#020617',
          hover: '#c4b5fd',
          light: '#2e1065',
          lightForeground: '#ddd6fe',
        },
      },
    },
  },
]

export const DEFAULT_THEME_NAME = 'royal-violet'
export const DEFAULT_THEME_MODE = 'auto' as const

/**
 * ProForm ColorPicker 插件示例默认 hex（与 `DEFAULT_THEME_NAME` 下 light.primary.default 一致，避免示例散落任意色值）
 */
export const DEMO_COLOR_PICKER_DEFAULT_HEX = '#635bff' as const

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
