/**
 * 认证 API 模块
 * 登录、获取当前用户等接口，严格使用 DTO 类型
 * 禁止导入 Pinia stores，避免循环依赖
 * 演示模式显式委托给 src/demo/mock；默认通过 Alova 请求真实后端。
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
import { API_ENDPOINTS } from '@/constants/http'
import { get, post } from '@/utils/http/methods'
import {
  DEMO_MOCK_ENABLED,
  requestDemoAuthCurrentUser,
  requestDemoAuthLogin,
} from '@/demo/mock'

/**
 * 登录 API
 * 登录是一次性认证动作；响应拦截器负责解包，Zod schema 校验业务 payload。
 */
export const requestAuthLogin = async (data: LoginParams): Promise<LoginResult> => {
  const payload = parseZodHttpPayload(loginParamsSchema, data)
  if (DEMO_MOCK_ENABLED) {
    return requestDemoAuthLogin(payload)
  }

  return post<LoginResult>(API_ENDPOINTS.auth.login, payload, {
    enableCache: false,
    deduplicate: false,
    retry: { retries: 0, retryDelay: 0 },
    responseSchema: loginResultSchema,
  })
}

/**
 * 根据当前 AuthBridge token 恢复用户信息。
 */
export const requestAuthCurrentUser = async (token: string): Promise<UserInfo> => {
  if (DEMO_MOCK_ENABLED) {
    return requestDemoAuthCurrentUser(token)
  }

  return get<UserInfo>(API_ENDPOINTS.auth.currentUser, {
    enableCache: false,
    responseSchema: userInfoSchema,
  })
}
