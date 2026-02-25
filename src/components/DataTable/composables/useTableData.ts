/**
 * useTableData - 表格数据管理 Composable
 * 负责：apiData、sourceData、filteredData、dataToRender、API 加载、全局/列筛选、排序状态
 */

import type { ComputedRef, Ref } from 'vue'
import { executeTableApi } from '../utils/executeTableApi'
import { throttleFn } from '@/utils/lodashes'
import type {
  DataTableColumn,
  DataTableProps,
  ColumnFilterValues,
  PaginationState,
  SortMeta,
} from '../utils/types'

export interface UseTableDataOptions<T> {
  props: DataTableProps<T>
  paginationState: Ref<PaginationState>
  infinitePage: Ref<number>
  infiniteHasNext: Ref<boolean>
  visibleColumns: ComputedRef<DataTableColumn<T>[]>
}

export interface UseTableDataReturn<T> {
  apiData: Ref<T[]>
  apiLoading: Ref<boolean>
  sourceData: ComputedRef<T[]>
  filteredData: ComputedRef<T[]>
  dataToRender: ComputedRef<T[]>
  loading: ComputedRef<boolean>
  globalFilterValue: Ref<string>
  searchInputValue: Ref<string>
  columnFilters: Ref<ColumnFilterValues>
  sortField: Ref<string | undefined>
  sortOrder: Ref<number | undefined>
  multiSortMeta: Ref<SortMeta[]>
  loadApiData: (isInfiniteNext?: boolean, forceRefresh?: boolean) => Promise<void>
  refresh: () => void
  handleGlobalFilterChange: (val: string | undefined) => void
  clearFilters: () => void
  debouncedGlobalFilter: (val: string) => void
  setColumnFilter: (field: string, value: unknown) => void
  clearColumnFilter: (field?: string) => void
}

