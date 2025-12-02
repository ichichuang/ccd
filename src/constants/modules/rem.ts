// 常量定义（无函数逻辑）

/**
 * 断点配置（与 UnoCSS 保持一致）
 * 注意：这里使用数字格式，UnoCSS theme.ts 会自动转换为字符串格式
 */
export const breakpoints = {
  xs: 375, // 超小屏幕 - 手机端 (375px+)
  sm: 768, // 小屏幕 - 平板竖屏 (768px+)
  md: 950, // 中等屏幕 - 平板横屏/小笔记本 (950wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwpx+)
  lg: 1400, // 大屏幕 - 桌面端 (1400px+)
  xl: 1660, // 超大屏幕 - 大桌面 (1660px+)
  xls: 1920, // 特大屏幕 - 全高清显示器 (1920px+)
  xxl: 2560, // 超宽屏 - 2K显示器 (2560px+)w
  xxxl: 3840, // 4K屏 - 4K显示器 (3840px+)
} as const

/**
 * 设备类型定义
 */
export const deviceTypes = {
  mobile: 'Mobile', // 手机端
  tablet: 'Tablet', // 平板端
  desktop: 'Desktop', // 桌面端
  largeScreen: 'LargeScreen', // 大屏显示器
  ultraWide: 'UltraWide', // 超宽屏
  fourK: 'FourK', // 4K屏
} as const

/**
 * 适配策略
 */
export const adapterStrategies = {
  mobileFirst: 'mobile-first',
  desktopFirst: 'desktop-first',
  largeScreenFirst: 'large-screen-first',
  adaptive: 'adaptive',
} as const

/**
 * 统一的设备配置接口
 */
export interface DeviceConfig {
  minWidth: number
  maxWidth?: number
  designWidth: number
  baseFontSize: number
  minFontSize: number
  maxFontSize: number
  name: string
}

/**
 * 设备字体大小比例配置
 * 基于 DEFAULT_CONFIG.fontSize 的相对比例，便于统一调整全局字体大小
 */
export const DEVICE_FONT_SIZE_RATIOS = {
  mobile: {
    base: 0.75, // 12/16 = 0.75
    min: 0.75, // 12/16 = 0.75
    max: 1.0, // 16/16 = 1.0
  },
  tablet: {
    base: 0.9375, // 15/16 = 0.9375
    min: 0.75, // 12/16 = 0.75
    max: 1.0625, // 17/16 = 1.0625
  },
  desktop: {
    base: 0.875, // 14/16 = 0.875
    min: 0.875, // 14/16 = 0.875
    max: 1.0, // 16/16 = 1.0
  },
  largeScreen: {
    base: 1.0, // 16/16 = 1.0
    min: 0.75, // 12/16 = 0.75
    max: 1.125, // 18/16 = 1.125
  },
  ultraWide: {
    base: 1.25, // 20/16 = 1.25 (调整为更大，适配超宽屏)
    min: 1.0, // 16/16 = 1.0 (最小字体相应增大)
    max: 1.75, // 28/16 = 1.75 (最大字体增大)
  },
  fourK: {
    base: 1.6, // 24/16 = 1.6 (调整为更大，适配 4K 屏)
    min: 1.4, // 20/16 = 1.4 (最小字体也相应增大)
    max: 2.5, // 32/16 = 2.5 (最大字体增大，提供更多缩放空间)
  },
} as const

export const debugConfig = {
  // 是否启用调试模式
  enabled: false,

  // 调试信息显示间隔（毫秒）
  logInterval: 1000,

  // 是否在控制台显示适配信息
  showAdapterInfo: false,

  // 是否显示断点信息
  showBreakpointInfo: false,

  // 是否显示字体适配信息
  showFontAdaptInfo: false,

  // 是否显示设备检测信息
  showDeviceDetection: false,

  // 是否在页面上显示调试信息（开发环境）
  showOnPageDebugInfo: false,
} as const

/**
 * 自动适配配置
 * 控制是否启用自动适配功能
 */
