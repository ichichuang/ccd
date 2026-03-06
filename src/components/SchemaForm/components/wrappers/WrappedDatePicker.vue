<!-- @/components/SchemaForm/components/wrappers/WrappedDatePicker.vue -->
<template>
  <DatePicker
    :key="componentKey"
    v-model="internalValue"
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
interface WrappedDatePickerProps {
  modelValue?: Date | number | string | (Date | number | string)[] | null
  /** 外部存储格式，仅在本组件内用于转换，不透传给 DatePicker */
  valueFormat?: 'timestamp' | 'iso' | 'string' | 'date'
  name?: string
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  class?: string | string[]
  style?: Record<string, string>
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
  'update:modelValue': [value: Date | number | string | (Date | number | string)[] | null]
}>()

/**
 * class 属性（避免使用保留字）
 */
const classProp = computed(() => props.class)
const attrs = useAttrs()

/**
 * 组件 key
 * @description
 * - 解决部分情况下 PrimeVue DatePicker 在外部值被重置为 null/空值后，
 *   输入框仍然保留上一次字符串展示的问题。
 * - 当值从「有值」变为「空值」时强制重新挂载组件，确保 UI 与表单状态一致。
 */
const componentKey = computed(() => {
  const v = props.modelValue
  // 统一视为「空值」的几种情况
  const isEmpty = v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)

  if (isEmpty) {
    return 'datepicker-empty'
  }

  // 非空时用一个稳定但简短的 key，避免频繁重建组件
  if (Array.isArray(v)) {
    return `datepicker-${v
      .map(item => (item instanceof Date ? item.getTime() : (item ?? '')))
      .join('|')}`
  }

  if (v instanceof Date) {
    return `datepicker-${v.getTime()}`
  }

  return `datepicker-${String(v)}`
})

/**
 * 规范化日期值（从外部值转换为 DatePicker 需要的格式）
 * PrimeVue DatePicker v-model 支持：Date | [Date | null, Date | null]（范围模式）
 */
type DateValue = Date | (Date | null)[] | null | undefined

function unwrapValue(input: unknown): unknown {
  if (
    input &&
    typeof input === 'object' &&
    !(input instanceof Date) &&
    !Array.isArray(input) &&
    'value' in (input as Record<string, unknown>)
  ) {
    return (input as { value: unknown }).value
  }
  return input
}

function normalizeDateValueForDisplay(value: unknown, _format: string): DateValue {
  const resolved = unwrapValue(value)
  if (resolved === null || resolved === undefined || resolved === '') {
    return null
  }

  const convert = (input: unknown): Date | null => {
    if (input === null || input === undefined || input === '') {
      return null
    }
    try {
      const inVal = unwrapValue(input)

      // 如果已经是 Date 对象，直接返回
      if (inVal instanceof Date && !isNaN(inVal.getTime())) {
        return inVal
      }

      // 如果是时间戳（数字）
      if (typeof inVal === 'number' && isFinite(inVal) && inVal > 0) {
        return new Date(inVal)
      }

      // 如果是字符串，尝试解析
      if (typeof inVal === 'string') {
        const date = new Date(inVal)
        return isNaN(date.getTime()) ? null : date
      }

      return null
    } catch {
      return null
    }
  }

  // 处理数组（日期范围）
  if (Array.isArray(resolved)) {
    const dates = resolved.map(convert).filter((v): v is Date => v !== null)
    // DateRange 是 [Date | null, Date | null] 格式的元组
    if (dates.length >= 2) {
      return [dates[0], dates[1]] as [Date, Date]
    } else if (dates.length === 1) {
      return [dates[0], null] as [Date | null, Date | null]
    }
    return null
  }

  const result = convert(resolved)
  return result
}

/**
 * 规范化日期值（从 DatePicker 的值转换为存储格式）
 */
function normalizeDateValueForStorage(
  value: unknown,
  format: string
): Date | number | string | (Date | number | string)[] | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const convert = (input: unknown): Date | number | string | null => {
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
    const converted = value.map(convert).filter((v): v is Date | number | string => v !== null)
    return converted.length > 0 ? converted : null
  }

  return convert(value)
}

/**
 * 内部值（DateValue 类型，用于 DatePicker 显示）
 */
const internalValue = computed({
  get: () => {
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
function normalizeDateProp(value: unknown): Date | number | string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  // 如果已经是 Date 对象，直接返回
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value
  }

  // 如果是普通对象（可能是序列化后的 Date），尝试转换
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    // 检查是否是序列化后的 Date 对象（有 getTime 方法）
    if (typeof obj.getTime === 'function') {
      try {
        const date = new Date((obj.getTime as () => number)())
        return isNaN(date.getTime()) ? undefined : date
      } catch {
        return undefined
      }
    }
    // 检查是否有 valueOf 方法（Date 对象的方法）
    if (typeof obj.valueOf === 'function') {
      try {
        const timestamp = (obj.valueOf as () => unknown)()
        if (typeof timestamp === 'number' && isFinite(timestamp)) {
          const date = new Date(timestamp)
          return isNaN(date.getTime()) ? undefined : date
        }
      } catch {
        // ignore
      }
    }
    // 检查是否是序列化后的对象（有 $date 或其他常见属性）
    if ('$date' in obj && typeof obj.$date === 'number') {
      const date = new Date(obj.$date)
      return isNaN(date.getTime()) ? undefined : date
    }
    // 如果对象有 toString 方法，尝试解析
    if (typeof obj.toString === 'function') {
      try {
        const date = new Date((obj.toString as () => string)())
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
  // 🔥 修复：规范化 minDate 和 maxDate，确保它们是 Date 对象
  const normalizedRest: Record<string, unknown> = { ...(attrs as Record<string, unknown>) }
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
