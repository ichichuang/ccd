// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockUseTap } = vi.hoisted(() => ({
  mockUseTap: vi.fn(),
}))

vi.mock('../useInteraction/useTap', () => ({
  useTap: mockUseTap,
}))

import type { DirectiveBinding, ObjectDirective, VNode } from 'vue'
import { castValue } from '@ccd/shared-utils'
import { vTap } from './tap'

type TapDirective = ObjectDirective<HTMLElement, (event: PointerEvent) => void>
type DirectiveVNode = VNode<unknown, HTMLElement, Record<string, unknown>>

function createBinding(
  value: (event: PointerEvent) => void
): DirectiveBinding<(event: PointerEvent) => void> {
  return {
    value,
    modifiers: {},
    instance: null,
    oldValue: null,
    arg: undefined,
    dir: castValue<TapDirective>(vTap),
  }
}

function createInvalidBinding(value: unknown): DirectiveBinding<(event: PointerEvent) => void> {
  return castValue<DirectiveBinding<(event: PointerEvent) => void>>({
    value,
    modifiers: {},
    instance: null,
    oldValue: null,
    arg: undefined,
    dir: castValue<TapDirective>(vTap),
  })
}

function createMountedHookArgs() {
  return [castValue<DirectiveVNode>({}), null] as const
}

function createUpdatedHookArgs() {
  return [castValue<DirectiveVNode>({}), castValue<DirectiveVNode>({})] as const
}

describe('vTap', () => {
  beforeEach(() => {
    mockUseTap.mockReset()
  })

  it('sets up tap handling on mount', () => {
    const el = document.createElement('div')
    const handler = vi.fn()

    vTap.mounted?.(el, createBinding(handler), ...createMountedHookArgs())

    expect(mockUseTap).toHaveBeenCalledWith(el, handler)
  })

  it('ignores non-function values', () => {
    const el = document.createElement('div')

    vTap.mounted?.(el, createInvalidBinding('not-a-function'), ...createMountedHookArgs())

    expect(mockUseTap).not.toHaveBeenCalled()
  })

  it('recreates the interaction scope when updated', () => {
    const el = document.createElement('div')
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    vTap.mounted?.(el, createBinding(handler1), ...createMountedHookArgs())
    vTap.updated?.(el, createBinding(handler2), ...createUpdatedHookArgs())

    expect(mockUseTap).toHaveBeenCalledTimes(2)
    expect(mockUseTap).toHaveBeenNthCalledWith(1, el, handler1)
    expect(mockUseTap).toHaveBeenNthCalledWith(2, el, handler2)
  })
})
