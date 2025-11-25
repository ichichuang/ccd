import {
  DEFAULT_CONFIG,
  DEFAULT_SIZE_MAX_LIMITS,
  LAYOUT_SIZE_CONFIG,
  type SizeMaxLimits,
} from '@/constants/modules/layout'
import { getDeviceLayoutSizeRatios, getDeviceType } from '@/utils/modules/remHelpers'

let globalSizeMaxLimits: SizeMaxLimits = { ...DEFAULT_SIZE_MAX_LIMITS }

export const setSizeMaxLimits = (limits: Partial<SizeMaxLimits>) => {
  globalSizeMaxLimits = { ...globalSizeMaxLimits, ...limits }
}

export const getSizeMaxLimits = (): SizeMaxLimits => {
  if (typeof window === 'undefined') {
    return { ...globalSizeMaxLimits }
  }

  try {
    const width = window.innerWidth
    const deviceType = getDeviceType(width)
    const ratios = getDeviceLayoutSizeRatios(deviceType)

    return {
      sidebarWidth: Math.round(globalSizeMaxLimits.sidebarWidth * ratios.sidebarWidth),
      sidebarCollapsedWidth: Math.round(
        globalSizeMaxLimits.sidebarCollapsedWidth * ratios.sidebarWidth
      ),
      headerHeight: Math.round(globalSizeMaxLimits.headerHeight * ratios.headerHeight),
      breadcrumbHeight: Math.round(globalSizeMaxLimits.breadcrumbHeight * ratios.breadcrumbHeight),
      footerHeight: Math.round(globalSizeMaxLimits.footerHeight * ratios.footerHeight),
      tabsHeight: Math.round(globalSizeMaxLimits.tabsHeight * ratios.tabsHeight),
      gap: Math.round(globalSizeMaxLimits.gap * ratios.gap),
    }
  } catch (error) {
    console.error('Failed to get size max limits:', error)
    return { ...globalSizeMaxLimits }
  }
}

export const resetSizeMaxLimits = () => {
  globalSizeMaxLimits = { ...DEFAULT_SIZE_MAX_LIMITS }
}

const applyMaxLimit = (value: number, maxValue: number): number => {
  return Math.min(value, maxValue)
}

const getCurrentWindowSize = () => {
  return {
    width: Math.max(
      DEFAULT_CONFIG.windowSize.minWidth,
      Math.min(window.innerWidth, DEFAULT_CONFIG.windowSize.maxWidth)
    ),
    height: Math.max(
      DEFAULT_CONFIG.windowSize.minHeight,
      Math.min(window.innerHeight, DEFAULT_CONFIG.windowSize.maxHeight)
    ),
  }
}

const getDeviceRatios = (width: number) => {
  const defaultRatios = {
    sidebarWidth: 1,
    headerHeight: 1,
    footerHeight: 1,
    breadcrumbHeight: 1,
    tabsHeight: 1,
    gap: 1,
  }

  try {
    const deviceType = getDeviceType(width)
    return getDeviceLayoutSizeRatios(deviceType) || defaultRatios
  } catch (error) {
    console.error('Failed to get device layout ratios:', error)
    return defaultRatios
  }
}

export const createCompactSizes = (): Layout => {
  const { width, height } = getCurrentWindowSize()
  const maxLimits = getSizeMaxLimits()
  const ratios = getDeviceRatios(width)
  const config = LAYOUT_SIZE_CONFIG.compact

  return {
    sidebarWidth: applyMaxLimit(
      Math.max(
        config.sidebarWidth.min * ratios.sidebarWidth,
        Math.min(
          width * config.sidebarWidth.ratio * ratios.sidebarWidth,
          config.sidebarWidth.max * ratios.sidebarWidth
        )
      ),
      maxLimits.sidebarWidth
    ),
    sidebarCollapsedWidth: applyMaxLimit(
      Math.min(
        Math.max(
          config.sidebarCollapsedWidth.min * ratios.sidebarWidth,
          width * config.sidebarCollapsedWidth.ratio * ratios.sidebarWidth
        ),
        config.sidebarCollapsedWidth.max * ratios.sidebarWidth
      ),
      maxLimits.sidebarCollapsedWidth
    ),
    headerHeight: applyMaxLimit(
      Math.max(
        config.headerHeight.min * ratios.headerHeight,
        Math.min(
          height * config.headerHeight.ratio * ratios.headerHeight,
          config.headerHeight.max * ratios.headerHeight
        )
      ),
      maxLimits.headerHeight
    ),
    breadcrumbHeight: applyMaxLimit(
      Math.max(
        config.breadcrumbHeight.min * ratios.breadcrumbHeight,
        Math.min(
          height * config.breadcrumbHeight.ratio * ratios.breadcrumbHeight,
          config.breadcrumbHeight.max * ratios.breadcrumbHeight
        )
      ),
      maxLimits.breadcrumbHeight
    ),
    footerHeight: applyMaxLimit(config.footerHeight * ratios.footerHeight, maxLimits.footerHeight),
    tabsHeight: applyMaxLimit(
      Math.max(
        config.tabsHeight.min * ratios.tabsHeight,
        Math.min(
          height * config.tabsHeight.ratio * ratios.tabsHeight,
          config.tabsHeight.max * ratios.tabsHeight
        )
      ),
      maxLimits.tabsHeight
    ),
    contentHeight: 0,
    contentsHeight: 0,
    contentsBreadcrumbHeight: 0,
    contentsTabsHeight: 0,
    contentBreadcrumbHeight: 0,
    contentTabsHeight: 0,
    gap: applyMaxLimit(config.gap * ratios.gap, maxLimits.gap),
  }
}

