<script setup lang="ts">
import { useThemeSwitch } from '@/hooks'
import { getCurrentLocale, t } from '@/locales'
import VueDatePicker from '@vuepic/vue-datepicker'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { datePickerDefaultPropsFactory, ISO_FORMATS } from './utils/constants'
import { formatModelValue, formatSimpleIso, getDefaultDisplayFormat, toDate } from './utils/helper'
import type {
  DatePickerEmits,
  DatePickerProps,
  DateValue,
  UseDatePickerExpose,
} from './utils/types'

// 放宽模板类型校验，避免严格模板下对 ref/属性的限制
const datePickerComp: any = VueDatePicker
// 调试日志禁用
const debugDatePicker = (..._args: any[]) => {}

type Props = DatePickerProps

const props = withDefaults(defineProps<Props>(), datePickerDefaultPropsFactory())

const emit = defineEmits<DatePickerEmits>()

// 调试：检查 props 中是否有事件处理器
debugDatePicker('[SchemaForm][DatePicker] props received', {
  modelValue: props.modelValue,
  valueFormat: props.valueFormat,
  // 注意：在 Vue 3 中，事件处理器不会出现在 props 中
  // 它们是通过 $attrs 或直接绑定到组件上的
})

// 主题切换支持
const { isDark } = useThemeSwitch()

// 多语言支持
const currentLocale = ref(getCurrentLocale())

// 内部值：与 vue-datepicker 的 model-type 对齐（date | timestamp | format）
const innerValue = ref<any>(null)

// 标记是否正在内部更新，防止循环触发
const isInternalUpdate = ref(false)

// DatePicker.vue (约 105 行)
// 有效展示格式（未传时随模式提供默认）
const effectiveDisplayFormat = computed(() => {
  // 1. 如果用户手动传入了 displayFormat，优先使用
  if (props.displayFormat) {
    return props.displayFormat
  }

  const vf = inferredValueFormat.value
  const mode = props.mode

  // 2. 【核心修复】如果 valueFormat 是 'iso' 或 'string'，
  //    必须使用 ISO 格式作为默认显示格式，确保底层组件能解析输入的 ISO 字符串。
  //    注意：我们只对 datetime 模式做此覆盖，因为 date/time/month/year 等ISO格式与默认格式是相同的。
  if (
    (vf === 'iso' || vf === 'string') &&
    (mode === 'datetime' || mode === 'time' || mode === 'date')
  ) {
    // 使用 ISO_FORMATS 中对应的格式，确保与传入的 innerValue 字符串格式兼容
    return ISO_FORMATS[mode] || ISO_FORMATS.datetime // 使用 ISO_FORMATS 里的对应格式
  }

  // 3. 否则，使用 mode 默认格式
  return getDefaultDisplayFormat(mode)
})

// 根据初始 modelValue 智能推断输出类型（未显式指定时）
const inferredValueFormat = computed<'date' | 'timestamp' | 'iso' | 'string'>(() => {
  if (props.valueFormat) {
    return props.valueFormat
  }
  const v = props.modelValue as unknown

  // 处理 null/undefined
  if (v === null || v === undefined) {
    return 'date'
  }

  if (Array.isArray(v)) {
    // 取第一个非空值进行类型推断
    const first = v.find(item => item !== null && item !== undefined)
    if (!first) {
      return 'date'
    }
    if (typeof first === 'number') {
      return 'timestamp'
    }
    if (typeof first === 'string') {
      return 'string'
    }
    return 'date'
  }

  if (typeof v === 'number') {
    return 'timestamp'
  }
  if (typeof v === 'string') {
    return 'string'
  }
  return 'date'
})

// DatePicker.vue (约 132 行)
// modelType 映射（控制内部组件输出格式）
const modelType = computed(() => {
  const vf = inferredValueFormat.value
  if (vf === 'timestamp') {
    return 'timestamp'
  }
  // 【新逻辑】如果外部期望的是 'iso' 或 'string' 格式，
  // 我们应该让 vue-datepicker 直接输出格式化后的值（字符串），
  // 这样可以避免内部的 Date 对象转换失败。
  if (vf === 'iso' || vf === 'string') {
    return 'format' // 👈 关键更改：让底层组件输出字符串
  }
  // 其余场景（date）使用 Date 作为内部模型
  return 'date'
})

