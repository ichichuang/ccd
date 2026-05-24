import fs from 'node:fs'
import path from 'node:path'
import { globSync } from 'glob'
import ts from 'typescript'

import { SIZE_SCALE_KEYS, type SizeScaleKey } from '@ccd/design-tokens'
import { COLOR_FAMILIES } from '@ccd/design-tokens'
import { semanticShortcuts } from '../shortcuts/semanticShortcuts.js'

/** 布局/设置等处的 Lucide 图标名（非路由 meta 扫描可达时仍需 safelist） */
const ENGINE_ICON_SAFELIST_CLASSES: readonly string[] = [
  'i-lucide-circle-dot',
  'i-lucide-panel-left',
  'i-lucide-diamond',
  'i-lucide-sun-moon',
  'i-lucide-sun',
  'i-lucide-moon',
  'i-lucide-sparkles',
  'i-lucide-minimize-2',
]

// ---------------------------------------------------------------------------
// Icon safelist & custom preset collections (moved from `build/uno-icons.ts`)
// ---------------------------------------------------------------------------

const defaultProjectRoot = process.cwd()

function isWebAppRoot(candidate: string): boolean {
  return (
    fs.existsSync(path.join(candidate, 'src/assets/icons')) ||
    fs.existsSync(path.join(candidate, 'src/router'))
  )
}

function resolveProjectRoot(root?: string): string {
  const base = path.resolve(root ?? defaultProjectRoot)
  const candidates = [base, path.resolve(base, 'apps/web-demo')]
  return candidates.find(isWebAppRoot) ?? candidates[1]
}

let projectRoot = resolveProjectRoot()

let ICONS_DIR = path.join(projectRoot, 'src/assets/icons')

export interface CcdUnoPresetProjectOptions {
  root?: string
}

export function configureCcdUnoPresetProject(options: CcdUnoPresetProjectOptions = {}): void {
  projectRoot = resolveProjectRoot(options.root)
  ICONS_DIR = path.join(projectRoot, 'src/assets/icons')
  invalidateIconCaches('all')
}

type IconCacheTarget = 'route' | 'custom'

interface CacheEntry<T> {
  key: string
  value: T
}

export type CustomIconLoader = (name: string) => string | undefined | Promise<string | undefined>

let routeIconsCache: CacheEntry<string[]> | null = null
let customIconsCache: CacheEntry<string[]> | null = null

export function invalidateIconCaches(target: IconCacheTarget | 'all' = 'all'): void {
  if (target === 'route' || target === 'all') routeIconsCache = null
  if (target === 'custom' || target === 'all') customIconsCache = null
}

function isValidIconName(iconName: string): boolean {
  if (!iconName || iconName.length === 0 || iconName.length > 80) return false
  if (/^\d+$/.test(iconName)) return false
  if (/\s/.test(iconName)) return false
  return /^(i-[a-z0-9][a-z0-9:_-]*|custom:[a-z0-9][a-z0-9_-]*|[a-z]+:[a-z0-9][a-z0-9_-]*)$/i.test(
    iconName
  )
}

function getRouteIconSourceFiles(dir: string): string[] {
  const fullDir = path.join(projectRoot, dir)
  if (!fs.existsSync(fullDir)) return []

  return globSync('**/*.{ts,tsx}', {
    cwd: fullDir,
    nodir: true,
    absolute: true,
    ignore: ['**/*.d.ts', '**/*.spec.ts', '**/*.test.ts'],
  })
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

function getPropertyName(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text
  }
  return null
}

function collectIconLiteralsFromSource(filePath: string, content: string): string[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )
  const icons = new Set<string>()

  const visit = (node: ts.Node): void => {
    if (
      ts.isPropertyAssignment(node) &&
      getPropertyName(node.name) === 'icon' &&
      (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))
    ) {
      const name = node.initializer.text.trim()
      if (isValidIconName(name)) icons.add(name)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return Array.from(icons)
}

