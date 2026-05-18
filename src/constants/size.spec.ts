import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SIZE_NAME,
  LAYOUT_DIMENSION_KEYS,
  SIZE_PRESETS,
  deriveSidebarCollapsedWidth,
} from './size'
import { SIZE_SCALE_KEYS, SIZE_SCALE_MATRIX } from './sizeScale'

describe('size constants', () => {
  it('keeps the default preset present and layout dimensions complete', () => {
    expect(SIZE_PRESETS.map(preset => preset.name)).toContain(DEFAULT_SIZE_NAME)

    for (const preset of SIZE_PRESETS) {
      for (const key of LAYOUT_DIMENSION_KEYS) {
        expect(preset[key], `${preset.name}.${key}`).toBeGreaterThan(0)
      }
    }
  })

  it('derives collapsed sidebar width from icon-anchor geometry', () => {
    for (const preset of SIZE_PRESETS) {
      expect(preset.sidebarCollapsedWidth).toBe(
        deriveSidebarCollapsedWidth({
          spacingBase: preset.spacingBase,
          fontSizeBase: preset.fontSizeBase,
        })
      )
      expect(preset.sidebarCollapsedWidth).toBeLessThan(preset.sidebarWidth)
    }
  })

  it('keeps the size scale matrix ordered by canonical keys', () => {
    expect(SIZE_SCALE_MATRIX.map(entry => entry.key)).toEqual(SIZE_SCALE_KEYS)
  })
})
