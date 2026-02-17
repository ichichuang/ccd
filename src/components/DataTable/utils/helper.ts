/**
 * DataTable 工具函数
 */

import {
  DEFAULT_COLUMN_MIN_WIDTH_PX,
  DEFAULT_COLUMN_WIDTH_PX,
  ROOT_FONT_SIZE_BASE,
  TABLE_SELECTION_COLUMN_WIDTH_PX,
} from './constants'
import type { ColumnWidthInfo, DataTableColumn } from './types'

/**
 * 将 width 字符串/数字解析为 px 数值。
 * 支持：数字、px、rem、em。
 * % 单位因缺乏容器上下文无法换算，会返回 0。
 */
export const parseWidth = (width: string | number | undefined): number => {
  if (!width) return 0
  if (typeof width === 'number') return width
  const str = String(width).trim()
  if (/^\d+$/.test(str)) return Number.parseInt(str, 10)
  const match = str.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)?$/)
  if (match) {
    const value = Number.parseFloat(match[1])
    const unit = match[2] || 'px'
    if (unit === 'px') return value
    if (unit === 'rem' || unit === 'em') return value * ROOT_FONT_SIZE_BASE
  }
  return 0
}

export const getColumnHeader = <T = unknown>(column: DataTableColumn<T>): string => {
  if (typeof column.header === 'function') return column.header()
  return (column.header as string) || String(column.field)
}

const getExportCellValue = <T = unknown>(row: T, col: DataTableColumn<T>): unknown => {
  if (typeof col.body === 'function') {
    const result = col.body(row, col)
    if (typeof result === 'string') return result
  }
  return (row as Record<string, unknown>)[col.field as string]
}

/** 匹配 Excel/WPS 会智能识别为日期的格式，导出时需强制为文本避免 ######## 或时间被截断 */
const DATE_LIKE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}(?::\d{2}(?::\d{2}(?:\.\d+)?)?)?)?$/

const ZERO_WIDTH_SPACE = '\u200B'

/** 将日期时间字符串包装为 Excel 公式形式 =""value""，强制按文本显示；零宽空格防止 WPS 应用日期格式导致时间被截断 */
const escapeDateForExcel = (value: string): string =>
  `"=""${ZERO_WIDTH_SPACE}${value.replace(/"/g, '""')}"""`

/** 文件选择器类型映射 */
const FILE_PICKER_TYPE_MAP: Record<string, { mime: string; ext: string; desc: string }> = {
  csv: { mime: 'text/csv', ext: '.csv', desc: 'CSV' },
  json: { mime: 'application/json', ext: '.json', desc: 'JSON' },
  xlsx: {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ext: '.xlsx',
    desc: 'Excel (XLSX)',
  },
}

/** 使用 File System Access API 保存文件（支持时弹出保存对话框，文件名与扩展名可靠） */
const saveViaFilePicker = async (
  blob: Blob,
  filename: string,
  options: { type: 'csv' | 'json' | 'xlsx' }
): Promise<boolean | 'cancelled'> => {
  const win = window as Window & {
    showSaveFilePicker?: (opts: { suggestedName: string; types: unknown[] }) => Promise<{
      createWritable: () => Promise<{
        write: (data: Blob) => Promise<void>
        close: () => Promise<void>
      }>
    }>
  }
  if (typeof win.showSaveFilePicker !== 'function') return false
  try {
    const info = FILE_PICKER_TYPE_MAP[options.type] ?? FILE_PICKER_TYPE_MAP.csv
    const handle = await win.showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: info.desc, accept: { [info.mime]: [info.ext] } }],
    })
    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
    return true
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
    return false
  }
}

/** link.click 回退：使用 File + setAttribute 提升兼容性 */
const downloadBlobViaLink = (blob: Blob, filename: string): void => {
  const file = new File([blob], filename, { type: blob.type })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 200)
}

export type ExportResult = 'success' | 'cancelled' | 'fallback'

export const exportToCSV = async <T = unknown>(
  data: T[],
  columns: DataTableColumn<T>[],
  filename = 'export.csv'
): Promise<ExportResult> => {
  const exportCols = columns.filter(col => col.exportable !== false)
  const headers = exportCols.map(col => getColumnHeader<T>(col))
  const rows = data.map(row =>
    exportCols.map(col => {
      const value = getExportCellValue<T>(row, col)
      if (value == null) return ''
      const str = String(value)
      if (typeof value === 'string' && DATE_LIKE_PATTERN.test(str)) {
        return escapeDateForExcel(str)
      }
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
  )
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const result = await saveViaFilePicker(blob, filename, { type: 'csv' })
  if (result === true) return 'success'
  if (result === 'cancelled') return 'cancelled'
  downloadBlobViaLink(blob, filename)
  return 'fallback'
}

export const exportToJSON = async <T = unknown>(
  data: T[],
  filename = 'export.json'
): Promise<ExportResult> => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const result = await saveViaFilePicker(blob, filename, { type: 'json' })
  if (result === true) return 'success'
  if (result === 'cancelled') return 'cancelled'
  downloadBlobViaLink(blob, filename)
  return 'fallback'
}

export const exportToXLSX = async <T = unknown>(
  data: T[],
  columns: DataTableColumn<T>[],
  filename = 'export.xlsx'
): Promise<ExportResult> => {
  const exportCols = columns.filter(col => col.exportable !== false)
  const headers = exportCols.map(col => getColumnHeader<T>(col))
  const rows = data.map(row =>
    exportCols.map(col => {
      const value = getExportCellValue<T>(row, col)
      return value == null ? '' : value
    })
  )

  try {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbOut], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const result = await saveViaFilePicker(blob, filename, { type: 'xlsx' })
    if (result === true) return 'success'
    if (result === 'cancelled') return 'cancelled'
    downloadBlobViaLink(blob, filename)
    return 'fallback'
  } catch (e) {
    console.error('[DataTable] exportToXLSX failed, xlsx package may not be installed:', e)
    throw new Error('XLSX export requires the "xlsx" package. Install it with: pnpm add xlsx')
  }
}

