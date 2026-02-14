// @/hooks/components/useSchemaForm.ts
/**
 * useSchemaForm.ts (重构后 - P2 架构)
 * - Hook 成为 schema 和 formValues 的所有者
 * - 不再依赖 formRef，彻底解耦
 * - 所有方法直接操作内部状态
 */

import { getEmptyValues, getResetValues } from '@/components/schema-form/utils/emptyValues'
import type { FormValues, Schema, SchemaColumnsItem } from '@/components/schema-form/utils/types'
import { deepClone } from '@/utils/lodashes'
import { ref, type Ref } from 'vue'

/**
 * useSchemaForm Hook 返回值接口
 */
export interface UseSchemaFormReturn {
  // ========== 响应式数据 ==========
  /** 响应式 schema 配置（只读，防止外部直接修改） */
  schema: Readonly<Ref<Schema>>
  /** 实时表单值（可写，绑定到 v-model） */
  formValues: Ref<FormValues>

  // ========== 表单整体操作 ==========
  /** 获取表单值（不校验，直接返回当前值） */
  getFormValues: () => FormValues
  /** 重置表单（恢复 defaultValue） */
  resetForm: () => void
  /** 清空表单（所有字段设置为合适的空值） */
  clearForm: () => void

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
  getFieldValue: (fieldName: string) => unknown
  /** 设置字段值 */
  setFieldValue: (fieldName: string, value: unknown) => void
  /** 移动字段位置 */
  moveField: (fieldName: string, newIndex: number) => boolean

  // ========== 批量操作 ==========
  /** 批量设置表单值 */
  setValues: (newValues: FormValues) => void

  // ========== 工具方法 ==========
  /** 检查字段是否存在 */
  hasField: (fieldName: string) => boolean
  /** 获取字段在 schema.columns 中的索引 */
  getFieldIndex: (fieldName: string) => number
}

/**
 * useSchemaForm Hook (重构后)
 * @param initialSchema - 初始 schema 配置
 * @returns UseSchemaFormReturn - 返回所有表单操作方法
 * @description Hook 成为状态的所有者，直接管理 schema 和 formValues
 */
export const useSchemaForm = ({
  initialSchema,
}: {
  initialSchema: Schema
}): UseSchemaFormReturn => {
  // ========== 1. Hook 内部创建并管理状态 ==========
  /** 响应式 schema 数据 */
  const schema = ref<Schema>(deepClone(initialSchema) as Schema)

  /** 表单值的初始值从 schema 的 defaultValue 构建 */
  const initialValues = getResetValues(schema.value.columns as SchemaColumnsItem[])
  const formValues = ref<FormValues>(initialValues)

  // ========== 2. 工具方法 ==========
  const hasField = (fieldName: string): boolean => {
    return (schema.value.columns as SchemaColumnsItem[]).some(column => column.field === fieldName)
  }

  const getFieldIndex = (fieldName: string): number => {
    return (schema.value.columns as SchemaColumnsItem[]).findIndex(
      column => column.field === fieldName
    )
  }

  const getField = (fieldName: string): SchemaColumnsItem | undefined => {
    return (schema.value.columns as SchemaColumnsItem[]).find(column => column.field === fieldName)
  }

  // ========== 3. 表单整体操作方法 ==========
  /**
   * 获取表单值（不校验，直接返回当前值）
   */
  const getFormValues = (): FormValues => {
    return { ...formValues.value }
  }

  /**
   * 重置表单（恢复 defaultValue）
   */
  const resetForm = (): void => {
    formValues.value = getResetValues(schema.value.columns as SchemaColumnsItem[])
  }

  /**
   * 清空表单（所有字段设置为合适的空值）
   */
  const clearForm = (): void => {
    formValues.value = getEmptyValues(schema.value.columns as SchemaColumnsItem[])
  }

  // ========== 4. 表单项操作方法 ==========
  /**
   * 添加字段到 schema
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
        insertIndex = Math.max(0, Math.min(index, schema.value.columns.length))
      } else if (index === 'first') {
        insertIndex = 0
      } else if (index === 'last') {
        insertIndex = schema.value.columns.length
      } else {
        insertIndex = schema.value.columns.length
      }

      // 直接操作 schema.value.columns
      ;(schema.value.columns as SchemaColumnsItem[]).splice(
        insertIndex,
        0,
        field as SchemaColumnsItem
      )

      // 同时更新 formValues，为新字段设置默认值或空值
      const empty = getEmptyValues([field as SchemaColumnsItem])
      formValues.value[field.field] = field.defaultValue ?? empty[field.field]

      return true
    } catch (error) {
      console.error('添加字段失败:', error, { field, index })
      return false
    }
  }

  /**
   * 从 schema 中删除字段
   */
  const removeField = (fieldName: string): boolean => {
    try {
      const index = getFieldIndex(fieldName)
      if (index >= 0) {
        // 直接从 schema.value.columns 中移除
        ;(schema.value.columns as SchemaColumnsItem[]).splice(index, 1)
        // 同时从 formValues.value 中删除该字段
        delete formValues.value[fieldName]
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
   */
  const updateField = (fieldName: string, updates: Partial<SchemaColumnsItem>): boolean => {
    try {
      const field = getField(fieldName)
      if (field) {
        Object.assign(field, updates)
        return true
      }
      return false
    } catch (error) {
      console.error('更新字段失败:', error)
      return false
    }
  }

  /**
   * 移动字段位置
   */
  const moveField = (fieldName: string, newIndex: number): boolean => {
    try {
      const currentIndex = getFieldIndex(fieldName)
      if (currentIndex < 0) {
        return false
      }

      const columns = schema.value.columns as SchemaColumnsItem[]
      const field = columns[currentIndex]

      // 规范化 newIndex，避免越界或负数造成意外行为
      const maxIndex = columns.length - 1
      const targetIndex = Math.max(0, Math.min(newIndex, maxIndex))

      columns.splice(currentIndex, 1)
      columns.splice(targetIndex, 0, field)

      return true
    } catch (error) {
      console.error('移动字段失败:', error)
      return false
    }
  }

  /**
   * 获取字段值
   */
  const getFieldValue = (fieldName: string): unknown => {
    return formValues.value[fieldName]
  }

  /**
   * 设置字段值
   */
  const setFieldValue = (fieldName: string, value: unknown): void => {
    formValues.value[fieldName] = value
  }

  // ========== 5. 批量操作 ==========
  /**
   * 批量设置表单值
   */
  const setValues = (newValues: FormValues): void => {
    // 只合并 schema 中存在的字段，避免引入无效 key
    const nextValues: FormValues = { ...formValues.value }
    const columns = schema.value.columns as SchemaColumnsItem[]
    const fieldSet = new Set(columns.map(column => column.field))

    Object.keys(newValues).forEach(key => {
      if (fieldSet.has(key)) {
        nextValues[key] = newValues[key]
      }
    })

    formValues.value = nextValues
  }

  // ========== 6. 返回状态和方法 ==========
  return {
    // 响应式数据（schema 使用 readonly 防止外部直接修改，但类型需要兼容）
    schema: schema as Readonly<Ref<Schema>>,
    formValues, // formValues 需要是可写的，因为它绑定了 v-model

    // 表单整体操作
    getFormValues,
    resetForm,
    clearForm,

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
  }
}
