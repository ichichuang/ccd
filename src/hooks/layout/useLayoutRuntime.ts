import type { ComputedRef, Ref } from 'vue'
import {
  resolveLayoutRuntime,
  type LayoutRuntimeState,
  type SidebarAnimationPhase,
} from '@/layouts/runtime/layoutRuntime'
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
  actualSidebarCollapsed: Ref<boolean>
  isSidebarAnimating: Ref<boolean>
  sidebarAnimationPhase: Ref<SidebarAnimationPhase>
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
  const actualSidebarCollapsed = ref(layoutStore.sidebarCollapse)
  const isSidebarAnimating = ref(false)
  const sidebarAnimationPhase = ref<SidebarAnimationPhase>('idle')
  const sidebarShellRef = ref<HTMLElement | null>(null)
  const isResizeSettled = ref(true)
  const stableModeKey = ref<AdminLayoutMode>(state.value.effectiveMode)
  let pendingSidebarCollapsed: boolean | null = null

  const { start: startResizeSettleTimer, stop: stopResizeSettleTimer } = useTimeoutFn(
    () => {
      isResizeSettled.value = true
    },
    200,
    { immediate: false }
  )

  const commitSidebarMenuRender = (): void => {
    const collapsed = pendingSidebarCollapsed ?? layoutStore.sidebarCollapse
    visualSidebarCollapsed.value = collapsed
    actualSidebarCollapsed.value = collapsed
    isSidebarAnimating.value = false
    sidebarAnimationPhase.value = 'idle'
    pendingSidebarCollapsed = null
  }

  watch(
    () => layoutStore.sidebarCollapse,
    collapsed => {
      visualSidebarCollapsed.value = collapsed
      if (pendingSidebarCollapsed === null && !isSidebarAnimating.value) {
        actualSidebarCollapsed.value = collapsed
        sidebarAnimationPhase.value = 'idle'
      }
    }
  )

  watch(
    () => state.value.showSidebar,
    showSidebar => {
      if (showSidebar) return
      commitSidebarMenuRender()
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

    pendingSidebarCollapsed = shouldAnimate ? nextCollapsed : null
    isSidebarAnimating.value = shouldAnimate
    sidebarAnimationPhase.value = shouldAnimate
      ? nextCollapsed
        ? 'collapsing'
        : 'expanding'
      : 'idle'
    layoutStore.toggleCollapse()
    visualSidebarCollapsed.value = nextCollapsed

    if (!shouldAnimate) {
      commitSidebarMenuRender()
    }
  }

  const onSidebarTransitionEnd = (event: TransitionEvent): void => {
    if (event.target !== sidebarShellRef.value) return
    if (event.propertyName !== 'width' && event.propertyName !== 'inline-size') return
    if (pendingSidebarCollapsed === null) return
    commitSidebarMenuRender()
  }

  onUnmounted(() => {
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
    actualSidebarCollapsed,
    isSidebarAnimating,
    sidebarAnimationPhase,
    sidebarShellRef,
    setDrawerOpen,
    toggleDrawer,
    closeTransientNavigation,
    toggleSidebarCollapse,
    onSidebarTransitionEnd,
  }
}
