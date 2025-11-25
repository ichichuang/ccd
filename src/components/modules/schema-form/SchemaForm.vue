<!-- @/components/schema-form/SchemaForm.vue -->
<template>
  <div
    class="full"
    ref="formContainerRef"
  >
    <Form
      v-slot="$form"
      :initial-values="formValues"
      :resolver="validationResolver"
      @submit="onValidSubmit"
      class="full"
    >
      <!-- Steps Header -->
      <StepsHeader
        v-if="schema.steps?.length"
        :steps="schema.steps"
        :active-step="activeStep"
        :accessible-steps="stepAccessibility"
        @step-change="handleStepChange"
      />

      <!-- Grid Container -->
      <div
        :class="['grid', `grid-cols-12`]"
        :style="gridGapStyle"
      >
        <!-- Render Fields Based on Schema Type -->
        <template v-if="schema.sections && !schema.steps">
          <SectionsRenderer
            :sections="schema.sections"
            :columns="schema.columns"
            :form="$form"
            :disabled="disabled"
            :options-cache-t-t-l="optionsCacheTTL"
            :global-layout="mergedLayout"
            :global-style="mergedStyle"
            :column-by-field="columnByField"
            :col-style="colStyle"
          />
        </template>

        <template v-else-if="schema.steps && schema.steps.length">
          <StepsRenderer
            :current-step="schema.steps[activeStep]"
            :columns="schema.columns"
            :form="$form"
            :disabled="disabled"
            :options-cache-t-t-l="optionsCacheTTL"
            :global-layout="mergedLayout"
            :global-style="mergedStyle"
            :column-by-field="columnByField"
            :col-style="colStyle"
          />

          <!-- Step Navigation -->
          <StepNavigation
            :active-step="activeStep"
            :total-steps="schema.steps.length"
            :form="$form"
            :next-enabled="stepAccessibility[activeStep + 1] ?? false"
            @next="form => nextStep(form)"
            @prev="prevStep"
          />
        </template>

        <template v-else>
          <DefaultRenderer
            :columns="schema.columns"
            :form="$form"
            :disabled="disabled"
            :options-cache-t-t-l="optionsCacheTTL"
            :global-layout="mergedLayout"
            :global-style="mergedStyle"
            :col-style="colStyle"
          />
        </template>
      </div>

      <!-- Actions - 现在由用户自定义，不再预设按钮组 -->

      <!-- Persistence (Implicit) -->
      <div class="hidden">{{ persistValues($form.values) }}</div>
      <!-- Capture $form API for expose -->
      <div class="hidden">{{ captureFormApi($form) }}</div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores'
import { Form } from '@primevue/forms'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  DefaultRenderer,
  SectionsRenderer,
  StepNavigation,
  StepsHeader,
  StepsRenderer,
} from './components'
import { useFormMemory } from './hooks/useFormMemory'
import { DEFAULT_SCHEMA_FORM_PROPS } from './utils/constants'
import { getResetValues } from './utils/emptyValues'
import { colStyle as helperColStyle } from './utils/helper'
import type {
  LayoutConfig,
  PersistConfig,
  SchemaColumnsItem,
  SchemaFormEmits,
  SchemaFormProps,
  StyleConfig,
} from './utils/types'
import { filterEmptyValues } from './utils/valueHelpers'
const layoutStore = useLayoutStore()
// 调试日志禁用
const debugSchemaForm = (..._args: any[]) => {}
const formContainerRef = ref<HTMLElement | null>(null)
let formApiRef: any = null
// 对外提供的稳定响应式表单值引用
const valuesRef = ref<Record<string, any>>({})
let formValuesWatchStop: (() => void) | null = null
let formValuesSyncTimer: NodeJS.Timeout | null = null
let valuesRefSyncTimer: NodeJS.Timeout | null = null
let valuesRefWatchStop: (() => void) | null = null
// 防止递归更新的标志
let isSyncingValues = false

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<SchemaFormProps>(), {
  ...DEFAULT_SCHEMA_FORM_PROPS,
})

const emit = defineEmits<SchemaFormEmits>()
const pendingExternalValues = ref<Record<string, any> | null>(null)
let lastExternalModel: Record<string, any> | null =
  props.modelValue && typeof props.modelValue === 'object'
    ? typeof structuredClone === 'function'
      ? structuredClone(props.modelValue)
      : JSON.parse(JSON.stringify(props.modelValue))
    : null

// ==================== 表单记忆功能 ====================
// 生成表单唯一ID
function getFormId(): string {
  const path = typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  const fieldsSig = Array.isArray(props.schema?.columns)
    ? props.schema.columns.map(c => c.field).join(',')
    : ''
  return `${path}::${fieldsSig}`
}

// 初始化表单记忆功能
const rememberEnabled = computed(() =>
  Boolean(props.remember && !(props.schema.steps && props.schema.steps.length))
)
const formMemory = useFormMemory({
  formId: getFormId(),
  columns: props.schema.columns,
  enabled: rememberEnabled.value,
})
const rememberReady = ref(!rememberEnabled.value)
const markRememberReady = () => {
  if (!rememberReady.value) {
    rememberReady.value = true
  }
}

