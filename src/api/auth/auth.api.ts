/**
 * 认证 API 模块
 * 登录、获取当前用户等接口，严格使用 DTO 类型
 * 禁止导入 Pinia stores，避免循环依赖
 * 对接后端时响应使用 ApiResponse<LoginResult> / ApiResponse<UserInfo>，解包 data 后返回
 */

import {
  loginParamsSchema,
  loginResultSchema,
  userInfoSchema,
  type LoginParams,
  type LoginResult,
  type UserInfo,
} from '@/types/dto/auth.dto'
import { parseZodHttpPayload } from '@/adapters/http.adapter'

/** Mock 认证错误码，供调用方程序化判断 */
export const AUTH_ERROR_CODES = {
  invalidCredentials: 'AUTH_INVALID_CREDENTIALS',
  unknownUser: 'AUTH_UNKNOWN_USER',
  tokenMissing: 'AUTH_TOKEN_MISSING',
  tokenInvalid: 'AUTH_TOKEN_INVALID',
} as const

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES]

/** 带错误码的认证异常，message 仅用于开发调试，i18n 由消费方根据 code 处理 */
export class AuthApiError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string
  ) {
    super(message)
    this.name = 'AuthApiError'
  }
}

/** Mock 用户表（仅 DEV 使用） */
const MOCK_USERS: Record<string, { userId: string; roles: string[]; permissions: string[] }> = {
  admin: { userId: '1', roles: ['admin'], permissions: ['*:*:*'] },
  user: { userId: '2', roles: ['user'], permissions: ['example:architecture:read'] },
}

/**
 * 登录 API
 * 当前为 mock 实现；对接后端时改为 post<ApiResponse<LoginResult>> 并返回 res.data
 */
export const requestAuthLogin = async (data: LoginParams): Promise<LoginResult> => {
  return requestAuthLoginMock(parseZodHttpPayload(loginParamsSchema, data))
}

/**
 * 模拟登录：仅用于本地开发测试
 * 账号密码规则：admin/123456 → 管理员，user/123456 → 普通用户
 */
export const requestAuthLoginMock = async (payload: LoginParams): Promise<LoginResult> => {
  if (!import.meta.env.DEV) {
    throw new AuthApiError(AUTH_ERROR_CODES.invalidCredentials, 'Mock auth is DEV-only')
  }

  const { username, password } = payload

  await new Promise(resolve => setTimeout(resolve, 500))

  if (password !== '123456') {
    throw new AuthApiError(AUTH_ERROR_CODES.invalidCredentials, 'Invalid credentials')
  }

  const mockUser = MOCK_USERS[username]

  if (!mockUser) {
    throw new AuthApiError(AUTH_ERROR_CODES.unknownUser, `Unsupported test account: ${username}`)
  }

  const userInfo: UserInfo = {
    userId: mockUser.userId,
    username,
    roles: mockUser.roles,
    permissions: mockUser.permissions,
    avatar: undefined,
  }

  return parseZodHttpPayload(loginResultSchema, {
    token: `mock-token-${mockUser.userId}`,
    userInfo,
  })
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
 * Token 格式：`mock-token-{userId}`，从 token 中解析 userId 进行查找
 */
export const requestAuthCurrentUserMock = async (token: string): Promise<UserInfo> => {
  if (!import.meta.env.DEV) {
    throw new AuthApiError(AUTH_ERROR_CODES.tokenInvalid, 'Mock auth is DEV-only')
  }

  await new Promise(resolve => setTimeout(resolve, 300))

  if (!token) {
    throw new AuthApiError(AUTH_ERROR_CODES.tokenMissing, 'No token provided')
  }

  const match = token.match(/^mock-token-(.+)$/)
  const userId = match?.[1]

  if (!userId) {
    throw new AuthApiError(AUTH_ERROR_CODES.tokenInvalid, 'Invalid token format')
  }

  const entry = Object.entries(MOCK_USERS).find(([, u]) => u.userId === userId)

  if (!entry) {
    throw new AuthApiError(AUTH_ERROR_CODES.tokenInvalid, 'Unknown user id in token')
  }

  const [username, mockUser] = entry

  return parseZodHttpPayload(userInfoSchema, {
    userId: mockUser.userId,
    username,
    roles: mockUser.roles,
    permissions: mockUser.permissions,
  })
}