// 选择器模式映射到 vue-datepicker 的特性开关
const isDateTime = computed(() => props.mode === 'datetime')
const isTimeOnly = computed(() => props.mode === 'time')
const isMonth = computed(() => props.mode === 'month')
const isYear = computed(() => props.mode === 'year')
const isWeek = computed(() => props.mode === 'week')
// quarter 暂无官方季度面板，用 monthPicker + 自定义格式近似
const isQuarter = computed(() => props.mode === 'quarter')

// placeholder 文案
const placeholderText = computed(() => {
  if (props.placeholder) {
    return props.placeholder
  }
  const text = props.localeTexts?.placeholder
  if (text) {
    return text
  }
  // 确保响应语言变化，通过监听 currentLocale 来触发重新计算
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLocaleValue = currentLocale.value // 添加依赖，确保语言变化时重新计算

  // 根据不同的 mode 和 range 显示相应的 placeholder
  // 兼容语言包未提供 `range-date`，统一映射为 `range`
  const modeKey = props.range
    ? props.mode === 'date'
      ? 'range'
      : `range-${props.mode}`
    : props.mode
  const specificPlaceholder = t(`components.datePicker.placeholders.${modeKey}`)

  if (
    specificPlaceholder &&
    specificPlaceholder !== `components.datePicker.placeholders.${modeKey}`
  ) {
    return specificPlaceholder
  }

  // 回退到通用 placeholder
  return props.range
    ? t('components.datePicker.rangePlaceholder') || '选择时间范围'
    : t('components.datePicker.placeholder') || '选择时间'
})

// 预设范围格式转换为 vue-datepicker 的 preset-dates
const presetDates = computed(() => {
  if (!props.presets || props.presets.length === 0) {
    return []
  }
  return props.presets
    .map(p => {
      const startRaw = typeof p.start === 'function' ? p.start() : p.start
      const endRaw = typeof p.end === 'function' ? p.end() : p.end
      const start = toDate(startRaw)
      const end = toDate(endRaw)

      // 验证预设值有效性
      if (!start || !end) {
        // 无效预设范围时静默跳过
        return null
      }

      return {
        label: p.label,
        value: props.range ? [start, end] : start,
      }
    })
    .filter(Boolean) as Array<{ label: string; value: Date | [Date, Date] }>
})

// 将外部值规范化为与 modelType 一致的类型
const normalizeForModelType = (
  value: DateValue,
  vf: 'date' | 'timestamp' | 'iso' | 'string'
):
  | Date
  | number
  | string
  | null
  | [Date | number | string | null, Date | number | string | null] => {
  // 处理 null/undefined
  if (value === null || value === undefined) {
    return null
  }

  // 处理数组（范围选择）
  if (Array.isArray(value)) {
    const a = normalizeForModelType(value[0] as any, vf)
    const b = normalizeForModelType(value[1] as any, vf)
    return [a as any, b as any]
  }

  if (vf === 'timestamp') {
    if (typeof value === 'number') {
      return value
    }
    const d = toDate(value as any)
    return d ? d.getTime() : null
  }

  // 【核心修改】对于 'iso' 或 'string' 格式，底层组件需要格式化字符串
  if (vf === 'iso' || vf === 'string') {
    // 此时底层 modelType 是 'format'
    const d = toDate(value as any)

    if (!d) {
      return null
    }

    // 【使用简化 ISO 格式】
    // 我们强制 innerValue 使用简化格式 (YYYY-MM-DDTHH:mm:ss)
    // 来匹配 effectiveDisplayFormat = "yyyy-MM-dd'T'HH:mm:ss" 的解析要求。
    return formatSimpleIso(d)
  }

  // 其余（date）一律转为 Date
  return toDate(value as any)
}

