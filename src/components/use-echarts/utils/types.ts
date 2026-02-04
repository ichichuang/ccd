import type { EChartsOption } from 'echarts'
import type { ChartThemeConfig } from '@/hooks/components/useChartTheme/types'

export type {
  ChartAdvancedConfig,
  ChartOpacityConfig,
  ChartThemeConfig,
  DefaultOpacityValues,
} from '@/hooks/components/useChartTheme/types'

// 图表联动配置类型
export interface ChartConnectConfig {
  /** 是否启用联动 */
  enabled?: boolean
  /** 联动组 ID */
  groupId?: string
  /** 联动事件类型 */
  events?: readonly ('highlight' | 'downplay' | 'select' | 'unselect' | 'dataZoom' | 'brush')[]
  /** 联动延迟时间 (ms) */
  delay?: number
  /** 是否启用数据缩放联动 */
  dataZoomSync?: boolean
  /** 是否启用画刷联动 */
  brushSync?: boolean
  /** 是否启用图例联动 */
  legendSync?: boolean
}

// 图表联动状态类型
export interface ChartConnectState {
  /** 当前高亮的数据索引 */
  highlightedDataIndex?: number
  /** 当前选中的数据索引 */
  selectedDataIndex?: number
  /** 数据缩放状态 */
  dataZoomState?: {
    start: number
    end: number
  }
  /** 画刷状态 */
  brushState?: any
}

// 渲染器类型
export type ChartRenderer = 'canvas' | 'svg'

// 动画配置类型
export interface ChartAnimationConfig {
  /** 是否开启动画 */
  animation?: boolean
  /** 动画时长 */
  duration?: number
  /** 动画缓动效果 */
  easing?:
    | 'linear'
    | 'easeIn'
    | 'easeOut'
    | 'easeInOut'
    | 'cubicIn'
    | 'cubicOut'
    | 'cubicInOut'
    | 'quadraticIn'
    | 'quadraticOut'
    | 'quadraticInOut'
  /** 动画延迟 */
  delay?: number
  /** 动画更新 */
  animationUpdate?: boolean
  /** 动画更新时长 */
  animationDurationUpdate?: number
  /** 动画更新缓动 */
  animationEasingUpdate?: string
}

// 事件映射配置类型
export interface ChartOnEvents {
  [eventName: string]: (params: any) => void
}

// 工具箱配置类型
export interface ChartToolboxConfig {
  /** 是否显示工具箱 */
  show?: boolean
  /** 工具箱位置 */
  left?: string | number
  /** 工具箱位置 */
  right?: string | number
  /** 工具箱位置 */
  top?: string | number
  /** 工具箱位置 */
  bottom?: string | number
  /** 工具箱宽度 */
  width?: string | number
  /** 工具箱高度 */
  height?: string | number
  /** 工具项配置 */
  feature?: {
    /** 保存图片 */
    saveAsImage?: any
    /** 还原 */
    restore?: any
    /** 数据视图 */
    dataView?: any
    /** 数据区域缩放 */
    dataZoom?: any
    /** 重置 */
    reset?: any
    /** 切换为折线图 */
    line?: any
    /** 切换为柱状图 */
    bar?: any
    /** 切换为堆叠 */
    stack?: any
    /** 切换为平铺 */
    tiled?: any
  }
  /** 工具箱图标样式 */
  iconStyle?: any
  /** 工具箱强调样式 */
  emphasis?: any
  /** 工具箱文本样式 */
  textStyle?: any
}

// 标记点配置类型
export interface ChartMarkPointConfig {
  /** 是否显示标记点 */
  show?: boolean
  /** 标记点数据 */
  data?: Array<{
    name?: string
    coord?: number[]
    value?: any
    symbol?: string
    symbolSize?: number | number[]
    itemStyle?: any
    label?: any
    emphasis?: any
  }>
  /** 标记点样式 */
  itemStyle?: any
  /** 标记点标签 */
  label?: any
  /** 标记点强调样式 */
  emphasis?: any
}

// 标记线配置类型
export interface ChartMarkLineConfig {
  /** 是否显示标记线 */
  show?: boolean
  /** 标记线数据 */
  data?: Array<{
    name?: string
    coord?: number[]
    value?: any
    symbol?: string
    symbolSize?: number | number[]
    lineStyle?: any
    label?: any
    emphasis?: any
  }>
  /** 标记线样式 */
  lineStyle?: any
  /** 标记线标签 */
  label?: any
  /** 标记线强调样式 */
  emphasis?: any
}

