/**
 * Vue 相关类型声明
 * 注：$t 等 i18n 类型由 env.d.ts 与 utils.ts / vue-i18n 统一提供，此处仅扩展全局组件与指令
 */
import type { Component } from 'vue'

declare module '@vue/runtime-core' {
  /** 全局指令（PrimeVue Tooltip 等），供模板中 v-tooltip 等通过类型检查 */
  interface GlobalDirectives {
    vTooltip: object
  }

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

/** PrimeVue 组件类型扩展：补充 v-model 事件声明，避免模板 @update:model-value 报错 */
declare module 'primevue/dropdown' {
  interface DropdownProps {
    /** 与 v-model 对应的更新事件；使用宽松类型以兼容业务侧具体类型回调（SizeMode、SupportedLocale 等） */
    /* eslint-disable-next-line @typescript-eslint/naming-convention -- PrimeVue v-model 事件名包含 ':'，无法满足 camelCase */
    'onUpdate:modelValue'?: (value: any) => void | Promise<void>
  }
}