// 比较两个值是否相等（深度比较）
const isValueEqual = (a: any, b: any): boolean => {
  if (a === b) {
    return true
  }

  if (a === null || b === null || a === undefined || b === undefined) {
    return false
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }
    return a.every((item, index) => {
      const aTime = item instanceof Date ? item.getTime() : item
      const bTime = b[index] instanceof Date ? b[index].getTime() : b[index]
      return aTime === bTime
    })
  }

  // 【新增逻辑】如果 a 和 b 都是字符串，进行严格比较
  if (typeof a === 'string' && typeof b === 'string') {
    return a === b
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // Fallback to strict comparison for primitives or unhandled types
  return a === b
}

// 内部值变化 -> 派发给外部（按 valueFormat 输出）
const handleUpdate = (val: any) => {
  // 对于 date/iso/string 格式，确保 val 是 Date 对象
  // 如果 val 是字符串或其他类型，尝试转换为 Date 对象
  if (modelType.value === 'date') {
    if (!(val instanceof Date)) {
      // 如果是数组（范围选择），检查每个元素
      if (Array.isArray(val)) {
        const convertedArray = val.map(item => {
          if (item instanceof Date) {
            return item
          }
          const converted = toDate(item)
          return converted || null
        })

        // 如果所有元素都转换成功，使用转换后的数组
        if (convertedArray.every(item => item !== null || val.includes(null))) {
          val = convertedArray as any
          innerValue.value = val
        } else {
          innerValue.value = null
          // 强制触发组件重新渲染，清除 vue-datepicker 内部的无效缓存
          renderKey.value += 1
          emit('update:modelValue', null)
          emit('change', null)
          return
        }
      } else {
        // 单值选择
        const convertedDate = toDate(val)
        if (convertedDate) {
          val = convertedDate
          // 更新 innerValue 为正确的 Date 对象
          innerValue.value = val
        } else {
          // 如果转换失败，强制清空值并触发重新渲染
          innerValue.value = null
          renderKey.value += 1
          emit('update:modelValue', null)
          emit('change', null)
          return
        }
      }
    }
  }

  let out: DateValue
  if (Array.isArray(val)) {
    const left = formatModelValue(val[0], inferredValueFormat.value)
    const right = formatModelValue(val[1], inferredValueFormat.value)
    // 当范围两端均为空/无效时，向外派发 null，避免出现 1970-01-01
    if ((left === null || left === undefined) && (right === null || right === undefined)) {
      out = null
    } else {
      out = [left, right] as any
    }
  } else {
    // 单值为空时同样派发 null
    const single = formatModelValue(val, inferredValueFormat.value)
    out = single === null || single === undefined ? null : (single as any)
  }

  // 对于 iso/string 格式，不设置 isInternalUpdate 标志
  // 因为需要让 watch 能够处理外部更新，确保 innerValue 与外部值同步
  // 由于 isValueEqual 会检查值是否真的变化，所以不会造成循环更新
  if (inferredValueFormat.value !== 'iso' && inferredValueFormat.value !== 'string') {
    isInternalUpdate.value = true
  }

  emit('update:modelValue', out)
  emit('change', out)

  // 使用 nextTick 确保外部更新完成后再解除锁定
  if (inferredValueFormat.value !== 'iso' && inferredValueFormat.value !== 'string') {
    nextTick(() => {
      isInternalUpdate.value = false
    })
  }
}