function deepClone<T>(value: T): T {
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(value)
    }
  } catch {
    /* ignore structuredClone errors */
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizeModelValue(value: Record<string, any> | null | undefined): Record<string, any> {
  if (value && typeof value === 'object') {
    return deepClone(value)
  }
  return {}
}

function hasObjectDifference(
  a: Record<string, any> | null,
  b: Record<string, any> | null
): boolean {
  if (!a && !b) {
    return false
  }
  if (!a || !b) {
    return true
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if (a[key] !== b[key]) {
      return true
    }
  }
  return false
}

function normalizeColorValue(value: any): any {
  if (typeof value !== 'string') {
    return value
  }
  return value.replace(/^#/, '').toLowerCase()
}

function normalizeDateValue(value: any, format: string): any {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const convert = (input: any): any => {
    if (input === null || input === undefined || input === '') {
      return null
    }
    try {
      if (format === 'timestamp') {
        if (typeof input === 'number' && isFinite(input) && input > 0) {
          return input
        }
        if (input instanceof Date && !isNaN(input.getTime())) {
          return input.getTime()
        }
        const parsedNumber = Number(input)
        if (!Number.isNaN(parsedNumber) && isFinite(parsedNumber) && parsedNumber > 0) {
          return parsedNumber
        }
        const dateFromString = new Date(input)
        if (!isNaN(dateFromString.getTime())) {
          return dateFromString.getTime()
        }
      }

      if (format === 'iso' || format === 'string') {
        if (typeof input === 'string') {
          const testDate = new Date(input)
          return isNaN(testDate.getTime()) ? null : input
        }
        const date = input instanceof Date ? input : new Date(input)
        return isNaN(date.getTime()) ? null : date.toISOString()
      }

      if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : input
      }
      const date = new Date(input)
      return isNaN(date.getTime()) ? null : date
    } catch (_e) {
      console.warn('[normalizeDateValue] conversion error:', _e, { input, format })
      return null
    }
  }

  if (Array.isArray(value)) {
    return value.map(convert).filter(v => v !== null)
  }

  return convert(value)
}

function applyExternalValues(values: Record<string, any>): boolean {
  if (!formApiRef) {
    return false
  }
  try {
    const normalized = deepClone(values)
    try {
      for (const column of props.schema.columns) {
        const key = column.field
        const rawVal = normalized[key]
        if (column.component === 'ColorPicker') {
          normalized[key] = normalizeColorValue(rawVal)
        } else if (column.component === 'DatePicker') {
          const valueFormat =
            typeof (column.props as any)?.valueFormat === 'string'
              ? (column.props as any).valueFormat
              : 'timestamp'
          normalized[key] = normalizeDateValue(rawVal, valueFormat)
        }
      }
    } catch {
      /* ignore normalization errors */
    }

    // 先尝试直接写入现有 Proxy（不更换对象引用）
    if (formApiRef.values && typeof formApiRef.values === 'object') {
      Object.keys(normalized).forEach(key => {
        ;(formApiRef.values as any)[key] = normalized[key]
      })
    }
    // 优先调用 PrimeVue Form API，避免破坏响应式对象本体
    if (typeof formApiRef.setValues === 'function') {
      formApiRef.setValues(normalized)
      return true
    }
    for (const column of props.schema.columns) {
      const key = column.field
      const hasValue = Object.prototype.hasOwnProperty.call(values, key)
      let value = hasValue ? deepClone(values[key]) : undefined
      if (column.component === 'ColorPicker') {
        value = normalizeColorValue(value)
      } else if (column.component === 'DatePicker') {
        const valueFormat =
          typeof (column.props as any)?.valueFormat === 'string'
            ? (column.props as any).valueFormat
            : 'timestamp'
        value = normalizeDateValue(value, valueFormat)
      }
      if (typeof formApiRef.setFieldValue === 'function') {
        formApiRef.setFieldValue(key, value)
        continue
      }
      const target = formApiRef[key]
      if (target && typeof target === 'object' && 'value' in target) {
        target.value = value
      } else {
        formApiRef[key] = value
      }
    }
    return true
  } catch {
    return false
  }
}

function flushPendingExternalValues() {
  if (!pendingExternalValues.value) {
    return
  }
  const values = { ...pendingExternalValues.value }
  nextTick(() => {
    if (applyExternalValues(values)) {
      pendingExternalValues.value = null
    }
  })
}

/** 捕获 $form API 以便在 defineExpose 暴露 */
function collectLatestValues(): Record<string, any> {
  // 首先保留 valuesRef 中的所有现有值，确保不会丢失其他步骤的值
  const latest: Record<string, any> = { ...valuesRef.value }
  const formValues =
    formApiRef && formApiRef.values && typeof formApiRef.values === 'object'
      ? formApiRef.values
      : {}

  // 遍历所有字段，优先使用最新的表单值
  for (const column of props.schema.columns) {
    const key = column.field

    // 🔥 关键：在步骤表单模式下，formApiRef.values 可能只包含当前步骤的字段
    // 所以我们需要同时检查 formApiRef.values 和 formApiRef[key].value

    // 标记是否从表单 API 中找到了值
    let foundInFormApi = false

    // 优先从 formApiRef[key].value 获取（适用于所有使用 name 绑定的字段，包括步骤表单）
    const fieldRef = formApiRef?.[key]
    if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
      // 🔥 关键修复：即使 fieldValue 是 undefined，也应该使用它，覆盖旧值（比如 clear 操作）
      const fieldValue = fieldRef.value
      latest[key] = fieldValue
      foundInFormApi = true
      continue
    }

    // 降级：从 formApiRef.values 获取（可能只包含当前步骤的字段）
    if (formValues && Object.prototype.hasOwnProperty.call(formValues, key)) {
      const formValue = formValues[key]
      // 如果 formApiRef.values 中有值，使用它（即使为 null 或 undefined，也要使用，因为可能是用户清空的值）
      latest[key] = formValue
      foundInFormApi = true
      continue
    }

    // 🔥 关键：如果在 formApiRef 中没有找到该字段，且 latest 中也没有值，确保设置为 undefined
    // 这样可以确保 clear() 操作能正确清空所有字段
    if (!foundInFormApi && !(key in latest)) {
      latest[key] = undefined
    }
  }
  return latest
}

async function withPausedFieldWatchers<T>(
  fn: () => Promise<T> | T,
  clearValidationBeforeResume = false
): Promise<T> {
  const watchers: Array<{ pause?: () => void; resume?: () => void }> = []
  const formFields = formApiRef?.fields
  if (formFields && typeof formFields === 'object') {
    Object.values(formFields).forEach(field => {
      const watcher = (field as Record<string, any> | undefined)?._watcher
      if (watcher && typeof watcher.pause === 'function') {
        watcher.pause()
        watchers.push(watcher)
      }
    })
  }
  try {
    return await fn()
  } finally {
    if (watchers.length) {
      await nextTick()
      // 🔥 关键：如果需要在恢复前清除校验状态，先清除再恢复
      if (clearValidationBeforeResume) {
        clearAllFieldValidationStates()
      }
      watchers.forEach(watcher => {
        if (watcher && typeof watcher.resume === 'function') {
          watcher.resume()
        }
      })
    }
  }
}

function captureFormApi(api: any) {
  formApiRef = api

  // 清理之前的 watch
  if (formValuesWatchStop) {
    formValuesWatchStop()
    formValuesWatchStop = null
  }

  // 监听表单值变化，实时更新 valuesRef
  // 这个 watch 确保在修改任何步骤的表单项时，valuesRef 都能实时更新
  // 即使当前不在该步骤，也能获取到值的变化
  if (formApiRef) {
    // 🔥 关键：在步骤表单模式下，需要同时监听 formApiRef.values 和各个字段的 value
    // 构建监听源数组：包括 formApiRef.values 和所有字段的 value
    const watchSources: any[] = []

    // 添加 formApiRef.values 作为监听源（深度监听）
    if (formApiRef.values) {
      watchSources.push(() => formApiRef.values)
    }

    // 为每个字段添加监听源（适用于直接绑定到 formApiRef[field].value 的组件）
    // 这在步骤表单模式下特别重要，因为 formApiRef.values 可能只包含当前步骤的字段
    for (const column of props.schema.columns) {
      const key = column.field
      const fieldRef = formApiRef[key]
      if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
        // 如果字段是响应式对象（有 value 属性），监听它的 value
        watchSources.push(() => fieldRef.value)
      }
    }

    if (watchSources.length > 0) {
      formValuesWatchStop = watch(
        watchSources,
        () => {
          // 防止递归更新
          if (isSyncingValues) {
            return
          }
          // 防抖处理，避免频繁更新
          if (formValuesSyncTimer) {
            clearTimeout(formValuesSyncTimer)
          }
          formValuesSyncTimer = setTimeout(() => {
            // 再次检查，防止在防抖期间已经开始同步
            if (isSyncingValues) {
              formValuesSyncTimer = null
              return
            }
            isSyncingValues = true
            try {
              // 使用 collectLatestValues 确保获取所有步骤的值
              const merged = collectLatestValues()
              // 过滤隐藏字段
              const filtered: Record<string, any> = {}
              for (const column of props.schema.columns) {
                if (column.hidden === true && column.hideValue !== true) {
                  continue
                }
                filtered[column.field] = merged[column.field]
              }
              // 🔥 关键：过滤掉空值字段，清空表单后 valuesRef 为 {}
              const filteredNonEmpty = filterEmptyValues(filtered)
              // 深度比较，避免不必要的更新
              const currentStr = JSON.stringify(valuesRef.value)
              const newStr = JSON.stringify(filteredNonEmpty)
              if (currentStr !== newStr) {
                valuesRef.value = deepClone(filteredNonEmpty)
              }
            } finally {
              isSyncingValues = false
              formValuesSyncTimer = null
            }
          }, 30) // 减少防抖延迟到 30ms，确保更快的响应
        },
        { deep: true, immediate: true }
      )
    }
  }

  flushPendingExternalValues()

  // 🔥 关键：监听 valuesRef 的变化，调用 syncToModelValue
  // 使用 watch 而不是在模板中调用，避免递归更新
  // 确保只创建一次 watch
  if (!valuesRefWatchStop) {
    valuesRefWatchStop = watch(
      valuesRef,
      () => {
        // 防止递归更新
        if (isSyncingValues) {
          return
        }
        // 防抖处理
        if (valuesRefSyncTimer) {
          clearTimeout(valuesRefSyncTimer)
        }
        valuesRefSyncTimer = setTimeout(() => {
          // 再次检查，防止在防抖期间已经开始同步
          if (isSyncingValues) {
            valuesRefSyncTimer = null
            return
          }
          // 使用 nextTick 延迟调用，避免在同一个更新周期中触发
          nextTick(() => {
            if (!isSyncingValues) {
              syncToModelValue({})
            }
          })
          valuesRefSyncTimer = null
        }, 50) // 50ms 防抖
      },
      { deep: true, immediate: false }
    )
  }

  return ''
}

