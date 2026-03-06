import type { UserDetailResDTO } from '@/api/user/types'
import type { BaseBusinessDTO, UIDesignState } from '@/types/design-state'

/**
 * DataTable 行模型 — 从 API DTO Pick，确保后端字段变更时编译报错
 */
export interface UserTableRowModel
  extends BaseBusinessDTO, Pick<UserDetailResDTO, 'id' | 'username' | 'role' | 'status'> {}

/**
 * Edit SchemaForm 表单模型 — 从 API DTO Pick
 */
export interface UserEditFormModel
  extends BaseBusinessDTO, Pick<UserDetailResDTO, 'id' | 'username' | 'role' | 'permissions'> {}

/**
 * CRUD 示例页面状态契约
 * intent=data-management → 据 INTENT_PROFILES 派生 archetype/density/hierarchy 等
 */
export const pageState: UIDesignState = {
  intent: 'data-management',
  archetype: 'A4-table-drawer',
  density: 'compact',
  hierarchy: 'action-first',
  emphasis: 'low',
  ctaPolicy: 'single-primary',
}
