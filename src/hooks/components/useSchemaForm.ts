// @/hooks/components/useSchemaForm.ts
/**
 * useSchemaForm.ts
 * - 提供操作 schema + values 的方法（便于外部按需调用）
 * - 例如：addField / removeField / updateField / setValues / reset / submitProgrammatic
 */

import type { Schema, SchemaColumnsItem } from '@/components/modules/schema-form/utils/types'
import {
  computed,
  isRef,
  nextTick,
  onUnmounted,
  reactive,
  ref,
  unref,
  watchEffect,
  type Ref,
} from 'vue'

/**
 * 深度克隆工具函数
 * @param value - 需要克隆的值
 * @returns 克隆后的值
 * @description 支持多种克隆方式：structuredClone > JSON.parse > 浅克隆兜底
 */
const deepClone = <T>(value: T): T => {
  // 原始类型或函数直接返回
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      // ignore structuredClone failures
    }
  }

  try {
    return JSON.parse(JSON.stringify(value)) as T
  } catch {
    // JSON 仍失败时，做浅克隆以避免抛错（保持兼容性）
    if (Array.isArray(value)) {
      return [...value] as unknown as T
    }
    return { ...(value as Record<string, any>) } as T
  }
}

/**
 * SchemaForm 组件暴露的 API 接口
 * @description 定义 SchemaForm 组件通过 ref 暴露给外部的方法和属性
 */
export interface SchemaFormExpose {
  /** 表单值（getter，返回当前所有字段的值） */
  values: Record<string, any>
  /** 表单值的响应式引用（推荐使用，更稳定） */
  valuesRef?: Record<string, any>
  /** 验证表单，返回验证结果 */
  validate: () => Promise<{ valid: boolean; errors: any }>
  /** 提交表单（触发内部提交流程） */
  submit: () => void
  /** 重置表单（恢复 defaultValue）- 异步方法，确保存储清除完成 */
  reset: () => Promise<void>
  /** 清空表单（所有字段设置为 undefined）- 异步方法，确保存储清除完成 */
  clear: () => Promise<void>
  /** 设置单个字段值 */
  setFieldValue: (field: string, value: any) => void
  /** 批量设置表单值 */
  setValues: (newValues: Record<string, any>) => void
}

/**
 * useSchemaForm Hook 返回值接口
 * @description 定义 hook 返回的所有方法和响应式数据
 */
export interface UseSchemaFormReturn {
  // ========== 响应式数据 ==========
  /** 响应式 schema 配置（可动态修改） */
  schema: Schema
  /** 实时表单值（稳定引用，重置/清空后仍保持更新） */
  formValues: Ref<Record<string, any>>
  /** 步骤表单的可达状态数组（每个步骤是否可访问） */
  stepAccessibility: Ref<boolean[]>

  // ========== 表单整体操作 ==========
  /** 获取表单数据（必须通过校验，否则返回 undefined） */
  getFormData: () => Promise<Record<string, any> | undefined>
  /** 获取表单值（不校验，直接返回当前值） */
  getFormValues: () => Record<string, any>
  /** 重置表单（清空所有值，然后恢复有 defaultValue 的字段）- 异步方法 */
  resetForm: () => Promise<void>
  /** 清空表单（所有字段设置为 undefined，不管是否有 defaultValue）- 异步方法 */
  clearForm: () => Promise<void>
  /** 提交表单（先验证，通过后触发提交） */
  submitForm: () => Promise<{ valid: boolean; errors: any }>
  /** 验证表单（仅验证，不提交） */
  validateForm: () => Promise<{ valid: boolean; errors: any }>

  // ========== 表单项操作 ==========
  /** 添加字段到 schema */
  addField: (field: SchemaColumnsItem, index?: number | 'first' | 'last' | null) => boolean
  /** 从 schema 中删除字段 */
  removeField: (fieldName: string) => boolean
  /** 更新字段配置 */
  updateField: (fieldName: string, updates: Partial<SchemaColumnsItem>) => boolean
  /** 获取字段配置 */
  getField: (fieldName: string) => SchemaColumnsItem | undefined
  /** 获取字段值 */
  getFieldValue: (fieldName: string) => any
  /** 设置字段值 */
  setFieldValue: (fieldName: string, value: any) => void
  /** 移动字段位置 */
  moveField: (fieldName: string, newIndex: number) => boolean

  // ========== 批量操作 ==========
  /** 批量设置表单值 */
  setValues: (newValues: Record<string, any>) => void

