// src/constants/sizeScale.ts
import { z } from 'zod'

/**
 * 尺寸阶梯键名定义 (xs -> 5xl)
 * 保持与 Breakpoints 命名一致，降低心智负担
 */
export const SIZE_SCALE_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const
export type SizeScaleKey = (typeof SIZE_SCALE_KEYS)[number]

const sizeScaleMatrixEntrySchema = z.object({
  key: z.enum(SIZE_SCALE_KEYS),
  fontRatio: z.number().positive(),
  spacingRatio: z.number().positive(),
  radiusRatio: z.number().positive(),
  layoutRatio: z.number().positive(),
  loadingSizeCss: z.union([z.number(), z.string().min(1)]),
  transitionMs: z.number().int().positive(),
})

const sizeScaleMatrixSchema = z
  .array(sizeScaleMatrixEntrySchema)
  .length(SIZE_SCALE_KEYS.length)
  .superRefine((entries, ctx) => {
    const seen = new Set<SizeScaleKey>()
    entries.forEach((entry, index) => {
      if (entry.key !== SIZE_SCALE_KEYS[index]) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'key'],
          message: `Size scale key order must match SIZE_SCALE_KEYS[${index}]`,
        })
      }
      if (seen.has(entry.key)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'key'],
          message: `Duplicate size scale key: ${entry.key}`,
        })
      }
      seen.add(entry.key)
    })
  })

export type SizeScaleMatrixEntry = z.infer<typeof sizeScaleMatrixEntrySchema>

/**
 * 尺寸阶梯矩阵 SSOT。
 * - fontRatio：相对于 --font-size-base
 * - spacingRatio：相对于 --spacing-unit
 * - radiusRatio：相对于 SizePreset.radius
 * - layoutRatio：PC 断点布局缩放，Mobile/Tablet 固定 1
 * - loadingSizeCss：Loading 动画正方形边长
 * - transitionMs：过渡时长阶梯
 */
export const SIZE_SCALE_MATRIX = sizeScaleMatrixSchema.parse([
  {
    key: 'xs',
    fontRatio: 0.82,
    spacingRatio: 1,
    radiusRatio: 0.25,
    layoutRatio: 0.95,
    loadingSizeCss: 'min(12vw, 12vh)',
    transitionMs: 180,
  },
  {
    key: 'sm',
    fontRatio: 0.96,
    spacingRatio: 2,
    radiusRatio: 0.5,
    layoutRatio: 0.98,
    loadingSizeCss: 'min(20vw, 20vh)',
    transitionMs: 280,
  },
  {
    key: 'md',
    fontRatio: 1,
    spacingRatio: 4,
    radiusRatio: 1,
    layoutRatio: 1,
    loadingSizeCss: 'min(32vw, 32vh)',
    transitionMs: 320,
  },
  {
    key: 'lg',
    fontRatio: 1.125,
    spacingRatio: 6,
    radiusRatio: 1.5,
    layoutRatio: 1,
    loadingSizeCss: 'min(42vw, 42vh)',
    transitionMs: 420,
  },
  {
    key: 'xl',
    fontRatio: 1.2,
    spacingRatio: 8,
    radiusRatio: 2,
    layoutRatio: 1.05,
    loadingSizeCss: 'min(60vw, 60vh)',
    transitionMs: 480,
  },
  {
    key: '2xl',
    fontRatio: 1.5,
    spacingRatio: 12,
    radiusRatio: 2.5,
    layoutRatio: 1.1,
    loadingSizeCss: 'min(78vw, 78vh)',
    transitionMs: 580,
  },
  {
    key: '3xl',
    fontRatio: 1.875,
    spacingRatio: 16,
    radiusRatio: 3,
    layoutRatio: 1.15,
    loadingSizeCss: 'min(82vw, 82vh)',
    transitionMs: 680,
  },
  {
    key: '4xl',
    fontRatio: 2.25,
    spacingRatio: 24,
    radiusRatio: 3.5,
    layoutRatio: 1.2,
    loadingSizeCss: 'min(90vw, 90vh)',
    transitionMs: 780,
  },
  {
    key: '5xl',
    fontRatio: 3,
    spacingRatio: 32,
    radiusRatio: 999,
    layoutRatio: 1.25,
    loadingSizeCss: 'min(100vw, 100vh)',
    transitionMs: 880,
  },
])

function deriveSizeScaleRecord<K extends Exclude<keyof SizeScaleMatrixEntry, 'key'>>(
  field: K
): Record<SizeScaleKey, SizeScaleMatrixEntry[K]> {
  return SIZE_SCALE_MATRIX.reduce(
    (acc, entry) => ({
      ...acc,
      [entry.key]: entry[field],
    }),
    {} as Record<SizeScaleKey, SizeScaleMatrixEntry[K]>
  )
}

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const FONT_SCALE_RATIOS = deriveSizeScaleRecord('fontRatio')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const SPACING_SCALE_RATIOS = deriveSizeScaleRecord('spacingRatio')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const RADIUS_SCALE_RATIOS = deriveSizeScaleRecord('radiusRatio')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const LAYOUT_SCALE_RATIOS = deriveSizeScaleRecord('layoutRatio')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const LOADING_SIZE_CSS = deriveSizeScaleRecord('loadingSizeCss')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const TRANSITION_SCALE_MS = deriveSizeScaleRecord('transitionMs')
