<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { ChartOpacityConfig } from '@/hooks/modules/useChartTheme/types'
import { useChartTheme } from '@/hooks/modules/useChartTheme'

defineOptions({ name: 'UseChartTheme' })

type ChartType = 'line' | 'bar' | 'pie' | 'radar' | 'gauge' | 'heatmap'

const chartType = ref<ChartType>('line')
const opacityEnabled = ref<boolean>(true)

const xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const lineData = [120, 200, 150, 80, 230]
const barData = [96, 150, 120, 70, 180]

const pieData = [
  { value: 1048, name: 'Search' },
  { value: 735, name: 'Direct' },
  { value: 580, name: 'Email' },
  { value: 484, name: 'Union Ads' },
]

const radarIndicators = [
  { name: '销售', max: 6500 },
  { name: '管理', max: 16000 },
  { name: '信息', max: 30000 },
  { name: '客服', max: 38000 },
  { name: '研发', max: 52000 },
  { name: '市场', max: 25000 },
]

const heatmapHours = ['12a', '2a', '4a', '6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p']
const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const heatmapData: [number, number, number][] = []
for (let d = 0; d < 7; d++) {
  for (let h = 0; h < 12; h++) {
    heatmapData.push([h, d, Math.round(Math.random() * 10)])
  }
}

function buildChartOption(type: ChartType): EChartsOption {
  const grid = { left: '10%', right: '10%', top: '18%', bottom: '8%', containLabel: true }

  switch (type) {
    case 'pie':
      return {
        legend: { show: true },
        tooltip: { trigger: 'item' },
        series: [
          {
            name: 'Visits',
            type: 'pie',
            radius: '60%',
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            data: pieData,
          },
        ],
      }
    case 'bar':
      return {
        legend: { show: true },
        tooltip: { trigger: 'axis' },
        grid,
        xAxis: { type: 'category', data: xLabels, boundaryGap: true },
        yAxis: { type: 'value' },
        series: [{ name: 'Revenue', type: 'bar', data: barData }],
      }
    case 'radar':
      return {
        legend: { show: true },
        tooltip: {},
        radar: { indicator: radarIndicators },
        series: [
          {
            name: 'Budget vs Spending',
            type: 'radar',
            data: [
              { value: [4200, 3000, 20000, 35000, 50000, 18000], name: 'Allocated' },
              { value: [5000, 14000, 28000, 26000, 42000, 21000], name: 'Actual' },
            ],
          },
        ],
      }
    case 'gauge':
      return {
        tooltip: { formatter: '{a} <br/>{b} : {c}%' },
        series: [
          {
            name: 'System',
            type: 'gauge',
            detail: { formatter: '{value}%' },
            data: [{ value: 68, name: 'CPU Usage' }],
          },
        ],
      }
    case 'heatmap':
      return {
        tooltip: { position: 'top' },
        grid: { left: '15%', right: '5%', top: '5%', bottom: '15%' },
        xAxis: { type: 'category', data: heatmapHours, splitArea: { show: true } },
        yAxis: { type: 'category', data: heatmapDays, splitArea: { show: true } },
        visualMap: {
          min: 0,
          max: 10,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
        },
        series: [{ name: 'Activity', type: 'heatmap', data: heatmapData, label: { show: true } }],
      }
    default:
      return {
        legend: { show: true },
        tooltip: { trigger: 'axis' },
        grid,
        xAxis: { type: 'category', data: xLabels, boundaryGap: true },
        yAxis: { type: 'value' },
        series: [{ name: 'Revenue', type: 'line', data: lineData, smooth: true, areaStyle: {} }],
      }
  }
}

const rawOption = computed<EChartsOption>(() => buildChartOption(chartType.value))

const opacityConfig = computed<ChartOpacityConfig | undefined>(() => {
  if (!opacityEnabled.value) return undefined
  return {
    lineArea: 0.25,
    area: 0.18,
    bar: 0.45,
    scatter: 0.5,
  }
})

const { themedOption } = useChartTheme(rawOption, opacityConfig)

const seriesCount = computed(() => {
  const s = themedOption.value?.series
  if (!s) return 0
  if (Array.isArray(s)) return s.length
  return 1
})

const hasBackground = computed(() => typeof themedOption.value?.backgroundColor === 'string')
const hasTextStyle = computed(() => !!themedOption.value?.textStyle)
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-palette"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">useChartTheme</span>
                  <span
                    class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    HOOK
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  rawOption -> useChartTheme -> themedOption（主题 + 透明度合并）
                </span>
              </div>
            </div>
            <div class="row-center gap-sm min-w-0">
              <Tag
                :value="themedOption ? 'themedOption: ready' : 'themedOption: —'"
                severity="secondary"
              />
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="col-stretch gap-md min-w-0">
            <div class="row-between min-w-0">
              <span class="text-sm text-muted-foreground">Current State</span>
              <div class="row-start flex-wrap gap-sm min-w-0">
                <Tag
                  :value="`seriesCount=${seriesCount}`"
                  severity="secondary"
                />
                <Tag
                  :value="hasBackground ? 'backgroundColor: yes' : 'backgroundColor: no'"
                  severity="info"
                />
                <Tag
                  :value="hasTextStyle ? 'textStyle: yes' : 'textStyle: no'"
                  severity="info"
                />
              </div>
            </div>

            <div class="row-between min-w-0">
              <span class="text-sm text-muted-foreground">Action Triggers</span>
            </div>

            <div class="col-stretch gap-sm min-w-0">
              <div class="text-sm text-muted-foreground">切换图表类型</div>
              <div class="row-start flex-wrap gap-sm min-w-0">
                <Button
                  size="small"
                  :severity="chartType === 'line' ? 'primary' : 'secondary'"
                  label="line"
                  @click="chartType = 'line'"
                />
                <Button
                  size="small"
                  :severity="chartType === 'bar' ? 'primary' : 'secondary'"
                  label="bar"
                  @click="chartType = 'bar'"
                />
                <Button
                  size="small"
                  :severity="chartType === 'pie' ? 'primary' : 'secondary'"
                  label="pie"
                  @click="chartType = 'pie'"
                />
                <Button
                  size="small"
                  :severity="chartType === 'radar' ? 'primary' : 'secondary'"
                  label="radar"
                  @click="chartType = 'radar'"
                />
                <Button
                  size="small"
                  :severity="chartType === 'gauge' ? 'primary' : 'secondary'"
                  label="gauge"
                  @click="chartType = 'gauge'"
                />
                <Button
                  size="small"
                  :severity="chartType === 'heatmap' ? 'primary' : 'secondary'"
                  label="heatmap"
                  @click="chartType = 'heatmap'"
                />
              </div>
            </div>

            <div class="col-stretch gap-sm min-w-0">
              <div class="text-sm text-muted-foreground">透明度合并（opacityConfig）</div>
              <div class="row-start flex-wrap gap-sm items-center min-w-0">
                <ToggleSwitch v-model="opacityEnabled" />
                <Tag
                  :value="opacityEnabled ? 'opacityConfig: on' : 'opacityConfig: off'"
                  :severity="opacityEnabled ? 'success' : 'secondary'"
                />
              </div>
            </div>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">Chart Preview</h3>
            <span class="text-sm text-muted-foreground">{{ chartType }}</span>
          </div>

          <div class="w-full h-[40vh] col-stretch min-w-0">
            <UseEcharts
              :option="themedOption"
              :theme-config="{ enableTheme: false }"
              :manual-update="false"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
