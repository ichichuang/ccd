import { useColorStore, useSizeStore } from '@/stores'
import { env } from '@/utils'
import { getDeviceLayoutSizeRatios, getDeviceType } from '@/utils/modules/remHelpers'

/**
 * 主题配置缓存
 */
const themeCache = new Map<string, any>()

/**
 * 生成缓存键
 */
const generateCacheKey = (
  colorStore: ReturnType<typeof useColorStore>,
  sizeStore: ReturnType<typeof useSizeStore>
) => {
  const themeValue = colorStore.getThemeValue ?? 'default'
  const size = sizeStore.getSize ?? 'comfortable'
  const padding = sizeStore.getPadding ?? 'md'
  const rounded = sizeStore.getRounded ?? 'smooth'
  const fontSize = sizeStore.getFontSize ?? 'md'

  return `${themeValue}-${size}-${padding}-${rounded}-${fontSize}`
}

/**
 * 原地修改版本 - 直接修改原对象
 * @param target 目标对象（参数1）
 * @param styles 样式对象（参数2）
 * @returns 修改后的原对象引用
 */
export function deepMergeStylesInPlace<T = any>(target: T, styles: Record<string, any>): T {
  function traverse(obj: any): void {
    if (obj === null || typeof obj !== 'object') {
      return
    }

    for (const [key, value] of Object.entries(obj)) {
      // 检查当前key是否在样式对象中存在
      if (Object.prototype.hasOwnProperty.call(styles, key)) {
        // 如果当前值是对象且样式值也是对象，进行深度合并
        if (
          typeof value === 'object' &&
          value !== null &&
          typeof styles[key] === 'object' &&
          styles[key] !== null
        ) {
          obj[key] = { ...value, ...styles[key] }
        } else {
          // 直接赋值
          obj[key] = styles[key]
        }
      }

      // 递归处理嵌套对象
      if (typeof value === 'object' && value !== null) {
        traverse(value)
      }
    }
  }

  traverse(target)
  return target
}

/**
 * 高级版本 - 支持路径匹配和条件过滤
 * @param target 目标对象
 * @param styles 样式对象，支持点号分隔的路径语法，如 {'popover.color': 'red', 'popover.icon.color': 'blue'}
 * @param options 配置选项
 */
export interface MergeOptions {
  /** 是否深度合并对象值 */
  deepMerge?: boolean
  /** 是否覆盖已存在的值 */
  override?: boolean
  /** 自定义匹配函数 */
  matcher?: (key: string, value: any, path: string[]) => boolean
  /** 自定义转换函数 */
  transformer?: (key: string, oldValue: any, newValue: any) => any
}

export function deepMergeStylesAdvanced<T = any>(
  target: T,
  styles: Record<string, any>,
  options: MergeOptions = {}
): T {
  const { deepMerge = true, override = true, matcher, transformer } = options

  const result = JSON.parse(JSON.stringify(target))

  // 处理点号分隔的路径样式
  const processedStyles: Record<string, any> = {}
  const pathStyles: Record<string, any> = {}

  for (const [key, value] of Object.entries(styles)) {
    if (key.includes('.')) {
      // 点号分隔的路径样式
      pathStyles[key] = value
    } else {
      // 普通样式
      processedStyles[key] = value
    }
  }

  function traverse(obj: any, path: string[] = []): void {
    if (obj === null || typeof obj !== 'object') {
      return
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key]
      const currentPathString = currentPath.join('.')

      // 检查是否匹配路径样式
      let matchedPathStyle = false
      let pathStyleValue: any = null

      for (const [pathKey, pathValue] of Object.entries(pathStyles)) {
        if (pathKey === currentPathString) {
          matchedPathStyle = true
          pathStyleValue = pathValue
          break
        }
      }

      // 动态处理任意 key 的路径样式
      if (typeof value === 'object' && value !== null) {
        for (const [pathKey, pathValue] of Object.entries(pathStyles)) {
          // 检查路径是否以当前 key 开头
          if (pathKey.startsWith(`${key}.`)) {
            const subPath = pathKey.substring(key.length + 1) // 移除 'key.' 前缀
            if (subPath) {
              // 处理多层路径，如 'content.padding'
              const pathParts = subPath.split('.')
              let currentObj = value as any
              let canSet = true

              // 遍历路径的每一部分，除了最后一部分
              for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i]
                if (Object.prototype.hasOwnProperty.call(currentObj, part)) {
                  currentObj = currentObj[part]
                  if (typeof currentObj !== 'object' || currentObj === null) {
                    canSet = false
                    break
                  }
                } else {
                  canSet = false
                  break
                }
              }

              // 如果路径存在，设置最后一个属性
              if (canSet && pathParts.length > 0) {
                const lastPart = pathParts[pathParts.length - 1]
                if (Object.prototype.hasOwnProperty.call(currentObj, lastPart)) {
                  // 检查是否应该覆盖
                  if (!override && currentObj[lastPart] !== undefined) {
                    continue
                  }
                  currentObj[lastPart] = pathValue
                }
              }
            }
          }
        }
      }

      // 自定义匹配逻辑
      const shouldMatch = matcher
        ? matcher(key, value, currentPath)
        : Object.prototype.hasOwnProperty.call(processedStyles, key) || matchedPathStyle

      if (shouldMatch) {
        const newValue = matchedPathStyle ? pathStyleValue : processedStyles[key]

        // 检查是否应该覆盖
        if (!override && obj[key] !== undefined) {
          continue
        }

        // 自定义转换
        if (transformer) {
          obj[key] = transformer(key, value, newValue)
        } else if (
          deepMerge &&
          typeof value === 'object' &&
          value !== null &&
          typeof newValue === 'object' &&
          newValue !== null
        ) {
          obj[key] = { ...value, ...newValue }
        } else {
          obj[key] = newValue
        }
      }

      // 递归处理嵌套对象
      if (typeof value === 'object' && value !== null) {
        traverse(value, currentPath)
      }
    }
  }

  traverse(result)
  return result
}

