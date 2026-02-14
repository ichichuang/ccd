// 用户相关类型定义
// 该文件用于集中维护 UserInfo 及后续用户接口 DTO 类型

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

/** 登录请求参数（测试用假登录） */
export interface UserLoginReq {
  username: string
  password: string
}

/** 登录响应结果（测试用假登录） */
export interface UserLoginRes {
  token: string
  userInfo: UserInfo
}
