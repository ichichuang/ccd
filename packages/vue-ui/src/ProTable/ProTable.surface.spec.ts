import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(currentDir, 'ProTable.vue'), 'utf8')
const toolbarSource = readFileSync(join(currentDir, 'components', 'ProTableToolbar.vue'), 'utf8')

describe('ProTable overlay surface contract', () => {
  it('uses package-owned CSS for the loading overlay without backdrop blur', () => {
    expect(source).toContain('pro-table-loading-overlay')
    expect(source).toContain('.pro-table-loading-overlay')
    expect(source).toContain(':global(.dark .pro-table-loading-overlay)')
    expect(source).not.toContain(':global(.dark) .pro-table-loading-overlay')
    expect(source).not.toContain('bg-background/70')
    expect(source).not.toContain('backdrop-blur-md')
    expect(source).not.toContain('backdrop-filter: blur')
  })

  it('keeps fullscreen scoped to the table region with a stable state contract', () => {
    expect(source).toContain('data-pro-table-fullscreen')
    expect(source).not.toContain('<Teleport')
    expect(source).not.toContain('to="body"')
    expect(source).not.toContain('fixed inset-0')
    expect(toolbarSource).toContain('aria-pressed')
  })
})
