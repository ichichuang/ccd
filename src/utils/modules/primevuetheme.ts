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
 * 深度遍历对象，找到所有匹配特定键（key）和子属性（subKey）的对象，并原地修改其值。
 * 适用于修改所有嵌套层级下的 'mask.background' 样式。
 * @param target 目标对象（将被原地修改）
 * @param keyToFind 要查找的父键，例如 'mask'
 * @param subKeyToModify 要修改的子键，例如 'background'
 * @param newValue 新的值
 */
export function deepFindAndReplaceProperty(
  target: any,
  keyToFind: string,
  subKeyToModify: string,
  newValue: any
): void {
  if (target === null || typeof target !== 'object') {
    return
  }

  // 检查当前对象是否包含 keyToFind，并且 keyToFind 包含 subKeyToModify
  // 这种结构是 { mask: { background: ... } }
  if (
    Object.prototype.hasOwnProperty.call(target, keyToFind) &&
    target[keyToFind] !== null &&
    typeof target[keyToFind] === 'object' &&
    Object.prototype.hasOwnProperty.call(target[keyToFind], subKeyToModify)
  ) {
    // 找到了目标，执行替换
    target[keyToFind][subKeyToModify] = newValue
  }

  // 递归遍历所有属性
  for (const value of Object.values(target)) {
    if (typeof value === 'object' && value !== null) {
      deepFindAndReplaceProperty(value, keyToFind, subKeyToModify, newValue)
    }
  }
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

  // 1. 深拷贝目标对象，确保不修改原对象
  const result = JSON.parse(JSON.stringify(target))

  // 2. 处理点号分隔的路径样式
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

  // --- 辅助函数：创建路径并设置值的辅助函数 ---
  // 用于在遍历结束后创建新的、不存在的路径
  function setValueByPath(obj: any, path: string[], value: any): void {
    let current = obj
    for (let i = 0; i < path.length - 1; i++) {
      const part = path[i]
      // 如果路径不存在或不是对象，则创建空对象
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {}
      }
      current = current[part]
    }
    const lastPart = path[path.length - 1]

    // 检查是否应该覆盖
    if (!override && current[lastPart] !== undefined) {
      return
    }
    current[lastPart] = value
  }

  // 3. 遍历现有对象，合并普通样式和已存在的完整路径样式
  function traverse(obj: any, path: string[] = []): void {
    if (obj === null || typeof obj !== 'object') {
      return
    }

    // 复制 keys，因为我们可能删除 pathStyles 中的元素
    const currentKeys = Object.keys(obj)

    for (const key of currentKeys) {
      const value = obj[key]
      const currentPath = [...path, key]
      const currentPathString = currentPath.join('.')

      let matchedPathStyle = false
      let pathStyleValue: any = null

      // A. 检查是否匹配完整路径样式 (e.g., 'popover.content.padding')
      if (Object.prototype.hasOwnProperty.call(pathStyles, currentPathString)) {
        matchedPathStyle = true
        pathStyleValue = pathStyles[currentPathString]
        delete pathStyles[currentPathString] // 标记为已处理
      }

      // ❗ 移除了：遍历 pathStyles 并在 traverse 内部尝试创建/设置子路径的复杂逻辑。
      // ❗ 这一部分现在完全依赖于最后对 pathStyles 的循环和路径创建。

      // B. 匹配普通样式或完整路径样式
      const shouldMatch = matcher
        ? matcher(key, value, currentPath)
        : Object.prototype.hasOwnProperty.call(processedStyles, key) || matchedPathStyle

      if (shouldMatch) {
        const newValue = matchedPathStyle ? pathStyleValue : processedStyles[key]

        // 检查是否应该覆盖
        if (!override && obj[key] !== undefined) {
          continue
        }

        // 应用转换、深度合并或直接赋值
        if (transformer) {
          obj[key] = transformer(key, value, newValue)
        } else if (
          deepMerge &&
          typeof value === 'object' &&
          value !== null &&
          typeof newValue === 'object' &&
          newValue !== null
        ) {
          // 深度合并对象
          obj[key] = { ...value, ...newValue }
        } else {
          // 直接赋值
          obj[key] = newValue
        }
      }

      // 递归处理嵌套对象 (使用更新后的引用 obj[key])
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key], currentPath)
      }
    }
  }

  // 4. 执行遍历
  traverse(result)

  // 5. 处理所有剩余的路径样式 (关键步骤：创建新的深层路径!)
  // 这一步确保了像 'root.sm.gap' 或 'newComponent.prop' 这种在原始结构中不存在的路径也能被创建。
  for (const [pathKey, pathValue] of Object.entries(pathStyles)) {
    const pathParts = pathKey.split('.')
    setValueByPath(result, pathParts, pathValue)
  }

  return result
}

