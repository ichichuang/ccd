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
    const filterEntries = Object.entries(columnFilters.value).filter(
      ([, v]) => v != null && v !== ''
    )
    if (filterEntries.length > 0 && !props.api) {
      data = data.filter((row: T) =>
        filterEntries.every(([field, filterValue]) => {
          const cellValue = (row as Record<string, unknown>)[field]
          if (cellValue == null) return false
          if (Array.isArray(filterValue)) {
            // multiselect: check if cell value is in the selected list
            return filterValue.includes(cellValue)
          }
          // text / select: string contains match
          return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase())
        })
      )
    }

    return data
  })

  const dataToRender = computed(() => {
    if (props.api?.mode === 'pagination') return sourceData.value
    if (props.pagination && !props.api) {
      const { first, rows } = paginationState.value
      return filteredData.value.slice(first, first + rows)
    }
    return filteredData.value
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
