import type { ComputedRef, Ref } from 'vue'
import { useRequest } from 'alova/client'
import type { Alova, AlovaGenerics, Method, RespondedAlovaGenerics } from 'alova'
import type { RequestHookConfig } from 'alova/client'

import { alovaInstance } from '@/utils/http/instance'
import { isHttpRequestError } from '@/utils/http/errors'
import type { HttpRequestError } from '@/utils/http/types'
import { validateResponse } from '@/utils/http/validation'
import type { HttpResponseSchema } from '@/utils/http/validation'
import { useLoading } from '@/hooks/layout/useLoading'

/**
 * useHttpRequest 扩展配置
 */
type BaseAlovaAG = typeof alovaInstance extends Alova<infer AG> ? AG : AlovaGenerics
type HttpAG<TData> = RespondedAlovaGenerics<BaseAlovaAG, TData, unknown>
type HttpArgs = unknown[]
type HttpRequestHookConfig<TData> = RequestHookConfig<HttpAG<TData>, HttpArgs>

export interface UseHttpRequestOptions<TData = unknown> extends HttpRequestHookConfig<TData> {
  /** 是否与全局 loading 联动：true 时在请求前调用 loadingStart()，请求结束后调用 loadingDone() */
  globalLoading?: boolean
  /** API/HTTP boundary schema. Invalid payloads throw HttpRequestError(ErrorType.VALIDATION). */
  responseSchema?: HttpResponseSchema<TData>
}

/**
 * UseHttpRequestResult
 * 保持干净的返回类型，将 error 收窄为 HttpRequestError
 */
export interface UseHttpRequestResult<TData> {
  loading: Ref<boolean>
  data: Ref<TData | undefined>
  error: ComputedRef<HttpRequestError | null>
  /** 原始错误：当非 HttpRequestError（如网络异常、TypeError）被捕获时暴露，避免静默丢失 */
  rawError: ComputedRef<unknown>
  send: (...args: unknown[]) => Promise<TData>
}

/**
 * useHttpRequest
 * 对 Alova useRequest 的强类型封装
 *
 * @param buildMethod 构建请求方法的工厂函数，强制要求返回 Method 实例
 * @param options Alova 的配置项；globalLoading=true 时与全局 loading 联动
 */
export function useHttpRequest<TData = unknown>(
  buildMethod: (client: typeof alovaInstance) => Method<HttpAG<TData>>,
  options?: UseHttpRequestOptions<TData>
): UseHttpRequestResult<TData> {
  const {
    globalLoading = false,
    middleware: userMiddleware,
    responseSchema,
    ...alovaOptions
  } = options ?? {}

  const { startLoading } = useLoading()

  const runMiddleware: NonNullable<HttpRequestHookConfig<TData>['middleware']> = async (
    context,
    next
  ) => {
    const result = await (userMiddleware ? userMiddleware(context, next) : next())
    return responseSchema ? validateResponse(responseSchema, result) : result
  }

  const mergedMiddleware: HttpRequestHookConfig<TData>['middleware'] = globalLoading
    ? async (context, next) => {
        const stopLoading = startLoading()
        try {
          return await runMiddleware(context, next)
        } finally {
          stopLoading()
        }
      }
    : responseSchema
      ? runMiddleware
      : userMiddleware

  const mergedOptions: HttpRequestHookConfig<TData> = {
    ...alovaOptions,
    ...(mergedMiddleware ? { middleware: mergedMiddleware } : {}),
  }

  // 1. 构建请求实例
  const method = buildMethod(alovaInstance)

  // 2. 调用 alova hook
  const base = useRequest(method, mergedOptions)

  // 3. 类型收窄：将 unknown 的 error 转换为强类型的 HttpRequestError
  const typedError = computed<HttpRequestError | null>(() => {
    const raw = base.error.value
    return isHttpRequestError(raw) ? raw : null
  })

  const rawError = computed<unknown>(() => base.error.value)

  return {
    loading: base.loading,
    data: base.data,
    error: typedError,
    rawError,
    send: base.send,
  }
}
