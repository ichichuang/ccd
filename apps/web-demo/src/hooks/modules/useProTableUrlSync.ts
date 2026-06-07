import type { LocationQueryRaw } from 'vue-router'
import { useTableUrlSync } from '@ccd/vue-hooks'
import type { UseProTableUrlSyncOptions, UseProTableUrlSyncReturn } from '@ccd/vue-ui'

export function useProTableUrlSync<T extends Record<string, unknown>>(
  options: UseProTableUrlSyncOptions<T>
): UseProTableUrlSyncReturn {
  const route = useRoute()
  const router = useRouter()

  return useTableUrlSync({
    urlSync: options.urlSync,
    ctrl: options.ctrl,
    routeQuery: () => route.query,
    replaceQuery: query => router.replace({ query: query as LocationQueryRaw }),
    pushQuery: query => router.push({ query: query as LocationQueryRaw }),
  })
}
