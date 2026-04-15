/**
 * 认证 API 模块
 * 登录、获取当前用户等接口，严格使用 DTO 类型
 * 禁止导入 Pinia stores，避免循环依赖
 * 对接后端时响应使用 ApiResponse<LoginResult> / ApiResponse<UserInfo>，解包 data 后返回
 */

import type { LoginParams, LoginResult, UserInfo } from '@/types/dto/auth.dto'

/**
 * 登录 API
 * 当前为 mock 实现；对接后端时改为 post<ApiResponse<LoginResult>> 并返回 res.data
 */
export const requestAuthLogin = async (data: LoginParams): Promise<LoginResult> => {
  return requestAuthLoginMock(data)
}

/**
 * 模拟登录：仅用于本地开发测试
 * 账号密码规则：admin/123456 → 管理员，user/123456 → 普通用户
 */
export const requestAuthLoginMock = async (payload: LoginParams): Promise<LoginResult> => {
  const { username, password } = payload

  await new Promise(resolve => setTimeout(resolve, 500))

  if (password !== '123456') {
    throw new Error('用户名或密码错误')
  }

  let userInfo: UserInfo

  if (username === 'admin') {
    userInfo = {
      userId: '1',
      username: 'admin',
      roles: ['admin'],
      permissions: ['*:*:*'],
      avatar: undefined,
    }
  } else if (username === 'user') {
    userInfo = {
      userId: '2',
      username: 'user',
      roles: ['user'],
      permissions: [],
      avatar: undefined,
    }
  } else {
    throw new Error('当前测试环境只支持 admin / user 两个账号')
  }

  return {
    token: `mock-token-${userInfo.userId}`,
    userInfo,
  }
}

/**
 * 获取当前用户 API（对接后端时使用）
 * 当前为 mock 实现，真正对接时改为：get<UserInfo>(AUTH_CURRENT_USER_URL)
 */
export const requestAuthCurrentUser = async (token: string): Promise<UserInfo> => {
  return requestAuthCurrentUserMock(token)
}

/**
 * 模拟「根据 token 获取当前用户信息」
 */
export const requestAuthCurrentUserMock = async (token: string): Promise<UserInfo> => {
  await new Promise(resolve => setTimeout(resolve, 300))

  if (!token) {
    throw new Error('未提供 token')
  }

  if (token.includes('mock-token-1')) {
    return {
      userId: '1',
      username: 'admin',
      roles: ['admin'],
      permissions: ['*:*:*'],
    }
  }

  if (token.includes('mock-token-2')) {
    return {
      userId: '2',
      username: 'user',
      roles: ['user'],
      permissions: [],
    }
  }

  throw new Error('无效的登录状态，请重新登录')
}
