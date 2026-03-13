<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type {
  FieldSchema,
  FormSchemaNode,
  GroupSchema,
  NodeLayoutSchema,
  ResponsiveSpan,
} from '../engine/types'
import type { FormController } from '../engine/core/FormController'
import type { BreakpointKey } from '../engine/utils/breakpoint'
import PrimeVueRenderer from './PrimeVueRenderer.vue'
import { useFormContext } from '../engine/hooks/useFormContext'
import { resolveSpan } from '../engine/utils/breakpoint'

const props = defineProps<{
  node: FormSchemaNode
}>()

const injectedLayout = inject<{
  gap: ComputedRef<string>
  activeBreakpoint?: ComputedRef<BreakpointKey>
} | null>('PRO_FORM_LAYOUT', null)

const isGroup = (n: FormSchemaNode): n is Extract<FormSchemaNode, { children: FormSchemaNode[] }> =>
  (n as { children?: FormSchemaNode[] }).children !== undefined

const isField = (n: FormSchemaNode): n is FieldSchema<unknown> =>
  (n as FieldSchema<unknown>).component !== undefined

const controller = useFormContext() as unknown as FormController<Record<string, unknown>>

const handleFieldFocusOut = (field: FieldSchema<unknown>): void => {
  const name = field.name
  const existing = controller.store.getFieldState(name)
  if (existing) {
    controller.store.setFieldState(name, {
      ...existing,
      touched: true,
    })
  }

  if (controller.validateOn === 'blur') {
    void controller.validateField(name)
  }
}

interface LayoutFieldSchema extends FieldSchema<unknown> {
  span?: ResponsiveSpan
  layout?: { span?: ResponsiveSpan } & Partial<NodeLayoutSchema>
}

const getColSpanStyle = (field: FormSchemaNode): { gridColumn: string } => {
  const f = field as LayoutFieldSchema
  const spanConfig = f.span ?? f.layout?.span
  const currentBp: BreakpointKey = injectedLayout?.activeBreakpoint?.value ?? 'md'
  const finalSpan = resolveSpan(spanConfig, currentBp)
  const span = finalSpan > 0 ? finalSpan : 12
  return { gridColumn: `span ${span} / span ${span}` }
}

const groupGridClass = 'grid grid-cols-12 w-full'

const activeStep = ref('0')

type KeyableNode = {
  name?: unknown
  label?: unknown
  type?: unknown
}

const getNodeKey = (node: FormSchemaNode, index?: number): string => {
  const n = node as KeyableNode
  if (typeof n.name === 'string' && n.name.length > 0) return n.name
  if (typeof n.label === 'string' && n.label.length > 0) {
    const base = `${String(n.type ?? 'node')}:${n.label}`
    return typeof index === 'number' ? `${base}:${index}` : base
  }
  return typeof index === 'number' ? `node:${index}` : `node:${String(n.type ?? 'unknown')}`
}

const getChildren = (node: FormSchemaNode): FormSchemaNode[] => {
  if (!isGroup(node)) return []
  return node.children
}

const getGroupLabel = (node: FormSchemaNode, index: number): string => {
  const group = node as Partial<GroupSchema>
  if (typeof group.label === 'string' && group.label.length > 0) return group.label
  return `Tab ${index + 1}`
}

const getStepLabel = (node: FormSchemaNode, index: number): string => {
  const group = node as Partial<GroupSchema>
  if (typeof group.label === 'string' && group.label.length > 0) return group.label
  return `Step ${index + 1}`
}

const getGroupLabelText = (node: FormSchemaNode): string => {
  const group = node as Partial<GroupSchema>
  return typeof group.label === 'string' ? group.label : ''
}
</script>

