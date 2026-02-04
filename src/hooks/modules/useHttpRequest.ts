import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useRequest } from 'alova/client'
import type { AlovaGenerics, Method } from 'alova'
import type { RequestHookConfig } from 'alova/client'

import { alovaInstance } from '@/utils/http/instance'
import { isHttpRequestError } from '@/utils/http/errors'
import type { HttpRequestError } from '@/utils/http/types'

/**
 * UseHttpRequestResult
 * 保持干净的返回类型，将 error 收窄为 HttpRequestError
 */
export interface UseHttpRequestResult<TData> {
  loading: Ref<boolean>
  data: Ref<TData | undefined>
  error: ComputedRef<HttpRequestError | null>
  send: (...args: unknown[]) => Promise<TData>
  // 可以根据需要暴露更多 alova 原生返回值，如 onSuccess 等
}

type HttpAG<TData> = AlovaGenerics<TData, any, any, any, any, any, any, any>

/**
 * useHttpRequest
 * 对 Alova useRequest 的强类型封装
 *
 * @param buildMethod 构建请求方法的工厂函数，强制要求返回 Method 实例
 * @param options Alova 的配置项，获得完整的代码提示
 */
export function useHttpRequest<TData = unknown>(
  buildMethod: (client: typeof alovaInstance) => Method<HttpAG<TData>>,
  options?: RequestHookConfig<HttpAG<TData>, any>
): UseHttpRequestResult<TData> {
  // 1. 构建请求实例
  const method = buildMethod(alovaInstance)

  // 2. 调用 alova hook
  const base = useRequest(method, options)

  // 3. 类型收窄：将 unknown 的 error 转换为强类型的 HttpRequestError
  const typedError = computed<HttpRequestError | null>(() => {
    const raw = base.error.value
    return isHttpRequestError(raw) ? raw : null
  })

  return {
    loading: base.loading,
    data: base.data,
    error: typedError,
    send: base.send as unknown as (...args: unknown[]) => Promise<TData>,
  }
}
