<script setup lang="ts">
import { productColumns } from './columns'
import type { ProductRow } from './columns'

defineOptions({ name: 'ExampleProTableColumnConfigPage' })

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
const tableContainerRef = useTemplateRef<HTMLElement>('tableContainerRef')
const { height: tableContainerHeight } = useAppElementSize(tableContainerRef)
const waitFor = (ms: number): Promise<void> =>
  new Promise(resolve => {
    const { start, stop } = useTimeoutFn(
      () => {
        stop()
        resolve()
      },
      ms,
      { immediate: false }
    )
    start()
  })

async function handleRefresh(): Promise<void> {
  isLoading.value = true
  await waitFor(600)
  tableData.value = makeData()
  isLoading.value = false
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-md md:px-lg col-stretch gap-sm min-h-0"
  >
    <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
      <div class="row-between gap-md min-w-0">
        <div class="row-start gap-sm min-w-0 flex-wrap">
          <div class="glass-icon-box shrink-0">
            <Icons
              name="i-lucide-columns-3"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">ProTable 列定义</span>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PRO-TABLE
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              演示列固定（pinned）、TSX
              自定义渲染、headerRender、对齐方式、宽度约束与拖拽缩放（resizable）。
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="col-fill">
      <!-- Table (fills remaining height) -->
      <section
        ref="tableContainerRef"
        class="layout-full"
      >
        <template v-if="tableContainerHeight > 0">
          <div :style="{ height: `${tableContainerHeight}px` }">
            <ProTable
              :columns="productColumns"
              :data="tableData"
              :loading="isLoading"
              row-key="id"
              @refresh="handleRefresh"
            />
          </div>
        </template>
      </section>
    </div>
  </div>
</template>
