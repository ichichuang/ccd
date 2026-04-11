<script setup lang="tsx">
import type { EChartsOption } from 'echarts'
import type { ProTableColumn } from '@/components/ProTable'
import type { FormSchema, FormState } from '@/components/ProForm'
import { ID_PREFIX } from '@/constants/business'
import { ALERT_LEVEL_VALUE_ENUM, NODE_STATE_VALUE_ENUM } from '@/constants/enums'
import { formatSerialId } from '@/utils/business/idGenerator'
import ProForm from '@/components/ProForm/index.vue'
import Button from 'primevue/button'

defineOptions({ name: 'DashboardGoldenShowcase' })

// ──────────────────────────────────────────────────────────────────────────────
// Page lifecycle
// ──────────────────────────────────────────────────────────────────────────────
const pageReady = ref<boolean>(true)

// ──────────────────────────────────────────────────────────────────────────────
// KPI data (static mock)
// ──────────────────────────────────────────────────────────────────────────────
const kpiCards = [
  {
    label: '总吞吐',
    value: '128.4',
    unit: 'Gbps',
    icon: 'i-solar-accumulator-outline',
    surface: 'surface-primary',
    iconColor: 'text-primary',
    trend: '+12.3%',
    trendUp: true,
  },
  {
    label: '延迟',
    value: '23.6',
    unit: 'ms',
    icon: 'i-lucide-clock-alert',
    surface: 'surface-warn',
    iconColor: 'text-warn',
    trend: '-8.1%',
    trendUp: false,
  },
  {
    label: '可用率',
    value: '99.97',
    unit: '%',
    icon: 'i-lucide-shield-check',
    surface: 'surface-success',
    iconColor: 'text-success',
    trend: '+0.02%',
    trendUp: true,
  },
  {
    label: '活跃节点',
    value: '312',
    unit: 'nodes',
    icon: 'i-lucide-users',
    surface: 'surface-danger',
    iconColor: 'text-danger',
    trend: '+5',
    trendUp: true,
  },
] as const

// ──────────────────────────────────────────────────────────────────────────────
// Date utilities (UI display safety)
// ──────────────────────────────────────────────────────────────────────────────
const { formatI18n, isInitialized } = useDateUtils()

// ──────────────────────────────────────────────────────────────────────────────
// ECharts options (static mock; theme injected inside <UseEcharts>)
// ──────────────────────────────────────────────────────────────────────────────
const CHART_LABELS = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
] as const

const throughputSeries = [92, 96, 88, 105, 118, 126, 121, 128] as const
const latencySeries = [35, 32, 41, 29, 24, 22, 26, 23] as const

const alarmBuckets = ['Core', 'Edge', 'Region', 'Tenant'] as const
const alarmCounts = [18, 42, 26, 9] as const

const chartsThroughputLatencyOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    show: true,
    top: 2,
    right: 8,
    orient: 'horizontal',
    align: 'right',
    itemGap: 20,
    padding: [0, 0, 14, 0],
  },
  xAxis: { type: 'category', data: [...CHART_LABELS], boundaryGap: false },
  yAxis: { type: 'value' },
  grid: {
    left: 12,
    right: 12,
    top: 54,
    bottom: 12,
    containLabel: true,
  },
  series: [
    {
      name: '吞吐(Gbps)',
      type: 'line',
      smooth: true,
      data: [...throughputSeries],
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      emphasis: { focus: 'series' },
    },
    {
      name: '延迟(ms)',
      type: 'line',
      smooth: true,
      data: [...latencySeries],
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      emphasis: { focus: 'series' },
    },
  ],
}))

const chartsAlarmDistributionOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  legend: { show: false },
  xAxis: { type: 'category', data: [...alarmBuckets] },
  yAxis: { type: 'value' },
  grid: { left: 10, right: 10, top: 24, bottom: 10 },
  series: [{ name: '告警数', type: 'bar', data: [...alarmCounts] }],
}))

// Pie chart for node distribution
const chartsNodeDistributionOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item' },
  legend: { show: false },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      label: { show: false },
      data: [
        { value: 156, name: 'Core' },
        { value: 89, name: 'Edge' },
        { value: 42, name: 'Region' },
        { value: 25, name: 'Tenant' },
      ],
    },
  ],
}))

