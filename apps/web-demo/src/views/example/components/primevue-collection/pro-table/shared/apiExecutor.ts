import type { ProTableApiExecutor } from '@ccd/vue-ui'
import { requestUserList } from '@/api/example/users'

export const userListApiExecutor: ProTableApiExecutor = ({ method, query, config }) => {
  if (method !== 'GET') {
    return Promise.reject(new Error(`Unsupported ProTable users method: ${method}`))
  }

  return requestUserList(
    {
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 10),
      sortBy: typeof query.sortBy === 'string' ? query.sortBy : undefined,
      order: typeof query.order === 'string' ? query.order : undefined,
      search: typeof query.search === 'string' ? query.search : undefined,
      gender: typeof query.gender === 'string' ? query.gender : undefined,
    },
    config
  )
}
