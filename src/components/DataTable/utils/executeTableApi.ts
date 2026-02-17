/**
 * DataTable API 请求执行器
 * 统一返回 { list, total, hasNext } 结构
 *
 * 职责边界说明：
 * - 本文件是 DataTable 组件的 **通用请求执行器**，不是业务 API 定义。
 * - 它直接使用 `@/utils/http` 的 get/post 等方法，因为调用者传入的是动态 URL，
 *   非固定 endpoint，无法预定义在 `src/api/` 中。
 * - 业务特定的各 API 定义仍应遵循 PROJECT_PROTOCOL 放在 `src/api/<module>/` 下，
 *   此处仅作为 DataTable 组件的内部基础设施。
 * - 禁止在其他组件/页面中直接导入并使用 executeTableApi 来替代 `src/api/` 规范。
 *
 * 错误处理与重试策略：
 * - 请求失败时，executeTableApi 会 console.error 并 re-throw 错误。
 * - 调用方（DataTable / useTableData）捕获错误后将 apiData 置空、apiLoading 置 false。
 * - **不内置自动重试**：重试策略应由 `@/utils/http` 的拦截器或业务层配置统一管理，
 *   如需特定接口重试，可在 `DataTableApiConfig.requestOptions` 中传入重试参数。
 * - 用户可通过 expose 的 `refresh()` 方法手动触发重新加载。
 *
 * @example
 * // 在 DataTable 中配置 api 即可，内部会调用 executeTableApi：
 * // api: { api: '/api/list', mode: 'pagination', type: 'get' }
 * // api: { api: '/api/feed', mode: 'infinite', type: 'post', infinite: { pageSize: 20 } }
 */

import { del, get, getRaw, head, patch, post, put } from '@/utils/http'
import { DEFAULT_INFINITE_PAGE_SIZE } from './constants'
import type { DataTableApiConfig, SortMeta } from './types'

export interface DataTableApiResult<T = unknown> {
  list: T[]
  total?: number
  hasNext?: boolean
}