<template>
  <div
    v-if="isField(props.node)"
    @focusout="handleFieldFocusOut(props.node)"
  >
    <PrimeVueRenderer :field="props.node" />
  </div>

  <template v-else-if="isGroup(props.node)">
    <Tabs
      v-if="props.node.type === 'tabs'"
      value="0"
      class="w-full mb-margin-md"
    >
      <TabList>
        <Tab
          v-for="(tab, index) in props.node.children"
          :key="getNodeKey(tab, index)"
          :value="String(index)"
        >
          {{ getGroupLabel(tab, index) }}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel
          v-for="(tab, index) in props.node.children"
          :key="getNodeKey(tab, index)"
          :value="String(index)"
        >
          <div
            :class="groupGridClass"
            :style="{ gap: injectedLayout?.gap.value ?? 'var(--spacing-md)' }"
          >
            <div
              v-for="child in getChildren(tab)"
              :key="getNodeKey(child)"
              :style="isField(child) ? getColSpanStyle(child) : { gridColumn: 'span 12 / span 12' }"
            >
              <ProFormNode :node="child" />
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <Stepper
      v-else-if="props.node.type === 'step'"
      v-model:value="activeStep"
      class="w-full mb-margin-md"
    >
      <StepList>
        <Step
          v-for="(step, index) in getChildren(props.node)"
          :key="getNodeKey(step, index)"
          :value="String(index)"
        >
          {{ getStepLabel(step, index) }}
        </Step>
      </StepList>
      <StepPanels>
        <StepPanel
          v-for="(step, index) in getChildren(props.node)"
          :key="getNodeKey(step, index)"
          v-slot="{ activateCallback }"
          :value="String(index)"
        >
          <div
            :class="groupGridClass"
            :style="{ gap: injectedLayout?.gap.value ?? 'var(--spacing-md)' }"
          >
            <div
              v-for="child in getChildren(step)"
              :key="getNodeKey(child)"
              :style="isField(child) ? getColSpanStyle(child) : { gridColumn: 'span 12 / span 12' }"
            >
              <ProFormNode :node="child" />
            </div>
          </div>
          <div class="row-between w-full mt-margin-md pt-padding-md">
            <Button
              v-if="index > 0"
              severity="secondary"
              @click="activateCallback(String(index - 1))"
            >
              <template #default>
                <span class="inline-flex items-center gap-scale-xs">
                  <Icons
                    name="i-lucide-arrow-left"
                    size="sm"
                  />
                  <span>上一步</span>
                </span>
              </template>
            </Button>
            <div v-else />
            <Button
              v-if="index < getChildren(props.node).length - 1"
              @click="activateCallback(String(index + 1))"
            >
              <template #default>
                <span class="inline-flex items-center gap-scale-xs">
                  <span>下一步</span>
                  <Icons
                    name="i-lucide-arrow-right"
                    size="sm"
                  />
                </span>
              </template>
            </Button>
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>

    <Card
      v-else-if="props.node.type === 'card'"
      class="w-full mb-margin-md surface-elevated rounded-scale-md shadow-soft"
    >
      <template
        v-if="props.node.label"
        #title
      >
        <span class="fs-md font-semibold text-secondary-foreground">
          {{ props.node.label }}
        </span>
      </template>
      <template #content>
        <div
          :class="groupGridClass"
          :style="{ gap: injectedLayout?.gap.value ?? 'var(--spacing-md)' }"
        >
          <div
            v-for="child in getChildren(props.node)"
            :key="getNodeKey(child)"
            :style="isField(child) ? getColSpanStyle(child) : { gridColumn: 'span 12 / span 12' }"
          >
            <ProFormNode :node="child" />
          </div>
        </div>
      </template>
    </Card>

    <Panel
      v-else-if="props.node.type === 'collapse'"
      :header="props.node.label"
      toggleable
      class="w-full mb-margin-md"
    >
      <div
        :class="groupGridClass"
        :style="{ gap: injectedLayout?.gap.value ?? 'var(--spacing-md)' }"
      >
        <div
          v-for="child in getChildren(props.node)"
          :key="getNodeKey(child)"
          :style="isField(child) ? getColSpanStyle(child) : { gridColumn: 'span 12 / span 12' }"
        >
          <ProFormNode :node="child" />
        </div>
      </div>
    </Panel>

    <div
      v-else
      class="w-full mb-margin-md"
    >
      <div
        v-if="getGroupLabelText(props.node)"
        class="mb-margin-sm fs-md font-semibold text-secondary-foreground"
      >
        {{ getGroupLabelText(props.node) }}
      </div>
      <div
        :class="groupGridClass"
        :style="{ gap: injectedLayout?.gap.value ?? 'var(--spacing-md)' }"
      >
        <div
          v-for="child in getChildren(props.node)"
          :key="getNodeKey(child)"
          :style="isField(child) ? getColSpanStyle(child) : { gridColumn: 'span 12 / span 12' }"
        >
          <ProFormNode :node="child" />
        </div>
      </div>
    </div>
  </template>
</template>
