/**
 * useTableExport - 表格导出 Composable
 * 负责：CSV / JSON / XLSX 导出逻辑
 */

import { type ComputedRef, type Ref } from 'vue'
import { exportToCSV, exportToJSON, exportToXLSX } from '../utils/helper'
import { useLocale } from '@/hooks/modules/useLocale'
import type { DataTableColumn, DataTableProps } from '../utils/types'

export interface UseTableExportOptions<T> {
  props: DataTableProps<T>
  filteredData: ComputedRef<T[]>
  selectedRows: Ref<T[]>
  visibleColumns: ComputedRef<DataTableColumn<T>[]>
}

export interface UseTableExportReturn {
  handleExport: (format?: 'csv' | 'xlsx' | 'json') => Promise<void>
}

export function useTableExport<T extends object>(
  options: UseTableExportOptions<T>
): UseTableExportReturn {
  const { props, filteredData, selectedRows, visibleColumns } = options
  const { $t: t } = useLocale()

  const handleExport = async (format: 'csv' | 'xlsx' | 'json' = 'csv') => {
    const data = (selectedRows.value.length ? selectedRows.value : filteredData.value) as T[]
    const exportColumns = visibleColumns.value.filter(col => !col.expander)
    const filename = props.exportConfig?.filename ?? 'table-export'
    try {
      let result: 'success' | 'cancelled' | 'fallback'
      if (format === 'xlsx') {
        result = await exportToXLSX(data, exportColumns, `${filename}.xlsx`)
      } else if (format === 'json') {
        result = await exportToJSON(data, `${filename}.json`)
      } else {
        result = await exportToCSV(data, exportColumns, `${filename}.csv`)
      }
      if (result === 'cancelled') return
      window.$message?.success(t('common.exportSuccess'))
    } catch {
      window.$message?.danger(t('common.exportFailed'))
    }
  }

  return { handleExport }
}