/**
 * 高级版本（原地修改） - 功能与 deepMergeStylesAdvanced 等效，但直接修改目标对象
 * 优化：增加了对不存在路径的创建和赋值功能，以确保 'root.sm.*' 等路径能被设置。
 */
export function deepMergeStylesAdvancedInPlace<T = any>(
  target: T,
  styles: Record<string, any>,
  options: MergeOptions = {}
): void {
  const { deepMerge = true, override = true, matcher, transformer } = options

  const processedStyles: Record<string, any> = {}
  const pathStyles: Record<string, any> = {}

  // 1. 分离普通样式和路径样式
  for (const [key, value] of Object.entries(styles)) {
    if (key.includes('.')) {
      pathStyles[key] = value
    } else {
      processedStyles[key] = value
    }
  }

  // --- 辅助函数：仅在路径已存在时设置值 ---
  // 保留此函数用于在遍历中高效设置已存在的子路径
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
      // 路径不存在或非对象，则中断
      if (
        !Object.prototype.hasOwnProperty.call(current, part) ||
        current[part] === null ||
        typeof current[part] !== 'object'
      ) {
        return
      }
      current = current[part]
    }
    const last = parts[parts.length - 1]
    if (!Object.prototype.hasOwnProperty.call(current, last)) {
      return
    }
    if (!override && current[last] !== undefined) {
      return
    }
    current[last] = valueToSet
    // 从 pathStyles 中删除已设置的路径，避免在最后的创建阶段重复处理
    delete pathStyles[`${baseKey}.${subPath}`]
  }

  // --- 辅助函数：创建路径并设置值（用于不存在的路径） ---
  function createPathAndSetValue(obj: any, path: string[], value: any): void {
    let current = obj
    for (let i = 0; i < path.length - 1; i++) {
      const part = path[i]
      // 如果路径不存在或不是一个对象，则创建/覆盖为空对象
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {}
      }
      current = current[part]
    }
    const lastPart = path[path.length - 1]

    // 检查是否应该覆盖
    if (!override && current[lastPart] !== undefined) {
      return
    }

    // 执行赋值
    current[lastPart] = value
  }

  // 2. 遍历现有对象，合并普通样式和已存在的路径样式
  function traverse(obj: any, path: string[] = []): void {
    if (obj === null || typeof obj !== 'object') {
      return
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key]
      const currentPathString = currentPath.join('.')

      let matchedPathStyle = false
      let pathStyleValue: any = null

      // 检查完整路径匹配 (e.g., 'popover.root.padding')
      if (Object.prototype.hasOwnProperty.call(pathStyles, currentPathString)) {
        matchedPathStyle = true
        pathStyleValue = pathStyles[currentPathString]
        delete pathStyles[currentPathString] // 标记为已处理
      }

      // 动态子路径处理 (e.g., 在遍历 'components' 时，处理 'components.Button.root.sm.gap')
      if (typeof value === 'object' && value !== null) {
        // 必须克隆 keys，因为 setIfExistsByPath 会删除 pathStyles 中的元素
        const pathKeys = Object.keys(pathStyles)
        for (const pathKey of pathKeys) {
          if (pathKey.startsWith(`${key}.`)) {
            const subPath = pathKey.substring(key.length + 1)
            if (subPath) {
              // 尝试设置已存在的深层路径
              setIfExistsByPath(obj, key, subPath, pathStyles[pathKey])
              // 注意：setIfExistsByPath 内部会删除已设置的 pathKey
            }
          }
        }
      }

      // 匹配普通样式或完整路径样式
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
          // 深度合并对象
          obj[key] = { ...value, ...newValue }
        } else {
          // 直接赋值
          obj[key] = newValue
        }
      }

      // 递归使用更新后的引用，避免遗漏新合并的对象
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key], currentPath)
      }
    }
  }

  // 3. 执行遍历
  traverse(target)

  // 4. 处理所有剩余的路径样式 (创建新路径的能力!)
  // 这一步确保了像 'newKey.subKey.prop' 这种在 target 中完全不存在的路径也能被创建。
  for (const [pathKey, pathValue] of Object.entries(pathStyles)) {
    const pathParts = pathKey.split('.')
    createPathAndSetValue(target, pathParts, pathValue)
  }
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

