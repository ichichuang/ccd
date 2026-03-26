<script setup lang="tsx">
import TieredMenu from 'primevue/tieredmenu'
import { Icons } from '@/components/Icons'
import { useAdminBreadcrumbs } from '@/hooks/layout/useAdminBreadcrumbs'
import {
  createTieredMenuItemRenderer,
  type TieredMenuItemSlotProps,
} from '@/hooks/layout/useMenuRenderer'
import { getIconSize } from '@/hooks/layout/useMenuVisuals'
import { MENU_ICON_COMMON_CLASS } from '@/constants/layout-menu'
import { useLayoutStore } from '@/stores/modules/layout'

defineOptions({ name: 'LayoutBreadcrumbs' })

const {
  breadcrumbs,
  openDropdownPath,
  onMenuHide,
  getActiveDistance,
  bindBreadcrumbMenuRef,
  childItemsToPrimeModel,
  onBreadcrumbClick,
  handleTieredMenuClick,
} = useAdminBreadcrumbs()

const layoutStore = useLayoutStore()

const renderTieredMenuItem = createTieredMenuItemRenderer({
  context: 'breadcrumb',
  getDistance: item => getActiveDistance(item),
  onItemClick: (item, ev, action) => handleTieredMenuClick(item, ev, action),
  emphasizeActiveLabel: true,
})

function renderBreadcrumbMenuItem(slotProps: unknown) {
  return renderTieredMenuItem(slotProps as TieredMenuItemSlotProps)
}
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">useAdminBreadcrumbs Demo</h2>
            <p class="text-sm text-muted-foreground m-0">当前路由面包屑 / 子项下拉 / 点击导航</p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="`Breadcrumbs: ${breadcrumbs.length}`"
              :severity="breadcrumbs.length > 0 ? 'success' : 'warn'"
            />
            <Tag
              :value="openDropdownPath ? `Open: ${openDropdownPath}` : 'Open: —'"
              severity="secondary"
            />
          </div>
        </div>

        <Divider />

        <div class="col-stretch gap-sm">
          <div class="row-between items-center">
            <span class="text-sm text-muted-foreground">Current State</span>
          </div>
          <div class="col-stretch gap-xs">
            <div
              v-for="(item, index) in breadcrumbs"
              :key="item.path"
              class="row-between gap-sm rounded-md p-sm bg-muted/30"
            >
              <span class="text-sm text-foreground text-ellipsis-1">
                {{ index + 1 }}. {{ item.title }}
              </span>
              <Tag
                :value="item.childItems?.length ? `Children: ${item.childItems.length}` : 'Leaf'"
                :severity="item.childItems?.length ? 'info' : 'secondary'"
              />
            </div>
            <div
              v-if="breadcrumbs.length === 0"
              class="text-sm text-muted-foreground"
            >
              当前路由未配置可展示的面包屑。
            </div>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
          <span class="text-sm text-muted-foreground">点击面包屑可导航；目录项打开下拉</span>
        </div>
        <Divider />

        <div class="w-full h-breadcrumbHeight px-md flex items-center select-none">
          <div class="flex items-center text-sm text-muted-foreground whitespace-nowrap">
            <TransitionGroup name="breadcrumb">
              <div
                v-for="(item, index) in breadcrumbs"
                :key="item.path"
                class="flex items-center min-w-0"
              >
                <span
                  :class="[
                    'transition-all duration-md flex items-center gap-xs rounded-sm',
                    index === breadcrumbs.length - 1
                      ? 'text-foreground font-semibold cursor-default'
                      : 'cursor-pointer hover:text-foreground',
                    openDropdownPath === item.path ? 'text-foreground' : '',
                  ]"
                  :role="index === breadcrumbs.length - 1 ? undefined : 'button'"
                  :tabindex="index === breadcrumbs.length - 1 ? undefined : '0'"
                  @click="e => onBreadcrumbClick(item, index === breadcrumbs.length - 1, e)"
                  @keyup.enter="e => onBreadcrumbClick(item, index === breadcrumbs.length - 1, e)"
                >
                  <Icons
                    v-if="item.icon && layoutStore.showBreadcrumbIcon"
                    :name="item.icon"
                    :class="[MENU_ICON_COMMON_CLASS, 'shrink-0 text-current!']"
                    :size="getIconSize('breadcrumb')"
                  />
                  <span>{{ item.title }}</span>
                  <Icons
                    v-if="item.childItems?.length"
                    :name="
                      openDropdownPath === item.path
                        ? 'i-lucide-panel-bottom-close'
                        : 'i-lucide-panel-bottom-open'
                    "
                    :class="[MENU_ICON_COMMON_CLASS, 'ml-xs text-current! shrink-0']"
                    :size="getIconSize('breadcrumb')"
                  />
                </span>

                <Icons
                  v-if="index !== breadcrumbs.length - 1"
                  name="i-lucide-chevron-right"
                  class="mx-sm text-muted-foreground/30"
                  :size="getIconSize('breadcrumb')"
                />

                <TieredMenu
                  v-if="item.childItems?.length"
                  :ref="bindBreadcrumbMenuRef(item.path)"
                  :model="childItemsToPrimeModel(item.childItems)"
                  append-to="body"
                  popup
                  @hide="onMenuHide(item.path)"
                >
                  <template #item="slotProps">
                    <component :is="() => renderBreadcrumbMenuItem(slotProps)" />
                  </template>
                </TieredMenu>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.breadcrumb-enter-active {
  transition: all var(--transition-md) ease-out;
}

.breadcrumb-leave-active {
  transition: all var(--transition-md) ease-in;
  position: absolute;
}

.breadcrumb-enter-from {
  opacity: 0;
  transform: translateX(var(--spacing-md));
}

.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(var(--spacing-sm));
}

.breadcrumb-move {
  transition: all var(--transition-md) ease;
}
</style>
