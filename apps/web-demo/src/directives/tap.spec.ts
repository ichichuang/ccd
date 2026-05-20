// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockUseTap } = vi.hoisted(() => ({
  mockUseTap: vi.fn(),
}))

vi.mock('@ccd/vue-hooks', () => ({
  useTap: mockUseTap,
}))

vi.stubGlobal('effectScope', () => ({
  run: (fn: () => unknown) => fn(),
  stop: vi.fn(),
}))

import type { ObjectDirective, DirectiveBinding, VNode } from 'vue'
import { castValue } from '@ccd/shared-utils'

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

import { vTap } from './tap'

describe('vTap directive', () => {
  beforeEach(() => {
    mockUseTap.mockReset()
  })

  it('sets up tap on mount', () => {
    const el = document.createElement('div')
    const handler = vi.fn()

    vTap.mounted!(el, createBinding(handler), ...createMountedHookArgs())

    expect(mockUseTap).toHaveBeenCalledWith(el, handler)
  })

  it('ignores non-function binding value', () => {
    const el = document.createElement('div')

    vTap.mounted!(el, createInvalidBinding('not-a-function'), ...createMountedHookArgs())

    expect(mockUseTap).not.toHaveBeenCalled()
  })

  it('re-creates on update', () => {
    const el = document.createElement('div')
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    vTap.mounted!(el, createBinding(handler1), ...createMountedHookArgs())
    vTap.updated!(el, createBinding(handler2), ...createUpdatedHookArgs())

    expect(mockUseTap).toHaveBeenCalledTimes(2)
  })
})