// ==================== Internal State ====================

const activeStep = ref(0)

// ==================== Form Values ====================
// 用于承载异步缓存（IDB/Shadow）以参与初始值计算
const cachedFormValues = ref<Record<string, any> | null>(null)

// 在组件 setup 阶段同步读取缓存，确保 Form 初始计算即可拿到默认值
if (rememberEnabled.value) {
  rememberReady.value = false
  try {
    const cached = formMemory.loadCacheSyncForInit()
    if (cached && typeof cached === 'object' && Object.keys(cached).length > 0) {
      // 🔥 重构：只设置缓存值，不直接更新 valuesRef
      // buildInitialValues 会负责合并 defaultValue 和缓存值
      cachedFormValues.value = cached
      debugSchemaForm('[SchemaForm][init] loaded cache sync', {
        cached,
        cachedKeys: Object.keys(cached),
      })

      // 🔥 新增：在 setup 阶段即用缓存值初始化 valuesRef，确保 useSchemaForm 的 formValues 能立即拿到所有步骤的数据
      const filtered: Record<string, any> = {}
      for (const column of props.schema.columns) {
        if (column.hidden === true && column.hideValue !== true) {
          continue
        }
        filtered[column.field] = cached[column.field]
      }
      valuesRef.value = filterEmptyValues(filtered)
    } else {
      // 缓存为空或不存在，设置为 null，让 buildInitialValues 使用 defaultValue
      cachedFormValues.value = null
    }
  } catch (e) {
    console.error('[SchemaForm][init] cache read error:', e)
    cachedFormValues.value = null
  }
}
// 🔥 重构：formValues 应该依赖于实际表单值，而不是只依赖于 buildInitialValues
// 在初始化时使用 buildInitialValues，之后使用实际表单值
const formValues = computed(() => {
  // 如果 formApiRef 已就绪，使用实际表单值
  if (formApiRef) {
    return collectLatestValues()
  }
  // 否则使用 buildInitialValues（初始化阶段）
  return buildInitialValues()
})

// 🔥 统一 remember 存储逻辑：监听 valuesRef（包含所有步骤字段）
if (rememberEnabled.value) {
  watch(
    valuesRef,
    newValues => {
      if (!rememberReady.value || formMemory.isRestoring.value) {
        return
      }
      const snapshot = deepClone(newValues || {})
      formMemory.saveValues(snapshot)
      try {
        const formId = getFormId()
        if (formMemory.storageKey.value) {
          layoutStore.setFormMemoryPointer(formId, formMemory.storageKey.value)
        }
      } catch {
        /* ignore pointer sync errors */
      }
    },
    { deep: true }
  )
}

// ==================== ModelValue Watcher ====================

let lastValues: Record<string, any> = {}

/** 监听外部 modelValue 变化，更新内部表单值 */
watch(
  () => props.modelValue,
  newValue => {
    const normalized = normalizeModelValue(newValue)
    if (!hasObjectDifference(normalized, lastExternalModel)) {
      return
    }
    lastExternalModel = deepClone(normalized)
    lastValues = deepClone(normalized)
    if (!applyExternalValues(normalized)) {
      pendingExternalValues.value = deepClone(normalized)
      flushPendingExternalValues()
    }
  },
  { deep: true }
)

/** 监听表单值变化，同步到 modelValue */
function syncToModelValue(_values: Record<string, any>) {
  // 🔥 关键：防止递归更新，如果正在同步中，直接返回
  if (isSyncingValues) {
    return ''
  }

  const merged = _values && typeof _values === 'object' ? _values : collectLatestValues()
  const safeValues = merged && typeof merged === 'object' ? merged : {}

  debugSchemaForm('[SchemaForm][syncToModelValue] called', {
    safeValues,
    lastValues,
    keys: Object.keys(safeValues),
  })

  // 使用浅比较优化性能，避免深度 JSON.stringify
  const hasChanged =
    Object.keys(safeValues).some(key => safeValues[key] !== lastValues[key]) ||
    Object.keys(lastValues).some(key => !(key in safeValues))

  debugSchemaForm('[SchemaForm][syncToModelValue] hasChanged', { hasChanged })

  if (hasChanged) {
    isSyncingValues = true
    try {
      const snapshot = deepClone(safeValues)
      lastValues = snapshot
      emit('updateModelValue', snapshot)
      lastExternalModel = deepClone(safeValues)

      // 🔥 关键：只有在 valuesRef 的值确实不同时才更新，避免触发 watch
      // 同步给对外暴露的响应式引用（根据 hideValue 属性决定是否包含隐藏字段）
      const filtered: Record<string, any> = {}
      for (const column of props.schema.columns) {
        // 如果字段被隐藏且 hideValue 为 false，则跳过该字段
        if (column.hidden === true && column.hideValue !== true) {
          continue
        }
        filtered[column.field] = (safeValues as any)[column.field]
      }
      // 🔥 关键：过滤掉空值字段，清空表单后 valuesRef 为 {}
      const filteredNonEmpty = filterEmptyValues(filtered)

      debugSchemaForm('[SchemaForm][syncToModelValue] updating valuesRef', {
        filtered: filteredNonEmpty,
        dateFields: Object.keys(filteredNonEmpty).filter(key =>
          props.schema.columns.find(col => col.field === key && col.component === 'DatePicker')
        ),
      })
      // 深度比较，避免不必要的更新（这可能会触发 watch）
      const currentStr = JSON.stringify(valuesRef.value)
      const newStr = JSON.stringify(filteredNonEmpty)
      if (currentStr !== newStr) {
        // 只设置一次 valuesRef，使用过滤后的值（只包含非空字段）
        valuesRef.value = deepClone(filteredNonEmpty)
      }

      // 🔥 重构：存储逻辑已移至 formValues 的 watch，这里不再重复存储
    } finally {
      isSyncingValues = false
    }
  }
  return ''
}
const containerWidth = ref(0)
let resizeObserver: ResizeObserver | null = null

// ==================== Computed ====================

/** 合并布局配置：props.layout > schema.layout > 默认值 */
const mergedLayout = computed((): LayoutConfig => {
  const layout = props.schema.layout || {}
  if (!layout?.cols) {
    layout.cols = 0
  }
  if (!layout?.labelWidth) {
    layout.labelWidth = '100px'
  }
  if (!layout?.labelPosition) {
    layout.labelPosition = 'right'
  }
  if (!layout?.labelAlign) {
    layout.labelAlign = 'left'
  }
  if (layout?.showLabel === undefined) {
    layout.showLabel = true
  }
  return layout
})

/** 合并样式配置：schema.style > 默认值 */
const mergedStyle = computed((): StyleConfig => {
  return props.schema.style || {}
})

// ==================== Methods ====================

