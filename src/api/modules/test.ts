import { del, get, post, put } from '@/utils'

/**
 * 测试 GET 接口
 */
export const testGet = () => get<string>('/test/get')

/**
 * 测试 POST 接口
 */
export const testPost = (data: { name: string }) => post<string>('/test/post', data)

/**
 * 测试 PUT 接口
 */
export const testPut = (data: { name: string }) => put<string>('/test/put', data)

/**
 * 测试 DELETE 接口
 */
export const testDelete = () => del<string>('/test/delete')
