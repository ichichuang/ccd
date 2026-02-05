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

  /** PrimeVue Toast 位置 */
  type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'

  /** 全局 Toast API（基于 PrimeVue useToast） */
  interface ToastApi {
    add: (options: {
      severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'
      summary?: string
      detail?: string
      life?: number
      group?: string
    }) => void
    errorIn: (position: ToastPosition, summary: string, detail?: string) => void
    successIn: (position: ToastPosition, summary: string, detail?: string) => void
    infoIn: (position: ToastPosition, summary: string, detail?: string) => void
    warnIn: (position: ToastPosition, summary: string, detail?: string) => void
    remove?: (message: object) => void
    removeGroup?: (group: string) => void
    /** 清除所有 Toast，内部调用 removeAllGroups() */
    clear?: () => void
  }

  /** 全局 Message API（Element Plus 风格） */
  interface MessageApi {
    success: (message: string, title?: string) => void
    error: (message: string, title?: string) => void
    info: (message: string, title?: string) => void
    warning: (message: string, title?: string) => void
  }

  interface Window {
    /** 全局 Toast（PrimeVue），在 App 挂载后可用 */
    $toast?: ToastApi
    /** 全局 Message（Element Plus 风格），在 App 挂载后可用 */
    $message?: MessageApi
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
