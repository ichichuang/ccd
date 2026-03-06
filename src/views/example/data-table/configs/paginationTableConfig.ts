/**
 * 分页表格配置
 */
import type { Product } from './basicTableConfig.tsx'
import { basicColumns, basicData } from './basicTableConfig.tsx'

const baseData: Product[] = basicData.slice(0, 55)

export const paginationColumns = basicColumns
export const paginationData = baseData
