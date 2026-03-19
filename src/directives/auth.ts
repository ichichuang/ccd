import { AUTH_ENABLED } from '@/constants/router'
import { useUserStoreWithOut } from '@/stores/modules/user'
import type { DirectiveBinding, ObjectDirective } from 'vue'

/**
 * v-auth 指令：按钮/操作级权限控制
 * 用法：v-auth="'system:user:create'"
 * 若当前用户不具备所需权限，DOM 元素将被从页面中移除
 */
export const vAuth: ObjectDirective<HTMLElement, string> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    if (!AUTH_ENABLED) return
    const required = binding.value
    if (!required) return
    const userStore = useUserStoreWithOut()
    const perms = userStore.userInfo.permissions
    if (!perms.includes('*:*:*') && !perms.includes(required)) {
      el.remove()
    }
  },
}
