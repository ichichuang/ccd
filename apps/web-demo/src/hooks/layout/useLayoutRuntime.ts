import type { ComputedRef, Ref } from 'vue'
import {
  resolveLayoutRuntime,
  type LayoutRuntimeState,
  type SidebarState,
} from '@ccd/vue-app-platform'
import { useLayoutStore } from '@/stores/modules/system'
import { useDeviceStore } from '@/stores/modules/system'
import { useTimeoutFn } from '@vueuse/core'

export interface UseLayoutRuntimeReturn {
  state: ComputedRef<LayoutRuntimeState>
  deviceType: ComputedRef<LayoutRuntimeState['deviceType']>
  breakpoint: ComputedRef<LayoutRuntimeState['breakpoint']>
  orientation: ComputedRef<LayoutRuntimeState['orientation']>
  effectiveMode: ComputedRef<LayoutRuntimeState['effectiveMode']>
  sidebarMode: ComputedRef<LayoutRuntimeState['sidebarMode']>
  sidebarCollapsed: ComputedRef<boolean>
  sidebarVisible: ComputedRef<boolean>
  isMobile: ComputedRef<boolean>
  isTablet: ComputedRef<boolean>
  isDesktop: ComputedRef<boolean>
  useDrawer: ComputedRef<boolean>
  overlaySidebar: ComputedRef<boolean>
  showHeader: ComputedRef<boolean>
  showLogo: ComputedRef<boolean>
  showLogoText: ComputedRef<boolean>
  showMenu: ComputedRef<boolean>
  showTopMenu: ComputedRef<boolean>
  showSidebar: ComputedRef<boolean>
  showSidebarToggle: ComputedRef<boolean>
  showBreadcrumb: ComputedRef<boolean>
  showBreadcrumbIcon: ComputedRef<boolean>
  showTabs: ComputedRef<boolean>
  showFooter: ComputedRef<boolean>
  showFullscreenAction: ComputedRef<boolean>
  showHeaderThemeAction: ComputedRef<boolean>
  showCompactThemeAction: ComputedRef<boolean>
  drawerOpen: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  sidebarFixed: ComputedRef<boolean>
  headerFixed: ComputedRef<boolean>
  enableTransition: ComputedRef<boolean>
  safeAreaInsets: ComputedRef<LayoutRuntimeState['safeAreaInsets']>
  shellSafeAreaStyle: ComputedRef<Record<string, string>>
  drawerRootStyle: ComputedRef<Record<string, string>>
  drawerSafeAreaStyle: ComputedRef<Record<string, string>>
  stableModeKey: Ref<AdminLayoutMode>
  isResizeSettled: Ref<boolean>
  bodyTransitionName: ComputedRef<'animate__animated' | 'no-transition'>
  bodyTransitionStyle: ComputedRef<Record<string, string>>
  visualSidebarCollapsed: Ref<boolean>
  isSidebarAnimating: Ref<boolean>
  sidebarState: Ref<SidebarState>
  sidebarShellRef: Ref<HTMLElement | null>
  setDrawerOpen: (open: boolean) => void
  toggleDrawer: () => void
  closeTransientNavigation: () => void
  toggleSidebarCollapse: () => void
  onSidebarTransitionEnd: (event: TransitionEvent) => void
}

