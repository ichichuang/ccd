import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const changedShowcaseFiles = [
  'apps/web-demo/src/views/showcase/shared/ShowcaseCard.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseCatalogGrid.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseDemoPanel.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseEmptyState.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseEvidencePanel.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseFeatureCard.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseHero.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseSection.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseSourceLinks.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseToolbar.vue',
  'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseFeedbackDemo.vue',
  'apps/web-demo/src/views/showcase/components/pro-table/shared/ProTableDemoShell.vue',
] as const

const hardcodedColorPattern =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:bg|text|border)-(?:white|black|gray|slate|red|blue|green|yellow|orange|purple|neutral|zinc|stone)(?:\b|-)/
const inlineStylePattern = /\b:?style=/

describe('showcase visual foundation source constraints', () => {
  it('does not introduce hardcoded colors or inline style bindings', () => {
    const violations = changedShowcaseFiles.flatMap(file => {
      const source = readFileSync(file, 'utf8')
      return [
        hardcodedColorPattern.test(source) ? `${file}: hardcoded color` : null,
        inlineStylePattern.test(source) ? `${file}: inline style` : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })
})
