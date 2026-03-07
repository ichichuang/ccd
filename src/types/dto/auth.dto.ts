/**
 * 认证相关 DTO（Data Transfer Objects）
 * 作为 Login / CurrentUser 等接口的单一类型来源
 */

/** 用户信息（登录态） */
export interface UserInfo {
  /** 用户唯一标识 */
  userId: string
  /** 用户名 */
  username: string
  /** 角色列表，用于页面级权限控制 */
  roles: string[]
  /** 按钮/操作级权限标识 */
  permissions: string[]
  /** 头像地址（可选） */
  avatar?: string
  /** 邮箱（可选） */
  email?: string
  /** 手机号（可选） */
  phone?: string
}

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录响应结果 */
export interface LoginResult {
  token: string
  userInfo: UserInfo
}
