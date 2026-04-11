<script setup lang="ts">
import { ID_PREFIX } from '@/constants/business'
import { formatSerialId } from '@/utils/business/idGenerator'
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
      orderNo: formatSerialId(ID_PREFIX.ORDER, i + 1, 4),
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

const tableContainerRef = useTemplateRef<HTMLElement>('tableContainerRef')
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
    <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
      <div class="row-between gap-md min-w-0">
        <div class="row-start gap-sm min-w-0 flex-wrap">
          <div class="glass-icon-box shrink-0">
            <Icons
              name="i-lucide-table"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">ProTable 基础用法</span>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PRO-TABLE
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              最小可用表格：列定义、本地 :data 数据源、客户端分页、排序与行悬停。覆盖能力：columns /
              data（本地数组）/ rowKey / pagination / sortable / render / heightMode:fill /
              rowHover。
            </span>
          </div>
        </div>
      </div>
    </header>

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
