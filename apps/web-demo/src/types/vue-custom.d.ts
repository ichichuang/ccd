/**
 * Vue 全局指令类型扩展
 * 解决 vue-tsc 对项目自定义指令的类型校验
 */
import type { Directive } from 'vue'

declare module 'vue' {
  export interface GlobalDirectives {
    vTooltip: Directive
    /** v-auth / v-auth.disable — 权限控制（值：权限码或数组） */
    vAuth: Directive<HTMLElement, string | string[]>
    /** v-tap — 轻触手势（值：回调函数） */
    vTap: Directive<HTMLElement, (event: PointerEvent) => void>
    /** v-swipe — 滑动手势（值：方向回调） */
    vSwipe: Directive<HTMLElement, (direction: string) => void>
    /** v-long-press — 长按手势（值：回调函数） */
    vLongPress: Directive<HTMLElement, (event: PointerEvent) => void>
  }
}