/**
 * 高级版本（原地修改） - 功能与 deepMergeStylesAdvanced 等效，但直接修改目标对象
 * 不返回任何内容
 */
export function deepMergeStylesAdvancedInPlace<T = any>(
  target: T,
  styles: Record<string, any>,
  options: MergeOptions = {}
): void {
  const { deepMerge = true, override = true, matcher, transformer } = options

  const processedStyles: Record<string, any> = {}
  const pathStyles: Record<string, any> = {}

  for (const [key, value] of Object.entries(styles)) {
    if (key.includes('.')) {
      pathStyles[key] = value
    } else {
      processedStyles[key] = value
    }
  }

  function setIfExistsByPath(root: any, baseKey: string, subPath: string, valueToSet: any): void {
    if (!root || typeof root !== 'object') {
      return
    }
    const base = root[baseKey]
    if (base === null || typeof base !== 'object') {
      return
    }
    if (!subPath) {
      return
    }

    const parts = subPath.split('.')
    let current: any = base
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!Object.prototype.hasOwnProperty.call(current, part)) {
        return
      }
      current = current[part]
      if (current === null || typeof current !== 'object') {
        return
      }
    }
    const last = parts[parts.length - 1]
    if (!Object.prototype.hasOwnProperty.call(current, last)) {
      return
    }
    if (!override && current[last] !== undefined) {
      return
    }
    current[last] = valueToSet
  }

  function traverse(obj: any, path: string[] = []): void {
    if (obj === null || typeof obj !== 'object') {
      return
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key]
      const currentPathString = currentPath.join('.')

      let matchedPathStyle = false
      let pathStyleValue: any = null

      for (const [pathKey, pathValue] of Object.entries(pathStyles)) {
        if (pathKey === currentPathString) {
          matchedPathStyle = true
          pathStyleValue = pathValue
          break
        }
      }

      if (typeof value === 'object' && value !== null) {
        for (const [pathKey, pathValue] of Object.entries(pathStyles)) {
          if (pathKey.startsWith(`${key}.`)) {
            const subPath = pathKey.substring(key.length + 1)
            if (subPath) {
              setIfExistsByPath(obj, key, subPath, pathValue)
            }
          }
        }
      }

      const shouldMatch = matcher
        ? matcher(key, value, currentPath)
        : Object.prototype.hasOwnProperty.call(processedStyles, key) || matchedPathStyle

      if (shouldMatch) {
        const newValue = matchedPathStyle ? pathStyleValue : processedStyles[key]
        if (!override && obj[key] !== undefined) {
          // skip
        } else if (transformer) {
          obj[key] = transformer(key, value, newValue)
        } else if (
          deepMerge &&
          typeof value === 'object' &&
          value !== null &&
          typeof newValue === 'object' &&
          newValue !== null
        ) {
          obj[key] = { ...value, ...newValue }
        } else {
          obj[key] = newValue
        }
      }

      // 递归使用更新后的引用，避免遗漏新合并的对象
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key], currentPath)
      }
    }
  }

  traverse(target)
}