export const createComfortableSizes = (): Layout => {
  const { width, height } = getCurrentWindowSize()
  const maxLimits = getSizeMaxLimits()
  const ratios = getDeviceRatios(width)
  const config = LAYOUT_SIZE_CONFIG.comfortable

  return {
    sidebarWidth: applyMaxLimit(
      Math.max(
        config.sidebarWidth.min * ratios.sidebarWidth,
        Math.min(
          width * config.sidebarWidth.ratio * ratios.sidebarWidth,
          config.sidebarWidth.max * ratios.sidebarWidth
        )
      ),
      maxLimits.sidebarWidth
    ),
    sidebarCollapsedWidth: applyMaxLimit(
      Math.min(
        Math.max(
          config.sidebarCollapsedWidth.min * ratios.sidebarWidth,
          width * config.sidebarCollapsedWidth.ratio * ratios.sidebarWidth
        ),
        config.sidebarCollapsedWidth.max * ratios.sidebarWidth
      ),
      maxLimits.sidebarCollapsedWidth
    ),
    headerHeight: applyMaxLimit(
      Math.max(
        config.headerHeight.min * ratios.headerHeight,
        Math.min(
          height * config.headerHeight.ratio * ratios.headerHeight,
          config.headerHeight.max * ratios.headerHeight
        )
      ),
      maxLimits.headerHeight
    ),
    breadcrumbHeight: applyMaxLimit(
      Math.max(
        config.breadcrumbHeight.min * ratios.breadcrumbHeight,
        Math.min(
          height * config.breadcrumbHeight.ratio * ratios.breadcrumbHeight,
          config.breadcrumbHeight.max * ratios.breadcrumbHeight
        )
      ),
      maxLimits.breadcrumbHeight
    ),
    footerHeight: applyMaxLimit(config.footerHeight * ratios.footerHeight, maxLimits.footerHeight),
    tabsHeight: applyMaxLimit(
      Math.max(
        config.tabsHeight.min * ratios.tabsHeight,
        Math.min(
          height * config.tabsHeight.ratio * ratios.tabsHeight,
          config.tabsHeight.max * ratios.tabsHeight
        )
      ),
      maxLimits.tabsHeight
    ),
    contentHeight: 0,
    contentsHeight: 0,
    contentsBreadcrumbHeight: 0,
    contentsTabsHeight: 0,
    contentBreadcrumbHeight: 0,
    contentTabsHeight: 0,
    gap: applyMaxLimit(config.gap * ratios.gap, maxLimits.gap),
  }
}

export const createLooseSizes = (): Layout => {
  const { width, height } = getCurrentWindowSize()
  const maxLimits = getSizeMaxLimits()
  const ratios = getDeviceRatios(width)
  const config = LAYOUT_SIZE_CONFIG.loose

  return {
    sidebarWidth: applyMaxLimit(
      Math.max(
        config.sidebarWidth.min * ratios.sidebarWidth,
        Math.min(
          width * config.sidebarWidth.ratio * ratios.sidebarWidth,
          config.sidebarWidth.max * ratios.sidebarWidth
        )
      ),
      maxLimits.sidebarWidth
    ),
    sidebarCollapsedWidth: applyMaxLimit(
      Math.min(
        Math.max(
          config.sidebarCollapsedWidth.min * ratios.sidebarWidth,
          width * config.sidebarCollapsedWidth.ratio * ratios.sidebarWidth
        ),
        config.sidebarCollapsedWidth.max * ratios.sidebarWidth
      ),
      maxLimits.sidebarCollapsedWidth
    ),
    headerHeight: applyMaxLimit(
      Math.max(
        config.headerHeight.min * ratios.headerHeight,
        Math.min(
          height * config.headerHeight.ratio * ratios.headerHeight,
          config.headerHeight.max * ratios.headerHeight
        )
      ),
      maxLimits.headerHeight
    ),
    breadcrumbHeight: applyMaxLimit(
      Math.max(
        config.breadcrumbHeight.min * ratios.breadcrumbHeight,
        Math.min(
          height * config.breadcrumbHeight.ratio * ratios.breadcrumbHeight,
          config.breadcrumbHeight.max * ratios.breadcrumbHeight
        )
      ),
      maxLimits.breadcrumbHeight
    ),
    footerHeight: applyMaxLimit(config.footerHeight * ratios.footerHeight, maxLimits.footerHeight),
    tabsHeight: applyMaxLimit(
      Math.max(
        config.tabsHeight.min * ratios.tabsHeight,
        Math.min(
          height * config.tabsHeight.ratio * ratios.tabsHeight,
          config.tabsHeight.max * ratios.tabsHeight
        )
      ),
      maxLimits.tabsHeight
    ),
    contentHeight: 0,
    contentsHeight: 0,
    contentsBreadcrumbHeight: 0,
    contentsTabsHeight: 0,
    contentBreadcrumbHeight: 0,
    contentTabsHeight: 0,
    gap: applyMaxLimit(config.gap * ratios.gap, maxLimits.gap),
  }
}

export const compactSizes: Layout = createCompactSizes()
export const comfortableSizes: Layout = createComfortableSizes()
export const looseSizes: Layout = createLooseSizes()

export const sizePresetsMap: Record<Size, () => Layout> = {
  compact: createCompactSizes,
  comfortable: createComfortableSizes,
  loose: createLooseSizes,
}
