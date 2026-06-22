import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const chartPageFiles = [
  'apps/web-demo/src/views/showcase/components/charts/overview/index.vue',
  'apps/web-demo/src/views/showcase/components/charts/theme/index.vue',
  'apps/web-demo/src/views/showcase/components/charts/responsive/index.vue',
  'apps/web-demo/src/views/showcase/components/charts/states/index.vue',
  'apps/web-demo/src/views/showcase/components/charts/events/index.vue',
  'apps/web-demo/src/views/showcase/components/charts/dashboard-preview/index.vue',
] as const

const changedChartSourceFiles = [
  ...chartPageFiles,
  'apps/web-demo/src/views/showcase/components/charts/shared/ShowcaseChartDemoShell.vue',
] as const

const requiredPrimitiveImports = [
  'ShowcaseHero',
  'ShowcaseSection',
  'ShowcaseCard',
  'ShowcaseToolbar',
  'ShowcaseEvidencePanel',
  'ShowcaseEmptyState',
  'ShowcaseSourceLinks',
  'ShowcaseDemoPanel',
] as const

const hardcodedColorPattern =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:bg|text|border)-(?:white|black|gray|slate|red|blue|green|yellow|orange|purple|neutral|zinc|stone)(?:\b|-)/
const rawInlineStylePattern = /\b:?style=/
const rawChartRuntimePattern =
  /\becharts\.init\b|from ['"]vue-echarts['"]|from ['"]@ccd\/vue-charts['"]/
const hardcodedChartSurfacePattern =
  /\bbackgroundColor\s*:|\bcolor\s*:\s*\[|#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/

function readSource(file: string): string {
  return readFileSync(file, 'utf8')
}

describe('Phase 2C charts showcase source constraints', () => {
  it('routes every Charts page through the Charts-local showcase shell', () => {
    const violations = chartPageFiles.flatMap(file => {
      const source = readSource(file)
      return [
        source.includes('ShowcaseChartDemoShell') ? null : `${file}: missing shell`,
        source.includes('ShowcaseCapabilityPage')
          ? `${file}: still uses generic capability page`
          : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })

  it('reuses the Phase 2B showcase primitives in the Charts shell', () => {
    const shell = readSource(
      'apps/web-demo/src/views/showcase/components/charts/shared/ShowcaseChartDemoShell.vue'
    )
    const missing = requiredPrimitiveImports.filter(primitive => !shell.includes(primitive))

    expect(missing).toEqual([])
  })

  it('keeps Charts rendering on the app wrapper and data-only option helper', () => {
    const shell = readSource(
      'apps/web-demo/src/views/showcase/components/charts/shared/ShowcaseChartDemoShell.vue'
    )

    expect(shell).toContain('<UseEcharts')
    expect(shell).toContain('createShowcaseChartOption')
    expect(rawChartRuntimePattern.test(shell)).toBe(false)
  })

  it('does not introduce hardcoded colors, inline style bindings, or chart surface colors', () => {
    const violations = changedChartSourceFiles.flatMap(file => {
      const source = readSource(file)
      return [
        hardcodedColorPattern.test(source) ? `${file}: hardcoded color` : null,
        rawInlineStylePattern.test(source) ? `${file}: raw inline style` : null,
        hardcodedChartSurfacePattern.test(source) ? `${file}: hardcoded chart surface color` : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })
})
