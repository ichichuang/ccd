// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { ThemeConfig } from './types'
import { DEFAULT_OPACITY_VALUES } from './constants'
import { applySeriesStyles } from './applySeriesStyles'
import { applyDataZoomStyles } from './applyDataZoomStyles'
import { applyVisualMapStyles } from './applyVisualMapStyles'

const TEST_TEXT_HEX = '#000'
const TEST_MUTED_HEX = '#666'
const TEST_FOREGROUND_HEX = '#111'
const TEST_SURFACE_HEX = '#fff'
const TEST_BORDER_HEX = '#eee'
const TEST_ACCENT_HEX = '#14b8a6'

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
      textColor: TEST_TEXT_HEX,
      textColorSecondary: TEST_MUTED_HEX,
      fontSizeMd: 14,
      fontSizeSm: 12,
    },
    color: {
      colors: [TEST_ACCENT_HEX],
      primaryColors: [],
      successColors: [],
      infoColors: [],
      warnColors: [],
      dangerColors: [],
      helpColors: [],
      contrastColors: [],
      secondaryColors: [],
    },
    foreground: TEST_FOREGROUND_HEX,
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
    mutedForeground: TEST_MUTED_HEX,
    background: TEST_SURFACE_HEX,
    card: TEST_SURFACE_HEX,
    border: TEST_BORDER_HEX,
    accent: TEST_ACCENT_HEX,
    primaryForeground: TEST_SURFACE_HEX,
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

describe('useChartTheme — fusion helpers', () => {
  it('applyDataZoomStyles should use config.size.radiusSm for handle radius', () => {
    const config = mockTheme({})
    const out = applyDataZoomStyles(
      {
        handleStyle: {},
        moveHandleStyle: {},
      },
      config
    )
    expect(out.handleStyle?.borderRadius).toBe(config.size.radiusSm)
    expect(out.moveHandleStyle?.borderRadius).toBe(config.size.radiusSm)
  })

  it('applyVisualMapStyles continuous should write inRange/outOfRange colors', () => {
    const config = mockTheme({})
    config.color.primaryColors = ['rgb(1,2,3)']
    config.color.successColors = ['rgb(4,5,6)']
    config.color.warnColors = ['rgb(7,8,9)']
    config.color.dangerColors = ['rgb(10,11,12)']

    const out = applyVisualMapStyles(
      {
        type: 'continuous',
        inRange: {},
        outOfRange: {},
      },
      config
    )

    expect(out.inRange?.color).toEqual(['rgb(1,2,3)', 'rgb(4,5,6)', 'rgb(7,8,9)', 'rgb(10,11,12)'])
    expect(out.outOfRange?.color).toEqual([config.mutedForeground])
    expect(out.color).toBeUndefined()
  })

  it('mergeAdvancedConfigs should deep-merge toolbox and keep prev itemSize', async () => {
    const config = mockTheme({})
    const option = {
      toolbox: {
        show: true,
        itemSize: 9,
      },
    }

    const advancedConfig = {
      toolboxConfig: {
        show: true,
      },
    }

    // mergeAdvancedConfigs 依赖 defaults/chartUtils/sizeStore，需要 active Pinia + localStorage
    setActivePinia(createPinia())
    ;(globalThis as any).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    }

    const { mergeAdvancedConfigs } = await import('./mergeAdvancedConfigs')
    const out = mergeAdvancedConfigs(option, advancedConfig as any, undefined, config)
    expect(out.toolbox?.itemSize).toBe(9)
  })

  it('applyThemeToOption should not mutate nested input option objects', async () => {
    setActivePinia(createPinia())
    ;(globalThis as any).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    }

    document.documentElement.style.setProperty('--foreground', '17 17 17')
    document.documentElement.style.setProperty('--muted-foreground', '102 102 102')
    document.documentElement.style.setProperty('--background', '255 255 255')
    document.documentElement.style.setProperty('--card', '255 255 255')
    document.documentElement.style.setProperty('--border', '238 238 238')
    document.documentElement.style.setProperty('--primary', '20 184 166')
    document.documentElement.style.setProperty('--primary-foreground', '255 255 255')
    document.documentElement.style.setProperty('--accent', '20 184 166')
    document.documentElement.style.setProperty('--secondary', '102 102 102')
    document.documentElement.style.setProperty('--success', '34 197 94')
    document.documentElement.style.setProperty('--warn', '245 158 11')
    document.documentElement.style.setProperty('--danger', '239 68 68')
    document.documentElement.style.setProperty('--info', '59 130 246')
    document.documentElement.style.setProperty('--help', '168 85 247')

    const formatter = () => 'kept'
    const option = {
      tooltip: { formatter },
      polar: {
        angleAxis: { axisLabel: { color: 'user-angle' } },
        radiusAxis: {},
      },
      radar: {
        splitArea: {},
      },
      series: [
        {
          type: 'bar',
          data: [1, 2, 3],
          itemStyle: { color: 'currentColor' },
        },
      ],
    }
    const original = JSON.parse(JSON.stringify(option))

    const { applyThemeToOption } = await import('./index')
    const out = applyThemeToOption(option, undefined, undefined, key => key) as any

    expect(option).toEqual({
      ...original,
      tooltip: { formatter },
    })
    expect(out).not.toBe(option)
    expect(out.tooltip.formatter).toBe(formatter)
    expect(out.series[0]).not.toBe(option.series[0])
    expect(out.polar).not.toBe(option.polar)
    expect(out.radar).not.toBe(option.radar)
  })
})
