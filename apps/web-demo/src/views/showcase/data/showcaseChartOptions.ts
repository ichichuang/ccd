import type { EChartsOption } from 'echarts'

export type ShowcaseChartDemoKind =
  | 'dashboard-preview'
  | 'events'
  | 'overview'
  | 'responsive'
  | 'states'
  | 'theme'

const chartGrid = {
  left: '4%',
  right: '4%',
  top: '14%',
  bottom: '10%',
  containLabel: true,
} as const

const commonXAxis = {
  type: 'category',
  boundaryGap: false,
} as const

const commonYAxis = {
  type: 'value',
} as const

export function createShowcaseChartOption(kind: ShowcaseChartDemoKind): EChartsOption {
  if (kind === 'dashboard-preview') {
    return {
      legend: { top: '2%' },
      tooltip: { trigger: 'axis' },
      radar: {
        indicator: [
          { name: 'Theme', max: 100 },
          { name: 'Resize', max: 100 },
          { name: 'State', max: 100 },
          { name: 'Events', max: 100 },
          { name: 'Source', max: 100 },
        ],
      },
      series: [
        {
          name: 'Dashboard readiness',
          type: 'radar',
          data: [{ value: [92, 88, 84, 78, 90], name: 'Preview' }],
        },
      ],
    }
  }

  if (kind === 'states') {
    return {
      grid: chartGrid,
      legend: { top: '2%' },
      tooltip: { trigger: 'axis' },
      xAxis: { ...commonXAxis, data: ['Ready', 'Loading', 'Empty', 'Error', 'Recovered'] },
      yAxis: commonYAxis,
      series: [
        { name: 'Seen', type: 'bar', data: [42, 31, 14, 7, 33] },
        { name: 'Resolved', type: 'line', smooth: true, data: [39, 29, 14, 5, 32] },
      ],
    }
  }

  if (kind === 'events') {
    return {
      grid: chartGrid,
      legend: { top: '2%' },
      tooltip: { trigger: 'axis' },
      xAxis: { ...commonXAxis, data: ['Open', 'Hover', 'Select', 'Filter', 'Export'] },
      yAxis: commonYAxis,
      series: [
        { name: 'Events', type: 'line', smooth: true, areaStyle: {}, data: [18, 34, 29, 21, 16] },
      ],
    }
  }

  if (kind === 'responsive') {
    return {
      grid: chartGrid,
      legend: { top: '2%' },
      tooltip: { trigger: 'axis' },
      xAxis: { ...commonXAxis, data: ['Phone', 'Tablet', 'Laptop', 'Desktop', 'Wide'] },
      yAxis: commonYAxis,
      series: [
        { name: 'Readable', type: 'line', smooth: true, data: [72, 80, 88, 92, 96] },
        { name: 'Density', type: 'bar', data: [52, 66, 78, 86, 90] },
      ],
    }
  }

  if (kind === 'theme') {
    return {
      grid: chartGrid,
      legend: { top: '2%' },
      tooltip: { trigger: 'axis' },
      xAxis: { ...commonXAxis, data: ['Tokens', 'Axis', 'Tooltip', 'Legend', 'Canvas'] },
      yAxis: commonYAxis,
      series: [
        { name: 'Light', type: 'line', smooth: true, data: [84, 78, 88, 82, 90] },
        { name: 'Dark', type: 'line', smooth: true, data: [86, 80, 89, 84, 91] },
      ],
    }
  }

  return {
    grid: chartGrid,
    legend: { top: '2%' },
    tooltip: { trigger: 'axis' },
    xAxis: { ...commonXAxis, data: ['Plan', 'Build', 'Review', 'Ship', 'Learn'] },
    yAxis: commonYAxis,
    series: [
      { name: 'Adoption', type: 'bar', data: [36, 48, 57, 69, 78] },
      { name: 'Confidence', type: 'line', smooth: true, data: [44, 53, 63, 71, 82] },
    ],
  }
}