/** 基于 schema.gap/gapX/gapY 生成网格间距样式 */
const gridGapStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = {}
  const gapX = (props.schema as any).gapX
  const gapY = (props.schema as any).gapY
  const gap = props.schema.gap

  if (gapX !== undefined || gapY !== undefined) {
    if (gapY !== undefined) {
      style.rowGap = `${gapY}px`
    }
    if (gapX !== undefined) {
      style.columnGap = `${gapX}px`
    }
  } else if (gap !== undefined) {
    style.gap = `${gap}px`
  }
  return style
})

/** 构建初始值 */
function buildInitialValues(): Record<string, any> {
  const values: Record<string, any> = {}

  // 🔥 重构：新的 remember 逻辑
  // 1. 如果开启了 remember 且有缓存值，需要合并 defaultValue 和缓存值
  // 2. 如果未开启 remember，直接使用 defaultValue
  if (rememberEnabled.value && cachedFormValues.value !== null) {
    // 开启了 remember 且缓存已初始化
    const cached = cachedFormValues.value
    debugSchemaForm('[SchemaForm][buildInitialValues] merging cached values with defaultValue', {
      cached,
      isCachedEmpty: Object.keys(cached || {}).length === 0,
    })

    // 遍历所有字段，合并 defaultValue 和缓存值
    for (const column of props.schema.columns) {
      const field = column.field
      const hasDefaultValue = column.defaultValue !== undefined
      const hasCachedValue =
        Object.prototype.hasOwnProperty.call(cached, field) && cached[field] !== undefined

      if (hasCachedValue) {
        // 缓存中有值，优先使用缓存值（忽略 defaultValue）
        values[field] = cached[field]
      } else if (hasDefaultValue) {
        // 缓存中没有值，但有 defaultValue，使用 defaultValue
        values[field] = column.defaultValue
      }
      // 如果既没有缓存值也没有 defaultValue，不设置（保持 undefined）
    }
  } else if (!rememberEnabled.value) {
    // 未开启 remember，直接设置 defaultValue
    for (const column of props.schema.columns) {
      if (column.defaultValue !== undefined) {
        values[column.field] = column.defaultValue
      }
    }
  }
  // 如果开启了 remember 但缓存为 null（首次加载，还未异步加载完成），先不设置值
  // 等待异步加载完成后，会在 onMounted 中应用缓存值

  // 覆盖持久化数据（优先级低于缓存和 defaultValue）
  if (props.persist && typeof props.persist === 'object') {
    const persisted = loadPersistedValues(props.persist)
    Object.assign(values, persisted)
  }

  // 覆盖 modelValue（优先级最高）
  if (props.modelValue) {
    Object.assign(values, props.modelValue)
  }

  debugSchemaForm('[SchemaForm][buildInitialValues]', {
    values,
    hasRemember: rememberEnabled.value,
    hasCached: cachedFormValues.value !== null,
    isCachedEmpty: cachedFormValues.value ? Object.keys(cachedFormValues.value).length === 0 : true,
    dateFields: Object.keys(values).filter(key =>
      props.schema.columns.find(col => col.field === key && col.component === 'DatePicker')
    ),
  })

  return values
}

/** 加载持久化数据 */
function loadPersistedValues(persistConfig: PersistConfig): Record<string, any> {
  try {
    const key = `schemaform:${persistConfig.key}`
    const raw = localStorage.getItem(key)
    if (!raw) {
      return {}
    }

    const item = JSON.parse(raw)
    if (!item.expires || item.expires > Date.now()) {
      return item.values || {}
    }
  } catch {
    // 忽略 localStorage 错误
  }
  return {}
}

/** 快速查找字段 */
function columnByField(field: string): SchemaColumnsItem | undefined {
  return props.schema.columns.find(column => column.field === field)
}

/** 列样式计算 */
const colStyle = computed(() => {
  return (fieldLayout?: LayoutConfig): Record<string, string> => {
    let width = containerWidth.value || formContainerRef.value?.clientWidth || 0

    // 确保 width 是有效数字
    if (isNaN(width) || !isFinite(width) || width < 0) {
      width = 1200 // 默认桌面宽度
    }

    // 合并布局配置：fieldLayout > mergedLayout > 默认值
    const finalLayout: LayoutConfig = {
      ...mergedLayout.value,
      ...fieldLayout, // 表单项配置优先级最高
    }

    // 直接使用 helperColStyle，它会正确处理表单项的 cols 配置
    return helperColStyle(finalLayout, width)
  }
})

function isFieldRequired(column?: SchemaColumnsItem): boolean {
  if (!column?.rules) {
    return false
  }
  if (typeof column.rules === 'string') {
    return column.rules.split('|').some(rule => rule.trim().toLowerCase().startsWith('required'))
  }
  if (Array.isArray(column.rules)) {
    return column.rules.some(rule => typeof rule === 'string' && rule.trim() === 'required')
  }
  if (typeof column.rules === 'object') {
    if ('required' in column.rules) {
      return Boolean((column.rules as Record<string, any>).required)
    }
    if ('presence' in column.rules) {
      return Boolean((column.rules as Record<string, any>).presence)
    }
  }
  return false
}

function isValueFilled(value: any): boolean {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }
  return true
}

const stepAccessibility = computed<boolean[]>(() => {
  const steps = props.schema.steps
  if (!steps?.length) {
    return []
  }
  const accessible: boolean[] = Array(steps.length).fill(false)
  accessible[0] = true
  const values = valuesRef.value || {}

  for (let index = 1; index < steps.length; index += 1) {
    if (!accessible[index - 1]) {
      accessible[index] = false
      continue
    }
    const prevFields = steps[index - 1]?.fields || []
    const requiredFields = prevFields.filter(fieldName => isFieldRequired(columnByField(fieldName)))
    if (!requiredFields.length) {
      accessible[index] = true
      continue
    }
    const allValid = requiredFields.every(fieldName => {
      const column = columnByField(fieldName)
      if (!column) {
        return true
      }
      const value = values[fieldName]
      if (!isValueFilled(value)) {
        return false
      }
      const error = validateField(column, value, values)
      return !error
    })
    accessible[index] = allValid
  }
  return accessible
})

watch(
  stepAccessibility,
  accessibility => {
    if (!accessibility.length) {
      return
    }
    if (accessibility[activeStep.value]) {
      return
    }
    let fallbackIndex = 0
    for (let i = accessibility.length - 1; i >= 0; i -= 1) {
      if (accessibility[i]) {
        fallbackIndex = i
        break
      }
    }
    activeStep.value = fallbackIndex
  },
  { immediate: true }
)

/**
 * 🔁 每次步骤发生变化时，重新应用当前已知的全部表单值
 * @description 步骤表单只渲染当前步骤字段，其他步骤字段会被卸载。
 *              当用户刷新或切换回之前的步骤时，需要把 remember / valuesRef 中保存的值
 *              再次写入 PrimeVue Form，确保这些刚挂载的字段能拿到之前的值。
 */
watch(
  () => activeStep.value,
  () => {
    const applyForStep = () => {
      const latestValues = collectLatestValues()
      const applied = applyExternalValues(latestValues)
      if (applied) {
        nextTick(() => {
          const fields = props.schema.steps?.[activeStep.value]?.fields
          if (fields && fields.length) {
            clearAllFieldValidationStates(fields)
          } else {
            clearAllFieldValidationStates()
          }
        })
      }
      return applied
    }

    if (!applyForStep()) {
      nextTick(() => {
        applyForStep()
      })
    }
  },
  { immediate: true }
)

/** 监听容器尺寸变化 */
function setupResizeObserver() {
  if (!formContainerRef.value) {
    return
  }

  // 清理之前的 observer
  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      containerWidth.value = entry.contentRect.width
    }
  })

  resizeObserver.observe(formContainerRef.value)
}

