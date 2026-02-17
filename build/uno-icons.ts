/**
 * UnoCSS 动态图标 safelist 与自定义图标集（供 uno.config.ts 与 build/plugins 使用）
 * - 扫描 router/api 中的 icon 字符串，纳入 safelist
 * - 本地 SVG 统一为 collection `custom`（src/assets/icons/*.svg），注入 fill="currentColor"
 * - 布局/尺寸类从 SSOT (constants/size, constants/sizeScale) 推导
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { globSync } from 'glob'
import { LAYOUT_DIMENSION_KEYS, SIZE_BASE_VAR_KEYS } from '../src/constants/size'
import { SIZE_SCALE_KEYS } from '../src/constants/sizeScale'
import { COLOR_FAMILIES } from '../src/utils/theme/metadata'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(currentDir, '..')

const ICONS_DIR = path.join(projectRoot, 'src/assets/icons')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IconCacheTarget = 'route' | 'custom'

interface CacheEntry<T> {
  key: string
  value: T
}

export type CustomIconLoader = ReturnType<typeof FileSystemIconLoader>

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

let routeIconsCache: CacheEntry<string[]> | null = null
let customIconsCache: CacheEntry<string[]> | null = null

export function invalidateIconCaches(target: IconCacheTarget | 'all' = 'all'): void {
  if (target === 'route' || target === 'all') routeIconsCache = null
  if (target === 'custom' || target === 'all') customIconsCache = null
}

// ---------------------------------------------------------------------------
// Iconify 图标列表（从 @iconify-json 包动态读取）
// ---------------------------------------------------------------------------

const _require = createRequire(import.meta.url)

/** Iconify icons.json 最小结构（仅需 prefix + icons 键名） */
interface IconifyIconsJson {
  prefix?: string
  icons?: Record<string, unknown>
}

/**
 * 从 @iconify-json 包读取图标名称列表
 * @param collectionName - 集合名称（lucide | mdi | logos）
 * @returns 图标类名数组，格式 i-{prefix}-{name}
 */
export function getIconifyIconNames(collectionName: 'lucide' | 'mdi' | 'logos'): string[] {
  try {
    const iconSet = _require(`@iconify-json/${collectionName}/icons.json`) as IconifyIconsJson
    const prefix = iconSet.prefix ?? collectionName
    const icons = iconSet.icons ?? {}
    return Object.keys(icons).map(name => `i-${prefix}-${name}`)
  } catch (err) {
    console.warn(`[uno-icons] Failed to load @iconify-json/${collectionName}:`, err)
    return []
  }
}

/** 示例页与 safelist 使用的子集数量，控制构建内存 */
export const ICON_SUBSET_LIMITS = {
  lucide: 500,
  mdi: 500,
  logos: 300,
} as const

/**
 * 取某集合前 limit 个图标类名，供示例页与 safelist 使用，避免全量导致 OOM
 */
export function getIconifyIconNamesSubset(
  collectionName: 'lucide' | 'mdi' | 'logos',
  limit: number
): string[] {
  return getIconifyIconNames(collectionName).slice(0, limit)
}

// ---------------------------------------------------------------------------
// Invalid icon names (filter false positives from route/api scan)
// ---------------------------------------------------------------------------

const invalidIcons = new Set<string>([
  'return',
  'if',
  'else',
  'switch',
  'case',
  'for',
  'while',
  'break',
  'continue',
  'function',
  'const',
  'let',
  'var',
  'import',
  'export',
  'default',
  'new',
  'this',
  'Tab',
  'Newline',
  'Return',
  'Space',
  'Enter',
  'Escape',
  'Backspace',
  'value',
  'label',
  'name',
  'id',
  'key',
  'index',
  'item',
  'list',
  'data',
  'text',
  '-',
  '_',
  '.',
  ',',
  ';',
  ':',
  '!',
  '?',
  '@',
  '#',
  '$',
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
])

// ---------------------------------------------------------------------------
// Route/API icon scanning
// ---------------------------------------------------------------------------

const iconPatterns: RegExp[] = [
  /meta\s*:\s*\{[^}]*icon\s*:\s*['"]([^'"]+)['"]/g,
  /meta\.icon\s*=\s*['"]([^'"]+)['"]/g,
  /(?:^|\s|,)icon\s*:\s*['"]([^'"]+)['"]/g,
]