/**
 * PrimeVue主题配置接口
 */
export interface PrimeVueThemeConfig {
  colorStore: ReturnType<typeof useColorStore>
  sizeStore: ReturnType<typeof useSizeStore>
}

const initToastColor = (preset: any, colorStore: ReturnType<typeof useColorStore>) => {
  deepMergeStylesAdvancedInPlace(preset.components.toast, {
    info: {
      background: colorStore.isDark ? colorStore.getInfoColorHover + 60 : colorStore.getBg100,
      borderColor: colorStore.getInfoColorActive,
      color: colorStore.getInfoColor,
      detailColor: colorStore.getText100,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getInfoColorText}, transparent 96%)`,
      closeButton: {
        hoverBackground: colorStore.getBg100,
        focusRing: {
          color: colorStore.getText100,
        },
      },
    },
    success: {
      background: colorStore.isDark ? colorStore.getSuccessColorHover + 60 : colorStore.getBg100,
      borderColor: colorStore.getSuccessColorActive,
      color: colorStore.getSuccessColor,
      detailColor: colorStore.getText100,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getSuccessColorText}, transparent 96%)`,
      closeButton: {
        hoverBackground: colorStore.getBg100,
        focusRing: {
          color: colorStore.getText100,
        },
      },
    },
    warn: {
      background: colorStore.isDark ? colorStore.getWarnColorHover + 60 : colorStore.getBg100,
      borderColor: colorStore.getWarnColorActive,
      color: colorStore.getWarnColor,
      detailColor: colorStore.getText100,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getWarnColorText}, transparent 96%)`,
      closeButton: {
        hoverBackground: colorStore.getBg100,
        focusRing: {
          color: colorStore.getText100,
        },
      },
    },
    error: {
      background: colorStore.isDark ? colorStore.getDangerColorHover + 60 : colorStore.getBg100,
      borderColor: colorStore.getDangerColorActive,
      color: colorStore.getDangerColor,
      detailColor: colorStore.getText100,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getDangerColorText}, transparent 96%)`,
      closeButton: {
        hoverBackground: colorStore.getBg100,
        focusRing: {
          color: colorStore.getText100,
        },
      },
    },
    secondary: {
      background: colorStore.getSecondaryColorHover + 90,
      borderColor: colorStore.getSecondaryColorActive,
      color: colorStore.getSecondaryColorText,
      detailColor: colorStore.getSecondaryColorText,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getSecondaryColorText}, transparent 96%)`,
      closeButton: {
        hoverBackground: colorStore.getSecondaryColorHover,
        focusRing: {
          color: colorStore.getSecondaryColorText,
        },
      },
    },
    contrast: {
      background: colorStore.getContrastColor,
      borderColor: colorStore.getContrastColorActive,
      color: colorStore.getContrastColorText,
      detailColor: colorStore.getContrastColorText,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getContrastColorText}, transparent 96%)`,
      closeButton: {
        hoverBackground: colorStore.getContrastColorHover,
        focusRing: {
          color: colorStore.getContrastColorText,
        },
      },
    },
  })
}
/**
 * 创建自定义主题预设
 * @param preset 原始预设
 * @param config 主题配置
 * @returns 自定义预设
 */
