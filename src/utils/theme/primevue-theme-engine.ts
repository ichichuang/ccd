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
  /**
   * 预留扩展：按路径/条件精细匹配节点。当前 preset 未使用；若需仅对部分路径应用样式可传入。
   */
  matcher?: (key: string, value: any, path: string[]) => boolean
  /**
   * 预留扩展：合并时对单节点值做转换。当前 preset 未使用；若需自定义合并逻辑可传入。
   */
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
 * Helper: Set value only if path exists (does not create intermediate keys).
 * Used to apply dotted-path styles into already-existing nodes during traversal.
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

/**
 * Internal: single implementation for deep merge.
 * - Splits styles into key-level (processedStyles) and dotted-path (pathStyles).
 * - Traverses the working object: exact path match writes and removes from pathStyles;
 *   sub-path match writes into existing nested nodes via setIfExistsByPath (e.g.
 *   "components.button.root.background" applies when at "components").
 * - After traversal, any remaining pathStyles are applied with setValueByPath (creates
 *   missing intermediate keys). Thus each path is applied at most once.
 *
 * @param target - Source object (cloned if inPlace is false)
 * @param styles - Styles to merge (flat keys and/or dotted paths)
 * @param options - deepMerge, override, matcher, transformer
 * @param inPlace - If true, mutate target; if false, merge into a clone and return it
 * @returns The merged object (clone when inPlace=false, same ref when inPlace=true)
 */
function applyMergeToTarget<T = any>(
  target: T,
  styles: Record<string, any>,
  options: MergeOptions,
  inPlace: boolean
): T {
  const { deepMerge = true, override = true, matcher, transformer } = options

  const work = inPlace ? target : (JSON.parse(JSON.stringify(target)) as T)

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

    const currentKeys = Object.keys(obj)

    for (const key of currentKeys) {
      const value = obj[key]
      const currentPath = [...path, key]
      const currentPathString = currentPath.join('.')

      let matchedPathStyle = false
      let pathStyleValue: any = null

      // A. Exact path match: this node is the target of a dotted-path style → apply and remove from pathStyles
      if (Object.prototype.hasOwnProperty.call(pathStyles, currentPathString)) {
        matchedPathStyle = true
        pathStyleValue = pathStyles[currentPathString]
        delete pathStyles[currentPathString]
      }

      // B. Sub-path match: a dotted-path starts with current key (e.g. "components.button.root..." while at "components").
      //    Write only into already-existing nested structure; remaining pathStyles are applied in step C via setValueByPath.
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

  traverse(work)

  // C. Remaining pathStyles: paths that didn't exist in target (no node was visited for them).
  //    Create intermediate keys and set the value so nothing is dropped.
  for (const [pathKey, pathValue] of Object.entries(pathStyles)) {
    const pathParts = pathKey.split('.')
    setValueByPath(work, pathParts, pathValue, override)
  }

  return work
}

export function deepMergeStylesAdvanced<T = any>(
  target: T,
  styles: Record<string, any>,
  options: MergeOptions = {}
): T {
  return applyMergeToTarget(target, styles, options, false)
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
  applyMergeToTarget(target, styles, options, true)
}
