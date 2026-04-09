/**
 * Vue 相关类型声明
 * 注：$t 等 i18n 类型由 env.d.ts 与 utils.ts / vue-i18n 统一提供，此处仅扩展全局组件与指令
 */
import type { Component } from 'vue'

declare module '@vue/runtime-core' {
  /** 全局指令（PrimeVue Tooltip 等），供模板中 v-tooltip 等通过类型检查 */
  interface GlobalDirectives {
    vTooltip: object
    vAuth: object
    vTap: object
    vSwipe: object
    vLongPress: object
  }

  interface GlobalComponents {
    OhVueIcon: Component
    Icons: Component
    PvDataTable: Component
  }
}

declare module 'vue' {
  interface GlobalComponents {
    OhVueIcon: Component
    Icons: Component
    PvDataTable: Component
  }
}

// PrimeVue v4：Dropdown 已迁移为 Select，此处移除旧模块增强避免误导与未来冲突。
