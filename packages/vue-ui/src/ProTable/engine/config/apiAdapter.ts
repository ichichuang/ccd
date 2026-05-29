import type {
  ProTableApiConfig,
  ProTableLoadParams,
  ProTableRequestResult,
  SearchPathResolver,
} from '../types/props'
import { castArray, isRecord, objectGet } from '@ccd/shared-utils'

/**
 * ProTable 自治拉取：将表格标准参数转为通用 REST 风格 query。
 * 统一使用 page / limit / sortBy / order / search。
 */
export function formatRequestParams(params: ProTableLoadParams): Record<string, string | number> {
  const { page, pageSize, sort, filter } = params
  const out: Record<string, string | number> = {
    page,
    limit: pageSize,
  }
  if (sort.field) out.sortBy = sort.field
  if (sort.direction) out.order = sort.direction
  const q = filter.global?.trim()
  if (q) out.search = q
  return out
}

/**
 * 从原始 JSON 响应解包列表与 total；路径与 `data-key` / `total-key` 对齐。
 */
export function formatResponseData<T extends Record<string, unknown>>(
  res: unknown,
  dataKey: string,
  totalKey: string
): ProTableRequestResult<T> {
  const dataRaw = dataKey ? objectGet(res, dataKey) : res
  if (!Array.isArray(dataRaw)) {
    throw new Error(`ProTable: data-key "${dataKey}" did not resolve to an array`)
  }
  if (!dataRaw.every(isRecord)) {
    throw new Error(`ProTable: data-key "${dataKey}" resolved to an array with invalid row shape`)
  }

  let total = 0
  if (totalKey) {
    const totalRaw = objectGet(res, totalKey)
    total = Number(totalRaw)
  }
  if (!totalKey || !Number.isFinite(total)) {
    total = dataRaw.length > 0 ? 100 : 0
  }

  return { data: castArray<Record<string, unknown>, T>(dataRaw), total }
}

/**
 * 默认搜索路径解析器：纯 REST 模式，不做路径改写。
 */
function defaultSearchPathResolver(
  baseUrl: string,
  _query: Record<string, string | number | boolean | undefined>
): string {
  return baseUrl
}

/**
 * 解析最终 API URL。resolver=false 完全禁用路径改写。
 */
export function resolveApiUrl(
  baseUrl: string,
  query: Record<string, string | number | boolean | undefined>,
  resolver?: SearchPathResolver | false
): string {
  if (resolver === false) return baseUrl
  return (resolver ?? defaultSearchPathResolver)(baseUrl, query)
}

export function buildApiExecutorConfig(
  apiConfig: ProTableApiConfig | undefined,
  signal?: AbortSignal
): ProTableApiConfig {
  return {
    ...apiConfig,
    enableCache: apiConfig?.enableCache ?? false,
    cancelStrategy: apiConfig?.cancelStrategy ?? 'cancelPrevious',
    ...(signal ? { signal } : {}),
  }
}
