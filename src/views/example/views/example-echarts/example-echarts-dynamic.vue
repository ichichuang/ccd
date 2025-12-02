<script setup lang="ts">
import { useThemeSwitch } from '@/hooks'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
const { toggleThemeWithAnimation, isDark } = useThemeSwitch()

type IndustryKey = 'Solar' | 'Battery' | 'Hydrogen'
const industries: IndustryKey[] = ['Solar', 'Battery', 'Hydrogen']
type TimeRangeKey = 'm1' | 'm5' | 'm15'
const TIME_WINDOWS: Record<TimeRangeKey, number> = {
  m1: 60,
  m5: 60 * 5,
  m15: 60 * 15,
}

// 全局控制面板状态
const controls = reactive({
  paused: false,
  predictMode: false,
  timeRange: 'm1' as TimeRangeKey,
  linkage: true,
  show: {} as Record<IndustryKey, boolean>,
  legendVisible: true,
})
controls.show['Solar'] = true
controls.show['Battery'] = true
controls.show['Hydrogen'] = true

// 聚焦/联动状态
const focusedIndustry = ref<IndustryKey | null>(null)

// 指数时间序列数据（每秒）
const lineTimestamps = ref<number[]>([])
type SeriesKey = 'composite' | 'solar' | 'battery' | 'hydrogen'
const lineSeries = reactive<Record<SeriesKey, number[]>>({
  composite: [],
  solar: [],
  battery: [],
  hydrogen: [],
})

// 气泡图数据（每3秒）
interface BubbleDatum {
  name: IndustryKey
  activity: number
  volume: number
  state: 'up' | 'down' | 'flat'
}
const bubbles = ref<BubbleDatum[]>([
  { name: 'Solar', activity: 60, volume: 80, state: 'flat' },
  { name: 'Battery', activity: 55, volume: 70, state: 'flat' },
  { name: 'Hydrogen', activity: 50, volume: 65, state: 'flat' },
])

// 堆叠柱（每5秒）- 行业占比，和为100
const stackShare = reactive<Record<IndustryKey, number>>({} as Record<IndustryKey, number>)
stackShare['Solar'] = 40
stackShare['Battery'] = 35
stackShare['Hydrogen'] = 25
const stackMode = ref<'share' | 'mom'>('share')

// 仪表盘（每2秒）
const gaugeValue = ref(55)
const gaugeTargetFromHover = ref<number | null>(null)

// 定时器
let tLine: number | null = null
let tBubble: number | null = null
let tStack: number | null = null
let tGauge: number | null = null

