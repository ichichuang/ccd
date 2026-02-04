// 工具函数

/**
 * 优化的深拷贝函数，保留函数引用，支持更多数据类型
 * 使用 WeakMap 处理循环引用，避免无限递归
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
 * 通用样式应用函数，用于批量处理数组类型的配置
 */
export function applyStylesToArray(items: any[], styleApplier: (item: any) => any): any[] {
  if (!Array.isArray(items)) {
    return items
  }
  return items.map(styleApplier)
}
