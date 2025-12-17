export { default as DatePicker } from './DatePicker.vue'
export * from './utils/types'

// 导出类型定义
export type {
  DatePickerDefaults,
  DatePickerEmits,
  DatePickerLocaleTexts,
  DatePickerMode,
  DatePickerProps,
  DatePrimitive,
  DateRange,
  DateValue,
  KnownDisplayFormat,
  PresetRange,
  UseDatePickerComputed,
  UseDatePickerExpose,
} from './utils/types'

// 导出常量
export {
  CHINESE_FORMATS,
  COMMON_PRESET_RANGES,
  DATE_PICKER_DEFAULTS,
  datePickerDefaultPropsFactory,
  DEFAULT_LOCALE_TEXTS,
  defaultDisplayFormats,
  ISO_FORMATS,
  SIMPLE_TIME_FORMATS,
  US_FORMATS,
} from './utils/constants'

// 导出工具函数
export {
  formatDate,
  formatModelValue,
  getDateRangeDays,
  getDefaultDisplayFormat,
  isDateInRange,
  isSameDate,
  parseModelValue,
  toDate,
} from './utils/helper'
