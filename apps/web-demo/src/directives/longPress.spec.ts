import { describe, expect, it } from 'vitest'
import { vLongPress as sharedLongPress } from '@ccd/vue-hooks'
import { vLongPress } from './longPress'

describe('web-demo vLongPress compatibility export', () => {
  it('re-exports the shared directive', () => {
    expect(vLongPress).toBe(sharedLongPress)
  })
})
