<script setup lang="tsx">
import TieredMenu from 'primevue/tieredmenu'
import { TransitionGroup } from 'vue'
import { Icons } from '@/components/Icons'
import { useAdminBreadcrumbs } from '@/hooks/layout/useAdminBreadcrumbs'
import type { PrimeMenuModelItem } from '@/router/utils/helper'

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

/** TieredMenu #item slot 参数类型 */
type TieredMenuItemSlotProps = {
  item: PrimeMenuModelItem
  props: { action: Record<string, unknown> }
  hasSubmenu: boolean
}

const renderTieredMenuItem = ({ item, props: slotProps, hasSubmenu }: TieredMenuItemSlotProps) => {
  const action = slotProps.action as Record<string, unknown> & {
    class?: string
    onClick?: (ev: Event) => void
  }
  const actionClassStr = typeof action?.class === 'string' ? action.class : ''
  const isFocused =
    actionClassStr.includes('p-focus') ||
    actionClassStr.includes('p-active') ||
    actionClassStr.includes('p-highlight') ||
    /p-tieredmenu[^"'\s]*(active|focus)/.test(actionClassStr)

  const distance = getActiveDistance(item)
  const activeBgMapping: Record<number, string> = {
    0: 'bg-primary/90!',
    1: 'bg-primary/80!',
    2: 'bg-primary/70!',
    3: 'bg-primary/60!',
  }

  const currentStates =
    distance >= 0
      ? `${activeBgMapping[distance] || 'bg-primary/50!'} text-primary-foreground! ${distance === 0 ? 'font-bold' : ''}`
      : isFocused
        ? 'menu-item-hover'
        : 'text-foreground! hover:menu-item-hover'

  const mergedClass = [
    'group flex items-center gap-sm cursor-pointer transition-all duration-scale-md ease-in-out select-none',
    'w-full px-padding-md! py-padding-sm! rounded-scale-md fs-sm',
    currentStates,
    'focus-visible:ring-1 focus-visible:ring-ring focus:outline-none border-none bg-transparent',
    actionClassStr,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  const iconColorClass =
    distance >= 0
      ? 'text-primary-foreground! opacity-100!'
      : isFocused
        ? 'text-primary! opacity-100!'
        : 'text-muted-foreground! opacity-80 transition-colors transition-opacity duration-scale-md group-hover:text-primary! group-hover:opacity-100'

  return (
    <a
      {...action}
      class={mergedClass}
      onClick={(ev: Event) => handleTieredMenuClick(item, ev, action)}
      role="button"
      tabindex="0"
      onKeyup={(ev: KeyboardEvent) => {
        if (ev.key === 'Enter') handleTieredMenuClick(item, ev, action)
      }}
    >
      {item.icon && (
        <Icons
          name={item.icon}
          class={`shrink-0 fs-md ${iconColorClass}`}
        />
      )}
      <span class="truncate flex-1">{item.label}</span>
      {hasSubmenu && (
        <Icons
          name="i-lucide-chevron-right"
          class={`ml-auto fs-xs transition-colors transition-opacity duration-scale-md ${iconColorClass.replace('opacity-80', 'opacity-50')}`}
        />
      )}
    </a>
  )
}
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
              'transition-all duration-scale-md flex items-center gap-xs focus:outline-none active:ring-0! active:border-none! rounded-scale-sm',
              index === breadcrumbs.length - 1
                ? 'text-foreground font-semibold cursor-default'
                : 'cursor-pointer hover:text-accent',
              openDropdownPath === item.path ? 'text-accent' : '',
            ]"
            :role="index === breadcrumbs.length - 1 ? undefined : 'button'"
            :tabindex="index === breadcrumbs.length - 1 ? undefined : '0'"
            @click="e => onBreadcrumbClick(item, index === breadcrumbs.length - 1, e)"
            @keyup.enter="e => onBreadcrumbClick(item, index === breadcrumbs.length - 1, e)"
          >
            <Icons
              v-if="item.icon"
              :name="item.icon"
              class="text-current! shrink-0!"
              size="sm"
            />
            <span>{{ item.title }}</span>
            <Icons
              v-if="item.childItems?.length"
              :name="
                openDropdownPath === item.path
                  ? 'i-lucide-panel-bottom-close'
                  : 'i-lucide-panel-bottom-open'
              "
              :class="
                openDropdownPath === item.path
                  ? 'text-accent! ml-margin-xs'
                  : 'text-current! ml-margin-xs opacity-60'
              "
              size="sm"
            />
          </span>

          <!-- Separator -->
          <Icons
            v-if="index !== breadcrumbs.length - 1"
            name="i-lucide-chevron-right"
            class="mx-margin-sm text-muted-foreground/30"
            size="lg"
          />

          <!-- 为当前面包屑节点挂载独立的 TieredMenu 实例（仅当存在子项时） -->
          <TieredMenu
            v-if="item.childItems?.length"
            :ref="bindBreadcrumbMenuRef(item.path)"
            :model="childItemsToPrimeModel(item.childItems)"
            append-to="body"
            popup
            :pt="{
              root: {
                class: 'bg-card border border-border rounded-scale-md shadow-lg outline-none!',
              },
              menu: { class: 'p-padding-xs rounded-scale-md outline-none!' },
              menuitem: { class: 'bg-transparent border-none rounded-scale-sm outline-none!' },
              content: {
                class:
                  'bg-transparent! border-none rounded-scale-sm outline-none! box-shadow-none!',
              },
              action: { class: 'outline-none! shadow-none!' },
            }"
            @hide="onMenuHide(item.path)"
          >
            <template #item="slotProps">
              <component :is="() => renderTieredMenuItem(slotProps as any)" />
            </template>
          </TieredMenu>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.breadcrumb-enter-active {
  transition: all var(--transition-xl) ease-out;
}
.breadcrumb-leave-active {
  transition: all var(--transition-lg) ease-in;
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
  transition: all var(--transition-xl) ease;
}
</style>
