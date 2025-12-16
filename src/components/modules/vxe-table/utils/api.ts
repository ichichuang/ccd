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
  pageSize?: number,
  requestOptions?: Record<string, any> // 新增：允许传入额外的请求配置（如 { enableCache: false }）
): Promise<VxeTableApiResult<T>> => {
  const { api, params = {}, type = 'post', infinite, pagination } = config

  // 1. 构建基础请求参数（克隆 params 防止污染源对象）
  const requestParams: Record<string, any> = { ...params }

  // 2. 注入分页参数
  // 只要传入了分页信息（currentPage/pageSize），就强制注入
  if (currentPage !== undefined && pageSize !== undefined) {
    let pageParam = 'page'
    let pageSizeParam = 'pageSize'

    // 根据模式获取自定义参数名
    if (config.mode === 'infinite') {
      pageParam = infinite?.pageParam || 'page'
      pageSizeParam = infinite?.pageSizeParam || 'pageSize'
    } else if (config.mode === 'pagination') {
      pageParam = pagination?.pageParam || 'page'
      pageSizeParam = pagination?.pageSizeParam || 'pageSize'
    }

    // 写入参数
    requestParams[pageParam] = currentPage
    requestParams[pageSizeParam] = pageSize
  }

  // 🔍 调试日志：确认最终发送的参数
  // console.log('[VxeTableApi] Executing request:', {
  //   api,
  //   type,
  //   mode: config.mode,
  //   currentPage,
  //   pageSize,
  //   finalParams: requestParams,
  // })

  // 3. 发送请求
  let res: any
  try {
    const method = type.toLowerCase()

    // GET / DELETE / HEAD：使用 params 传参
    if (['get', 'delete', 'head'].includes(method)) {
      // 对于 GET/DELETE/HEAD，配置项放在第二个参数中
      if (method === 'get') {
        res = await get<T[] | { list: T[]; total?: number; hasNext?: boolean }>(api, {
          params: requestParams,
          ...requestOptions, // 注入额外配置
        })
      } else if (method === 'delete') {
        res = await del<T[] | { list: T[]; total?: number; hasNext?: boolean }>(api, {
          params: requestParams,
          ...requestOptions, // 注入额外配置
        })
      } else {
        res = await head<T[] | { list: T[]; total?: number; hasNext?: boolean }>(api, {
          params: requestParams,
          ...requestOptions, // 注入额外配置
        })
      }
    } else {
      // POST / PUT / PATCH：直接把分页和业务参数放到 body 中
      // 对于 POST/PUT/PATCH，配置项是第三个参数
      if (method === 'put') {
        res = await put<T[] | { list: T[]; total?: number; hasNext?: boolean }>(
          api,
          requestParams,
          requestOptions // 注入额外配置
        )
      } else if (method === 'patch') {
        res = await patch<T[] | { list: T[]; total?: number; hasNext?: boolean }>(
          api,
          requestParams,
          requestOptions // 注入额外配置
        )
      } else {
        // 默认 POST
        res = await post<T[] | { list: T[]; total?: number; hasNext?: boolean }>(
          api,
          requestParams,
          requestOptions // 注入额外配置
        )
      }
    }
  } catch (error) {
    console.error('[VxeTable] executeVxeTableApi: request failed', error)
    throw error
  }

  // 4. 处理返回结果
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

  return {
    list: [],
    total: 0,
    hasNext: false,
  }
}
