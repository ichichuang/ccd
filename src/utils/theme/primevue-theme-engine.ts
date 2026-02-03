/**
 * PrimeVue Theme Configuration Engine
 * Ported and adapted for CCD from AUDS-new reference
 */

/**
 * Deep merge styles with support for dot-notation paths and advanced options
 */
export interface MergeOptions {
  /** Should deep merge object values */
  deepMerge?: boolean
  /** Should override existing values */
  override?: boolean
  /** Custom matcher function */
  matcher?: (key: string, value: any, path: string[]) => boolean
  /** Custom transformer function */
  transformer?: (key: string, oldValue: any, newValue: any) => any
}

/**
 * Helper: Set value by path (creating intermediate objects if needed)
 */
function setValueByPath(obj: any, path: string[], value: any, override: boolean = true): void {
  let current = obj
  for (let i = 0; i < path.length - 1; i++) {
    const part = path[i]
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part]
  }
  const lastPart = path[path.length - 1]

  if (!override && current[lastPart] !== undefined) {
    return
  }
  current[lastPart] = value
}

/**
 * Helper: Set value only if path exists
 */
function setIfExistsByPath(
  root: any,
  baseKey: string,
  subPath: string,
  valueToSet: any,
  override: boolean = true
): void {
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
}

export function deepMergeStylesAdvanced<T = any>(
  target: T,
  styles: Record<string, any>,
  options: MergeOptions = {}
): T {
  const { deepMerge = true, override = true, matcher, transformer } = options

  // 1. Deep clone target
  const result = JSON.parse(JSON.stringify(target))

  // 2. Separate regular styles from path styles
  const processedStyles: Record<string, any> = {}
  const pathStyles: Record<string, any> = {}

  for (const [key, value] of Object.entries(styles)) {
    if (key.includes('.')) {
      pathStyles[key] = value
    } else {
      processedStyles[key] = value
    }
  }

  // 3. 遍历目标对象，应用「键名级」和「完整路径级」的合并规则
  //
  //   - processedStyles：仅按「当前 key 名」匹配，例如：
  //       styles = { color: 'red' }
  //       → 任何层级的 `color` 属性都会被匹配（可配合 matcher 精细控制）
  //
  //   - pathStyles：按「完整路径字符串」匹配，例如：
  //       styles = { 'components.button.root.background': 'red' }
  //       → 只有完整路径等于 'components.button.root.background' 的节点会在遍历时命中
  //
  //   处理顺序：
  //   1）遍历时，如果当前节点路径与 pathStyles 中的 key 完全相等：
  //        - 立即应用该值
  //        - 从 pathStyles 中 delete 掉该路径（避免后面重复创建）
  //   2）遍历结束后：
  //        - 对于尚未命中的 pathStyles（即遍历过程中根本不存在的路径），
  //          统一通过 setValueByPath 自动创建中间对象并写入最终值。
  function traverse(obj: any, path: string[] = []): void {
    if (obj === null || typeof obj !== 'object') {
      return
    }

    const currentKeys = Object.keys(obj)

    for (const key of currentKeys) {
      const value = obj[key]
      const currentPath = [...path, key]
      const currentPathString = currentPath.join('.')

      let matchedPathStyle = false
      let pathStyleValue: any = null

      // A. Check for exact path match
      if (Object.prototype.hasOwnProperty.call(pathStyles, currentPathString)) {
        matchedPathStyle = true
        pathStyleValue = pathStyles[currentPathString]
        delete pathStyles[currentPathString]
      }

      // B. Check for sub-path match (dynamic deep setting)
      // e.g. key="components", pathStyle="components.button.root..."
      if (typeof value === 'object' && value !== null) {
        const pathKeys = Object.keys(pathStyles)
        for (const pathKey of pathKeys) {
          if (pathKey.startsWith(`${key}.`)) {
            const subPath = pathKey.substring(key.length + 1)
            if (subPath) {
              setIfExistsByPath(obj, key, subPath, pathStyles[pathKey], override)
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
          continue
        }

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

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key], currentPath)
      }
    }
  }

  // 4. Execute traversal
  traverse(result)

  // 5. Handle remaining path styles (creating new paths)
  for (const [pathKey, pathValue] of Object.entries(pathStyles)) {
    const pathParts = pathKey.split('.')
    setValueByPath(result, pathParts, pathValue, override)
  }

  return result
}

/**
 * Recursively find all nodes with a given key and subKey (e.g. mask + background)
 * and set that property to newValue. Modifies target in place.
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
  if (
    Object.prototype.hasOwnProperty.call(target, keyToFind) &&
    target[keyToFind] != null &&
    typeof target[keyToFind] === 'object' &&
    Object.prototype.hasOwnProperty.call(target[keyToFind], subKeyToModify)
  ) {
    target[keyToFind][subKeyToModify] = newValue
  }
  for (const value of Object.values(target)) {
    if (typeof value === 'object' && value !== null) {
      deepFindAndReplaceProperty(value, keyToFind, subKeyToModify, newValue)
    }
  }
}

/**
 * In-place version of deep merge (modifies target directly)
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

  function traverse(obj: any, path: string[] = []): void {
    if (obj === null || typeof obj !== 'object') {
      return
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key]
      const currentPathString = currentPath.join('.')

      let matchedPathStyle = false
      let pathStyleValue: any = null

      if (Object.prototype.hasOwnProperty.call(pathStyles, currentPathString)) {
        matchedPathStyle = true
        pathStyleValue = pathStyles[currentPathString]
        delete pathStyles[currentPathString]
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

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key], currentPath)
      }
    }
  }

  traverse(target)

  // Create remaining paths
  for (const [pathKey, pathValue] of Object.entries(pathStyles)) {
    const pathParts = pathKey.split('.')
    setValueByPath(target, pathParts, pathValue, override)
  }
}
