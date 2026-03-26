<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { ChartOpacityConfig } from '@/hooks/modules/useChartTheme/types'

defineOptions({ name: 'UseChartTheme' })

type ChartType = 'line' | 'bar' | 'pie'

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

const rawOption = computed<EChartsOption>(() => {
  if (chartType.value === 'pie') {
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
  }

  if (chartType.value === 'bar') {
    return {
      legend: { show: true },
      tooltip: { trigger: 'axis' },
      grid: { left: '10%', right: '10%', top: '18%', bottom: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: xLabels,
        boundaryGap: true,
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Revenue',
          type: 'bar',
          data: barData,
        },
      ],
    }
  }

  return {
    legend: { show: true },
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '10%', top: '18%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xLabels,
      boundaryGap: true,
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Revenue',
        type: 'line',
        data: lineData,
        smooth: true,
        areaStyle: {},
      },
    ],
  }
})

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
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">useChartTheme Demo</h2>
            <p class="text-sm text-muted-foreground m-0">
              rawOption -> useChartTheme -> themedOption（主题 + 透明度合并）
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="themedOption ? 'themedOption: ready' : 'themedOption: —'"
              severity="secondary"
            />
          </div>
        </div>

        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between">
            <span class="text-sm text-muted-foreground">Current State</span>
            <div class="row-start flex-wrap gap-sm">
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

          <div class="row-between">
            <span class="text-sm text-muted-foreground">Action Triggers</span>
          </div>

          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">切换图表类型</div>
            <div class="row-start flex-wrap gap-sm">
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
            </div>
          </div>

          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">透明度合并（opacityConfig）</div>
            <div class="row-start flex-wrap gap-sm items-center">
              <ToggleSwitch v-model="opacityEnabled" />
              <Tag
                :value="opacityEnabled ? 'opacityConfig: on' : 'opacityConfig: off'"
                :severity="opacityEnabled ? 'success' : 'secondary'"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <h3 class="text-md font-semibold text-foreground m-0">Chart Preview</h3>
          <span class="text-sm text-muted-foreground">{{ chartType }}</span>
        </div>
        <Divider />

        <div class="w-full h-[40vh] col-stretch">
          <UseEcharts
            :option="themedOption"
            :theme-config="{ enableTheme: false }"
            :manual-update="false"
          />
        </div>
      </section>
    </div>
  </div>
</template>
