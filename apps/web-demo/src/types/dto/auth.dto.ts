/**
 * 认证相关 DTO（Data Transfer Objects）
 * Zod schemas are the runtime SSOT; exported TS aliases are derived from them.
 */

import { z } from 'zod'

/** 用户信息（登录态） */
export const userInfoSchema = z.object({
  /** 用户唯一标识 */
  userId: z.string().min(1),
  /** 用户名 */
  username: z.string().min(1),
  /** 角色列表，用于页面级权限控制 */
  roles: z.array(z.string()),
  /** 按钮/操作级权限标识（约定 `module:feature:action`，如 `system:user:create`） */
  permissions: z.array(z.string()),
  /** 头像地址（可选） */
  avatar: z.string().optional(),
  /** 邮箱（可选） */
  email: z.string().optional(),
  /** 手机号（可选） */
  phone: z.string().optional(),
})

/** 登录请求参数 */
export const loginParamsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

/** 登录响应结果 */
export const loginResultSchema = z.object({
  token: z.string().min(1),
  userInfo: userInfoSchema,
})

export type UserInfo = z.infer<typeof userInfoSchema>
export type LoginParams = z.infer<typeof loginParamsSchema>
export type LoginResult = z.infer<typeof loginResultSchema>