/** 更新容器宽度（备用方案） */
function updateContainerWidth() {
  if (formContainerRef.value) {
    containerWidth.value = formContainerRef.value.clientWidth
  }
}

// ==================== Lifecycle ====================

onMounted(() => {
  // 延迟设置，确保 DOM 已经渲染
  nextTick(() => {
    // 初始化内容记忆：异步加载并回填
    if (rememberEnabled.value) {
      const formId = getFormId()
      // 同步到 layout 指针，便于其他处寻址
      try {
        if (formMemory.storageKey.value) {
          layoutStore.setFormMemoryPointer(formId, formMemory.storageKey.value)
        }
      } catch {
        /* ignore pointer init errors */
      }

      // 异步加载缓存
      formMemory
        .loadCacheAsync()
        .then(incoming => {
          // 🔥 重构：合并 defaultValue 和缓存值
          const mergedValues: Record<string, any> = {}

          // 如果缓存中有数据，需要合并 defaultValue
          if (incoming && typeof incoming === 'object' && Object.keys(incoming).length > 0) {
            debugSchemaForm('[SchemaForm][remember] loading cached values', {
              incoming,
            })

            // 遍历所有字段，合并 defaultValue 和缓存值
            for (const column of props.schema.columns) {
              const field = column.field
              const hasDefaultValue = column.defaultValue !== undefined
              const hasCachedValue =
                Object.prototype.hasOwnProperty.call(incoming, field) &&
                incoming[field] !== undefined

              if (hasCachedValue) {
                // 缓存中有值，优先使用缓存值（忽略 defaultValue）
                mergedValues[field] = incoming[field]
              } else if (hasDefaultValue) {
                // 缓存中没有值，但有 defaultValue，使用 defaultValue
                mergedValues[field] = column.defaultValue
              }
            }

            // 更新 cachedFormValues，触发 formValues(computed) 重新计算
            cachedFormValues.value = incoming
          } else {
            // 没有缓存数据，只使用 defaultValue
            for (const column of props.schema.columns) {
              if (column.defaultValue !== undefined) {
                mergedValues[column.field] = column.defaultValue
              }
            }
            // 设置为 null，表示没有缓存（但可能有 defaultValue）
            cachedFormValues.value = null
          }

          // 如果没有需要应用的值，直接返回
          if (Object.keys(mergedValues).length === 0) {
            debugSchemaForm('[SchemaForm][remember] no values to apply')
            return
          }

          debugSchemaForm('[SchemaForm][remember] merged values to apply', {
            mergedValues,
            hasCached: incoming && Object.keys(incoming).length > 0,
          })

          const apply = () => {
            try {
              if (!formApiRef) {
                console.warn('[SchemaForm][remember] formApiRef not ready')
                return false
              }

              // 使用 applyExternalValues 来应用值，它会正确处理 DatePicker 和 ColorPicker 的规范化
              if (applyExternalValues(mergedValues)) {
                debugSchemaForm('[SchemaForm][remember] applyExternalValues succeeded', {
                  formApiRefValues: formApiRef.values,
                })
                // 确保 formApiRef.values 也拿到最新值
                if (formApiRef.values && typeof formApiRef.values === 'object') {
                  Object.keys(mergedValues).forEach(k => {
                    ;(formApiRef.values as any)[k] = mergedValues[k]
                  })
                }
                // 更新字段的 ref.value
                for (const column of props.schema.columns) {
                  const field = column.field
                  if (Object.prototype.hasOwnProperty.call(mergedValues, field)) {
                    const fieldRef = formApiRef[field]
                    if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
                      ;(fieldRef as Record<string, any>).value = mergedValues[field]
                    }
                  }
                }
                // 触发同步
                nextTick(() => {
                  const merged = collectLatestValues()
                  syncToModelValue(merged)
                  // 🔥 关键：同步 valuesRef，确保 useSchemaForm 能获取到恢复的值
                  syncValuesRefImmediately()
                })
                markRememberReady()
                return true
              }
              // 降级：使用 setValues
              if (typeof formApiRef.setValues === 'function') {
                formApiRef.setValues(mergedValues)
                markRememberReady()
                return true
              }
              return false
            } catch {
              return false
            }
          }

          // 立即尝试一次，若 API 尚未就绪，则延迟重试几次
          let applied = apply()
          if (!applied) {
            let retry = 0
            const timer = window.setInterval(() => {
              applied = apply()
              retry++
              if (applied || retry >= 10) {
                window.clearInterval(timer)
                if (!applied) {
                  markRememberReady()
                }
              }
            }, 100)
          }
        })
        .catch(e => {
          console.error('[SchemaForm][remember] load cache error:', e)
          markRememberReady()
        })
        .finally(() => {
          markRememberReady()
        })
    }
    setupResizeObserver()
    // 初始设置容器宽度
    updateContainerWidth()
    // 初始化对外暴露的 valuesRef，避免外部首次读取为空 {}
    try {
      // 优先从当前表单 API 获取实时值；若不可用，则退回到初始值构建
      const initial = formApiRef ? collectLatestValues() : buildInitialValues()
      // 过滤隐藏字段和空值字段
      const filtered: Record<string, any> = {}
      for (const column of props.schema.columns) {
        if (column.hidden === true && column.hideValue !== true) {
          continue
        }
        filtered[column.field] = initial[column.field]
      }
      const filteredNonEmpty = filterEmptyValues(filtered)
      valuesRef.value = filteredNonEmpty
    } catch (_err) {
      // 忽略初始化异常：在极早阶段 formApiRef 可能尚未就绪
      // 轻量兜底，保持为对象引用
      valuesRef.value = { ...(valuesRef.value || {}) }
    }
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  // 清理表单值监听
  if (formValuesWatchStop) {
    formValuesWatchStop()
    formValuesWatchStop = null
  }
  if (formValuesSyncTimer) {
    clearTimeout(formValuesSyncTimer)
    formValuesSyncTimer = null
  }
  // 清理 valuesRef 的 watch
  if (valuesRefWatchStop) {
    valuesRefWatchStop()
    valuesRefWatchStop = null
  }
  if (valuesRefSyncTimer) {
    clearTimeout(valuesRefSyncTimer)
    valuesRefSyncTimer = null
  }
  // 离开组件强制落盘
  try {
    formMemory.flush()
  } catch {
    /* ignore flush errors */
  }
  // 移除窗口大小变化监听
  window.removeEventListener('resize', updateContainerWidth)
})

// 添加窗口大小变化监听作为备用方案
onMounted(() => {
  window.addEventListener('resize', updateContainerWidth)
  // 页面关闭/刷新时强制落盘
  const beforeUnloadHandler = () => {
    try {
      // 🔥 关键：在页面关闭前，先保存当前表单值，确保不丢失数据
      if (rememberEnabled.value && formApiRef && !formMemory.isRestoring.value) {
        const currentValues = collectLatestValues()
        // 过滤隐藏字段
        const filtered: Record<string, any> = {}
        for (const column of props.schema.columns) {
          if (column.hidden === true && column.hideValue !== true) {
            continue
          }
          filtered[column.field] = currentValues[column.field]
        }
        // 过滤空值字段
        const filteredNonEmpty = filterEmptyValues(filtered)
        if (Object.keys(filteredNonEmpty).length > 0) {
          // 立即保存，不等待防抖
          formMemory.saveValuesImmediate(filteredNonEmpty).catch(() => {
            // 如果立即保存失败，至少尝试 flush
            formMemory.flush()
          })
        } else {
          formMemory.flush()
        }
      } else {
        formMemory.flush()
      }
    } catch {
      /* ignore */
    }
  }
  window.addEventListener('beforeunload', beforeUnloadHandler)
  // 组件卸载时移除该监听
  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
  })
})