export const autoAdaptConfig = {
  // 是否自动切换尺寸模式
  autoSizeMode: true,
  // 是否自动切换字体大小选项
  autoFontSize: true,
  // 是否自动切换适配策略
  autoStrategy: true,
} as const

/**
 * 尺寸选项配置
 * 注意：label 现在通过国际化系统动态获取
 */
export const sizeOptions = [
  { labelKey: 'common.systemOptions.size.compact', value: 'compact' },
  { labelKey: 'common.systemOptions.size.comfortable', value: 'comfortable' },
  { labelKey: 'common.systemOptions.size.loose', value: 'loose' },
] as const

/**
 * 间距选项配置
 * 注意：label 现在通过国际化系统动态获取
 */
export const paddingOptions = [
  { labelKey: 'common.systemOptions.padding.sm', key: 'sm', value: 8 },
  { labelKey: 'common.systemOptions.padding.md', key: 'md', value: 12 },
  { labelKey: 'common.systemOptions.padding.lg', key: 'lg', value: 16 },
] as const

/**
 * 圆角选项配置
 * 注意：label 现在通过国际化系统动态获取
 */
export const roundedOptions = [
  { labelKey: 'common.systemOptions.rounded.sharp', key: 'sharp', value: 0 },
  { labelKey: 'common.systemOptions.rounded.smooth', key: 'smooth', value: 6 },
  { labelKey: 'common.systemOptions.rounded.round', key: 'round', value: 12 },
  { labelKey: 'common.systemOptions.rounded.soft', key: 'soft', value: 24 },
] as const

/**
 * 字体尺寸选项配置
 * 与设备配置的 baseFontSize 保持一致
 * 注意：label 现在通过国际化系统动态获取
 */
export const fontSizeOptions = [
  { labelKey: 'common.systemOptions.fontSize.xs', key: 'xs', value: 14 }, // 适用于紧凑模式
  { labelKey: 'common.systemOptions.fontSize.sm', key: 'sm', value: 14 },
  { labelKey: 'common.systemOptions.fontSize.md', key: 'md', value: 15 }, // 移动端默认
  { labelKey: 'common.systemOptions.fontSize.lg', key: 'lg', value: 16 }, // 桌面端默认
  { labelKey: 'common.systemOptions.fontSize.xl', key: 'xl', value: 18 }, // 大屏默认
  { labelKey: 'common.systemOptions.fontSize.xls', key: 'xls', value: 20 }, // 超宽屏默认
  { labelKey: 'common.systemOptions.fontSize.xxl', key: 'xxl', value: 22 },
  { labelKey: 'common.systemOptions.fontSize.xxxl', key: 'xxxl', value: 24 }, // 4K屏默认
] as const

/**
 * 设备类型到尺寸模式的映射
 * 用于根据设备类型自动推荐尺寸模式
 */
export const deviceSizeMap = {
  mobile: 'compact', // 移动端默认紧凑模式
  tablet: 'comfortable', // 平板端默认舒适模式
  desktop: 'comfortable', // 桌面端默认舒适模式
  largeScreen: 'loose', // 大屏端默认宽松模式
  ultraWide: 'loose', // 超宽屏端默认宽松模式
  fourK: 'loose', // 4K屏端默认宽松模式
} as const

/**
 * 断点与字体大小的映射关系
 * 用于自动设置字体大小选项
 * 注意：此映射影响字体大小选项（xs/sm/md/lg/xl等），实际根字体大小由 deviceConfigs 计算
 */
export const breakpointFontSizeMap = {
  mobile: 'xs', // < 768px 使用迷你字体
  tablet: 'sm', // 768-1023px 使用小字体
  desktop: 'md', // 1024-1919px 使用中等字体
  largeScreen: 'lg', // 1920-2559px 使用大字体
  ultraWide: 'xl', // 2560-3839px 使用特大字体
  fourK: 'xxxl', // >= 3840px 使用超超大字体（调整为最大选项，适配 4K 屏）
} as const

/**
 * 工具函数：根据设备类型获取推荐的尺寸模式
 */
