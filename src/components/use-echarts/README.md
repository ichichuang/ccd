# UseEcharts 组件文档

## 概述

`UseEcharts` 是基于 `vue-echarts` 的二次封装组件，提供了完整的 ECharts 功能支持和智能配置管理。支持所有 ECharts 图表类型、主题系统、事件处理、图表联动等高级功能。

## 基础配置

### 核心属性

| 属性              | 类型                  | 默认值          | 说明             |
| ----------------- | --------------------- | --------------- | ---------------- |
| `option`          | `EChartsOption`       | -               | ECharts 配置对象 |
| `theme`           | `string`              | `'default'`     | 主题名称         |
| `width`           | `string \| number`    | `'100%'`        | 图表宽度         |
| `height`          | `string \| number`    | `'30vh'`        | 图表高度         |
| `renderer`        | `'canvas' \| 'svg'`   | `'canvas'`      | 渲染方式         |
| `autoResize`      | `boolean`             | `true`          | 自动调整大小     |
| `style`           | `Record<string, any>` | `{}`            | 自定义样式       |
| `backgroundColor` | `string`              | `'transparent'` | 背景颜色         |
| `lazyLoad`        | `boolean`             | `false`         | 懒加载           |
| `loading`         | `boolean`             | `false`         | 加载状态         |
| `loadingOptions`  | `any`                 | `{}`            | 加载配置         |
| `manualUpdate`    | `boolean`             | `false`         | 手动更新         |

## 高级功能配置

### 动画配置

| 属性              | 类型                                                 | 默认值 | 说明     |
| ----------------- | ---------------------------------------------------- | ------ | -------- |
| `animationConfig` | `ChartAnimationConfig \| () => ChartAnimationConfig` | -      | 动画配置 |

**ChartAnimationConfig 属性：**

- `animation: boolean` - 是否开启动画
- `duration: number` - 动画时长
- `easing: string` - 动画缓动效果
- `delay: number` - 动画延迟
- `animationUpdate: boolean` - 动画更新
- `animationDurationUpdate: number` - 动画更新时长
- `animationEasingUpdate: string` - 动画更新缓动

### 工具箱配置

| 属性            | 类型                                             | 默认值 | 说明       |
| --------------- | ------------------------------------------------ | ------ | ---------- |
| `toolboxConfig` | `ChartToolboxConfig \| () => ChartToolboxConfig` | -      | 工具箱配置 |

**ChartToolboxConfig 属性：**

- `show: boolean` - 是否显示工具箱
- `right: string` - 右边距
- `top: string` - 上边距
- `borderColor: string` - 边框颜色
- `borderWidth: number` - 边框宽度
- `feature: object` - 工具箱功能配置

### 标记点配置

| 属性              | 类型                                                 | 默认值 | 说明       |
| ----------------- | ---------------------------------------------------- | ------ | ---------- |
| `markPointConfig` | `ChartMarkPointConfig \| () => ChartMarkPointConfig` | -      | 标记点配置 |

**ChartMarkPointConfig 属性：**

- `show: boolean` - 是否显示标记点
- `data: array` - 标记点数据
- `symbol: string` - 标记点符号
- `symbolSize: number` - 标记点大小
- `itemStyle: object` - 标记点样式

### 标记线配置

| 属性             | 类型                                               | 默认值 | 说明       |
| ---------------- | -------------------------------------------------- | ------ | ---------- |
| `markLineConfig` | `ChartMarkLineConfig \| () => ChartMarkLineConfig` | -      | 标记线配置 |

**ChartMarkLineConfig 属性：**

- `show: boolean` - 是否显示标记线
- `data: array` - 标记线数据
- `lineStyle: object` - 标记线样式
- `label: object` - 标记线标签

### 可视化映射配置

| 属性              | 类型                                                 | 默认值 | 说明           |
| ----------------- | ---------------------------------------------------- | ------ | -------------- |
| `visualMapConfig` | `ChartVisualMapConfig \| () => ChartVisualMapConfig` | -      | 可视化映射配置 |

**ChartVisualMapConfig 属性：**

- `show: boolean` - 是否显示可视化映射
- `type: 'continuous' \| 'piecewise'` - 映射类型
- `min: number` - 最小值
- `max: number` - 最大值
- `inRange: object` - 映射范围
- `left: string` - 左边距
- `bottom: string` - 下边距
- `orient: 'horizontal' \| 'vertical'` - 方向

### 画刷配置

| 属性          | 类型                                         | 默认值 | 说明     |
| ------------- | -------------------------------------------- | ------ | -------- |
| `brushConfig` | `ChartBrushConfig \| () => ChartBrushConfig` | -      | 画刷配置 |

**ChartBrushConfig 属性：**

