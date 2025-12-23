import type { ButtonProps as PrimeButtonProps } from 'primevue/button'
import type { DialogProps as PrimeDialogProps } from 'primevue/dialog'
import type { Component, CSSProperties, VNode } from 'vue'

/**
 * 对话框事件类型
 *
 * - 'open': 对话框打开
 * - 'close': 对话框关闭
 * - 'maximize': 对话框最大化
 * - 'minimize': 对话框最小化
 * - 'fullscreen': 对话框全屏
 */
export type EventType = 'open' | 'close' | 'maximize' | 'minimize' | 'fullscreen'

/**
 * 关闭参数类型
 *
 * 用于标识对话框关闭的方式
 */
export type ArgsType = {
  /**
   * 关闭命令
   *
   * - 'cancel': 点击取消按钮
   * - 'sure': 点击确定按钮
   * - 'close': 点击右上角关闭按钮、点击遮罩或按下 ESC 键
   */
  command: 'cancel' | 'sure' | 'close'
}

/**
 * 按钮类型（severity）
 *
 * PrimeVue Button 组件支持的样式类型
 *
 * - 'primary': 主要按钮（蓝色）
 * - 'secondary': 次要按钮（灰色）
 * - 'success': 成功按钮（绿色）
 * - 'info': 信息按钮（蓝色）
 * - 'warning': 警告按钮（橙色）
 * - 'danger': 危险按钮（红色）
 * - 'help': 帮助按钮
 */
export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'help'

/**
 * 对话框类型
 *
 * - 'dialog': 标准对话框
 * - 'confirm': 确认对话框
 * - 'dynamic': 动态对话框（支持自定义组件）
 */
export type DialogType = 'dialog' | 'confirm' | 'dynamic'

/**
 * 对话框位置类型
 *
 * 用于指定对话框在屏幕上的位置
 */
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

/**
 * 基础按钮属性接口
 *
 * 继承 PrimeVue Button 组件的所有属性，并添加自定义属性
 * 使用 Omit 移除冲突的 label 属性，然后添加自定义的 label 类型定义
 */
export interface ButtonProps extends Omit<Partial<PrimeButtonProps>, 'label'> {
  /**
   * 按钮文字（必填）
   *
   * 支持字符串或函数形式，函数形式可用于实现响应式多语言
   *
   * @example
   * ```typescript
   * // 字符串形式
   * { label: '确定' }
   *
   * // 函数形式（支持多语言）
   * { label: () => t('common.confirm') }
   * ```
   */
  label: string | (() => string)

  /**
   * 按钮类型（severity）
   *
   * 控制按钮的视觉样式
   *
   * @default undefined
   * @example
   * - severity="primary" - 主要按钮
   * - severity="danger" - 危险按钮
   */
  severity?: ButtonType

  /**
   * 是否为加载中状态
   *
   * 显示加载动画，通常用于异步操作
   *
   * @default false
   * @example
   * - :loading="isSubmitting" - 根据提交状态显示加载
   */
  loading?: boolean

  /**
   * 点击按钮后触发的回调
   *
   * @param params 回调参数
   * @param params.dialog 当前对话框信息
   * @param params.button 当前按钮信息
   * @example
   * ```typescript
   * {
   *   label: '确定',
   *   btnClick: ({ dialog, button }) => {
   *     console.log('对话框索引:', dialog.index)
   *     console.log('按钮索引:', button.index)
   *     // 执行确认操作
   *   }
   * }
   * ```
   */
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
  options: DialogOptionsBase
  index: number
}

export type BtnClickButton = {
  btn?: ButtonProps
  index: number
}

/**
 * 对话框基础选项（移除渲染器以避免类型递归）
 */
export interface DialogOptionsBase extends Omit<Partial<PrimeDialogProps>, 'header'> {
  type?: DialogType
  visible?: boolean
  header?: string | (() => string)
  width?: string | number
  height?: string | number
  fullscreen?: boolean
  fullscreenIcon?: boolean
  draggable?: boolean
  modal?: boolean
  position?: DialogPosition | string
  appendTo?: string
  maximizable?: boolean
  minimizable?: boolean
  class?: string
  style?: CSSProperties
  openDelay?: number
  closeDelay?: number
  closeOnEscape?: boolean
  closeOnMask?: boolean
  closable?: boolean
  beforeClose?: (done: () => void) => void
  center?: boolean
  destroyOnClose?: boolean
  props?: any
  hideFooter?: boolean
  hideHeader?: boolean
  hideClose?: boolean
  confirmOptions?: ConfirmOptions
  sureBtnLoading?: boolean
  footerButtons?: Array<ButtonProps>
  open?: ({ options, index }: { options: DialogOptionsBase; index: number }) => void
  close?: ({ options, index }: { options: DialogOptionsBase; index: number }) => void
  closeCallBack?: ({
    options,
    index,
    args,
  }: {
    options: DialogOptionsBase
    index: number
    args: any
  }) => void
  fullscreenCallBack?: ({ options, index }: { options: DialogOptionsBase; index: number }) => void
  maximizeCallBack?: ({ options, index }: { options: DialogOptionsBase; index: number }) => void
  minimizeCallBack?: ({ options, index }: { options: DialogOptionsBase; index: number }) => void
  beforeCancel?: (
    done: () => void,
    {
      options,
      index,
    }: {
      options: DialogOptionsBase
      index: number
    }
  ) => void
  beforeSure?: (
    done: () => void,
    {
      options,
      index,
      closeLoading,
    }: {
      options: DialogOptionsBase
      index: number
      closeLoading: () => void
    }
  ) => void
  component?: any
  data?: any
  listeners?: any
}