function randDelta(maxAbs: number) {
  return (Math.random() * 2 - 1) * maxAbs
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function pushLinePoint() {
  const windowSize = TIME_WINDOWS[controls.timeRange]
  const now = Date.now()
  const lastComposite = lineSeries.composite.at(-1) ?? 55
  const base = clamp(lastComposite + randDelta(2.2), 20, 95)
  const solar = clamp((lineSeries.solar.at(-1) ?? 58) + randDelta(3), 15, 98)
  const battery = clamp((lineSeries.battery.at(-1) ?? 52) + randDelta(2.5), 15, 98)
  const hydrogen = clamp((lineSeries.hydrogen.at(-1) ?? 49) + randDelta(2.8), 15, 98)
  const composite = Math.round((solar * 0.4 + battery * 0.35 + hydrogen * 0.25 + base) / 2)

  lineTimestamps.value.push(now)
  lineSeries.solar.push(solar)
  lineSeries.battery.push(battery)
  lineSeries.hydrogen.push(hydrogen)
  lineSeries.composite.push(clamp(composite, 10, 100))

  // 控制窗口长度
  if (lineTimestamps.value.length > windowSize) {
    lineTimestamps.value.shift()
    ;(Object.keys(lineSeries) as (keyof typeof lineSeries)[]).forEach(k => lineSeries[k].shift())
  }
}

function updateBubbles() {
  bubbles.value = bubbles.value.map(b => {
    const old = b.activity
    const next = clamp(old + randDelta(6), 5, 100)
    const vol = clamp(b.volume + randDelta(8), 10, 120)
    const state: BubbleDatum['state'] = next > old + 1 ? 'up' : next < old - 1 ? 'down' : 'flat'
    return { ...b, activity: next, volume: vol, state }
  })
}

function renormalizeShares() {
  const delta = {} as Record<IndustryKey, number>
  industries.forEach(k => (delta[k] = randDelta(3)))
  let s = clamp(stackShare.Solar + delta.Solar, 10, 70)
  let b = clamp(stackShare.Battery + delta.Battery, 10, 70)
  let h = clamp(stackShare.Hydrogen + delta.Hydrogen, 10, 70)
  const sum = s + b + h
  s = (s / sum) * 100
  b = (b / sum) * 100
  h = (h / sum) * 100
  stackShare.Solar = Math.round(s)
  stackShare.Battery = Math.round(b)
  stackShare.Hydrogen = Math.round(h)
}

function tickGauge() {
  const base = gaugeTargetFromHover.value ?? gaugeValue.value
  const next = clamp(base + randDelta(3), 0, 100)
  gaugeValue.value = next
}

function startTimers() {
  stopTimers()
  tLine = window.setInterval(() => {
    if (!controls.paused) {
      pushLinePoint()
    }
  }, 1000)
  tBubble = window.setInterval(() => {
    if (!controls.paused) {
      updateBubbles()
    }
  }, 3000)
  tStack = window.setInterval(() => {
    if (!controls.paused) {
      renormalizeShares()
    }
  }, 5000)
  tGauge = window.setInterval(() => {
    if (!controls.paused) {
      tickGauge()
    }
  }, 2000)
}

function stopTimers() {
  if (tLine) {
    clearInterval(tLine)
  }
  if (tBubble) {
    clearInterval(tBubble)
  }
  if (tStack) {
    clearInterval(tStack)
  }
  if (tGauge) {
    clearInterval(tGauge)
  }
  tLine = tBubble = tStack = tGauge = null
}

// 初始填充
function bootstrapSeries() {
  lineTimestamps.value = []
  ;(Object.keys(lineSeries) as (keyof typeof lineSeries)[]).forEach(k => (lineSeries[k] = []))
  const n = TIME_WINDOWS[controls.timeRange]
  const now = Date.now()
  for (let i = n; i > 0; i--) {
    const t = now - i * 1000
    lineTimestamps.value.push(t)
    const base = 55 + Math.sin(i / 8) * 6
    const solar = clamp(base + 3 + Math.sin(i / 5) * 4 + randDelta(2), 15, 98)
    const battery = clamp(base - 1 + Math.cos(i / 6) * 3 + randDelta(2), 15, 98)
    const hydrogen = clamp(base - 2 + Math.sin(i / 7) * 5 + randDelta(2), 15, 98)
    lineSeries.solar.push(solar)
    lineSeries.battery.push(battery)
    lineSeries.hydrogen.push(hydrogen)
    const composite = Math.round(solar * 0.4 + battery * 0.35 + hydrogen * 0.25)
    lineSeries.composite.push(clamp(composite, 10, 100))
  }
}

onMounted(() => {
  bootstrapSeries()
  startTimers()
})

onUnmounted(() => {
  stopTimers()
})

watch(
  () => controls.timeRange,
  () => {
    bootstrapSeries()
  }
)

// 联动：折线 Hover → 仪表盘同步
function handleLineMouseOver(params: any) {
  if (!controls.linkage) {
    return
  }
  if (params?.value !== null && params?.value !== undefined) {
    const v = Array.isArray(params.value) ? params.value[1] : params.value
    gaugeTargetFromHover.value = clamp(Number(v) || 0, 0, 100)
  }
}
function handleLineMouseOut() {
  gaugeTargetFromHover.value = null
}

// 联动：气泡点击 → 聚焦对应行业
function handleBubbleClick(params: any) {
  if (!controls.linkage) {
    return
  }
  const name = params?.name as IndustryKey | undefined
  if (name && industries.includes(name)) {
    focusedIndustry.value = name
  }
}

// 联动：柱点击 → 聚焦对应行业
function handleBarClick(params: any) {
  if (!controls.linkage) {
    return
  }
  const name = params?.name as IndustryKey | undefined
  if (name && industries.includes(name)) {
    focusedIndustry.value = name
  }
}

// 悬停仪表盘 → 暂停全局动画
function handleGaugeMouseOver() {
  controls.paused = true
}
function handleGaugeMouseOut() {
  controls.paused = false
}

// 行业可见性（同步折线与气泡）
function toggleIndustry(ind: IndustryKey) {
  controls.show[ind] = !controls.show[ind]
}

// 视觉主题（色板/状态）
// 使用系统默认颜色融合，无需自定义 palette

// 折线图配置（实时指数）
const lineOption = computed(() => {
  const timeLabels = lineTimestamps.value.map(t => new Date(t).toLocaleTimeString())
  const series = [
    {
      name: 'AI Energy Index',
      type: 'line' as const,
      smooth: true,
      data: lineSeries.composite,
      lineStyle: { width: 3 },
      areaStyle: { opacity: 0.15 },
      symbol: 'circle',
      symbolSize: 6,
      emphasis: { focus: 'series' as const },
    },
    ...industries.map(ind => {
      return {
        name: ind,
        type: 'line' as const,
        smooth: true,
        data:
          ind === 'Solar'
            ? lineSeries.solar
            : ind === 'Battery'
              ? lineSeries.battery
              : lineSeries.hydrogen,
        lineStyle: {
          width: focusedIndustry.value && focusedIndustry.value !== ind ? 1.5 : 2.5,
          opacity: controls.show[ind] ? 1 : 0.15,
          type: controls.predictMode ? ('dashed' as const) : ('solid' as const),
        },
        areaStyle: {
          opacity: controls.show[ind] ? 0.08 : 0,
        },
        symbol: 'circle',
        symbolSize: 4,
        emphasis: { focus: 'series' as const },
        show: controls.show[ind],
      }
    }),
  ]
  return {
    title: {
      text: focusedIndustry.value
        ? `实时指数（聚焦：${focusedIndustry.value}）`
        : '实时指数（核心）',
      left: 10,
    },
    grid: { left: 40, right: 12, top: 36, bottom: 28, height: '60%' },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => {
        let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`
        params.forEach((param: any) => {
          const color = param.color
          const value = Array.isArray(param.value) ? param.value[1] : param.value
          result += `
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; margin-right: 8px;"></span>
              <span style="margin-right: 8px;">${param.seriesName}:</span>
              <span style="font-weight: bold;">${Math.round(value)}%</span>
            </div>
          `
        })
        return result
      },
    },
    legend: {
      top: 4,
      show: controls.legendVisible,
      type: 'scroll' as const,
    },
    xAxis: {
      type: 'category' as const,
      data: timeLabels,
      axisLine: {},
      name: '时间',
      nameLocation: 'middle' as const,
      nameGap: 25,
    },
    yAxis: {
      type: 'value' as const,
      axisLine: {},
      name: '指数值 (%)',
      nameLocation: 'middle' as const,
      nameGap: 35,
    },
    series,
  } as any
})

// 气泡图（行业活跃）
const bubbleOption = computed(() => {
  const data = bubbles.value
    .filter(b => controls.show[b.name])
    .map(b => {
      const size = Math.max(12, Math.min(48, b.volume / 2))
      const emphasis = focusedIndustry.value === b.name
      return {
        name: b.name,
        value: [b.activity, b.volume],
        symbolSize: size,
        itemStyle: {
          opacity: emphasis ? 0.95 : 0.75,
        },
      }
    })
  return {
    title: { text: '行业活跃气泡图', left: 10 },
    grid: { left: 30, right: 10, top: 36, bottom: 28 },
    tooltip: {
      trigger: 'item' as const,
      formatter: (p: any) => {
        const bubble = bubbles.value.find(b => b.name === p.name)
        const state = bubble?.state || 'flat'
        const stateText = state === 'up' ? '↑ 上升中' : state === 'down' ? '↓ 下降中' : '→ 稳定'

        return `
          <div style="font-weight: bold; margin-bottom: 8px;">${p.name}</div>
          <div style="margin: 4px 0;">
            <span>活跃度:</span>
            <span style="font-weight: bold; margin-left: 8px;">${Math.round(p.value[0])}</span>
          </div>
          <div style="margin: 4px 0;">
            <span>交易量:</span>
            <span style="font-weight: bold; margin-left: 8px;">${(Math.round(p.symbolSize * 2) / 10).toFixed(1)}M</span>
          </div>
          <div style="margin: 4px 0;">
            <span>趋势:</span>
            <span style="font-weight: bold; margin-left: 8px;">${stateText}</span>
          </div>
        `
      },
    },
    xAxis: {
      type: 'value' as const,
      name: '活跃度',
      nameLocation: 'middle' as const,
      nameGap: 30,
      axisLine: {},
      min: 0,
      max: 100,
    },
    yAxis: {
      type: 'value' as const,
      name: '交易量',
      nameLocation: 'middle' as const,
      nameGap: 30,
      axisLine: {},
      min: 0,
      max: 100,
    },
    series: [{ type: 'scatter' as const, data, emphasis: { focus: 'series' as const } }],
  } as any
})

// 堆叠柱（行业占比 / 环比）
const barOption = computed(() => {
  const cats = industries
  const shareData = cats.map(c =>
    c === 'Solar' ? stackShare.Solar : c === 'Battery' ? stackShare.Battery : stackShare.Hydrogen
  )
  const momData = cats.map((c, i) =>
    Math.round((shareData[i] - 33.3) * (Math.random() * 0.4 + 0.8))
  )
  const showData = stackMode.value === 'share' ? shareData : momData
  return {
    title: {
      text: `行业占比柱图（${stackMode.value === 'share' ? '当前占比' : '环比变化'}）`,
      left: 10,
    },
    grid: { left: 40, right: 12, top: 36, bottom: 28, height: '60%' },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => {
        const param = params[0]
        const value = param.value
        const name = param.name
        const isShare = stackMode.value === 'share'

        return `
          <div style="font-weight: bold; margin-bottom: 8px;">${name}</div>
          <div style="margin: 4px 0;">
            <span style="color: #666;">${isShare ? '当前占比' : '环比变化'}:</span>
            <span style="font-weight: bold; margin-left: 8px;">${value}${isShare ? '%' : '%'}</span>
          </div>
          <div style="margin: 4px 0; color: #999; font-size: 12px;">
            ${isShare ? '行业在总指数中的权重占比' : '相比上期的变化幅度'}
          </div>
        `
      },
    },
    xAxis: {
      type: 'category' as const,
      data: cats,
      axisLine: {},
    },
    yAxis: { type: 'value' as const, axisLine: {} },
    series: [
      {
        type: 'bar' as const,
        data: showData,
        itemStyle: {
          opacity: 0.9,
        },
      },
    ],
  } as any
})

// 仪表盘
const gaugeOption = computed(() => {
  const status = gaugeValue.value >= 70 ? '亢奋' : gaugeValue.value <= 30 ? '冷静' : '中性'
  return {
    title: {
      text: `市场情绪仪表盘（${status}）`,
      left: 'center' as const,
      top: 6,
    },
    series: [
      {
        type: 'gauge' as const,
        min: 0,
        max: 100,
        radius: '70%',
        center: ['50%', '60%'],
        axisLine: {
          lineStyle: {
            width: 10,
          },
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          fontSize: 22,
        },
        pointer: { itemStyle: {} },
        data: [
          { value: Math.round(gaugeTargetFromHover.value ?? gaugeValue.value), name: 'Sentiment' },
        ],
      },
    ],
  } as any
})

// 控制动作
function togglePause() {
  controls.paused = !controls.paused
}
function togglePredict() {
  controls.predictMode = !controls.predictMode
}
function setTimeRange(v: TimeRangeKey) {
  controls.timeRange = v
}
function toggleLinkage() {
  controls.linkage = !controls.linkage
}
function resetFocus() {
  console.log('resetFocus 被调用')
  focusedIndustry.value = null
  console.log('focusedIndustry 已重置为:', focusedIndustry.value)
}

// 图例显示控制
function toggleLegendVisible() {
  controls.legendVisible = !controls.legendVisible
}
</script>

<template lang="pug">
//- Dashboard 主容器
.between-col
  // 顶栏
  .w-full.h-headerHeight.between.px-gap
    .center.gap-gap
      .icon-carbon-ai-status.fs-appFontSizex.color-primary100
      .fs-appFontSizex.color-text100.tracking-wide.font-600 AInergy 实时监控中心
    .items-center.gap-gap.color-text200
      .items-center.gap-gap
        .icon-carbon-time
        span {{ new Date().toLocaleTimeString() }}
      .items-center.gap-gap
        .icon-carbon-renew
        span 刷新频率 1s/3s/5s/2s
      .c-card-primary.shadow-none.size-1-1.center(@click='toggleThemeWithAnimation($event)')
        template(v-if='isDark')
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-moon-clear-line')
        template(v-else)
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-sun-line')
  // 主体布局 - 左右分栏
  .w-full.h-contentsHeight.p-padding.between.gap-gap
    // 左侧图表区域 (80%)
    .full.c-border-primary.grid.gap-gap.grid-cols-2.rounded-rounded.p-gap(class='w-4/5')
      // 第一行：实时指数折线图
      .c-card.between-col.relative
        .full
          UseEcharts(
            :option='lineOption',
            :on-mouse-over='handleLineMouseOver',
            :on-mouse-out='handleLineMouseOut'
          )
        .between.absolute.bottom-0.left-0.right-0.p-padding
          .icon-carbon-view.fs-appFontSizex.color-text200.c-cp(@click='toggleLegendVisible')
          | 实时指数走势
          .fs-appFontSizes.color-text200
            | 📈 显示 AI 能源指数及各子行业实时走势，支持图例切换和悬停查看详细数值

      // 第二行：行业活跃气泡图
      .c-card.between-col.relative
        .full
          UseEcharts(:option='bubbleOption', :on-click='handleBubbleClick')
        .between.absolute.bottom-0.left-0.right-0.p-padding
          .icon-carbon-chart-scatter.fs-appFontSizex.color-text200
          | 行业活跃气泡图
          .fs-appFontSizes.color-text200
            | 📊 颜色表示活跃趋势，气泡大小 = 交易量，位置表示活跃度分布

      // 第三行：行业占比柱状图
      .c-card.between-col.relative
        .full
          UseEcharts(:option='barOption', :on-click='handleBarClick')
        .between.absolute.bottom-0.left-0.right-0.p-padding
          .icon-carbon-chart-bar.fs-appFontSizex.color-text200
          | 行业占比分析
          .fs-appFontSizes.color-text200
            | 📊 柱高代表行业在总指数中的占比，实时更新反映市场结构变化，点击柱条可聚焦对应行业

      // 第四行：市场情绪仪表盘
      .c-card.between-col.relative
        .full
          UseEcharts(
            :option='gaugeOption',
            :on-mouse-over='handleGaugeMouseOver',
            :on-mouse-out='handleGaugeMouseOut'
          )
        .between.absolute.bottom-0.left-0.right-0.p-padding
          .icon-carbon-dashboard.fs-appFontSizex.color-text200
          | 市场情绪仪表盘
          .fs-appFontSizes.color-text200
            | 🎯 实时监测市场情绪指数，影响整体图表色调，悬停可暂停全局动画

    // 右侧控制面板 (20%)
    .full.c-border-primary.between-col.gap-gap.p-padding.rounded-rounded(class='w-1/5')
      .flex.items-center.gap-gap.mb-gap
        .icon-carbon-settings.fs-appFontSizes.color-primary100
        .fs-appFontSizex.color-text100 控制面板

      .rounded-rounded.bg-bg300.p-paddings.mb-gap
        .fs-appFontSizes.color-text200
          | ⚙️ 全局控制中心，管理图表显示、刷新频率和联动效果

      // 主要控制按钮
      .flex.flex-col.gap-gap.mb-gap
        Button(
          :outlined='!controls.paused',
          :severity='controls.paused ? "success" : "warning"',
          @click='togglePause'
        )
          .icon-carbon-play(v-if='controls.paused')
          .icon-carbon-pause(v-else)
          span.ml-gap {{ controls.paused ? '恢复' : '暂停' }}

        Button(outlined, @click='togglePredict')
          .icon-carbon-magic-wand
          span.ml-gap {{ controls.predictMode ? '预测模式' : '实时模式' }}

        Button(outlined, severity='secondary', @click='toggleLinkage')
          .icon-carbon-link
          span.ml-gap {{ controls.linkage ? '联动：开' : '联动：关' }}

        Button(outlined, severity='help', @click='resetFocus')
          .icon-carbon-reset
          span.ml-gap 取消聚焦

      // 行业显示控制
      .mb-gap
        .fs-appFontSizes.color-text200.mb-gap 行业显示
        .flex.flex-col.gap-gap
          template(v-for='ind in industries', :key='ind')
            Button(
              :outlined='!controls.show[ind]',
              :severity='controls.show[ind] ? "success" : "secondary"',
              @click='toggleIndustry(ind)'
            ) {{ ind }}

      // 时间范围控制
      .mb-gap
        .fs-appFontSizes.color-text200.mb-gap 时间范围
        .flex.flex-col.gap-gap
          Button(:outlined='controls.timeRange !== "m1"', @click='setTimeRange("m1")') 1min
          Button(:outlined='controls.timeRange !== "m5"', @click='setTimeRange("m5")') 5min
          Button(:outlined='controls.timeRange !== "m15"', @click='setTimeRange("m15")') 15min

  // 页脚信息
  .w-full.h-footerHeight.between.bg-bg300
    .flex.items-center.justify-between
      .flex.items-center.gap-gap
        .icon-carbon-time.fs-appFontSizes.color-text200
        .fs-appFontSizes.color-text200
          | 最后更新：{{ new Date().toLocaleString() }}
      .flex.items-center.gap-gap
        .icon-carbon-ai-status.fs-appFontSizes.color-primary100
        .fs-appFontSizes.color-text200
          | AInergy Dashboard v1.0 - 实时智能分析中枢
</template>
<style lang="scss" scope>
@keyframes glow {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