// ──────────────────────────────────────────────────────────────────────────────
// Node topology cards (NEW — showcase interactive-card + motion-lift)
// ──────────────────────────────────────────────────────────────────────────────
const nodeTopology = [
  {
    name: 'Core Cluster',
    count: 156,
    status: 'healthy',
    icon: 'i-lucide-server',
    color: 'text-primary',
  },
  {
    name: 'Edge Gateway',
    count: 89,
    status: 'healthy',
    icon: 'i-lucide-globe',
    color: 'text-success',
  },
  {
    name: 'Region Relay',
    count: 42,
    status: 'degraded',
    icon: 'i-lucide-map-pin',
    color: 'text-warn',
  },
  {
    name: 'Tenant Portal',
    count: 25,
    status: 'healthy',
    icon: 'i-lucide-building',
    color: 'text-info',
  },
] as const

// ──────────────────────────────────────────────────────────────────────────────
// System health metrics (NEW — showcase progress bars + glass-card)
// ──────────────────────────────────────────────────────────────────────────────
const systemHealth = [
  { label: 'CPU 利用率', value: 67, color: 'bg-primary' },
  { label: '内存使用', value: 82, color: 'bg-warn' },
  { label: '磁盘 I/O', value: 43, color: 'bg-success' },
  { label: '网络带宽', value: 91, color: 'bg-danger' },
] as const

// ──────────────────────────────────────────────────────────────────────────────
// Activity timeline (NEW — showcase interactive-item)
// ──────────────────────────────────────────────────────────────────────────────
const activityTimeline = [
  {
    time: '17:21',
    event: 'RZ-Edge-01 请求队列积压告警触发',
    level: 'critical',
    icon: 'i-lucide-alert-triangle',
  },
  {
    time: '17:18',
    event: 'Core-Scheduler-03 任务完成率恢复正常',
    level: 'success',
    icon: 'i-lucide-check-circle',
  },
  { time: '17:15', event: 'Region-NY-02 拓扑健康检查通过', level: 'info', icon: 'i-lucide-info' },
  {
    time: '17:13',
    event: '自动扩缩策略将 Edge 节点增至 89',
    level: 'info',
    icon: 'i-lucide-trending-up',
  },
  {
    time: '17:09',
    event: 'Edge-Gateway-09 心跳恢复，网络隔离已解除',
    level: 'success',
    icon: 'i-lucide-wifi',
  },
] as const

// ──────────────────────────────────────────────────────────────────────────────
// ProTable mock (recent alerts / node status)
// ──────────────────────────────────────────────────────────────────────────────
interface AlertRow extends Record<string, unknown> {
  id: string
  nodeName: string
  level: 'critical' | 'warning' | 'info'
  state: 'online' | 'degraded' | 'offline'
  lastSeenAt: string
  message: string
}

const mockRows = ref<AlertRow[]>([
  {
    id: formatSerialId(ID_PREFIX.ALERT, 1, 3),
    nodeName: 'RZ-Edge-01',
    level: 'critical',
    state: 'degraded',
    lastSeenAt: '2026-04-02T03:21:10Z',
    message: '请求队列积压，建议检查上游拥塞。',
  },
  {
    id: formatSerialId(ID_PREFIX.ALERT, 2, 3),
    nodeName: 'Core-Scheduler-03',
    level: 'warning',
    state: 'online',
    lastSeenAt: '2026-04-02T03:18:02Z',
    message: '任务完成率下降，监控重试策略。',
  },
  {
    id: formatSerialId(ID_PREFIX.ALERT, 3, 3),
    nodeName: 'Region-NY-02',
    level: 'info',
    state: 'online',
    lastSeenAt: '2026-04-02T03:15:44Z',
    message: '拓扑健康检查通过。',
  },
  {
    id: formatSerialId(ID_PREFIX.ALERT, 4, 3),
    nodeName: 'Tenant-Portal-07',
    level: 'warning',
    state: 'degraded',
    lastSeenAt: '2026-04-02T03:13:20Z',
    message: '缓存命中率波动，建议观察热 key。',
  },
  {
    id: formatSerialId(ID_PREFIX.ALERT, 5, 3),
    nodeName: 'Edge-Gateway-09',
    level: 'critical',
    state: 'offline',
    lastSeenAt: '2026-04-02T03:09:59Z',
    message: '心跳丢失，可能存在网络隔离。',
  },
  {
    id: formatSerialId(ID_PREFIX.ALERT, 6, 3),
    nodeName: 'Core-API-01',
    level: 'info',
    state: 'online',
    lastSeenAt: '2026-04-02T03:06:41Z',
    message: '接口延迟稳定在阈值内。',
  },
  {
    id: formatSerialId(ID_PREFIX.ALERT, 7, 3),
    nodeName: 'Region-SG-04',
    level: 'warning',
    state: 'online',
    lastSeenAt: '2026-04-02T03:04:03Z',
    message: '配置变更已生效，等待二次验证。',
  },
  {
    id: formatSerialId(ID_PREFIX.ALERT, 8, 3),
    nodeName: 'Tenant-Data-11',
    level: 'info',
    state: 'degraded',
    lastSeenAt: '2026-04-02T03:01:25Z',
    message: '写入吞吐下降，建议检查磁盘 I/O。',
  },
])

