// @/components/modules/date-picker/utils/constants.ts
/**
 * DatePicker 默认配置常量
 */

import type { DatePickerDefaults, DatePickerMode, PresetRange } from './types'

/**
 * 不同模式的默认展示格式（用于 UI 显示）
 *
 * 注意：这些格式需要与 @vuepic/vue-datepicker 的格式化规范兼容
 * @see https://vue3datepicker.com/props/formatting/
 */
export const defaultDisplayFormats: Record<DatePickerMode, string> = {
  date: 'yyyy-MM-dd', // 日期：2024-01-01
  datetime: 'yyyy-MM-dd HH:mm:ss', // 日期时间：2024-01-01 14:30:00
  time: 'HH:mm:ss', // 时间：14:30:00
  month: 'yyyy-MM', // 月份：2024-01
  year: 'yyyy', // 年份：2024
  week: "yyyy-'W'ww", // 周：2024-W01
  quarter: "yyyy-'Q'Q", // 季度：2024-Q1
}

/**
 * 不带秒的时间格式（常用场景）
 */
export const SIMPLE_TIME_FORMATS: Record<string, string> = {
  datetime: 'yyyy-MM-dd HH:mm',
  time: 'HH:mm',
}

/**
 * 中文格式（可选）
 */
export const CHINESE_FORMATS: Record<DatePickerMode, string> = {
  date: 'yyyy年MM月dd日',
  datetime: 'yyyy年MM月dd日 HH:mm:ss',
  time: 'HH:mm:ss',
  month: 'yyyy年MM月',
  year: 'yyyy年',
  week: "yyyy年'第'ww周",
  quarter: "yyyy年'第'Q季度",
}

/**
 * 美式格式（可选）
 */
export const US_FORMATS: Record<DatePickerMode, string> = {
  date: 'MM/dd/yyyy',
  datetime: 'MM/dd/yyyy hh:mm:ss a',
  time: 'hh:mm:ss a',
  month: 'MM/yyyy',
  year: 'yyyy',
  week: "yyyy-'W'ww",
  quarter: "yyyy-'Q'Q",
}

/**
 * ISO 8601 标准格式
 */
export const ISO_FORMATS: Record<DatePickerMode, string> = {
  date: 'yyyy-MM-dd', // 此处与默认一致，不需要修改
  datetime: "yyyy-MM-dd'T'HH:mm:ss", // 👈 核心格式
  time: 'HH:mm:ss', // 此处与默认一致，不需要修改
  month: 'yyyy-MM',
  year: 'yyyy',
  week: "yyyy-'W'ww",
  quarter: "yyyy-'Q'Q",
}

/**
 * 组件默认配置
 */
export const DATE_PICKER_DEFAULTS: DatePickerDefaults = {
  defaultDisplayFormats,
}

/**
 * 快捷时间范围预设（常用场景）
 */
export const COMMON_PRESET_RANGES = {
  today: {
    label: '今天',
    start: () => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      return now
    },
    end: () => {
      const now = new Date()
      now.setHours(23, 59, 59, 999)
      return now
    },
  },
  yesterday: {
    label: '昨天',
    start: () => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      date.setHours(0, 0, 0, 0)
      return date
    },
    end: () => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      date.setHours(23, 59, 59, 999)
      return date
    },
  },
  last7Days: {
    label: '最近7天',
    start: () => {
      const date = new Date()
      date.setDate(date.getDate() - 6)
      date.setHours(0, 0, 0, 0)
      return date
    },
    end: () => {
      const date = new Date()
      date.setHours(23, 59, 59, 999)
      return date
    },
  },
  last30Days: {
    label: '最近30天',
    start: () => {
      const date = new Date()
      date.setDate(date.getDate() - 29)
      date.setHours(0, 0, 0, 0)
      return date
    },
    end: () => {
      const date = new Date()
      date.setHours(23, 59, 59, 999)
      return date
    },
  },
  thisMonth: {
    label: '本月',
    start: () => {
      const date = new Date()
      date.setDate(1)
      date.setHours(0, 0, 0, 0)
      return date
    },
    end: () => {
      const date = new Date()
      date.setMonth(date.getMonth() + 1, 0)
      date.setHours(23, 59, 59, 999)
      return date
    },
  },
  lastMonth: {
    label: '上月',
    start: () => {
      const date = new Date()
      date.setMonth(date.getMonth() - 1, 1)
      date.setHours(0, 0, 0, 0)
      return date
    },
    end: () => {
      const date = new Date()
      date.setDate(0)
      date.setHours(23, 59, 59, 999)
      return date
    },
  },
  thisYear: {
    label: '今年',
    start: () => {
      const date = new Date()
      date.setMonth(0, 1)
      date.setHours(0, 0, 0, 0)
      return date
    },
    end: () => {
      const date = new Date()
      date.setMonth(11, 31)
      date.setHours(23, 59, 59, 999)
      return date
    },
  },
}

