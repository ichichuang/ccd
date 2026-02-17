import type { ButtonProps as PrimeButtonProps } from 'primevue/button'
import type { Component, CSSProperties, VNode } from 'vue'

/** 对话框事件类型 */
export type EventType = 'open' | 'close' | 'maximize' | 'minimize' | 'fullscreen'

/** 关闭参数类型 */
export type ArgsType = {
  command: 'cancel' | 'sure' | 'close'
}

/** 按钮 severity 类型（对齐 PrimeVue Button，统一用 warn/danger） */
export type ButtonType = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help'

/** 对话框位置 */
export type DialogPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topleft'
  | 'topright'
  | 'bottomleft'
  | 'bottomright'

/** 基础按钮属性 */
export interface ButtonProps extends Omit<Partial<PrimeButtonProps>, 'label'> {
  label: string | (() => string)
  severity?: ButtonType
  loading?: boolean
  btnClick?: (params: { dialog: BtnClickDialog; button: BtnClickButton }) => void
}

export type BtnClickDialog = { options: DialogOptionsBase; index: number }
export type BtnClickButton = { btn?: ButtonProps; index: number }

/** 对话框基础选项 */
export interface DialogOptionsBase {
  /** 内部使用：每个弹窗实例的唯一 id，用于 v-for key，避免 splice 后组件被错误复用 */
  _instanceId?: string
  visible?: boolean
  header?: string | (() => string)
  width?: string | number
  height?: string | number
  /**
   * 响应式断点配置（透传给 PrimeVue Dialog）
   * @example { '960px': '50%', '768px': '80vw', '360px': '95vw' }
   */
  breakpoints?: Record<string, string>
  draggable?: boolean
  modal?: boolean
  position?: DialogPosition | string
  appendTo?: string
  maximizable?: boolean
  minimizable?: boolean
  keepInViewport?: boolean
  unstyled?: boolean
  class?: string
  style?: CSSProperties
  openDelay?: number
  closeDelay?: number
  closeOnEscape?: boolean
  closeOnMask?: boolean
  closable?: boolean
  center?: boolean
  destroyOnClose?: boolean
  hideFooter?: boolean
  hideHeader?: boolean
  hideClose?: boolean
  sureBtnLoading?: boolean
  footerButtons?: ButtonProps[]
  /** 传递给 contentRenderer 渲染组件的 props */
  props?: Record<string, unknown>
  open?: (params: { options: DialogOptionsBase; index: number }) => void
  close?: (params: { options: DialogOptionsBase; index: number }) => void
  closeCallBack?: (params: { options: DialogOptionsBase; index: number; args: ArgsType }) => void
  beforeCancel?: (done: () => void, params: { options: DialogOptionsBase; index: number }) => void
  beforeSure?: (
    done: () => void,
    params: { options: DialogOptionsBase; index: number; closeLoading: () => void }
  ) => void
}

/** 对话框选项（含渲染器） */
export interface DialogOptions extends DialogOptionsBase {
  headerRenderer?: (params: {
    close: () => void
    maximize?: () => void
    minimize?: () => void
  }) => VNode | Component
  contentRenderer?: (params: { options: DialogOptionsBase; index: number }) => VNode | Component
  footerRenderer?: (params: { options: DialogOptionsBase; index: number }) => VNode | Component
}
