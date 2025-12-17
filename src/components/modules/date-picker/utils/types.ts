/**
 * DatePicker 类型定义 —— 基于 @vuepic/vue-datepicker 的二次封装
 *
 * 目标:提供统一的 Props/Emits 定义、默认配置与类型安全
 */

import type { ComputedRef, CSSProperties } from 'vue'

/** 可接受的日期值类型 */
export type DatePrimitive = Date | number | string
export type DateRange = [DatePrimitive | null, DatePrimitive | null]
export type DateValue = DatePrimitive | DateRange | null

/** 选择器模式 */
export type DatePickerMode = 'date' | 'datetime' | 'time' | 'month' | 'year' | 'week' | 'quarter'

/** 快捷范围 */
export interface PresetRange {
  label: string
  /** 开始时间 */
  start: DatePrimitive | (() => DatePrimitive)
  /** 结束时间 */
  end: DatePrimitive | (() => DatePrimitive)
}

/** 文案配置(受 i18n 驱动,可覆盖) */
export interface DatePickerLocaleTexts {
  placeholder?: string
  rangeSeparator?: string
  clearLabel?: string
  cancelLabel?: string
  confirmLabel?: string
  todayLabel?: string
}

/**
 * DatePicker 组件 Props 接口
 *
 * 定义日期选择器组件的所有属性
 *
 * @example
 * ```vue
 * <template>
 *   <DatePicker
 *     v-model="date"
 *     mode="datetime"
 *     :range="false"
 *     display-format="yyyy-MM-dd HH:mm:ss"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import type { DateValue } from '@/components/modules/date-picker'
 *
 * const date = ref<DateValue>(null)
 * </script>
 * ```
 */
export interface DatePickerProps {
  /**
   * v-model 值
   *
   * 支持单个日期、日期范围或 null
   *
   * @default undefined
   * @example
   * - v-model="date" - 单个日期
   * - v-model="dateRange" - 日期范围 [start, end]
   */
  modelValue?: DateValue

  /**
   * 选择器模式
   *
   * 指定日期选择器的显示和选择模式
   *
   * @default 'date'
   * @example
   * - mode="date" - 日期选择
   * - mode="datetime" - 日期时间选择
   * - mode="time" - 时间选择
   * - mode="month" - 月份选择
   * - mode="year" - 年份选择
   * - mode="week" - 周选择
   * - mode="quarter" - 季度选择
   */
  mode?: DatePickerMode

  /**
   * 是否范围选择
   *
   * 启用后，可以选择日期范围而不是单个日期
   *
   * @default false
   * @example
   * - :range="true" - 启用范围选择
   */
  range?: boolean
  /**
   * 范围模式下可选择的最大跨度
   * - 对应 @vuepic/vue-datepicker 的 max-range
   * - 可传天数 number，或按年/月/天的对象
   */
  maxRange?: number
  /**
   * 范围模式下可选择的最小跨度
   * - 对应 @vuepic/vue-datepicker 的 min-range
   */
  minRange?: number
  /** 禁用的具体日期或区间 */
  disabledDates?:
    | Array<DatePrimitive | { start: DatePrimitive; end: DatePrimitive }>
    | ((date: Date) => boolean)
  /** 禁用的星期几(0-6，周日为0) */
  disabledWeekDays?: number[]
  /** 年份选择范围，例如 [2000, 2030] */
  yearRange?: [number, number]
  /**
   * 展示格式(显示用)
   * - 推荐使用以下已知格式，享受智能提示与一致性
   * - 仍允许自定义字符串（与 @vuepic/vue-datepicker 兼容）
   */
  displayFormat?: KnownDisplayFormat | (string & {})
  /** 值格式(v-model 输出用) */
  valueFormat?: 'date' | 'timestamp' | 'iso' | 'string'
  /** 文案(可结合 i18n) */
  localeTexts?: DatePickerLocaleTexts
  /** 占位符(单选/范围自动适配) */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 是否使用 24 小时制(time/datetime 有效) */
  is24?: boolean
  /** 是否显示秒(time/datetime 有效) */
  enableSeconds?: boolean
  /** 最小/最大日期限制 */
  minDate?: DatePrimitive
  maxDate?: DatePrimitive
  /** 快捷范围 */
  presets?: PresetRange[]
  /** 面板是否内联展示 */
  inline?: boolean
  /**
   * 弹层定位
   *
   * 指定日期选择器弹层的显示位置（透传 @vuepic/vue-datepicker）
   *
   * @default undefined
   * @example
   * - placement="bottom" - 底部
   * - placement="top-start" - 顶部左侧对齐
   * - placement="bottom-end" - 底部右侧对齐
   */
  placement?:
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
  /** 宽度样式(内联) */
  inputStyle?: CSSProperties | Record<string, string | number>
  /** 自定义类名 */
  customClass?: string
}

/** 默认配置导出类型 */
export interface DatePickerDefaults {
  defaultDisplayFormats: Record<DatePickerMode, string>
}

/** 组件 Emits(对外暴露) - 使用重载签名避免对象键名校验 */
export type DatePickerEmits = {
  (e: 'update:modelValue', value: DateValue): void
  (e: 'change', value: DateValue): void
  (e: 'open'): void
  (e: 'close'): void
}

/** 组件内部暴露的方法 */
export interface UseDatePickerExpose {
  open: () => void
  close: () => void
  clear: () => void
}

/**
 * 内部计算属性导出(仅为统一返回类型,可选)
 */
export interface UseDatePickerComputed {
  effectiveDisplayFormat: ComputedRef<string>
}

/**
 * 已知且经过验证的展示格式集合（覆盖常见场景与中英混合格式）
 * 说明：这里的类型仅用于提高类型提示的严谨度，不会限制传入其他自定义字符串
 */
export type KnownDisplayFormat =
  | 'yyyy-MM-dd'
  | 'yyyy-MM-dd HH:mm'
  | 'yyyy-MM-dd HH:mm:ss'
  | 'HH:mm'
  | 'HH:mm:ss'
  | 'yyyy-MM'
  | 'yyyy'
  | "yyyy-'W'ww"
  | "yyyy-'Q'Q"
  | 'MM/dd/yyyy'
  | 'MM/dd/yyyy hh:mm:ss a'
  | 'hh:mm:ss a'
  | 'MM/yyyy'
  | "yyyy-MM-dd'T'HH:mm:ss"
  | 'yyyy年MM月dd日'
  | 'yyyy年MM月dd日 HH:mm:ss'
  | 'yyyy年MM月'
  | 'yyyy年'
  | "yyyy年'第'ww周"
  | "yyyy年'第'Q季度"