/**
 * 默认的国际化文案（中文）
 */
export const DEFAULT_LOCALE_TEXTS = {
  placeholder: '请选择日期',
  rangePlaceholder: '请选择日期范围',
  clearLabel: '清空',
  cancelLabel: '取消',
  confirmLabel: '确定',
  todayLabel: '今天',
  nowLabel: '此刻',
  selectDate: '选择日期',
  selectTime: '选择时间',
  startDate: '开始日期',
  endDate: '结束日期',
  startTime: '开始时间',
  endTime: '结束时间',
} as const

/**
 * DatePicker 组件 Props 默认值
 *
 * 说明：
 * - 统一集中在此，避免分散在组件中难以维护
 * - 使用工厂函数以确保返回全新的引用，避免对象/数组默认值的共享引用问题
 * - 与 `DatePickerProps` 一一对应，仅为可选项提供默认值，`modelValue` 不设默认
 */
export const datePickerDefaultPropsFactory = () =>
  ({
    // 基础模式与交互
    mode: 'date' as DatePickerMode, // 选择器模式：默认日期选择
    range: false, // 是否开启范围选择：默认关闭
    maxRange: undefined, // 范围模式下的最大跨度（天数）
    minRange: undefined, // 范围模式下的最小跨度（天数）
    disabledDates: undefined, // 禁用的具体日期或区间
    disabledWeekDays: undefined, // 禁用的星期几(0-6)
    yearRange: undefined, // 年份选择范围 [from, to]

    // 展示/值格式（displayFormat 未传时会基于 mode 使用默认格式）
    displayFormat: undefined, // 展示格式：undefined 时按不同 mode 采用内置默认格式
    valueFormat: 'timestamp', // v-model 值格式：'date' | 'timestamp' | 'iso' | 'string'

    // 文案与占位（可配合 i18n 使用）
    localeTexts: undefined, // 自定义按钮/文案：优先于 i18n 内置文案
    placeholder: undefined, // 自定义占位符：未设置时按 i18n 与 mode 自动推导

    // 行为开关
    disabled: false, // 是否禁用：默认可用
    clearable: true, // 是否显示清空按钮：默认显示
    is24: true, // 时间是否使用 24 小时制：默认 24h
    enableSeconds: false, // 时间选择是否显示秒：默认不显示

    // 选择范围限制
    minDate: undefined, // 可选最小日期：默认不限
    maxDate: undefined, // 可选最大日期：默认不限

    // 快捷预设，默认空数组（返回新引用）
    presets: () => [] as PresetRange[], // 快捷选择项：每次返回新数组避免引用共享

    // 展示形态与定位
    inline: false, // 是否内联展示面板：默认使用弹出层
    placement: 'bottom-start', // 弹层出现位置：同 @vuepic/vue-datepicker

    // 样式与类名（返回新引用，避免共享）
    inputStyle: () => ({}) as Record<string, string | number>, // 输入框内联样式
    customClass: '', // 自定义类名：用于外观定制
  }) as const
