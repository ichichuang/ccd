import { del, get, head, patch, post, put } from '@/utils'
import type { VxeTableApiConfig } from './types'

export interface VxeTableApiResult<T = any> {
  list: T[]
  total?: number
  hasNext?: boolean
}

/**
 * 执行表格 API 请求，将常见返回结构统一为 { list, total, hasNext }
 */
export const executeVxeTableApi = async <T = any>(
  config: VxeTableApiConfig<T>,
  currentPage?: number,
  pageSize?: number
): Promise<VxeTableApiResult<T>> => {
  const { api, params = {}, type = 'post', infinite, pagination } = config

  // 构建请求参数
  const requestParams: Record<string, any> = { ...params }

  // 无限滚动模式：自动添加分页参数
  if (config.mode === 'infinite' && currentPage !== undefined && pageSize !== undefined) {
    const pageParam = infinite?.pageParam || 'page'
    const pageSizeParam = infinite?.pageSizeParam || 'pageSize'
    requestParams[pageParam] = currentPage
    requestParams[pageSizeParam] = pageSize
  }

  // 分页模式：自动添加分页参数
  if (config.mode === 'pagination' && currentPage !== undefined && pageSize !== undefined) {
    const pageParam = pagination?.pageParam || 'page'
    const pageSizeParam = pagination?.pageSizeParam || 'pageSize'
    requestParams[pageParam] = currentPage
    requestParams[pageSizeParam] = pageSize
  }

  // 根据请求方法类型调用对应的 HTTP 方法
  let res: any

  try {
    switch (type.toLowerCase()) {
      case 'get':
        res = await get<T[] | { list: T[]; total?: number; hasNext?: boolean }>(api, {
          params: requestParams,
        })
        break
      case 'post':
        res = await post<T[] | { list: T[]; total?: number; hasNext?: boolean }>(api, requestParams)
        break
      case 'put':
        res = await put<T[] | { list: T[]; total?: number; hasNext?: boolean }>(api, requestParams)
        break
      case 'patch':
        res = await patch<T[] | { list: T[]; total?: number; hasNext?: boolean }>(
          api,
          requestParams
        )
        break
      case 'delete':
        res = await del<T[] | { list: T[]; total?: number; hasNext?: boolean }>(api, {
          params: requestParams,
        })
        break
      case 'head':
        res = await head<T[] | { list: T[]; total?: number; hasNext?: boolean }>(api, {
          params: requestParams,
        })
        break
      default:
        console.warn(
          `[VxeTable] executeVxeTableApi: unsupported request type "${type}", fallback to POST`
        )
        res = await post<T[] | { list: T[]; total?: number; hasNext?: boolean }>(api, requestParams)
    }
  } catch (error) {
    console.error('[VxeTable] executeVxeTableApi: request failed', error)
    throw error
  }

  // 如果直接返回数组
  if (Array.isArray(res)) {
    return {
      list: res,
      total: res.length,
      hasNext: config.mode === 'infinite' ? res.length >= (pageSize || 20) : undefined,
    }
  }

  const anyRes = res as any

  // 如果返回对象包含 list
  if (Array.isArray(anyRes.list)) {
    const hasNextField =
      config.mode === 'infinite' ? infinite?.hasNextField || 'hasNext' : undefined
    let hasNext: boolean | undefined

    if (hasNextField && typeof anyRes[hasNextField] === 'boolean') {
      hasNext = anyRes[hasNextField]
    } else if (config.mode === 'infinite' && pageSize !== undefined) {
      // 如果没有 hasNext 字段，根据返回的 list 长度判断
      hasNext = anyRes.list.length >= pageSize
    }

    return {
      list: anyRes.list,
      total: typeof anyRes.total === 'number' ? anyRes.total : anyRes.list.length,
      hasNext,
    }
  }

  console.warn('[VxeTable] executeVxeTableApi: unexpected api response, fallback to empty list')

  return {
    list: [],
    total: 0,
    hasNext: false,
  }
}
