<script setup lang="tsx">
import TieredMenu from 'primevue/tieredmenu'
import { Icons } from '@/components/Icons'
import { useAdminBreadcrumbs } from '@/hooks/layout/useAdminBreadcrumbs'
import type { PrimeMenuModelItem } from '@/router/utils/helper'
import { MENU_ICON_COMMON_CLASS } from '@/constants/layout-menu'
import { getIconSize } from '@/hooks/layout/useMenuVisuals'
import {
  createTieredMenuItemRenderer,
  type TieredMenuItemSlotProps,
} from '@/hooks/layout/useMenuRenderer'
import { useLayoutStore } from '@/stores/modules/layout'

defineProps<{
  show: boolean
}>()

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
  getDistance: (item: PrimeMenuModelItem): number => getActiveDistance(item),
  onItemClick: (
    item: PrimeMenuModelItem,
    ev: Event,
    action?: { onClick?: (ev: Event) => void }
  ): void => {
    handleTieredMenuClick(item, ev, action)
  },
  emphasizeActiveLabel: true,
})

function renderBreadcrumbMenuItem(slotProps: unknown) {
  return renderTieredMenuItem(slotProps as TieredMenuItemSlotProps)
}
</script>

<template>
  <div
    v-if="show"
    class="admin-breadcrumb w-full h-breadcrumbHeight row-y-center px-md overflow-hidden select-none border-b-default"
  >
    <div class="row-y-center text-sm text-muted-foreground whitespace-nowrap">
      <TransitionGroup name="breadcrumb">
        <div
          v-for="(item, index) in breadcrumbs"
          :key="item.path"
          class="row-y-center"
        >
          <!-- Breadcrumb Item -->
          <span
            :class="[
              'transition-all duration-md row-y-center gap-xs rounded-sm',
              index === breadcrumbs.length - 1
                ? 'text-foreground font-semibold cursor-default'
                : 'cursor-pointer hover:text-primary',
              openDropdownPath === item.path ? 'text-primary' : '',
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

          <!-- Separator -->
          <Icons
            v-if="index !== breadcrumbs.length - 1"
            name="i-lucide-chevron-right"
            class="mx-sm text-muted-foreground/30"
            :size="getIconSize('breadcrumb')"
          />

          <!-- 为当前面包屑节点挂载独立的 TieredMenu 实例（仅当存在子项时） -->
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
