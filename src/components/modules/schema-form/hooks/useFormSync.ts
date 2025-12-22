// @/components/schema-form/hooks/useFormSync.ts
/**
 * 表单状态同步 Hook
 * 处理核心的状态同步逻辑
 */

import { computed, nextTick, ref, watch, type Ref, type WatchStopHandle } from 'vue'
import type { SchemaConfig } from '../utils/types'

/**
 * 深度克隆工具函数
 */
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

export interface UseFormSyncOptions {
  schema: Ref<SchemaConfig>
  modelValue: Ref<Record<string, any> | undefined>
  valuesRef: Ref<Record<string, any>>
  formApiRef: Ref<any>
  preview: Ref<boolean>
  emit: (event: 'update:modelValue', value: Record<string, any>) => void
}

export interface UseFormSyncReturn {
  formValues: Ref<Record<string, any>>
  captureFormApi: (api: any) => string
  syncToModelValue: (values?: Record<string, any>) => string
  applyExternalValues: (values: Record<string, any>) => boolean
  collectLatestValues: () => Record<string, any>
  syncValuesRefImmediately: () => void
  cleanup: () => void
}

/**
 * 规范化颜色值（移除 # 前缀并转为小写）
 */
function normalizeColorValue(value: any): any {
  if (typeof value !== 'string') {
    return value
  }
  return value.replace(/^#/, '').toLowerCase()
}

/**
 * 规范化日期值
 */
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

/**
 * 规范化 modelValue
 */
function normalizeModelValue(value: Record<string, any> | null | undefined): Record<string, any> {
  if (value && typeof value === 'object') {
    return deepClone(value)
  }
  return {}
}

/**
 * 检查两个对象是否有差异
 */
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
  const pendingExternalValues = ref<Record<string, any> | null>(null)
  let lastExternalModel: Record<string, any> | null =
    modelValue.value && typeof modelValue.value === 'object' ? deepClone(modelValue.value) : null
  let lastValues: Record<string, any> = {}

  // ==================== Methods ====================
  /**
   * 应用外部值到表单
   * 🔥 P2 重构：设置 isSyncingValues 标志，防止触发 watch(watchSources)
   */
  function applyExternalValues(values: Record<string, any>): boolean {
    if (!formApiRef.value) {
      return false
    }
    // 🔥 关键修复：如果正在同步中，直接返回，避免循环
    if (isSyncingValues) {
      return true // 返回 true 表示"已处理"，避免 pendingExternalValues 堆积
    }
    isSyncingValues = true
    try {
      const normalized = deepClone(values)
      try {
        for (const column of schema.value.columns) {
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
      if (formApiRef.value.values && typeof formApiRef.value.values === 'object') {
        Object.keys(normalized).forEach(key => {
          ;(formApiRef.value.values as any)[key] = normalized[key]
        })
      }
      // 优先调用 PrimeVue Form API，避免破坏响应式对象本体
      if (typeof formApiRef.value.setValues === 'function') {
        formApiRef.value.setValues(normalized)
        return true
      }
      for (const column of schema.value.columns) {
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
        if (typeof formApiRef.value.setFieldValue === 'function') {
          formApiRef.value.setFieldValue(key, value)
          continue
        }
        const target = formApiRef.value[key]
        if (target && typeof target === 'object' && 'value' in target) {
          target.value = value
        } else {
          formApiRef.value[key] = value
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
  function collectLatestValues(): Record<string, any> {
    // 首先保留 valuesRef 中的所有现有值，确保不会丢失其他步骤的值
    const latest: Record<string, any> = { ...valuesRef.value }
    const formValues =
      formApiRef.value && formApiRef.value.values && typeof formApiRef.value.values === 'object'
        ? formApiRef.value.values
        : {}

    // 遍历所有字段，优先使用最新的表单值
    for (const column of schema.value.columns) {
      const key = column.field

      // 🔥 关键：在步骤表单模式下，formApiRef.values 可能只包含当前步骤的字段
      // 所以我们需要同时检查 formApiRef.values 和 formApiRef[key].value

      // 标记是否从表单 API 中找到了值
      let foundInFormApi = false

      // 优先从 formApiRef[key].value 获取（适用于所有使用 name 绑定的字段，包括步骤表单）
      const fieldRef = formApiRef.value?.[key]
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

  /**
   * 同步表单值到 modelValue
   * 🔥 P2 重构：只负责 emit，不更新 valuesRef（valuesRef 由外部通过 v-model 管理）
   */
  function syncToModelValue(_values?: Record<string, any>) {
    // 🔥 关键：防止递归更新，如果正在同步中，直接返回
    if (isSyncingValues) {
      return ''
    }

    const merged = _values && typeof _values === 'object' ? _values : collectLatestValues()
    const safeValues = merged && typeof merged === 'object' ? merged : {}

    // 🔥 关键修复：深度比较，避免不必要的 emit
    const currentStr = JSON.stringify(lastValues)
    const newStr = JSON.stringify(safeValues)
    if (currentStr === newStr) {
      return '' // 值没有变化，不需要 emit
    }

    // 使用浅比较优化性能，避免深度 JSON.stringify
    const hasChanged =
      Object.keys(safeValues).some(key => safeValues[key] !== lastValues[key]) ||
      Object.keys(lastValues).some(key => !(key in safeValues))

    if (hasChanged) {
      isSyncingValues = true
      try {
        const snapshot = deepClone(safeValues)
        lastValues = snapshot
        lastExternalModel = deepClone(safeValues)

        // 🔥 P2 重构：只 emit，不更新 valuesRef
        // valuesRef 现在由外部（useSchemaForm）通过 v-model 管理
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
  function captureFormApi(api: any) {
    formApiRef.value = api

    // 预览模式下，立即设置表单值
    if (preview.value && modelValue.value) {
      nextTick(() => {
        applyExternalValues(modelValue.value || {})
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
      const watchSources: any[] = []

      // 添加 formApiRef.values 作为监听源（深度监听）
      if (formApiRef.value.values) {
        watchSources.push(() => formApiRef.value.values)
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
   */
  watch(
    () => modelValue.value,
    newValue => {
      // 🔥 关键修复：如果正在同步中，跳过处理，避免循环
      if (isSyncingValues) {
        return
      }
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
