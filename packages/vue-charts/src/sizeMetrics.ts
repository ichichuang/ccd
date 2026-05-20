/**
 * 尺寸像素推导（纯函数，无 Pinia / DOM）
 *
 * 公式与 `sizeEngine.generateSizeVars` 一致，为图表、Store getter 等提供与
 * `--spacing-*` / `--container-padding` / `--radius-*` / `--font-size-*` 同源的 px 数值。
 *
 * - **padding / margin / gap（组件级）**：与 `--spacing-{key}` 同一套阶梯，见 `paddingPx` / `marginPx` / `gapPx`。
 * - **容器内边距**：与 `--container-padding` 一致，见 `containerPaddingPx`。
 *
 * 禁止在业务处手写 `spacingBase * n`；应通过本模块 + `SizeScaleKey` 或专用函数取值。
 */
import { FONT_SCALE_RATIOS, RADIUS_SCALE_RATIOS, SPACING_SCALE_RATIOS } from '@ccd/design-tokens'
import type { SizePreset, SizeScaleKey } from '@ccd/design-tokens'

/** 与 `generateSizeVars` 中间距阶梯 `--spacing-{key}` 一致 */
export function spacingPx(preset: SizePreset, key: SizeScaleKey): number {
  return Math.round(preset.spacingBase * SPACING_SCALE_RATIOS[key])
}

/**
 * 与 `--container-padding` 一致（`spacingBase × 5`，见 `generateSizeVars`）
 * 用于页面/区块容器内边距，非通用 padding 阶梯。
 */
export function containerPaddingPx(preset: SizePreset): number {
  return Math.round(preset.spacingBase * 5)
}

/**
 * 内边距 px（与 `--spacing-{key}` 同源，对应 Uno `p-*` / 语义 padding）
 */
export function paddingPx(preset: SizePreset, key: SizeScaleKey): number {
  return spacingPx(preset, key)
}

/**
 * 外边距 px（与 `--spacing-{key}` 同源，对应 `m-*` / 语义 margin）
 */
export function marginPx(preset: SizePreset, key: SizeScaleKey): number {
  return spacingPx(preset, key)
}

/**
 * 布局 gap px（flex/grid，与 `--spacing-{key}` 同源，对应 `gap-*`）
 */
export function gapPx(preset: SizePreset, key: SizeScaleKey): number {
  return spacingPx(preset, key)
}

/** 与 `generateSizeVars` 中圆角阶梯 `--radius-{key}` 一致 */
export function radiusPx(preset: SizePreset, key: SizeScaleKey): number {
  return Math.round(preset.radius * RADIUS_SCALE_RATIOS[key])
}

/** 与 `generateSizeVars` 中字体阶梯 `--font-size-{key}` 一致（预设基准，非运行时断点缩放后的根字号） */
export function fontPx(preset: SizePreset, key: SizeScaleKey): number {
  return Math.round(preset.fontSizeBase * FONT_SCALE_RATIOS[key])
}
