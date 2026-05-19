// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type AdminMode = 'vertical' | 'horizontal' | 'mix'
type SidebarMode = 'inline' | 'drawer' | 'hidden'

interface LayoutRuntimeState {
  effectiveMode: AdminMode
  sidebarMode: SidebarMode
  sidebarVisible: boolean
  useDrawer: boolean
  drawerOpen: boolean
  showHeader: boolean
}

type MockFn = ReturnType<typeof vi.fn>

interface LayoutStateMock {
  runtime: LayoutRuntimeState
  closeTransientNavigation: MockFn
  migrateLegacyVisibilityIfNeeded: MockFn
  openDialog: MockFn
  refreshCurrentRoute: MockFn
  toggleThemeWithAnimation: MockFn
}

const layoutState = vi.hoisted<LayoutStateMock>(() => ({
  runtime: {
    effectiveMode: 'vertical',
    sidebarMode: 'inline',
    sidebarVisible: true,
    useDrawer: false,
    drawerOpen: false,
    showHeader: true,
  },
  closeTransientNavigation: vi.fn(),
  migrateLegacyVisibilityIfNeeded: vi.fn(),
  openDialog: vi.fn(),
  refreshCurrentRoute: vi.fn(),
  toggleThemeWithAnimation: vi.fn(),
}))

function stubComponent(name: string) {
  return defineComponent({
    name,
    setup(_props, { slots }) {
      return () => h('div', { [`data-testid`]: name }, slots.default?.())
    },
  })
}

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('vue-router', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    useRoute: () => vue.reactive({ path: '/dashboard' }),
  }
})

vi.mock('primevue/drawer', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  const extractSlots = (slots: Record<string, unknown>): Record<string, () => unknown> => {
    const jsxSlots = slots['v-slots']
    return jsxSlots && typeof jsxSlots === 'object'
      ? (jsxSlots as Record<string, () => unknown>)
      : {}
  }
  return {
    default: vue.defineComponent({
      name: 'MockDrawer',
      props: {
        visible: { type: Boolean, default: false },
      },
      setup(props, { slots }) {
        return () => {
          const drawerSlots = extractSlots(slots)
          return props.visible
            ? vue.h(
                'aside',
                { class: 'mock-drawer' },
                (drawerSlots.container?.() ??
                  slots.default?.() ??
                  vue.h('div', { 'data-layout-drawer': 'true' })) as ReturnType<typeof vue.h>
              )
            : null
        }
      },
    }),
  }
})

vi.mock('@&/AppContainer.vue', () => ({ default: stubComponent('AppContainer') }))
vi.mock('@/layouts/components/ContextMenuProvider.vue', () => ({
  default: defineComponent({
    name: 'ContextMenuProvider',
    props: {
      scope: { type: String, required: true },
      beforeOpen: { type: Function, required: true },
    },
    setup(_props, { slots }) {
      return () => h('div', { 'data-testid': 'ContextMenuProvider' }, slots.default?.())
    },
  }),
}))
vi.mock('@/layouts/components/GlobalSetting/SettingsContent.vue', () => ({
  default: stubComponent('SettingsContent'),
}))
vi.mock('@&/admin/AdminHeader.vue', () => ({ default: stubComponent('AdminHeader') }))
vi.mock('@&/admin/AdminSidebar.tsx', () => ({ default: stubComponent('AdminSidebar') }))
vi.mock('@&/admin/AdminBreadcrumbBar.vue', () => ({
  default: stubComponent('AdminBreadcrumbBar'),
}))
vi.mock('@&/admin/AdminTabsBar.tsx', () => ({ default: stubComponent('AdminTabsBar') }))
vi.mock('@&/admin/AdminFooterBar.tsx', () => ({ default: stubComponent('AdminFooterBar') }))
vi.mock('@/layouts/components/admin/AdminSidebarLogo', () => ({
  default: stubComponent('AdminSidebarLogo'),
}))
vi.mock('@/layouts/components/admin/AdminSidebarMenu', () => ({
  default: stubComponent('AdminSidebarMenu'),
}))
vi.mock('@/components/Icons', () => ({ Icons: stubComponent('Icons') }))
vi.mock('@/components/CScrollbar', () => ({ CScrollbar: stubComponent('CScrollbar') }))

vi.mock('@/stores/modules/system', () => ({
  useLayoutStore: () => ({
    migrateLegacyVisibilityIfNeeded: layoutState.migrateLegacyVisibilityIfNeeded,
  }),
}))

vi.mock('@/hooks/modules/useDateUtils', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    useDateUtils: () => ({
      isInitialized: vue.ref(true),
      getAvailableTimezones: () => [
        {
          name: 'Asia/Shanghai',
          countryCode: 'CN',
          currentTimeOffsetInMinutes: 480,
        },
      ],
    }),
  }
})

vi.mock('@/hooks/modules/useThemeSwitch', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    useThemeSwitch: () => ({
      isDark: vue.ref(false),
      isAnimating: vue.ref(false),
      toggleThemeWithAnimation: layoutState.toggleThemeWithAnimation,
    }),
  }
})

