/**
 * useChartTheme 工具函数（ECharts option 边界层）
 *
 * 深拷贝与批量样式应用接受任意 option 结构，故参数/返回使用 any。
 */

/**
 * 优化的深拷贝函数，保留函数引用，支持更多数据类型；用于 ECharts option 深拷贝，接受任意结构。
 * 使用 WeakMap 处理循环引用，避免无限递归。
 */
export function deepCloneWithFunctions(obj: any, visited = new WeakMap()): any {
  // 处理基本类型和 null
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 保留函数引用（必须在 object 检查之前）
  if (typeof obj === 'function') {
    return obj
  }

  // 检查循环引用 - 如果已经访问过，直接返回已克隆的对象
  if (visited.has(obj)) {
    return visited.get(obj)
  }

  // 处理 Date 对象
  if (obj instanceof Date) {
    const cloned = new Date(obj.getTime())
    visited.set(obj, cloned)
    return cloned
  }

  // 处理 RegExp 对象
  if (obj instanceof RegExp) {
    const cloned = new RegExp(obj.source, obj.flags)
    visited.set(obj, cloned)
    return cloned
  }

  // 处理 Map 对象
  if (obj instanceof Map) {
    const clonedMap = new Map()
    visited.set(obj, clonedMap)
    for (const [key, value] of obj) {
      clonedMap.set(deepCloneWithFunctions(key, visited), deepCloneWithFunctions(value, visited))
    }
    return clonedMap
  }

  // 处理 Set 对象
  if (obj instanceof Set) {
    const clonedSet = new Set()
    visited.set(obj, clonedSet)
    for (const value of obj) {
      clonedSet.add(deepCloneWithFunctions(value, visited))
    }
    return clonedSet
  }

  // 处理数组
  if (Array.isArray(obj)) {
    const cloned: any[] = []
    visited.set(obj, cloned)
    for (let i = 0; i < obj.length; i++) {
      cloned[i] = deepCloneWithFunctions(obj[i], visited)
    }
    return cloned
  }

  // 处理普通对象
  if (typeof obj === 'object') {
    const cloned: any = {}
    // 立即记录到 visited，防止自引用导致的无限递归
    visited.set(obj, cloned)
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepCloneWithFunctions(obj[key], visited)
      }
    }
    return cloned
  }

  return obj
}

/**
 * 通用样式应用函数，用于批量处理数组类型的 ECharts 配置（如 axis、series），接受任意 item 结构。
 */
export function applyStylesToArray(items: any[], styleApplier: (item: any) => any): any[] {
  if (!Array.isArray(items)) {
    return items
  }
  return items.map(styleApplier)
}

/**
 * 将颜色转换为带透明度的 rgba 字符串
 * 支持 hex (#rgb, #rrggbb) 和 rgb(r,g,b) 格式
 */
export function withAlpha(color: string | undefined, alpha: number): string | undefined {
  if (!color || typeof color !== 'string') {
    return color
  }

  // 处理 rgb(r,g,b) 格式
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10)
    const g = parseInt(rgbMatch[2], 10)
    const b = parseInt(rgbMatch[3], 10)
    if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }

  // 处理 hex 格式
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