/** 构建验证解析器（PrimeVue 期望的错误格式：{ field: [{ message }] }） */
function buildValidationResolver() {
  return (incoming: any) => {
    // PrimeVue 会传入形如 { names: [...], values: {...} } 的对象，这里做兼容
    const values: Record<string, any> =
      incoming && typeof incoming === 'object' && 'values' in incoming ? incoming.values : incoming
    const errors: Record<string, Array<{ message: string }>> = {}

    for (const column of props.schema.columns) {
      // 跳过完全不渲染的隐藏字段的验证
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }

      if (!column.rules) {
        continue
      }

      const value = values[column.field]
      const fieldError = validateField(column, value, values)

      if (fieldError) {
        errors[column.field] = [{ message: fieldError }]
      }
    }

    return { values, errors }
  }
}

/** 验证单个字段 */
function validateField(
  column: SchemaColumnsItem,
  value: any,
  allValues: Record<string, any>
): string | null {
  const ctx = { values: allValues, column }

  if (typeof column.rules === 'string') {
    return validateStringRules(column.rules, value)
  } else if (typeof column.rules === 'function') {
    return validateFunctionRule(column.rules, value, ctx)
  } else if (column.rules && typeof column.rules === 'object' && 'validate' in column.rules) {
    return validateYupSchema(column.rules, value)
  }

  return null
}

function markFieldTouched(fieldName: string) {
  if (!formApiRef) {
    return
  }

  const fieldState = formApiRef[fieldName]
  if (fieldState && typeof fieldState === 'object') {
    try {
      if (typeof fieldState.touch === 'function') {
        fieldState.touch()
      } else if ('touched' in fieldState) {
        ;(fieldState as any).touched = true
      }
    } catch {
      /* ignore touch errors */
    }
  }

  try {
    if (typeof formApiRef.markAsTouched === 'function') {
      formApiRef.markAsTouched(fieldName)
    }
  } catch {
    /* ignore markAsTouched errors */
  }
}

/** 验证字符串规则 */
function validateStringRules(rules: string, value: any): string | null {
  const ruleList = rules.split('|')

  for (const rule of ruleList) {
    if (!rule) {
      continue
    }

    // required：仅在字符串为空串/空白、null/undefined 时判定为空；
    // 对于对象/数组/数字/布尔（包括 false）不当作“空”。
    if (
      rule === 'required' &&
      (value === null || value === undefined || (typeof value === 'string' && value.trim() === ''))
    ) {
      return '必填项'
    } else if (rule.startsWith('min:')) {
      const min = parseInt(rule.split(':')[1])
      if (typeof value === 'string' && value.length < min) {
        return `至少 ${min} 个字符`
      } else if (typeof value === 'number' && value < min) {
        return `最小值为 ${min}`
      }
    } else if (rule.startsWith('max:')) {
      const max = parseInt(rule.split(':')[1])
      if (typeof value === 'string' && value.length > max) {
        return `最多 ${max} 个字符`
      } else if (typeof value === 'number' && value > max) {
        return `最大值为 ${max}`
      }
    } else if (rule === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return '邮箱格式不正确'
      }
    } else if (rule === 'integer' && value) {
      if (!Number.isInteger(Number(value))) {
        return '必须为整数'
      }
    }
  }

  return null
}

/** 验证函数规则 */
function validateFunctionRule(
  rule: (value: any, ctx: any) => true | string | Promise<true | string>,
  value: any,
  ctx: any
): string | null {
  try {
    const result = rule(value, ctx)
    if (result instanceof Promise) {
      // 对于异步函数，暂时返回 null，实际验证会在异步流程中处理
      // 可以考虑添加异步验证状态管理
      return null
    }
    return result === true ? null : typeof result === 'string' ? result : '校验失败'
  } catch (error) {
    console.error('验证函数执行失败:', error)
    return '校验失败'
  }
}

/** 验证 Yup Schema */
function validateYupSchema(schema: any, value: any): string | null {
  try {
    schema.validateSync(value)
    return null
  } catch (error: any) {
    return error.message
  }
}

// 使用稳定的函数引用，避免 computed 包裹导致的解包问题
const validationResolver = buildValidationResolver()

/** 持久化数据（节流） */
let persistTimer: NodeJS.Timeout | null = null
function persistValues(values: Record<string, any>): string {
  if (!props.persist || typeof props.persist !== 'object') {
    return ''
  }

  clearTimeout(persistTimer!)
  persistTimer = setTimeout(() => {
    try {
      const persistConfig = props.persist as PersistConfig
      const ttl = persistConfig.ttl ?? 24 * 60 * 60 * 1000
      const key = `schemaform:${persistConfig.key}`
      localStorage.setItem(
        key,
        JSON.stringify({
          values,
          expires: Date.now() + ttl,
        })
      )
    } catch {
      // 忽略 localStorage 错误
    }
  }, 300)

  return ''
}

/** 提交成功处理 */
async function onValidSubmit(event: { values: Record<string, any>; valid: boolean; errors: any }) {
  const { values, valid, errors } = event

  if (!valid) {
    // 🔥 关键：当表单提交失败时，标记所有有错误的字段为 touched，确保错误状态正确显示
    // 使用 nextTick 确保在 PrimeVue Form 完成校验状态更新后再标记字段
    nextTick(() => {
      if (formApiRef) {
        for (const fieldName of Object.keys(errors || {})) {
          markFieldTouched(fieldName)
        }
      }
    })

    const errorMap: Record<string, string> = {}
    for (const [fieldName, fieldErrors] of Object.entries(
      errors as Record<string, Array<{ message?: string }>>
    )) {
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        errorMap[fieldName] = fieldErrors[0]?.message || '验证失败'
      }
    }
    emit('error', { errors: errorMap })
    return
  }

  // 字段输出转换（根据 hideValue 属性决定是否包含隐藏字段）
  const transformedValues: Record<string, any> = {}
  for (const column of props.schema.columns) {
    // 如果字段被隐藏且 hideValue 为 false，则跳过该字段
    if (column.hidden === true && column.hideValue !== true) {
      continue
    }

    const rawValue = values[column.field]
    transformedValues[column.field] = column.transform?.output
      ? column.transform.output(rawValue, { values, column })
      : rawValue
  }

  // 全局提交转换
  const finalValues = props.submitTransform
    ? props.submitTransform(transformedValues)
    : transformedValues

  emit('submit', finalValues)
}

/** 步骤切换处理 */
function handleStepChange(stepIndex: number) {
  if (!stepAccessibility.value?.[stepIndex]) {
    return
  }
  activeStep.value = stepIndex
}

/** 下一步处理 */
async function nextStep(form: any) {
  if (!props.schema.steps) {
    return
  }

  const currentStepFields = props.schema.steps[activeStep.value].fields

  // 构建当前值：使用 collectLatestValues 确保获取所有步骤的值
  let currentValues: Record<string, any> = {}
  try {
    if (formApiRef) {
      currentValues = collectLatestValues()
    } else {
      currentValues =
        (form && typeof form === 'object' && 'values' in form ? (form as any).values : {}) || {}
    }
  } catch {
    currentValues = {}
  }

  const hasError = await validateStepFields(currentStepFields, currentValues)

  if (!hasError) {
    activeStep.value = Math.min(activeStep.value + 1, props.schema.steps.length - 1)
    return
  }

  // 若存在错误，触发一次原生提交以让 PrimeVue Form 渲染错误状态（不会真正提交成功）
  const formEl = formContainerRef.value?.querySelector('form') as HTMLFormElement | null
  formEl?.requestSubmit()
}

