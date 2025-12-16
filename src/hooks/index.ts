// Hooks 统一管理入口
import { autoImportModulesSync } from '@/utils'

// 自动导入所有 Hook 模块
const hookModules = import.meta.glob('./modules/**/*.ts', { eager: true })
const importedHooks = autoImportModulesSync(hookModules)

const hookLayoutModules = import.meta.glob('./layout/**/*.ts', { eager: true })
const importedHookLayouts = autoImportModulesSync(hookLayoutModules)

const hookComponentsModules = import.meta.glob('./components/**/*.ts', { eager: true })
const importedHookComponents = autoImportModulesSync(hookComponentsModules)

// 导出所有 Hook 模块
export * from '@/hooks/components/useDialog'
export * from '@/hooks/components/useSchemaForm'
export * from '@/hooks/components/useTablePersistence'
export * from '@/hooks/components/useThemeSwitch'
export * from '@/hooks/components/useVxeTable'
export * from '@/hooks/layout/useLoading'
export * from '@/hooks/layout/useNprogress'
export * from '@/hooks/layout/usePageTitle'
export * from '@/hooks/modules/useChartTheme'
export * from '@/hooks/modules/useDateUtils'
export * from '@/hooks/modules/useElementSize'
export * from '@/hooks/modules/useLocale'

// 导出所有 Hooks
export default {
  ...importedHooks,
  ...importedHookLayouts,
  ...importedHookComponents,
}

// 类型定义
export type HookModules = typeof importedHooks
export type HookLayoutModules = typeof importedHookLayouts
export type HookComponentsModules = typeof importedHookComponents
