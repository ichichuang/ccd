import { BREAKPOINTS, type BreakpointKey } from '@/constants/breakpoints'
import type { DeviceType, Orientation } from '@/types/systems/device'

export type LayoutSidebarMode = 'hidden' | 'drawer' | 'inline' | 'overlay'
export type SidebarAnimationPhase = 'idle' | 'expanding' | 'collapsing'

export interface LayoutRuntimeDeviceInput {
  deviceType: DeviceType
  breakpoint: BreakpointKey
}

export interface LayoutRuntimeEffectiveModeInput extends LayoutRuntimeDeviceInput {
  preferredMode: AdminLayoutMode
}

export interface LayoutRuntimeInput extends LayoutRuntimeEffectiveModeInput {
  width: number
  height: number
  orientation: Orientation
  pixelRatio: number
  sidebarCollapse: boolean
  visibilitySettings: Record<AdminLayoutMode, LayoutVisibilitySetting>
  mobileDrawerOpen: boolean
  isLoading: boolean
  showBreadcrumbIcon: boolean
  sidebarFixed: boolean
  headerFixed: boolean
  enableTransition: boolean
}

export interface LayoutRuntimeDeviceFlags {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export interface LayoutRuntimeSafeAreaInsets {
  top: string
  bottom: string
  left: string
  right: string
}

export interface LayoutRuntimeState extends LayoutRuntimeDeviceFlags {
  deviceType: DeviceType
  breakpoint: BreakpointKey
  orientation: Orientation
  width: number
  height: number
  pixelRatio: number
  effectiveMode: AdminLayoutMode
  sidebarMode: LayoutSidebarMode
  sidebarCollapsed: boolean
  sidebarVisible: boolean
  useDrawer: boolean
  overlaySidebar: boolean
  showHeader: boolean
  showLogo: boolean
  showLogoText: boolean
  showMenu: boolean
  showTopMenu: boolean
  showSidebar: boolean
  showSidebarToggle: boolean
  showBreadcrumb: boolean
  showBreadcrumbIcon: boolean
  showTabs: boolean
  showFooter: boolean
  showFullscreenAction: boolean
  showHeaderThemeAction: boolean
  showCompactThemeAction: boolean
  drawerOpen: boolean
  isLoading: boolean
  sidebarFixed: boolean
  headerFixed: boolean
  enableTransition: boolean
  safeAreaInsets: LayoutRuntimeSafeAreaInsets
  shellSafeAreaStyle: Record<string, string>
  drawerRootStyle: Record<string, string>
  drawerSafeAreaStyle: Record<string, string>
}

const NARROW_BREAKPOINTS: readonly BreakpointKey[] = ['xs', 'sm', 'md', 'lg']

export const LAYOUT_SAFE_AREA_INSETS: LayoutRuntimeSafeAreaInsets = {
  top: 'var(--safe-top)',
  bottom: 'var(--safe-bottom)',
  left: 'var(--safe-left)',
  right: 'var(--safe-right)',
}

export const LAYOUT_SHELL_SAFE_AREA_STYLE: Record<string, string> = {
  paddingTop: LAYOUT_SAFE_AREA_INSETS.top,
  paddingRight: LAYOUT_SAFE_AREA_INSETS.right,
  paddingBottom: LAYOUT_SAFE_AREA_INSETS.bottom,
  paddingLeft: LAYOUT_SAFE_AREA_INSETS.left,
}

export const LAYOUT_DRAWER_SAFE_AREA_STYLE: Record<string, string> = {
  paddingTop: `calc(var(--spacing-md) + ${LAYOUT_SAFE_AREA_INSETS.top})`,
  paddingBottom: `calc(var(--spacing-md) + ${LAYOUT_SAFE_AREA_INSETS.bottom})`,
  paddingLeft: LAYOUT_SAFE_AREA_INSETS.left,
  paddingRight: LAYOUT_SAFE_AREA_INSETS.right,
}

export const LAYOUT_DRAWER_ROOT_STYLE: Record<string, string> = {
  width: 'min(var(--sidebar-width), 80vw)',
  maxWidth: '80vw',
}

export function isNarrowLayoutBreakpoint(breakpoint: BreakpointKey): boolean {
  return NARROW_BREAKPOINTS.includes(breakpoint)
}

export function resolveLayoutDeviceFlags(
  input: LayoutRuntimeDeviceInput
): LayoutRuntimeDeviceFlags {
  const narrow = isNarrowLayoutBreakpoint(input.breakpoint)

  return {
    isMobile: input.deviceType === 'Mobile' || narrow,
    isTablet: input.deviceType === 'Tablet' && !narrow,
    isDesktop: input.deviceType === 'PC' && !narrow,
  }
}

export function resolveLayoutEffectiveMode(
  input: LayoutRuntimeEffectiveModeInput
): AdminLayoutMode {
  if (input.deviceType === 'Mobile' || isNarrowLayoutBreakpoint(input.breakpoint)) {
    return 'horizontal'
  }

  if (input.deviceType === 'Tablet') {
    return 'vertical'
  }

  return input.preferredMode
}

export function resolveLayoutUseDrawer(
  input: Pick<LayoutRuntimeInput, 'deviceType' | 'width'>
): boolean {
  if (input.deviceType === 'Mobile') return true
  if (input.deviceType === 'Tablet') return input.width < BREAKPOINTS.md
  return false
}

export function resolveLayoutRuntime(input: LayoutRuntimeInput): LayoutRuntimeState {
  const flags = resolveLayoutDeviceFlags(input)
  const effectiveMode = resolveLayoutEffectiveMode(input)
  const useDrawer = resolveLayoutUseDrawer(input)
  const activeVisibility = input.visibilitySettings[effectiveMode]
  const showHeader = activeVisibility.showHeader
  const showMenu = activeVisibility.showMenu
  const showSidebar = activeVisibility.showSidebar && !useDrawer
  const showTopMenu = showMenu && !useDrawer
  const overlaySidebar = false
  const sidebarMode: LayoutSidebarMode = useDrawer
    ? 'drawer'
    : showSidebar
      ? overlaySidebar
        ? 'overlay'
        : 'inline'
      : 'hidden'

  return {
    ...flags,
    deviceType: input.deviceType,
    breakpoint: input.breakpoint,
    orientation: input.orientation,
    width: input.width,
    height: input.height,
    pixelRatio: input.pixelRatio,
    effectiveMode,
    sidebarMode,
    sidebarCollapsed: showSidebar ? input.sidebarCollapse : false,
    sidebarVisible: showSidebar,
    useDrawer,
    overlaySidebar,
    showHeader,
    showLogo: showHeader && activeVisibility.showLogo,
    showLogoText: input.deviceType === 'PC' && input.width >= BREAKPOINTS.lg,
    showMenu,
    showTopMenu,
    showSidebar,
    showSidebarToggle: showSidebar && (effectiveMode === 'vertical' || effectiveMode === 'mix'),
    showBreadcrumb:
      activeVisibility.showBreadcrumb && input.deviceType === 'PC' && input.width >= BREAKPOINTS.lg,
    showBreadcrumbIcon: input.showBreadcrumbIcon,
    showTabs: activeVisibility.showTabs,
    showFooter: activeVisibility.showFooter,
    showFullscreenAction: input.deviceType === 'PC',
    showHeaderThemeAction: input.width >= BREAKPOINTS.md,
    showCompactThemeAction: input.deviceType === 'Mobile',
    drawerOpen: useDrawer && input.mobileDrawerOpen && !input.isLoading,
    isLoading: input.isLoading,
    sidebarFixed: input.sidebarFixed,
    headerFixed: input.headerFixed,
    enableTransition: input.enableTransition,
    safeAreaInsets: LAYOUT_SAFE_AREA_INSETS,
    shellSafeAreaStyle: LAYOUT_SHELL_SAFE_AREA_STYLE,
    drawerRootStyle: LAYOUT_DRAWER_ROOT_STYLE,
    drawerSafeAreaStyle: LAYOUT_DRAWER_SAFE_AREA_STYLE,
  }
}
