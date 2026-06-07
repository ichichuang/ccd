import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

describe('migrate-ledger parser self-check', () => {
  it('validates canonical Markdown task parsing fixtures', () => {
    const result = spawnSync(process.execPath, ['scripts/migrate-ledger.mjs', '--self-check'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    })

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
    expect(result.stdout).toContain('[LEDGER] parser self-check passed')
  })
})
