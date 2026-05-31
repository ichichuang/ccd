<script setup lang="tsx">
import type { EChartsOption } from 'echarts'
import type { FormState } from '@ccd/vue-ui'
import { useDialog } from '@/hooks/modules/useDialog'
import { CcdButton as Button } from '@ccd/vue-ui'
import { useTimeoutFn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import {
  createAlertColumns,
  createAlertLevelValueEnum,
  createMockAlertRows,
  createNodeStateValueEnum,
} from './configs/alerts'
import {
  createQuickActionInitialValues,
  createQuickActionSchema,
  type QuickActionValues,
} from './configs/quickAction'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const loadProForm = () => import('@ccd/vue-ui').then(module => module.ProForm)
const ProForm = defineAsyncComponent(loadProForm)
const { start: scheduleProFormPreload } = useTimeoutFn(
  () => {
    void loadProForm()
  },
  0,
  { immediate: false }
)

if (typeof window !== 'undefined') {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      void loadProForm()
    })
  } else {
    scheduleProFormPreload()
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// KPI data (static mock)
// ──────────────────────────────────────────────────────────────────────────────
const kpiCards = [
  {
    labelKey: 'dashboard.kpi.throughput',
    value: '128.4',
    unitKey: 'dashboard.units.gbps',
    icon: 'i-solar-accumulator-outline',
    surface: 'surface-primary',
    iconColor: 'text-primary',
    trend: '+12.3%',
    trendUp: true,
  },
  {
    labelKey: 'dashboard.kpi.latency',
    value: '23.6',
    unitKey: 'dashboard.units.ms',
    icon: 'i-lucide-clock-alert',
    surface: 'surface-warn',
    iconColor: 'text-warn',
    trend: '-8.1%',
    trendUp: false,
  },
  {
    labelKey: 'dashboard.kpi.availability',
    value: '99.97',
    unitKey: 'dashboard.units.percent',
    icon: 'i-lucide-shield-check',
    surface: 'surface-success',
    iconColor: 'text-success',
    trend: '+0.02%',
    trendUp: true,
  },
  {
    labelKey: 'dashboard.kpi.activeNodes',
    value: '312',
    unitKey: 'dashboard.units.nodes',
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
const chartLabels = [
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
  xAxis: { type: 'category', data: [...chartLabels], boundaryGap: false },
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
      name: t('dashboard.charts.series.throughput'),
      type: 'line',
      smooth: true,
      data: [...throughputSeries],
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      emphasis: { focus: 'series' },
    },
    {
      name: t('dashboard.charts.series.latency'),
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
  xAxis: {
    type: 'category',
    data: [
      t('dashboard.charts.buckets.core'),
      t('dashboard.charts.buckets.edge'),
      t('dashboard.charts.buckets.region'),
      t('dashboard.charts.buckets.tenant'),
    ],
  },
  yAxis: { type: 'value' },
  grid: { left: 10, right: 10, top: 24, bottom: 10 },
  series: [{ name: t('dashboard.charts.series.alertCount'), type: 'bar', data: [...alarmCounts] }],
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
        { value: 156, name: t('dashboard.charts.buckets.core') },
        { value: 89, name: t('dashboard.charts.buckets.edge') },
        { value: 42, name: t('dashboard.charts.buckets.region') },
        { value: 25, name: t('dashboard.charts.buckets.tenant') },
      ],
    },
  ],
}))

// ──────────────────────────────────────────────────────────────────────────────
// Node topology cards (NEW — showcase interactive-card + motion-lift)
// ──────────────────────────────────────────────────────────────────────────────
const nodeTopology = computed(() => [
  {
    name: t('dashboard.topology.nodes.coreCluster'),
    count: 156,
    statusKey: 'dashboard.topology.status.healthy',
    statusSurface: 'surface-success',
    icon: 'i-lucide-server',
    color: 'text-primary',
  },
  {
    name: t('dashboard.topology.nodes.edgeGateway'),
    count: 89,
    statusKey: 'dashboard.topology.status.healthy',
    statusSurface: 'surface-success',
    icon: 'i-lucide-globe',
    color: 'text-success',
  },
  {
    name: t('dashboard.topology.nodes.regionRelay'),
    count: 42,
    statusKey: 'dashboard.topology.status.degraded',
    statusSurface: 'surface-warn',
    icon: 'i-lucide-map-pin',
    color: 'text-warn',
  },
  {
    name: t('dashboard.topology.nodes.tenantPortal'),
    count: 25,
    statusKey: 'dashboard.topology.status.healthy',
    statusSurface: 'surface-success',
    icon: 'i-lucide-building',
    color: 'text-info',
  },
])

