import type { ProTableColumn } from '../types/column'
import { objectGet } from '@/utils/lodashes'

/**
 * Escape a CSV cell value: wrap in quotes if it contains commas, quotes, or newlines.
 */
function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Get the header text from a column definition.
 */
function getColumnHeader<T extends Record<string, unknown>>(col: ProTableColumn<T>): string {
  if (typeof col.title === 'string') return col.title
  return col.id
}

/**
 * Get a cell's raw value using the column's field (supports dot-path).
 */
function getCellValue<T extends Record<string, unknown>>(row: T, col: ProTableColumn<T>): unknown {
  if (!col.field) return ''
  return col.field.includes('.') ? objectGet(row, col.field) : row[col.field]
}

/**
 * Export table data to a CSV file and trigger a browser download.
 *
 * @param columns - Visible columns (determines headers and field extraction)
 * @param data - Row data to export
 * @param filename - Download filename (default: 'export.csv')
 */
export function exportToCsv<T extends Record<string, unknown>>(
  columns: ProTableColumn<T>[],
  data: T[],
  filename = 'export.csv'
): void {
  // Header row
  const headers = columns.map(col => escapeCsvCell(getColumnHeader(col)))
  const headerLine = headers.join(',')

  // Data rows
  const dataLines = data.map(row =>
    columns.map(col => escapeCsvCell(getCellValue(row, col))).join(',')
  )

  // UTF-8 BOM + CSV content
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  // Trigger download
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
