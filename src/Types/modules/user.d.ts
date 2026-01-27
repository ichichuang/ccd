// 声明全局类型
declare global {
  /** 用户信息接口 */
  interface UserInfo {
    /** 用户ID */
    userId: string
    /** 用户名 */
    username: string
    /** 用户角色 */
    roles: string[]
    /** 用户权限 */
    permissions: string[]
    /** 用户头像 */
    avatar?: string
    /** 用户邮箱 */
    email?: string
    /** 用户手机号 */
    phone?: string
    /** 其他用户信息 */
    [key: string]: any
  }
}