export const createCustomPreset = (preset: any, { colorStore, sizeStore }: PrimeVueThemeConfig) => {
  try {
    // 验证输入参数
    if (!colorStore || !sizeStore) {
      console.warn('createCustomPreset: colorStore 或 sizeStore 未提供')
      return preset
    }

    // 检查缓存
    const cacheKey = generateCacheKey(colorStore, sizeStore)
    if (themeCache.has(cacheKey)) {
      return themeCache.get(cacheKey)
    }

    // 自定义颜色配置
    const customColor = {
      shadow: `${colorStore.getAccent200}80, 0px 25px 50px -12px`,

      // 边框颜色
      borderColor: colorStore.getBg300, // 默认边框色
      hoverBorderColor: colorStore.getPrimary100, // 悬停时边框色
      focusBorderColor: colorStore.getPrimary100, // 聚焦时边框色
      invalidBorderColor: colorStore.getDangerColor, // 校验失败时边框色

      // 文字颜色
      color: colorStore.getText100, // 默认文字颜色
      contrastColor: colorStore.getBg100, // 对比色
      hoverColor: colorStore.getPrimary100, // 悬停文字颜色
      activeColor: colorStore.getPrimary100, // 激活文字颜色
      disabledColor: colorStore.getText200, // 禁用文字颜色
      placeholderColor: colorStore.getBg300, // 占位符默认色（按默认规则）
      invalidPlaceholderColor: colorStore.getDangerColor, // 校验失败时占位符颜色
      focusColor: colorStore.getPrimary100, // 聚焦状态文字颜色
      floatLabelColor: colorStore.getText100, // 浮动标签颜色（默认）
      floatLabelFocusColor: colorStore.getPrimary100, // 浮动标签聚焦颜色
      floatLabelActiveColor: colorStore.getAccent100, // 浮动标签激活颜色
      floatLabelInvalidColor: colorStore.getDangerColor, // 浮动标签错误状态颜色
      selectedColor: colorStore.getAccent100, // 选中文字颜色
      selectedFocusColor: colorStore.getPrimary100, // 选中聚焦文字颜色

      // 背景色
      background: colorStore.getBg100, // 默认背景
      hoverBackground: colorStore.getBg200, // 悬停背景
      disabledBackground: colorStore.getBg200, // 禁用背景
      filledBackground: colorStore.getBg100, // 填充默认背景
      filledHoverBackground: colorStore.getBg200, // 填充悬停背景
      filledFocusBackground: colorStore.getBg200, // 填充聚焦背景（与 hover 一致）
      focusBackground: colorStore.getBg100, // 聚焦时背景保持默认
      selectedBackground: colorStore.getBg200, // 选中背景
      selectedFocusBackground: colorStore.getBg200, // 选中聚焦背景

      // 图标颜色
      iconColor: colorStore.getText100, // 默认图标颜色
      icon: {
        color: colorStore.getText100, // 默认
        focusColor: colorStore.getPrimary100, // 悬停/聚焦
        activeColor: colorStore.getPrimary100, // 激活
      },
      submenuIcon: {
        color: colorStore.getText100, // 默认
        focusColor: colorStore.getPrimary100, // 悬停/聚焦
        activeColor: colorStore.getPrimary100, // 激活
      },

      focusRing: {
        color: colorStore.getPrimary100, // 聚焦边框颜色
        shadow: `${colorStore.getPrimary100}40`, // 聚焦边框阴影
      },
      selectedHoverBackground: colorStore.getBg200, // 选中悬停背景
      selectedHoverColor: colorStore.getPrimary100, // 选中悬停文字
    }

    // 自定义尺寸配置
    const customSize = {
      borderRadius: `${sizeStore.getRoundedValue}px`, // 圆角尺寸
      gap: `${sizeStore.getGap}px`, // 元素之间间距
      padding: `${sizeStore.getPaddingValue}px`, // 元素内边距（上下 左右）
      paddingX: `${sizeStore.getPaddingValue}px`, // 左右内边距
      paddingY: `${sizeStore.getPaddingsValue}px`, // 上下内边距
      margin: `${sizeStore.getGap}px`, // 外边距（上下 左右）
      marginX: `${sizeStore.getGap}px`, // 左右外边距
      marginY: `${sizeStore.getGaps}px`, // 上下外边距
      fontSize: `${sizeStore.getFontSizeValue}px`,
    }

    // 获取设备类型和布局尺寸比例（用于组件尺寸缩放）
    let deviceRatios = {
      sidebarWidth: 1,
      headerHeight: 1,
      footerHeight: 1,
      breadcrumbHeight: 1,
      tabsHeight: 1,
      gap: 1,
    }

    try {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        const deviceType = getDeviceType(width)
        deviceRatios = getDeviceLayoutSizeRatios(deviceType)
      }
    } catch (error) {
      console.error('Failed to get device layout ratios:', error)
    }

    // 计算缩放后的组件尺寸值
    const scaleGap = deviceRatios.gap
    const scalePadding = deviceRatios.gap // 使用 gap 比例作为 padding 的缩放比例
    const basePadding = sizeStore.getPaddingValue || 12
    const basePaddings = sizeStore.getPaddingsValue || 8
    const baseGaps = sizeStore.getGaps || 8

    // 路径样式，用于深度匹配（使用缩放后的值）
    const pathStyles: Record<string, any> = {
      // 弹出框
      ['popover.padding']: `${Math.round(basePadding * scalePadding)}px`,
      ['popover.content.padding']: `${Math.round(basePadding * scalePadding)}px`,
      ['popover.root.borderRadius']: `${Math.round(6 * scalePadding)}px`,
      ['popover.root.arrowOffset']: `${Math.round(12 * scalePadding)}px`,
      ['mask.background']: `${colorStore.getBg300}80`,
      // 抽屉
      ['drawer.root.borderColor']: `${colorStore.getBg300}`,
      ['drawer.title.fontSize']: `${sizeStore.getFontSizexValue}px`,
      ['drawer.header.padding']: `${Math.round(12 * scalePadding)}px`,
      ['drawer.content.padding']: `${Math.round(18 * scalePadding)}px`,
      ['drawer.footer.padding']: `${Math.round(12 * scalePadding)}px`,
    }

    const customPreset = {
      ...customColor,
      ...customSize,
      ...pathStyles,
    }

    // 先合并普通样式，再合并路径样式
    let newPreset = deepMergeStylesAdvanced(preset, customPreset, {
      deepMerge: true,
      override: true,
    })
    newPreset = deepMergeStylesAdvanced(newPreset, pathStyles, {
      deepMerge: true,
      override: true,
    })

    // 组件尺寸配置（基于全局变量和缩放比例）
    // 大尺寸组件样式（使用 basePadding 和 baseGap 的较大比例）
    const customComponentsStyle1 = {
      padding: `${Math.round(basePaddings * scalePadding)}px ${Math.round(basePadding * scalePadding)}px`,
      paddingY: `${Math.round(basePaddings * scalePadding)}px`,
      paddingX: `${Math.round(basePadding * scalePadding)}px`,
      margin: `${Math.round(baseGaps * scaleGap)}px`,
      marginY: `${Math.round(baseGaps * scaleGap)}px`,
      marginX: `${Math.round(baseGaps * scaleGap)}px`,
      gap: `${Math.round(baseGaps * scaleGap)}px`,
    }
    // 中等尺寸组件样式（使用较小的 margin 和 gap）
    const customComponentsStyle1m = {
      padding: `${Math.round(basePaddings * scalePadding)}px ${Math.round(basePadding * scalePadding)}px`,
      paddingY: `${Math.round(basePaddings * scalePadding)}px`,
      paddingX: `${Math.round(basePadding * scalePadding)}px`,
      margin: `${Math.round(baseGaps * 0.25 * scaleGap)}px`, // 使用 gap 的 25%
      marginY: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      marginX: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      gap: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
    }
    // 小尺寸组件样式（使用更小的 padding 和 margin）
    const customComponentsStyle1s = {
      padding: `${Math.round(basePaddings * 0.5 * scalePadding)}px ${Math.round(basePadding * 0.5 * scalePadding)}px`,
      paddingY: `${Math.round(basePaddings * 0.5 * scalePadding)}px`,
      paddingX: `${Math.round(basePadding * 0.5 * scalePadding)}px`,
      margin: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      marginY: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      marginX: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      gap: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
    }
    // 动态尺寸
    const customComponentsStyle2 = {
      padding: `${sizeStore.getPaddingsValue}px ${sizeStore.getPaddingValue}px`,
      paddingY: `${sizeStore.getPaddingsValue}px`,
      paddingX: `${sizeStore.getPaddingValue}px`,
      margin: `${sizeStore.getGaps}px`,
      marginY: `${sizeStore.getGaps}px`,
      marginX: `${sizeStore.getGaps}px`,
      gap: `${sizeStore.getGap}px`,
    }
    // 0尺寸组件样式
    const customComponentsStyle0 = {
      padding: '6px',
    }
    initToastColor(newPreset, colorStore)
    deepMergeStylesAdvancedInPlace(newPreset.components.toast, {
      ...customComponentsStyle2,
      padding: `${sizeStore.getPaddingValue}px`,
      gap: `${sizeStore.getGaps}px`,
    })
    // speeddial 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.speeddial, {
      ...customComponentsStyle1,
    })
    // dialog 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.dialog, {
      padding: `${sizeStore.getPaddingValue}px ${sizeStore.getPaddinglValue}px`,
    })
    // menu 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.menu, {
      ...customComponentsStyle1,
      ...customComponentsStyle0,
    })
    // megamenu 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.megamenu, {
      ...customComponentsStyle1,
      ...customComponentsStyle0,
    })
    // menubar 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.menubar, {
      ...customComponentsStyle1,
      ...customComponentsStyle0,
    })
    // panelmenu 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.panelmenu, {
      ...customComponentsStyle1,
      ...customComponentsStyle0,
    })
    // tieredmenu 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.tieredmenu, {
      ...customComponentsStyle1,
      ...customComponentsStyle0,
    })
    // 面包屑
    deepMergeStylesAdvancedInPlace(newPreset.components.breadcrumb, {
      ...customComponentsStyle1,
      ...customComponentsStyle0,
    })
    // contextmenu 右键菜单
    deepMergeStylesAdvancedInPlace(newPreset.components.contextmenu, {
      ...customComponentsStyle1,
    })
    // 表单 && 表单项
    deepMergeStylesAdvancedInPlace(newPreset.components.inputtext, {
      ...customComponentsStyle2,
    })
    // select 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.select, {
      ...customComponentsStyle1m,
    })
    // inputgroup 输入组
    deepMergeStylesAdvancedInPlace(newPreset.components.inputgroup, {
      ...customComponentsStyle1m,
    })
    // 列表框
    deepMergeStylesAdvancedInPlace(newPreset.components.listbox, {
      ...customComponentsStyle1m,
    })
    // 多选列表框
    deepMergeStylesAdvancedInPlace(newPreset.components.multiselect, {
      ...customComponentsStyle1m,
      margin: `${Math.round(baseGaps * scaleGap)}px`,
      marginY: `${Math.round(baseGaps * scaleGap)}px`,
      marginX: `${Math.round(basePadding * scalePadding)}px`,
      gap: `${Math.round(baseGaps * scaleGap)}px`,
      ['option.gap']: `${Math.round(basePadding * scalePadding)}px`,
      ['list.header.padding']: `${Math.round(basePadding * scalePadding)}px ${Math.round(basePadding * 1.33 * scalePadding)}px 0 ${Math.round(basePadding * 1.33 * scalePadding)}px`,
    })
    // 级联选择
    deepMergeStylesAdvancedInPlace(newPreset.components.cascadeselect, {
      ...customComponentsStyle1m,
    })
    // 树形选择
    deepMergeStylesAdvancedInPlace(newPreset.components.tree, {
      ...customComponentsStyle1s,
      padding: `0`,
      paddingY: `0px`,
      paddingX: `0px`,
      margin: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      marginY: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      marginX: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      gap: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
    })
    // 颜色选择器
    deepMergeStylesAdvancedInPlace(newPreset.components.colorpicker, {
      ...customComponentsStyle1m,
    })
    // 选择按钮
    deepMergeStylesAdvancedInPlace(newPreset.components.selectbutton, {
      ...customComponentsStyle1m,
    })
    // 日期选择器
    deepMergeStylesAdvancedInPlace(newPreset.components.datepicker, {
      ...customComponentsStyle1s,
      padding: `${Math.round(baseGaps * 0.25 * scalePadding)}px`,
      paddingY: `${Math.round(baseGaps * 0.25 * scalePadding)}px`,
      paddingX: `${Math.round(baseGaps * 0.25 * scalePadding)}px`,
      margin: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      marginY: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      marginX: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
      gap: `${Math.round(baseGaps * 0.25 * scaleGap)}px`,
    })
    // 日期选择器
    deepMergeStylesAdvancedInPlace(newPreset.components.tabs, {
      ...customComponentsStyle2,
      ['tab.margin']: `0px ${sizeStore.getGaps}px`,
      ['tab.borderWidth']: `0px`,
      ['activeBar.background']: `${colorStore.getPrimary100}`,
      hoverBackground: 'transparent',
    })

    /* 缓存结果 */
    if (cacheKey) {
      themeCache.set(cacheKey, newPreset)

      // 限制缓存大小，避免内存泄漏
      if (themeCache.size > 50) {
        const firstKey = themeCache.keys().next().value
        if (firstKey) {
          themeCache.delete(firstKey)
        }
      }
    }

    if (env.debug) {
      console.log('🎨 注入自定义主题配置 ✅:', newPreset)
    }

    return newPreset
  } catch (error) {
    console.error('createCustomPreset 执行失败:', error)
    return preset
  }
}

/**
 * 清理主题缓存
 */
export const clearThemeCache = () => {
  themeCache.clear()
  if (env.debug) {
    console.log('🧹 主题缓存已清理')
  }
}
