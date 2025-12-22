// @/components/schema-form/components/index.ts
/**
 * SchemaForm 组件统一导出
 */

export { default as DefaultRenderer } from './DefaultRenderer.vue'
// FormActions 已删除，现在由用户自定义按钮
export { default as SchemaFormItem } from './FormItems'
export { default as SectionsRenderer } from './SectionsRenderer.vue'
export { default as StepNavigation } from './StepNavigation.vue'
export { default as StepsHeader } from './StepsHeader.vue'
export { default as StepsRenderer } from './StepsRenderer.vue'

// 组件映射表
export {
  componentMap,
  getComponentFromMap,
  hasComponentInMap,
  type ComponentMap,
} from './componentMap'
