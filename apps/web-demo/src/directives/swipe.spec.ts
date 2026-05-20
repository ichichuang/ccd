// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockUseSwipeAction } = vi.hoisted(() => ({
  mockUseSwipeAction: vi.fn(),
}))

vi.mock('@ccd/vue-hooks', () => ({
  useSwipeAction: mockUseSwipeAction,
}))

vi.stubGlobal('effectScope', () => ({
  run: (fn: () => unknown) => fn(),
  stop: vi.fn(),
}))

import type { ObjectDirective, DirectiveBinding, VNode } from 'vue'
import { castValue } from '@ccd/shared-utils'
import type { SwipeDirection } from '@ccd/vue-hooks'

type SwipeDirective = ObjectDirective<HTMLElement, (direction: SwipeDirection) => void>
type DirectiveVNode = VNode<unknown, HTMLElement, Record<string, unknown>>

function createBinding(
  value: (direction: SwipeDirection) => void,
  arg?: string
): DirectiveBinding<(direction: SwipeDirection) => void> {
  return {
    value,
    modifiers: {},
    instance: null,
    oldValue: null,
    arg,
    dir: castValue<SwipeDirective>(vSwipe),
  }
}

function createInvalidBinding(
  value: unknown,
  arg?: string
): DirectiveBinding<(direction: SwipeDirection) => void> {
  return castValue<DirectiveBinding<(direction: SwipeDirection) => void>>({
    value,
    modifiers: {},
    instance: null,
    oldValue: null,
    arg,
    dir: castValue<SwipeDirective>(vSwipe),
  })
}

function createMountedHookArgs() {
  return [castValue<DirectiveVNode>({}), null] as const
}

import { vSwipe } from './swipe'

describe('vSwipe directive', () => {
  beforeEach(() => {
    mockUseSwipeAction.mockReset()
  })

  it('sets up swipe on mount', () => {
    const el = document.createElement('div')
    const handler = vi.fn()

    vSwipe.mounted!(el, createBinding(handler), ...createMountedHookArgs())

    expect(mockUseSwipeAction).toHaveBeenCalledWith(el, handler, { directions: undefined })
  })

  it('passes direction filter from arg', () => {
    const el = document.createElement('div')
    const handler = vi.fn()

    vSwipe.mounted!(el, createBinding(handler, 'left'), ...createMountedHookArgs())

    expect(mockUseSwipeAction).toHaveBeenCalledWith(el, handler, { directions: ['left'] })
  })

  it('ignores invalid directions', () => {
    const el = document.createElement('div')
    const handler = vi.fn()

    vSwipe.mounted!(el, createBinding(handler, 'diagonal'), ...createMountedHookArgs())

    expect(mockUseSwipeAction).toHaveBeenCalledWith(el, handler, { directions: undefined })
  })

  it('ignores non-function binding value', () => {
    const el = document.createElement('div')

    vSwipe.mounted!(el, createInvalidBinding('not-a-function'), ...createMountedHookArgs())

    expect(mockUseSwipeAction).not.toHaveBeenCalled()
  })
})