// 可视化映射配置类型
export interface ChartVisualMapConfig {
  /** 是否显示可视化映射 */
  show?: boolean
  /** 映射类型 */
  type?: 'continuous' | 'piecewise'
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 映射维度 */
  dimension?: number
  /** 映射范围 */
  inRange?: any
  /** 映射范围外 */
  outOfRange?: any
  /** 位置 */
  left?: string | number
  /** 位置 */
  right?: string | number
  /** 位置 */
  top?: string | number
  /** 位置 */
  bottom?: string | number
  /** 方向 */
  orient?: 'horizontal' | 'vertical'
  /** 文本样式 */
  textStyle?: any
}

// 画刷配置类型
export interface ChartBrushConfig {
  /** 是否显示画刷 */
  show?: boolean
  /** 画刷类型 */
  brushType?: 'rect' | 'polygon' | 'lineX' | 'lineY' | 'keep' | 'clear'
  /** 画刷样式 */
  brushStyle?: any
  /** 画刷选择区域 */
  areas?: any[]
  /** 画刷位置 */
  left?: string | number
  /** 画刷位置 */
  right?: string | number
  /** 画刷位置 */
  top?: string | number
  /** 画刷位置 */
  bottom?: string | number
  /** 画刷宽度 */
  width?: string | number
  /** 画刷高度 */
  height?: string | number
}

// 坐标轴指示器配置类型
export interface ChartAxisPointerConfig {
  /** 是否显示指示器 */
  show?: boolean
  /** 指示器类型 */
  type?: 'line' | 'shadow' | 'none'
  /** 指示器样式 */
  lineStyle?: any
  /** 指示器阴影样式 */
  shadowStyle?: any
  /** 指示器标签 */
  label?: any
  /** 指示器触发方式 */
  triggerTooltip?: boolean
  /** 指示器触发数据 */
  triggerOn?: 'mousemove' | 'click' | 'mousemove|click' | 'none'
  /** 指示器轴 */
  axis?: 'auto' | 'x' | 'y' | 'angle' | 'radius'
  /** 指示器动画 */
  animation?: boolean
  /** 指示器动画时长 */
  animationDuration?: number
  /** 指示器动画缓动 */
  animationEasing?: string
}

/**
 * UseEcharts 组件 Props 接口
 *
 * 定义 ECharts 图表组件的所有属性
 * 继承 ChartEventHandlers，支持所有 ECharts 事件
 *
 * @example
 * ```vue
 * <template>
 *   <UseEcharts
 *     :option="chartOption"
 *     :width="800"
 *     :height="600"
 *     theme="dark"
 *     :auto-resize="true"
 *     @click="handleChartClick"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import type { EChartsOption } from 'echarts'
 *
 * const chartOption = ref<EChartsOption>({
 *   xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
 *   yAxis: { type: 'value' },
 *   series: [{ data: [120, 200, 150], type: 'line' }]
 * })
 * </script>
 * ```
 */
export interface UseEchartsProps extends ChartEventHandlers {
  /**
   * ECharts 配置选项
   *
   * ECharts 的完整配置对象，包含图表的所有配置项
   *
   * @default undefined
   * @example
   * ```typescript
   * const option: EChartsOption = {
   *   title: { text: '图表标题' },
   *   xAxis: { type: 'category', data: ['A', 'B', 'C'] },
   *   yAxis: { type: 'value' },
   *   series: [{ data: [1, 2, 3], type: 'bar' }]
   * }
   * ```
   */
  option?: EChartsOption

  /**
   * 图表宽度
   *
   * 支持字符串（如 '800px', '100%'）或数字（像素值）
   *
   * @default undefined（自适应容器）
   * @example
   * - :width="800" - 800px
   * - width="100%" - 100% 宽度
   */
  width?: string | number

  /**
   * 图表高度
   *
   * 支持字符串（如 '600px', '80vh'）或数字（像素值）
   *
   * @default undefined（自适应容器）
   * @example
   * - :height="600" - 600px
   * - height="80vh" - 80% 视口高度
   */
  height?: string | number

  /**
   * 图表主题
   *
   * 使用 ECharts 的主题配置，可以是内置主题或自定义主题名称
   *
   * @default undefined（使用默认主题）
   * @example
   * - theme="dark" - 暗色主题
   * - theme="light" - 亮色主题
   * - theme="custom-theme" - 自定义主题
   */
  theme?: string

  /**
   * 渲染方式
   *
   * 选择使用 Canvas 还是 SVG 进行渲染
   *
   * @default 'canvas'
   * @example
   * - renderer="canvas" - Canvas 渲染（性能更好）
   * - renderer="svg" - SVG 渲染（支持更多交互）
   */
  renderer?: ChartRenderer

