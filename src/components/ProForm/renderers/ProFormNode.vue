<script setup lang="ts" generic="TValues extends Record<string, unknown> = Record<string, unknown>">
import type { ComputedRef } from 'vue'
import type {
  FieldSchema,
  FormSchemaNode,
  GroupSchema,
  NodeLayoutSchema,
  ResponsiveSpan,
} from '../engine/types'
import type { BreakpointKey } from '../engine/utils/breakpoint'
import type { ProFormNodeProps } from '../engine/types/props'
import PrimeVueRenderer from './PrimeVueRenderer.vue'
import { useFormContext } from '../engine/hooks/useFormContext'
import { resolveSpan } from '../engine/utils/breakpoint'
import { PRO_FORM_DEFAULTS, PRO_FORM_LAYOUT_DEFAULTS } from '../engine/config'
import { PRO_FORM_LAYOUT_KEY } from '../engine/constants'

defineOptions({ name: 'ProFormNode' })

const props = defineProps<ProFormNodeProps>()

const injectedLayout = inject<{
  gap: ComputedRef<string>
  activeBreakpoint?: ComputedRef<BreakpointKey>
} | null>(PRO_FORM_LAYOUT_KEY, null)

const isGroup = (n: FormSchemaNode): n is Extract<FormSchemaNode, { children: FormSchemaNode[] }> =>
  (n as { children?: FormSchemaNode[] }).children !== undefined

const isField = (n: FormSchemaNode): n is FieldSchema<unknown> =>
  (n as FieldSchema<unknown>).component !== undefined

const controller = useFormContext<TValues>()

const fieldVisibleMap = reactive<Record<string, boolean>>({})
const visibilityCleanups: Array<() => void> = []

if (isGroup(props.node)) {
  for (const child of props.node.children) {
    if (!isField(child)) continue
    const name = child.name
    const state = controller.store.getFieldState(name)
    fieldVisibleMap[name] = state?.visible !== false

    const sub = (): void => {
      const latest = controller.store.getFieldState(name)
      fieldVisibleMap[name] = latest?.visible !== false
    }
    controller.store.subscribe(name, sub)
    visibilityCleanups.push(() => {
      controller.store.unsubscribe(name, sub)
    })
  }
}

onUnmounted(() => {
  visibilityCleanups.forEach(fn => fn())
})

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
  const span = finalSpan > 0 ? finalSpan : PRO_FORM_DEFAULTS.gridSpan
  return { gridColumn: `span ${span} / span ${span}` }
}

const groupGridClass = 'grid w-full'

const getGroupGridStyle = (gap: string): Record<string, string> => ({
  gap,
  gridTemplateColumns: `repeat(${PRO_FORM_LAYOUT_DEFAULTS.gridSpan}, minmax(0, 1fr))`,
})

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

const isFieldVisible = (node: FormSchemaNode): boolean => {
  if (!isField(node)) return true
  return fieldVisibleMap[node.name] !== false
}

const getGroupLabel = (node: FormSchemaNode, index: number): string => {
  const group = node as Partial<GroupSchema>
  if (typeof group.label === 'string' && group.label.length > 0) {
    return group.label
  }
  return String(index + 1)
}

