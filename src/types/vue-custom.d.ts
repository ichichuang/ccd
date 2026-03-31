/**
 * Vue 全局指令与自定义属性类型扩展
 * 解决 vue-tsc 对 vTooltip、data-archetype、data-region 的类型校验
 */
import type { Directive } from 'vue'

declare module 'vue' {
  export interface GlobalDirectives {
    vTooltip: Directive
    /** v-auth / v-auth.disable — 权限控制（值：权限码或数组） */
    vAuth: Directive<HTMLElement, string | string[]>
  }

  export interface HTMLAttributes {
    'data-archetype'?: string
    'data-region'?: string
  }

  export interface ComponentCustomProps {
    'data-archetype'?: string
    'data-region'?: string
  }
}
