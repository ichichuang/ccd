import Icons from '@/components/Icons/Icons.vue'
import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'
import Button from 'primevue/button'
export interface ProductRow extends Record<string, unknown> {
  id: number
  sku: string
  name: string
  category: string
  price: number
  stock: number
  maxStock: number
  status: 'available' | 'low' | 'sold_out'
  createdAt?: string
}

const CATEGORY_CLS: Record<string, string> = {
  电子: 'bg-primary/15 text-primary',
  服装: 'bg-accent/15 text-accent',
  家居: 'bg-info/15 text-info',
  食品: 'bg-success/15 text-success',
  运动: 'bg-warn/15 text-warn',
}

const STATUS_CFG: Record<ProductRow['status'], { label: string; cls: string }> = {
  available: { label: '上架', cls: 'bg-success/15 text-success' },
  low: { label: '库存低', cls: 'bg-warn/15 text-warn' },
  sold_out: { label: '已下架', cls: 'bg-muted/60 text-muted-foreground' },
}

const BADGE = 'rounded-sm px-sm py-xs text-xs font-semibold'

export const productColumns: ProTableColumn<ProductRow>[] = [
  {
    id: 'sku',
    title: 'SKU',
    field: 'sku',
    width: '140px',
    pinned: 'left',
    headerRender: () => (
      <div class="row-start items-center gap-xs">
        <Icons name="i-lucide-hash" />
        <span>SKU</span>
      </div>
    ),
  },
  {
    id: 'name',
    title: '商品名称',
    field: 'name',
    minWidth: '180px',
    sortable: true,
    filterable: true,
    render: ({ row }: ColumnRenderParams<ProductRow>) => (
      <div class="row-start items-center gap-xs">
        <Icons
          name="i-lucide-package"
          size="xs"
          class="text-accent!"
        />
        <span class="text-ellipsis-1">{row.name}</span>
      </div>
    ),
  },
  {
    id: 'category',
    title: '分类',
    field: 'category',
    width: '100px',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: '电子', value: '电子' },
      { label: '服装', value: '服装' },
      { label: '家居', value: '家居' },
      { label: '食品', value: '食品' },
      { label: '运动', value: '运动' },
    ],
    render: ({ row }: ColumnRenderParams<ProductRow>) => {
      const cls = CATEGORY_CLS[row.category] ?? 'bg-muted/60 text-muted-foreground'
      return <span class={`${cls} ${BADGE}`}>{row.category}</span>
    },
  },
  {
    id: 'price',
    title: '售价',
    field: 'price',
    width: '120px',
    align: 'right',
    sortable: true,
    render: ({ row }: ColumnRenderParams<ProductRow>) => (
      <span class="font-mono font-semibold text-foreground">
        ¥{row.price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    id: 'stock',
    title: '库存',
    field: 'stock',
    width: '200px',
    sortable: true,
    render: ({ row }: ColumnRenderParams<ProductRow>) => {
      const stock = row.stock
      const maxStock = row.maxStock
      const pct = Math.min(100, Math.round((stock / maxStock) * 100))
      const barCls = pct > 40 ? 'bg-success' : pct > 15 ? 'bg-warn' : 'bg-danger'
      return (
        <div class="col-stretch gap-xs w-full">
          <div class="row-between">
            <span class="text-xs">{stock} 件</span>
            <span class="text-xs text-muted-foreground">{pct}%</span>
          </div>
          <div class="w-full rounded-full bg-muted/30 h-1">
            <div
              class={`${barCls} rounded-full h-full`}
              style={`width:${pct}%`}
            />
          </div>
        </div>
      )
    },
  },
  {
    id: 'status',
    title: '状态',
    field: 'status',
    width: '100px',
    render: ({ row }: ColumnRenderParams<ProductRow>) => {
      const cfg = STATUS_CFG[row.status]
      return <span class={`${cfg.cls} ${BADGE}`}>{cfg.label}</span>
    },
  },
  {
    id: 'createdAt',
    title: '上架日期',
    field: 'createdAt',
    width: '180px',
    filterable: true,
    filterType: 'date',
    render: ({ row }: ColumnRenderParams<ProductRow>) =>
      row.createdAt ? <span class="text-ellipsis-1">{row.createdAt}</span> : null,
  },
  {
    id: 'actions',
    title: '操作',
    width: '200px',
    pinned: 'right',
    render: ({ row }: ColumnRenderParams<ProductRow>) => (
      <div class="center gap-sm w-full ">
        <Button
          size="small"
          onClick={() => window.$toast?.infoIn('top-right', '编辑', `商品：${row.name}`)}
          severity="info"
        >
          编辑
        </Button>
        <Button
          size="small"
          onClick={() => window.$toast?.warnIn('top-right', '删除', `商品：${row.name}`)}
          severity="danger"
        >
          删除
        </Button>
      </div>
    ),
  },
]
