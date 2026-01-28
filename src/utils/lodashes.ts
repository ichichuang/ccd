/**
 * Lodash Wrapper (防腐层)
 *
 * 架构说明：
 * 1. 统一管理第三方通用工具库依赖，避免项目直接耦合 lodash-es。
 * 2. 仅导出项目中实际用到的方法，利用 Tree-shaking 减少体积。
 *
 * 最佳实践：
 * - 【数据处理】：Store、纯 TS/JS 逻辑中，使用此处的 deepClone 等方法。
 * - 【UI 交互】：Vue 组件内的防抖/节流 (Resize, Input)，推荐优先使用 @vueuse/core 的 useDebounceFn / useThrottleFn，
 *   因为它们能自动处理组件卸载时的清理逻辑，防止内存泄漏。
 */

// 按需引入，确保 Tree-shaking 生效
import { cloneDeep, debounce, throttle, isEqual, merge, pick, omit } from 'lodash-es'

// ----------------------------------------------------------------------
// Core Wrappers
// ----------------------------------------------------------------------

/**
 * 深拷贝
 * @description 处理了循环引用、Symbol、Date、RegExp 等特殊对象的稳健深拷贝
 */
export function deepClone<T>(obj: T): T {
  return cloneDeep(obj)
}

/**
 * 深度比较
 */
export function deepEqual(value: any, other: any): boolean {
  return isEqual(value, other)
}

/**
 * 深度合并
 */
export function deepMerge(object: any, ...sources: any[]): any {
  return merge(object, ...sources)
}

/**
 * 对象属性摘取
 */
export function objectPick<T extends object, K extends keyof T>(object: T, paths: K[]): Pick<T, K> {
  return pick(object, paths)
}

/**
 * 对象属性剔除
 */
export function objectOmit<T extends object, K extends keyof T>(object: T, paths: K[]): Omit<T, K> {
  return omit(object, paths)
}

// ----------------------------------------------------------------------
// Legacy Wrappers (Component Use Advice: Prefer VueUse)
// ----------------------------------------------------------------------

/**
 * 函数防抖
 * @note 组件内建议优先使用 useDebounceFn (VueUse)
 */
export const debounceFn = debounce as (
  func: (...args: any[]) => any,
  wait?: number,
  options?: any
) => (...args: any[]) => any

/**
 * 函数节流
 * @note 组件内建议优先使用 useThrottleFn (VueUse)
 */
export const throttleFn = throttle as (
  func: (...args: any[]) => any,
  wait?: number,
  options?: any
) => (...args: any[]) => any