function isValidIconName(iconName: string): boolean {
  if (!iconName || iconName.length === 0 || iconName.length > 80) return false
  if (invalidIcons.has(iconName)) return false
  if (/^\d+$/.test(iconName)) return false
  if (/\s/.test(iconName)) return false
  if (!/^[a-zA-Z0-9\-_:]+$/.test(iconName)) return false
  if (!/^[a-zA-Z]/.test(iconName)) return false
  return true
}

function getTsAndVueFiles(dir: string): string[] {
  const files: string[] = []
  const fullDir = path.join(projectRoot, dir)
  if (!fs.existsSync(fullDir)) return files
  function traverse(currentPath: string): void {
    try {
      const items = fs.readdirSync(currentPath, { withFileTypes: true })
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name)
        if (item.isDirectory()) traverse(fullPath)
        else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.vue')))
          files.push(fullPath)
      }
    } catch {
      // ignore
    }
  }
  traverse(fullDir)
  return files
}

function createCacheKey(files: string[]): string {
  if (files.length === 0) return 'empty'
  let latest = 0
  for (const filePath of files) {
    try {
      const mtime = fs.statSync(filePath).mtimeMs
      if (mtime > latest) latest = mtime
    } catch {
      // skip
    }
  }
  return `${files.length}-${latest}`
}

/**
 * 从 src/router 与 src/api 中扫描 meta.icon / icon: '...' 等字符串
 */
export function getRouteMetaIcons(): string[] {
  const routerDir = path.join(projectRoot, 'src/router')
  const apiDir = path.join(projectRoot, 'src/api')
  const files: string[] = []
  if (fs.existsSync(routerDir)) {
    files.push(...getTsAndVueFiles('src/router'))
  }
  if (fs.existsSync(apiDir)) {
    files.push(...getTsAndVueFiles('src/api'))
  }
  const cacheKey = createCacheKey(files)
  if (routeIconsCache && routeIconsCache.key === cacheKey) return routeIconsCache.value

  const icons = new Set<string>()
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const clean = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
      for (const pattern of iconPatterns) {
        pattern.lastIndex = 0
        let m: RegExpExecArray | null
        while ((m = pattern.exec(clean)) !== null) {
          const name = m[1]?.trim()
          if (name && isValidIconName(name)) icons.add(name)
        }
      }
    } catch {
      // ignore
    }
  }
  const result = Array.from(icons)
  routeIconsCache = { key: cacheKey, value: result }
  return result
}

// ---------------------------------------------------------------------------
// Custom icons (src/assets/icons/**/*.svg) → collection name: custom
// ---------------------------------------------------------------------------

/** 注入 fill="currentColor" 以便图标继承文字颜色 */
function transformSvgFill(svg: string): string {
  return svg.replace(/<svg\s/, '<svg fill="currentColor" ')
}

/** name -> absolute path，用于自定义 loader（支持子目录） */
function getCustomIconPathMap(): Map<string, string> {
  const map = new Map<string, string>()
  try {
    if (!fs.existsSync(ICONS_DIR)) return map
    const files = globSync('**/*.svg', { cwd: ICONS_DIR, nodir: true })
    for (const rel of files) {
      const fullPath = path.join(ICONS_DIR, rel)
      // 图标名：相对路径去掉 .svg，斜杠改为横线，如 custom/juejin → custom-juejin
      const name = rel
        .replace(/\.svg$/i, '')
        .replace(/\\/g, '/')
        .split('/')
        .join('-')
      map.set(name, fullPath)
    }
  } catch {
    // ignore
  }
  return map
}

/**
 * 返回本地自定义图标的 class 列表，格式 i-custom:<name>
 * 扫描 src/assets/icons 下所有 .svg（含子目录），name 为路径转横线，如 i-custom:custom-juejin
 */
export function getCustomIconClasses(): string[] {
  if (customIconsCache) return customIconsCache.value
  const map = getCustomIconPathMap()
  const classes = Array.from(map.keys(), k => `i-custom:${k}`)
  customIconsCache = { key: `${map.size}`, value: classes }
  return classes
}