/** 上一步处理 */
function prevStep() {
  activeStep.value = Math.max(activeStep.value - 1, 0)
}

/** 验证步骤字段（对 values 做安全兜底） */
async function validateStepFields(
  fieldNames: string[],
  values: Record<string, any>
): Promise<boolean> {
  const safeValues: Record<string, any> =
    values && typeof values === 'object' ? (values as Record<string, any>) : {}

  for (const fieldName of fieldNames) {
    const column = columnByField(fieldName)
    // 跳过完全不渲染的隐藏字段的验证
    if (column?.hidden === true && column?.hideValue !== true) {
      continue
    }

    if (column?.rules) {
      const value = safeValues[fieldName]
      const error = validateField(column, value, safeValues)
      if (error) {
        markFieldTouched(fieldName)
        return true
      } // 有错误
    }
  }
  return false // 无错误
}

// 这些方法现在由用户通过 hook 调用，不再需要内部处理

/** 立即同步 valuesRef（内部方法） */
function syncValuesRefImmediately() {
  // 防止递归更新
  if (isSyncingValues) {
    return
  }
  isSyncingValues = true
  try {
    const merged = collectLatestValues()
    const filtered: Record<string, any> = {}
    for (const column of props.schema.columns) {
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }
      filtered[column.field] = merged[column.field]
    }
    // 深度比较，避免不必要的更新
    const currentStr = JSON.stringify(valuesRef.value)
    const newStr = JSON.stringify(filtered)
    if (currentStr !== newStr) {
      valuesRef.value = deepClone(filtered)
    }
  } finally {
    isSyncingValues = false
  }
}

/** 清除所有字段的验证状态（内部方法） */
function clearAllFieldValidationStates(targetFields?: string[]) {
  if (!formApiRef) {
    return
  }

  const targetSet = targetFields && targetFields.length ? new Set(targetFields) : null

  // 🔥 关键：清除每个字段的验证状态
  for (const column of props.schema.columns) {
    if (targetSet && !targetSet.has(column.field)) {
      continue
    }
    const fieldState = formApiRef[column.field]
    if (fieldState && typeof fieldState === 'object') {
      try {
        // 重置字段状态到初始状态
        if ('touched' in fieldState) {
          ;(fieldState as any).touched = false
        }
        if ('dirty' in fieldState) {
          ;(fieldState as any).dirty = false
        }
        if ('pristine' in fieldState) {
          ;(fieldState as any).pristine = true
        }
        if ('error' in fieldState) {
          ;(fieldState as any).error = null
        }
        if ('errors' in fieldState) {
          ;(fieldState as any).errors = []
        }
        if ('invalid' in fieldState) {
          ;(fieldState as any).invalid = false
        }
        if ('valid' in fieldState) {
          ;(fieldState as any).valid = true
        }
      } catch {
        /* ignore reset errors */
      }
    }
  }

  // 🔥 关键：通过 fields 对象清除所有字段的验证状态（PrimeVue Form 的内部结构）
  const formFields = formApiRef.fields
  if (formFields && typeof formFields === 'object') {
    try {
      Object.values(formFields).forEach((field: any) => {
        if (targetSet) {
          const fieldName = field?.name || field?.params?.name
          if (fieldName && !targetSet.has(fieldName)) {
            return
          }
        }
        if (field && typeof field === 'object' && field.states) {
          const states = field.states
          if (states && typeof states === 'object') {
            states.touched = false
            states.dirty = false
            states.pristine = true
            states.error = null
            states.errors = []
            states.invalid = false
            states.valid = true
          }
        }
      })
    } catch {
      /* ignore fields reset errors */
    }
  }

  // 🔥 关键：调用 PrimeVue Form 的 resetValidation 方法清除整体验证状态
  if (typeof formApiRef.resetValidation === 'function') {
    try {
      formApiRef.resetValidation()
    } catch {
      /* ignore resetValidation errors */
    }
  }
}

