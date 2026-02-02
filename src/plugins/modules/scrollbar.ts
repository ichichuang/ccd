// src/plugins/modules/scrollbar.ts
/**
 * OverlayScrollbars 全局注册插件
 *
 * 将 CScrollbar 组件注册为全局组件，可在任意地方使用
 */
import { CScrollbar } from '@/components/CScrollbar'

export const setupScrollbar = (app: App) => {
  // 注册 CScrollbar 为全局组件
  app.component('CScrollbar', CScrollbar)
}
