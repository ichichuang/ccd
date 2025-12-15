/**
 * VxeTable 工具函数
 */

import type { ColumnWidthInfo, VxeTableColumn } from './types'

/**
 * 解析宽度值（字符串或数字）为像素值
 * @param width - 宽度值（如 '100px', '10rem', 100）
 * @returns 像素值（数字）
 */
export const parseWidth = (width: string | number | undefined): number => {
  if (!width) {
    return 0
  }

  if (typeof width === 'number') {
    return width
  }

  // 如果是字符串，尝试解析
  const str = String(width).trim()

  // 如果是纯数字字符串
  if (/^\d+$/.test(str)) {
    return Number.parseInt(str, 10)
  }

  // 如果是带单位的字符串（如 '100px', '10rem'）
  const match = str.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)?$/)
  if (match) {
    const value = Number.parseFloat(match[1])
    const unit = match[2] || 'px'

    // 只处理 px，其他单位需要根据实际情况转换
    if (unit === 'px') {
      return value
    }

    // rem/em 转 px（假设 1rem = 16px）
    if (unit === 'rem' || unit === 'em') {
      return value * 16
    }

    // 百分比需要根据父元素计算，这里返回 0
    if (unit === '%') {
      return 0
    }
  }

  return 0
}

/**
 * 获取列标题文本
 * @param column - 列配置
 * @returns 列标题文本
 */
export const getColumnHeader = (column: VxeTableColumn): string => {
  if (typeof column.header === 'function') {
    return column.header()
  }
  return column.header || String(column.field)
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * 导出数据为 CSV 格式
 * @param data - 表格数据
 * @param columns - 列配置
 * @param filename - 文件名
 */
export const exportToCSV = <T = any>(
  data: T[],
  columns: VxeTableColumn<T>[],
  filename: string = 'export.csv'
): void => {
  // 获取表头
  const headers = columns.filter(col => col.exportable !== false).map(col => getColumnHeader(col))

  // 获取数据行
  const rows = data.map(row => {
    return columns
      .filter(col => col.exportable !== false)
      .map(col => {
        const value = (row as any)[col.field]
        // 处理包含逗号的值
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value ?? ''
      })
  })

  // 组合 CSV 内容
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

  // 创建 Blob 并下载
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 导出数据为 JSON 格式
 * @param data - 表格数据
 * @param filename - 文件名
 */
export const exportToJSON = <T = any>(data: T[], filename: string = 'export.json'): void => {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取表格列宽度信息
 * @param tableElement - 表格 DOM 元素
 * @param columns - 列配置
 * @param hasSelectionColumn - 是否有选择列（用于索引偏移）
 * @returns 列宽度信息数组
 */
export const getColumnWidthsFromTable = <T = any>(
  tableElement: HTMLElement | null,
  columns: VxeTableColumn<T>[],
  hasSelectionColumn: boolean = false,
  selectionAlignFrozen: 'left' | 'right' = 'left'
): { widths: ColumnWidthInfo[]; selectionWidth?: number } => {
  if (!tableElement) {
    return { widths: [], selectionWidth: undefined }
  }

  const widths: ColumnWidthInfo[] = []

  // 获取表头行
  const headerRow = tableElement.querySelector('.p-datatable-thead tr')
  if (!headerRow) {
    return { widths: [], selectionWidth: undefined }
  }

  const headerCells = headerRow.querySelectorAll('th')
  let selectionWidth: number | undefined

  // 如果有选择列，索引根据左右位置决定
  const startIndex = hasSelectionColumn && selectionAlignFrozen === 'left' ? 1 : 0
  if (hasSelectionColumn && headerCells.length > 0) {
    selectionWidth =
      selectionAlignFrozen === 'left'
        ? (headerCells[0] as HTMLElement).offsetWidth
        : (headerCells[headerCells.length - 1] as HTMLElement).offsetWidth
  }

  columns.forEach((column, columnIndex) => {
    const cellIndex = selectionAlignFrozen === 'left' ? startIndex + columnIndex : columnIndex
    const cell = headerCells[cellIndex] as HTMLElement
    if (cell) {
      const width = cell.offsetWidth
      widths.push({
        field: column.field as string,
        width,
        minWidth: column.minWidth ? parseWidth(column.minWidth) : 60,
        maxWidth: column.maxWidth ? parseWidth(column.maxWidth) : undefined,
      })
    } else {
      // 如果找不到对应的单元格，使用配置的宽度
      widths.push({
        field: column.field as string,
        width: parseWidth(column.width) || 100,
        minWidth: column.minWidth ? parseWidth(column.minWidth) : 60,
        maxWidth: column.maxWidth ? parseWidth(column.maxWidth) : undefined,
      })
    }
  })

  return { widths, selectionWidth }
}
