import type { ThemeConfig } from './types'

// 将十六进制颜色转换为带透明度的 rgba 字符串；如果解析失败则返回原色
const withAlpha = (color: string, alpha: number): string => {
  if (!color || typeof color !== 'string') {
    return color
  }
  const hex = color.replace('#', '')
  if (hex.length === 6 || hex.length === 3) {
    const fullHex =
      hex.length === 3
        ? hex
            .split('')
            .map(ch => ch + ch)
            .join('')
        : hex
    const r = parseInt(fullHex.substring(0, 2), 16)
    const g = parseInt(fullHex.substring(2, 4), 16)
    const b = parseInt(fullHex.substring(4, 6), 16)
    if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
  return color
}

/**
 * 应用雷达图样式：线条、区域、点、标签与主题融合
 * 采用函数式编程，返回新的 series 对象
 */
export const applyRadarStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'radar') {
    return series
  }

  // 如果数据不是数组，直接返回
  if (!Array.isArray(series.data)) {
    return series
  }

  // 处理数据项，为每个数据项应用主题颜色及透明度
  const processedData = series.data.map((item: any, dataIndex: number) => {
    const radarColor = themeConfig.color.colors[dataIndex % themeConfig.color.colors.length]
    const fillColor = withAlpha(radarColor, 0.14) // 适度透明的填充，保证深色主题也能融合

    const newItem = { ...item }

    // 线条
    newItem.lineStyle = {
      ...(newItem.lineStyle || {}),
      color: newItem.lineStyle?.color || radarColor,
      width: newItem.lineStyle?.width ?? 2,
    }

    // 区域
    newItem.areaStyle = {
      ...(newItem.areaStyle || {}),
      color: newItem.areaStyle?.color || fillColor,
    }

    // 数据点
    newItem.itemStyle = {
      ...(newItem.itemStyle || {}),
      color: newItem.itemStyle?.color || radarColor,
      borderColor: newItem.itemStyle?.borderColor || radarColor,
    }

    // 标签（若有显示），融合主题文字色
    if (newItem.label) {
      newItem.label = {
        ...newItem.label,
        color: newItem.label.color || themeConfig.font.textColor,
      }
    }

    // 高亮态保持一致的主题色
    newItem.emphasis = {
      ...(newItem.emphasis || {}),
      lineStyle: {
        ...(newItem.emphasis?.lineStyle || {}),
        color: (newItem.emphasis?.lineStyle || {}).color || radarColor,
        width: (newItem.emphasis?.lineStyle || {}).width ?? 2.5,
      },
      itemStyle: {
        ...(newItem.emphasis?.itemStyle || {}),
        color: (newItem.emphasis?.itemStyle || {}).color || radarColor,
        borderColor: (newItem.emphasis?.itemStyle || {}).borderColor || radarColor,
      },
      areaStyle: {
        ...(newItem.emphasis?.areaStyle || {}),
        color: (newItem.emphasis?.areaStyle || {}).color || fillColor,
      },
    }

    return newItem
  })

  // 返回新的 series 对象
  return {
    ...series,
    data: processedData,
    // 若 series 上内联了 radar 坐标配置，也一起融合主题
    ...(series.radar
      ? {
          radar: {
            ...series.radar,
            axisName: {
              ...(series.radar.axisName || {}),
              color: series.radar.axisName?.color || themeConfig.font.textColor,
              fontSize:
                series.radar.axisName?.fontSize ??
                themeConfig.font.fontSizeSmall ??
                themeConfig.font.fontSize,
            },
            axisLine: {
              ...(series.radar.axisLine || {}),
              lineStyle: {
                ...(series.radar.axisLine?.lineStyle || {}),
                color:
                  series.radar.axisLine?.lineStyle?.color ||
                  withAlpha(themeConfig.textColor200 || themeConfig.bgColor200, 0.35),
              },
            },
            splitLine: {
              ...(series.radar.splitLine || {}),
              lineStyle: {
                ...(series.radar.splitLine?.lineStyle || {}),
                color:
                  series.radar.splitLine?.lineStyle?.color ||
                  withAlpha(themeConfig.textColor200 || themeConfig.bgColor200, 0.25),
              },
            },
            splitArea: {
              ...(series.radar.splitArea || {}),
              areaStyle: {
                ...(series.radar.splitArea?.areaStyle || {}),
                color: series.radar.splitArea?.areaStyle?.color || [
                  withAlpha(themeConfig.bgColor300 || themeConfig.bgColor200, 0.06),
                  withAlpha(themeConfig.bgColor200 || themeConfig.bgColor300, 0.03),
                ],
              },
            },
          },
        }
      : {}),
  }
}