export function useTableData<T extends object>(
  options: UseTableDataOptions<T>
): UseTableDataReturn<T> {
  const { props, paginationState, infinitePage, infiniteHasNext, visibleColumns } = options

  const apiData = ref<T[]>([]) as Ref<T[]>
  const apiLoading = ref(false)
  const searchInputValue = ref('')
  const globalFilterValue = ref('')
  const columnFilters = ref<ColumnFilterValues>({})
  const sortField = ref<string | undefined>()
  const sortOrder = ref<number | undefined>()
  const multiSortMeta = ref<SortMeta[]>([])

  const sourceData = computed(() => {
    if (props.api) return apiData.value as T[]
    return (props.data ?? []) as T[]
  })

  const loading = computed(() => {
    if (props.api) return apiLoading.value || props.loading || false
    return props.loading ?? false
  })

  const filteredData = computed(() => {
    let data = sourceData.value

    // Global filter
    if (props.globalFilter && globalFilterValue.value?.trim()) {
      const search = globalFilterValue.value.toLowerCase().trim()
      const cols = visibleColumns.value
      data = data.filter((row: T) =>
        cols.some((col: DataTableColumn<T>) => {
          const v = (row as Record<string, unknown>)[col.field as string]
          return v != null && String(v).toLowerCase().includes(search)
        })
      )
    }

    // Column-level filters
    const filterEntries = Object.entries(columnFilters.value).filter(([, v]) => {
      if (v == null || v === '') return false
      if (Array.isArray(v) && v.length === 0) return false
      if (Array.isArray(v) && v.length === 2 && v.every(x => x == null)) return false
      return true
    })
    if (filterEntries.length > 0 && !props.api) {
      data = data.filter((row: T) =>
        filterEntries.every(([field, filterValue]) => {
          const cellValue = (row as Record<string, unknown>)[field]
          if (cellValue == null) return false
          if (Array.isArray(filterValue)) {
            // date-range: [start, end] with Date or timestamp
            if (filterValue.length === 2) {
              const a = filterValue[0]
              const b = filterValue[1]
              const isDateRange =
                (a instanceof Date || (typeof a === 'number' && !isNaN(a))) &&
                (b instanceof Date || (typeof b === 'number' && !isNaN(b)))
              if (isDateRange) {
                const start = a instanceof Date ? a.getTime() : Number(a)
                const end = b instanceof Date ? b.getTime() : Number(b)
                const ts =
                  typeof cellValue === 'number'
                    ? cellValue
                    : cellValue instanceof Date
                      ? cellValue.getTime()
                      : Number(cellValue)
                if (isNaN(ts)) return false
                return ts >= start && ts <= end
              }
            }
            // multiselect: check if cell value is in the selected list
            return filterValue.includes(cellValue)
          }
          // numeric: ≥ 比较（金额等列）
          const numFilter = Number(filterValue)
          const numCell = Number(cellValue)
          if (!Number.isNaN(numFilter) && !Number.isNaN(numCell)) return numCell >= numFilter
          // text / select: string contains match
          return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase())
        })
      )
    }

    return data
  })

  // 客户端排序：无 API 时按 multiSortMeta 或 sortField/sortOrder 排序
  const sortedData = computed(() => {
    const data = filteredData.value
    if (props.api) return data

    const multi = multiSortMeta.value
    if (multi.length > 0) {
      return [...data].sort((a, b) => {
        for (const m of multi) {
          const va = (a as Record<string, unknown>)[m.field]
          const vb = (b as Record<string, unknown>)[m.field]
          let cmp = 0
          if (va == null && vb == null) cmp = 0
          else if (va == null) cmp = 1
          else if (vb == null) cmp = -1
          else if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb
          else cmp = String(va).localeCompare(String(vb))
          if (cmp !== 0) return m.order === -1 ? -cmp : cmp
        }
        return 0
      })
    }

    const sf = sortField.value
    const so = sortOrder.value
    if (!sf || so === undefined) return data
    return [...data].sort((a, b) => {
      const va = (a as Record<string, unknown>)[sf]
      const vb = (b as Record<string, unknown>)[sf]
      let cmp = 0
      if (va == null && vb == null) cmp = 0
      else if (va == null) cmp = 1
      else if (vb == null) cmp = -1
      else if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb
      else cmp = String(va).localeCompare(String(vb))
      return so === -1 ? -cmp : cmp
    })
  })

  const dataToRender = computed(() => {
    if (props.api?.mode === 'pagination') return sourceData.value
    if (props.pagination && !props.api) {
      const { first, rows } = paginationState.value
      return sortedData.value.slice(first, first + rows)
    }
    return sortedData.value
  })

  const loadApiData = async (isInfiniteNext = false, forceRefresh = false) => {
    if (!props.api) return
    if (props.api.mode === 'infinite' && isInfiniteNext && !infiniteHasNext.value) return
    if (apiLoading.value) return

    apiLoading.value = true
    try {
      const pageSize =
        props.api.mode === 'infinite'
          ? (props.api.infinite?.pageSize ?? 20)
          : (paginationState.value.rows ?? props.api.pagination?.pageSize ?? 10)
      const currentPage =
        props.api.mode === 'infinite' && isInfiniteNext
          ? infinitePage.value
          : props.api.mode === 'pagination'
            ? paginationState.value.page
            : 1

      const sortOrderVal = sortOrder.value
      const sortOrderNarrow =
        sortOrderVal === 0 || sortOrderVal === 1 || sortOrderVal === -1 ? sortOrderVal : undefined
      const result = await executeTableApi(
        props.api,
        currentPage,
        pageSize,
        forceRefresh ? { enableCache: false } : undefined,
        {
          sortField: sortField.value,
          sortOrder: sortOrderNarrow,
          multiSortMeta: multiSortMeta.value.length > 0 ? multiSortMeta.value : undefined,
        },
        {
          globalFilterValue: globalFilterValue.value,
          columnFilters:
            Object.keys(columnFilters.value).length > 0 ? columnFilters.value : undefined,
        }
      )

      if (props.api.mode === 'infinite' && isInfiniteNext) {
        apiData.value = [...(apiData.value as T[]), ...(result.list as T[])]
        infiniteHasNext.value = result.hasNext ?? false
        infinitePage.value += 1
      } else {
        apiData.value = result.list as T[]
        if (props.api.mode === 'pagination') {
          paginationState.value.totalRecords = result.total ?? result.list.length
        } else if (props.api.mode === 'infinite') {
          infinitePage.value = 2
          infiniteHasNext.value = result.hasNext ?? result.list.length >= pageSize
        }
      }
    } catch {
      apiData.value = []
    } finally {
      apiLoading.value = false
    }
  }

  const _refresh = async () => {
    if (props.api) await loadApiData(false, true)
  }
  const refresh = throttleFn(_refresh, 1000)

  const debouncedGlobalFilter = throttleFn((val: string) => {
    globalFilterValue.value = val
    if (props.pagination && paginationState.value.page !== 1) {
      paginationState.value.first = 0
      paginationState.value.page = 1
    }
  }, 600)

  const handleGlobalFilterChange = (val: string | undefined) => {
    searchInputValue.value = val ?? ''
    debouncedGlobalFilter(val ?? '')
  }

  const clearFilters = () => {
    globalFilterValue.value = ''
    searchInputValue.value = ''
    columnFilters.value = {}
  }

  const setColumnFilter = (field: string, value: unknown) => {
    columnFilters.value = { ...columnFilters.value, [field]: value }
  }

  const clearColumnFilter = (field?: string) => {
    if (field) {
      const newFilters = { ...columnFilters.value }
      delete newFilters[field]
      columnFilters.value = newFilters
    } else {
      columnFilters.value = {}
    }
  }

  // Watch global filter to trigger API reload
  watch(globalFilterValue, () => {
    if (props.api) {
      if (props.pagination) {
        paginationState.value.first = 0
        paginationState.value.page = 1
      }
      void loadApiData(false, true)
    }
  })

  // Watch column filters to trigger API reload
  watch(
    columnFilters,
    () => {
      if (props.api) {
        if (props.pagination) {
          paginationState.value.first = 0
          paginationState.value.page = 1
        }
        void loadApiData(false, true)
      }
    },
    { deep: true }
  )

  return {
    apiData,
    apiLoading,
    sourceData,
    filteredData,
    dataToRender,
    loading,
    globalFilterValue,
    searchInputValue,
    columnFilters,
    sortField,
    sortOrder,
    multiSortMeta,
    loadApiData,
    refresh,
    handleGlobalFilterChange,
    clearFilters,
    debouncedGlobalFilter,
    setColumnFilter,
    clearColumnFilter,
  }
}