const alertColumns = computed<ProTableColumn<AlertRow>[]>(() => {
  return [
    {
      id: 'nodeName',
      title: '节点',
      field: 'nodeName',
      sortable: true,
      minWidth: '140px',
      headerAlign: 'left',
      align: 'left',
    },
    {
      id: 'level',
      title: '级别',
      field: 'level',
      sortable: true,
      width: '120px',
      valueEnum: ALERT_LEVEL_VALUE_ENUM,
    },
    {
      id: 'state',
      title: '状态',
      field: 'state',
      sortable: true,
      width: '140px',
      valueEnum: NODE_STATE_VALUE_ENUM,
    },
    {
      id: 'lastSeenAt',
      title: '最后更新',
      field: 'lastSeenAt',
      sortable: true,
      width: '260px',
      minWidth: '220px',
      render: ({ row }) => {
        if (!isInitialized.value) return '—'
        return formatI18n(String(row.lastSeenAt), 'datetime') || '—'
      },
    },
    {
      id: 'message',
      title: '告警描述',
      field: 'message',
      minWidth: '180px',
      headerAlign: 'left',
      align: 'left',
      className: () => 'min-w-0',
    },
  ]
})

// ──────────────────────────────────────────────────────────────────────────────
// Empty state region state (switchable)
// ──────────────────────────────────────────────────────────────────────────────
type EmptyMode = 'alerts' | 'nodes'
const activeEmptyMode = ref<EmptyMode>('alerts')

const emptyStateConfig = computed(() => {
  if (activeEmptyMode.value === 'alerts') {
    return {
      icon: 'i-lucide-bell',
      title: '暂无告警事件',
      description:
        '当前系统处于稳定态。你可以使用上方 Quick Action 创建一条模拟任务以观察联动效果。',
    }
  }
  return {
    icon: 'i-lucide-network',
    title: '节点状态正常',
    description: '没有异常节点需要处理。切换回告警视图查看模拟数据差异。',
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// Quick Action dialog (ProForm inside PrimeDialog)
// ──────────────────────────────────────────────────────────────────────────────
interface QuickActionValues extends Record<string, unknown> {
  taskTitle: string
  owner: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string
  notes: string
  enableSla: boolean
}

const quickActionSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'section',
      name: 'task_meta',
      label: '任务信息',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 12 } },
      children: [
        {
          name: 'taskTitle',
          component: 'input',
          label: '任务标题',
          required: true,
          span: { xs: 12, sm: 12 },
          rules: [
            {
              message: '请输入任务标题',
              validator: v => typeof v === 'string' && v.trim().length > 0,
            },
          ],
          props: { placeholder: '例如：故障恢复演练' },
        },
        {
          name: 'owner',
          component: 'input',
          label: '负责人',
          required: true,
          span: { xs: 12, sm: 6 },
          props: { placeholder: '例如：Ops Team' },
        },
        {
          name: 'priority',
          component: 'select',
          label: '优先级',
          span: { xs: 12, sm: 6 },
          props: {
            placeholder: '请选择优先级',
            options: [
              { label: 'P1', value: 'P1' },
              { label: 'P2', value: 'P2' },
              { label: 'P3', value: 'P3' },
            ],
          },
          defaultValue: 'P2',
        },
        {
          name: 'dueDate',
          component: 'date',
          label: '截止日期',
          span: { xs: 12, sm: 6 },
          props: { showIcon: true, placeholder: '选择日期' },
        },
        {
          name: 'enableSla',
          component: 'switch',
          label: '启用 SLA 告警',
          span: { xs: 12, sm: 6 },
          defaultValue: true,
        },
        {
          name: 'notes',
          component: 'textarea',
          label: '备注',
          span: { xs: 12, sm: 12 },
          props: { rows: 4, placeholder: '补充上下文（可选）' },
        },
      ],
    },
  ],
})

