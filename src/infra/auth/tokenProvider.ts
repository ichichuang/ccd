/**
 * Token Provider（依赖注入）
 * 基础设施层提供 token 的抽象，避免 HTTP 层直接依赖 Pinia store，满足 Infra → State 边界约束。
 */

export type TokenProvider = () => string | undefined | null

let provider: TokenProvider | null = null

export function setTokenProvider(fn: TokenProvider): void {
  provider = fn
}

export function getToken(): string | undefined | null {
  return provider?.()
}

/** 401 未授权时的回调（由应用入口注入，如调用 userStore.logout） */
export type OnUnauthorized = () => void | Promise<void>

let onUnauthorized: OnUnauthorized | null = null

export function setOnUnauthorized(fn: OnUnauthorized): void {
  onUnauthorized = fn
}

export function triggerUnauthorized(): void {
  onUnauthorized?.()
}
