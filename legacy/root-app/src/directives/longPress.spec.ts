// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockUseLongPressAction } = vi.hoisted(() => ({
  mockUseLongPressAction: vi.fn(),
}))

vi.mock('@/hooks/modules/useInteraction', () => ({
  useLongPressAction: mockUseLongPressAction,
}))

vi.stubGlobal('effectScope', () => ({
  run: (fn: () => unknown) => fn(),
  stop: vi.fn(),
}))

import type { ObjectDirective, DirectiveBinding, VNode } from 'vue'
import { castValue } from '@/utils/typeCasters'

type LongPressDirective = ObjectDirective<HTMLElement, (event: PointerEvent) => void>
type DirectiveVNode = VNode<unknown, HTMLElement, Record<string, unknown>>

function createBinding(
  value: (event: PointerEvent) => void,
  arg?: string
): DirectiveBinding<(event: PointerEvent) => void> {
  return {
    value,
    modifiers: {},
    instance: null,
    oldValue: null,
    arg,
    dir: castValue<LongPressDirective>(vLongPress),
  }
}

function createInvalidBinding(
  value: unknown,
  arg?: string
): DirectiveBinding<(event: PointerEvent) => void> {
  return castValue<DirectiveBinding<(event: PointerEvent) => void>>({
    value,
    modifiers: {},
    instance: null,
    oldValue: null,
    arg,
    dir: castValue<LongPressDirective>(vLongPress),
  })
}

function createMountedHookArgs() {
  return [castValue<DirectiveVNode>({}), null] as const
}

function createUpdatedHookArgs() {
  return [castValue<DirectiveVNode>({}), castValue<DirectiveVNode>({})] as const
}

import { vLongPress } from './longPress'

describe('vLongPress directive', () => {
  beforeEach(() => {
    mockUseLongPressAction.mockReset()
  })

  it('sets up long press on mount', () => {
    const el = document.createElement('div')
    const handler = vi.fn()

    vLongPress.mounted!(el, createBinding(handler), ...createMountedHookArgs())

    expect(mockUseLongPressAction).toHaveBeenCalledWith(el, handler, undefined)
  })

  it('passes custom delay from arg', () => {
    const el = document.createElement('div')
    const handler = vi.fn()

    vLongPress.mounted!(el, createBinding(handler, '800'), ...createMountedHookArgs())

    expect(mockUseLongPressAction).toHaveBeenCalledWith(el, handler, { delay: 800 })
  })

  it('ignores non-function binding value', () => {
    const el = document.createElement('div')

    vLongPress.mounted!(el, createInvalidBinding('not-a-function'), ...createMountedHookArgs())

    expect(mockUseLongPressAction).not.toHaveBeenCalled()
  })

  it('re-creates on update', () => {
    const el = document.createElement('div')
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    vLongPress.mounted!(el, createBinding(handler1), ...createMountedHookArgs())
    vLongPress.updated!(el, createBinding(handler2), ...createUpdatedHookArgs())

    expect(mockUseLongPressAction).toHaveBeenCalledTimes(2)
  })
})