/** 创建自定义 collection loader：按 name 读文件并注入 fill="currentColor" */
function createCustomIconLoader(): CustomIconLoader {
  const pathMap = getCustomIconPathMap()
  return async (name: string): Promise<string | undefined> => {
    const fullPath = pathMap.get(name)
    if (!fullPath) return undefined
    try {
      let svg = await fs.promises.readFile(fullPath, 'utf-8')
      const idx = svg.indexOf('<svg')
      if (idx > 0) svg = svg.slice(idx)
      return transformSvgFill(svg)
    } catch {
      return undefined
    }
  }
}

// ---------------------------------------------------------------------------
// Layout/theme safelist classes (SSOT: constants/size, constants/sizeScale)
// ---------------------------------------------------------------------------

function buildLayoutSafelistClasses(): string[] {
  const layout = LAYOUT_DIMENSION_KEYS.flatMap(k => [
    `w-${k}`,
    `h-${k}`,
    `min-w-${k}`,
    `max-w-${k}`,
    `min-h-${k}`,
    `max-h-${k}`,
    `md:w-${k}`,
  ])
  const padding = SIZE_SCALE_KEYS.flatMap(s => [
    `p-padding-${s}`,
    `px-padding-${s}`,
    `py-padding-${s}`,
    `pt-padding-${s}`,
    `pb-padding-${s}`,
    `pl-padding-${s}`,
    `pr-padding-${s}`,
    `md:px-padding-${s}`,
  ])
  const margin = SIZE_SCALE_KEYS.flatMap(s => [
    `m-margin-${s}`,
    `mx-margin-${s}`,
    `my-margin-${s}`,
    `mt-margin-${s}`,
    `mb-margin-${s}`,
    `ml-margin-${s}`,
    `mr-margin-${s}`,
  ])
  const marginGap = SIZE_SCALE_KEYS.flatMap(s => [
    `m-gap-${s}`,
    `mx-gap-${s}`,
    `my-gap-${s}`,
    `mt-gap-${s}`,
    `mb-gap-${s}`,
    `ml-gap-${s}`,
    `mr-gap-${s}`,
  ])
  const scrollMarginGap = SIZE_SCALE_KEYS.flatMap(s => [
    `scroll-m-gap-${s}`,
    `scroll-mx-gap-${s}`,
    `scroll-my-gap-${s}`,
    `scroll-mt-gap-${s}`,
    `scroll-mb-gap-${s}`,
    `scroll-ml-gap-${s}`,
    `scroll-mr-gap-${s}`,
  ])
  const gap = SIZE_SCALE_KEYS.map(s => `gap-${s}`)
  return [...layout, ...padding, ...margin, ...marginGap, ...scrollMarginGap, ...gap]
}

/** 阶梯尺寸类 (fs / text / rounded-scale / duration-scale / p-scale / m-scale / gap-scale)，供 size.vue / unocss.vue 等动态类名使用 */
function buildScaleSafelistClasses(): string[] {
  return SIZE_SCALE_KEYS.flatMap(k => [
    `fs-${k}`,
    `text-${k}`,
    `rounded-scale-${k}`,
    `duration-scale-${k}`,
    `p-scale-${k}`,
    `px-scale-${k}`,
    `py-scale-${k}`,
    `pt-scale-${k}`,
    `pb-scale-${k}`,
    `pl-scale-${k}`,
    `pr-scale-${k}`,
    `m-scale-${k}`,
    `mx-scale-${k}`,
    `my-scale-${k}`,
    `mt-scale-${k}`,
    `mb-scale-${k}`,
    `ml-scale-${k}`,
    `mr-scale-${k}`,
    `gap-scale-${k}`,
    `gap-x-scale-${k}`,
    `gap-y-scale-${k}`,
  ])
}

/** 基础变量类 (p-container-padding 等)，供 unocss.vue baseVars 等动态类名使用，SSOT: SIZE_BASE_VAR_KEYS */
function buildBaseVarSafelistClasses(): string[] {
  const list: string[] = []
  for (const key of SIZE_BASE_VAR_KEYS) {
    const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    list.push(
      `p-${kebab}`,
      `px-${kebab}`,
      `py-${kebab}`,
      `pt-${kebab}`,
      `pb-${kebab}`,
      `pl-${kebab}`,
      `pr-${kebab}`
    )
  }
  return list
}

