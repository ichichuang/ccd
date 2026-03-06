// @/components/SchemaForm/hooks/useFormSync.ts
/**
 * 表单状态同步 Hook
 * 处理核心的状态同步逻辑
 */

import { deepClone, deepEqual } from '@/utils/lodashes'
import type { Ref, WatchStopHandle } from 'vue'
import { getEmptyValueForComponent } from '../utils/emptyValues'
import { normalizeColorValue, normalizeDateValue } from '../utils/normalize'
import type { FormApiLike, FormValues, SchemaConfig, SchemaColumnsItem } from '../utils/types'

export interface UseFormSyncOptions {
  schema: Ref<SchemaConfig>
  modelValue: Ref<FormValues | undefined>
  valuesRef: Ref<FormValues>
  formApiRef: Ref<FormApiLike | null>
  preview: Ref<boolean>
  emit: (event: 'update:modelValue', value: FormValues) => void
}

export interface UseFormSyncReturn {
  formValues: Ref<FormValues>
  captureFormApi: (api: FormApiLike) => string
  syncToModelValue: (values?: FormValues) => string
  applyExternalValues: (values: FormValues) => boolean
  collectLatestValues: () => FormValues
  syncValuesRefImmediately: () => void
  cleanup: () => void
}

/**
 * 规范化 modelValue
 * 【性能优化】不在这里 cloneDeep，由调用方决定是否需要深拷贝
 */
function normalizeModelValue(value: FormValues | null | undefined): FormValues {
  if (value && typeof value === 'object') {
    return value // 【性能优化】返回原值，由调用方决定是否需要 cloneDeep
  }
  return {}
}

/**
 * 检查两个对象是否有差异
 */
