/**
 * useAsyncOptions - V2 异步选项控制器
 *
 * 在 SchemaForm 层级维护 optionsMap、loadingMap、errorMap，
 * 支持 (model) => Promise<OptionItem[]> 的级联/异步 options。
 * 内置 Poka-yoke 容错：接口报错时设置 errorMap，UI 可展示「加载失败，点击重试」。
 */
import { loadOptions } from '../utils/helper'
import type { OptionItem, SchemaColumnsItem, SchemaConfig } from '../utils/types'
import type { Ref } from 'vue'

export interface UseAsyncOptionsOptions {
  schema: Ref<SchemaConfig>
  modelValue: Ref<Record<string, unknown>>
  optionsCacheTTL: number
}

export interface UseAsyncOptionsReturn {
  /** 各字段的选项列表 */
  optionsMap: Ref<Record<string, OptionItem[]>>
  /** 各字段的加载状态 */
  loadingMap: Ref<Record<string, boolean>>
  /** 各字段的加载错误（接口失败时设置，用于展示「加载失败，点击重试」） */
  errorMap: Ref<Record<string, Error | null>>
  /** 重试指定字段的异步 options 加载 */
  retryField: (field: SchemaColumnsItem) => Promise<void>
}

export function useAsyncOptions({
  schema,
  modelValue,
  optionsCacheTTL,
}: UseAsyncOptionsOptions): UseAsyncOptionsReturn {
  const optionsMap = ref<Record<string, OptionItem[]>>({})
  const loadingMap = ref<Record<string, boolean>>({})
  const errorMap = ref<Record<string, Error | null>>({})

  const ctx = computed(() => ({
    values: modelValue.value || {},
    column: {} as SchemaColumnsItem,
  }))

  async function resolveField(field: SchemaColumnsItem) {
    const hasAsyncOptions = typeof (field.options ?? field.props?.options) === 'function'
    if (!hasAsyncOptions) return
    loadingMap.value = { ...loadingMap.value, [field.field]: true }
    errorMap.value = { ...errorMap.value, [field.field]: null }
    try {
      const data = await loadOptions(field, ctx.value, optionsCacheTTL)
      optionsMap.value = { ...optionsMap.value, [field.field]: data }
      errorMap.value = { ...errorMap.value, [field.field]: null }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      optionsMap.value = { ...optionsMap.value, [field.field]: [] }
      errorMap.value = { ...errorMap.value, [field.field]: error }
      console.warn('[useAsyncOptions] Async options load failed:', {
        field: field.field,
        error: error.message,
      })
    } finally {
      loadingMap.value = { ...loadingMap.value, [field.field]: false }
    }
  }

  async function retryField(field: SchemaColumnsItem) {
    await resolveField(field)
  }

  watch(
    () => {
      const cols = schema.value?.columns ?? []
      const model = modelValue.value ?? {}
      return {
        columns: cols,
        depValues: cols
          .filter(c => c.dependsOn?.length)
          .flatMap(c => (c.dependsOn ?? []).map(k => model[k])),
      }
    },
    ({ columns }) => {
      for (const col of columns) {
        const hasAsync = typeof (col.options ?? col.props?.options) === 'function'
        if (hasAsync) {
          resolveField(col)
        } else if (Array.isArray(col.options ?? col.props?.options)) {
          optionsMap.value = {
            ...optionsMap.value,
            [col.field]: (col.options ?? col.props?.options) as OptionItem[],
          }
        }
      }
    },
    { immediate: true, deep: true }
  )

  return { optionsMap, loadingMap, errorMap, retryField }
}
