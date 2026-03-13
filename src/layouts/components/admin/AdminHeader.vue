<script setup lang="tsx">
import TieredMenu from 'primevue/tieredmenu'
import type { MenuItem } from 'primevue/menuitem'
import { Icons } from '@/components/Icons'
import User from '@/layouts/components/User/index.vue'
import { brand } from '@/constants/brand'
import { AUTH_ENABLED } from '@/constants/router'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  getAdminMenuTree,
  getAuthorizedMenuTree,
  getActiveDistance,
  goToRoute,
  menuItemToPrimeModel,
  type PrimeMenuModelItem,
} from '@/router/utils/helper'
import { MENU_TEXT_CLASS, MENU_TEXT_WEIGHT, MENU_ICON_COMMON_CLASS } from '@/constants/layout-menu'
import { getMenuItemBase, getMenuStateClasses, getIconSize } from '@/hooks/layout/useMenuVisuals'
import { createTieredMenuItemRenderer } from '@/hooks/layout/useMenuRenderer'
import { useUserStore } from '@/stores/modules/user'
import { useDeviceStore } from '@/stores/modules/device'
import { useLayoutStore } from '@/stores/modules/layout'

import logoSrc from '@/assets/images/face.png'

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
const deviceStore = useDeviceStore()
const layoutStore = useLayoutStore()

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const isHorizontal = computed(() => props.mode === 'horizontal')
const isMix = computed(() => props.mode === 'mix')
const userRoles = computed(() => userStore.getUserRoles || [])
const isLogin = computed(() => userStore.getIsLogin)
const showUserEntry = computed(() => AUTH_ENABLED && isLogin.value)
const isMobileLayout = computed(() => deviceStore.isMobileLayout)

// --- Menu Logic ---
const menuModel = computed(() => {
  const tree = getAdminMenuTree()
  const authorizedTree = getAuthorizedMenuTree(userRoles.value, tree)
  return authorizedTree.map(item => menuItemToPrimeModel(item, t))
})

// --- TieredMenu Popup 状态管理（与 AdminSidebar 架构一致）---
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
    const menuRef = tieredMenuRefs.value.get(item.key ?? '')
    if (menuRef) {
      // 先关闭其他打开的菜单
      tieredMenuRefs.value.forEach((ref, key) => {
        if (key !== (item.key ?? '') && ref) {
          ref.hide()
        }
      })
      const wasOpen = openDropdownKey.value === (item.key ?? '')
      menuRef.toggle(e)
      openDropdownKey.value = wasOpen ? null : (item.key ?? '')
    }
  } else if (item.route?.name) {
    goToRoute(item.route.name, undefined, undefined, false)
  }
}

// --- 渲染 TieredMenu 弹出子菜单项（与 Sidebar/Breadcrumb 统一激活态）---
const renderTieredMenuItem = createTieredMenuItemRenderer({
  context: 'header',
  getDistance: (item: PrimeMenuModelItem): number => getActiveDistance(route, item),
})

