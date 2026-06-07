<script setup lang="ts" generic="TValues extends FormValuesRecord = FormValuesRecord">
import { computed, provide, shallowRef, useSlots, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  FieldSchema,
  FieldState,
  FormSchema,
  FormSchemaNode,
  FormState,
  FormValuesRecord,
  ProFormExpose,
  ProFormProps,
} from './engine/types'
import { useForm } from './engine/hooks/useForm'
import ProFormNode from './renderers/ProFormNode.vue'
import { useAppElementSize } from '@ccd/vue-hooks'
import { getActiveBreakpoint, resolveSpan } from './engine/utils/breakpoint'
import type { BreakpointKey } from './engine/utils/breakpoint'
import type { ResponsiveSpan } from './engine/types'
import {
  PRO_FORM_DEFAULTS,
  PRO_FORM_LAYOUT_DEFAULTS,
  PRO_FORM_TIMING_DEFAULTS,
} from './engine/config'
import {
  PRO_FORM_GLOBAL_STATE_KEY,
  PRO_FORM_LAYOUT_KEY,
  PRO_FORM_SLOTS_KEY,
} from './engine/constants'
import Icons from '../Icons/Icons.vue'
import { castValue } from '@ccd/shared-utils'

const props = defineProps<ProFormProps<TValues>>()
const slots = useSlots()
const { t } = useI18n()

const rootFormEl = useTemplateRef<HTMLFormElement>('rootFormEl')
const { width } = useAppElementSize(rootFormEl, undefined, {
  mode: 'debounce',
  delay: PRO_FORM_TIMING_DEFAULTS.resizeDebounceMs,
})
const activeBreakpoint = computed(() => {
  const safeWidth = width.value > 0 ? width.value : PRO_FORM_LAYOUT_DEFAULTS.responsiveFallbackWidth
  return getActiveBreakpoint(safeWidth)
})

const globalDisabled = computed(() => props.disabled === true)
const globalReadonly = computed(() => props.readonly === true)

provide(PRO_FORM_GLOBAL_STATE_KEY, {
  disabled: globalDisabled,
  readonly: globalReadonly,
})

const effectiveGap = computed(() => {
  const fromProps = props.gap
  const fromSchema =
    props.schema.layout && props.schema.layout.type === 'grid' ? props.schema.layout.gap : undefined
  return fromProps ?? fromSchema ?? PRO_FORM_DEFAULTS.gap
})

const effectiveLayout = computed(() => props.layout ?? PRO_FORM_DEFAULTS.layout)

const isRootGrid = computed(() => props.schema.layout?.type === 'grid')

const effectiveLabelWidth = computed(() => {
  return typeof props.labelWidth === 'string' ? props.labelWidth : undefined
})

const effectiveLabelAlign = computed(() => props.labelAlign ?? PRO_FORM_DEFAULTS.labelAlign)

provide(PRO_FORM_LAYOUT_KEY, {
  layout: effectiveLayout,
  labelWidth: effectiveLabelWidth,
  gap: effectiveGap,
  activeBreakpoint,
  labelAlign: effectiveLabelAlign,
})

provide(PRO_FORM_SLOTS_KEY, slots)

type KeyableNode = { name?: unknown; label?: unknown; type?: unknown }
const getNodeKey = (node: FormSchemaNode<TValues>, index: number): string => {
  const n = node as KeyableNode
  if (typeof n.name === 'string' && n.name.length > 0) return n.name
  if (typeof n.label === 'string' && n.label.length > 0) {
    return `${String(n.type ?? 'node')}:${n.label}:${index}`
  }
  return `node:${index}`
}

/** 根级栅格：与 ProFormNode 内子字段一致，按 span / layout.span + 断点解析列宽 */
type RootLayoutNode = { span?: ResponsiveSpan; layout?: { span?: ResponsiveSpan } }

const getRootGridWrapperStyle = (node: FormSchemaNode<TValues>): Record<string, string> => {
  if (!isRootGrid.value) return {}
  const n = node as RootLayoutNode
  const spanConfig = n.span ?? n.layout?.span
  const finalSpan = resolveSpan(spanConfig, activeBreakpoint.value as BreakpointKey)
  const span = finalSpan > 0 ? finalSpan : PRO_FORM_DEFAULTS.gridSpan
  return { gridColumn: `span ${span} / span ${span}` }
}

const internalSchema = shallowRef<FormSchema<TValues>>(castValue<FormSchema<TValues>>(props.schema))
const isDev = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV)

if (isDev) {
  if (!Array.isArray(props.schema.fields) || props.schema.fields.length === 0) {
    console.warn('[ProForm] schema.fields is empty or missing — form will render nothing.')
  }
}

watch(
  () => props.schema,
  nextSchema => {
    if (internalSchema.value !== nextSchema) {
      internalSchema.value = castValue<FormSchema<TValues>>(nextSchema)
    }
  }
)

const hasVisibleFields = computed(() => internalSchema.value.fields.length > 0)

const emit = defineEmits<{
  (e: 'submit', values: TValues): void
}>()

defineSlots<
  {
    footer?: (props: { formState: FormState<TValues>; submit: () => Promise<void> }) => unknown
  } & {
    [K in `field-${string}`]?: (props: {
      field: FieldSchema<unknown>
      state: FieldState<unknown>
      onUpdate: (v: unknown) => void
    }) => unknown
  }
>()

const { form, handleSubmit, getValues, getFormState, updateSchema } = useForm<TValues>({
  schema: internalSchema.value,
  initialValues: props.initialValues,
  validateOn: props.validateOn,
  resolver: props.resolver,
  persistKey: props.persistKey,
  autoSave: props.autoSave,
})

watch(
  () => props.validateOn,
  validateOn => {
    form.setValidateOn(validateOn)
  },
  { immediate: true }
)

watch(internalSchema, schema => {
  updateSchema(schema)
})

const emitSubmit = (values: TValues): void => {
  emit('submit', values)
}

/** 单一提交路径：form @submit 与 footer slot 共享同一绑定 */
const boundSubmit = handleSubmit(emitSubmit)

const exposed = {
  form,
  submit: () => boundSubmit(),
  validate: form.validate,
  getValues,
  getFormState,
} satisfies ProFormExpose<TValues>

defineExpose(exposed)
</script>

<template>
  <form
    ref="rootFormEl"
    @submit="boundSubmit"
  >
    <div
      v-if="!hasVisibleFields"
      class="col-center p-xl text-muted-foreground rounded-md"
    >
      <Icons
        name="i-lucide-inbox"
        size="2xl"
        class="mb-md text-muted-foreground opacity-50"
      />
      <span class="text-sm">{{ t('emptyState.noFormConfig') }}</span>
    </div>

    <div
      v-else
      class="pv-input-fluid"
      :class="isRootGrid ? 'layout-full grid' : 'col-stretch'"
      :style="
        isRootGrid
          ? {
              gap: effectiveGap,
              gridTemplateColumns: `repeat(${PRO_FORM_LAYOUT_DEFAULTS.gridSpan}, minmax(0, 1fr))`,
            }
          : { gap: effectiveGap }
      "
    >
      <div
        v-for="(node, index) in internalSchema.fields"
        :key="getNodeKey(node, index)"
        :style="getRootGridWrapperStyle(node)"
      >
        <ProFormNode :node="node" />
      </div>
    </div>

    <slot
      name="footer"
      :form-state="getFormState()"
      :submit="() => boundSubmit()"
    />
  </form>
</template>