const quickActionInitialValues = reactive<QuickActionValues>({
  taskTitle: '模拟：创建战术任务',
  owner: 'Tactical-Ops',
  priority: 'P1',
  dueDate: '2026-04-20',
  notes: '用于展示 dashboard 的交互闭环：图表、告警列表、弹窗表单。',
  enableSla: true,
})

const { openDialog, closeDialogByIndex } = useDialog()

function handleQuickActionOpen(): void {
  openDialog({
    header: 'Quick Action',
    modal: true,
    hideFooter: true,
    contentRenderer: ({ index }) => {
      return (
        <div class="layout-full col-stretch gap-sm min-w-0">
          <p class="text-xs text-muted-foreground leading-relaxed">
            填写下方字段以模拟创建一条战术任务；提交后关闭弹窗。
          </p>
          <ProForm
            schema={quickActionSchema}
            initialValues={quickActionInitialValues}
            validateOn="submit"
            onSubmit={(values: QuickActionValues) => {
              void values
              closeDialogByIndex(index, { command: 'sure' })
            }}
            v-slots={{
              footer: (slotProps: {
                formState: FormState<QuickActionValues>
                submit: () => Promise<void>
              }) => (
                <div class="row-between gap-sm pt-sm  border-border/15 mt-md">
                  <span class="text-xs text-muted-foreground">必填项已标注 *</span>
                  <div class="row-end gap-sm shrink-0">
                    <Button
                      type="button"
                      label="取消"
                      severity="secondary"
                      outlined
                      size="small"
                      disabled={slotProps.formState.submitting}
                      class="duration-sm"
                      onClick={() => {
                        closeDialogByIndex(index)
                      }}
                    />
                    <Button
                      type="button"
                      label="创建任务"
                      icon="i-lucide-send"
                      severity="primary"
                      size="small"
                      loading={slotProps.formState.submitting}
                      disabled={slotProps.formState.submitting}
                      onClick={() => {
                        void slotProps.submit()
                      }}
                    />
                  </div>
                </div>
              ),
            }}
          />
        </div>
      )
    },
  })
}
</script>