/** 配色类 (bg/text/border)，供 theme.vue 等动态类名使用，SSOT: COLOR_FAMILIES */
function buildColorSafelistClasses(): string[] {
  const list: string[] = []
  for (const token of COLOR_FAMILIES.singleTokens) {
    list.push(`bg-${token}`, `text-${token}`)
    if (['border', 'input', 'ring'].includes(token)) list.push(`border-${token}`)
  }
  for (const family of COLOR_FAMILIES.pairFamilies) {
    list.push(`bg-${family}`, `text-${family}-foreground`, `border-${family}`)
  }
  for (const family of COLOR_FAMILIES.quadFamilies) {
    list.push(
      `bg-${family}`,
      `bg-${family}-hover`,
      `bg-${family}-light`,
      `text-${family}`,
      `text-${family}-foreground`,
      `text-${family}-hover-foreground`,
      `text-${family}-light-foreground`,
      `border-${family}`,
      `border-${family}-hover`,
      `border-${family}-light`
    )
  }
  // Sidebar：与 uno.config.ts buildThemeColors 一致
  list.push(
    'bg-sidebar',
    'bg-sidebar-foreground',
    'bg-sidebar-primary',
    'bg-sidebar-primary-foreground'
  )
  list.push(
    'bg-sidebar-accent',
    'bg-sidebar-accent-foreground',
    'border-sidebar-border',
    'border-sidebar-ring'
  )
  list.push(
    ...COLOR_FAMILIES.quadFamilies.flatMap(family =>
      [10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => `bg-${family}/${v}`)
    )
  )
  return list
}

const LAYOUT_SAFELIST_CLASSES = buildLayoutSafelistClasses()
const SCALE_SAFELIST_CLASSES = buildScaleSafelistClasses()
const BASE_VAR_SAFELIST_CLASSES = buildBaseVarSafelistClasses()
const COLOR_SAFELIST_CLASSES = buildColorSafelistClasses()

// ---------------------------------------------------------------------------
// Route icon name → UnoCSS class (与 Icons.vue iconClass 规则一致)
// ---------------------------------------------------------------------------

function toUnoIconClass(name: string): string {
  if (name.startsWith('i-')) return name
  return `i-${name.replace(':', '-')}`
}

// ---------------------------------------------------------------------------
// Exports for uno.config.ts
// ---------------------------------------------------------------------------

/**
 * 动态 safelist：路由/API 扫描到的图标 + 本地 i-custom:xxx + 示例页图标子集（Lucide/MDI/Logos 各取前 N + Custom 全量）+ 布局/尺寸类 + …
 * 仅使用子集以避免全量导致 OOM。
 */
export function getDynamicSafelist(): string[] {
  const routeIcons = getRouteMetaIcons().map(toUnoIconClass)
  const customIcons = getCustomIconClasses()
  const examplePageIcons = [
    ...getIconifyIconNamesSubset('lucide', ICON_SUBSET_LIMITS.lucide),
    ...getIconifyIconNamesSubset('mdi', ICON_SUBSET_LIMITS.mdi),
    ...getIconifyIconNamesSubset('logos', ICON_SUBSET_LIMITS.logos),
    ...customIcons,
  ]
  return [
    ...routeIcons,
    ...customIcons,
    ...examplePageIcons,
    ...LAYOUT_SAFELIST_CLASSES,
    ...SCALE_SAFELIST_CLASSES,
    ...BASE_VAR_SAFELIST_CLASSES,
    ...COLOR_SAFELIST_CLASSES,
  ]
}

/**
 * 自定义图标集合：仅 collection `custom`，从 src/assets/icons 下所有 .svg 加载，并注入 fill="currentColor"
 * 子目录会映射为 name：如 custom/juejin.svg → i-custom:custom-juejin
 */
export function getPresetIconsCollections(): Record<string, CustomIconLoader> {
  if (!fs.existsSync(ICONS_DIR)) return {}
  const pathMap = getCustomIconPathMap()
  if (pathMap.size === 0) return {}
  return {
    custom: createCustomIconLoader(),
  }
}
