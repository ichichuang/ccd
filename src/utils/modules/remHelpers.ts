import { DEFAULT_CONFIG, DEVICE_LAYOUT_SIZE_RATIOS } from '@/constants/modules/layout'
import {
  breakpointFontSizeMap,
  breakpoints,
  DEVICE_FONT_SIZE_RATIOS,
  deviceSizeMap,
  deviceTypes,
  type DeviceConfig,
} from '@/constants/modules/rem'

const createDeviceConfigs = (): Record<string, DeviceConfig> => {
  const baseFontSize = DEFAULT_CONFIG.fontSize

  return {
    mobile: {
      minWidth: 0,
      maxWidth: breakpoints.sm,
      designWidth: 375,
      baseFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.mobile.base),
      minFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.mobile.min),
      maxFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.mobile.max),
      name: '移动端',
    },
    tablet: {
      minWidth: breakpoints.sm,
      maxWidth: breakpoints.md,
      designWidth: 768,
      baseFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.tablet.base),
      minFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.tablet.min),
      maxFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.tablet.max),
      name: '平板端',
    },
    desktop: {
      minWidth: breakpoints.md,
      maxWidth: breakpoints.xls,
      designWidth: 1440,
      baseFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.desktop.base),
      minFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.desktop.min),
      maxFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.desktop.max),
      name: '桌面端',
    },
    largeScreen: {
      minWidth: breakpoints.xls,
      maxWidth: breakpoints.xxl,
      designWidth: 1920,
      baseFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.largeScreen.base),
      minFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.largeScreen.min),
      maxFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.largeScreen.max),
      name: '大屏显示器',
    },
    ultraWide: {
      minWidth: breakpoints.xxl,
      maxWidth: breakpoints.xxxl,
      designWidth: 2560,
      baseFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.ultraWide.base),
      minFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.ultraWide.min),
      maxFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.ultraWide.max),
      name: '超宽屏',
    },
    fourK: {
      minWidth: breakpoints.xxxl,
      designWidth: 3840,
      baseFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.fourK.base),
      minFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.fourK.min),
      maxFontSize: Math.round(baseFontSize * DEVICE_FONT_SIZE_RATIOS.fourK.max),
      name: '4K屏',
    },
  }
}

export const deviceConfigs: Record<string, DeviceConfig> = new Proxy(createDeviceConfigs(), {
  get(target, prop) {
    const configs = createDeviceConfigs()
    return configs[prop as string] ?? target[prop as string]
  },
}) as Record<string, DeviceConfig>

export const getDeviceType = (width: number): keyof typeof deviceTypes => {
  if (width >= breakpoints.xxxl) {
    return 'fourK'
  }
  if (width >= breakpoints.xxl) {
    return 'ultraWide'
  }
  if (width >= breakpoints.xls) {
    return 'largeScreen'
  }
  if (width >= breakpoints.md) {
    return 'desktop'
  }
  if (width >= breakpoints.sm) {
    return 'tablet'
  }
  return 'mobile'
}

export const getDeviceConfig = (width: number): DeviceConfig => {
  const deviceType = getDeviceType(width)
  return deviceConfigs[deviceType]
}

export const getDeviceLayoutSizeRatios = (
  deviceType: keyof typeof deviceTypes
): (typeof DEVICE_LAYOUT_SIZE_RATIOS)[keyof typeof DEVICE_LAYOUT_SIZE_RATIOS] => {
  return DEVICE_LAYOUT_SIZE_RATIOS[deviceType] || DEVICE_LAYOUT_SIZE_RATIOS.desktop
}

export const getRecommendedSize = (deviceType: keyof typeof deviceTypes): Size => {
  return deviceSizeMap[deviceType as keyof typeof deviceSizeMap] || 'comfortable'
}

export const getRecommendedFontSize = (deviceType: keyof typeof deviceTypes): string => {
  return breakpointFontSizeMap[deviceType] || 'md'
}
