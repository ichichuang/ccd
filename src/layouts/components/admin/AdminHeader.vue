<script setup lang="tsx">
import TieredMenu from 'primevue/tieredmenu'
import { Icons } from '@/components/Icons'
import User from '@/layouts/components/User/index.vue'
import { brand } from '@/constants/brand'
import { AUTH_ENABLED } from '@/constants/router'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFullscreen } from '@vueuse/core'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { storeToRefs } from 'pinia'
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

withDefaults(
  defineProps<{
    mode: AdminLayoutMode
    showHeader: boolean
    showLogo: boolean
    /** 是否显示 Logo 文字区域（副标题在 AdminHeader 内用 max-xl:hidden 控制） */
    showLogoText?: boolean
    showMenu: boolean
    /** 顶栏菜单是否显示（horizontal/mix 且非 Drawer 模式） */
    showTopMenuEffective: boolean
    /** 是否显示抽屉触发按钮（仅 Mobile 设备） */
    showDrawerTrigger: boolean
    headerFixed: boolean
    isDark: boolean
    isAnimating: boolean
    showSidebarToggle: boolean
    sidebarCollapse: boolean
  }>(),
  { showLogoText: true }
)

const emit = defineEmits<{
  toggleTheme: [event: MouseEvent]
  toggleCollapse: [event: MouseEvent]
}>()

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
const deviceStore = useDeviceStore()
const layoutStore = useLayoutStore()
const themeSwitch = useThemeSwitch()
const { isMobileTerminal: isMobile } = storeToRefs(deviceStore)

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const userRoles = computed(() => userStore.getUserRoles || [])
const userPermissions = computed(() => userStore.getUserPermissions || [])
const isLogin = computed(() => userStore.getIsLogin)
const showUserEntry = computed(() => AUTH_ENABLED && isLogin.value)

// --- Menu Logic ---
const topContentRef = ref<HTMLElement | null>(null)
const { width: topContentWidth } = useAppElementSize(topContentRef, undefined, {
  mode: 'throttle',
  delay: 200,
})
const menuModel = computed(() => {
  const tree = getAdminMenuTree()
  const authorizedTree = getAuthorizedMenuTree(userRoles.value, userPermissions.value, tree)
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

  const linkClass = [getMenuItemBase('header'), MENU_TEXT_WEIGHT, 'mx-xs', stateClasses]
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
      <span class={`truncate text-current! ${MENU_TEXT_CLASS} font-medium pt-px`}>
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
            const linkUrlVal = item.route?.meta?.linkUrl
            const extUrl: string =
              (typeof linkUrlVal === 'string' ? linkUrlVal : undefined) || item.route!.path
            const routeNameStr: string =
              typeof item.route?.name === 'string' ? item.route.name : (item.route?.path ?? '')

            return (
              <a
                href={isExtLink ? extUrl : href}
                class={linkClass}
                role="menuitem"
                aria-haspopup={undefined}
                aria-expanded={undefined}
                onClick={(e: MouseEvent) => {
                  e.preventDefault()
                  goToRoute(routeNameStr, undefined, undefined, false)
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
          model={item.items ?? []}
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
      'w-full h-headerHeight row-between py-sm transition-all duration-md gap-md select-none',
    ]"
    @dragstart.prevent
  >
    <!-- Left: Mobile Menu + Logo -->
    <div class="h-full center gap-sm">
      <!-- State 1 only: 抽屉触发按钮（由 LayoutAdmin 传入 showDrawerTrigger） -->
      <button
        v-if="showDrawerTrigger"
        type="button"
        class="interactive-card border-none outline-none p-xs sm:p-sm center"
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
        class="h-full center gap-xs md:gap-sm cursor-pointer"
        @click.prevent="goToRoute('/')"
      >
        <div class="h-full size-1-1 rounded-full center shrink-0">
          <img
            class="layout-full"
            :src="logoSrc"
            draggable="false"
          />
        </div>
        <div
          v-if="showLogoText"
          class="h-full col-stretch relative"
        >
          <span class="text-xl font-bold">
            {{ brand.displayName }}
          </span>
          <span class="text-xs text-muted-foreground font-medium absolute bottom-0">
            {{ brand.subtitle }}
          </span>
        </div>
      </a>
    </div>

    <!-- Middle: Top Menu — 显隐由 LayoutAdmin 的 showTopMenuEffective 控制 -->
    <div
      ref="topContentRef"
      class="flex-1 h-full min-w-0 overflow-hidden"
    >
      <div
        v-if="showTopMenuEffective"
        :key="mode"
        class="layout-full"
        :style="{ width: `${topContentWidth}px` }"
      >
        <CScrollbar
          :options="{
            scrollbars: {
              visibility: 'hidden',
            },
            overflow: {
              y: 'hidden',
            },
          }"
        >
          <div class="layout-full row-between gap-md">
            <nav
              v-if="showTopMenuEffective"
              class="min-w-0 flex items-center"
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
        </CScrollbar>
      </div>
    </div>

    <!-- Right: Actions (fullscreen max-lg:hidden, theme max-md:hidden for responsive graceful degradation) -->
    <div class="h-full center gap-sm">
      <button
        v-if="showSidebarToggle"
        type="button"
        class="cursor-pointer material-elevated border-none outline-none duration-sm center ring-1 ring-border p-sm"
        @click="emit('toggleCollapse', $event)"
      >
        <Icons
          :name="sidebarCollapse ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
          size="lg"
        />
      </button>
      <button
        v-if="deviceStore.type === 'PC'"
        type="button"
        class="max-lg:hidden cursor-pointer material-elevated border-none outline-none duration-sm center ring-1 ring-border p-sm"
        @click="toggleFullscreen()"
      >
        <Icons
          :name="
            isFullscreen
              ? 'i-solar-quit-full-screen-bold-duotone'
              : 'i-solar-full-screen-bold-duotone'
          "
          size="lg"
        />
      </button>
      <button
        type="button"
        class="max-md:hidden cursor-pointer material-elevated border-none outline-none duration-sm center ring-1 ring-border p-sm"
        @click="emit('toggleTheme', $event)"
      >
        <Icons
          :name="isDark ? 'i-solar-moon-bold-duotone' : 'i-solar-sun-2-bold-duotone'"
          size="lg"
        />
      </button>
      <button
        v-if="isMobile && showUserEntry"
        type="button"
        class="cursor-pointer material-elevated border-none outline-none duration-sm center ring-1 ring-border p-sm"
        @click="themeSwitch.toggleThemeWithAnimation($event)"
      >
        <Icons
          :name="isDark ? 'i-solar-moon-bold-duotone' : 'i-solar-sun-2-bold-duotone'"
          size="lg"
        />
      </button>
      <User v-if="showUserEntry" />
    </div>
  </header>
</template>
