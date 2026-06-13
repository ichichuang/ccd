import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(currentDir, 'ProTable.vue'), 'utf8')

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
})