// --- 渲染根菜单项（水平按钮 + TieredMenu popup）---
const renderRootItem = (item: PrimeMenuModelItem) => {
  const distance = getActiveDistance(route, item)
  const hasChildren = item.items && item.items.length > 0
  const isSubmenuOpen = openDropdownKey.value === item.key

  const stateClasses: string = getMenuStateClasses({
    distance,
    isSubmenuOpen,
    level: 0,
  })

  const linkClass = [getMenuItemBase('header'), MENU_TEXT_WEIGHT, 'mx-margin-xs', stateClasses]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {item.icon && (
        <Icons
          name={item.icon}
          size={getIconSize('header')}
          class={`text-current! shrink-0 ${MENU_ICON_COMMON_CLASS}`}
        />
      )}
      <span
        class={`truncate text-current! ${MENU_TEXT_CLASS} font-medium leading-none pt-hairline`}
      >
        {item.label}
      </span>
      {hasChildren && (
        <Icons
          name="i-lucide-chevron-down"
          size={getIconSize('header')}
          class={`text-current! shrink-0 ${MENU_ICON_COMMON_CLASS} ${isSubmenuOpen ? 'rotate-180' : ''}`}
        />
      )}
    </>
  )

  const linkNode =
    hasChildren || !item.route?.name ? (
      <a
        class={linkClass}
        onClick={(e: MouseEvent) => onRootItemClick(e, item)}
        role="menuitem"
        aria-haspopup={hasChildren ? 'true' : undefined}
        aria-expanded={hasChildren ? isSubmenuOpen : undefined}
      >
        {content}
      </a>
    ) : (
      <RouterLink
        to={{ name: item.route.name }}
        custom
        v-slots={{
          default: ({ href }: { href: string }) => {
            const isExtLink: boolean = item.route?.meta?.isLink === true
            const extUrl: string =
              (item.route?.meta?.linkUrl as string | undefined) || item.route!.path

            return (
              <a
                href={isExtLink ? extUrl : href}
                class={linkClass}
                role="menuitem"
                aria-haspopup={undefined}
                aria-expanded={undefined}
                onClick={(e: MouseEvent) => {
                  e.preventDefault()
                  goToRoute(item.route!.name as string, undefined, undefined, false)
                }}
              >
                {content}
              </a>
            )
          },
        }}
      />
    )

  return (
    <div
      key={item.key}
      class="relative"
    >
      {linkNode}
      {hasChildren && (
        <TieredMenu
          ref={(el: unknown) =>
            setMenuRef(item.key ?? '', el as InstanceType<typeof TieredMenu> | null)
          }
          model={item.items as unknown as MenuItem[]}
          popup
          appendTo="body"
          {...{
            onHide: () => {
              openDropdownKey.value = null
            },
          }}
          v-slots={{ item: renderTieredMenuItem }}
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
      'w-full h-headerHeight flex items-center justify-between px-padding-md py-padding-sm transition-all duration-scale-md gap-md select-none',
    ]"
    @dragstart.prevent
  >
    <!-- Left: Mobile Menu + Logo -->
    <div class="h-full center gap-sm">
      <!-- 移动端：汉堡菜单按钮，打开抽屉侧边栏 -->
      <button
        v-if="isMobileLayout"
        type="button"
        class="header-icon-btn"
        @click="layoutStore.toggleMobileDrawer()"
      >
        <Icons
          name="i-lucide-menu"
          size="2xl"
        />
      </button>
      <a
        v-if="showLogo"
        href="/"
        class="h-full flex items-center gap-sm cursor-pointer behavior-hover-transition py-xs hover:text-primary! bg-transparent border-none p-0 outline-none interactive-focus-ring"
        @click.prevent="goToRoute('/')"
      >
        <div class="h-full size-1-1 rounded-full center">
          <img
            class="layout-full!"
            :src="logoSrc"
            draggable="false"
          />
        </div>
        <div class="h-full hidden md:flex flex-col justify-between leading-none">
          <span class="fs-xl font-bold tracking-tight duration-scale-md">
            {{ brand.displayName }}
          </span>
          <span class="fs-xs text-muted-foreground font-medium">{{ brand.subtitle }}</span>
        </div>
      </a>
    </div>

    <!-- Middle: Horizontal Menu（TieredMenu Popup 架构，移动端隐藏以避免拥挤）-->
    <div class="flex-1 h-full flex justify-between items-center">
      <nav
        v-if="showMenu && (isHorizontal || isMix) && !isMobileLayout"
        class="min-w-0 flex items-center justify-start"
        role="menubar"
      >
        <component
          :is="renderRootItem(item)"
          v-for="item in menuModel"
          :key="item.key"
        />
      </nav>
      <div class="flex-1 h-full"></div>
    </div>

    <!-- Right: Actions -->
    <div class="h-full center gap-sm md:gap-md py-xs">
      <button
        v-if="showSidebarToggle"
        type="button"
        class="header-icon-btn"
        @click="emit('toggleCollapse', $event)"
      >
        <Icons
          :name="sidebarCollapse ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
          class="color-inherit"
          size="2xl"
        />
      </button>
      <button
        v-if="!isMobileLayout"
        type="button"
        class="header-icon-btn"
        @click="toggleFullscreen()"
      >
        <Icons
          :name="
            isFullscreen
              ? 'i-solar-quit-full-screen-bold-duotone'
              : 'i-solar-full-screen-bold-duotone'
          "
          class="color-inherit"
          size="2xl"
        />
      </button>
      <button
        type="button"
        class="header-icon-btn"
        @click="emit('toggleTheme', $event)"
      >
        <Icons
          :name="isDark ? 'i-solar-moon-bold-duotone' : 'i-solar-sun-2-bold-duotone'"
          size="2xl"
          class="color-inherit"
        />
      </button>
      <User v-if="showUserEntry" />
    </div>
  </header>
</template>
