<script setup lang="ts">
import { productColumns } from './columns'
import type { ProductRow } from './columns'

defineOptions({ name: 'ExampleProTableColumnsPage' })

const CATEGORIES = ['电子', '服装', '家居', '食品', '运动'] as const
const STATUSES: ProductRow['status'][] = ['available', 'low', 'sold_out']

const PRODUCTS = [
  '无线蓝牙耳机 Pro',
  '智能手表 X3',
  '便携充电宝 20000mAh',
  '机械键盘 TKL',
  '4K 显示器 27英寸',
  '游戏鼠标 G Pro',
  '纯棉T恤 基础款',
  '运动卫衣 连帽',
  '牛仔裤 修身款',
  '羽绒服 轻薄款',
  '北欧风台灯',
  '人体工学椅 Pro',
  '收纳盒套装',
  '香薰扩散器',
  '手冲咖啡壶套装',
  '坚果礼盒 混合装',
  '有机燕麦片',
  '健身哑铃 20kg',
  '瑜伽垫 防滑',
  '跑步鞋 轻量版',
]

function makeData(): ProductRow[] {
  return PRODUCTS.map((name, i) => ({
    id: i + 1,
    sku: `SKU-${String(i + 1001).padStart(4, '0')}`,
    name,
    category: CATEGORIES[i % CATEGORIES.length],
    price: Math.round((29.9 + (i % 8) * 120 + ((i * 37) % 300) / 10) * 10) / 10,
    stock: Math.floor((i * 47 + 13) % 200),
    maxStock: 200,
    status: STATUSES[i % STATUSES.length],
    createdAt: `202${Math.floor(i / 8)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
  }))
}

const tableData = ref<ProductRow[]>(makeData())
const isLoading = ref<boolean>(false)

function handleRefresh(): void {
  isLoading.value = true
  setTimeout(() => {
    tableData.value = makeData()
    isLoading.value = false
  }, 600)
}

const FEATURE_TAGS: { label: string; cls: string }[] = [
  { label: 'pinned: left  (SKU)', cls: 'bg-primary/15 text-primary' },
  { label: 'pinned: right  (操作)', cls: 'bg-primary/15 text-primary' },
  { label: 'headerRender()', cls: 'bg-accent/15 text-accent' },
  { label: 'render() — TSX', cls: 'bg-accent/15 text-accent' },
  { label: 'align: right', cls: 'bg-info/15 text-info' },
  { label: 'minWidth / width', cls: 'bg-info/15 text-info' },
  { label: 'sortable + filterable', cls: 'bg-success/15 text-success' },
]
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-md md:px-lg col-stack-sm min-h-0"
  >
    <!-- Toolbar: Hero Header (Transparent Root Policy: Inherit canvas) -->
    <header class="shrink-0 border-b-default">
      <div class="w-full py-sm row-y-center gap-md text-foreground">
        <div class="p-md bg-primary/10 rounded-lg shrink-0">
          <Icons
            name="i-lucide-columns-3"
            class="text-primary text-2xl"
          />
        </div>
        <div class="col-stack-xs">
          <h1 class="text-2xl font-bold m-0">ProTable — 列定义与渲染</h1>
          <p class="text-muted-foreground text-sm m-0">
            演示列固定（pinned: 'left'/'right'）、 TSX
            自定义单元格渲染、headerRender、对齐方式与宽度约束。
          </p>
          <div class="row-y-center gap-xs flex-wrap mt-padding-xs">
            <span
              v-for="tag in FEATURE_TAGS"
              :key="tag.label"
              :class="[
                'rounded-md px-sm py-xs text-xs font-semibold uppercase tracking-wider',
                tag.cls,
              ]"
            >
              {{ tag.label }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 min-h-0">
      <!-- Table (fills remaining height) -->
      <div class="flex-1 min-h-0">
        <ProTable
          :columns="productColumns"
          :data="tableData"
          :loading="isLoading"
          title="商品目录"
          row-key="id"
          :pagination="{ pageSize: 12, pageSizeOptions: [12, 24, 48] }"
          @refresh="handleRefresh"
        />
      </div>
    </div>
  </div>
</template>
