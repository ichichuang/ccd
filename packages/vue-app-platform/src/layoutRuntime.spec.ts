import { describe, expect, it } from 'vitest'
import {
  LAYOUT_SAFE_AREA_INSETS,
  resolveLayoutEffectiveMode,
  resolveLayoutRuntime,
  resolveLayoutUseDrawer,
  type AdminLayoutMode,
  type LayoutRuntimeInput,
  type LayoutVisibilitySetting,
} from './layoutRuntime'

const DEFAULT_LAYOUT_VISIBILITY_SETTINGS: Record<AdminLayoutMode, LayoutVisibilitySetting> = {
  vertical: {
    showHeader: true,
    showMenu: false,
    showSidebar: true,
    showBreadcrumb: true,
    showBreadcrumbIcon: true,
    showTabs: true,
    showFooter: true,
    showLogo: true,
  },
  horizontal: {
    showHeader: true,
    showMenu: true,
    showSidebar: false,
    showBreadcrumb: true,
    showBreadcrumbIcon: true,
    showTabs: true,
    showFooter: true,
    showLogo: true,
  },
  mix: {
    showHeader: true,
    showMenu: true,
    showSidebar: true,
    showBreadcrumb: true,
    showBreadcrumbIcon: true,
    showTabs: true,
    showFooter: true,
    showLogo: true,
  },
}

const baseInput = {
  deviceType: 'PC',
  breakpoint: 'xl',
  width: 1440,
  height: 960,
  orientation: 'horizontal',
  pixelRatio: 1,
  preferredMode: 'vertical',
  sidebarCollapse: false,
  visibilitySettings: DEFAULT_LAYOUT_VISIBILITY_SETTINGS,
  mobileDrawerOpen: false,
  isLoading: false,
  showBreadcrumbIcon: true,
  sidebarFixed: true,
  headerFixed: true,
  enableTransition: true,
} satisfies LayoutRuntimeInput

describe('layout runtime resolver', () => {
  it('keeps desktop in preferred inline sidebar mode', () => {
    const runtime = resolveLayoutRuntime(baseInput)

    expect(runtime.deviceType).toBe('PC')
    expect(runtime.effectiveMode).toBe('vertical')
    expect(runtime.useDrawer).toBe(false)
    expect(runtime.sidebarMode).toBe('inline')
    expect(runtime.sidebarVisible).toBe(true)
    expect(runtime.showSidebar).toBe(true)
    expect(runtime.showTopMenu).toBe(false)
  })

  it('forces phone layout to drawer mode without inline sidebar spacing', () => {
    const runtime = resolveLayoutRuntime({
      ...baseInput,
      deviceType: 'Mobile',
      breakpoint: 'xs',
      width: 390,
      height: 844,
      orientation: 'vertical',
      mobileDrawerOpen: true,
    })

    expect(runtime.effectiveMode).toBe('horizontal')
    expect(runtime.useDrawer).toBe(true)
    expect(runtime.sidebarMode).toBe('drawer')
    expect(runtime.sidebarVisible).toBe(false)
    expect(runtime.showSidebar).toBe(false)
    expect(runtime.showTopMenu).toBe(false)
    expect(runtime.drawerOpen).toBe(true)
  })

  it('keeps iPadOS wide tablet out of drawer while suppressing phantom sidebar', () => {
    const runtime = resolveLayoutRuntime({
      ...baseInput,
      deviceType: 'Tablet',
      breakpoint: 'md',
      width: 820,
      height: 1180,
      orientation: 'vertical',
      preferredMode: 'mix',
      mobileDrawerOpen: true,
    })

    expect(runtime.effectiveMode).toBe('horizontal')
    expect(runtime.useDrawer).toBe(false)
    expect(runtime.sidebarMode).toBe('hidden')
    expect(runtime.sidebarVisible).toBe(false)
    expect(runtime.drawerOpen).toBe(false)
  })

  it('uses drawer only for tablet split view below md', () => {
    expect(resolveLayoutUseDrawer({ deviceType: 'Tablet', width: 600 })).toBe(true)
    expect(resolveLayoutUseDrawer({ deviceType: 'Tablet', width: 820 })).toBe(false)
    expect(resolveLayoutUseDrawer({ deviceType: 'PC', width: 600 })).toBe(false)
  })

  it('does not mutate persisted collapse preference when sidebar is hidden', () => {
    const runtime = resolveLayoutRuntime({
      ...baseInput,
      breakpoint: 'sm',
      width: 640,
      sidebarCollapse: true,
    })

    expect(runtime.effectiveMode).toBe('horizontal')
    expect(runtime.sidebarMode).toBe('hidden')
    expect(runtime.sidebarCollapsed).toBe(false)
  })

  it('blocks drawer reopening while runtime loading is active', () => {
    const runtime = resolveLayoutRuntime({
      ...baseInput,
      deviceType: 'Mobile',
      breakpoint: 'xs',
      width: 390,
      height: 844,
      mobileDrawerOpen: true,
      isLoading: true,
    })

    expect(runtime.useDrawer).toBe(true)
    expect(runtime.drawerOpen).toBe(false)
  })

  it('exposes centralized safe area variables for shell and drawer renderers', () => {
    const runtime = resolveLayoutRuntime(baseInput)

    expect(runtime.safeAreaInsets).toEqual(LAYOUT_SAFE_AREA_INSETS)
    expect(runtime.shellSafeAreaStyle).toMatchObject({
      paddingTop: 'var(--safe-top)',
      paddingRight: 'var(--safe-right)',
      paddingBottom: 'var(--safe-bottom)',
      paddingLeft: 'var(--safe-left)',
    })
    expect(runtime.drawerRootStyle).toMatchObject({
      width: 'min(var(--sidebar-width), 80vw)',
      maxWidth: '80vw',
    })
    expect(runtime.drawerSafeAreaStyle).toMatchObject({
      paddingTop: 'calc(var(--spacing-md) + var(--safe-top))',
      paddingBottom: 'calc(var(--spacing-md) + var(--safe-bottom))',
      paddingLeft: 'var(--safe-left)',
      paddingRight: 'var(--safe-right)',
    })
  })

  it('resolves effective mode from device and breakpoint only in the runtime resolver', () => {
    expect(
      resolveLayoutEffectiveMode({
        deviceType: 'Mobile',
        breakpoint: 'xl',
        preferredMode: 'mix',
      })
    ).toBe('horizontal')
    expect(
      resolveLayoutEffectiveMode({
        deviceType: 'Tablet',
        breakpoint: 'xl',
        preferredMode: 'horizontal',
      })
    ).toBe('vertical')
    expect(
      resolveLayoutEffectiveMode({
        deviceType: 'PC',
        breakpoint: 'xl',
        preferredMode: 'mix',
      })
    ).toBe('mix')
  })
})
