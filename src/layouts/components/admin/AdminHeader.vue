<script setup lang="tsx">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import TieredMenu from 'primevue/tieredmenu'
import { Icons } from '@/components/Icons'
import GlobalSetting from '@/layouts/components/GlobalSetting/index.vue'
import User from '@/layouts/components/User/index.vue'
import { brand } from '@/constants/brand'
import { AUTH_ENABLED } from '@/constants/router'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  getAdminMenuTree,
  getAuthorizedMenuTree,
  getActiveMenuPath,
  goToRoute,
  menuItemToPrimeModel,
  type PrimeMenuModelItem,
} from '@/router/utils/helper'
import { useUserStore } from '@/stores/modules/user'

const props = defineProps<{
  mode: AdminLayoutMode
  showHeader: boolean
  showLogo: boolean
  showMenu: boolean
  headerFixed: boolean
  isDark: boolean
  isAnimating: boolean
  showSidebarToggle: boolean
  sidebarCollapse: boolean
}>()

const emit = defineEmits<{
  toggleTheme: [event: MouseEvent]
  toggleCollapse: [event: MouseEvent]
}>()

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()

const isHorizontal = computed(() => props.mode === 'horizontal')
const isMix = computed(() => props.mode === 'mix')
const userRoles = computed(() => userStore.getUserRoles || [])
const isLogin = computed(() => userStore.getIsLogin)
const showUserEntry = computed(() => AUTH_ENABLED && isLogin.value)

// --- Menu Logic ---
const menuModel = computed(() => {
  const tree = getAdminMenuTree()
  const authorizedTree = getAuthorizedMenuTree(userRoles.value, tree)
  return authorizedTree.map(item => menuItemToPrimeModel(item, t))
})

/** 计算当前项到激活叶子节点的距离：0=激活项, 1=直接父级, 2=祖父级... -1=未激活 */
const getActiveDistance = (item: PrimeMenuModelItem): number => {
  const activePath = getActiveMenuPath(route)
  if (item.route?.path === activePath) return 0

  const parentPaths = Array.isArray(route.meta?.parentPaths)
    ? (route.meta?.parentPaths as string[])
    : []
  const idx = parentPaths.indexOf(item.key)
  if (idx !== -1) {
    return parentPaths.length - idx
  }
  return -1
}

// --- TieredMenu Popup 状态管理（与 AdminSidebar 架构完全一致）---
const tieredMenuRefs = ref<Map<string, InstanceType<typeof TieredMenu>>>(new Map())
const openDropdownKey = ref<string | null>(null)

const setMenuRef = (key: string, el: InstanceType<typeof TieredMenu> | null) => {
  if (el) {
    tieredMenuRefs.value.set(key, el)
  } else {
    tieredMenuRefs.value.delete(key)
  }
}

// 点击根菜单项：有子菜单则 toggle TieredMenu，无则导航
const onRootItemClick = (e: MouseEvent, item: PrimeMenuModelItem) => {
  if (item.items && item.items.length > 0) {
    const menuRef = tieredMenuRefs.value.get(item.key)
    if (menuRef) {
      // 先关闭其他打开的菜单
      tieredMenuRefs.value.forEach((ref, key) => {
        if (key !== item.key && ref) {
          ref.hide()
        }
      })
      const wasOpen = openDropdownKey.value === item.key
      menuRef.toggle(e)
      openDropdownKey.value = wasOpen ? null : item.key
    }
  } else if (item.route?.path) {
    goToRoute(item.route.name || item.route.path, undefined, undefined, false)
  }
}

// --- 共通配色逻辑 ---
const activeBgMapping: Record<number, string> = {
  0: 'bg-primary/90!',
  1: 'bg-primary/20!',
  2: 'bg-primary/10!',
  3: 'bg-primary/5!',
}

