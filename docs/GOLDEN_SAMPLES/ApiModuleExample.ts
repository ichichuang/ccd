/**
 * 黄金样本：API Module 写法
 * 参考自 src/api/ 各模块实际业务文件
 * AI 生成 API 模块时请严格模仿本文件的结构与风格（Types + Method Builders + Request Functions）。
 *
 * 路径规范：src/api/<module>/<feature>.ts（仅允许两级，禁止三级目录）
 *
 * NOTE: 本文件位于 docs/，@/ 路径别名不会生效（TS lint 报错可忽略）。
 *       实际业务代码中 @/ 指向 src/，路径解析正常。
 */
import { alovaInstance } from '@/utils/http/instance'

// ======================================================================
// 1. 类型定义（DTO / Req / Res）
//    命名必须带领域前缀，禁止通用名 (get/list/data/request/config/params)
// ======================================================================

/** 用户列表请求参数 */
export interface UserListReq {
  page: number
  pageSize: number
  keyword?: string
  status?: 'active' | 'inactive'
}

/** 用户列表响应 DTO */
export interface UserListDTO {
  id: number
  username: string
  email: string
  avatar?: string
  status: 'active' | 'inactive'
  createdAt: string
}

/** 用户列表分页响应 */
export interface UserListRes {
  list: UserListDTO[]
  total: number
  page: number
  pageSize: number
}

/** 用户详情响应 */
export interface UserDetailRes {
  id: number
  username: string
  email: string
  avatar?: string
  phone?: string
  roles: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

/** 用户创建请求 */
export interface UserCreateReq {
  username: string
  email: string
  password: string
  roles?: string[]
}

/** 用户更新请求 */
export interface UserUpdateReq {
  username?: string
  email?: string
  phone?: string
  roles?: string[]
  status?: 'active' | 'inactive'
}

// ======================================================================
// 2. Method Builders（供 useHttpRequest 使用）
//    命名：build<Domain><Feature>Method
//    返回 Alova Method 实例，由 Hook 层调用
// ======================================================================

/** 构建用户列表请求方法 */
export function buildUserListMethod(params: UserListReq) {
  return alovaInstance.Get<UserListRes>('/user/list', { params })
}

/** 构建用户详情请求方法 */
export function buildUserDetailMethod(id: number) {
  return alovaInstance.Get<UserDetailRes>(`/user/${id}`)
}

/** 构建用户创建请求方法 */
export function buildUserCreateMethod(data: UserCreateReq) {
  return alovaInstance.Post<{ id: number }>('/user', data)
}

/** 构建用户更新请求方法 */
export function buildUserUpdateMethod(id: number, data: UserUpdateReq) {
  return alovaInstance.Put<void>(`/user/${id}`, data)
}

/** 构建用户删除请求方法 */
export function buildUserDeleteMethod(id: number) {
  return alovaInstance.Delete<void>(`/user/${id}`)
}

// ======================================================================
// 3. 便捷请求函数（可选，供非 Hook 场景直接调用）
//    命名：request<Domain><Feature>
//    直接发送请求并返回 Promise
// ======================================================================

/** 请求用户列表 */
export function requestUserList(params: UserListReq) {
  return buildUserListMethod(params).send()
}

/** 请求用户详情 */
export function requestUserDetail(id: number) {
  return buildUserDetailMethod(id).send()
}
