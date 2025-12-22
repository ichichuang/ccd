<!-- @/components/schema-form/components/wrappers/WrappedDatePicker.vue -->
<template>
  <DatePicker
    v-model="internalValue"
    :value-format="valueFormat"
    :name="name"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    :class="classProp"
    :style="style"
    v-bind="restProps"
  />
</template>

<script setup lang="ts">
import type { DateValue } from '@/components/modules/date-picker'
import { DatePicker } from '@/components/modules/date-picker'
import { computed } from 'vue'

interface WrappedDatePickerProps {
  modelValue?: Date | number | string | (Date | number | string)[] | null
  valueFormat?: 'timestamp' | 'iso' | 'string' | 'date'
  name?: string
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  class?: string | string[]
  style?: Record<string, string>
  [key: string]: any
}

const props = withDefaults(defineProps<WrappedDatePickerProps>(), {
  valueFormat: 'timestamp',
  modelValue: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  placeholder: undefined,
  class: undefined,
  style: undefined,
})

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'update:modelValue': [value: Date | number | string | (Date | number | string)[] | null]
}>()

/**
 * class 属性（避免使用保留字）
 */
const classProp = computed(() => props.class)

/**
 * 规范化日期值（从外部值转换为 DatePicker 需要的格式）
 */
function normalizeDateValueForDisplay(value: any, _format: string): DateValue {
  if (value === null || value === undefined || value === '') {
    return null
  }

  // 🔥 关键修复：如果 value 是对象，尝试提取实际值
  if (value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
    // 如果是对象，尝试获取其 value 属性
    if ('value' in value) {
      value = value.value
    } else {
      // 无法处理的对象，返回 null
      return null
    }
  }

  const convert = (input: any): Date | null => {
    if (input === null || input === undefined || input === '') {
      return null
    }
    try {
      // 🔥 关键修复：如果 input 是对象，尝试提取实际值
      if (input && typeof input === 'object' && !(input instanceof Date)) {
        if ('value' in input) {
          input = input.value
        } else {
          return null
        }
      }

      // 如果已经是 Date 对象，直接返回
      if (input instanceof Date && !isNaN(input.getTime())) {
        return input
      }

      // 如果是时间戳（数字）
      if (typeof input === 'number' && isFinite(input) && input > 0) {
        return new Date(input)
      }

      // 如果是字符串，尝试解析
      if (typeof input === 'string') {
        const date = new Date(input)
        return isNaN(date.getTime()) ? null : date
      }

      return null
    } catch {
      return null
    }
  }

  // 处理数组（日期范围）
  if (Array.isArray(value)) {
    const dates = value.map(convert).filter(v => v !== null) as Date[]
    // DateRange 是 [Date | null, Date | null] 格式的元组
    if (dates.length >= 2) {
      return [dates[0], dates[1]] as DateValue
    } else if (dates.length === 1) {
      return [dates[0], null] as DateValue
    }
    return null
  }

  const result = convert(value)
  return result as DateValue
}

/**
 * 规范化日期值（从 DatePicker 的值转换为存储格式）
 */
function normalizeDateValueForStorage(
  value: any,
  format: string
): Date | number | string | (Date | number | string)[] | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const convert = (input: any): Date | number | string | null => {
    if (input === null || input === undefined || input === '') {
      return null
    }
    try {
      // 如果已经是 Date 对象
      if (input instanceof Date) {
        if (isNaN(input.getTime())) {
          return null
        }
        if (format === 'timestamp') {
          return input.getTime()
        }
        if (format === 'iso' || format === 'string') {
          return input.toISOString()
        }
        return input
      }

      // 如果是数字（时间戳）
      if (typeof input === 'number' && isFinite(input) && input > 0) {
        if (format === 'iso' || format === 'string') {
          return new Date(input).toISOString()
        }
        return input
      }

      // 如果是字符串
      if (typeof input === 'string') {
        const date = new Date(input)
        if (isNaN(date.getTime())) {
          return null
        }
        if (format === 'timestamp') {
          return date.getTime()
        }
        if (format === 'iso' || format === 'string') {
          return date.toISOString()
        }
        return input
      }

      return null
    } catch {
      return null
    }
  }

  // 处理数组（日期范围）
  if (Array.isArray(value)) {
    const converted = value.map(convert).filter(v => v !== null)
    return converted.length > 0 ? converted : null
  }

  return convert(value)
}

/**
 * 内部值（DateValue 类型，用于 DatePicker 显示）
 */
const internalValue = computed({
  get: (): DateValue => {
    return normalizeDateValueForDisplay(props.modelValue, props.valueFormat)
  },
  set: (val: DateValue) => {
    const normalized = normalizeDateValueForStorage(val, props.valueFormat)
    emit('update:modelValue', normalized)
  },
})

/**
 * 规范化日期 prop（确保 Date 对象正确传递）
 * 处理各种可能的 Date 对象格式：Date 实例、序列化后的对象、时间戳、字符串等
 */
function normalizeDateProp(value: any): Date | number | string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  // 如果已经是 Date 对象，直接返回
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value
  }

  // 如果是普通对象（可能是序列化后的 Date），尝试转换
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    // 检查是否是序列化后的 Date 对象（有 getTime 方法）
    if (typeof value.getTime === 'function') {
      try {
        const date = new Date(value.getTime())
        return isNaN(date.getTime()) ? undefined : date
      } catch {
        return undefined
      }
    }
    // 检查是否有 valueOf 方法（Date 对象的方法）
    if (typeof value.valueOf === 'function') {
      try {
        const timestamp = value.valueOf()
        if (typeof timestamp === 'number' && isFinite(timestamp)) {
          const date = new Date(timestamp)
          return isNaN(date.getTime()) ? undefined : date
        }
      } catch {
        // ignore
      }
    }
    // 检查是否是序列化后的对象（有 $date 或其他常见属性）
    if ('$date' in value && typeof value.$date === 'number') {
      const date = new Date(value.$date)
      return isNaN(date.getTime()) ? undefined : date
    }
    // 如果对象有 toString 方法，尝试解析
    if (typeof value.toString === 'function') {
      try {
        const date = new Date(value.toString())
        if (!isNaN(date.getTime())) {
          return date
        }
      } catch {
        // ignore
      }
    }
    // 无法识别的对象，返回 undefined
    return undefined
  }

  // 如果是数字（时间戳）
  if (typeof value === 'number' && isFinite(value)) {
    const date = new Date(value)
    return isNaN(date.getTime()) ? undefined : date
  }

  // 如果是字符串
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? undefined : date
  }

  // 其他情况返回 undefined
  return undefined
}

/**
 * 提取其他 props（排除已处理的属性，并规范化日期相关的 props）
 */
const restProps = computed(() => {
  const {
    modelValue: _modelValue,
    valueFormat: _valueFormat,
    name: _name,
    disabled: _disabled,
    readonly: _readonly,
    placeholder: _placeholder,
    class: _class,
    style: _style,
    ...rest
  } = props

  // 🔥 修复：规范化 minDate 和 maxDate，确保它们是 Date 对象
  const normalizedRest: Record<string, any> = { ...rest }
  if ('minDate' in normalizedRest) {
    const normalized = normalizeDateProp(normalizedRest.minDate)
    if (normalized !== undefined) {
      normalizedRest.minDate = normalized
    }
  }
  if ('maxDate' in normalizedRest) {
    const normalized = normalizeDateProp(normalizedRest.maxDate)
    if (normalized !== undefined) {
      normalizedRest.maxDate = normalized
    }
  }

  return normalizedRest
})
</script>
