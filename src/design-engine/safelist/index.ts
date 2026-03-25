import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { globSync } from 'glob'

import { LAYOUT_DIMENSION_KEYS, SIZE_BASE_VAR_KEYS } from '../../constants/size'
import { SIZE_SCALE_KEYS, type SizeScaleKey } from '../../constants/sizeScale'
import { COLOR_FAMILIES } from '../../utils/theme/metadata'
import { semanticShortcuts } from '../shortcuts/semanticShortcuts'

/** 布局/设置等处的 Lucide 图标名（非路由 meta 扫描可达时仍需 safelist） */
const ENGINE_ICON_SAFELIST_CLASSES: readonly string[] = [
  'i-lucide-circle-dot',
  'i-lucide-panel-left',
  'i-lucide-diamond',
  'i-lucide-sun-moon',
  'i-lucide-sparkles',
  'i-lucide-minimize-2',
]

// ---------------------------------------------------------------------------
// Icon safelist & custom preset collections (moved from `build/uno-icons.ts`)
// ---------------------------------------------------------------------------

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(currentDir, '..', '..', '..')

const ICONS_DIR = path.join(projectRoot, 'src/assets/icons')

type IconCacheTarget = 'route' | 'custom'

interface CacheEntry<T> {
  key: string
  value: T
}

export type CustomIconLoader = ReturnType<typeof FileSystemIconLoader>

let routeIconsCache: CacheEntry<string[]> | null = null
let customIconsCache: CacheEntry<string[]> | null = null

const iconifyJsonCache = new Map<string, IconifyIconsJson>()

export function invalidateIconCaches(target: IconCacheTarget | 'all' = 'all'): void {
  if (target === 'route' || target === 'all') routeIconsCache = null
  if (target === 'custom' || target === 'all') customIconsCache = null
}

interface IconifyIconsJson {
  prefix?: string
  icons?: Record<string, unknown>
}

type IconifyCollectionName = 'lucide' | 'logos' | 'solar' | 'ph'

const _require = createRequire(import.meta.url)

export function getIconifyIconNames(collectionName: IconifyCollectionName): string[] {
  try {
    if (iconifyJsonCache.has(collectionName)) {
      const iconSet = iconifyJsonCache.get(collectionName)!
      return Object.keys(iconSet.icons ?? {}).map(
        name => `i-${iconSet.prefix ?? collectionName}-${name}`
      )
    }

    const iconSet = _require(`@iconify-json/${collectionName}/icons.json`) as IconifyIconsJson
    iconifyJsonCache.set(collectionName, iconSet)
    const prefix = iconSet.prefix ?? collectionName
    const icons = iconSet.icons ?? {}
    return Object.keys(icons).map(name => `i-${prefix}-${name}`)
  } catch (err) {
    console.warn(`[design-engine/safelist] Failed to load @iconify-json/${collectionName}:`, err)
    return []
  }
}

const ICON_SUBSET_LIMITS_DEV: Record<IconifyCollectionName, number> = {
  lucide: 300,
  logos: 80,
  solar: 300,
  ph: 300,
}

const ICON_SUBSET_LIMITS_PROD: Record<IconifyCollectionName, number> = {
  lucide: 150,
  logos: 60,
  solar: 150,
  ph: 150,
}

const isProdEnv = process.env.NODE_ENV === 'production'

export const ICON_SUBSET_LIMITS = (
  isProdEnv ? ICON_SUBSET_LIMITS_PROD : ICON_SUBSET_LIMITS_DEV
) as {
  readonly lucide: number
  readonly logos: number
  readonly solar: number
  readonly ph: number
}

export function getIconifyIconNamesSubset(
  collectionName: IconifyCollectionName,
  limit: number
): string[] {
  return getIconifyIconNames(collectionName).slice(0, limit)
}

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

export function getRouteMetaIcons(): string[] {
  const routerDir = path.join(projectRoot, 'src/router')
  const apiDir = path.join(projectRoot, 'src/api')
  const files: string[] = []

  if (fs.existsSync(routerDir)) files.push(...getTsAndVueFiles('src/router'))
  if (fs.existsSync(apiDir)) files.push(...getTsAndVueFiles('src/api'))

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

function transformSvgFill(svg: string): string {
  return svg.replace(/<svg\s/, '<svg fill="currentColor" ')
}

function getCustomIconPathMap(): Map<string, string> {
  const map = new Map<string, string>()
  try {
    if (!fs.existsSync(ICONS_DIR)) return map
    const files = globSync('**/*.svg', { cwd: ICONS_DIR, nodir: true })
    for (const rel of files) {
      const fullPath = path.join(ICONS_DIR, rel)
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

export function getCustomIconClasses(): string[] {
  if (customIconsCache) return customIconsCache.value
  const map = getCustomIconPathMap()
  const classes = Array.from(map.keys(), k => `i-custom:${k}`)
  customIconsCache = { key: `${map.size}`, value: classes }
  return classes
}

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
    `p-${s}`,
    `px-${s}`,
    `py-${s}`,
    `pt-${s}`,
    `pb-${s}`,
    `pl-${s}`,
    `pr-${s}`,
    `md:px-${s}`,
  ])

  const margin = SIZE_SCALE_KEYS.flatMap(s => [
    `m-${s}`,
    `mx-${s}`,
    `my-${s}`,
    `mt-${s}`,
    `mb-${s}`,
    `ml-${s}`,
    `mr-${s}`,
  ])

  const scrollMarginGap = SIZE_SCALE_KEYS.flatMap(s => [
    `scroll-m-${s}`,
    `scroll-mx-${s}`,
    `scroll-my-${s}`,
    `scroll-mt-${s}`,
    `scroll-mb-${s}`,
    `scroll-ml-${s}`,
    `scroll-mr-${s}`,
  ])

  const gap = SIZE_SCALE_KEYS.map(s => `gap-${s}`)
  return Array.from(new Set([...layout, ...padding, ...margin, ...scrollMarginGap, ...gap]))
}

function buildScaleSafelistClasses(): string[] {
  const classes = SIZE_SCALE_KEYS.flatMap(k => [
    `fs-${k}`,
    `text-${k}`,
    `rounded-${k}`,
    `rounded-t-${k}`,
    `rounded-b-${k}`,
    `rounded-l-${k}`,
    `rounded-r-${k}`,
    `rounded-tl-${k}`,
    `rounded-tr-${k}`,
    `rounded-bl-${k}`,
    `rounded-br-${k}`,
    `duration-${k}`,
    `p-${k}`,
    `px-${k}`,
    `py-${k}`,
    `pt-${k}`,
    `pb-${k}`,
    `pl-${k}`,
    `pr-${k}`,
    `m-${k}`,
    `mx-${k}`,
    `my-${k}`,
    `mt-${k}`,
    `mb-${k}`,
    `ml-${k}`,
    `mr-${k}`,
    `gap-${k}`,
    `gap-x-${k}`,
    `gap-y-${k}`,
  ])
  return Array.from(new Set(classes))
}

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

  // Sidebar (keep aligned with theme generation / color mapping)
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

  return list
}