export const executeTableApi = async <T = unknown>(
  config: DataTableApiConfig<T>,
  currentPage?: number,
  pageSize?: number,
  requestOptions?: { enableCache?: boolean },
  sortState?: { sortField?: string; sortOrder?: 1 | -1 | 0; multiSortMeta?: SortMeta[] },
  filterState?: {
    globalFilterValue?: string
    filters?: Record<string, unknown>
    columnFilters?: Record<string, unknown>
  }
): Promise<DataTableApiResult<T>> => {
  const { api, params = {}, type = 'post', infinite, pagination, sort } = config
  const requestParams: Record<string, unknown> = { ...params }

  if (currentPage !== undefined && pageSize !== undefined) {
    let pageParam = 'page'
    let pageSizeParam = 'pageSize'
    if (config.mode === 'infinite') {
      pageParam = infinite?.pageParam || 'page'
      pageSizeParam = infinite?.pageSizeParam || 'pageSize'
    } else if (config.mode === 'pagination') {
      pageParam = pagination?.pageParam || 'page'
      pageSizeParam = pagination?.pageSizeParam || 'pageSize'
    }
    requestParams[pageParam] = currentPage
    requestParams[pageSizeParam] = pageSize
  }

  // Add Sort Params (single or multi)
  if (sortState?.multiSortMeta && sortState.multiSortMeta.length > 0) {
    const multiSortParam = sort?.multiSortParam || 'multiSort'
    requestParams[multiSortParam] = sortState.multiSortMeta
  } else if (sortState?.sortField) {
    const sortFieldParam = sort?.sortFieldParam || 'sortField'
    const sortOrderParam = sort?.sortOrderParam || 'sortOrder'
    requestParams[sortFieldParam] = sortState.sortField
    requestParams[sortOrderParam] = sortState.sortOrder
  }

  // Add Filter Params (Global)
  if (filterState?.globalFilterValue) {
    const filterParam = config.filter?.filterParam || 'globalFilter'
    requestParams[filterParam] = filterState.globalFilterValue
  }

  // Add Column Filters
  if (filterState?.columnFilters && Object.keys(filterState.columnFilters).length > 0) {
    const filterMode = config.filter?.filterMode || 'combined'
    if (filterMode === 'individual') {
      // Each column filter as a separate request parameter
      for (const [field, value] of Object.entries(filterState.columnFilters)) {
        if (value != null && value !== '') requestParams[field] = value
      }
    } else {
      // Combined: send as a single JSON object
      const columnFilterParam = config.filter?.columnFilterParam || 'columnFilters'
      requestParams[columnFilterParam] = filterState.columnFilters
    }
  }

  const method = type.toLowerCase()
  let res: unknown

  try {
    if (['get', 'delete', 'head'].includes(method)) {
      const opts = { params: requestParams, ...requestOptions }
      if (method === 'get') {
        // 如果是分页模式，尝试使用 getRaw 获取 header 中的总数
        if (config.mode === 'pagination') {
          try {
            const { data, headers } = await getRaw<T[] | DataTableApiResult<T>>(api, opts)
            res = data
            // 尝试读取 x-total-count
            const totalHeader = headers.get('x-total-count')
            if (totalHeader) {
              // 如果 res 是数组，我们需要手动构造成 { list, total }
              if (Array.isArray(res)) {
                res = {
                  list: res,
                  total: Number(totalHeader),
                  hasNext: false, // Pagination mode doesn't need hasNext usually
                }
              } else if (res && typeof res === 'object') {
                // 如果已经是对象，注入 total
                const resObj = res as Record<string, unknown>
                resObj.total = Number(totalHeader)
              }
            }
          } catch (e) {
            // Fallback to normal get if raw fails (e.g. CORS hiding headers)
            console.warn('getRaw failed, falling back to normal get', e)
            res = await get<T[] | DataTableApiResult<T>>(api, opts)
          }
        } else {
          res = await get<T[] | DataTableApiResult<T>>(api, opts)
        }
      } else if (method === 'delete') {
        res = await del<T[] | DataTableApiResult<T>>(api, opts)
      } else {
        // method === 'head'
        res = await head(api, opts)
      }
    } else {
      // For 'put', 'patch', 'post'
      const opts = requestOptions
      if (method === 'put') {
        res = await put<T[] | DataTableApiResult<T>>(api, requestParams, opts)
      } else if (method === 'patch') {
        res = await patch<T[] | DataTableApiResult<T>>(api, requestParams, opts)
      } else {
        // method === 'post'
        res = await post<T[] | DataTableApiResult<T>>(api, requestParams, opts)
      }
    }
  } catch (error) {
    console.error('[DataTable] executeTableApi failed', error)
    throw error
  }

  if (res == null) return { list: [], total: 0, hasNext: false }
  if (Array.isArray(res)) {
    return {
      list: res,
      total: res.length,
      hasNext:
        config.mode === 'infinite'
          ? res.length >= (pageSize ?? DEFAULT_INFINITE_PAGE_SIZE)
          : undefined,
    }
  }

  const obj = res as Record<string, unknown>
  if (Array.isArray(obj.list)) {
    const hasNextField =
      config.mode === 'infinite' ? infinite?.hasNextField || 'hasNext' : undefined
    let hasNext: boolean | undefined
    if (hasNextField && typeof obj[hasNextField] === 'boolean') {
      hasNext = obj[hasNextField] as boolean
    } else if (config.mode === 'infinite' && pageSize !== undefined) {
      hasNext = obj.list.length >= pageSize
    }
    return {
      list: obj.list as T[],
      total: typeof obj.total === 'number' ? obj.total : obj.list.length,
      hasNext,
    }
  }

  return { list: [], total: 0, hasNext: false }
}