const DEFAULT_SELECTION_COLUMN_WIDTH = TABLE_SELECTION_COLUMN_WIDTH_PX

const getCellWidth = (el: HTMLElement): number =>
  el.getBoundingClientRect?.()?.width ?? el.offsetWidth ?? 0

/**
 * 从 tbody 或 thead 读取单元格，优先 tbody（与用户可见内容一致）。
 *
 * PrimeVue 不会为选择列创建独立的 frozen tbody，选择列始终作为普通 td/th
 * 渲染在同一行中，因此直接从第一行读取全部单元格即可。
 */
function getCellsFromTable(
  tableElement: HTMLElement,
  hasSelectionColumn: boolean,
  _selectionAlignFrozen: 'left' | 'right',
  _selectionFrozen: boolean,
  hasExpansionColumn: boolean,
  columnsLength: number
): { cells: HTMLElement[]; source: 'tbody' | 'thead' } {
  const expected = columnsLength + (hasSelectionColumn ? 1 : 0) + (hasExpansionColumn ? 1 : 0)

  // 优先从 tbody 第一行读取（与渲染数据一致）
  const tbodies = tableElement.querySelectorAll('.p-datatable-tbody')
  for (const tbody of tbodies) {
    const firstRow = tbody.querySelector('tr')
    if (!firstRow) continue
    const tds = firstRow.querySelectorAll('td')
    if (tds.length >= expected) {
      return { cells: Array.from(tds) as HTMLElement[], source: 'tbody' }
    }
  }

  // 回退到 thead
  const headerRow = tableElement.querySelector('.p-datatable-thead tr')
  if (headerRow) {
    const ths = headerRow.querySelectorAll('th')
    if (ths.length >= expected) {
      return { cells: Array.from(ths) as HTMLElement[], source: 'thead' }
    }
  }

  return { cells: [], source: 'thead' }
}

export const getColumnWidthsFromTable = <T = unknown>(
  tableElement: HTMLElement | null,
  columns: DataTableColumn<T>[],
  hasSelectionColumn = false,
  selectionAlignFrozen: 'left' | 'right' = 'left',
  options?: {
    selectionFrozen?: boolean
    hasExpansionColumn?: boolean
  }
): { widths: ColumnWidthInfo[]; selectionWidth?: number } => {
  if (!tableElement) return { widths: [], selectionWidth: undefined }

  const selectionFrozen = options?.selectionFrozen ?? false
  const hasExpansionColumn = options?.hasExpansionColumn ?? false
  const expansionOffset = hasExpansionColumn ? 1 : 0

  const { cells } = getCellsFromTable(
    tableElement,
    hasSelectionColumn,
    selectionAlignFrozen,
    selectionFrozen,
    hasExpansionColumn,
    columns.length
  )

  const expectedCellCount = columns.length + (hasSelectionColumn ? 1 : 0) + expansionOffset
  if (cells.length === 0 || cells.length !== expectedCellCount) {
    return { widths: [], selectionWidth: undefined }
  }

  let selectionWidth: number | undefined
  const startIndex =
    (hasSelectionColumn && selectionAlignFrozen === 'left' ? 1 : 0) + expansionOffset

  if (hasSelectionColumn) {
    const selIndex = selectionAlignFrozen === 'left' ? expansionOffset : cells.length - 1
    const selCell = cells[selIndex]
    if (selCell) {
      const w = getCellWidth(selCell)
      selectionWidth = w > 0 ? w : DEFAULT_SELECTION_COLUMN_WIDTH
    } else {
      selectionWidth = DEFAULT_SELECTION_COLUMN_WIDTH
    }
  }

  const widths: ColumnWidthInfo[] = columns.map((column, columnIndex) => {
    const cellIndex =
      selectionAlignFrozen === 'left' ? startIndex + columnIndex : columnIndex + expansionOffset
    const cell = cells[cellIndex] as HTMLElement
    if (cell) {
      return {
        field: column.field as string,
        width: getCellWidth(cell),
        minWidth: column.minWidth ? parseWidth(column.minWidth) : DEFAULT_COLUMN_MIN_WIDTH_PX,
        maxWidth: column.maxWidth ? parseWidth(column.maxWidth) : undefined,
      }
    }
    return {
      field: column.field as string,
      width: parseWidth(column.width) || DEFAULT_COLUMN_WIDTH_PX,
      minWidth: column.minWidth ? parseWidth(column.minWidth) : DEFAULT_COLUMN_MIN_WIDTH_PX,
      maxWidth: column.maxWidth ? parseWidth(column.maxWidth) : undefined,
    }
  })

  return { widths, selectionWidth }
}