// =============== Expose API ===============
defineExpose({
  /** 响应式表单值（推荐外部监听它） */
  valuesRef,
  /** 步骤可达状态（与头部高亮保持一致） */
  stepAccessibility,
  /** 获取当前值（过滤掉空值字段） */
  get values() {
    // 使用 collectLatestValues 确保获取所有步骤的值
    const allValues = collectLatestValues()
    // 根据 hideValue 属性决定是否包含隐藏字段的值
    const fieldValues: Record<string, any> = {}
    for (const column of props.schema.columns) {
      // 如果字段被隐藏且 hideValue 为 false，则跳过该字段
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }
      fieldValues[column.field] = allValues[column.field]
    }
    // 🔥 关键：过滤掉空值字段，清空表单后返回 {}
    return filterEmptyValues(fieldValues)
  },
  /** 触发验证，返回 { valid, errors }（与提交流程一致的校验逻辑） */
  async validate() {
    // 使用 collectLatestValues 确保获取所有步骤的值
    const allValues = collectLatestValues()
    const values: Record<string, any> = {}
    for (const column of props.schema.columns) {
      // 如果字段被隐藏且 hideValue 为 false，则跳过该字段
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }
      values[column.field] = allValues[column.field]
    }

    const errorMap: Record<string, Array<{ message: string }>> = {}
    for (const column of props.schema.columns) {
      // 跳过完全不渲染的隐藏字段的验证
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }

      if (!column.rules) {
        continue
      }
      const value = values[column.field]
      const err = validateField(column, value, values)
      if (err) {
        errorMap[column.field] = [{ message: err }]
      }
    }
    const valid = Object.keys(errorMap).length === 0
    return { valid, errors: errorMap }
  },
  /** 提交（走内部 onValidSubmit 流程） */
  submit() {
    const formEl = formContainerRef.value?.querySelector('form') as HTMLFormElement | null
    if (formEl) {
      formEl.requestSubmit()
    }
  },
  /** 重置（恢复 defaultValue） */
  async reset() {
    debugSchemaForm('[SchemaForm][reset]')

    // 先清除所有字段的验证状态
    clearAllFieldValidationStates()

    // 🔥 关键：获取重置值（只包含有 defaultValue 的字段）
    const resetValues = getResetValues(props.schema.columns)

    debugSchemaForm('[SchemaForm][reset] resetValues', {
      resetValues,
      keys: Object.keys(resetValues),
    })

    // 🔥 关键修复：为所有字段构建完整的重置值对象
    // 有 defaultValue 的字段用默认值，没有的字段用空值
    const { getEmptyValues } = await import('./utils/emptyValues')
    const emptyValues = getEmptyValues(props.schema.columns)
    const allResetValues: Record<string, any> = {}

    // 为所有字段设置值：有 defaultValue 的用默认值，没有的用空值
    for (const column of props.schema.columns) {
      const key = column.field
      if (key in resetValues) {
        // 有 defaultValue 的字段使用默认值
        allResetValues[key] = resetValues[key]
      } else {
        // 没有 defaultValue 的字段使用空值
        allResetValues[key] = emptyValues[key]
      }
    }

    debugSchemaForm('[SchemaForm][reset] allResetValues', {
      allResetValues,
      keys: Object.keys(allResetValues),
    })

    // 🔥 关键：更新 cachedFormValues，只保存有 defaultValue 的字段（用于 buildInitialValues）
    cachedFormValues.value = deepClone(resetValues)

    // 设置表单值：有 defaultValue 的字段恢复默认值，没有的字段清空
    if (formApiRef) {
      await withPausedFieldWatchers(
        async () => {
          // 1. 清空 formApiRef.values
          if (formApiRef.values && typeof formApiRef.values === 'object') {
            Object.keys(formApiRef.values).forEach(key => {
              delete (formApiRef.values as any)[key]
            })
          }

          // 2. 🔥 关键：更新各个字段的 ref.value，使用完整的重置值对象
          for (const column of props.schema.columns) {
            const key = column.field
            const fieldRef = formApiRef[key]
            if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
              ;(fieldRef as Record<string, any>).value = allResetValues[key]
            }
          }

          // 3. 🔥 关键修复：调用 PrimeVue Form 的 setValues，传入所有字段的值对象
          // 这样确保所有字段（包括有 defaultValue 和没有的）都被正确设置
          if (typeof formApiRef.setValues === 'function') {
            formApiRef.setValues(allResetValues)
          }
        },
        true // 🔥 关键：在恢复 watcher 之前清除校验状态
      )
    }

    // 等待响应式更新完成（watch 会自动更新 valuesRef）
    await nextTick()

    // 🔥 关键：在设置值之后再次清除所有字段的验证状态
    // 确保不会因为设置值而触发校验
    clearAllFieldValidationStates()

    // 🔥 重构：如果开启 remember，保存完整的重置后的值（包括 defaultValue 和空值）
    if (rememberEnabled.value) {
      // 收集重置后的完整值（包括有 defaultValue 和没有的字段）
      const completeResetValues: Record<string, any> = {}
      for (const column of props.schema.columns) {
        if (column.hidden === true && column.hideValue !== true) {
          continue
        }
        const field = column.field
        // 使用 allResetValues 中的值（已经包含了 defaultValue 和空值）
        if (Object.prototype.hasOwnProperty.call(allResetValues, field)) {
          completeResetValues[field] = allResetValues[field]
        }
      }
      await formMemory.saveValuesImmediate(completeResetValues)
    }
  },
  /** 清空表单（所有字段设置为合适的空值） */
  async clear() {
    debugSchemaForm('[SchemaForm][clear]')

    // 先清除所有字段的验证状态
    clearAllFieldValidationStates()

    debugSchemaForm('[SchemaForm][clear] clearing all fields')

    // 🔥 关键：将 cachedFormValues 设置为空对象（表示无数据状态）
    cachedFormValues.value = {}

    // 🔥 关键修复：为所有字段生成空值对象（包括有 defaultValue 的字段）
    // 使用 getEmptyValues 确保所有字段都被设置为合适的空值
    const { getEmptyValues } = await import('./utils/emptyValues')
    const emptyValues = getEmptyValues(props.schema.columns)

    // 设置表单所有字段为空值（数据层面的清空）
    if (formApiRef) {
      await withPausedFieldWatchers(
        async () => {
          // 1. 清空 formApiRef.values
          if (formApiRef.values && typeof formApiRef.values === 'object') {
            Object.keys(formApiRef.values).forEach(key => {
              delete (formApiRef.values as any)[key]
            })
          }

          // 2. 🔥 关键：将所有字段的 ref.value 设置为对应的空值
          for (const column of props.schema.columns) {
            const key = column.field
            const fieldRef = formApiRef[key]
            if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
              ;(fieldRef as Record<string, any>).value = emptyValues[key]
            }
          }

          // 3. 调用 PrimeVue Form 的 setValues，传入所有字段的空值对象
          if (typeof formApiRef.setValues === 'function') {
            formApiRef.setValues(emptyValues)
          }
        },
        true // 🔥 关键：在恢复 watcher 之前清除校验状态
      )
    }

    // 等待响应式更新完成（watch 会自动更新 valuesRef 为 {}）
    await nextTick()

    // 🔥 关键：在设置值之后再次清除所有字段的验证状态
    // 确保不会因为设置值而触发校验
    clearAllFieldValidationStates()

    // 🔥 关键：如果开启 remember，保存空对象（表示已清空）
    if (rememberEnabled.value) {
      await formMemory.saveValuesImmediate({})
    }
  },
  /** 设置某个字段值 */
  setFieldValue(field: string, value: any) {
    debugSchemaForm('[SchemaForm][setFieldValue]', { field, value, hasFormApiRef: !!formApiRef })
    if (!formApiRef) {
      console.warn('[SchemaForm][setFieldValue] formApiRef is null')
      return
    }

    // 🔥 关键：同时更新多个位置，确保响应式更新
    // 1. 更新 formApiRef.values（标准方式）
    if (formApiRef.values && typeof formApiRef.values === 'object') {
      ;(formApiRef.values as Record<string, any>)[field] = value
    }

    // 2. 更新字段的 ref.value（适用于使用 name 绑定的字段，如 DatePicker）
    // 这在步骤表单模式下特别重要，因为 formApiRef.values 可能只包含当前步骤的字段
    const fieldRef = formApiRef[field]
    if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
      ;(fieldRef as Record<string, any>).value = value
    }

    // 3. 调用 PrimeVue Form 的 setFieldValue，确保 PrimeVue Form 的状态也更新
    if (typeof formApiRef.setFieldValue === 'function') {
      debugSchemaForm('[SchemaForm][setFieldValue] calling PrimeVue Form setFieldValue', {
        field,
        value,
      })
      formApiRef.setFieldValue(field, value)
    } else {
      // 降级：直接设置字段值
      debugSchemaForm('[SchemaForm][setFieldValue] fallback: setting formApiRef[field]', {
        field,
        value,
      })
      formApiRef[field] = value
    }

    // 🔥 关键：使用 nextTick 延迟同步，避免在同一个更新周期中触发 watch，防止递归更新
    nextTick(() => {
      syncValuesRefImmediately()
    })
  },
  /** 批量设置值 */
  setValues(newValues: Record<string, any>) {
    if (!formApiRef) {
      return
    }

    debugSchemaForm('[SchemaForm][setValues]', {
      newValues,
      hasFormApiRef: !!formApiRef,
      keys: Object.keys(newValues),
    })

    // 🔥 关键：同时更新多个位置，确保响应式更新（与 setFieldValue 保持一致）

    // 1. 先直接更新 formApiRef.values（不改变对象引用，逐键写入）
    if (formApiRef.values && typeof formApiRef.values === 'object') {
      Object.keys(newValues).forEach(key => {
        ;(formApiRef.values as any)[key] = newValues[key]
      })
    }

    // 2. 更新各个字段的 ref.value（适用于使用 name 绑定的字段）
    // 这在步骤表单模式下特别重要
    for (const column of props.schema.columns) {
      const key = column.field
      if (Object.prototype.hasOwnProperty.call(newValues, key)) {
        const fieldRef = formApiRef[key]
        if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
          ;(fieldRef as Record<string, any>).value = newValues[key]
        }
      }
    }

    // 3. 调用 PrimeVue Form 的 setValues，确保 PrimeVue Form 的状态也更新
    if (typeof formApiRef.setValues === 'function') {
      formApiRef.setValues(newValues)
    }

    // 4. 触发同步
    nextTick(() => {
      syncValuesRefImmediately()

      // 🔥 重构：批量设置后立即写入存储（使用 saveValuesImmediate 确保立即保存）
      if (rememberEnabled.value && !formMemory.isRestoring.value) {
        // 过滤隐藏字段
        const filtered: Record<string, any> = {}
        for (const column of props.schema.columns) {
          if (column.hidden === true && column.hideValue !== true) {
            continue
          }
          if (Object.prototype.hasOwnProperty.call(newValues, column.field)) {
            filtered[column.field] = newValues[column.field]
          }
        }
        // 立即保存，确保刷新后能回填
        formMemory.saveValuesImmediate(filtered)
      }
    })
  },
})
</script>
