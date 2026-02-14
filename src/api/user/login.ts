// 测试用假的登录接口，仅在前端做用户名密码校验
// 真正对接后端时，可以在保持函数签名不变的前提下，改为调用 alova 实例

import type { UserInfo, UserLoginReq, UserLoginRes } from './types'

/**
 * 模拟后端登录：仅用于本地开发测试
 * 账号密码规则：
 *  - admin / 123456  → 管理员
 *  - user  / 123456  → 普通用户
 */
export const requestUserLoginMock = async (payload: UserLoginReq): Promise<UserLoginRes> => {
  const { username, password } = payload

  // 简单延时，模拟网络请求耗时
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
      permissions: ['demo:read'],
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
 * 模拟“根据 token 获取当前用户信息”
 * 实际项目中会从后端获取，这里仅做占位，方便后续对接
 */
export const requestCurrentUserMock = async (token: string): Promise<UserInfo> => {
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
      permissions: ['demo:read'],
    }
  }

  throw new Error('无效的登录状态，请重新登录')
}
