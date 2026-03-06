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
</script>

<template>
  <div
    v-if="show"
    class="admin-breadcrumb w-full h-breadcrumbHeight flex items-center px-padding-md overflow-hidden select-none"
  >
    <div class="flex items-center fs-sm text-muted-foreground whitespace-nowrap">
      <TransitionGroup name="breadcrumb">
        <div
          v-for="(item, index) in breadcrumbs"
          :key="item.path"
          class="flex items-center"
        >
          <!-- Breadcrumb Item -->
          <span
            :class="[
              'transition-all duration-scale-md flex items-center gap-xs rounded-scale-sm',
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
              v-if="item.icon"
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
              :class="[MENU_ICON_COMMON_CLASS, 'ml-margin-xs text-current! shrink-0']"
              :size="getIconSize('breadcrumb')"
            />
          </span>

          <!-- Separator -->
          <Icons
            v-if="index !== breadcrumbs.length - 1"
            name="i-lucide-chevron-right"
            class="mx-margin-sm text-muted-foreground/30"
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
              <component :is="() => renderTieredMenuItem(slotProps as TieredMenuItemSlotProps)" />
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