// --- TieredMenu PT 配置（与 AdminSidebar 完全一致）---
const tieredMenuPt = {
  root: {
    class: 'border border-border rounded-scale-md shadow-md outline-none! box-shadow-none!',
  },
  menu: { class: 'bg-card py-padding-xs rounded-scale-md outline-none!' },
  menuitem: { class: 'bg-transparent border-none rounded-scale-sm outline-none!' },
  content: {
    class: 'bg-transparent! border-none rounded-scale-md outline-none! box-shadow-none!',
  },
  action: { class: 'outline-none! shadow-none!' },
}

// --- 渲染 TieredMenu 弹出子菜单项（与 AdminSidebar renderTieredMenuItem 完全一致）---
const renderTieredMenuItem = ({
  item,
  props: slotProps,
  hasSubmenu,
}: {
  item: PrimeMenuModelItem
  props: { action: Record<string, unknown> }
  hasSubmenu: boolean
}) => {
  const action = slotProps.action as Record<string, unknown> & {
    class?: string
    onClick?: (e: Event) => void
  }

  const distance = getActiveDistance(item)
  const actionClassStr = typeof action?.class === 'string' ? action.class : ''
  const isFocused =
    actionClassStr.includes('p-focus') ||
    actionClassStr.includes('p-active') ||
    actionClassStr.includes('p-highlight') ||
    /p-tieredmenu[^"'\s]*(active|focus)/.test(actionClassStr)

  const stateClasses =
    distance >= 0
      ? `${activeBgMapping[distance] || 'bg-primary/5!'} ${distance === 0 ? 'text-primary-foreground! font-bold' : 'text-primary!'}`
      : isFocused
        ? 'menu-item-hover'
        : 'text-foreground! hover:menu-item-hover'

  const baseClass =
    'group flex items-center gap-sm w-full rounded-scale-md px-padding-md py-padding-sm fs-sm ' +
    'transition-[background-color,color,opacity,transform] duration-scale-md ease-in-out select-none ' +
    'focus:outline-none! border-none! bg-transparent active:ring-0! active:border-none! ' +
    'active:shadow-none! focus:shadow-none! active:outline-none!'
  const mergedClass = [baseClass, stateClasses, actionClassStr].filter(Boolean).join(' ').trim()

  const iconColorClass =
    distance >= 0
      ? distance === 0
        ? 'text-primary-foreground! opacity-100!'
        : 'text-primary! opacity-100!'
      : isFocused
        ? 'text-primary! opacity-100!'
        : 'text-muted-foreground! opacity-80 transition-colors transition-opacity duration-scale-md group-hover:text-primary! group-hover:opacity-100'

  const handleClick = (e: Event) => {
    if (item.route?.path) {
      e.preventDefault()
      goToRoute(item.route?.name ?? item.route.path, undefined, undefined, false)
    }
    if (typeof action?.onClick === 'function') action.onClick(e)
  }

  return (
    <a
      {...action}
      class={[mergedClass, 'outline-none! shadow-none!'].join(' ')}
      onClick={handleClick}
    >
      {item.icon && (
        <Icons
          name={item.icon}
          size="sm"
          class={`shrink-0 text-current! ${iconColorClass}`}
        />
      )}
      <span class="truncate flex-1 text-left!">{item.label}</span>
      {hasSubmenu && (
        <Icons
          name="i-lucide-chevron-right"
          size="sm"
          class={`ml-auto shrink-0 transition-transform duration-scale-md ${iconColorClass.replace('opacity-80', 'opacity-50')}`}
        />
      )}
    </a>
  )
}

// --- 渲染根菜单项（水平按钮 + TieredMenu popup）---
const renderRootItem = (item: PrimeMenuModelItem) => {
  const distance = getActiveDistance(item)
  const hasChildren = item.items && item.items.length > 0
  const isSubmenuOpen = openDropdownKey.value === item.key

  const stateClasses =
    distance >= 0
      ? `${activeBgMapping[distance] || 'bg-primary/5!'} ${distance === 0 ? 'text-primary-foreground! font-bold' : 'text-primary!'}`
      : isSubmenuOpen
        ? 'menu-item-hover text-foreground!'
        : 'text-muted-foreground! hover:menu-item-hover'

  const iconColorClass =
    distance >= 0
      ? distance === 0
        ? 'text-primary-foreground! opacity-100!'
        : 'text-primary! opacity-100!'
      : isSubmenuOpen
        ? 'text-primary! opacity-100!'
        : 'text-muted-foreground! opacity-80 transition-colors transition-opacity duration-scale-md group-hover:text-primary! group-hover:opacity-100'

  return (
    <div
      key={item.key}
      class="relative"
    >
      <a
        class={`group flex items-center gap-sm px-padding-sm py-padding-xs rounded-scale-md fs-sm font-medium cursor-pointer transition-all duration-scale-md ease-in-out select-none outline-none! shadow-none! mx-margin-xs ${stateClasses}`}
        onClick={(e: MouseEvent) => onRootItemClick(e, item)}
        role="menuitem"
        aria-haspopup={hasChildren ? 'true' : undefined}
        aria-expanded={hasChildren ? isSubmenuOpen : undefined}
      >
        {item.icon && (
          <Icons
            name={item.icon}
            size="lg"
            class={`shrink-0 text-current! ${iconColorClass}`}
          />
        )}
        <span class="truncate">{item.label}</span>
        {hasChildren && (
          <Icons
            name="i-lucide-chevron-down"
            size="sm"
            class={`shrink-0 transition-transform duration-scale-md ${isSubmenuOpen ? 'rotate-180' : ''} ${iconColorClass.replace('opacity-80', 'opacity-50')}`}
          />
        )}
      </a>
      {hasChildren && (
        <TieredMenu
          ref={(el: unknown) => setMenuRef(item.key, el as InstanceType<typeof TieredMenu> | null)}
          model={item.items}
          popup
          appendTo="body"
          {...{
            onHide: () => {
              openDropdownKey.value = null
            },
          }}
          v-slots={{ item: renderTieredMenuItem }}
          pt={tieredMenuPt}
        />
      )}
    </div>
  )
}
</script>

<template>
  <header
    v-if="showHeader"
    :class="[
      'w-full h-headerHeight flex items-center justify-between px-padding-lg border-b-default bg-background/80 backdrop-blur-md z-30 transition-all duration-scale-md sticky top-0',
    ]"
  >
    <!-- Left: Logo -->
    <div class="flex items-center gap-md shrink-0">
      <div
        v-if="showLogo"
        class="flex items-center gap-sm cursor-pointer hover:opacity-80 transition-opacity duration-scale-md"
        @click="goToRoute('/')"
      >
        <div
          class="logo-box rounded-scale-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20"
        >
          <span class="fs-md font-bold">C</span>
        </div>
        <div class="hidden md:flex flex-col leading-none gap-xs">
          <span class="fs-xl font-bold tracking-tight">{{ brand.displayName }}</span>
          <span class="fs-xs text-muted-foreground font-medium">{{ brand.subtitle }}</span>
        </div>
      </div>
    </div>

    <!-- Middle: Horizontal Menu（TieredMenu Popup 架构）-->
    <nav
      v-if="showMenu && (isHorizontal || isMix)"
      class="flex-1 min-w-0 px-padding-md flex items-center justify-start"
      role="menubar"
    >
      <component
        :is="renderRootItem(item)"
        v-for="item in menuModel"
        :key="item.key"
      />
    </nav>

    <!-- Right: Actions -->
    <div class="shrink-0 ml-auto flex items-center">
      <div class="flex items-center gap-sm">
        <Button
          v-if="showSidebarToggle"
          variant="text"
          severity="secondary"
          class="center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-scale-md"
          @click="emit('toggleCollapse', $event)"
        >
          <Icons
            :name="sidebarCollapse ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
            size="xl"
          />
        </Button>
        <Button
          variant="text"
          severity="secondary"
          class="center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-scale-md"
          :disabled="isAnimating"
          @click="emit('toggleTheme', $event)"
        >
          <Icons
            :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
            size="xl"
          />
        </Button>
        <GlobalSetting />
        <User v-if="showUserEntry" />
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.logo-box {
  width: var(--spacing-xl);
  height: var(--spacing-xl);
}
</style>
