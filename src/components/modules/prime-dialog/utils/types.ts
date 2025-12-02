import type { ButtonProps as PrimeButtonProps } from 'primevue/button'
import type { DialogProps as PrimeDialogProps } from 'primevue/dialog'
import type { Component, CSSProperties, VNode } from 'vue'

// 基础事件类型
export type EventType = 'open' | 'close' | 'maximize' | 'minimize' | 'fullscreen'

// 关闭参数类型
export type ArgsType = {
  /** `cancel` 点击取消按钮、`sure` 点击确定按钮、`close` 点击右上角关闭按钮或空白页或按下了esc键 */
  command: 'cancel' | 'sure' | 'close'
}

// 按钮类型
export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'help'

// 对话框类型
export type DialogType = 'dialog' | 'confirm' | 'dynamic'

// 基础按钮属性
export interface ButtonProps extends Partial<PrimeButtonProps> {
  /** 按钮文字（支持函数形式以实现响应式多语言） */
  label: string | (() => string)
  /** 按钮类型 */
  severity?: ButtonType
  /** 是否为加载中状态 */
  loading?: boolean
  /** 点击按钮后触发的回调 */
  btnClick?: ({
    dialog,
    button,
  }: {
    /** 当前 Dialog 信息 */
    dialog: BtnClickDialog
    /** 当前 button 信息 */
    button: BtnClickButton
  }) => void
}

// 按钮点击参数类型
export type BtnClickDialog = {
  options: DialogOptions
  index: number
}

export type BtnClickButton = {
  btn?: ButtonProps
  index: number
}

// 确认对话框配置
export interface ConfirmOptions {
  /** 确认对话框标题 */
  header?: string
  /** 确认对话框内容 */
  message?: string
  /** 确认按钮文字 */
  acceptLabel?: string
  /** 取消按钮文字 */
  rejectLabel?: string
  /** 确认按钮图标 */
  acceptIcon?: string
  /** 取消按钮图标 */
  rejectIcon?: string
  /** 确认按钮样式 */
  acceptClass?: string
  /** 取消按钮样式 */
  rejectClass?: string
  /** 确认对话框位置 */
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topleft'
    | 'topright'
    | 'bottomleft'
    | 'bottomright'
  /** 确认对话框组名 */
  group?: string
}

// 动态对话框配置
export interface DynamicDialogOptions {
  /** 要渲染的组件 */
  component: any
  /** 传递给组件的 props */
  props?: any
  /** 传递给组件的数据 */
  data?: any
  /** 事件监听器 */
  listeners?: any
  /** 样式 */
  style?: CSSProperties
  /** 类名 */
  class?: string
}

// 对话框选项接口
export interface DialogOptions extends Partial<PrimeDialogProps> {
  /** 对话框类型 */
  type?: DialogType
  /** 对话框的显示与隐藏 */
  visible?: boolean
  /** 对话框的标题（支持函数形式以实现响应式多语言） */
  header?: string | (() => string)
  /** 对话框的宽度 */
  width?: string | number
  /** 对话框的高度 */
  height?: string | number
  /** 是否为全屏对话框 */
  fullscreen?: boolean
  /** 是否显示全屏操作图标 */
  fullscreenIcon?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否显示遮罩 */
  modal?: boolean
  /** 对话框位置 */
  position?: string
  /** 附加到指定元素 */
  appendTo?: string
  /** 是否显示最大化按钮 */
  maximizable?: boolean
  /** 是否显示最小化按钮 */
  minimizable?: boolean
  /** 对话框的自定义类名 */
  class?: string
  /** 对话框的自定义样式 */
  style?: CSSProperties
  /** 对话框打开的延时时间，单位毫秒 */
  openDelay?: number
  /** 对话框关闭的延时时间，单位毫秒 */
  closeDelay?: number
  /** 是否可以通过按下 ESC 键关闭对话框 */
  closeOnEscape?: boolean
  /** 是否可以通过点击遮罩关闭对话框 */
  closeOnMask?: boolean
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 关闭前的回调 */
  beforeClose?: (done: () => void) => void
  /** 是否让对话框的 header 和 footer 部分居中排列 */
  center?: boolean
  /** 当关闭对话框时，销毁其中的元素 */
  destroyOnClose?: boolean
  /** 内容区组件的 props */
  props?: any
  /** 是否隐藏对话框按钮操作区的内容 */
  hideFooter?: boolean
  /** 是否隐藏对话框头部（包括头部内容和关闭按钮） */
  hideHeader?: boolean
  /** 是否隐藏关闭按钮 */
  hideClose?: boolean
  /** 确认对话框相关配置 */
  confirmOptions?: ConfirmOptions
  /** 点击确定按钮后是否开启 loading 加载动画 */
  sureBtnLoading?: boolean
  /**
   * 自定义对话框标题的内容渲染器
   */
  headerRenderer?: ({
    close,
    maximize,
    minimize,
  }: {
    close: () => void
    maximize?: () => void
    minimize?: () => void
  }) => VNode | Component
  /** 自定义内容渲染器 */
  contentRenderer?: ({
    options,
    index,
  }: {
    options: DialogOptions
    index: number
  }) => VNode | Component
  /** 自定义按钮操作区的内容渲染器 */
  footerRenderer?: ({
    options,
    index,
  }: {
    options: DialogOptions
    index: number
  }) => VNode | Component
  /** 自定义底部按钮操作 */
  footerButtons?: Array<ButtonProps>
  /** 对话框打开后的回调 */
  open?: ({ options, index }: { options: DialogOptions; index: number }) => void
  /** 对话框关闭后的回调 */
  close?: ({ options, index }: { options: DialogOptions; index: number }) => void
  /** 对话框关闭后的回调 */
  closeCallBack?: ({
    options,
    index,
    args,
  }: {
    options: DialogOptions
    index: number
    args: any
  }) => void
  /** 点击全屏按钮时的回调 */
  fullscreenCallBack?: ({ options, index }: { options: DialogOptions; index: number }) => void
  /** 点击最大化按钮时的回调 */
  maximizeCallBack?: ({ options, index }: { options: DialogOptions; index: number }) => void
  /** 点击最小化按钮时的回调 */
  minimizeCallBack?: ({ options, index }: { options: DialogOptions; index: number }) => void
  /** 点击底部取消按钮的回调 */
  beforeCancel?: (
    done: () => void,
    {
      options,
      index,
    }: {
      options: DialogOptions
      index: number
    }
  ) => void
  /** 点击底部确定按钮的回调 */
  beforeSure?: (
    done: () => void,
    {
      options,
      index,
      closeLoading,
    }: {
      options: DialogOptions
      index: number
      /** 关闭确定按钮的 loading 加载动画 */
      closeLoading: () => void
    }
  ) => void
  /** 动态对话框相关配置 */
  component?: any
  data?: any
  listeners?: any
}
