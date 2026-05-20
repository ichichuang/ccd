// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ObjectDirective, DirectiveBinding, VNode } from 'vue'
import { castValue } from '@ccd/shared-utils'

const { mockHasAuthCodes } = vi.hoisted(() => ({
  mockHasAuthCodes: vi.fn(),
}))

vi.mock('@/hooks/modules/useAuth', () => ({
  hasAuthCodes: mockHasAuthCodes,
}))

import { vAuth } from './auth'

type AuthDirective = ObjectDirective<HTMLElement, string | string[]>
type DirectiveVNode = VNode<unknown, HTMLElement, Record<string, unknown>>

function createBinding(
  value: string | string[],
  modifiers: Record<string, boolean> = {}
): DirectiveBinding<string | string[]> {
  return {
    value,
    modifiers,
    instance: null,
    oldValue: null,
    arg: undefined,
    dir: castValue<AuthDirective>(vAuth),
  }
}

function createMountedHookArgs() {
  return [castValue<DirectiveVNode>({}), null] as const
}

function createUpdatedHookArgs() {
  return [castValue<DirectiveVNode>({}), castValue<DirectiveVNode>({})] as const
}

describe('vAuth directive', () => {
  beforeEach(() => {
    mockHasAuthCodes.mockReset()
  })

  describe('default hide mode', () => {
    it('keeps element visible when authorized', () => {
      mockHasAuthCodes.mockReturnValue(true)
      const el = document.createElement('div')
      el.style.display = 'flex'

      vAuth.mounted!(el, createBinding('perm:a'), ...createMountedHookArgs())

      expect(el.style.display).toBe('flex')
    })

    it('hides element with display:none when unauthorized', () => {
      mockHasAuthCodes.mockReturnValue(false)
      const el = document.createElement('div')

      vAuth.mounted!(el, createBinding('perm:a'), ...createMountedHookArgs())

      expect(el.style.display).toBe('none')
    })

    it('restores original display when re-authorized', () => {
      mockHasAuthCodes.mockReturnValue(false)
      const el = document.createElement('div')
      el.style.display = 'flex'

      vAuth.mounted!(el, createBinding('perm:a'), ...createMountedHookArgs())
      expect(el.style.display).toBe('none')

      mockHasAuthCodes.mockReturnValue(true)
      vAuth.updated!(el, createBinding('perm:a'), ...createUpdatedHookArgs())
      expect(el.style.display).toBe('flex')
    })
  })

  describe('.disable modifier', () => {
    it('keeps element visible but adds disabled classes when unauthorized', () => {
      mockHasAuthCodes.mockReturnValue(false)
      const el = document.createElement('div')

      vAuth.mounted!(el, createBinding('perm:a', { disable: true }), ...createMountedHookArgs())

      expect(el.style.display).not.toBe('none')
      expect(el.classList.contains('p-disabled')).toBe(true)
      expect(el.classList.contains('cursor-not-allowed')).toBe(true)
      expect(el.classList.contains('opacity-50')).toBe(true)
    })

    it('sets disabled on button elements', () => {
      mockHasAuthCodes.mockReturnValue(false)
      const btn = document.createElement('button')

      vAuth.mounted!(btn, createBinding('perm:a', { disable: true }), ...createMountedHookArgs())

      expect(btn.disabled).toBe(true)
    })

    it('sets aria-disabled on non-button elements', () => {
      mockHasAuthCodes.mockReturnValue(false)
      const div = document.createElement('div')

      vAuth.mounted!(div, createBinding('perm:a', { disable: true }), ...createMountedHookArgs())

      expect(div.getAttribute('aria-disabled')).toBe('true')
      expect(div.getAttribute('tabindex')).toBe('-1')
    })

    it('removes disabled state when authorized', () => {
      mockHasAuthCodes.mockReturnValue(false)
      const btn = document.createElement('button')

      vAuth.mounted!(btn, createBinding('perm:a', { disable: true }), ...createMountedHookArgs())
      expect(btn.disabled).toBe(true)

      mockHasAuthCodes.mockReturnValue(true)
      vAuth.updated!(btn, createBinding('perm:a', { disable: true }), ...createUpdatedHookArgs())
      expect(btn.disabled).toBe(false)
      expect(btn.classList.contains('p-disabled')).toBe(false)
    })
  })

  describe('array OR logic', () => {
    it('passes value array to hasAuthCodes', () => {
      mockHasAuthCodes.mockReturnValue(true)
      const el = document.createElement('div')

      vAuth.mounted!(el, createBinding(['perm:a', 'perm:b']), ...createMountedHookArgs())

      expect(mockHasAuthCodes).toHaveBeenCalledWith(['perm:a', 'perm:b'])
    })
  })

  describe('updated hook', () => {
    it('re-evaluates on binding value change', () => {
      mockHasAuthCodes.mockReturnValue(false)
      const el = document.createElement('div')

      vAuth.mounted!(el, createBinding('perm:a'), ...createMountedHookArgs())
      expect(el.style.display).toBe('none')

      mockHasAuthCodes.mockReturnValue(true)
      vAuth.updated!(el, createBinding('perm:b'), ...createUpdatedHookArgs())
      expect(el.style.display).not.toBe('none')
    })
  })
})
