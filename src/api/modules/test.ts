import { get } from '@/utils'

/**
 * 测试 GET 接口
 */
export const testGet = () => get<string>('/test/get')
