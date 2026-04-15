import { hasAuthCodes } from '@/hooks/modules/useAuth'
import type { DirectiveBinding, ObjectDirective } from 'vue'

/**
 * v-auth 指令：按钮/操作级权限控制
 *
 * 用法：
 *   v-auth="'system:user:create'"
 *   v-auth="['system:user:create', 'system:user:edit']" — 数组 OR（任一满足）
 *   v-auth.disable="'dashboard:quick-action:write'" — 无权限时禁用并展示（不隐藏 DOM）
 *
 * 行为：
 *   - 默认：无权限 display:none（可恢复）
 *   - .disable：无权限时保持可见，disabled + PrimeVue / Uno 禁用样式
 *   - '*:*:*' 视为超级权限
 */

type AuthDirectiveValue = string | string[]

const AUTH_ORIGINAL_DISPLAY: unique symbol = Symbol('v-auth-display')

const DISABLE_CLASSES = ['p-disabled', 'cursor-not-allowed', 'opacity-50'] as const

interface AuthElement extends HTMLElement {
  [AUTH_ORIGINAL_DISPLAY]?: string
}

function setNativeDisabled(el: HTMLElement, disabled: boolean): void {
  if (
    el instanceof HTMLButtonElement ||
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  ) {
    el.disabled = disabled
    return
  }
  if (disabled) {
    el.setAttribute('aria-disabled', 'true')
    el.setAttribute('tabindex', '-1')
  } else {
    el.removeAttribute('aria-disabled')
    el.removeAttribute('tabindex')
  }
}

function applyDisableStyling(el: AuthElement, disabled: boolean): void {
  for (const c of DISABLE_CLASSES) {
    el.classList.toggle(c, disabled)
  }
}

function applyAuth(el: AuthElement, binding: DirectiveBinding<AuthDirectiveValue>): void {
  const useDisable: boolean = binding.modifiers.disable === true
  const allowed: boolean = hasAuthCodes(binding.value)

  if (allowed) {
    if (AUTH_ORIGINAL_DISPLAY in el) {
      el.style.display = el[AUTH_ORIGINAL_DISPLAY] ?? ''
    }
    setNativeDisabled(el, false)
    applyDisableStyling(el, false)
    return
  }

  if (useDisable) {
    if (!(AUTH_ORIGINAL_DISPLAY in el)) {
      el[AUTH_ORIGINAL_DISPLAY] = el.style.display
    }
    const saved: string = el[AUTH_ORIGINAL_DISPLAY] ?? ''
    el.style.display = saved === 'none' ? '' : saved

    setNativeDisabled(el, true)
    applyDisableStyling(el, true)
    return
  }

  setNativeDisabled(el, false)
  applyDisableStyling(el, false)

  if (!(AUTH_ORIGINAL_DISPLAY in el)) {
    el[AUTH_ORIGINAL_DISPLAY] = el.style.display
  }
  el.style.display = 'none'
}

export const vAuth: ObjectDirective<HTMLElement, AuthDirectiveValue> = {
  mounted: applyAuth,
  updated: applyAuth,
}