<template>
  <AnimateWrapper
    :show="pageReady"
    enter="fadeInUp"
    leave="fadeOut"
  >
    <div
      data-archetype="A3-stats-grid"
      class="col-stretch gap-md min-h-0 min-w-0"
    >
      <div class="layout-container col-stretch gap-md min-w-0">
        <!-- ═══════════════════════════════════════════════════════════════════
             Section 1: Header — glass-panel + glass-icon-box + surface-info
             ═══════════════════════════════════════════════════════════════════ -->
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-radar"
                  size="xl"
                  class="text-accent!"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">
                    Tactical Command Console
                  </span>
                  <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    Live Mock
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  语义快捷类全量演示：图表、告警列表、节点拓扑、系统健康、活动时间线与交互弹窗。
                </span>
              </div>
            </div>

            <Button
              v-auth="['example:architecture:write']"
              label="Quick Action"
              severity="primary"
              size="small"
              class="shrink-0 interaction-shrink"
              @click="handleQuickActionOpen"
            />
          </div>

          <!-- KPI Grid — material-elevated + surface-* + glass-icon-box -->
          <div class="grid grid-cols-12 gap-md min-w-0">
            <div
              v-for="(kpi, idx) in kpiCards"
              :key="idx"
              class="col-span-12 md:col-span-6 xl:col-span-3 min-w-0 interactive-card motion-lift"
              :class="kpi.surface"
            >
              <div class="row-start gap-sm min-w-0">
                <div class="glass-icon-box shrink-0">
                  <Icons
                    :name="kpi.icon"
                    size="xl"
                    :class="kpi.iconColor"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0 flex-1">
                  <span class="text-xs text-muted-foreground text-no-wrap">{{ kpi.label }}</span>
                  <div class="row-start gap-xs min-w-0">
                    <span class="text-2xl font-bold text-foreground leading-none">
                      {{ kpi.value }}
                    </span>
                    <span
                      class="text-xs font-semibold"
                      :class="kpi.trendUp ? 'text-success' : 'text-danger'"
                    >
                      {{ kpi.trend }}
                    </span>
                  </div>
                  <span class="text-xs text-muted-foreground">{{ kpi.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- ═══════════════════════════════════════════════════════════════════
             Section 2: Charts — material-elevated + col-fill + surface badges
             ═══════════════════════════════════════════════════════════════════ -->
        <section class="grid grid-cols-12 gap-md min-w-0">
          <!-- Throughput & Latency (8 cols on xl) -->
          <div
            class="col-span-12 xl:col-span-8 material-elevated col-stretch gap-sm min-h-[300px] !overflow-visible"
          >
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="row-start gap-xs min-w-0">
                <Icons
                  name="i-lucide-chart-line"
                  size="sm"
                  class="text-primary"
                />
                <span class="text-sm font-semibold text-foreground text-no-wrap">
                  Throughput & Latency
                </span>
              </div>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Hourly
              </span>
            </div>
            <div class="col-fill min-w-0 !overflow-visible">
              <UseEcharts
                :option="chartsThroughputLatencyOption"
                :auto-resize="true"
              />
            </div>
          </div>

          <!-- Right side: Alarm Distribution + Node Distribution pie -->
          <div class="col-span-12 xl:col-span-4 col-stretch gap-md min-w-0">
            <!-- Alarm Distribution -->
            <div
              class="material-elevated col-stretch gap-sm min-w-0 flex-1 min-h-[200px] !overflow-visible"
            >
              <div class="row-between gap-sm min-w-0 shrink-0">
                <div class="row-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-chart-bar"
                    size="sm"
                    class="text-accent!"
                  />
                  <span class="text-sm font-semibold text-foreground text-no-wrap">
                    Alarm Distribution
                  </span>
                </div>
                <span class="surface-warn rounded-md px-sm py-xs text-xs font-semibold uppercase">
                  Buckets
                </span>
              </div>
              <div class="col-fill min-w-0 !overflow-visible">
                <UseEcharts
                  :option="chartsAlarmDistributionOption"
                  :auto-resize="true"
                />
              </div>
            </div>

            <!-- Node Distribution Pie -->
            <div
              class="glass-card col-stretch gap-sm min-w-0 flex-1 min-h-[200px] !overflow-visible"
            >
              <div class="row-between gap-sm min-w-0 shrink-0">
                <div class="row-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-pie-chart"
                    size="sm"
                    class="text-success"
                  />
                  <span class="text-sm font-semibold text-foreground text-no-wrap">
                    Node Distribution
                  </span>
                </div>
                <span
                  class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                >
                  Live
                </span>
              </div>
              <div class="col-fill min-w-0 !overflow-visible">
                <UseEcharts
                  :option="chartsNodeDistributionOption"
                  :auto-resize="true"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════
             Section 3: Node Topology + System Health
             interactive-card + motion-lift + glass-card + progress bars
             ═══════════════════════════════════════════════════════════════════ -->
        <section class="grid grid-cols-12 gap-md min-w-0">
          <!-- Node Topology Cards -->
          <div class="col-span-12 lg:col-span-8 col-stretch gap-md min-w-0">
            <div class="glass-panel col-stretch gap-md min-w-0">
              <div class="row-between gap-sm min-w-0 shrink-0">
                <div class="row-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-network"
                    size="sm"
                    class="text-primary"
                  />
                  <span class="text-sm font-semibold text-foreground text-no-wrap">
                    Node Topology
                  </span>
                </div>
                <span
                  class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                >
                  {{ nodeTopology.reduce((s, n) => s + n.count, 0) }} Total
                </span>
              </div>
              <div class="grid grid-cols-12 gap-md min-w-0">
                <div
                  v-for="(node, idx) in nodeTopology"
                  :key="idx"
                  class="col-span-12 sm:col-span-6 xl:col-span-3 interactive-card motion-lift min-w-0"
                >
                  <div class="col-center gap-sm min-w-0">
                    <div class="glass-icon-box">
                      <Icons
                        :name="node.icon"
                        size="lg"
                        :class="node.color"
                      />
                    </div>
                    <span class="text-sm font-semibold text-foreground text-no-wrap">
                      {{ node.name }}
                    </span>
                    <span class="text-2xl font-bold text-foreground leading-none">
                      {{ node.count }}
                    </span>
                    <span
                      class="rounded-md px-sm py-xs text-xs font-semibold uppercase"
                      :class="node.status === 'healthy' ? 'surface-success' : 'surface-warn'"
                    >
                      {{ node.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- System Health + Activity Timeline -->
          <div class="col-span-12 lg:col-span-4 col-stretch gap-md min-w-0">
            <!-- System Health -->
            <div class="glass-card col-stretch gap-md min-w-0">
              <div class="row-between gap-sm min-w-0 shrink-0">
                <div class="row-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-heart-pulse"
                    size="sm"
                    class="text-danger"
                  />
                  <span class="text-sm font-semibold text-foreground text-no-wrap">
                    System Health
                  </span>
                </div>
                <span class="surface-danger rounded-md px-sm py-xs text-xs font-semibold uppercase">
                  Real-time
                </span>
              </div>
              <div class="col-stretch gap-sm min-w-0">
                <div
                  v-for="(metric, idx) in systemHealth"
                  :key="idx"
                  class="col-stretch gap-xs min-w-0"
                >
                  <div class="row-between min-w-0">
                    <span class="text-xs text-muted-foreground">{{ metric.label }}</span>
                    <span class="text-xs font-semibold text-foreground">{{ metric.value }}%</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-lg"
                      :class="metric.color"
                      :style="{ width: `${metric.value}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity Timeline -->
            <div class="glass-card col-stretch gap-md min-w-0 flex-1">
              <div class="row-between gap-sm min-w-0 shrink-0">
                <div class="row-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-clock"
                    size="sm"
                    class="text-info"
                  />
                  <span class="text-sm font-semibold text-foreground text-no-wrap">Activity</span>
                </div>
                <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                  Latest
                </span>
              </div>
              <CScrollbar class="col-fill min-w-0">
                <div class="col-stretch gap-xs min-w-0">
                  <div
                    v-for="(item, idx) in activityTimeline"
                    :key="idx"
                    class="interactive-item row-start gap-sm min-w-0"
                  >
                    <Icons
                      :name="item.icon"
                      size="sm"
                      :class="
                        item.level === 'critical'
                          ? 'text-danger'
                          : item.level === 'success'
                            ? 'text-success'
                            : 'text-info'
                      "
                    />
                    <div class="col-stretch gap-xs min-w-0 flex-1">
                      <span class="text-xs text-foreground text-ellipsis-1">{{ item.event }}</span>
                      <span class="text-xs text-muted-foreground">{{ item.time }}</span>
                    </div>
                  </div>
                </div>
              </CScrollbar>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════
             Section 4: Alerts Table — FULL WIDTH (独占一行)
             material-solid + CScrollbar + ProTable
             ═══════════════════════════════════════════════════════════════════ -->
        <section class="material-solid col-stretch p-md gap-md min-w-0">
          <div class="row-between gap-md min-w-0 shrink-0">
            <div class="row-start gap-sm min-w-0">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-bell-ring"
                  size="sm"
                  class="text-warn"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <span class="text-sm font-semibold text-foreground text-no-wrap">
                  Recent Alerts
                </span>
                <span class="text-xs text-muted-foreground">实时告警事件流，点击行查看详情</span>
              </div>
            </div>
            <span class="surface-warn rounded-md px-sm py-xs text-xs font-semibold uppercase">
              {{ mockRows.length }} Events
            </span>
          </div>

          <div class="min-w-0">
            <ProTable
              :columns="alertColumns"
              :data="mockRows"
              row-key="id"
              height-mode="auto"
              :pagination="false"
              :show-toolbar="false"
              :loading="false"
            />
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════
             Section 5: Empty State Demo — glass-panel + EmptyState
             ═══════════════════════════════════════════════════════════════════ -->
        <section class="glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0 shrink-0">
            <div class="row-start gap-sm min-w-0">
              <Icons
                name="i-lucide-box"
                size="sm"
                class="text-accent!"
              />
              <span class="text-sm font-semibold text-foreground">演示区</span>
            </div>

            <div class="row-start gap-xs flex-wrap min-w-0">
              <Button
                size="small"
                class="interaction-shrink"
                :severity="activeEmptyMode === 'alerts' ? 'primary' : 'secondary'"
                outlined
                label="Alerts"
                @click="activeEmptyMode = 'alerts'"
              />
              <Button
                size="small"
                class="interaction-shrink"
                :severity="activeEmptyMode === 'nodes' ? 'primary' : 'secondary'"
                outlined
                label="Nodes"
                @click="activeEmptyMode = 'nodes'"
              />
            </div>
          </div>

          <EmptyState
            :icon="emptyStateConfig.icon"
            :title="emptyStateConfig.title"
            :description="emptyStateConfig.description"
          />
        </section>
      </div>
    </div>
  </AnimateWrapper>
</template>

<style lang="scss" scoped></style>
