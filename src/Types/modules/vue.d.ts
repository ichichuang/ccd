/**
 * Vue 相关类型声明
 * 注：$t 等 i18n 类型由 env.d.ts 与 utils.ts / vue-i18n 统一提供，此处仅扩展全局组件
 */
import type { Component } from 'vue'

declare module '@vue/runtime-core' {
  interface GlobalComponents {
    OhVueIcon: Component
    Icons: Component
  }
}

declare module 'vue' {
  interface GlobalComponents {
    OhVueIcon: Component
    Icons: Component
  }
}
