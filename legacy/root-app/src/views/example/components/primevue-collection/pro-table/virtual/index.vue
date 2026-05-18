<script setup lang="tsx">
import type { ProTableColumn } from '@/components/ProTable'
import { ID_PREFIX } from '@/constants/business'
import { formatSerialId } from '@/utils/business/idGenerator'
import type { TransactionLedgerRow } from './columns'
import { transactionLedgerColumns } from './columns'

defineOptions({ name: 'ExampleProTableVirtualPage' })

// ── Data generation ──────────────────────────────────────────────────────────
const massiveData = shallowRef<TransactionLedgerRow[]>([])
const isGenerating = ref<boolean>(true)
const tableContainerRef = ref<HTMLElement | null>(null)
const tableContainerHeight = ref<number | undefined>(undefined)

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
      id: formatSerialId(ID_PREFIX.TX, i, 6),
      date,
      account,
      amount: signed,
      status,
      description,
    })
  }

  return rows
}

// ── Control panel state ──────────────────────────────────────────────────────
const stripedRows = ref(false)
const showHorizontalLines = ref(true)
const showVerticalLines = ref(false)
const rowHover = ref(true)
const enableCustomRowClass = ref(false)

const SELECTABLE_OPTIONS: { label: string; value: false | 'single' | 'checkbox' }[] = [
  { label: '关闭', value: false },
  { label: '单选 (single)', value: 'single' },
  { label: '多选 (checkbox)', value: 'checkbox' },
]
const selectable = ref<false | 'single' | 'checkbox'>(false)

type ColumnAlignMode = 'inherit' | 'left' | 'center' | 'right'
const ALIGN_OPTIONS: { label: string; value: ColumnAlignMode }[] = [
  { label: '按列配置', value: 'inherit' },
  { label: '左对齐', value: 'left' },
  { label: '居中对齐', value: 'center' },
  { label: '右对齐', value: 'right' },
]
const headerAlignMode = ref<ColumnAlignMode>('inherit')
const cellAlignMode = ref<ColumnAlignMode>('inherit')
const tableRenderKey = computed<string>(
  () => `virtual-align-${headerAlignMode.value}-${cellAlignMode.value}`
)

const resolvedColumns = computed<ProTableColumn<TransactionLedgerRow>[]>(() => {
  return transactionLedgerColumns.map(col => {
    const nextHeaderAlign =
      headerAlignMode.value === 'inherit' ? col.headerAlign : headerAlignMode.value
    const nextAlign = cellAlignMode.value === 'inherit' ? col.align : cellAlignMode.value
    return {
      ...col,
      headerAlign: nextHeaderAlign,
      align: nextAlign,
    }
  })
})

const rowClassName = computed(() => {
  if (!enableCustomRowClass.value) return undefined
  return (row: TransactionLedgerRow) => {
    if (row.status === 'failed') return 'vg-row-danger'
    return ''
  }
})

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  tableContainerHeight.value = tableContainerRef.value?.clientHeight ?? 0
  isGenerating.value = true
  requestAnimationFrame(() => {
    massiveData.value = markRaw(generateMassiveData(100000))
    isGenerating.value = false
  })
})
</script>

