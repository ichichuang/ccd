<script setup lang="ts">
import type { FormSchema, ProFormProps } from './engine/types'
import { useForm } from './engine/hooks/useForm'
import { registerBuiltinFields } from './renderers/registerBuiltinFields'
import ProFormNode from './renderers/ProFormNode.vue'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
import { getActiveBreakpoint } from './engine/utils/breakpoint'

// 预注册基础字段组件
registerBuiltinFields()

const props = defineProps<ProFormProps>()
const slots = useSlots()

const rootFormEl = ref<HTMLFormElement | null>(null)
const { width } = useAppElementSize(rootFormEl, undefined, { mode: 'debounce', delay: 100 })
const activeBreakpoint = computed(() => {
  const safeWidth = width.value > 0 ? width.value : 1024
  return getActiveBreakpoint(safeWidth)
})

const globalDisabled = computed(() => props.disabled === true)
const globalReadonly = computed(() => props.readonly === true)

provide('PRO_FORM_GLOBAL_STATE', {
  disabled: globalDisabled,
  readonly: globalReadonly,
})

const effectiveGap = computed(() => {
  const fromProps = props.gap
  const fromSchema =
    props.schema.layout && props.schema.layout.type === 'grid' ? props.schema.layout.gap : undefined
  return fromProps ?? fromSchema ?? 'var(--spacing-md)'
})

const effectiveLayout = computed(() => props.layout ?? 'vertical')

const effectiveLabelWidth = computed(() => {
  return typeof props.labelWidth === 'string' ? props.labelWidth : undefined
})

const effectiveLabelAlign = computed(() => props.labelAlign ?? 'left')

provide('PRO_FORM_LAYOUT', {
  layout: effectiveLayout,
  labelWidth: effectiveLabelWidth,
  gap: effectiveGap,
  activeBreakpoint,
  labelAlign: effectiveLabelAlign,
})

provide('PRO_FORM_SLOTS', slots)

const internalSchema = reactive<FormSchema>({
  ...props.schema,
  fields: props.schema.fields.map(field => ({
    ...field,
  })),
})

const hasVisibleFields = computed(() => internalSchema.fields.length > 0)

const emit = defineEmits<{
  (e: 'submit', values: Record<string, unknown>): void
}>()

const { form, handleSubmit, getValues, getFormState, teardown } = useForm<Record<string, unknown>>({
  schema: internalSchema,
  initialValues: props.initialValues,
  validateOn: props.validateOn,
  resolver: props.resolver,
  persistKey: props.persistKey,
  autoSave: props.autoSave,
})

onBeforeUnmount(() => {
  teardown()
})

const emitSubmit = (values: Record<string, unknown>): void => {
  emit('submit', values)
}

defineExpose({
  form,
  submit: form.submit,
  validate: form.validate,
  getValues,
  getFormState,
})
</script>

<template>
  <form
    ref="rootFormEl"
    @submit="handleSubmit(emitSubmit)"
  >
    <div
      v-if="!hasVisibleFields"
      class="layout-stack items-center justify-center p-padding-xl text-muted-foreground surface-elevated rounded-scale-md"
    >
      <Icons
        name="i-lucide-inbox"
        size="2xl"
        class="mb-margin-md text-muted-foreground opacity-50"
      />
      <span class="fs-sm">暂无表单配置</span>
    </div>

    <div
      v-else
      class="layout-full"
      :style="{ gap: effectiveGap }"
    >
      <ProFormNode
        v-for="node in internalSchema.fields"
        :key="(node as any).name ?? (node as any).label ?? JSON.stringify(node)"
        :node="node"
      />
    </div>

    <slot
      name="footer"
      :form-state="getFormState()"
      :submit="form.submit"
    />
  </form>
</template>
