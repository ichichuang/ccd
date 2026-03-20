/**
 * UnoCSS 快捷类名配置（完整覆盖 uno.config.ts）
 * 抽取自 unocss.vue，减少主文件体积
 */

export interface ShortcutItem {
  name: string
  classes: string
  desc?: string
}

export interface ShortcutGroup {
  category: string
  icon: string
  items: ShortcutItem[]
}

export const shortcutGroups: ShortcutGroup[] = []
