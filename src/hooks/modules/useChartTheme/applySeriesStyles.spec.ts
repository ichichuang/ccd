import { describe, it, expect } from 'vitest'
import type { ThemeConfig } from './types'
import { DEFAULT_OPACITY_VALUES } from './constants'
import { applySeriesStyles } from './applySeriesStyles'

function mockTheme(overrides: Partial<ThemeConfig['opacity']>): ThemeConfig {
  const metricLadders = {
    containerPadding: 20,
    gapXs: 4,
    gapSm: 8,
    gapMd: 16,
    gapLg: 24,
    gapXl: 32,
    gap2xl: 40,
    gap3xl: 48,
    gap4xl: 56,
    gap5xl: 64,
    paddingXs: 4,
    paddingSm: 8,
    paddingMd: 16,
    paddingLg: 24,
    paddingXl: 32,
    padding2xl: 40,
    padding3xl: 48,
    padding4xl: 56,
    padding5xl: 64,
    marginXs: 4,
    marginSm: 8,
    marginMd: 16,
    marginLg: 24,
    marginXl: 32,
    margin2xl: 40,
    margin3xl: 48,
    margin4xl: 56,
    margin5xl: 64,
    fontSizeXs: 10,
    fontSizeSm: 12,
    fontSizeMd: 14,
    fontSizeLg: 16,
    fontSizeXl: 18,
    fontSize2xl: 20,
    fontSize3xl: 22,
    fontSize4xl: 24,
    fontSize5xl: 26,
    radiusXs: 2,
    radiusSm: 4,
    radiusMd: 8,
    radiusLg: 12,
    radiusXl: 16,
    radius2xl: 20,
    radius3xl: 24,
    radius4xl: 28,
    radius5xl: 32,
  }

  return {
    font: {
      textColor: '#000',
      textColorSecondary: '#666',
      fontSizeMd: 14,
      fontSizeSm: 12,
    },
    color: {
      colors: ['#14b8a6'],
      primaryColors: [],
      successColors: [],
      infoColors: [],
      warnColors: [],
      dangerColors: [],
      helpColors: [],
      contrastColors: [],
      secondaryColors: [],
    },
    foreground: '#111',
    opacity: { ...DEFAULT_OPACITY_VALUES, ...overrides },
    size: {
      spacingUnit: 4,
      fontMd: 14,
      fontLg: 16,
      fontSm: 12,
      radiusMd: 8,
      radiusSm: 4,
      lineHeightMd: 20,
      lineHeightLg: 22,
      lineHeightSm: 16,
      padSm: 8,
      padMd: 16,
      padLg: 24,
      itemGapSm: 8,
      itemGapMd: 16,
      axisLabelMargin: 8,
      axisLabelPadding: 4,
      strokeHairline: 1,
      strokeAxis: 2,
      strokeGrid: 1,
      strokeSeries: 2,
      symbolSm: 6,
      symbolMd: 10,
      symbolLg: 14,
      tickLen: 8,
      minorTickLen: 4,
      tooltipPadding: 16,
      tooltipRadius: 8,
      tooltipBorderWidth: 1,
      legendItemWidth: 24,
      legendItemHeight: 16,
      legendItemGap: 8,
      legendPadding: 8,
      toolboxItemSize: 16,
      toolboxItemGap: 8,
      visualMapItemWidth: 24,
      visualMapItemHeight: 16,
      visualMapItemGap: 8,
      visualMapPadding: 8,
      visualMapBorderWidth: 1,
      dataZoomHeight: 24,
      dataZoomBorderWidth: 1,
    },
    mutedForeground: '#666',
    background: '#fff',
    card: '#fff',
    border: '#eee',
    accent: '#14b8a6',
    primaryForeground: '#fff',
    ...metricLadders,
  }
}

describe('applySeriesStyles — bar opacity', () => {
  it('writes bar transparency into itemStyle.color as rgba when color is hex', () => {
    const series = { type: 'bar' as const, data: [10, 20, 30] }
    const config = mockTheme({ bar: 0.3 })
    const out = applySeriesStyles(series, 0, config)
    expect(out.itemStyle?.color).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*0\.3\)$/)
    expect(out.itemStyle?.opacity).toBe(1)
  })

  it('respects explicit user itemStyle.opacity', () => {
    const series = {
      type: 'bar' as const,
      data: [1, 2],
      itemStyle: { opacity: 0.5 },
    }
    const config = mockTheme({ bar: 0.2 })
    const out = applySeriesStyles(series, 0, config)
    expect(out.itemStyle?.opacity).toBe(0.5)
  })
})
