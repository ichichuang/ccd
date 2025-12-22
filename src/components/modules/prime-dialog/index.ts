/**
 * PrimeVue Dialog 模块导出
 *
 * 提供对话框组件和相关功能
 */

// 导出 Vue 组件
export { default as PrimeVueDialog } from './PrimeVueDialog.vue'

// 导出 useDialog hook
export * from './useDialog'

// 导出所有类型
export type { ArgsType, ButtonProps, ConfirmOptions, DialogOptions, EventType } from './utils/types'
