import type { SupportedLocale } from '@/locales'
import type { ComposerTranslation } from 'vue-i18n'
// 声明全局类型
declare global {
  /** 工具类型 */
  type Nullable<T> = T | null
  type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>
  type Recordable<T = any, K extends string = string> = Record<K, T>
  type ComponentRef<T extends abstract new (...args: any) => any> = InstanceType<T>

  /** 浏览器 API 类型扩展 */
  interface Window {
    requestIdleCallback: (
      callback: (deadline: IdleDeadline) => void,
      opts?: { timeout?: number }
    ) => number
    cancelIdleCallback: (handle: number) => void
  }

  interface IdleDeadline {
    timeRemaining: () => number
  }

  interface LocaleState {
    locale: SupportedLocale
    loading: boolean
  }

  interface Window {
    $message: any
    /** 全局路由工具 */
    $routeUtils?: RouteUtils
    /** 全局权限检查函数 */
    $hasAuth?: (value: string | string[]) => boolean
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: ComposerTranslation
    $te: (key: string) => boolean
    $d: (value: number | Date, key?: string, locale?: string) => string
    $n: (value: number, key?: string, locale?: string) => string
    $tm: (key: string) => any
    $rt: (message: string) => string
  }
}