/**
 * 确认对话框配置接口
 *
 * 用于配置确认对话框的显示内容和行为
 *
 * @example
 * ```typescript
 * const confirmOptions: ConfirmOptions = {
 *   header: '确认删除',
 *   message: '确定要删除这条记录吗？此操作不可撤销。',
 *   acceptLabel: '确定删除',
 *   rejectLabel: '取消',
 *   acceptIcon: 'pi pi-trash',
 *   position: 'center'
 * }
 * ```
 */
export interface ConfirmOptions {
  /**
   * 确认对话框标题
   *
   * @default undefined
   * @example
   * - header="确认删除"
   */
  header?: string

  /**
   * 确认对话框内容
   *
   * 显示在对话框主体中的消息文本
   *
   * @default undefined
   * @example
   * - message="确定要删除这条记录吗？"
   */
  message?: string

  /**
   * 确认按钮文字
   *
   * @default "确定"
   * @example
   * - acceptLabel="确定删除"
   */
  acceptLabel?: string

  /**
   * 取消按钮文字
   *
   * @default "取消"
   * @example
   * - rejectLabel="取消"
   */
  rejectLabel?: string

  /**
   * 确认按钮图标
   *
   * 支持 PrimeVue Icons 或自定义图标名称
   *
   * @default undefined
   * @example
   * - acceptIcon="pi pi-check"
   */
  acceptIcon?: string

  /**
   * 取消按钮图标
   *
   * 支持 PrimeVue Icons 或自定义图标名称
   *
   * @default undefined
   * @example
   * - rejectIcon="pi pi-times"
   */
  rejectIcon?: string

  /**
   * 确认按钮样式类名
   *
   * 自定义确认按钮的 CSS 类名
   *
   * @default undefined
   * @example
   * - acceptClass="custom-accept-btn"
   */
  acceptClass?: string

  /**
   * 取消按钮样式类名
   *
   * 自定义取消按钮的 CSS 类名
   *
   * @default undefined
   * @example
   * - rejectClass="custom-reject-btn"
   */
  rejectClass?: string

  /**
   * 确认对话框位置
   *
   * 指定确认对话框在屏幕上的位置
   *
   * @default 'center'
   * @example
   * - position="top" - 顶部居中
   * - position="topleft" - 左上角
   */
  position?: DialogPosition

  /**
   * 确认对话框组名
   *
   * 用于分组多个确认对话框，同一组的对话框会共享同一个实例
   *
   * @default undefined
   * @example
   * - group="delete-confirm" - 删除确认对话框组
   */
  group?: string
}

/**
 * 动态对话框配置接口
 *
 * 用于配置动态对话框（支持渲染自定义组件）
 *
 * @example
 * ```typescript
 * import MyComponent from './MyComponent.vue'
 *
 * const dynamicOptions: DynamicDialogOptions = {
 *   component: MyComponent,
 *   props: { title: '动态对话框' },
 *   data: { id: 123 },
 *   listeners: {
 *     close: () => console.log('关闭'),
 *     submit: (data) => console.log('提交', data)
 *   }
 * }
 * ```
 */
export interface DynamicDialogOptions {
  /**
   * 要渲染的组件（必填）
   *
   * 可以是 Vue 组件或组件定义
   *
   * @example
   * ```typescript
   * import MyComponent from './MyComponent.vue'
   * component: MyComponent
   * ```
   */
  component: Component | any

  /**
   * 传递给组件的 props
   *
   * 对象形式的属性，会作为 props 传递给组件
   *
   * @default undefined
   * @example
   * ```typescript
   * props: {
   *   title: '标题',
   *   data: { id: 123 }
   * }
   * ```
   */
  props?: Record<string, any>

  /**
   * 传递给组件的数据
   *
   * 通过 provide/inject 或事件传递给组件的数据
   *
   * @default undefined
   */
  data?: any

  /**
   * 事件监听器
   *
   * 监听组件发出的事件
   *
   * @default undefined
   * @example
   * ```typescript
   * listeners: {
   *   close: () => console.log('关闭'),
   *   submit: (data) => handleSubmit(data)
   * }
   * ```
   */
  listeners?: Record<string, (...args: any[]) => void>

  /**
   * 对话框样式
   *
   * 应用于对话框容器的样式
   *
   * @default undefined
   * @example
   * - style="{ width: '800px', height: '600px' }"
   */
  style?: CSSProperties

  /**
   * 对话框类名
   *
   * 应用于对话框容器的 CSS 类名
   *
   * @default undefined
   * @example
   * - class="custom-dialog"
   */
  class?: string
}

/**
 * 对话框选项接口
 *
 * 定义对话框组件的所有配置选项，继承 PrimeVue Dialog 组件的所有属性
 * 使用 Omit 移除冲突的 header 属性，然后添加自定义的 header 类型定义
 *
 * @example
 * ```typescript
 * const dialogOptions: DialogOptions = {
 *   type: 'dialog',
 *   header: '标题',
 *   visible: true,
 *   width: '800px',
 *   draggable: true,
 *   contentRenderer: ({ options, index }) => h('div', '内容'),
 *   footerButtons: [
 *     { label: '取消', severity: 'secondary' },
 *     { label: '确定', severity: 'primary' }
 *   ]
 * }
 * ```
 */
export interface DialogOptions extends DialogOptionsBase {
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
    options: DialogOptionsBase
    index: number
  }) => VNode | Component
  /** 自定义按钮操作区的内容渲染器 */
  footerRenderer?: ({
    options,
    index,
  }: {
    options: DialogOptionsBase
    index: number
  }) => VNode | Component
}