// ──────────────────────────────────────────────────────────────────────────────
// System health metrics (NEW — showcase progress bars + glass-card)
// ──────────────────────────────────────────────────────────────────────────────
const systemHealth = [
  { labelKey: 'dashboard.health.cpu', value: 67, color: 'bg-primary' },
  { labelKey: 'dashboard.health.memory', value: 82, color: 'bg-warn' },
  { labelKey: 'dashboard.health.disk', value: 43, color: 'bg-success' },
  { labelKey: 'dashboard.health.network', value: 91, color: 'bg-danger' },
] as const

// ──────────────────────────────────────────────────────────────────────────────
// Activity timeline (NEW — showcase interactive-item)
// ──────────────────────────────────────────────────────────────────────────────
const activityTimeline = computed(() => [
  {
    time: '17:21',
    event: t('dashboard.activity.events.queueBacklogTriggered'),
    level: 'critical',
    icon: 'i-lucide-alert-triangle',
  },
  {
    time: '17:18',
    event: t('dashboard.activity.events.completionRateRecovered'),
    level: 'success',
    icon: 'i-lucide-check-circle',
  },
  {
    time: '17:15',
    event: t('dashboard.activity.events.topologyCheckPassed'),
    level: 'info',
    icon: 'i-lucide-info',
  },
  {
    time: '17:13',
    event: t('dashboard.activity.events.autoScaleExpanded'),
    level: 'info',
    icon: 'i-lucide-trending-up',
  },
  {
    time: '17:09',
    event: t('dashboard.activity.events.heartbeatRecovered'),
    level: 'success',
    icon: 'i-lucide-wifi',
  },
])

// ──────────────────────────────────────────────────────────────────────────────
// ProTable mock (recent alerts / node status)
// ──────────────────────────────────────────────────────────────────────────────
const alertLevelValueEnum = computed(() => createAlertLevelValueEnum(t))
const nodeStateValueEnum = computed(() => createNodeStateValueEnum(t))

const mockRows = computed(() => createMockAlertRows(t))

const alertColumns = computed(() =>
  createAlertColumns({
    t,
    isDateReady: isInitialized.value,
    formatDate: value => formatI18n(value, 'datetime') || '—',
    alertLevelValueEnum: alertLevelValueEnum.value,
    nodeStateValueEnum: nodeStateValueEnum.value,
  })
)

// ──────────────────────────────────────────────────────────────────────────────
// Empty state region state (switchable)
// ──────────────────────────────────────────────────────────────────────────────
type EmptyMode = 'alerts' | 'nodes'
const activeEmptyMode = ref<EmptyMode>('alerts')

