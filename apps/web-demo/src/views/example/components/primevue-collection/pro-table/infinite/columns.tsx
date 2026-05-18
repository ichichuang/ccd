/**
 * 无限滚动示例与 server 列表共用同一套列定义，避免与 Hono 用户 schema 漂移。
 */
export { serverTableColumns as infiniteTableColumns } from '../server/columns'
export type { V1UserListItemDTO } from '@/api/example/users'
