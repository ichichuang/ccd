import { effectScope, nextTick, reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTableUrlSync } from './useTableUrlSync'
import type {
  TableUrlSyncController,
  UseTableUrlSyncOptions,
  UseTableUrlSyncReturn,
} from './useTableUrlSync'

const harness = {
  route: reactive({ query: {} as Record<string, unknown> }),
  pushQuery: vi.fn(() => Promise.resolve()),
  replaceQuery: vi.fn(() => Promise.resolve()),
}

function createCtrl(): TableUrlSyncController {
  const state = reactive({
    filter: {
      global: '',
    },
    pagination: {
      page: 1,
      pageSize: 10,
    },
    sort: {
      direction: null,
      field: null,
    },
  }) as TableUrlSyncController['state']

  return {
    setGlobalFilter: vi.fn((keyword: string) => {
      state.filter.global = keyword
    }),
    setPage: vi.fn((page: number) => {
      state.pagination.page = page
    }),
    setPageSize: vi.fn((pageSize: number) => {
      state.pagination = { ...state.pagination, page: 1, pageSize }
    }),
    state,
  }
}

function startUrlSync(
  options: Omit<UseTableUrlSyncOptions, 'routeQuery' | 'replaceQuery' | 'pushQuery'>
): {
  ctrl: TableUrlSyncController
  destroy: () => void
  sync: UseTableUrlSyncReturn
} {
  const scope = effectScope()
  let sync: UseTableUrlSyncReturn | undefined

  scope.run(() => {
    sync = useTableUrlSync({
      ...options,
      routeQuery: () => harness.route.query,
      replaceQuery: harness.replaceQuery,
      pushQuery: harness.pushQuery,
    })
  })

  if (!sync) throw new Error('Expected URL sync composable return')

  return {
    ctrl: options.ctrl,
    destroy: () => {
      sync?.destroy()
      scope.stop()
    },
    sync,
  }
}

async function flushWatchers(): Promise<void> {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('useTableUrlSync', () => {
  beforeEach(() => {
    harness.route.query = {}
    harness.pushQuery.mockClear()
    harness.replaceQuery.mockClear()
  })

  it('applies route query values with default keys and can stop its watchers', async () => {
    harness.route.query = {
      keyword: 'ada',
      page: '3',
      pageSize: ['25'],
      sortDirection: 'desc',
      sortField: 'name',
    }
    const ctrl = createCtrl()
    const { destroy } = startUrlSync({ ctrl, urlSync: true })

    await flushWatchers()

    expect(ctrl.setPage).toHaveBeenCalledWith(3)
    expect(ctrl.setPageSize).toHaveBeenCalledWith(25)
    expect(ctrl.state.sort).toEqual({ direction: 'desc', field: 'name' })
    expect(ctrl.setGlobalFilter).toHaveBeenCalledWith('ada')

    destroy()
    harness.route.query = { page: '4' }

    await flushWatchers()

    expect(ctrl.setPage).toHaveBeenCalledTimes(1)
  })

  it('writes table state with replace by default', async () => {
    harness.route.query = { keep: 'yes' }
    const ctrl = createCtrl()
    const { destroy } = startUrlSync({ ctrl, urlSync: true })

    ctrl.state.pagination.page = 2
    ctrl.state.sort = { direction: 'asc', field: 'name' }
    ctrl.state.filter.global = '  Ada  '

    await flushWatchers()

    expect(harness.replaceQuery).toHaveBeenCalledWith({
      keep: 'yes',
      keyword: 'Ada',
      page: 2,
      pageSize: 10,
      sortDirection: 'asc',
      sortField: 'name',
    })
    expect(harness.pushQuery).not.toHaveBeenCalled()

    destroy()
  })

  it('supports custom keys and push mode', async () => {
    const ctrl = createCtrl()
    const { destroy } = startUrlSync({
      ctrl,
      urlSync: {
        keys: {
          keyword: 'q',
          page: 'p',
        },
        mode: 'push',
      },
    })

    ctrl.state.pagination.page = 5
    ctrl.state.filter.global = 'ccd'

    await flushWatchers()

    expect(harness.pushQuery).toHaveBeenCalledWith({
      p: 5,
      pageSize: 10,
      q: 'ccd',
      sortDirection: undefined,
      sortField: undefined,
    })
    expect(harness.replaceQuery).not.toHaveBeenCalled()

    destroy()
  })

  it('does not read or write route state when URL sync is disabled', async () => {
    harness.route.query = { page: '9' }
    const ctrl = createCtrl()
    const { destroy } = startUrlSync({ ctrl, urlSync: false })

    ctrl.state.pagination.page = 2

    await flushWatchers()

    expect(ctrl.setPage).not.toHaveBeenCalled()
    expect(harness.replaceQuery).not.toHaveBeenCalled()
    expect(harness.pushQuery).not.toHaveBeenCalled()

    destroy()
  })
})
