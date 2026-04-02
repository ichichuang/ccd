/**
 * ECharts 静态注册模块
 *
 * 由 UseEcharts.vue 通过 import('./echarts-setup') 异步加载，
 * 保持 ECharts 不进入入口 chunk。所有 import 均为静态具名导入，
 * Rollup 可 tree-shake 未使用的图表/组件类型。
 *
 * 新增图表类型：在下方添加对应的 import 并加入 use() 调用即可。
 */
import { use } from 'echarts/core'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'

// ── 图表类型（仅项目实际使用的 9 种）──
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  EffectScatterChart,
  RadarChart,
  GaugeChart,
  HeatmapChart,
  FunnelChart,
} from 'echarts/charts'

// ── 组件（默认 + 条件使用）──
import {
  GridComponent,
  SingleAxisComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  GraphicComponent,
  TransformComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
  BrushComponent,
  GeoComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  PolarComponent,
  RadarComponent,
  ParallelComponent,
} from 'echarts/components'

use([
  CanvasRenderer,
  SVGRenderer,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  EffectScatterChart,
  RadarChart,
  GaugeChart,
  HeatmapChart,
  FunnelChart,
  GridComponent,
  SingleAxisComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  GraphicComponent,
  TransformComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
  BrushComponent,
  GeoComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  PolarComponent,
  RadarComponent,
  ParallelComponent,
])
