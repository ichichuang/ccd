/**
 * 用户模块类型定义
 * UserInfo / LoginParams / LoginResult 已迁移至 src/api/types/auth.ts
 */

/**
 * 用户详情接口响应 DTO（后端契约）
 * 作为 End-to-End Type Safety 的单一来源，前端 UI 模型应 Pick 自此类型
 */
export interface UserDetailResDTO {
  id: string
  username: string
  email: string
  role: 'Admin' | 'User' | 'Operator'
  status: 'Active' | 'Inactive'
  createdAt: string
  permissions: string[]
}
