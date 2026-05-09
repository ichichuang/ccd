import type { LocationQueryRaw } from 'vue-router'
import type { TableController } from '../core/TableController'
import type { ProTableUrlSyncOptions } from '../types/props'

export interface UseProTableUrlSyncOptions<T extends Record<string, unknown>> {
  urlSync: boolean | ProTableUrlSyncOptions | undefined
  ctrl: TableController<T>
}

export interface UseProTableUrlSyncReturn {
  /** Call in onMounted to apply initial route query to table state. */
  applyInitialRoute: () => void
  /** Cleanup watchers (called automatically on scope dispose). */
  destroy: () => void
}

interface ResolvedUrlSyncConfig {
  enabled: boolean
  mode: 'replace' | 'push'
  keys: {
    page: string
    pageSize: string
    sortField: string
    sortDirection: string
    keyword: string
  }
}

const DEFAULT_KEYS = {
  page: 'page',
  pageSize: 'pageSize',
  sortField: 'sortField',
  sortDirection: 'sortDirection',
  keyword: 'keyword',
} as const

function resolveUrlSyncConfig(
  urlSync: boolean | ProTableUrlSyncOptions | undefined
): ResolvedUrlSyncConfig {
  if (urlSync === true) {
    return { enabled: true, mode: 'replace', keys: { ...DEFAULT_KEYS } }
  }
  if (!urlSync) {
    return { enabled: false, mode: 'replace', keys: { ...DEFAULT_KEYS } }
  }
  return {
    enabled: urlSync.enabled ?? true,
    mode: urlSync.mode ?? 'replace',
    keys: {
      page: urlSync.keys?.page ?? DEFAULT_KEYS.page,
      pageSize: urlSync.keys?.pageSize ?? DEFAULT_KEYS.pageSize,
      sortField: urlSync.keys?.sortField ?? DEFAULT_KEYS.sortField,
      sortDirection: urlSync.keys?.sortDirection ?? DEFAULT_KEYS.sortDirection,
      keyword: urlSync.keys?.keyword ?? DEFAULT_KEYS.keyword,
    },
  }
}

function pickQueryValue(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' ? first : undefined
  }
  return typeof value === 'string' ? value : undefined
}

export function useProTableUrlSync<T extends Record<string, unknown>>(
  options: UseProTableUrlSyncOptions<T>
): UseProTableUrlSyncReturn {
  const route = useRoute()
  const router = useRouter()
  const syncingFromRoute = ref(false)
  const syncingToRoute = ref(false)
  const config = computed(() => resolveUrlSyncConfig(options.urlSync))

  function applyQueryToTableState(): void {
    if (!config.value.enabled || syncingToRoute.value) return

    syncingFromRoute.value = true
    try {
      const keys = config.value.keys
      const query = route.query
      const ctrl = options.ctrl

      const pageRaw = pickQueryValue(query[keys.page])
      if (pageRaw) {
        const page = Number(pageRaw)
        if (Number.isFinite(page) && page > 0) {
          ctrl.setPage(page)
        }
      }

      const pageSizeRaw = pickQueryValue(query[keys.pageSize])
      if (pageSizeRaw) {
        const pageSize = Number(pageSizeRaw)
        if (Number.isFinite(pageSize) && pageSize > 0) {
          ctrl.setPageSize(pageSize)
        }
      }

      const sortField = pickQueryValue(query[keys.sortField]) ?? ''
      const sortDirectionRaw = pickQueryValue(query[keys.sortDirection]) ?? ''
      const sortDirection: 'asc' | 'desc' | null =
        sortDirectionRaw === 'asc' || sortDirectionRaw === 'desc' ? sortDirectionRaw : null
      if (sortField || ctrl.state.sort.field) {
        ctrl.state.sort = { field: sortField || null, direction: sortDirection }
      }

      const keyword = pickQueryValue(query[keys.keyword]) ?? ''
      if (keyword || ctrl.state.filter.global) {
        ctrl.setGlobalFilter(keyword)
      }
    } finally {
      syncingFromRoute.value = false
    }
  }

  const stopRouteWatcher = watch(
    () => route.query,
    () => applyQueryToTableState(),
    { immediate: true }
  )

  const stopStateWatcher = watch(
    [
      () => options.ctrl.state.pagination.page,
      () => options.ctrl.state.pagination.pageSize,
      () => options.ctrl.state.sort.field,
      () => options.ctrl.state.sort.direction,
      () => options.ctrl.state.filter.global,
    ],
    async () => {
      if (!config.value.enabled || syncingFromRoute.value) return

      const keys = config.value.keys
      const ctrl = options.ctrl
      const nextQuery: LocationQueryRaw = {
        ...route.query,
        [keys.page]: ctrl.state.pagination.page,
        [keys.pageSize]: ctrl.state.pagination.pageSize,
      }

      if (ctrl.state.sort.field) {
        nextQuery[keys.sortField] = ctrl.state.sort.field
      } else {
        nextQuery[keys.sortField] = undefined
      }

      if (ctrl.state.sort.direction) {
        nextQuery[keys.sortDirection] = ctrl.state.sort.direction
      } else {
        nextQuery[keys.sortDirection] = undefined
      }

      if (ctrl.state.filter.global.trim().length > 0) {
        nextQuery[keys.keyword] = ctrl.state.filter.global.trim()
      } else {
        nextQuery[keys.keyword] = undefined
      }

      syncingToRoute.value = true
      try {
        if (config.value.mode === 'push') {
          await router.push({ query: nextQuery })
        } else {
          await router.replace({ query: nextQuery })
        }
      } finally {
        syncingToRoute.value = false
      }
    }
  )

  function destroy(): void {
    stopRouteWatcher()
    stopStateWatcher()
  }

  return {
    applyInitialRoute: applyQueryToTableState,
    destroy,
  }
}