- `show: boolean` - 是否显示画刷
- `brushType: 'rect' \| 'polygon' \| 'lineX' \| 'lineY' \| 'keep' \| 'clear'` - 画刷类型
- `brushStyle: object` - 画刷样式
- `left: string` - 左边距
- `top: string` - 上边距
- `width: string` - 宽度
- `height: string` - 高度

### 坐标轴指示器配置

| 属性                | 类型                                                     | 默认值 | 说明             |
| ------------------- | -------------------------------------------------------- | ------ | ---------------- |
| `axisPointerConfig` | `ChartAxisPointerConfig \| () => ChartAxisPointerConfig` | -      | 坐标轴指示器配置 |

**ChartAxisPointerConfig 属性：**

- `show: boolean` - 是否显示指示器
- `type: 'line' \| 'shadow' \| 'none'` - 指示器类型
- `lineStyle: object` - 指示器线条样式
- `shadowStyle: object` - 指示器阴影样式
- `label: object` - 指示器标签
- `triggerTooltip: boolean` - 是否触发提示框
- `triggerOn: string` - 触发方式

### 图例悬停联动

| 属性              | 类型      | 默认值 | 说明         |
| ----------------- | --------- | ------ | ------------ |
| `legendHoverLink` | `boolean` | `true` | 图例悬停联动 |

## 事件处理

### 鼠标事件

| 事件            | 参数类型                | 说明     |
| --------------- | ----------------------- | -------- |
| `@click`        | `ChartMouseEventParams` | 点击事件 |
| `@dbl-click`    | `ChartMouseEventParams` | 双击事件 |
| `@mouse-down`   | `ChartMouseEventParams` | 鼠标按下 |
| `@mouse-move`   | `ChartMouseEventParams` | 鼠标移动 |
| `@mouse-up`     | `ChartMouseEventParams` | 鼠标抬起 |
| `@mouse-over`   | `ChartMouseEventParams` | 鼠标悬停 |
| `@mouse-out`    | `ChartMouseEventParams` | 鼠标离开 |
| `@global-out`   | `ChartEventParams`      | 全局离开 |
| `@context-menu` | `ChartMouseEventParams` | 右键菜单 |

### 图例事件

| 事件                     | 参数类型                 | 说明         |
| ------------------------ | ------------------------ | ------------ |
| `@legend-select-changed` | `ChartLegendEventParams` | 图例选择变化 |
| `@legend-selected`       | `ChartLegendEventParams` | 图例选中     |
| `@legend-un-selected`    | `ChartLegendEventParams` | 图例取消选中 |
| `@legend-select-all`     | `ChartLegendEventParams` | 图例全选     |
| `@legend-inverse-select` | `ChartLegendEventParams` | 图例反选     |
| `@legend-scroll`         | `ChartEventParams`       | 图例滚动     |

### 数据区域缩放事件

| 事件                   | 参数类型                   | 说明         |
| ---------------------- | -------------------------- | ------------ |
| `@data-zoom`           | `ChartDataZoomEventParams` | 数据缩放     |
| `@data-range-selected` | `ChartEventParams`         | 数据范围选择 |

### 时间轴事件

| 事件                     | 参数类型                   | 说明           |
| ------------------------ | -------------------------- | -------------- |
| `@timeline-changed`      | `ChartTimelineEventParams` | 时间轴变化     |
| `@timeline-play-changed` | `ChartTimelineEventParams` | 时间轴播放变化 |

### 画刷事件

| 事件              | 参数类型                | 说明     |
| ----------------- | ----------------------- | -------- |
| `@brush`          | `ChartBrushEventParams` | 画刷操作 |
| `@brush-end`      | `ChartBrushEventParams` | 画刷结束 |
| `@brush-selected` | `ChartBrushEventParams` | 画刷选择 |

### 地图事件

| 事件                  | 参数类型              | 说明         |
| --------------------- | --------------------- | ------------ |
| `@geo-select-changed` | `ChartMapEventParams` | 地图选择变化 |
| `@geo-selected`       | `ChartMapEventParams` | 地图选中     |
| `@geo-un-selected`    | `ChartMapEventParams` | 地图取消选中 |
| `@geo-roam`           | `ChartEventParams`    | 地图漫游     |

### 图形元素事件

| 事件              | 参数类型           | 说明     |
| ----------------- | ------------------ | -------- |
| `@select-changed` | `ChartEventParams` | 选择变化 |
| `@highlight`      | `ChartEventParams` | 高亮     |
| `@downplay`       | `ChartEventParams` | 取消高亮 |

### 动画事件

| 事件        | 参数类型 | 说明     |
| ----------- | -------- | -------- |
| `@finished` | `void`   | 动画完成 |
| `@rendered` | `void`   | 渲染完成 |

