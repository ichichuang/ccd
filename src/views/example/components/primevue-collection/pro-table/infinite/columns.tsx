import type { VNode } from 'vue'
import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'
import type { DummyProductDTO } from '@/api/example/dummy'

const BADGE = 'rounded-sm px-sm py-xs text-xs font-semibold'

function stockBadge(stock: number): VNode {
  if (stock === 0) {
    return <span class={`bg-danger/15 text-danger ${BADGE}`}>缺货</span>
  }
  if (stock <= 10) {
    return <span class={`bg-warn/15 text-warn ${BADGE}`}>{stock} 件</span>
  }
  return <span class={`bg-success/15 text-success ${BADGE}`}>{stock} 件</span>
}

function ratingStars(rating: number): VNode {
  const filled = Math.round(rating)
  return (
    <div class="row-start items-center gap-xs">
      <span class="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
      <div class="row-start items-center gap-[var(--spacing-xs)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            class={i < filled ? 'text-warn text-xs' : 'text-muted-foreground/40 text-xs'}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  )
}

export const productColumns: ProTableColumn<DummyProductDTO>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    width: '60px',
    align: 'right',
  },
  {
    id: 'product',
    title: '商品',
    field: 'title',
    minWidth: '220px',
    render: ({ row }: ColumnRenderParams<DummyProductDTO>) => (
      <div class="row-start items-center gap-sm">
        <img
          src={row.thumbnail}
          alt={row.title}
          class="w-[var(--spacing-2xl)] h-[var(--spacing-2xl)] rounded-md object-cover shrink-0 shadow-sm"
        />
        <div class="col-stretch gap-xs min-w-0">
          <span class="text-sm font-medium text-foreground text-ellipsis-1">{row.title}</span>
          <span class="text-xs text-muted-foreground text-ellipsis-1">{row.brand}</span>
        </div>
      </div>
    ),
  },
  {
    id: 'category',
    title: '分类',
    field: 'category',
    width: '200px',
    align: 'center',
    render: ({ row }: ColumnRenderParams<DummyProductDTO>) => (
      <span class={`bg-accent/15 text-accent ${BADGE}`}>{row.category}</span>
    ),
  },
  {
    id: 'price',
    title: '价格',
    field: 'price',
    width: '100px',
    align: 'right',
    render: ({ row }: ColumnRenderParams<DummyProductDTO>) => (
      <div class="col-stretch gap-xs items-end">
        <span class="text-sm font-semibold text-foreground">${row.price.toFixed(2)}</span>
        {row.discountPercentage > 0 && (
          <span class="text-xs text-danger">-{row.discountPercentage.toFixed(0)}%</span>
        )}
      </div>
    ),
  },
  {
    id: 'rating',
    title: '评分',
    width: '120px',
    render: ({ row }: ColumnRenderParams<DummyProductDTO>) => ratingStars(row.rating),
  },
  {
    id: 'stock',
    title: '库存',
    field: 'stock',
    width: '160px',
    render: ({ row }: ColumnRenderParams<DummyProductDTO>) => stockBadge(row.stock),
  },
]
