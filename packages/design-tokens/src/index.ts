export type {
  ColorTokenState,
  CompleteColorTokenState,
  CompleteThemeModeConfig,
  CompleteThemePreset,
  FontSizeCssVarName,
  RadiusCssVarName,
  SizeCssVarName,
  SizeCssVars,
  SizeMode,
  SizePreset,
  SpacingCssVarName,
  StaticSizeCssVarName,
  ThemeCssVars,
  ThemeMode,
  ThemeModeConfig,
  ThemePreset,
  ThemeTransitionDuration,
  ThemeTransitionMode,
  TransitionCssVarName,
} from './types.js'

export {
  createSortedBreakpoints,
  resolveBreakpointFromWidth,
  resolveDeviceTypeFromInputs,
  resolveOrientationFromViewport,
  resolveOsTypeFromUserAgent,
  resolveViewportMetrics,
  SORTED_BREAKPOINTS,
} from './deviceResolver.js'
export type {
  BreakpointResolverSource,
  BreakpointThresholdMap,
  DeviceResolverDeviceType,
  DeviceResolverOrientation,
  DeviceResolverOsType,
  DeviceTypeResolverInput,
  SortedBreakpointEntry,
  ViewportMetrics,
  ViewportMetricsInput,
} from './deviceResolver.js'

export {
  SIZE_FONT_VAR_PREFIX,
  decideLayoutDimensions,
  decideRootFontSize,
  deriveRuntimeFontSizeVars,
  generateSizeVars,
  getScopedContentSizeVars,
  resolveSizePreset,
} from './sizeResolver.js'
export type {
  RootFontSizeContext,
  RootFontSizeDecision,
  SizeResolverDeviceType,
} from './sizeResolver.js'

export {
  FONT_SCALE_RATIOS,
  LAYOUT_SCALE_RATIOS,
  LOADING_SIZE_CSS,
  RADIUS_SCALE_RATIOS,
  SIZE_SCALE_KEYS,
  SIZE_SCALE_MATRIX,
  SPACING_SCALE_RATIOS,
  TRANSITION_SCALE_MS,
} from './sizeScale.js'
export type { SizeScaleKey, SizeScaleMatrixEntry } from './sizeScale.js'

export { BREAKPOINTS, TABLET_DETECTION_MIN_SHORT_SIDE } from './breakpoints.js'
export type { BreakpointKey } from './breakpoints.js'

export {
  DEFAULT_SIZE_NAME,
  DIALOG_SETTINGS_WIDTH_PX,
  LAYOUT_DIMENSION_KEYS,
  SIDEBAR_COLLAPSED_ICON_SIZE,
  SIZE_BASE_VAR_KEYS,
  SIZE_PRESETS,
  deriveSidebarCollapsedWidth,
} from './size.js'

export {
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_NAME,
  DEFAULT_TRANSITION_DURATION,
  DEMO_COLOR_PICKER_DEFAULT_HEX,
  THEME_PRESETS,
  TRANSITION_DURATION_OPTIONS,
  getPresetPrimaryColor,
} from './theme.js'

export { COLOR_FAMILIES, THEME_ENGINE } from './metadata.js'

export { ACCENT_USAGE, COLOR_USAGE, PRIMARY_USAGE } from './colorUsage.js'

export {
  adjustBrightness,
  applyOpacityToColor,
  hexToRgb,
  isDarkColor,
  mixHex,
  normalizeHex,
  rgbToHex,
  shiftHue,
} from './colors.js'
