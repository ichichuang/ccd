# ECharts 主题系统 (SSOT)

本文档说明项目的 ECharts 图表主题子系统。当需要**创建或修改图表**时，必须使用此系统，禁止手动设置图表颜色。

## 1. 架构概览

```
ThemeStore (theme.ts)
  └─ useChartTheme (Hook)
       ├─ buildThemeConfig()       → 从 ThemeStore 读取当前配色
       ├─ applyThemeToOption()     → 将主题应用到 ECharts option
       └─ 20+ apply*Styles 模块   → 各图表类型的样式注入
```

核心文件：`src/hooks/modules/useChartTheme/`

| 文件                      | 职责                                                               |
| ------------------------- | ------------------------------------------------------------------ |
| `index.ts`                | 主入口，导出 `useChartTheme` Hook 和 `applyThemeToOption` 函数     |
| `types.ts`                | `ThemeConfig`、`ChartOpacityConfig`、`ChartAdvancedConfig` 类型    |
| `constants.ts`            | 图表相关常量                                                       |
| `defaults.ts`             | 主题默认配置                                                       |
| `utils.ts`                | 辅助工具（`withAlpha` 等）                                         |
| `apply*.ts`               | 各图表类型的样式应用模块（Series、Axis、Tooltip、Radar、Gauge 等） |
| `mergeAdvancedConfigs.ts` | 高级配置合并逻辑                                                   |

## 2. 使用方式

### 2.1 响应式 Hook（推荐）

当主题切换时，图表配置自动重新计算：

```ts
import { useChartTheme } from '@/hooks/modules/useChartTheme'

const originalOption = ref({
  /* ECharts option */
})

// 返回 computed，主题变化时自动更新
const themedOption = useChartTheme(originalOption)

// 可选：透明度配置和高级配置
const themedOption = useChartTheme(originalOption, opacityConfig, advancedConfig)
```

### 2.2 函数式调用（非响应式场景）

```ts
import { applyThemeToOption } from '@/hooks/modules/useChartTheme'

const themedOption = applyThemeToOption(rawOption, opacityConfig?, advancedConfig?)
```

## 3. 支持的图表类型

系统内置了以下图表类型的主题适配：

| 模块                                     | 图表类型                    |
| ---------------------------------------- | --------------------------- |
| `applySeriesStyles`                      | Bar、Line、Scatter 基础系列 |
| `applyPieStyles`                         | Pie 饼图                    |
| `applyRadarStyles`                       | Radar 雷达图                |
| `applyGaugeStyles`                       | Gauge 仪表盘                |
| `applyFunnelStyles`                      | Funnel 漏斗图               |
| `applyGraphStyles`                       | Graph 关系图                |
| `applyTreeStyles` / `applyTreemapStyles` | Tree / Treemap              |
| `applySunburstStyles`                    | Sunburst 旭日图             |
| `applyHeatmapStyles`                     | Heatmap 热力图              |
| `applyBoxplotStyles`                     | Boxplot 箱线图              |
| `applyCandlestickStyles`                 | K 线图                      |
| `applyParallelStyles`                    | Parallel 平行坐标           |
| `applyThemeRiverStyles`                  | ThemeRiver 主题河流图       |
| `applySankeyStyles`                      | Sankey 桑基图               |
| `applyEffectScatterStyles`               | EffectScatter 涟漪散点      |
| `applyPictorialBarStyles`                | PictorialBar 象形柱图       |
| `applyLinesStyles`                       | Lines 线条图                |

通用模块：

| 模块                  | 职责         |
| --------------------- | ------------ |
| `applyAxisStyles`     | X/Y 轴样式   |
| `applyTooltipStyles`  | 提示框样式   |
| `applyFontStyles`     | 字体样式     |
| `applyDataZoomStyles` | 数据缩放组件 |

## 4. 规则

1. **禁止** 在 ECharts option 中硬编码颜色值 → 必须使用 `useChartTheme`
2. **禁止** 手动监听 ThemeStore 来更新图表 → 使用 `useChartTheme` 自动响应
3. **新增图表类型** 时，在 `useChartTheme/` 下创建对应的 `apply*Styles.ts` 模块
4. 所有颜色必须来自 ThemeStore 的调色板，通过 `buildThemeConfig()` 获取
