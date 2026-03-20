<script setup lang="tsx">
import type { TransactionLedgerRow } from './columns'
import { transactionLedgerColumns } from './columns'

defineOptions({ name: 'ExampleProTableVirtualPage' })

const columns = transactionLedgerColumns
const massiveData = ref<TransactionLedgerRow[]>([])
const isGenerating = ref<boolean>(true)

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function generateMassiveData(count: number = 100000): TransactionLedgerRow[] {
  const rows: TransactionLedgerRow[] = []

  const accounts: string[] = ['现金', '银行卡', '对公账户', '备用金', '第三方支付']
  const descSeeds: string[] = [
    '批量对账',
    '系统自动入账',
    '手工调整',
    '退款重试',
    '定时任务汇总',
    '跨期结算',
  ]
  const statuses: TransactionLedgerRow['status'][] = ['pending', 'success', 'failed']

  for (let i = 0; i < count; i += 1) {
    const day = (i % 28) + 1
    const month = (i % 12) + 1
    const date = `2026-${pad2(month)}-${pad2(day)}`

    const account = accounts[i % accounts.length]
    const status = statuses[i % statuses.length]
    if (!account || !status) continue

    const amountBase = (i % 10000) / 3
    const signed = i % 17 === 0 ? -amountBase : amountBase
    const description = `${descSeeds[i % descSeeds.length] ?? '系统生成'} #${i}`

    rows.push({
      id: `TX-${String(i).padStart(6, '0')}`,
      date,
      account,
      amount: signed,
      status,
      description,
    })
  }

  return rows
}

onMounted(() => {
  isGenerating.value = true
  // 让出一帧，避免首屏阻塞造成视觉卡顿
  requestAnimationFrame(() => {
    massiveData.value = generateMassiveData(100000)
    isGenerating.value = false
  })
})
</script>

<template>
  <div class="layout-full px-md md:px-lg col-stack-sm min-h-0">
    <div class="row-between gap-md">
      <div class="col-stack-xs">
        <div class="text-lg font-semibold">百万级虚拟网格引擎</div>
        <div class="text-muted-foreground text-sm">
          纯前端内存生成 100,000 行数据，用于验证 `&lt;ProTable :virtual-scroll="true"&gt;`
          的零卡顿渲染能力
        </div>
      </div>

      <div class="row-y-center gap-sm">
        <Badge value="Total Rows: 100,000" />
        <Badge
          v-if="isGenerating"
          severity="secondary"
          value="Generating..."
        />
      </div>
    </div>

    <div class="col-fill">
      <ProTable
        :virtual-scroll="true"
        :pagination="false"
        :columns="columns"
        :data="massiveData"
        :loading="isGenerating"
        row-key="id"
      />
    </div>
  </div>
</template>
