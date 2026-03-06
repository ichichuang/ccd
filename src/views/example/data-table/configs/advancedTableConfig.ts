/**
 * 高级表格配置 - 列持久化、resizable、reorderable
 */
import type { Product } from './basicTableConfig.tsx'
import { basicColumns, basicData } from './basicTableConfig.tsx'

const baseData: Product[] = basicData.slice(0, 5)

export const advancedColumns = basicColumns
export const advancedData = baseData
export const ADVANCED_TABLE_ID = 'example-advanced-table'
