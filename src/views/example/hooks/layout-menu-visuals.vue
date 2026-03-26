<script setup lang="ts">
import type { VNode } from 'vue'
import type { MenuVisualContext } from '@/hooks/layout/useMenuVisuals'
import { type TieredMenuItemSlotProps } from '@/hooks/layout/useMenuRenderer'
import type { PrimeMenuModelItem } from '@/router/utils/helper'

defineOptions({ name: 'LayoutMenuVisuals' })

const distance = ref<number>(0)
const isFocused = ref<boolean>(false)
const isSubmenuOpen = ref<boolean>(false)
const emphasizeActiveLabel = ref<boolean>(true)

const contextList = computed<MenuVisualContext[]>(() => ['header', 'sidebar', 'breadcrumb'])

const demoItem = computed<PrimeMenuModelItem>(() => ({
  key: 'demo-item',
  label: 'Demo Item',
  icon: 'i-lucide-sparkles',
  level: 0,
  route: { path: '/demo', name: 'Demo' },
}))

const actionClass = computed<string>(() => {
  const classes: string[] = []
  if (isFocused.value) classes.push('p-focus')
  if (isSubmenuOpen.value) classes.push('p-active')
  return classes.join(' ')
})

const demoSlotProps = computed<TieredMenuItemSlotProps>(() => ({
  item: demoItem.value,
  props: {
    action: {
      class: actionClass.value,
      onClick: () => {},
    },
  },
  hasSubmenu: false,
}))

const renderersByContext = computed(() => {
  const out: Record<MenuVisualContext, (slot: TieredMenuItemSlotProps) => unknown> = {
    header: createTieredMenuItemRenderer({
      context: 'header',
      getDistance: () => distance.value,
      onItemClick: () => {},
      emphasizeActiveLabel: emphasizeActiveLabel.value,
    }),
    sidebar: createTieredMenuItemRenderer({
      context: 'sidebar',
      getDistance: () => distance.value,
      onItemClick: () => {},
      emphasizeActiveLabel: emphasizeActiveLabel.value,
    }),
    breadcrumb: createTieredMenuItemRenderer({
      context: 'breadcrumb',
      getDistance: () => distance.value,
      onItemClick: () => {},
      emphasizeActiveLabel: emphasizeActiveLabel.value,
    }),
  }
  return out
})

const baseByContext = computed(() => {
  return contextList.value.reduce<Record<MenuVisualContext, string>>(
    (acc, c) => {
      acc[c] = getMenuItemBase(c)
      return acc
    },
    {} as Record<MenuVisualContext, string>
  )
})

const stateByContext = computed(() => {
  return contextList.value.reduce<Record<MenuVisualContext, string>>(
    (acc, c) => {
      acc[c] = getMenuStateClasses({
        distance: distance.value,
        isFocused: isFocused.value,
        isSubmenuOpen: isSubmenuOpen.value,
        level: c === 'sidebar' ? undefined : 0,
      })
      return acc
    },
    {} as Record<MenuVisualContext, string>
  )
})

const resolveIconSize = (ctx: MenuVisualContext): 'lg' | 'sm' =>
  ctx === 'breadcrumb' ? 'sm' : 'lg'

const getBaseByCtx = (ctx: MenuVisualContext): string => baseByContext.value[ctx]
const getStateByCtx = (ctx: MenuVisualContext): string => stateByContext.value[ctx]
const getIconSizeText = (ctx: MenuVisualContext): string => `iconSize=${resolveIconSize(ctx)}`

const getRendererNode = (ctx: MenuVisualContext): VNode => {
  return renderersByContext.value[ctx](demoSlotProps.value) as VNode
}

const VNodeHost = defineComponent({
  name: 'VNodeHost',
  props: {
    node: { type: Object as PropType<VNode>, required: true },
  },
  setup(props) {
    return () => props.node
  },
})
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              useMenuVisuals + useMenuRenderer Demo
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              base/state class mapping & renderer output across contexts
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="`distance=${distance}`"
              severity="secondary"
            />
            <Tag
              :value="isFocused ? 'focused' : 'not-focused'"
              :severity="isFocused ? 'info' : 'secondary'"
            />
          </div>
        </div>
        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between">
            <span class="text-sm text-muted-foreground">Action Triggers</span>
          </div>
          <div class="row-start flex-wrap gap-sm">
            <Button
              size="small"
              severity="primary"
              label="distance = -1"
              @click="distance = -1"
            />
            <Button
              size="small"
              severity="secondary"
              label="distance = 0 (active)"
              @click="distance = 0"
            />
            <Button
              size="small"
              severity="secondary"
              label="distance = 2 (parent path)"
              @click="distance = 2"
            />
          </div>
          <div class="row-start flex-wrap gap-sm">
            <ToggleSwitch v-model="isFocused" />
            <Tag
              :value="isFocused ? 'isFocused=true' : 'isFocused=false'"
              severity="secondary"
            />
            <ToggleSwitch v-model="isSubmenuOpen" />
            <Tag
              :value="isSubmenuOpen ? 'isSubmenuOpen=true' : 'isSubmenuOpen=false'"
              severity="secondary"
            />
            <ToggleSwitch v-model="emphasizeActiveLabel" />
            <Tag
              :value="
                emphasizeActiveLabel ? 'emphasizeActiveLabel=true' : 'emphasizeActiveLabel=false'
              "
              severity="secondary"
            />
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <h3 class="text-md font-semibold text-foreground m-0">Current State</h3>
          <span class="text-sm text-muted-foreground">base/state 输出</span>
        </div>
        <Divider />

        <div class="col-stretch gap-md">
          <div
            v-for="ctx in contextList"
            :key="ctx"
            class="material-elevated col-stretch gap-sm p-md"
          >
            <div class="row-between">
              <div class="row-start gap-sm items-center">
                <Icons
                  name="i-lucide-layout-grid"
                  :size="resolveIconSize(ctx)"
                />
                <span class="text-sm font-semibold text-foreground">{{ ctx }}</span>
              </div>
              <Tag
                :value="getIconSizeText(ctx)"
                severity="secondary"
              />
            </div>

            <Divider />

            <div class="col-stretch gap-xs">
              <div class="text-sm text-muted-foreground">base class</div>
              <div class="code-block text-foreground/90 text-ellipsis-1">
                {{ getBaseByCtx(ctx) }}
              </div>
              <div class="text-sm text-muted-foreground">state class</div>
              <div class="code-block text-foreground/90 text-ellipsis-1">
                {{ getStateByCtx(ctx) }}
              </div>
            </div>

            <Divider />

            <div class="col-stretch gap-xs">
              <div class="text-sm text-muted-foreground">renderer output</div>
              <div class="row-start flex-wrap gap-sm items-center">
                <VNodeHost :node="getRendererNode(ctx)" />
              </div>
              <div class="text-xs text-muted-foreground">
                注：renderer 内的 focused 判断基于 action.class 是否包含 `p-focus/p-active`。
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
