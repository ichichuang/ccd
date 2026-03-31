<script setup lang="ts">
import { basicColumns } from './columns'
import type { OrderRow } from './columns'

defineOptions({ name: 'ExampleProTableBasicPage' })

// ── Mock data source (hoisted so it's created once) ─────────────────────────

const CUSTOMERS = ['张伟', '王芳', '李娜', '刘洋', '陈静', '杨帆', '赵磊', '黄梅'] as const
const PRODUCTS = [
  '无线耳机',
  '机械键盘',
  '4K 显示器',
  '智能手表',
  '便携充电宝',
  '人体工学椅',
] as const
const STATUSES: OrderRow['status'][] = ['completed', 'processing', 'cancelled']

function makeMockData(): OrderRow[] {
  const rows: OrderRow[] = []
  for (let i = 0; i < 48; i++) {
    const qty = (i % 5) + 1
    const price = 99 + (i % 7) * 150
    const month = (i % 12) + 1
    const day = (i % 28) + 1
    rows.push({
      id: i + 1,
      orderNo: `ORD-${String(i + 1).padStart(4, '0')}`,
      customer: CUSTOMERS[i % CUSTOMERS.length] as string,
      product: PRODUCTS[i % PRODUCTS.length] as string,
      quantity: qty,
      unitPrice: price,
      total: qty * price,
      status: STATUSES[i % STATUSES.length] as OrderRow['status'],
      createdAt: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }
  return rows
}

const ALL_ORDERS = makeMockData()

// ── Layout measurement ──────────────────────────────────────────────────────

const tableContainerRef = ref<HTMLElement | null>(null)
const tableContainerHeight = ref<number | undefined>(undefined)

onMounted(() => {
  tableContainerHeight.value = tableContainerRef.value?.clientHeight ?? 0
})
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col"
  >
    <!-- Hero Header -->
    <header class="shrink-0">
      <div class="layout-container py-sm row-center gap-md">
        <div class="p-md bg-primary/10 rounded-lg shrink-0">
          <Icons
            name="i-lucide-table"
            class="text-primary text-2xl"
          />
        </div>
        <div class="col-stretch gap-xs">
          <h1 class="text-2xl font-bold text-foreground m-0">ProTable 基础用法</h1>
          <p class="text-muted-foreground text-sm m-0">
            最小可用表格：列定义、本地 :data 数据源、客户端分页、排序与行悬停。
          </p>
        </div>
      </div>
    </header>
    <div class="shrink-0 px-md py-xs text-xs text-muted-foreground border-border/15">
      覆盖能力：columns / data（本地数组）/ rowKey / pagination / sortable / render /
      heightMode:fill / rowHover。
    </div>

    <!-- Table Content -->
    <section
      ref="tableContainerRef"
      class="flex-1 min-h-0 px-md pb-md"
    >
      <template v-if="tableContainerHeight && tableContainerHeight > 0">
        <div
          class="material-elevated"
          :style="{ height: tableContainerHeight + 'px' }"
        >
          <ProTable
            :columns="basicColumns"
            :data="ALL_ORDERS"
            :server-mode="false"
            row-key="id"
            height-mode="fill"
            :row-hover="true"
            :pagination="{ pageSize: 10 }"
          />
        </div>
      </template>
    </section>
  </div>
</template>
