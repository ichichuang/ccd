<script setup lang="tsx">
import { computed } from 'vue'
import Button from 'primevue/button'
import Menubar from 'primevue/menubar'
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
import type { MenuItem } from 'primevue/menuitem'

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

// --- Menu Logic (Reused from AdminSidebar logic but for Horizontal) ---
const menuModel = computed(() => {
  const tree = getAdminMenuTree()
  const authorizedTree = getAuthorizedMenuTree(userRoles.value, tree)
  return authorizedTree.map(item => menuItemToPrimeModel(item, t))
})

const isActiveMenuItem = (item: PrimeMenuModelItem): boolean => {
  const activePath = getActiveMenuPath(route)
  return item.route?.path === activePath
}

const isParentOfActive = (item: PrimeMenuModelItem): boolean => {
  const parentPaths = Array.isArray(route.meta?.parentPaths)
    ? (route.meta?.parentPaths as string[])
    : []
  return parentPaths.includes(item.key)
}

// --- Render Custom Menu Item (Modern Pill Style) ---
const renderMenuItem = (slotProps: {
  item: MenuItem
  root: boolean
  hasSubmenu: boolean
  props?: { action?: object }
}) => {
  const item = slotProps.item as PrimeMenuModelItem
  const { root, hasSubmenu } = slotProps
  const action = (slotProps.props?.action ?? {}) as Record<string, unknown> & {
    class?: string
    onClick?: (ev: Event) => void
  }
  const isActive = isActiveMenuItem(item)
  const isParentActive = isParentOfActive(item)
  // PT 在子菜单展开时会给 action.class 添加 focus/active 相关类，需据此高亮图标
  const actionClassStr = typeof action.class === 'string' ? action.class : ''
  const isFocused =
    actionClassStr.includes('p-focus') ||
    actionClassStr.includes('p-active') ||
    actionClassStr.includes('p-highlight') ||
    /p-menubar[^"'\s]*(active|focus)/.test(actionClassStr)

  // Common: group 用于 chevron 的 group-hover，flex 布局
  const commonClasses =
    'group flex items-center gap-sm cursor-pointer transition-all duration-scale-md ease-in-out select-none'

  // Root Item Styling: 单一来源控制背景，PT 已关闭；配色类加 ! 确保覆盖 actionClass
  const rootClasses = `
    px-padding-sm py-padding-xs rounded-scale-md fs-sm font-medium
    ${
      isActive || isParentActive
        ? 'bg-primary/10! text-primary!'
        : isFocused
          ? 'bg-accent-light! text-accent-light-foreground!'
          : 'text-muted-foreground! hover:bg-accent-light! hover:text-accent-light-foreground!'
    }
  `

  // Submenu Item Styling: 内边距放宽（md+sm）；! 强制覆盖 PT Design Token 的 padding:0
  const subClasses = `
    px-padding-md! py-padding-sm! rounded-scale-md fs-sm
    ${
      isActive || isParentActive
        ? 'bg-primary/10! text-primary! font-medium'
        : 'text-foreground! hover:bg-accent-light! hover:text-accent-light-foreground!'
    }
  `

  const baseClass = `${commonClasses} ${root ? rootClasses : subClasses} ${
    root ? 'mx-margin-xs' : 'w-full'
  }`
  const actionClass = actionClassStr
  const linkClass = [baseClass, actionClass].filter(Boolean).join(' ').trim()

  // 图标/chevron 颜色：路由激活→primary，PT focus→accent-light-foreground，否则→muted；hover 时与文字同步高亮
  const iconColorClass =
    isActive || isParentActive
      ? 'text-primary! opacity-100!'
      : isFocused
        ? 'text-accent-light-foreground! opacity-100!'
        : 'text-muted-foreground! opacity-80 transition-colors transition-opacity duration-scale-md group-hover:text-accent-light-foreground! group-hover:opacity-100'

  const content = (
    <>
      {item.icon && (
        <Icons
          name={item.icon}
          class={`shrink-0 fs-lg ${iconColorClass}`}
        />
      )}
      <span class="truncate">{item.label}</span>
      {hasSubmenu && (
        <Icons
          name={root ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'}
          class={`ml-auto fs-xs transition-transform duration-scale-md ${
            root
              ? `${iconColorClass.replace('opacity-80', 'opacity-50')}`
              : 'text-current opacity-70 transition-colors transition-opacity duration-scale-md group-hover:text-accent-light-foreground! group-hover:opacity-100'
          }`}
        />
      )}
    </>
  )

  const handleClick = (e: Event) => {
    e.preventDefault()
    if (item.route?.path) {
      goToRoute(item.route?.name ?? item.route?.path, undefined, undefined, false)
    }
    if (typeof action.onClick === 'function') action.onClick(e)
  }

  // 展开 props.action 以保留 PrimeVue 的 aria-* / keyboard 支持，再覆盖 class 与 onClick
  return (
    <a
      {...action}
      class={linkClass}
      onClick={handleClick}
    >
      {content}
    </a>
  )
}
</script>

<template>
  <header
    v-if="showHeader"
    :class="[
      'w-full h-headerHeight flex items-center justify-between px-padding-lg border-b-default bg-background/80 backdrop-blur-md z-30 transition-all duration-scale-md sticky top-0',
      headerFixed ? 'admin-header--fixed' : '',
    ]"
  >
    <!-- Left: Logo -->
    <div class="flex items-center gap-md shrink-0">
      <div
        v-if="showLogo"
        class="flex items-center gap-sm cursor-pointer hover:opacity-80 transition-opacity duration-scale-xl"
        @click="goToRoute('/')"
      >
        <div
          class="logo-box rounded-scale-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20"
        >
          <span class="fs-md font-bold">C</span>
        </div>
        <div class="hidden md:flex flex-col leading-none">
          <span class="fs-sm font-bold tracking-tight">{{ brand.displayName }}</span>
          <span class="fs-xs text-muted-foreground font-medium">{{ brand.subtitle }}</span>
        </div>
      </div>
    </div>

    <!-- Middle: Horizontal Menu -->
    <div
      v-if="showMenu && (isHorizontal || isMix)"
      class="flex-1 min-w-0 px-padding-md flex justify-start layout-full"
    >
      <Menubar
        :model="menuModel"
        class="admin-header-menubar"
      >
        <template #item="slotProps">
          <component :is="renderMenuItem(slotProps)" />
        </template>
      </Menubar>
    </div>

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