  /**
   * 是否自动调整大小
   *
   * 启用后，图表会监听容器尺寸变化并自动调整大小
   *
   * @default true
   * @example
   * - :auto-resize="true" - 自动调整大小（推荐）
   */
  autoResize?: boolean

  /**
   * 自定义样式
   *
   * 应用于图表容器的样式对象
   *
   * @default undefined
   * @example
   * - :style="{ padding: '16px', borderRadius: '8px' }"
   */
  style?: Record<string, any>

  /**
   * 背景颜色
   *
   * 图表的背景颜色，支持所有 CSS 颜色值
   *
   * @default undefined（使用主题背景色）
   * @example
   * - backgroundColor="#ffffff" - 白色背景
   * - backgroundColor="transparent" - 透明背景
   */
  backgroundColor?: string

  /**
   * 是否懒加载
   *
   * 启用后，图表会在容器进入视口时才初始化
   *
   * @default false
   * @example
   * - :lazy-load="true" - 启用懒加载
   */
  lazyLoad?: boolean

  /**
   * 是否显示加载状态
   *
   * 显示图表加载中的遮罩和动画
   *
   * @default false
   * @example
   * - :loading="isLoading" - 根据加载状态显示
   */
  loading?: boolean

  /**
   * 加载配置选项
   *
   * 自定义加载遮罩的样式和文本
   *
   * @default undefined
   */
  loadingOptions?: any

  /**
   * 是否手动更新
   *
   * 启用后，需要手动调用更新方法才会更新图表
   *
   * @default false
   * @example
   * - :manual-update="true" - 手动更新模式
   */
  manualUpdate?: boolean

  /**
   * 图表主题配置
   *
   * 包含透明度等主题相关的配置
   *
   * @default undefined
   */
  themeConfig?: ChartThemeConfig

  /**
   * 图表联动配置
   *
   * 配置多个图表之间的联动行为
   *
   * @default undefined
   */
  connectConfig?: ChartConnectConfig

  /**
   * 动画配置
   *
   * 控制图表的动画效果
   *
   * @default undefined
   */
  animationConfig?: ChartAnimationConfig

  /**
   * 事件映射配置
   *
   * 自定义 ECharts 事件的监听和处理
   *
   * @default undefined
   */
  onEvents?: ChartOnEvents

  /**
   * 工具箱配置
   *
   * 配置图表工具栏（保存图片、数据视图等）
   *
   * @default undefined
   */
  toolboxConfig?: ChartToolboxConfig

  /**
   * 标记点配置
   *
   * 配置图表中的标记点
   *
   * @default undefined
   */
  markPointConfig?: ChartMarkPointConfig

  /**
   * 标记线配置
   *
   * 配置图表中的标记线
   *
   * @default undefined
   */
  markLineConfig?: ChartMarkLineConfig

  /**
   * 可视化映射配置
   *
   * 配置数据的可视化映射（颜色映射等）
   *
   * @default undefined
   */
  visualMapConfig?: ChartVisualMapConfig

  /**
   * 画刷配置
   *
   * 配置图表的画刷功能
   *
   * @default undefined
   */
  brushConfig?: ChartBrushConfig

  /**
   * 坐标轴指示器配置
   *
   * 配置坐标轴的指示器样式和行为
   *
   * @default undefined
   */
  axisPointerConfig?: ChartAxisPointerConfig

  /**
   * 是否开启图例悬停联动
   *
   * 鼠标悬停图例时，是否高亮对应的数据系列
   *
   * @default true
   * @example
   * - :legend-hover-link="true" - 启用图例悬停联动
   */
  legendHoverLink?: boolean
}

// 图表实例方法类型
export interface ChartInstance {
  /** 获取 ECharts 实例 */
  getChartInstance: () => any
  /** 设置图表配置 */
  setOption: (option: EChartsOption, notMerge?: boolean) => void
  /** 调整图表大小 */
  resize: () => void
  /** 清空图表 */
  clear: () => void
  /** 销毁图表 */
  dispose: () => void
  /** 获取联动状态 */
  getConnectState: () => ChartConnectState
  /** 设置联动状态 */
  setConnectState: (state: Partial<ChartConnectState>) => void
  /** 触发联动事件 */
  triggerConnect: (eventType: string, params: any) => void
}

// ECharts 事件参数类型
export interface ChartEventParams {
  // 通用事件参数
  type: string
  event: Event
  target?: any
  topTarget?: any

