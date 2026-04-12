/** 商品演示 — 分类与上下架状态 */

export type ProductStatus = 'available' | 'low' | 'sold_out'

export const PRODUCT_CATEGORIES = ['电子', '服装', '家居', '食品', '运动'] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PRODUCT_CATEGORY_CLASS: Record<ProductCategory, string> = {
  电子: 'bg-primary/15 text-primary',
  服装: 'bg-accent/15 text-accent',
  家居: 'bg-info/15 text-info',
  食品: 'bg-success/15 text-success',
  运动: 'bg-warn/15 text-warn',
}

export const PRODUCT_STATUS_DISPLAY: Record<ProductStatus, { label: string; cls: string }> = {
  available: { label: '上架', cls: 'bg-success/15 text-success' },
  low: { label: '库存低', cls: 'bg-warn/15 text-warn' },
  sold_out: { label: '已下架', cls: 'bg-muted/60 text-muted-foreground' },
}

export const PRODUCT_CATEGORY_FILTER_OPTIONS = PRODUCT_CATEGORIES.map(c => ({
  label: c,
  value: c,
}))
