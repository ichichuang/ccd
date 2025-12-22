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
  options: DialogOptions
  index: number
}

export type BtnClickButton = {
  btn?: ButtonProps
  index: number
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
export interface DialogOptions extends Omit<Partial<PrimeDialogProps>, 'header'> {
  /**
   * 对话框类型
   *
   * @default 'dialog'
   * @example
   * - type="dialog" - 标准对话框
   * - type="confirm" - 确认对话框
   * - type="dynamic" - 动态对话框
   */
  type?: DialogType

  /**
   * 对话框的显示与隐藏
   *
   * 控制对话框的可见性，通常由组件内部管理
   *
   * @default false
   * @example
   * - visible: true - 显示对话框
   */
  visible?: boolean

  /**
   * 对话框的标题
   *
   * 支持字符串或函数形式，函数形式可用于实现响应式多语言
   *
   * @default undefined
   * @example
   * ```typescript
   * // 字符串形式
   * header: '对话框标题'
   *
   * // 函数形式（支持多语言）
   * header: () => t('dialog.title')
   * ```
   */
  header?: string | (() => string)

  /**
   * 对话框的宽度
   *
   * 支持字符串（如 '800px', '50%'）或数字（像素值）
   *
   * @default '50%'
   * @example
   * - width: '800px'
   * - width: '50%'
   * - width: 800
   */
  width?: string | number

  /**
   * 对话框的高度
   *
   * 支持字符串（如 '600px', '80vh'）或数字（像素值）
   *
   * @default 'auto'
   * @example
   * - height: '600px'
   * - height: '80vh'
   * - height: 600
   */
  height?: string | number

  /**
   * 是否为全屏对话框
   *
   * 设置为 true 时，对话框会占据整个屏幕
   *
   * @default false
   * @example
   * - fullscreen: true - 全屏显示
   */
  fullscreen?: boolean

  /**
   * 是否显示全屏操作图标
   *
   * 在对话框头部显示全屏切换按钮
   *
   * @default false
   */
  fullscreenIcon?: boolean

  /**
   * 是否可拖拽
   *
   * 启用后，可以通过拖拽头部来移动对话框
   *
   * @default false
   * @example
   * - draggable: true - 允许拖拽
   */
  draggable?: boolean

  /**
   * 是否显示遮罩
   *
   * 遮罩层会阻止用户与背景内容的交互
   *
   * @default true
   * @example
   * - modal: true - 显示遮罩（默认）
   * - modal: false - 不显示遮罩
   */
  modal?: boolean

  /**
   * 对话框位置
   *
   * 指定对话框在屏幕上的初始位置
   *
   * @default 'center'
   * @example
   * - position: 'center' - 居中（默认）
   * - position: 'top' - 顶部居中
   * - position: 'topleft' - 左上角
   */
  position?: DialogPosition | string
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
  /**
   * 是否可以通过按下 ESC 键关闭对话框
   *
   * @default true
   * @example
   * - closeOnEscape: true - 按 ESC 键关闭（默认）
   * - closeOnEscape: false - 禁用 ESC 键关闭
   */
  closeOnEscape?: boolean

  /**
   * 是否可以通过点击遮罩关闭对话框
   *
   * @default true
   * @example
   * - closeOnMask: true - 点击遮罩关闭（默认）
   * - closeOnMask: false - 禁用点击遮罩关闭
   */
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
