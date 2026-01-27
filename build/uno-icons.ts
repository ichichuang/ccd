/**
 * UnoCSS 动态图标 safelist 与自定义图标集（供 uno.config.ts 与 build/plugins 使用）
 * - 扫描 router/api 中的 icon 字符串，纳入 safelist
 * - 本地 SVG 统一为 collection `custom`（src/assets/icons/*.svg），注入 fill="currentColor"
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { globSync } from 'glob'

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
// Invalid icon names (filter false positives from route/api scan)
// ---------------------------------------------------------------------------

const invalidIcons = new Set<string>([
  'return',
  'if',
  'else',
  'case',
  'switch',
  'for',
  'while',
  'do',
  'break',
  'continue',
  'function',
  'const',
  'let',
  'var',
  'class',
  'extends',
  'import',
  'export',
  'default',
  'try',
  'catch',
  'finally',
  'throw',
  'new',
  'this',
  'super',
  'static',
  'async',
  'await',
  'interface',
  'type',
  'enum',
  'namespace',
  'module',
  'declare',
  'public',
  'private',
  'protected',
  'readonly',
  'abstract',
  'implements',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'Tab',
  'Newline',
  'Return',
  'Space',
  'Enter',
  'Escape',
  'Backspace',
  'text',
  'value',
  'label',
  'name',
  'id',
  'key',
  'index',
  'item',
  'list',
  'array',
  'object',
  'string',
  'number',
  'boolean',
  'data',
  'props',
  'methods',
  'computed',
  'watch',
  'created',
  'mounted',
  'updated',
  'destroyed',
  'setup',
  'ref',
  'reactive',
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
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '<',
  '>',
  '/',
  '\\',
  '|',
  '`',
  '~',
  '+',
  '=',
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
// Layout/theme safelist classes (used by UnoCSS)
// ---------------------------------------------------------------------------

const LAYOUT_SAFELIST_CLASSES: string[] = [
  'w-sidebarWidth',
  'w-sidebarCollapsedWidth',
  'h-headerHeight',
  'h-breadcrumbHeight',
  'h-footerHeight',
  'h-tabsHeight',
  'h-contentHeight',
  'h-contentBreadcrumbHeight',
  'h-contentTabsHeight',
  'h-contentsBreadcrumbHeight',
  'h-contentsTabsHeight',
  'p-padding',
  'p-paddings',
  'px-paddingx',
  'px-padding',
  'py-paddings',
  'py-padding',
  'p-paddingl',
  'gap-gap',
  'gap-gaps',
  'gap-gapx',
  'gap-gapl',
  'rounded-rounded',
  'fs-appFontSize',
  'fs-appFontSizes',
  'fs-appFontSizex',
  'fs-appFontSizel',
  'md:w-sidebarWidth',
  'md:w-sidebarCollapsedWidth',
  'md:px-padding',
]

// ---------------------------------------------------------------------------
// Exports for uno.config.ts
// ---------------------------------------------------------------------------

/**
 * 动态 safelist：路由/API 扫描到的图标 + 本地 i-custom:xxx + 布局/主题类
 */
export function getDynamicSafelist(): string[] {
  const routeIcons = getRouteMetaIcons()
  const customIcons = getCustomIconClasses()
  return [...routeIcons, ...customIcons, ...LAYOUT_SAFELIST_CLASSES]
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