const initMessageColor = (preset: any, colorStore: ReturnType<typeof useColorStore>) => {
  const lightTint = (base: string) => `color-mix(in srgb, ${base}, transparent 12%)`
  const darkTint = (base: string) => `color-mix(in srgb, ${base}, transparent 28%)`

  deepMergeStylesAdvancedInPlace(preset.components.message, {
    root: {
      blur: colorStore.isDark ? '10px' : '1.5px',
    },
    info: {
      background: colorStore.isDark
        ? darkTint(colorStore.getInfoColor)
        : lightTint(colorStore.getInfoColor),
      borderColor: colorStore.isDark ? colorStore.getInfoColorActive : colorStore.getInfoColorHover,
      color: colorStore.getInfoColorText,
      detailColor: colorStore.getText100,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getInfoColorText}, transparent 88%)`,
      closeButton: {
        hoverBackground: colorStore.getBg100,
        focusRing: {
          color: colorStore.getText100,
          shadow: 'none',
        },
      },
      simple: {
        color: colorStore.getInfoColorText,
      },
    },
    success: {
      background: colorStore.isDark
        ? darkTint(colorStore.getSuccessColor)
        : lightTint(colorStore.getSuccessColor),
      borderColor: colorStore.isDark
        ? colorStore.getSuccessColorActive
        : colorStore.getSuccessColorHover,
      color: colorStore.getSuccessColorText,
      detailColor: colorStore.getText100,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getSuccessColorText}, transparent 88%)`,
      closeButton: {
        hoverBackground: colorStore.getBg100,
        focusRing: {
          color: colorStore.getText100,
          shadow: 'none',
        },
      },
      simple: {
        color: colorStore.getSuccessColorText,
      },
    },
    warn: {
      background: colorStore.isDark
        ? darkTint(colorStore.getWarnColor)
        : lightTint(colorStore.getWarnColor),
      borderColor: colorStore.isDark ? colorStore.getWarnColorActive : colorStore.getWarnColorHover,
      color: colorStore.getWarnColorText,
      detailColor: colorStore.getText100,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getWarnColorText}, transparent 88%)`,
      closeButton: {
        hoverBackground: colorStore.getBg100,
        focusRing: {
          color: colorStore.getText100,
          shadow: 'none',
        },
      },
      simple: {
        color: colorStore.getWarnColorText,
      },
    },
    error: {
      background: colorStore.isDark
        ? darkTint(colorStore.getDangerColor)
        : lightTint(colorStore.getDangerColor),
      borderColor: colorStore.isDark
        ? colorStore.getDangerColorActive
        : colorStore.getDangerColorHover,
      color: colorStore.getDangerColorText,
      detailColor: colorStore.getText100,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getDangerColorText}, transparent 88%)`,
      closeButton: {
        hoverBackground: colorStore.getBg100,
        focusRing: {
          color: colorStore.getText100,
          shadow: 'none',
        },
      },
      simple: {
        color: colorStore.getDangerColorText,
      },
    },
    secondary: {
      background: colorStore.isDark
        ? darkTint(colorStore.getBg300)
        : lightTint(colorStore.getBg200),
      borderColor: colorStore.isDark ? colorStore.getBg300 : colorStore.getBg300,
      color: colorStore.getSecondaryColorText,
      detailColor: colorStore.getSecondaryColorText,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getSecondaryColorText}, transparent 88%)`,
      closeButton: {
        hoverBackground: colorStore.getBg200,
        focusRing: {
          color: colorStore.getSecondaryColorText,
          shadow: 'none',
        },
      },
      simple: {
        color: colorStore.getSecondaryColorText,
      },
    },
    contrast: {
      background: colorStore.getContrastColor,
      borderColor: colorStore.getContrastColorActive,
      color: colorStore.getContrastColorText,
      detailColor: colorStore.getContrastColorText,
      shadow: `0px 4px 8px 0px color-mix(in srgb, ${colorStore.getContrastColorText}, transparent 88%)`,
      closeButton: {
        hoverBackground: colorStore.isDark ? colorStore.getContrastColorHover : colorStore.getBg200,
        focusRing: {
          color: colorStore.getContrastColorText,
          shadow: 'none',
        },
      },
      simple: {
        color: colorStore.getContrastColorText,
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
      iconOnlyWidth: `${sizeStore.getFontSizeValue}px`,
      // width: `${sizeStore.getFontSizexValue}px`,
      // height: `${sizeStore.getFontSizexValue}px`,
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

    /* sm */
    const customSizeSm = {
      ['root.sm.gap']: `${sizeStore.getGaps * 0.5}px`, // 元素之间间距
      ['root.sm.padding']: `${sizeStore.getPaddingsValue * 0.5}px`, // 元素内边距（上下 左右）
      ['root.sm.paddingX']: `${sizeStore.getPaddingsValue * 0.5}px`, // 左右内边距
      ['root.sm.paddingY']: `${sizeStore.getPaddingsValue * 0.25}px`, // 上下内边距
      ['root.sm.margin']: `${sizeStore.getGaps * 0.5}px`, // 外边距（上下 左右）
      ['root.sm.marginX']: `${sizeStore.getGaps * 0.5}px`, // 左右外边距
      ['root.sm.marginY']: `${sizeStore.getGaps * 0.5}px`, // 上下外边距
      ['root.sm.fontSize']: `${sizeStore.getFontSizesValue}px`,
      ['root.sm.iconOnlyWidth']: `${sizeStore.getFontSizeValue}px`,
      // ['root.sm.width']: `${sizeStore.getFontSizesValue}px`,
      // ['root.sm.height']: `${sizeStore.getFontSizesValue}px`,
    }

    /* lg */
    const customSizeLg = {
      ['root.lg.gap']: `${sizeStore.getGapx * 0.8}px`, // 元素之间间距
      ['root.lg.padding']: `${sizeStore.getPaddingxValue * 0.8}px`, // 元素内边距（上下 左右）
      ['root.lg.paddingX']: `${sizeStore.getPaddingxValue * 0.8}px`, // 左右内边距
      ['root.lg.paddingY']: `${sizeStore.getPaddingxValue * 0.6}px`, // 上下内边距
      ['root.lg.margin']: `${sizeStore.getGapx * 0.8}px`, // 外边距（上下 左右）
      ['root.lg.marginX']: `${sizeStore.getGapx * 0.8}px`, // 左右外边距
      ['root.lg.marginY']: `${sizeStore.getGapx * 0.8}px`, // 上下外边距
      ['root.lg.fontSize']: `${sizeStore.getFontSizexValue}px`,
      ['root.lg.iconOnlyWidth']: `${sizeStore.getFontSizexValue}px`,
      // ['root.lg.width']: `${sizeStore.getFontSizelValue}px`,
      // ['root.lg.height']: `${sizeStore.getFontSizelValue}px`,
    }

    // 1. 核心样式合并（包含颜色、基础尺寸和 popover/drawer 路径样式）
    const coreStyles = {
      ...customColor,
      ...customSize,
    }

    // 2. 响应式尺寸路径样式
    const sizePathStyles = {
      ...customSizeSm,
      ...customSizeLg,
    }

    // 阶段一：合并核心样式和所有路径样式 (popover, drawer 等路径在这里创建)
    let newPreset = deepMergeStylesAdvanced(preset, coreStyles, {
      deepMerge: true,
      override: true,
    })

    // 阶段二：合并 Sm/Lg 样式到顶层 root (创建 newPreset.root.sm 和 newPreset.root.lg)
    // 这一步确保 Sm/Lg 样式被写入顶层，以便后续的扩散可以正确读取。
    newPreset = deepMergeStylesAdvanced(newPreset, sizePathStyles, {
      deepMerge: true,
      override: true,
    })

    // 阶段三：将 root.sm.* 和 root.lg.* 应用到所有组件的 root.sm.* 和 root.lg.*
    if (newPreset.components && typeof newPreset.components === 'object') {
      // 提取 sm 和 lg 的配置（从原始 customSizeSm/Lg 变量中提取，逻辑保持不变）
      const smConfig: Record<string, any> = {}
      const lgConfig: Record<string, any> = {}

      for (const [key, value] of Object.entries(customSizeSm)) {
        if (key.startsWith('root.sm.')) {
          const propName = key.substring('root.sm.'.length)
          smConfig[propName] = value
        }
      }

      for (const [key, value] of Object.entries(customSizeLg)) {
        if (key.startsWith('root.lg.')) {
          const propName = key.substring('root.lg.'.length)
          lgConfig[propName] = value
        }
      }

      // 遍历所有组件，应用 sm 和 lg 配置 (保持不变)
      for (const [, componentConfig] of Object.entries(newPreset.components)) {
        if (componentConfig && typeof componentConfig === 'object') {
          const config = componentConfig as Record<string, any>

          config.root = config.root || {}
          config.root.sm = config.root.sm || {}
          config.root.lg = config.root.lg || {}

          Object.assign(config.root.sm, smConfig)
          Object.assign(config.root.lg, lgConfig)
        }
      }
    }
    // 阶段四（新增）：深度查找并修改所有 mask.background 属性
    const maskNewValue = `${colorStore.getBg300}80`
    deepFindAndReplaceProperty(newPreset, 'mask', 'background', maskNewValue)

    // 组件尺寸配置（基于全局变量和缩放比例）
    const customComponentsStyle = {
      paddingY: `${Math.round(basePaddings * scalePadding)}px`,
      paddingX: `${Math.round(basePadding * scalePadding)}px`,
      margin: `${Math.round(baseGaps * scaleGap)}px`,
      marginY: `${Math.round(baseGaps * scaleGap)}px`,
      marginX: `${Math.round(baseGaps * scaleGap)}px`,
      gap: `${Math.round(baseGaps * scaleGap)}px`,
      padding: '6px',
    }

    // toast 组件单独处理
    // toast 组件样式初始化
    initToastColor(newPreset, colorStore)
    deepMergeStylesAdvancedInPlace(newPreset.components.toast, {
      paddingY: `${sizeStore.getPaddingsValue}px`,
      paddingX: `${sizeStore.getPaddingValue}px`,
      margin: `${sizeStore.getGaps}px`,
      marginY: `${sizeStore.getGaps}px`,
      marginX: `${sizeStore.getGaps}px`,
      padding: `${sizeStore.getPaddingValue}px`,
      gap: `${sizeStore.getGaps}px`,
    })
    // message 组件单独处理
    initMessageColor(newPreset, colorStore)
    deepMergeStylesAdvancedInPlace(newPreset.components.message, {
      content: {
        padding: `${Math.round(basePadding * 0.67)}px ${Math.round(basePadding)}px`,
        gap: `${Math.round(baseGaps * scaleGap)}px`,
        sm: {
          padding: `${Math.round(basePadding * 0.5)}px ${Math.round(basePadding * 0.83)}px`,
        },
        lg: {
          padding: `${Math.round(basePadding * 0.83)}px ${Math.round(basePadding * 1.17)}px`,
        },
      },
      text: {
        sm: {
          fontSize: `${Math.round(sizeStore.getFontSizeValue * 0.875)}px`,
        },
        lg: {
          fontSize: `${Math.round(sizeStore.getFontSizeValue * 1.125)}px`,
        },
      },
      icon: {
        sm: {
          size: `${Math.round(sizeStore.getFontSizeValue)}px`,
        },
        lg: {
          size: `${Math.round(sizeStore.getFontSizeValue * 1.25)}px`,
        },
      },

      closeIcon: {
        sm: {
          size: `${Math.round(sizeStore.getFontSizeValue * 0.875)}px`,
        },
        lg: {
          size: `${Math.round(sizeStore.getFontSizeValue * 1.125)}px`,
        },
      },
    })
    // DataTable 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.datatable, {
      /* header: {
        padding: `${sizeStore.getPaddingValue * 0.96}px ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `${sizeStore.getPaddingsValue * 0.6}px ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `${sizeStore.getPaddingxValue * 0.8}px ${sizeStore.getPaddingValue}px`,
        },
      },
      headerCell: {
        padding: `${sizeStore.getPaddingValue * 0.96}px ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `${sizeStore.getPaddingsValue * 0.6}px ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `${sizeStore.getPaddingxValue * 0.8}px ${sizeStore.getPaddingValue}px`,
        },
      },
      bodyCell: {
        padding: `${sizeStore.getPaddingValue * 0.96}px ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `${sizeStore.getPaddingsValue * 0.6}px ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `${sizeStore.getPaddingxValue * 0.8}px ${sizeStore.getPaddingValue}px`,
        },
      },
      footerCell: {
        padding: `${sizeStore.getPaddingValue * 0.96}px ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `${sizeStore.getPaddingsValue * 0.6}px ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `${sizeStore.getPaddingxValue * 0.8}px ${sizeStore.getPaddingValue}px`,
        },
      },
      columnFooter: {
        padding: `${sizeStore.getPaddingValue * 0.96}px ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `${sizeStore.getPaddingsValue * 0.6}px ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `${sizeStore.getPaddingxValue * 0.8}px ${sizeStore.getPaddingValue}px`,
        },
      }, */
      header: {
        padding: `0 ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
      },
      headerCell: {
        padding: `0 ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
      },
      bodyCell: {
        padding: `0 ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
      },
      footerCell: {
        padding: `0 ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
      },
      columnFooter: {
        padding: `0 ${sizeStore.getPaddingValue}px`,
        sm: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
        lg: {
          padding: `0 ${sizeStore.getPaddingValue}px`,
        },
      },
    })
    // dialog 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.dialog, {
      padding: `${sizeStore.getPaddingValue}px ${sizeStore.getPaddinglValue}px`,
    })
    // menu 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.menu, {
      ...customComponentsStyle,
    })
    // megamenu 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.megamenu, {
      ...customComponentsStyle,
    })
    // menubar 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.menubar, {
      ...customComponentsStyle,
    })
    // panelmenu 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.panelmenu, {
      ...customComponentsStyle,
    })
    // tieredmenu 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.tieredmenu, {
      ...customComponentsStyle,
    })
    // 面包屑
    deepMergeStylesAdvancedInPlace(newPreset.components.breadcrumb, {
      ...customComponentsStyle,
    })
    // // contextmenu 右键菜单
    deepMergeStylesAdvancedInPlace(newPreset.components.contextmenu, {
      ...customComponentsStyle,
      padding: `${Math.round(basePaddings * scalePadding)}px ${Math.round(basePadding * scalePadding)}px`,
    })

    /* 特殊有弹出框的组件样式初始化 */
    const customComponentsStyleSm = {
      // list
      ['list.padding']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['list.paddingY']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['list.paddingX']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['list.margin']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['list.marginY']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['list.marginX']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['list.gap']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      // option
      ['option.padding']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['option.paddingY']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['option.paddingX']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['option.margin']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['option.marginY']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['option.marginX']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['option.gap']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      // optionGroup
      ['optionGroup.padding']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['optionGroup.paddingY']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['optionGroup.paddingX']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['optionGroup.margin']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['optionGroup.marginY']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['optionGroup.marginX']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['optionGroup.gap']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      // overlay
      ['overlay.padding']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['overlay.paddingY']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['overlay.paddingX']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['overlay.margin']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['overlay.marginY']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['overlay.marginX']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['overlay.gap']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      // dropdown
      ['dropdown.padding']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['dropdown.paddingY']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['dropdown.paddingX']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['dropdown.margin']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['dropdown.marginY']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['dropdown.marginX']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['dropdown.gap']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      // handle
      ['handle.padding']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['handle.paddingY']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['handle.paddingX']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['handle.margin']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['handle.marginY']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['handle.marginX']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['handle.gap']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      // node
      ['node.padding']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['node.paddingY']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['node.paddingX']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['node.margin']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['node.marginY']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['node.marginX']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['node.gap']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      // tree
      ['tree.padding']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['tree.paddingY']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['tree.paddingX']: `${Math.round(baseGaps * 0.8 * scalePadding)}px`,
      ['tree.margin']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['tree.marginY']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['tree.marginX']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
      ['tree.gap']: `${Math.round(baseGaps * 0.8 * scaleGap)}px`,
    }
    // select 组件单独处理
    deepMergeStylesAdvancedInPlace(newPreset.components.select, {
      ...customComponentsStyleSm,
    })
    // inputgroup 输入组
    deepMergeStylesAdvancedInPlace(newPreset.components.inputgroup, {
      ...customComponentsStyleSm,
    })
    // 列表框
    deepMergeStylesAdvancedInPlace(newPreset.components.listbox, {
      ...customComponentsStyleSm,
    })
    // 多选列表框
    deepMergeStylesAdvancedInPlace(newPreset.components.multiselect, {
      ...customComponentsStyleSm,
    })
    // 级联选择
    deepMergeStylesAdvancedInPlace(newPreset.components.cascadeselect, {
      ...customComponentsStyleSm,
    })
    // 树形选择
    deepMergeStylesAdvancedInPlace(newPreset.components.tree, {
      ...customComponentsStyleSm,
      gap: '2px',
    })
    // 颜色选择器
    deepMergeStylesAdvancedInPlace(newPreset.components.colorpicker, {
      ...customComponentsStyleSm,
    })
    // 选择按钮
    deepMergeStylesAdvancedInPlace(newPreset.components.selectbutton, {
      ...customComponentsStyleSm,
    })
    // 日期选择器
    deepMergeStylesAdvancedInPlace(newPreset.components.datepicker, {
      ...customComponentsStyleSm,
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
