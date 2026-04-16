import { generateIdFromKey } from '@/utils/ids'
import type { LocationQueryRaw } from 'vue-router'

/**
 * 基于路由名 + 查询参数生成稳定窗口标识。
 * 该规则同时服务于浏览器子窗口与桌面端子窗口，避免多处漂移。
 */
export const createWindowKey = (name: string, query?: LocationQueryRaw): string => {
  return `route-${generateIdFromKey(`${name}:${JSON.stringify(query ?? {})}`)}`
}