const getStepLabel = (node: FormSchemaNode, index: number): string => {
  const group = node as Partial<GroupSchema>
  if (typeof group.label === 'string' && group.label.length > 0) {
    return group.label
  }
  return String(index + 1)
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
      class="w-full mb-md rounded-md"
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
            :style="getGroupGridStyle(injectedLayout?.gap.value ?? PRO_FORM_DEFAULTS.gap)"
          >
            <div
              v-for="child in getChildren(tab)"
              v-show="isFieldVisible(child)"
              :key="getNodeKey(child)"
              :style="
                isField(child)
                  ? getColSpanStyle(child)
                  : {
                      gridColumn: `span ${PRO_FORM_DEFAULTS.gridSpan} / span ${PRO_FORM_DEFAULTS.gridSpan}`,
                    }
              "
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
      class="w-full mb-md rounded-md"
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
          class="p-md"
        >
          <div
            :class="groupGridClass"
            :style="getGroupGridStyle(injectedLayout?.gap.value ?? PRO_FORM_DEFAULTS.gap)"
          >
            <div
              v-for="child in getChildren(step)"
              v-show="isFieldVisible(child)"
              :key="getNodeKey(child)"
              :style="
                isField(child)
                  ? getColSpanStyle(child)
                  : {
                      gridColumn: `span ${PRO_FORM_DEFAULTS.gridSpan} / span ${PRO_FORM_DEFAULTS.gridSpan}`,
                    }
              "
            >
              <ProFormNode :node="child" />
            </div>
          </div>
          <div class="row-between w-full mt-md pt-md">
            <Button
              v-if="index > 0"
              severity="secondary"
              @click="activateCallback(String(index - 1))"
            >
              <template #default>
                <span class="row-center gap-xs">
                  <Icons
                    name="i-lucide-arrow-left"
                    size="sm"
                  />
                  <span>上一页</span>
                </span>
              </template>
            </Button>
            <div v-else />
            <Button
              v-if="index < getChildren(props.node).length - 1"
              @click="activateCallback(String(index + 1))"
            >
              <template #default>
                <span class="row-center gap-xs">
                  <span>下一页</span>
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

    <Card v-else-if="props.node.type === 'card'">
      <template
        v-if="props.node.label"
        #title
      >
        <span class="text-sm font-semibold">
          {{ props.node.label }}
        </span>
      </template>
      <template #content>
        <div
          :class="groupGridClass"
          :style="getGroupGridStyle(injectedLayout?.gap.value ?? PRO_FORM_DEFAULTS.gap)"
        >
          <div
            v-for="child in getChildren(props.node)"
            v-show="isFieldVisible(child)"
            :key="getNodeKey(child)"
            :style="
              isField(child)
                ? getColSpanStyle(child)
                : {
                    gridColumn: `span ${PRO_FORM_DEFAULTS.gridSpan} / span ${PRO_FORM_DEFAULTS.gridSpan}`,
                  }
            "
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
      class="w-full mb-md rounded-md"
    >
      <div
        :class="groupGridClass"
        :style="getGroupGridStyle(injectedLayout?.gap.value ?? PRO_FORM_DEFAULTS.gap)"
      >
        <div
          v-for="child in getChildren(props.node)"
          v-show="isFieldVisible(child)"
          :key="getNodeKey(child)"
          :style="
            isField(child)
              ? getColSpanStyle(child)
              : {
                  gridColumn: `span ${PRO_FORM_DEFAULTS.gridSpan} / span ${PRO_FORM_DEFAULTS.gridSpan}`,
                }
          "
        >
          <ProFormNode :node="child" />
        </div>
      </div>
    </Panel>

    <div
      v-else
      class="w-full mb-md"
    >
      <div
        v-if="getGroupLabelText(props.node)"
        class="mb-sm text-md font-semibold text-secondary-foreground"
      >
        {{ getGroupLabelText(props.node) }}
      </div>
      <div
        :class="groupGridClass"
        :style="getGroupGridStyle(injectedLayout?.gap.value ?? PRO_FORM_DEFAULTS.gap)"
      >
        <div
          v-for="child in getChildren(props.node)"
          v-show="isFieldVisible(child)"
          :key="getNodeKey(child)"
          :style="
            isField(child)
              ? getColSpanStyle(child)
              : {
                  gridColumn: `span ${PRO_FORM_DEFAULTS.gridSpan} / span ${PRO_FORM_DEFAULTS.gridSpan}`,
                }
          "
        >
          <ProFormNode :node="child" />
        </div>
      </div>
    </div>
  </template>
</template>
