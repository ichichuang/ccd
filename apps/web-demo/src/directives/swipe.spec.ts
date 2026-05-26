import { describe, expect, it } from 'vitest'
import { vSwipe as sharedSwipe } from '@ccd/vue-hooks'
import { vSwipe } from './swipe'

describe('web-demo vSwipe compatibility export', () => {
  it('re-exports the shared directive', () => {
    expect(vSwipe).toBe(sharedSwipe)
  })
})