// 外部值或推断格式变化 -> 同步内部值为正确类型
watch(
  [() => props.modelValue as DateValue, inferredValueFormat],
  ([next, vf]) => {
    // 跳过内部触发的更新
    if (isInternalUpdate.value) {
      return
    }

    // 若外部未提供值，保持为空
    if (next === null || next === undefined) {
      // 对于范围模式，使用 null 而非 [null, null]，避免组件内部默认化为起始时间
      innerValue.value = null
      return
    }

    const normalized = normalizeForModelType(next, vf)

    // 对于 date/iso/string 格式，确保 normalized 是 Date 对象或 null
    // 如果 normalizeForModelType 返回了无效值，应该设置为 null
    if (modelType.value === 'date') {
      if (modelType.value === 'date') {
        if (Array.isArray(normalized)) {
          // Range mode validation: Check if any item in the array is invalid (not Date or null)
          const hasInvalidItem = normalized.some(item => item !== null && !(item instanceof Date))
          if (hasInvalidItem) {
            console.warn(
              '[DatePicker] watch: normalized array has invalid items for modelType="date", setting to null',
              normalized
            )
            innerValue.value = null
            return
          }
        } else if (normalized !== null && !(normalized instanceof Date)) {
          // Single mode validation: Check if it is a single invalid value
          console.warn(
            '[DatePicker] watch: normalized is not Date or null for modelType="date", setting to null',
            {
              normalized,
            }
          )
          innerValue.value = null
          return
        }
      }
      // 对于数组类型（范围选择），检查每个元素
      if (Array.isArray(normalized)) {
        const hasInvalidItem = normalized.some(item => item !== null && !(item instanceof Date))
        if (hasInvalidItem) {
          innerValue.value = null
          return
        }
      }
    }

    const isEqual = isValueEqual(innerValue.value, normalized)

    // 只在值真正变化时更新，避免不必要的重渲染
    if (!isEqual) {
      innerValue.value = normalized
    }
  },
  { immediate: true, deep: true }
)

// 菜单打开事件
const handleOpen = () => {
  emit('open')
}

// 菜单关闭事件
const handleClose = () => {
  emit('close')
}

// 暴露方法
const dpRef = ref<any>(null)
const open = () => {
  dpRef.value?.openMenu?.()
}
const close = () => {
  dpRef.value?.closeMenu?.()
}
const clear = () => {
  dpRef.value?.clearValue?.()
}

defineExpose<UseDatePickerExpose>({ open, close, clear })

// 解析最小/最大日期为 Date | undefined，供组件直接使用
const minDateResolved = computed<Date | undefined>(() => {
  if (!props.minDate) {
    return undefined
  }
  const d = toDate(props.minDate as any)
  return d || undefined
})

const maxDateResolved = computed<Date | undefined>(() => {
  if (!props.maxDate) {
    return undefined
  }
  const d = toDate(props.maxDate as any)
  return d || undefined
})

// 首屏渲染稳定性：强制在 mounted 后刷新一次组件，避免某些环境初始不可交互
const renderKey = ref(0)
const isInitialized = ref(false)

// 监听 innerValue，确保它始终是有效的类型（当 modelType='date' 时必须是 Date 或 null）
watch(
  () => innerValue.value,
  newVal => {
    if (modelType.value === 'date') {
      // 如果 innerValue 是字符串或其他无效类型，立即清理
      if (newVal !== null && !(newVal instanceof Date)) {
        if (Array.isArray(newVal)) {
          // 范围选择：检查每个元素
          const hasInvalidItem = newVal.some(item => item !== null && !(item instanceof Date))
          if (hasInvalidItem) {
            innerValue.value = null
            renderKey.value += 1
          }
        } else {
          // 单值选择：如果不是 Date 也不是 null，清理
          innerValue.value = null
          renderKey.value += 1
        }
      }
    }
  },
  { immediate: true, deep: true }
)

// 主题模式计算属性
const themeMode = computed(() => (isDark.value ? 'dark' : 'light'))

// vue-datepicker 语言配置
const datePickerLocale = computed(() => {
  const locale = currentLocale.value
  switch (locale) {
    case 'zh-CN':
      return 'zh-CN'
    case 'zh-TW':
      return 'zh-TW'
    case 'en-US':
    default:
      return 'en'
  }
})

// 兼容定位：将自定义 placement 映射为 vue-datepicker 的 position/open-on-top
// - position: 'left' | 'right' | 'center'
// - open-on-top: boolean
const positionAlign = computed<'left' | 'right' | 'center'>(() => {
  const p = props.placement || 'bottom-start'
  if (p.includes('left')) {
    return 'left'
  }
  if (p.includes('right')) {
    return 'right'
  }
  return 'center'
})
const openOnTop = computed<boolean>(() => {
  const p = props.placement || 'bottom-start'
  return p.startsWith('top')
})

