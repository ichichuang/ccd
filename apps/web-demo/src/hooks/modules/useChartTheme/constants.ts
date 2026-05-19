import type { DefaultOpacityValues } from './types'

// 默认透明度配置（供图表主题与 UseEcharts 组件共用）
export const DEFAULT_OPACITY_VALUES: DefaultOpacityValues = {
  lineArea: 0.3, // 折线图区域填充透明度
  area: 0.3, // 面积图透明度
  bar: 1, // 柱状图透明度（实色）
  scatter: 0.6, // 散点图透明度
  effectScatter: 0.6, // 特效散点图透明度
  radar: 0.2, // 雷达图透明度
  funnel: 0.8, // 漏斗图透明度
  gauge: 1, // 仪表盘透明度（实色）
}