const LAYOUT_SAFELIST_CLASSES = buildLayoutSafelistClasses()
const SCALE_SAFELIST_CLASSES = buildScaleSafelistClasses()
const BASE_VAR_SAFELIST_CLASSES = buildBaseVarSafelistClasses()
const COLOR_SAFELIST_CLASSES = buildColorSafelistClasses()

/** Semantic shortcut names from design-engine SSOT — prevents tree-shaking of macro classes. */
function buildSemanticShortcutsSafelist(): string[] {
  const out = new Set<string>(Object.keys(semanticShortcuts))

  ;['gap-x-sm', 'gap-x-md', 'gap-x-lg', 'gap-y-sm', 'gap-y-md', 'gap-y-lg'].forEach(c => out.add(c))
  ;['m-md', 'scroll-m-lg'].forEach(c => out.add(c))

  return Array.from(out)
}

const SEMANTIC_SHORTCUTS_SAFELIST_CLASSES = buildSemanticShortcutsSafelist()

function toUnoIconClass(name: string): string {
  if (name.startsWith('i-')) return name
  if (name.startsWith('custom:')) return `i-${name}`
  return `i-${name.replace(':', '-')}`
}

function getDynamicSafelist(isDemo: boolean): string[] {
  const routeIcons = getRouteMetaIcons().map(toUnoIconClass)
  const customIcons = getCustomIconClasses()

  const examplePageIcons = isDemo
    ? [
        ...getIconifyIconNamesSubset('lucide', ICON_SUBSET_LIMITS.lucide),
        ...getIconifyIconNamesSubset('solar', ICON_SUBSET_LIMITS.solar),
        ...getIconifyIconNamesSubset('ph', ICON_SUBSET_LIMITS.ph),
        ...getIconifyIconNamesSubset('logos', ICON_SUBSET_LIMITS.logos),
        ...customIcons,
      ]
    : []

  const menuVisualSafelist = [
    'bg-primary!',
    'text-primary-foreground!',
    'bg-primary/30!',
    'bg-primary/20!',
    'bg-primary/10!',
    'text-primary!',
    'text-current!',
    'dark:text-white!',
    'border-danger/50',
    'border-primary/20',
    'border-primary/30',
    'border-primary/50',
    'dark:bg-primary-light',
    'dark:border-primary/50',
    'bg-info/10',
    'hover:bg-sidebar-accent/50',
    'hover:bg-danger-light',
    'hover:bg-primary-light',
    'hover:bg-success-light',
    'hover:bg-info-light',
    'hover:bg-warn-light',
    'hover:bg-help-light',
    'bg-danger/10',
    'bg-primary/5',
  ]

  return [
    ...routeIcons,
    ...customIcons,
    ...examplePageIcons,
    ...ENGINE_ICON_SAFELIST_CLASSES,
    ...LAYOUT_SAFELIST_CLASSES,
    ...SCALE_SAFELIST_CLASSES,
    ...BASE_VAR_SAFELIST_CLASSES,
    ...COLOR_SAFELIST_CLASSES,
    ...SEMANTIC_SHORTCUTS_SAFELIST_CLASSES,
    ...menuVisualSafelist,
  ]
}

export function getPresetIconsCollections(): Record<string, CustomIconLoader> {
  if (!fs.existsSync(ICONS_DIR)) return {}
  const pathMap = getCustomIconPathMap()
  if (pathMap.size === 0) return {}

  return {
    custom: createCustomIconLoader(),
  }
}

/** 主题演示页 Alpha 阶梯已改为内联 `rgb(var(--*) / α)`，不再合并数百条 demo 类名。 */
export function getEngineSafelist(): string[] {
  return getDynamicSafelist(true)
}

// Keep file-local export surface minimal for engine usage.
// Build plugins may also import the following identifiers.
export type { SizeScaleKey }
