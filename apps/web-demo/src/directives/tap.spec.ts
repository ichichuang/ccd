import { describe, expect, it } from 'vitest'
import { vTap as sharedTap } from '@ccd/vue-hooks'
import { vTap } from './tap'

describe('web-demo vTap compatibility export', () => {
  it('re-exports the shared directive', () => {
    expect(vTap).toBe(sharedTap)
  })
})