// 无障碍标签配置
const ariaLabels = computed(() => ({
  toggleOverlay: t('components.datePicker.selectDate'),
  menu: t('components.datePicker.selectDate'),
  input: t('components.datePicker.selectDate'),
  calendar: t('components.datePicker.selectDate'),
  clearInput: t('components.datePicker.clearLabel'),
  closeOverlay: t('components.datePicker.cancelLabel'),
  selectMonth: t('components.datePicker.selectDate'),
  selectYear: t('components.datePicker.selectDate'),
  selectTime: t('components.datePicker.selectTime'),
  selectDate: t('components.datePicker.selectDate'),
  previousMonth: t('components.datePicker.selectDate'),
  nextMonth: t('components.datePicker.selectDate'),
  previousYear: t('components.datePicker.selectDate'),
  nextYear: t('components.datePicker.selectDate'),
  previousDecade: t('components.datePicker.selectDate'),
  nextDecade: t('components.datePicker.selectDate'),
  previousCentury: t('components.datePicker.selectDate'),
  nextCentury: t('components.datePicker.selectDate'),
}))

// 监听语言变化
watch(
  () => getCurrentLocale(),
  newLocale => {
    currentLocale.value = newLocale
  }
)

// 监听 innerValue，确保它始终是有效的类型（当 modelType='date' 时必须是 Date 或 null）
watch(
  () => innerValue.value,
  newVal => {
    if (modelType.value === 'date') {
      // 如果 innerValue 是字符串或其他无效类型，立即清理
      if (newVal !== null && !(newVal instanceof Date)) {
        if (Array.isArray(newVal)) {
          // 范围选择：检查每个元素
          const hasInvalidItem = newVal.some(item => item !== null && !(item instanceof Date))
          if (hasInvalidItem) {
            innerValue.value = null
          }
        } else {
          // 单值选择：如果不是 Date 也不是 null，清理
          innerValue.value = null
        }
      }
    }
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  nextTick(() => {
    renderKey.value += 1

    // 延迟初始化，确保所有样式和DOM完全就绪
    setTimeout(() => {
      // 1. 强制触发页面重绘
      window.dispatchEvent(new Event('resize'))

      // 2. 手动修复所有日期选择器元素
      const elements = document.querySelectorAll(
        '.dp__input_wrap, .dp__input, .dp__menu, .dp__menu_wrap'
      )
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.pointerEvents = 'auto'
          el.style.zIndex = '1000'
          el.style.cursor = 'pointer'
        }
      })

      // 3. 强制重新计算样式
      void document.body.offsetHeight

      // 4. 标记为已初始化
      isInitialized.value = true

      // 5. 再次触发重绘确保所有修复生效
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 50)
    }, 200)
  })
})
</script>

<template>
  <component
    :key="`${renderKey}-${isInitialized}-${themeMode}-${currentLocale}`"
    :is="datePickerComp"
    ref="dpRef"
    v-model="innerValue"
    :range="props.range"
    :format="effectiveDisplayFormat"
    :model-type="modelType"
    :placeholder="placeholderText"
    :clearable="props.clearable"
    :disabled="props.disabled"
    :is-24="props.is24"
    :enable-seconds="props.enableSeconds"
    :min-date="minDateResolved"
    :max-date="maxDateResolved"
    :min-range="props.minRange as any"
    :preset-dates="presetDates"
    :max-range="props.maxRange as any"
    :disabled-dates="props.disabledDates as any"
    :disabled-week-days="props.disabledWeekDays"
    :year-range="props.yearRange as any"
    :inline="props.inline"
    :teleport="false"
    :dark="isDark"
    :locale="datePickerLocale"
    :position="positionAlign"
    :open-on-top="openOnTop"
    :aria-labels="ariaLabels"
    :class="[props.customClass, { 'dp-initialized': isInitialized }]"
    :style="props.inputStyle"
    :enable-time-picker="isDateTime"
    :time-picker="isTimeOnly"
    :month-picker="isMonth || isQuarter"
    :year-picker="isYear"
    :week-picker="isWeek"
    :text-input="false"
    :auto-apply="true"
    @update:model-value="handleUpdate"
    @open="handleOpen"
    @closed="handleClose"
  />
</template>
