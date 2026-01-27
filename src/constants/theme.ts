/**
 * 核心主题预设池
 * 数据来源参考: AI Colors
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'zinc',
    label: '极简锌 (默认)',
    primary: '#18181b',
    accent: '#3f3f46', // 锌灰强调，与主色协调
  },
  {
    name: 'deep-blue',
    label: '深海潜影 (AI Colors)',
    primary: '#3665f9',
    backgroundDark: '#0F1C2E',
    backgroundLight: '#f4f4f5',
    accent: '#e11d48', // 略浅蓝作高亮
  },
  {
    name: 'rose',
    label: '玫瑰',
    primary: '#e11d48',
    accent: '#2563eb', // 玫瑰红强调
  },
  {
    name: 'orange',
    label: '爱马仕橙',
    primary: '#E85827',
    accent: '#3665f9', // 橙系高亮
    warn: '#ff0',
    success: '#00ff00',
  },
]

export const DEFAULT_THEME_NAME = 'zinc'
