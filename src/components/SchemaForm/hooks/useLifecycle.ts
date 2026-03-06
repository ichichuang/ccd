// @/components/SchemaForm/hooks/useLifecycle.ts
/**
 * 生命周期管理 Hook
 * 管理生命周期事件
 */

import { useLayoutStore } from '@/stores/modules/layout'
import type { Ref } from 'vue'
import type { FormApiLike, FormValues, SchemaConfig } from '../utils/types'
import { filterEmptyValues } from '../utils/valueHelpers'
import type { UseFormMemoryReturn } from './useFormMemory'

const layoutStore = useLayoutStore()

export interface UseLifecycleOptions {
  schema: Ref<SchemaConfig>
  remember: Ref<boolean>
  formApiRef: Ref<FormApiLike<FormValues> | null>
  valuesRef: Ref<Record<string, unknown>>
  cachedFormValues: Ref<Record<string, unknown> | null>
  rememberReady: Ref<boolean>
  formMemory: UseFormMemoryReturn
  applyExternalValues: (values: Record<string, unknown>) => boolean
  collectLatestValues: () => Record<string, unknown>
  syncToModelValue: (values?: Record<string, unknown>) => string
  syncValuesRefImmediately: () => void
  buildInitialValues: () => Record<string, unknown>
  updateContainerWidth: () => void
  setupResizeObserver: () => void
  formSyncCleanup: () => void
}

export interface UseLifecycleReturn {
  markRememberReady: () => void
  cleanup: () => void
}

/**
 * 生成表单唯一ID
 */
function getFormId(schema: SchemaConfig): string {
  const path = typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  const fieldsSig = Array.isArray(schema?.columns)
    ? schema.columns.map((c: { field: string }) => c.field).join(',')
    : ''
  return `${path}::${fieldsSig}`
}

/**
 * 使用生命周期 Hook
 */
export function useLifecycle(options: UseLifecycleOptions): UseLifecycleReturn {
  const {
    schema,
    remember,
    formApiRef,
    valuesRef: _valuesRef, // 🔥 P2 重构：valuesRef 现在是 computed，不再需要手动操作
    cachedFormValues,
    rememberReady,
    formMemory,
    applyExternalValues,
    collectLatestValues,
    syncToModelValue,
    syncValuesRefImmediately,
    buildInitialValues: _buildInitialValues, // 🔥 P2 重构：初始值由外部管理，不再需要此函数
    updateContainerWidth,
    setupResizeObserver,
    formSyncCleanup,
  } = options

  /**
   * 标记 remember 功能已就绪
   */
  function markRememberReady() {
    if (!rememberReady.value) {
      rememberReady.value = true
    }
  }

  /**
   * 清理资源
   */
  function cleanup() {
    formSyncCleanup()
    // 离开组件强制落盘
    try {
      formMemory.flush()
    } catch {
      /* ignore flush errors */
    }
  }

  // ==================== Lifecycle ====================
  onMounted(() => {
    // 延迟设置，确保 DOM 已经渲染
    nextTick(() => {
      const rememberEnabled = Boolean(
        remember.value && !(schema.value.steps && schema.value.steps.length)
      )

      // 初始化内容记忆：异步加载并回填
      if (rememberEnabled) {
        const formId = getFormId(schema.value)
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
            const mergedValues: Record<string, unknown> = {}

            // 如果缓存中有数据，需要合并 defaultValue
            if (incoming && typeof incoming === 'object' && Object.keys(incoming).length > 0) {
              // 遍历所有字段，合并 defaultValue 和缓存值
              for (const column of schema.value.columns) {
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
              for (const column of schema.value.columns) {
                if (column.defaultValue !== undefined) {
                  mergedValues[column.field] = column.defaultValue
                }
              }
              // 设置为 null，表示没有缓存（但可能有 defaultValue）
              cachedFormValues.value = null
            }

            // 如果没有需要应用的值，直接返回
            if (Object.keys(mergedValues).length === 0) {
              markRememberReady()
              return
            }

            const apply = () => {
              try {
                if (!formApiRef.value) {
                  return false
                }

                // 使用 applyExternalValues 来应用值，它会正确处理 DatePicker 和 ColorPicker 的规范化
                if (applyExternalValues(mergedValues)) {
                  // 确保 formApiRef.values 也拿到最新值
                  if (formApiRef.value.values && typeof formApiRef.value.values === 'object') {
                    Object.keys(mergedValues).forEach(k => {
                      ;(formApiRef.value!.values as Record<string, unknown>)[k] = mergedValues[k]
                    })
                  }
                  // 更新字段的 ref.value
                  for (const column of schema.value.columns) {
                    const field = column.field
                    if (Object.prototype.hasOwnProperty.call(mergedValues, field)) {
                      const fieldRef = formApiRef.value[field]
                      if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
                        ;(fieldRef as Record<string, unknown>).value = mergedValues[field]
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
                if (typeof formApiRef.value.setValues === 'function') {
                  formApiRef.value.setValues(mergedValues)
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
      // 🔥 P2 重构：valuesRef 现在是 computed(() => props.modelValue || {})
      // 它会自动反映 modelValue 的变化，无需手动初始化
    })

    // 添加窗口大小变化监听作为备用方案
    window.addEventListener('resize', updateContainerWidth)
    // 页面关闭/刷新时强制落盘
    const beforeUnloadHandler = () => {
      try {
        const rememberEnabled = Boolean(
          remember.value && !(schema.value.steps && schema.value.steps.length)
        )
        // 🔥 关键：在页面关闭前，先保存当前表单值，确保不丢失数据
        if (rememberEnabled && formApiRef.value && !formMemory.isRestoring.value) {
          const currentValues = collectLatestValues()
          // 过滤隐藏字段
          const filtered: Record<string, unknown> = {}
          for (const column of schema.value.columns) {
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
      window.removeEventListener('resize', updateContainerWidth)
    })
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    markRememberReady,
    cleanup,
  }
}