<template>
  <div
    class="col-fill"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-fill px-md md:px-lg py-md gap-md">
      <!-- ── Section 1: Glass Header ── -->
      <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
        <div class="row-between gap-md min-w-0">
          <div class="row-start gap-sm min-w-0 flex-wrap">
            <div class="glass-icon-box shrink-0">
              <Icons
                name="i-lucide-rows-3"
                size="xl"
                class="text-primary"
              />
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <div class="row-start gap-xs min-w-0 flex-wrap">
                <span class="text-lg font-bold text-foreground text-no-wrap">
                  ProTable 虚拟滚动
                </span>
                <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                  PRO-TABLE
                </span>
              </div>
              <span class="text-sm text-muted-foreground text-ellipsis-1">
                纯前端内存生成 100,000
                行数据，交互式验证虚拟表格的斑马纹、行悬停、选择模式、对齐方式等全部 UI 特性。
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- ── Section 2: Control Panel ── -->
      <section class="material-elevated shrink-0 col-stretch gap-sm">
        <div class="row-start gap-sm">
          <Icons
            name="i-lucide-sliders-horizontal"
            class="text-primary"
            size="sm"
          />
          <span class="text-sm font-semibold text-foreground tracking-wider uppercase">
            虚拟表格控制台 / Virtual Grid Controls
          </span>
        </div>

        <div class="grid grid-cols-2 xl:grid-cols-3 gap-md">
          <!-- 斑马纹 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-rows-3"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                斑马纹
              </p>
            </div>
            <div class="row-between">
              <label
                for="ctrl-striped"
                class="text-sm text-foreground cursor-pointer"
              >
                Striped Rows
              </label>
              <ToggleSwitch
                v-model="stripedRows"
                input-id="ctrl-striped"
                class="shrink-0"
              />
            </div>
          </div>

          <!-- 水平线 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-minus"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                水平线
              </p>
            </div>
            <div class="row-between">
              <label
                for="ctrl-hlines"
                class="text-sm text-foreground cursor-pointer"
              >
                Horizontal Lines
              </label>
              <ToggleSwitch
                v-model="showHorizontalLines"
                input-id="ctrl-hlines"
                class="shrink-0"
              />
            </div>
          </div>

          <!-- 垂直线 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-grip-vertical"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                垂直线
              </p>
            </div>
            <div class="row-between">
              <label
                for="ctrl-vlines"
                class="text-sm text-foreground cursor-pointer"
              >
                Vertical Lines
              </label>
              <ToggleSwitch
                v-model="showVerticalLines"
                input-id="ctrl-vlines"
                class="shrink-0"
              />
            </div>
          </div>

          <!-- 行悬停 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-mouse-pointer"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                行悬停
              </p>
            </div>
            <div class="row-between">
              <label
                for="ctrl-hover"
                class="text-sm text-foreground cursor-pointer"
              >
                Row Hover
              </label>
              <ToggleSwitch
                v-model="rowHover"
                input-id="ctrl-hover"
                class="shrink-0"
              />
            </div>
          </div>

          <!-- 选择模式 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-pointer"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                选择模式
              </p>
            </div>
            <Select
              v-model="selectable"
              :options="SELECTABLE_OPTIONS"
              option-label="label"
              option-value="value"
            />
          </div>

          <!-- 自定义行样式 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-paintbrush"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                行条件样式
              </p>
            </div>
            <div class="row-between">
              <label
                for="ctrl-rowclass"
                class="text-sm text-foreground cursor-pointer"
              >
                失败行高亮
              </label>
              <ToggleSwitch
                v-model="enableCustomRowClass"
                input-id="ctrl-rowclass"
                class="shrink-0"
              />
            </div>
          </div>

          <!-- 表头对齐 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-align-horizontal-justify-start"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                表头对齐
              </p>
            </div>
            <Select
              v-model="headerAlignMode"
              :options="ALIGN_OPTIONS"
              option-label="label"
              option-value="value"
            />
          </div>

          <!-- 内容对齐 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-align-justify"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                内容对齐
              </p>
            </div>
            <Select
              v-model="cellAlignMode"
              :options="ALIGN_OPTIONS"
              option-label="label"
              option-value="value"
            />
          </div>
        </div>

        <p class="text-xs text-muted-foreground m-0 leading-relaxed italic">
          <span class="font-bold not-italic">说明：</span>
          以上控制项均实时绑定至虚拟网格引擎。列定义中已配置日期列
          <code class="text-xs">headerAlign: center</code>
          、金额列
          <code class="text-xs">headerAlign: right</code>
          ， 以验证表头对齐特性。Toolbar 自带「列显隐」按钮可验证 visibleColumns 转发修复。
        </p>
      </section>

      <!-- ── Section 3: ProTable ── -->
      <section
        ref="tableContainerRef"
        class="col-fill"
      >
        <template v-if="tableContainerHeight && tableContainerHeight > 0">
          <div :style="{ height: tableContainerHeight + 'px' }">
            <ProTable
              :key="tableRenderKey"
              state-key="example-pro-table-virtual"
              :virtual-scroll="true"
              :pagination="false"
              :columns="resolvedColumns"
              :data="massiveData"
              :loading="isGenerating"
              row-key="id"
              :striped-rows="stripedRows"
              :show-horizontal-lines="showHorizontalLines"
              :show-vertical-lines="showVerticalLines"
              :row-hover="rowHover"
              :selectable="selectable"
              :row-class-name="rowClassName"
              :show-toolbar="true"
            />
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
:deep(.vg-row-danger) {
  background-color: color-mix(in srgb, rgb(var(--danger)) 12%, rgb(var(--card))) !important;
}
</style>
