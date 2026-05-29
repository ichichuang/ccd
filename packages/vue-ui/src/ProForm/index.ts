import ProForm from './index.vue'

export { ProForm }

export { pluginManager as ProFormPlugins } from './engine/plugins/PluginManager'
export type { ProFormPlugin, ProFormPluginContext } from './engine/types'

export { useForm } from './engine/hooks/useForm'
export { useField } from './engine/hooks/useField'
export { useFieldArray } from './engine/hooks/useFieldArray'
export { useFormContext } from './engine/hooks/useFormContext'
export { createSchemaValidationResolver } from './engine/validation/schemaResolver'
export {
  DraftStorage,
  configureProFormDraftStorage,
  resetProFormDraftStorage,
} from './engine/persistence/DraftStorage'
export { registerBuiltinFields } from './renderers/registerBuiltinFields'
export { PRO_FORM_DATE_FORMATTER_KEY } from './engine/constants'

export type {
  FieldArrayItem,
  FieldArrayReturn,
  FieldReaction,
  FieldRegistryItem,
  FieldSchema,
  FieldState,
  FormContext,
  FormSchema,
  FormSchemaNode,
  FormState,
  ProFormExpose,
  ProFormProps,
  ReactionAction,
  ReactionContext,
  SelectOption,
  UseFormOptions,
  UseFormReturn,
  UseFieldReturn,
  ValidationResolver,
  ValidationResult,
} from './engine/types'
export type {
  ProFormDateFormatter,
  ProFormDraftStorageAdapter,
} from './engine/persistence/DraftStorage'

import type { ProFormPlugin } from './engine/types'
import { pluginManager } from './engine/plugins/PluginManager'

type ProFormWithPluginApi = typeof ProForm & {
  use: (plugin: ProFormPlugin) => unknown
}
;(ProForm as ProFormWithPluginApi).use = (plugin: ProFormPlugin) => pluginManager.use(plugin)
