<script setup lang="ts" generic="TValues extends Record<string, unknown> = Record<string, unknown>">
import type {
  FieldSchema,
  FieldState,
  FormSchema,
  FormSchemaNode,
  FormState,
  ProFormExpose,
  ProFormProps,
} from './engine/types'
import { useForm } from './engine/hooks/useForm'
import { registerBuiltinFields } from './renderers/registerBuiltinFields'
import ProFormNode from './renderers/ProFormNode.vue'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
import { getActiveBreakpoint } from './engine/utils/breakpoint'
import { deepClone } from '@/utils/lodashes'
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

// 预注册基础字段组件
registerBuiltinFields()

const props = defineProps<ProFormProps<TValues>>()
const slots = useSlots()

const rootFormEl = ref<HTMLFormElement | null>(null)
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
const getNodeKey = (node: FormSchemaNode, index: number): string => {
  const n: KeyableNode = node as KeyableNode
  if (typeof n.name === 'string' && n.name.length > 0) return n.name
  if (typeof n.label === 'string' && n.label.length > 0) {
    return `${String(n.type ?? 'node')}:${n.label}:${index}`
  }
  return `node:${index}`
}

const internalSchema = reactive<FormSchema>(deepClone(props.schema))

const hasVisibleFields = computed(() => internalSchema.fields.length > 0)

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

const { form, handleSubmit, getValues, getFormState } = useForm<TValues>({
  schema: internalSchema,
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

const emitSubmit = (values: TValues): void => {
  emit('submit', values)
}

const exposed = {
  form,
  submit: form.submit,
  validate: form.validate,
  getValues,
  getFormState,
} satisfies ProFormExpose<TValues>

defineExpose(exposed)
</script>

<template>
  <form
    ref="rootFormEl"
    @submit="handleSubmit(emitSubmit)"
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
      <span class="text-sm">{{ $t('emptyState.noFormConfig') }}</span>
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
        :style="
          isRootGrid
            ? {
                gridColumn: `span ${PRO_FORM_DEFAULTS.gridSpan} / span ${PRO_FORM_DEFAULTS.gridSpan}`,
              }
            : {}
        "
      >
        <ProFormNode :node="node" />
      </div>
    </div>

    <slot
      name="footer"
      :form-state="getFormState()"
      :submit="form.submit"
    />
  </form>
</template>