export function getRouteMetaIcons(): string[] {
  const routerDir = path.join(projectRoot, 'src/router')
  const apiDir = path.join(projectRoot, 'src/api')
  const files: string[] = []

  if (fs.existsSync(routerDir)) files.push(...getRouteIconSourceFiles('src/router'))
  if (fs.existsSync(apiDir)) files.push(...getRouteIconSourceFiles('src/api'))

  const cacheKey = createCacheKey(files)
  if (routeIconsCache && routeIconsCache.key === cacheKey) return routeIconsCache.value

  const icons = new Set<string>()
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      collectIconLiteralsFromSource(filePath, content).forEach(icon => icons.add(icon))
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

/** Dynamic size demo helpers compose only `p-${key}` / `m-${key}` at runtime. */
function buildDynamicSizeDemoSafelist(): string[] {
  return ['p-0', 'm-0', ...SIZE_SCALE_KEYS.flatMap(k => [`p-${k}`, `m-${k}`])]
}

/** Theme docs bind `bg-${family}/10 text-${family}` from COLOR_FAMILIES.quadFamilies. */
function buildDynamicThemeDemoSafelist(): string[] {
  return COLOR_FAMILIES.quadFamilies.flatMap(family => [`bg-${family}/10`, `text-${family}`])
}

const DYNAMIC_SIZE_DEMO_SAFELIST_CLASSES = buildDynamicSizeDemoSafelist()
const DYNAMIC_THEME_DEMO_SAFELIST_CLASSES = buildDynamicThemeDemoSafelist()

const SHELL_CHROME_COLOR_SAFELIST_CLASSES: readonly string[] = [
  'bg-primary',
  'bg-primary/14',
  'bg-primary/12',
  'bg-primary/10',
  'bg-primary/8',
  'bg-primary/5',
  'text-primary',
  'text-primary-foreground',
  'text-current',
  'bg-popover',
  'bg-popover/95',
  'w-max',
  'max-w-5xl',
  'text-popover-foreground',
  'border-border',
  'border-primary/15',
  'hover:bg-primary',
  'hover:bg-primary/14',
  'hover:bg-primary/10',
  'hover:bg-primary/8',
  'hover:text-primary',
  'hover:text-primary-foreground',
  'focus:bg-primary/10',
  'focus:text-primary',
  'focus-visible:ring-primary/40',
  'focus-visible:ring-offset-background',
  'focus-visible:ring-offset-popover',
  'group-hover:text-primary',
  'hover:bg-danger/12',
  'hover:text-danger',
  'shadow-lg',
  'bg-sidebar-primary',
  'bg-sidebar-primary/15',
  'bg-sidebar-primary/12',
  'bg-sidebar-primary/10',
  'bg-sidebar-primary/8',
  'bg-sidebar-primary/5',
  'hover:bg-sidebar-primary/12',
  'hover:bg-sidebar-primary/5',
  'text-sidebar-primary',
  'hover:text-sidebar-primary',
  'text-sidebar-primary-foreground',
  'text-white',
  'border-sidebar-primary',
]

const PRIMEVUE_FORM_COLOR_SAFELIST_CLASSES: readonly string[] = [
  'bg-background',
  'text-foreground',
  'border-border',
  'hover:border-primary-hover',
  'focus-within:border-primary',
  'bg-popover',
  'text-popover-foreground',
  'text-muted-foreground',
]

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

function getDynamicSafelist(): string[] {
  const routeIcons = getRouteMetaIcons().map(toUnoIconClass)
  const customIcons = getCustomIconClasses()

  return [
    ...routeIcons,
    ...customIcons,
    ...ENGINE_ICON_SAFELIST_CLASSES,
    ...DYNAMIC_SIZE_DEMO_SAFELIST_CLASSES,
    ...DYNAMIC_THEME_DEMO_SAFELIST_CLASSES,
    ...SHELL_CHROME_COLOR_SAFELIST_CLASSES,
    ...PRIMEVUE_FORM_COLOR_SAFELIST_CLASSES,
    ...SEMANTIC_SHORTCUTS_SAFELIST_CLASSES,
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
  return getDynamicSafelist()
}

// Keep file-local export surface minimal for engine usage.
// Build plugins may also import the following identifiers.
export type { SizeScaleKey }
