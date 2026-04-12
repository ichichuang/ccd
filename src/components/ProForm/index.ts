import ProForm from './index.vue'

export { ProForm }

export { pluginManager as ProFormPlugins } from './engine/plugins/PluginManager'
export type { ProFormPlugin, ProFormPluginContext } from './engine/types'

export { useForm } from './engine/hooks/useForm'
export { useField } from './engine/hooks/useField'
export { useFieldArray } from './engine/hooks/useFieldArray'
export { useFormContext } from './engine/hooks/useFormContext'

export type {
  FieldArrayItem,
  FieldArrayReturn,
  FieldReaction,
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
  UseFormOptions,
  UseFormReturn,
  UseFieldReturn,
  ValidationResolver,
  ValidationResult,
} from './engine/types'

import type { ProFormPlugin } from './engine/types'
import { pluginManager } from './engine/plugins/PluginManager'

type ProFormWithPluginApi = typeof ProForm & {
  use: (plugin: ProFormPlugin) => unknown
}
;(ProForm as ProFormWithPluginApi).use = (plugin: ProFormPlugin) => pluginManager.use(plugin)