function hasObjectDifference(a: FormValues | null, b: FormValues | null): boolean {
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

/**
 * 判断某字段的当前值是否等于该列类型的“空值”
 * 用于最小化 emit：只 emit 曾出现过的键或当前非空值，避免 Reset/Clear 后把 values 扩展为全量字段
 */
function isValueEmptyForColumn(value: unknown, column: SchemaColumnsItem): boolean {
  const emptyVal = getEmptyValueForComponent(column.component)
  if (value === emptyVal) {
    return true
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof emptyVal === 'object' &&
    emptyVal !== null
  ) {
    return deepEqual(value, emptyVal)
  }
  return false
}

/**
 * 使用表单状态同步 Hook
 */
export function useFormSync(options: UseFormSyncOptions): UseFormSyncReturn {
  const { schema, modelValue, valuesRef, formApiRef, preview, emit } = options

  // ==================== State ====================
  let formValuesWatchStop: WatchStopHandle | null = null
  let valuesRefWatchStop: WatchStopHandle | null = null
  let formValuesSyncTimer: NodeJS.Timeout | null = null
  let valuesRefSyncTimer: NodeJS.Timeout | null = null
  let isSyncingValues = false
  const pendingExternalValues = ref<FormValues | null>(null)
  let lastExternalModel: FormValues | null =
    modelValue.value && typeof modelValue.value === 'object' ? deepClone(modelValue.value) : null
  let lastValues: FormValues =
    modelValue.value && typeof modelValue.value === 'object' ? deepClone(modelValue.value) : {}

  // ==================== Methods ====================
  /**
   * 应用外部值到表单
   * 🔥 P2 重构：设置 isSyncingValues 标志，防止触发 watch(watchSources)
   */
  function applyExternalValues(values: FormValues): boolean {
    if (!formApiRef.value) {
      return false
    }
    // 🔥 关键修复：如果正在同步中，直接返回，避免循环
    if (isSyncingValues) {
      return true // 返回 true 表示"已处理"，避免 pendingExternalValues 堆积
    }
    isSyncingValues = true
    try {
      const api = formApiRef.value
      if (!api) return false
      const normalized = deepClone(values)
      try {
        for (const column of schema.value.columns) {
          const key = column.field
          let val = normalized[key]
          // 1. 先做 transform.input（外部 → 控件逻辑值）
          if (column.transform?.input && typeof column.transform.input === 'function') {
            try {
              val = column.transform.input(val, { values: normalized, column })
            } catch {
              /* 转换异常时保留原值 */
            }
          }
          // 2. 再按组件做控件层规范化
          if (column.component === 'ColorPicker') {
            val = normalizeColorValue(val)
          } else if (column.component === 'DatePicker') {
            const valueFormat =
              typeof (column.props as Record<string, unknown>)?.valueFormat === 'string'
                ? ((column.props as Record<string, unknown>).valueFormat as string)
                : 'timestamp'
            val = normalizeDateValue(val, valueFormat)
          }
          normalized[key] = val
        }
      } catch {
        /* ignore normalization errors */
      }

      // 先尝试直接写入现有 Proxy（不更换对象引用）
      if (api.values && typeof api.values === 'object') {
        Object.keys(normalized).forEach(key => {
          ;(api.values as FormValues)[key] = normalized[key]
        })
      }
      // 优先调用 PrimeVue Form API，避免破坏响应式对象本体
      if (typeof api.setValues === 'function') {
        api.setValues(normalized)
        return true
      }
      for (const column of schema.value.columns) {
        const key = column.field
        const hasValue = Object.prototype.hasOwnProperty.call(values, key)
        let value = hasValue ? deepClone(values[key]) : undefined
        if (column.transform?.input && typeof column.transform.input === 'function') {
          try {
            const ctxValues =
              api.values && typeof api.values === 'object' ? (api.values as FormValues) : normalized
            value = column.transform.input(value, { values: ctxValues, column })
          } catch {
            /* 转换异常时保留原值 */
          }
        }
        if (column.component === 'ColorPicker') {
          value = normalizeColorValue(value)
        } else if (column.component === 'DatePicker') {
          const valueFormat =
            typeof (column.props as Record<string, unknown>)?.valueFormat === 'string'
              ? ((column.props as Record<string, unknown>).valueFormat as string)
              : 'timestamp'
          value = normalizeDateValue(value, valueFormat)
        }
        if (typeof api.setFieldValue === 'function') {
          api.setFieldValue(key, value)
          continue
        }
        const target = api[key]
        if (target && typeof target === 'object' && 'value' in target) {
          ;(target as Record<string, unknown>).value = value
        } else {
          api[key] = value
        }
      }
      return true
    } catch {
      return false
    } finally {
      // 🔥 关键修复：使用 nextTick 延迟重置标志，确保所有响应式更新完成
      nextTick(() => {
        isSyncingValues = false
      })
    }
  }

  /**
   * 刷新待处理的外部值
   */
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

  /**
   * 收集最新的表单值
   * 在步骤表单模式下，确保获取所有步骤的值
   */
  function collectLatestValues(): FormValues {
    // 1. 基准：使用 valuesRef (包含了所有步骤的历史值，由 modelValue 同步而来)
    const latest: FormValues = { ...valuesRef.value }

    // 2. 覆盖：使用当前 Form API 中的实时值 (仅包含当前步骤的字段)
    if (formApiRef.value) {
      const currentStepValues = formApiRef.value.values || {}

      // 遍历 schema 所有字段，决定取值来源
      for (const column of schema.value.columns) {
        const key = column.field

        // 优先 1：当前步骤的实时输入 (在 formApiRef.values 中)
        if (Object.prototype.hasOwnProperty.call(currentStepValues, key)) {
          latest[key] = currentStepValues[key]
          continue
        }

        // 优先 2：当前步骤的实时输入 (直接访问 field 引用，针对特殊组件)
        const fieldRef = formApiRef.value[key]
        if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
          latest[key] = fieldRef.value
          continue
        }

        // 优先 3：保留 latest 中的历史值 (非当前步骤字段)
      }
    }
    return latest
  }

  /**
   * 同步表单值到 modelValue
   * 🔥 P2 重构：只负责 emit，不更新 valuesRef（valuesRef 由外部通过 v-model 管理）
   * 🔥 最小化 emit：只包含「上次已有」或「当前非空」的键，避免 Reset/Clear 后 values 被扩展为全量字段
   */
  function syncToModelValue(_values?: FormValues) {
    // 🔥 关键：防止递归更新，如果正在同步中，直接返回
    if (isSyncingValues) {
      return ''
    }

    const merged = _values && typeof _values === 'object' ? _values : collectLatestValues()
    const safeValues = merged && typeof merged === 'object' ? merged : {}

    // 构建最小化对象：仅保留「曾在 lastValues 中出现」或「当前值非该列空值」的键
    const minimal: FormValues = {}
    for (const column of schema.value.columns) {
      const key = column.field
      const val = safeValues[key]
      const wasInModel = Object.prototype.hasOwnProperty.call(lastValues, key)
      // 将 undefined 视为空，避免 Reset/Clear 后未触碰字段为 undefined 时被当成“有值”而全量 emit
      const isEmpty = val === undefined || isValueEmptyForColumn(val, column)
      if (wasInModel || !isEmpty) {
        minimal[key] = val
      }
    }

    // 与上次 emit 的结果比较，无变化则不 emit
    const hasChanged = !deepEqual(minimal, lastValues)

    if (hasChanged) {
      // 防止过于频繁的更新
      if (isSyncingValues) return ''

      isSyncingValues = true
      try {
        const snapshot = deepClone(minimal)
        lastValues = snapshot
        lastExternalModel = deepClone(minimal)

        // 🔥 P2 重构：只 emit 最小化对象，避免 Reset/Clear 后 values 变为全量字段
        emit('update:modelValue', snapshot)
      } finally {
        // 🔥 关键修复：使用 nextTick 延迟重置标志，确保所有响应式更新完成
        nextTick(() => {
          isSyncingValues = false
        })
      }
    }
    return ''
  }

  /**
   * 立即同步 valuesRef
   * 🔥 P2 重构：valuesRef 现在是 computed，直接反映 modelValue，无需手动同步
   * 此函数保留为空实现，以保持 API 兼容性
   */
  function syncValuesRefImmediately() {
    // 🔥 P2 重构：valuesRef 现在是 computed(() => props.modelValue || {})
    // 它会自动响应 modelValue 的变化，无需手动同步
    // 此函数保留为空实现，以保持 API 兼容性
  }

  /**
   * 捕获表单 API
   */
  function captureFormApi(api: FormApiLike) {
    formApiRef.value = api

    // 预览模式下，立即设置表单值
    if (preview.value && modelValue.value && typeof modelValue.value === 'object') {
      nextTick(() => {
        if (formApiRef.value) {
          applyExternalValues(modelValue.value as FormValues)
        }
      })
    }

    // 清理之前的 watch
    if (formValuesWatchStop) {
      formValuesWatchStop()
      formValuesWatchStop = null
    }

    // 🔥 关键修复：预览模式下不创建 watch，因为预览模式是只读的，不需要监听值的变化
    // 这样可以避免大量的计算和潜在的循环依赖
    if (preview.value) {
      // 预览模式下，只设置初始值，不创建 watch
      flushPendingExternalValues()
      return ''
    }

    // 监听表单值变化，实时更新 valuesRef
    // 这个 watch 确保在修改任何步骤的表单项时，valuesRef 都能实时更新
    // 即使当前不在该步骤，也能获取到值的变化
    if (formApiRef.value) {
      // 🔥 关键：在步骤表单模式下，需要同时监听 formApiRef.values 和各个字段的 value
      // 构建监听源数组：包括 formApiRef.values 和所有字段的 value
      const watchSources: Array<() => unknown> = []

      // 添加 formApiRef.values 作为监听源（深度监听）
      if (formApiRef.value.values) {
        watchSources.push(() => formApiRef.value?.values)
      }

      // 为每个字段添加监听源（适用于直接绑定到 formApiRef[field].value 的组件）
      // 这在步骤表单模式下特别重要，因为 formApiRef.values 可能只包含当前步骤的字段
      for (const column of schema.value.columns) {
        const key = column.field
        const fieldRef = formApiRef.value[key]
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
              // 🔥 P2 重构：直接调用 syncToModelValue，不更新 valuesRef
              // valuesRef 现在由外部（useSchemaForm）通过 v-model 管理
              syncToModelValue()
              formValuesSyncTimer = null
            }, 30) // 减少防抖延迟到 30ms，确保更快的响应
          },
          { deep: true, immediate: true }
        )
      }
    }

    flushPendingExternalValues()

    // 🔥 P2 重构：移除 watch(valuesRef)，因为 valuesRef 现在由外部管理
    // 表单值的变化通过 watch(watchSources) 监听，直接调用 syncToModelValue
    // 不再需要监听 valuesRef，避免循环依赖

    return ''
  }

  /**
   * 清理资源
   */
  function cleanup() {
    if (formValuesWatchStop) {
      formValuesWatchStop()
      formValuesWatchStop = null
    }
    if (formValuesSyncTimer) {
      clearTimeout(formValuesSyncTimer)
      formValuesSyncTimer = null
    }
    if (valuesRefWatchStop) {
      valuesRefWatchStop()
      valuesRefWatchStop = null
    }
    if (valuesRefSyncTimer) {
      clearTimeout(valuesRefSyncTimer)
      valuesRefSyncTimer = null
    }
  }

  // ==================== Computed ====================
  /**
   * 表单值（计算属性）
   * 预览模式下使用 modelValue，否则使用实际表单值
   */
  const formValues = computed(() => {
    // 预览模式下，直接使用 modelValue
    if (preview.value) {
      return modelValue.value || {}
    }
    // 如果 formApiRef 已就绪，使用实际表单值
    if (formApiRef.value) {
      return collectLatestValues()
    }
    // 否则返回空对象（初始化阶段）
    return {}
  })

  // ==================== Watchers ====================
  /**
   * 监听外部 modelValue 变化，更新内部表单值
   * 🔥 P2 重构：添加 isSyncingValues 检查，防止循环
   * 【性能优化】减少 cloneDeep 调用次数，复用已克隆的对象
   */
  watch(
    () => modelValue.value,
    newValue => {
      // 🔥 关键修复：如果正在同步中，跳过处理，避免循环
      if (isSyncingValues) {
        return
      }

      // 【性能优化】先进行浅层比较，避免不必要的 cloneDeep
      if (!hasObjectDifference(newValue ?? null, lastExternalModel)) {
        return
      }

      // 【性能优化】只在需要时调用一次 cloneDeep，然后复用已克隆的对象
      const normalized = normalizeModelValue(newValue)
      const clonedNormalized = deepClone(normalized) // 只调用一次 deepClone

      lastExternalModel = clonedNormalized // 复用已克隆的对象
      lastValues = clonedNormalized // 复用已克隆的对象

      if (!applyExternalValues(normalized)) {
        pendingExternalValues.value = clonedNormalized // 复用已克隆的对象
        flushPendingExternalValues()
      }
    },
    { deep: true } // 保持深度监听以确保嵌套对象变化能被捕获，但通过浅层比较减少不必要的 cloneDeep
  )

  return {
    formValues,
    captureFormApi,
    syncToModelValue,
    applyExternalValues,
    collectLatestValues,
    syncValuesRefImmediately,
    cleanup,
  }
}
