// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockUseLongPressAction } = vi.hoisted(() => ({
  mockUseLongPressAction: vi.fn(),
}))

vi.mock('../useInteraction/useLongPressAction', () => ({
  useLongPressAction: mockUseLongPressAction,
}))

import type { DirectiveBinding, ObjectDirective, VNode } from 'vue'
import { castValue } from '@ccd/shared-utils'
import { vLongPress } from './longPress'

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

describe('vLongPress', () => {
  beforeEach(() => {
    mockUseLongPressAction.mockReset()
  })

  it('sets up long-press handling on mount', () => {
    const el = document.createElement('div')
    const handler = vi.fn()

    vLongPress.mounted?.(el, createBinding(handler), ...createMountedHookArgs())

    expect(mockUseLongPressAction).toHaveBeenCalledWith(el, handler, undefined)
  })

  it('passes custom delay from arg', () => {
    const el = document.createElement('div')
    const handler = vi.fn()

    vLongPress.mounted?.(el, createBinding(handler, '800'), ...createMountedHookArgs())

    expect(mockUseLongPressAction).toHaveBeenCalledWith(el, handler, { delay: 800 })
  })

  it('ignores non-function values', () => {
    const el = document.createElement('div')

    vLongPress.mounted?.(el, createInvalidBinding('not-a-function'), ...createMountedHookArgs())

    expect(mockUseLongPressAction).not.toHaveBeenCalled()
  })

  it('recreates the interaction scope when updated', () => {
    const el = document.createElement('div')
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    vLongPress.mounted?.(el, createBinding(handler1), ...createMountedHookArgs())
    vLongPress.updated?.(el, createBinding(handler2), ...createUpdatedHookArgs())

    expect(mockUseLongPressAction).toHaveBeenCalledTimes(2)
    expect(mockUseLongPressAction).toHaveBeenNthCalledWith(1, el, handler1, undefined)
    expect(mockUseLongPressAction).toHaveBeenNthCalledWith(2, el, handler2, undefined)
  })
})
