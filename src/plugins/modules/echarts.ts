import ECharts from 'vue-echarts'

// ECharts 核心模块
import { use } from 'echarts/core'

// 引入渲染器
import { CanvasRenderer } from 'echarts/renderers'

// 引入所有常用图表类型
import {
  BarChart,
  BoxplotChart,
  CandlestickChart,
  EffectScatterChart,
  FunnelChart,
  GaugeChart,
  GraphChart,
  HeatmapChart,
  LineChart,
  LinesChart,
  ParallelChart,
  PictorialBarChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  SunburstChart,
  ThemeRiverChart,
  TreeChart,
  TreemapChart,
} from 'echarts/charts'

// 引入所有常用组件
import {
  AriaComponent,
  BrushComponent,
  CalendarComponent,
  DatasetComponent,
  DataZoomComponent,
  GeoComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  ParallelComponent,
  PolarComponent,
  RadarComponent,
  SingleAxisComponent,
  TimelineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent,
  VisualMapComponent,
} from 'echarts/components'

// 注册所有组件
use([
  // 渲染器
  CanvasRenderer,
  // 图表类型
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  FunnelChart,
  GaugeChart,
  CandlestickChart,
  HeatmapChart,
  GraphChart,
  TreeChart,
  SunburstChart,
  BoxplotChart,
  ParallelChart,
  SankeyChart,
  ThemeRiverChart,
  EffectScatterChart,
  PictorialBarChart,
  TreemapChart,
  LinesChart,
  // 组件
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  GraphicComponent,
  CalendarComponent,
  PolarComponent,
  RadarComponent,
  GeoComponent,
  ParallelComponent,
  SingleAxisComponent,
  BrushComponent,
  TimelineComponent,
  AriaComponent,
])
export const setupEcharts = (app: App) => {
  app.component('VECharts', ECharts)
}
