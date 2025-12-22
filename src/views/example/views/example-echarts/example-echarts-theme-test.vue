<script setup lang="ts">
import { useThemeSwitch } from '@/hooks'
import { ref } from 'vue'

const { toggleThemeWithAnimation, isDark } = useThemeSwitch()

// 测试图表1：基础折线图（已迁移样式函数）
const lineChartOption = ref({
  title: {
    text: '响应式主题测试 - 折线图',
  },
  tooltip: {
    trigger: 'axis' as const,
  },
  legend: {},
  xAxis: {
    type: 'category' as const,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: {
    type: 'value' as const,
  },
  series: [
    {
      name: '销量',
      type: 'line' as const,
      data: [120, 132, 101, 134, 90, 230, 210],
    },
    {
      name: '访问量',
      type: 'line' as const,
      data: [220, 182, 191, 234, 290, 330, 310],
    },
  ],
})

// 测试图表2：基础柱状图（已迁移样式函数）
const barChartOption = ref({
  title: {
    text: '响应式主题测试 - 柱状图',
  },
  tooltip: {
    trigger: 'axis' as const,
  },
  legend: {},
  xAxis: {
    type: 'category' as const,
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
  },
  yAxis: {
    type: 'value' as const,
  },
  series: [
    {
      name: '销售额',
      type: 'bar' as const,
      data: [120, 200, 150, 80, 70, 110],
    },
    {
      name: '利润',
      type: 'bar' as const,
      data: [60, 100, 75, 40, 35, 55],
    },
  ],
})

// 测试图表3：散点图（已迁移样式函数）
const scatterChartOption = ref({
  title: {
    text: '响应式主题测试 - 散点图',
  },
  tooltip: {
    trigger: 'item' as const,
  },
  xAxis: {
    type: 'value' as const,
    name: 'X轴',
  },
  yAxis: {
    type: 'value' as const,
    name: 'Y轴',
  },
  series: [
    {
      name: '数据点',
      type: 'scatter' as const,
      data: [
        [10, 8],
        [8, 7],
        [13, 9],
        [7, 8],
        [5, 5],
        [12, 10],
        [9, 6],
        [11, 9],
      ],
    },
  ],
})

// 测试图表4：饼图（未迁移样式函数，用于对比）
const pieChartOption = ref({
  title: {
    text: '响应式主题测试 - 饼图（待迁移）',
  },
  tooltip: {
    trigger: 'item' as const,
  },
  legend: {},
  series: [
    {
      name: '市场份额',
      type: 'pie' as const,
      data: [
        { value: 1048, name: '产品A' },
        { value: 735, name: '产品B' },
        { value: 580, name: '产品C' },
      ],
    },
  ],
})
</script>

<template lang="pug">
.full.between-col.p-paddingl
  // 测试说明和控制区
  .c-card.p-padding.mb-gapl
    .fs-appFontSizex.color-primary100.mb-gap 响应式主题切换测试
    .fs-appFontSizes.color-text200.mb-gap
      | 此页面用于测试 useChartTheme 响应式 Hook 的核心功能。当主题切换时，图表应该自动更新颜色，无需刷新页面。
    .between.gap-gap.mb-gap
      Button(@click='toggleThemeWithAnimation($event)', severity='primary')
        Icons(:name='isDark ? "ri-sun-line" : "ri-moon-clear-line"', size='m')
        | {{ isDark ? '切换到浅色主题' : '切换到深色主题' }}
      .fs-appFontSizes.color-text200
        | 当前主题: {{ isDark ? '深色' : '浅色' }}
    .fs-appFontSizes.color-text200
      | 测试步骤：
      ol(style='margin-left: 20px; margin-top: 8px')
        li 点击上方按钮切换主题
        li 观察图表颜色是否自动更新（无需刷新页面）
        li 验证坐标轴、线条、提示框等是否都应用了新主题色
        li 对比已迁移和未迁移样式函数的图表差异

  // 测试图表区域
  .grid.grid-cols-1.gap-gap(class='lg:grid-cols-2')
    // 已迁移样式函数的图表（应该完全响应式）
    .c-card.p-padding
      .fs-appFontSizes.color-success100.mb-gap ✓ 已迁移样式函数 - 折线图
      UseEcharts(:option='lineChartOption', height='300px')

    .c-card.p-padding
      .fs-appFontSizes.color-success100.mb-gap ✓ 已迁移样式函数 - 柱状图
      UseEcharts(:option='barChartOption', height='300px')

    .c-card.p-padding
      .fs-appFontSizes.color-success100.mb-gap ✓ 已迁移样式函数 - 散点图
      UseEcharts(:option='scatterChartOption', height='300px')

    // 未迁移样式函数的图表（用于对比）
    .c-card.p-padding
      .fs-appFontSizes.color-warn100.mb-gap ⚠ 待迁移样式函数 - 饼图
      UseEcharts(:option='pieChartOption', height='300px')
</template>