  // 数据相关参数
  componentType?: string
  componentSubType?: string
  componentIndex?: number
  seriesIndex?: number
  seriesName?: string
  seriesType?: string
  dataIndex?: number
  dataType?: string
  data?: any
  value?: any
  name?: string
  color?: string

  // 坐标相关参数
  offsetX?: number
  offsetY?: number

  // 批量操作参数
  batch?: Array<{
    seriesIndex: number
    dataIndex: number[]
  }>
}

// 鼠标事件类型
export interface ChartMouseEventParams extends ChartEventParams {
  event: MouseEvent
}

// 图例事件参数类型
export interface ChartLegendEventParams extends ChartEventParams {
  selected?: Record<string, boolean>
}

// 数据区域缩放事件参数类型
export interface ChartDataZoomEventParams extends ChartEventParams {
  start?: number
  end?: number
  startValue?: number
  endValue?: number
}

// 画刷事件参数类型
export interface ChartBrushEventParams extends ChartEventParams {
  areas?: Array<{
    brushType: string
    coordRange: number[][]
    range: number[][]
  }>
  selected?: Array<{
    seriesIndex: number
    dataIndex: number[]
  }>
}

// 时间轴事件参数类型
export interface ChartTimelineEventParams extends ChartEventParams {
  currentIndex?: number
}

// 地图事件参数类型
export interface ChartMapEventParams extends ChartEventParams {
  region?: {
    name: string
    type: string
  }
}

// 图表事件处理函数类型
export interface ChartEventHandlers {
  // 鼠标事件
  onClick?: (params: ChartMouseEventParams) => void
  onDblClick?: (params: ChartMouseEventParams) => void
  onMouseDown?: (params: ChartMouseEventParams) => void
  onMouseMove?: (params: ChartMouseEventParams) => void
  onMouseUp?: (params: ChartMouseEventParams) => void
  onMouseOver?: (params: ChartMouseEventParams) => void
  onMouseOut?: (params: ChartMouseEventParams) => void
  onGlobalOut?: (params: ChartEventParams) => void
  onContextMenu?: (params: ChartMouseEventParams) => void

  // 图例事件
  onLegendSelectChanged?: (params: ChartLegendEventParams) => void
  onLegendSelected?: (params: ChartLegendEventParams) => void
  onLegendUnSelected?: (params: ChartLegendEventParams) => void
  onLegendSelectAll?: (params: ChartLegendEventParams) => void
  onLegendInverseSelect?: (params: ChartLegendEventParams) => void
  onLegendScroll?: (params: ChartEventParams) => void

  // 数据区域缩放事件
  onDataZoom?: (params: ChartDataZoomEventParams) => void
  onDataRangeSelected?: (params: ChartEventParams) => void

  // 时间轴事件
  onTimelineChanged?: (params: ChartTimelineEventParams) => void
  onTimelinePlayChanged?: (params: ChartTimelineEventParams) => void

  // 画刷事件
  onBrush?: (params: ChartBrushEventParams) => void
  onBrushEnd?: (params: ChartBrushEventParams) => void
  onBrushSelected?: (params: ChartBrushEventParams) => void

  // 地图事件
  onGeoSelectChanged?: (params: ChartMapEventParams) => void
  onGeoSelected?: (params: ChartMapEventParams) => void
  onGeoUnSelected?: (params: ChartMapEventParams) => void
  onGeoRoam?: (params: ChartEventParams) => void

  // 图形元素事件
  onSelectChanged?: (params: ChartEventParams) => void
  onHighlight?: (params: ChartEventParams) => void
  onDownplay?: (params: ChartEventParams) => void

  // 动画事件
  onFinished?: () => void
  onRendered?: () => void

  // 图表生命周期事件
  onRestore?: (params: ChartEventParams) => void
  onMagicTypeChanged?: (params: ChartEventParams) => void
  onDataViewChanged?: (params: ChartEventParams) => void

  // 坐标轴事件
  onAxisAreaSelected?: (params: ChartEventParams) => void

  // 焦点/失焦事件
  onFocusNodeAdjacency?: (params: ChartEventParams) => void
  onUnfocusNodeAdjacency?: (params: ChartEventParams) => void

  // 特殊图表事件
  onTreeExpand?: (params: ChartEventParams) => void
  onTreeCollapse?: (params: ChartEventParams) => void
  onTreemapZoom?: (params: ChartEventParams) => void
  onParallelAxisSelected?: (params: ChartEventParams) => void

  // 图表加载事件
  onLoad?: (params: ChartEventParams) => void
}
