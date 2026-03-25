import { AUTH_ENABLED } from '@/constants/router'
import { useUserStoreWithOut } from '@/stores/modules/user'
import type { DirectiveBinding, ObjectDirective } from 'vue'

/**
 * v-auth 2.0 指令：按钮/操作级权限控制
 *
 * 用法：
 *   v-auth="'system:user:create'"                  — 单个权限
 *   v-auth="['system:user:create', 'system:user:edit']" — 数组 OR（任一满足）
 *
 * 行为：
 *   - 权限不足时使用 display:none 隐藏元素（可恢复）
 *   - mounted + updated 双生命周期，运行时响应权限变化
 *   - '*:*:*' 通配符视为超级权限
 */

type AuthDirectiveValue = string | string[]

/** Symbol key: 保存元素原始 display 值，避免属性冲突 */
const AUTH_ORIGINAL_DISPLAY: unique symbol = Symbol('v-auth-display')

/** 扩展 HTMLElement 以存储原始 display 值 */
interface AuthElement extends HTMLElement {
  [AUTH_ORIGINAL_DISPLAY]?: string
}

/** 检查当前用户是否满足权限要求 */
function checkAuthPermission(value: AuthDirectiveValue): boolean {
  if (!AUTH_ENABLED) return true
  if (!value || (Array.isArray(value) && value.length === 0)) return true

  const userStore = useUserStoreWithOut()
  const perms: string[] = userStore.userInfo.permissions

  if (perms.includes('*:*:*')) return true

  const required: string[] = Array.isArray(value) ? value : [value]
  return required.some((auth: string) => perms.includes(auth))
}

/** 根据权限检查结果控制元素显隐 */
function applyAuthVisibility(el: AuthElement, binding: DirectiveBinding<AuthDirectiveValue>): void {
  const hasPermission: boolean = checkAuthPermission(binding.value)

  if (hasPermission) {
    // 恢复原始 display（如果之前被隐藏过）
    if (AUTH_ORIGINAL_DISPLAY in el) {
      el.style.display = el[AUTH_ORIGINAL_DISPLAY] ?? ''
    }
  } else {
    // 首次隐藏时保存原始 display 值
    if (!(AUTH_ORIGINAL_DISPLAY in el)) {
      el[AUTH_ORIGINAL_DISPLAY] = el.style.display
    }
    el.style.display = 'none'
  }
}

export const vAuth: ObjectDirective<HTMLElement, AuthDirectiveValue> = {
  mounted: applyAuthVisibility,
  updated: applyAuthVisibility,
}