const emptyStateConfig = computed(() => {
  if (activeEmptyMode.value === 'alerts') {
    return {
      icon: 'i-lucide-bell',
      title: t('dashboard.empty.alertsTitle'),
      description: t('dashboard.empty.alertsDescription'),
    }
  }
  return {
    icon: 'i-lucide-network',
    title: t('dashboard.empty.nodesTitle'),
    description: t('dashboard.empty.nodesDescription'),
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// Quick Action dialog (ProForm inside PrimeDialog)
// ──────────────────────────────────────────────────────────────────────────────
const quickActionSchema = computed(() => createQuickActionSchema(t))
const quickActionInitialValues = computed(() => createQuickActionInitialValues(t))

const { openDialog, closeDialogByIndex } = useDialog()

function handleQuickActionOpen(): void {
  openDialog({
    header: t('dashboard.quickAction.title'),
    modal: true,
    hideFooter: true,
    contentRenderer: ({ index }) => {
      return (
        <div class="layout-full col-stretch gap-sm min-w-0">
          <p class="text-xs text-muted-foreground leading-relaxed">
            {t('dashboard.quickAction.description')}
          </p>
          <ProForm
            schema={quickActionSchema.value}
            initialValues={quickActionInitialValues.value}
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
                  <span class="text-xs text-muted-foreground">
                    {t('dashboard.quickAction.requiredHint')}
                  </span>
                  <div class="row-end gap-sm shrink-0">
                    <Button
                      type="button"
                      label={t('common.cancel')}
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
                      label={t('dashboard.quickAction.submit')}
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
  <div
    id="dashboard-page"
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
                  {{ t('dashboard.hero.title') }}
                </span>
                <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                  {{ t('dashboard.hero.badge') }}
                </span>
              </div>
              <span class="text-sm text-muted-foreground text-ellipsis-1">
                {{ t('dashboard.hero.description') }}
              </span>
            </div>
          </div>

          <Button
            id="dashboard-quick-action"
            v-auth="['example:architecture:write']"
            :label="t('dashboard.quickAction.title')"
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
                <span class="text-xs text-muted-foreground text-no-wrap">
                  {{ t(kpi.labelKey) }}
                </span>
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
                <span class="text-xs text-muted-foreground">{{ t(kpi.unitKey) }}</span>
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
                {{ t('dashboard.charts.throughputLatency') }}
              </span>
            </div>
            <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
              {{ t('dashboard.badges.hourly') }}
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
                  {{ t('dashboard.charts.alarmDistribution') }}
                </span>
              </div>
              <span class="surface-warn rounded-md px-sm py-xs text-xs font-semibold uppercase">
                {{ t('dashboard.badges.buckets') }}
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
          <div class="glass-card col-stretch gap-sm min-w-0 flex-1 min-h-[200px] !overflow-visible">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="row-start gap-xs min-w-0">
                <Icons
                  name="i-lucide-pie-chart"
                  size="sm"
                  class="text-success"
                />
                <span class="text-sm font-semibold text-foreground text-no-wrap">
                  {{ t('dashboard.charts.nodeDistribution') }}
                </span>
              </div>
              <span class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase">
                {{ t('dashboard.badges.live') }}
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
                  {{ t('dashboard.sections.nodeTopology') }}
                </span>
              </div>
              <span class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase">
                {{ nodeTopology.reduce((s, n) => s + n.count, 0) }}
                {{ t('dashboard.badges.total') }}
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
                    :class="node.statusSurface"
                  >
                    {{ t(node.statusKey) }}
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
                  {{ t('dashboard.sections.systemHealth') }}
                </span>
              </div>
              <span class="surface-danger rounded-md px-sm py-xs text-xs font-semibold uppercase">
                {{ t('dashboard.badges.realtime') }}
              </span>
            </div>
            <div class="col-stretch gap-sm min-w-0">
              <div
                v-for="(metric, idx) in systemHealth"
                :key="idx"
                class="col-stretch gap-xs min-w-0"
              >
                <div class="row-between min-w-0">
                  <span class="text-xs text-muted-foreground">{{ t(metric.labelKey) }}</span>
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
                <span class="text-sm font-semibold text-foreground text-no-wrap">
                  {{ t('dashboard.sections.activity') }}
                </span>
              </div>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                {{ t('dashboard.badges.latest') }}
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
                {{ t('dashboard.sections.recentAlerts') }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ t('dashboard.sections.recentAlertsDescription') }}
              </span>
            </div>
          </div>
          <span class="surface-warn rounded-md px-sm py-xs text-xs font-semibold uppercase">
            {{ mockRows.length }} {{ t('dashboard.badges.events') }}
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
            <span class="text-sm font-semibold text-foreground">
              {{ t('dashboard.sections.demo') }}
            </span>
          </div>

          <div class="row-start gap-xs flex-wrap min-w-0">
            <Button
              size="small"
              class="interaction-shrink"
              :severity="activeEmptyMode === 'alerts' ? 'primary' : 'secondary'"
              outlined
              :label="t('dashboard.empty.toggleAlerts')"
              @click="activeEmptyMode = 'alerts'"
            />
            <Button
              size="small"
              class="interaction-shrink"
              :severity="activeEmptyMode === 'nodes' ? 'primary' : 'secondary'"
              outlined
              :label="t('dashboard.empty.toggleNodes')"
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
</template>

<style lang="scss" scoped></style>