### 生命周期事件

| 事件                  | 参数类型           | 说明         |
| --------------------- | ------------------ | ------------ |
| `@load`               | `ChartEventParams` | 图表加载     |
| `@restore`            | `ChartEventParams` | 图表恢复     |
| `@magic-type-changed` | `ChartEventParams` | 图表类型变化 |
| `@data-view-changed`  | `ChartEventParams` | 数据视图变化 |

### 坐标轴事件

| 事件                  | 参数类型           | 说明           |
| --------------------- | ------------------ | -------------- |
| `@axis-area-selected` | `ChartEventParams` | 坐标轴区域选择 |

### 焦点事件

| 事件                      | 参数类型           | 说明             |
| ------------------------- | ------------------ | ---------------- |
| `@focus-node-adjacency`   | `ChartEventParams` | 焦点节点邻接     |
| `@unfocus-node-adjacency` | `ChartEventParams` | 取消焦点节点邻接 |

### 特殊图表事件

| 事件                      | 参数类型           | 说明           |
| ------------------------- | ------------------ | -------------- |
| `@tree-expand`            | `ChartEventParams` | 树图展开       |
| `@tree-collapse`          | `ChartEventParams` | 树图折叠       |
| `@treemap-zoom`           | `ChartEventParams` | 矩形树图缩放   |
| `@parallel-axis-selected` | `ChartEventParams` | 平行坐标轴选择 |

## 高级功能

### 事件映射

| 属性       | 类型            | 默认值 | 说明         |
| ---------- | --------------- | ------ | ------------ |
| `onEvents` | `ChartOnEvents` | `{}`   | 事件映射配置 |

### 主题配置

| 属性          | 类型               | 默认值 | 说明     |
| ------------- | ------------------ | ------ | -------- |
| `themeConfig` | `ChartThemeConfig` | -      | 主题配置 |

**ChartThemeConfig 属性：**

- `enableTheme: boolean` - 是否启用主题合并
- `opacity: ChartOpacityConfig` - 透明度配置

### 联动配置

| 属性            | 类型                 | 默认值 | 说明      |
| --------------- | -------------------- | ------ | --------- |
| `connectConfig` | `ChartConnectConfig` | -      | 联动配置  |
| `group`         | `string`             | -      | 联动组 ID |

**ChartConnectConfig 属性：**

- `enabled: boolean` - 是否启用联动
- `groupId: string` - 联动组 ID
- `events: array` - 联动事件类型
- `delay: number` - 联动延迟时间
- `dataZoomSync: boolean` - 数据缩放联动
- `brushSync: boolean` - 画刷联动
- `legendSync: boolean` - 图例联动

## 图表类型支持

### 基础图表

- 折线图 (line)
- 柱状图 (bar)
- 散点图 (scatter)
- 饼图 (pie)
- 雷达图 (radar)
- 漏斗图 (funnel)
- 仪表盘 (gauge)
- K线图 (candlestick)
- 热力图 (heatmap)
- 桑基图 (sankey)
- 箱线图 (boxplot)
- 旭日图 (sunburst)
- 主题河流图 (themeRiver)

### 地图图表

- 地图 (map)
- 地理坐标系 (geo)

### 关系图

- 关系图 (graph)
- 树图 (tree)
- 矩形树图 (treemap)

### 其他图表

- 平行坐标系 (parallel)
- 时间轴 (timeline)

## 系统集成

### 主题系统

- 支持系统主题变量
- 自动应用主题样式
- 透明度配置支持
- 响应式主题切换

### 尺寸系统

- 支持系统尺寸变量
- 自动响应式调整
- 多种尺寸预设
- 自定义尺寸配置

### 颜色系统

- 支持系统颜色变量
- 主题色彩自动应用
- 语义化颜色支持
- 动态颜色切换

## 性能优化

### 渲染优化

- Canvas/SVG 渲染选择
- 懒加载支持
- 自动调整大小
- 内存管理优化

### 事件优化

- 事件防抖/节流
- 事件委托
- 批量事件处理
- 事件清理机制

### 数据优化

- 大数据集优化
- 增量更新
- 数据缓存
- 虚拟滚动支持

## 最佳实践

### 配置建议

1. 使用系统变量确保主题一致性
2. 合理配置动画参数提升用户体验
3. 根据数据量选择合适的渲染方式
4. 启用联动功能增强交互体验

### 性能建议

1. 大数据集使用 Canvas 渲染
2. 启用懒加载减少初始加载时间
3. 合理使用事件防抖/节流
4. 及时清理不需要的图表实例

### 开发建议

1. 使用 TypeScript 获得更好的类型支持
2. 遵循组件命名规范
3. 合理使用事件处理
4. 注意内存泄漏问题
