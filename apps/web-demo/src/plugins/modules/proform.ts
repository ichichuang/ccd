import { registerBuiltinFields } from '@/components/ProForm/renderers/registerBuiltinFields'

/**
 * 预注册 ProForm 内置字段组件到全局 fieldRegistry 单例。
 * 在插件阶段统一初始化，避免依赖组件导入时序。
 */
export const setupProForm = () => {
  registerBuiltinFields()
}