vi.mock('@/hooks/modules/useDialog', () => ({
  useDialog: () => ({ openDialog: layoutState.openDialog }),
}))

vi.mock('@/router/utils/helper', () => ({
  refreshCurrentRoute: layoutState.refreshCurrentRoute,
}))

vi.mock('@/hooks/layout/useLayoutRuntime', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    useLayoutRuntime: () => ({
      effectiveMode: vue.ref(layoutState.runtime.effectiveMode),
      sidebarMode: vue.ref(layoutState.runtime.sidebarMode),
      sidebarVisible: vue.ref(layoutState.runtime.sidebarVisible),
      useDrawer: vue.ref(layoutState.runtime.useDrawer),
      drawerOpen: vue.ref(layoutState.runtime.drawerOpen),
      showHeader: vue.ref(layoutState.runtime.showHeader),
      isSidebarAnimating: vue.ref(false),
      showBreadcrumb: vue.ref(true),
      showBreadcrumbIcon: vue.ref(true),
      showTabs: vue.ref(true),
      showFooter: vue.ref(true),
      visualSidebarCollapsed: vue.ref(false),
      enableTransition: vue.ref(false),
      showSidebar: vue.ref(true),
      sidebarFixed: vue.ref(true),
      sidebarState: vue.ref('expanded'),
      bodyTransitionName: vue.ref('none'),
      bodyTransitionStyle: vue.ref({}),
      stableModeKey: vue.ref(layoutState.runtime.effectiveMode),
      showLogo: vue.ref(true),
      showLogoText: vue.ref(true),
      showMenu: vue.ref(true),
      showTopMenu: vue.ref(false),
      showFullscreenAction: vue.ref(true),
      showHeaderThemeAction: vue.ref(true),
      showCompactThemeAction: vue.ref(true),
      headerFixed: vue.ref(true),
      showSidebarToggle: vue.ref(true),
      sidebarCollapsed: vue.ref(false),
      isLoading: vue.ref(false),
      shellSafeAreaStyle: vue.ref({}),
      sidebarShellRef: vue.ref<HTMLElement | null>(null),
      drawerRootStyle: vue.ref({}),
      drawerSafeAreaStyle: vue.ref({}),
      onSidebarTransitionEnd: vi.fn(),
      closeTransientNavigation: layoutState.closeTransientNavigation,
      setDrawerOpen: vi.fn(),
      toggleDrawer: vi.fn(),
      toggleSidebarCollapse: vi.fn(),
    }),
  }
})

async function mountLayoutAdmin() {
  const mod = await import('./LayoutAdmin')
  const wrapper = mount(mod.default, {
    global: {
      stubs: {
        Transition: false,
      },
    },
  })
  await nextTick()
  return wrapper
}

describe('LayoutAdmin shell contract', () => {
  beforeEach(() => {
    layoutState.runtime = {
      effectiveMode: 'vertical',
      sidebarMode: 'inline',
      sidebarVisible: true,
      useDrawer: false,
      drawerOpen: false,
      showHeader: true,
    }
    layoutState.closeTransientNavigation.mockClear()
    layoutState.migrateLegacyVisibilityIfNeeded.mockClear()
  })

  it('renders the admin shell with header, sidebar, and content in vertical mode', async () => {
    const wrapper = await mountLayoutAdmin()

    expect(wrapper.get('[data-layout-shell="admin"]').attributes()).toMatchObject({
      'data-layout-mode': 'vertical',
      'data-sidebar-mode': 'inline',
      'data-drawer-mode': 'false',
    })
    expect(wrapper.find('[data-layout-header="true"]').exists()).toBe(true)
    expect(wrapper.find('[data-layout-sidebar="true"]').exists()).toBe(true)
    expect(wrapper.find('[data-layout-content="true"]').exists()).toBe(true)
    expect(layoutState.migrateLegacyVisibilityIfNeeded).toHaveBeenCalledTimes(1)
  })

  it('omits the inline sidebar in horizontal mode', async () => {
    layoutState.runtime = {
      effectiveMode: 'horizontal',
      sidebarMode: 'hidden',
      sidebarVisible: false,
      useDrawer: false,
      drawerOpen: false,
      showHeader: true,
    }

    const wrapper = await mountLayoutAdmin()

    expect(wrapper.get('[data-layout-shell="admin"]').attributes('data-layout-mode')).toBe(
      'horizontal'
    )
    expect(wrapper.find('[data-layout-sidebar="true"]').exists()).toBe(false)
    expect(wrapper.find('[data-layout-content="true"]').exists()).toBe(true)
  })

  it('renders drawer navigation only when drawer mode is active and open', async () => {
    layoutState.runtime = {
      effectiveMode: 'vertical',
      sidebarMode: 'drawer',
      sidebarVisible: false,
      useDrawer: true,
      drawerOpen: true,
      showHeader: true,
    }

    const wrapper = await mountLayoutAdmin()

    expect(wrapper.get('[data-layout-shell="admin"]').attributes('data-drawer-mode')).toBe('true')
    expect(wrapper.find('[data-layout-sidebar="true"]').exists()).toBe(false)
    expect(wrapper.find('[data-layout-drawer="true"]').exists()).toBe(true)
  })
})