  // ========== 工具方法 ==========
  /** 检查字段是否存在 */
  hasField: (fieldName: string) => boolean
  /** 获取字段在 schema.columns 中的索引 */
  getFieldIndex: (fieldName: string) => number
  /** 获取步骤可达状态数组（stepAccessibility 的副本） */
  getStepAccessibility: () => boolean[]
}

/**
 * useSchemaForm Hook
 * @param formRef - SchemaForm 组件的 ref 引用
 * @param initialSchema - 初始 schema 配置
 * @param remember - 是否开启表单记忆功能（IndexedDB 存储）
 * @param formId - 可选：自定义表单唯一ID；默认基于路由路径+字段签名
 * @returns UseSchemaFormReturn - 返回所有表单操作方法
 * @description 提供完整的表单操作方法，支持动态字段管理、值操作、验证提交等
 */
export const useSchemaForm = ({
  formRef,
  initialSchema,
  remember: _remember,
  formId: _formId,
}: {
  formRef: Ref<SchemaFormExpose | undefined>
  initialSchema: Schema
  remember?: boolean
  /** 可选：自定义表单唯一ID；默认基于路由路径+字段签名 */
  formId?: string
}): UseSchemaFormReturn => {
  // ========== 响应式数据 ==========
  /** 响应式 schema 数据 - 使用类型断言避免复杂的类型推断 */
  const schema = reactive(initialSchema as any) as Schema

  // ========== 响应式状态 ==========
  /**
   * 稳定的表单值引用
   * @description 提供一个稳定的、可深度追踪的表单值引用，避免直接监听 formRef?.values 带来的引用丢失问题
   */
  const formValuesRef = ref<Record<string, any>>({})

  /**
   * 步骤可达状态的计算属性
   * @description 从 SchemaForm 组件暴露的 stepAccessibility 中获取，确保响应式更新
   */
  const stepAccessibilityRef = computed<boolean[]>(() => {
    const exposed: any = unref(formRef)
    const source = exposed?.stepAccessibility
    if (isRef(source)) {
      return Array.isArray(source.value) ? [...source.value] : []
    }
    if (Array.isArray(source)) {
      return [...source]
    }
    return []
  })

  // ========== 内部工具函数 ==========
  /**
   * 同步表单值到稳定引用
   * @description 从 formRef 拉取一次并写入稳定引用，用于手动同步
   * @description 🔥 关键：使用 valuesRef 而不是 values getter，确保获取最新的响应式值
   */
  const syncFormValues = () => {
    const form = unref(formRef)
    if (!form) {
      formValuesRef.value = {}
      return
    }

    // 🔥 关键：优先使用 valuesRef（响应式引用），这是 SchemaForm 的内部状态
    if (form.valuesRef && isRef(form.valuesRef)) {
      formValuesRef.value = deepClone(form.valuesRef.value || {})
      return
    }

    // 降级：使用 values getter（可能有过滤逻辑）
    const current = form.values || {}
    formValuesRef.value = deepClone(current)
  }

  // ========== 表单值获取方法 ==========
  /**
   * 获取表单值（不校验，直接返回当前值）
   * @returns Record<string, any> - 当前所有字段的值（过滤掉空值字段）
   * @description 优先使用 valuesRef，降级使用 values getter，最后使用内部缓存
   * @description 清空表单后返回 {}
   */
  const getFormValues = () => {
    const form = unref(formRef)
    if (!form) {
      return formValuesRef.value || {}
    }
    // 优先使用 valuesRef（响应式引用）- 已经过滤了空值
    if (form.valuesRef && isRef(form.valuesRef)) {
      return form.valuesRef.value || {}
    }
    // 降级：使用 values getter - 已经过滤了空值
    if (typeof form.values === 'object' && form.values !== null) {
      return { ...form.values }
    }
    // 最后使用内部缓存
    return formValuesRef.value || {}
  }

  /**
   * 获取表单数据（必须通过校验）
   * @returns Promise<Record<string, any> | undefined> - 验证通过返回数据，否则返回 undefined
   * @description 先提交表单进行验证，只有验证通过才返回数据
   */
  const getFormData = async (): Promise<Record<string, any> | undefined> => {
    const form = unref(formRef)
    const result = await validateForm()

    // 🔥 关键：即使只是获取数据，也要触发一次 submit，让 PrimeVue Form 渲染校验状态
    form?.submit()

    if (result.valid) {
      return getFormValues()
    }
    return undefined
  }

  // ========== 表单值监听 ==========
  /**
   * 防抖定时器
   * @description 用于表单值变化的防抖处理，避免频繁更新
   */
  let debounceTimer: NodeJS.Timeout | null = null

  /**
   * 深度监听内部表单值并同步到稳定引用
   * @description 使用 watchEffect 自动追踪 SchemaForm 暴露的 valuesRef / values 的变化
   * @description 🔥 关键：当 remember 恢复或 defaultValue 应用时，也能立即同步到 formValuesRef
   */
  const stopEffect = watchEffect(() => {
    const exposed: any = unref(formRef)
    if (!exposed) {
      formValuesRef.value = {}
      return
    }

    let currentValues: Record<string, any> = {}

    // 1️⃣ 优先使用 SchemaForm 暴露的 valuesRef（响应式引用）
    const valuesRefSource = exposed.valuesRef
    if (valuesRefSource) {
      currentValues = isRef(valuesRefSource)
        ? valuesRefSource.value || {}
        : (valuesRefSource as Record<string, any>)
    } else {
      // 2️⃣ 降级：使用 SchemaForm 暴露的 values getter
      //    该 getter 内部会使用 collectLatestValues + filterEmptyValues，
      //    能正确反映 remember 恢复 / defaultValue / 手动修改后的最新值
      try {
        const valuesFromGetter = exposed.values
        if (valuesFromGetter && typeof valuesFromGetter === 'object') {
          currentValues = valuesFromGetter as Record<string, any>
        }
      } catch {
        // 忽略 getter 访问异常，保持 currentValues 为空对象
      }
    }

    // 防抖处理，避免频繁更新
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      // 深度克隆，确保引用稳定
      formValuesRef.value = deepClone(currentValues || {})
      debounceTimer = null
    }, 16) // 减少防抖延迟到 16ms（约一帧），确保更快的响应
  })

  // 🔥 清理函数：在组件卸载时调用
  onUnmounted(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (stopEffect) {
      stopEffect()
    }
  })

  // ========== 表单整体操作方法 ==========

  /**
   * 动态导入工具函数
   * @description 避免循环依赖，在需要时才导入
   */
  let getEmptyValuesFunc: ((columns: SchemaColumnsItem[]) => Record<string, any>) | null = null
  let getResetValuesFunc: ((columns: SchemaColumnsItem[]) => Record<string, any>) | null = null

  const loadUtilFunctions = async () => {
    if (!getEmptyValuesFunc || !getResetValuesFunc) {
      const { getEmptyValues, getResetValues } = await import(
        '@/components/modules/schema-form/utils/emptyValues'
      )
      getEmptyValuesFunc = getEmptyValues
      getResetValuesFunc = getResetValues
    }
  }

  /**
   * 获取空白值（根据组件类型设置合适的空值）
   * @description 用于 clearForm 的降级处理
   */
  const getBlankValues = async (): Promise<Record<string, any>> => {
    await loadUtilFunctions()
    return getEmptyValuesFunc!(schema.columns || [])
  }

  /**
   * 获取重置值（恢复 defaultValue）
   * @description 用于 resetForm 的降级处理
   */
  const getResetValuesInternal = async (): Promise<Record<string, any>> => {
    await loadUtilFunctions()
    return getResetValuesFunc!(schema.columns || [])
  }

  /**
   * 应用值快照（降级方案）
   * @description 当 SchemaForm 没有 reset/clear 方法时使用
   */
  const applySnapshot = (values: Record<string, any>) => {
    const form = unref(formRef)
    if (!form) {
      return
    }
    const snapshot = { ...values }

    // 调用 setValues，让 SchemaForm 处理值更新
    form.setValues(snapshot)

    // 等待 SchemaForm 的响应式更新完成后，再同步到本地引用
    nextTick(() => {
      syncFormValues()
    })
  }

  /**
   * 表单整体操作串行队列
   * @description 确保 reset/clear 等操作按顺序执行，避免并发导致状态覆盖
   */
  let formOperationQueue: Promise<void> = Promise.resolve()

  const runExclusiveOperation = <T>(operation: () => Promise<T>): Promise<T> => {
    const run = formOperationQueue.then(operation)
    formOperationQueue = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  /**
   * 重置表单
   * @description 恢复所有字段到 defaultValue（如果定义了），没有 defaultValue 的字段设为空值
   * @description 会清除验证状态，如果开启了 remember，会清除并重写存储
   * @returns Promise<void>
   */
  const resetForm = () => {
    return runExclusiveOperation(async () => {
      const form = unref(formRef)
      if (!form) {
        return
      }

      // 🔥 关键：在操作前清除防抖定时器，避免延迟更新
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }

      // 优先调用 SchemaForm 的 reset() 方法
      if (typeof form.reset === 'function') {
        await form.reset()
        // 等待 SchemaForm 完成操作后，立即同步到本地引用
        await nextTick()
        syncFormValues()
      } else {
        // 降级方案：直接设置值
        console.warn('[useSchemaForm] form.reset() is not available, using fallback')
        const resetValues = await getResetValuesInternal()
        applySnapshot(resetValues)
      }
    })
  }

  /**
   * 清空表单
   * @description 将所有字段设置为合适的空值，清除所有内容（包括有 defaultValue 的字段）
   * @description 会清除验证状态，如果开启了 remember，会清除并重写存储
   * @returns Promise<void>
   */
  const clearForm = () => {
    return runExclusiveOperation(async () => {
      const form = unref(formRef)
      if (!form) {
        return
      }

      // 🔥 关键：在操作前清除防抖定时器，避免延迟更新
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }

      // 优先调用 SchemaForm 的 clear() 方法
      if (typeof form.clear === 'function') {
        await form.clear()
        // 等待 SchemaForm 完成操作后，立即同步到本地引用
        await nextTick()
        syncFormValues()
      } else {
        // 降级方案：直接设置值
        console.warn('[useSchemaForm] form.clear() is not available, using fallback')
        const clearValues = await getBlankValues()
        applySnapshot(clearValues)
      }
    })
  }

  /**
   * 验证表单（仅验证，不提交）
   * @returns Promise<{ valid: boolean; errors: any }> - 验证结果
   * @description 调用 SchemaForm 的 validate 方法进行验证
   */
  const validateForm = async () => {
    const form = unref(formRef)
    if (form && typeof form.validate === 'function') {
      return await form.validate()
    }
    return { valid: true, errors: {} }
  }

  /**
   * 提交表单（先验证，通过后触发提交）
   * @returns Promise<{ valid: boolean; errors: any }> - 提交结果
   * @description 先验证，如果验证通过则触发提交，否则返回验证错误
   */
  const submitForm = async () => {
    const form = unref(formRef)
    if (!form) {
      return { valid: false, errors: {} }
    }
    // 先验证
    const result = await validateForm()

    // 🔥 关键：无论验证是否通过，都触发一次 form.submit()
    // 这样 PrimeVue Form 会执行完整的校验流程，并对未通过的字段渲染验证状态
    form.submit()

    return result
  }

  // ========== 表单项操作方法 ==========
  /**
   * 添加字段到 schema
   * @param field - 要添加的字段配置
   * @param index - 插入位置：数字索引 | 'first' | 'last' | null（默认末尾）
   * @returns boolean - 是否添加成功
   * @description 验证字段配置完整性，检查字段名是否已存在，然后插入到指定位置
   */
  const addField = (
    field: SchemaColumnsItem,
    index?: number | 'first' | 'last' | null
  ): boolean => {
    try {
      // 验证字段配置
      if (!field || !field.field || !field.component) {
        console.error('添加字段失败: 字段配置不完整', { field })
        return false
      }

      // 检查字段名是否已存在
      if (hasField(field.field)) {
        console.warn(`字段名 "${field.field}" 已存在`)
        return false
      }

      let insertIndex: number

      if (typeof index === 'number') {
        insertIndex = Math.max(0, Math.min(index, schema.columns.length))
      } else if (index === 'first') {
        insertIndex = 0
      } else if (index === 'last') {
        insertIndex = schema.columns.length
      } else {
        insertIndex = schema.columns.length
      }

      schema.columns.splice(insertIndex, 0, field)

      // 写入默认值并同步一次稳定引用（若外部未立即触发 setValue）
      const form = unref(formRef)
      if (form) {
        const current = form.values || {}
        const nextValues = { ...current }
        if (field.defaultValue !== undefined) {
          nextValues[field.field] = field.defaultValue
        } else if (!(field.field in nextValues)) {
          nextValues[field.field] = undefined
        }
        form.setValues?.(nextValues)
      }
      nextTick(() => {
        syncFormValues()
      })
      return true
    } catch (error) {
      console.error('添加字段失败:', error, { field, index })
      return false
    }
  }

  /**
   * 从 schema 中删除字段
   * @param fieldName - 要删除的字段名
   * @returns boolean - 是否删除成功
   * @description 从 schema.columns 中删除字段，同时清理表单值中该字段的值
   */
  const removeField = (fieldName: string): boolean => {
    try {
      const index = getFieldIndex(fieldName)
      if (index >= 0) {
        schema.columns.splice(index, 1)
        // 同步清理已删除字段的表单值，避免残留在 values 中
        const form = unref(formRef)
        if (form && typeof form.setValues === 'function') {
          const current = form.values || {}
          if (fieldName in current) {
            const nextValues = { ...current }
            delete nextValues[fieldName]
            form.setValues(nextValues)
          }
        }
        nextTick(() => {
          syncFormValues()
        })
        return true
      }
      return false
    } catch (error) {
      console.error('删除字段失败:', error)
      return false
    }
  }

  /**
   * 更新字段配置
   * @param fieldName - 要更新的字段名
   * @param updates - 要更新的配置项（部分字段配置）
   * @returns boolean - 是否更新成功
   * @description 使用 Object.assign 合并更新配置到现有字段配置中
   */
  const updateField = (fieldName: string, updates: Partial<SchemaColumnsItem>): boolean => {
    try {
      const field = getField(fieldName)
      if (field) {
        Object.assign(field, updates)
        nextTick(() => {
          syncFormValues()
        })
        return true
      }
      return false
    } catch (error) {
      console.error('更新字段失败:', error)
      return false
    }
  }

  /**
   * 获取字段配置
   * @param fieldName - 字段名
   * @returns SchemaColumnsItem | undefined - 字段配置，不存在返回 undefined
   * @description 从 schema.columns 中查找指定字段名的配置
   */
  const getField = (fieldName: string): SchemaColumnsItem | undefined => {
    return schema.columns.find(column => column.field === fieldName)
  }

  /**
   * 获取字段值
   * @param fieldName - 字段名
   * @returns any - 字段的当前值
   * @description 从当前表单值中获取指定字段的值
   */
  const getFieldValue = (fieldName: string): any => {
    const values: Record<string, any> = getFormValues()
    return values[fieldName]
  }

  /**
   * 设置字段值
   * @param fieldName - 字段名
   * @param value - 要设置的值
   * @description 调用 SchemaForm 的 setFieldValue 方法设置值，并触发 remember 存储更新
   */
  const setFieldValue = (fieldName: string, value: any) => {
    unref(formRef)?.setFieldValue(fieldName, value)
  }

  /**
   * 移动字段位置
   * @param fieldName - 要移动的字段名
   * @param newIndex - 新的索引位置
   * @returns boolean - 是否移动成功
   * @description 在 schema.columns 中移动字段到新位置
   */
  const moveField = (fieldName: string, newIndex: number): boolean => {
    try {
      const currentIndex = getFieldIndex(fieldName)
      if (currentIndex >= 0 && newIndex >= 0 && newIndex < schema.columns.length) {
        const field = schema.columns.splice(currentIndex, 1)[0]
        schema.columns.splice(newIndex, 0, field)
        nextTick(() => {
          syncFormValues()
        })
        return true
      }
      return false
    } catch (error) {
      console.error('移动字段失败:', error)
      return false
    }
  }

  // ========== 批量操作方法 ==========
  /**
   * 批量设置表单值
   * @param newValues - 要设置的值对象（字段名: 值）
   * @description 调用 SchemaForm 的 setValues 方法批量设置值
   */
  const setValues = (newValues: Record<string, any>) => {
    applySnapshot(newValues)
  }

  /**
   * 获取步骤可达状态数组
   * @returns boolean[] - 每个步骤是否可访问的数组
   * @description 返回 stepAccessibilityRef 的副本
   */
  const getStepAccessibility = () => {
    return [...stepAccessibilityRef.value]
  }

  // ========== 工具方法 ==========
  /**
   * 检查字段是否存在
   * @param fieldName - 字段名
   * @returns boolean - 字段是否存在
   * @description 检查 schema.columns 中是否存在指定字段名的字段
   */
  const hasField = (fieldName: string): boolean => {
    return schema.columns.some(column => column.field === fieldName)
  }

  /**
   * 获取字段索引
   * @param fieldName - 字段名
   * @returns number - 字段在 schema.columns 中的索引，不存在返回 -1
   * @description 查找字段在 schema.columns 数组中的位置
   */
  const getFieldIndex = (fieldName: string): number => {
    return schema.columns.findIndex(column => column.field === fieldName)
  }

  return {
    // 响应式数据
    schema: schema as Schema,
    formValues: formValuesRef,
    stepAccessibility: stepAccessibilityRef,

    // 表单整体操作
    getFormData,
    getFormValues,
    resetForm,
    clearForm,
    submitForm,
    validateForm,

    // 表单项操作
    addField,
    removeField,
    updateField,
    getField,
    getFieldValue,
    setFieldValue,
    moveField,

    // 批量操作
    setValues,

    // 工具方法
    hasField,
    getFieldIndex,
    getStepAccessibility,
  }
}