export function useLayoutRuntime(): UseLayoutRuntimeReturn {
  const layoutStore = useLayoutStore()
  const deviceStore = useDeviceStore()

  const state = computed<LayoutRuntimeState>(() =>
    resolveLayoutRuntime({
      deviceType: deviceStore.type,
      breakpoint: deviceStore.currentBreakpoint,
      width: deviceStore.width,
      height: deviceStore.height,
      orientation: deviceStore.orientation,
      pixelRatio: deviceStore.pixelRatio,
      preferredMode: layoutStore.preferredMode,
      sidebarCollapse: layoutStore.sidebarCollapse,
      visibilitySettings: layoutStore.visibilitySettings,
      mobileDrawerOpen: layoutStore.mobileDrawerOpen,
      isLoading: layoutStore.isLoading,
      showBreadcrumbIcon: layoutStore.showBreadcrumbIcon,
      sidebarFixed: layoutStore.sidebarFixed,
      headerFixed: layoutStore.headerFixed,
      enableTransition: layoutStore.enableTransition,
    })
  )

  const visualSidebarCollapsed = ref(layoutStore.sidebarCollapse)
  const isSidebarAnimating = ref(false)
  const sidebarState = ref<SidebarState>(layoutStore.sidebarCollapse ? 'collapsed' : 'expanded')
  const sidebarShellRef = ref<HTMLElement | null>(null)
  const isResizeSettled = ref(true)
  const stableModeKey = ref<AdminLayoutMode>(state.value.effectiveMode)
  let expandShellFrameId: number | null = null
  let expandShellCommitFrameId: number | null = null

  const { start: startResizeSettleTimer, stop: stopResizeSettleTimer } = useTimeoutFn(
    () => {
      isResizeSettled.value = true
    },
    200,
    { immediate: false }
  )

  const clearExpandShellFrames = (): void => {
    if (expandShellFrameId !== null) {
      window.cancelAnimationFrame(expandShellFrameId)
      expandShellFrameId = null
    }
    if (expandShellCommitFrameId !== null) {
      window.cancelAnimationFrame(expandShellCommitFrameId)
      expandShellCommitFrameId = null
    }
  }

  const syncSidebarRenderState = (collapsed: boolean): void => {
    clearExpandShellFrames()
    visualSidebarCollapsed.value = collapsed
    isSidebarAnimating.value = false
    sidebarState.value = collapsed ? 'collapsed' : 'expanded'
  }

  watch(
    () => layoutStore.sidebarCollapse,
    collapsed => {
      if (isSidebarAnimating.value) return
      syncSidebarRenderState(collapsed)
    }
  )

  watch(
    () => state.value.showSidebar,
    showSidebar => {
      if (showSidebar) return
      syncSidebarRenderState(layoutStore.sidebarCollapse)
    }
  )

  watch(
    () => [state.value.useDrawer, state.value.isLoading] as const,
    ([useDrawer, isLoading]) => {
      if (useDrawer && !isLoading) return
      closeTransientNavigation()
    },
    { immediate: true }
  )

  watch(
    () => deviceStore.isResizing,
    resizing => {
      if (resizing) {
        stopResizeSettleTimer()
        isResizeSettled.value = false
        return
      }
      startResizeSettleTimer()
    }
  )

  watch([() => state.value.effectiveMode, isResizeSettled], ([newMode, settled]) => {
    if (settled) {
      stableModeKey.value = newMode
    }
  })

  const setDrawerOpen = (open: boolean): void => {
    layoutStore.setMobileDrawerOpen(open)
  }

  const toggleDrawer = (): void => {
    layoutStore.toggleMobileDrawer()
  }

  function closeTransientNavigation(): void {
    if (layoutStore.mobileDrawerOpen) {
      layoutStore.setMobileDrawerOpen(false)
    }
  }

  const toggleSidebarCollapse = (): void => {
    const nextCollapsed = !layoutStore.sidebarCollapse
    const shouldAnimate = state.value.enableTransition && state.value.showSidebar

    layoutStore.toggleCollapse()

    if (!shouldAnimate) {
      syncSidebarRenderState(nextCollapsed)
      return
    }

    isSidebarAnimating.value = true

    if (nextCollapsed) {
      sidebarState.value = 'collapsing'
      nextTick(() => {
        visualSidebarCollapsed.value = true
      })
      return
    }

    sidebarState.value = 'expanding'
    visualSidebarCollapsed.value = false
  }

  const onSidebarTransitionEnd = (event: TransitionEvent): void => {
    if (event.target !== sidebarShellRef.value) return
    if (event.propertyName !== 'width' && event.propertyName !== 'inline-size') return
    if (sidebarState.value === 'collapsing') {
      visualSidebarCollapsed.value = true
      isSidebarAnimating.value = false
      sidebarState.value = 'collapsed'
      return
    }
    if (sidebarState.value === 'expanding') {
      visualSidebarCollapsed.value = false
      isSidebarAnimating.value = false
      sidebarState.value = 'expanded-shell'
      clearExpandShellFrames()
      expandShellFrameId = window.requestAnimationFrame(() => {
        expandShellFrameId = null
        if (sidebarState.value !== 'expanded-shell') return
        expandShellCommitFrameId = window.requestAnimationFrame(() => {
          expandShellCommitFrameId = null
          if (sidebarState.value !== 'expanded-shell') return
          sidebarState.value = 'expanded'
        })
      })
    }
  }

  onUnmounted(() => {
    clearExpandShellFrames()
    stopResizeSettleTimer()
  })

  return {
    state,
    deviceType: computed(() => state.value.deviceType),
    breakpoint: computed(() => state.value.breakpoint),
    orientation: computed(() => state.value.orientation),
    effectiveMode: computed(() => state.value.effectiveMode),
    sidebarMode: computed(() => state.value.sidebarMode),
    sidebarCollapsed: computed(() => state.value.sidebarCollapsed),
    sidebarVisible: computed(() => state.value.sidebarVisible),
    isMobile: computed(() => state.value.isMobile),
    isTablet: computed(() => state.value.isTablet),
    isDesktop: computed(() => state.value.isDesktop),
    useDrawer: computed(() => state.value.useDrawer),
    overlaySidebar: computed(() => state.value.overlaySidebar),
    showHeader: computed(() => state.value.showHeader),
    showLogo: computed(() => state.value.showLogo),
    showLogoText: computed(() => state.value.showLogoText),
    showMenu: computed(() => state.value.showMenu),
    showTopMenu: computed(() => state.value.showTopMenu),
    showSidebar: computed(() => state.value.showSidebar),
    showSidebarToggle: computed(() => state.value.showSidebarToggle),
    showBreadcrumb: computed(() => state.value.showBreadcrumb),
    showBreadcrumbIcon: computed(() => state.value.showBreadcrumbIcon),
    showTabs: computed(() => state.value.showTabs),
    showFooter: computed(() => state.value.showFooter),
    showFullscreenAction: computed(() => state.value.showFullscreenAction),
    showHeaderThemeAction: computed(() => state.value.showHeaderThemeAction),
    showCompactThemeAction: computed(() => state.value.showCompactThemeAction),
    drawerOpen: computed(() => state.value.drawerOpen),
    isLoading: computed(() => state.value.isLoading),
    sidebarFixed: computed(() => state.value.sidebarFixed),
    headerFixed: computed(() => state.value.headerFixed),
    enableTransition: computed(() => state.value.enableTransition),
    safeAreaInsets: computed(() => state.value.safeAreaInsets),
    shellSafeAreaStyle: computed(() => state.value.shellSafeAreaStyle),
    drawerRootStyle: computed(() => state.value.drawerRootStyle),
    drawerSafeAreaStyle: computed(() => state.value.drawerSafeAreaStyle),
    stableModeKey,
    isResizeSettled,
    bodyTransitionName: computed(() =>
      state.value.enableTransition && isResizeSettled.value ? 'animate__animated' : 'no-transition'
    ),
    bodyTransitionStyle: computed(() => ({
      '--animate-duration': 'var(--transition-md)',
    })),
    visualSidebarCollapsed,
    isSidebarAnimating,
    sidebarState,
    sidebarShellRef,
    setDrawerOpen,
    toggleDrawer,
    closeTransientNavigation,
    toggleSidebarCollapse,
    onSidebarTransitionEnd,
  }
}
