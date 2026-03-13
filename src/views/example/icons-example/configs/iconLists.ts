/**
 * 图标列表配置（Lite 模式内联版本）
 *
 * 说明：
 * - 完整版本会在构建阶段生成 src/views/example/icons/configs/iconLists.generated.ts，
 *   包含完整的图标名称列表。
 * - 当前为 Lite 模式，直接在此内联一小部分示例图标，避免动态导入不存在的生成文件导致 404。
 *
 * 若需要完整库，请在构建脚本中重新生成 iconLists.generated.ts 并改回由生成文件导出。
 */

const LUCIDE_ICONS: string[] = [
  'i-lucide-activity',
  'i-lucide-airplay',
  'i-lucide-alarm-clock',
  'i-lucide-alert-circle',
  'i-lucide-archive',
  'i-lucide-arrow-right',
  'i-lucide-badge-check',
  'i-lucide-bell',
  'i-lucide-box',
  'i-lucide-brain',
]

const SOLAR_ICONS: string[] = [
  'i-solar-moon-linear',
  'i-solar-sun-linear',
  'i-solar-settings-linear',
  'i-solar-user-linear',
  'i-solar-bell-linear',
]

const PH_ICONS: string[] = ['i-ph-gear', 'i-ph-user', 'i-ph-chart-bar', 'i-ph-cloud', 'i-ph-heart']

const LOGOS_ICONS: string[] = [
  'i-logos-vue',
  'i-logos-vitejs',
  'i-logos-typescript-icon',
  'i-logos-pnpm',
]

const CUSTOM_ICONS: string[] = []

const IS_LITE_MODE = true

export { LUCIDE_ICONS, SOLAR_ICONS, PH_ICONS, LOGOS_ICONS, CUSTOM_ICONS, IS_LITE_MODE }
