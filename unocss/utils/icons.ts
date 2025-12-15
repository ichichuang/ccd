import fs from 'fs'
import * as glob from 'glob'
import path from 'node:path'

const { globSync } = glob

type IconCacheTarget = 'route' | 'custom'

interface CacheEntry<T> {
  key: string
  value: T
}

let routeIconsCache: CacheEntry<string[]> | null = null
let customIconsCache: CacheEntry<Record<string, string[]>> | null = null

/**
 * 失效缓存（供 Vite 插件调用，或在需要时手动清理）
 */
export function invalidateIconCaches(target: IconCacheTarget | 'all' = 'all') {
  if (target === 'route' || target === 'all') {
    routeIconsCache = null
  }
  if (target === 'custom' || target === 'all') {
    customIconsCache = null
  }
}

/**
 * 获取TypeScript文件中的图标引用
 * 优化：更严格的图标名称验证和过滤
 */
export function getRouteMetaIcons(): string[] {
  const files = [...getTsFiles('src/router/modules'), ...getTsFiles('src/api/modules')]
  const cacheKey = createCacheKey(files)

  if (routeIconsCache && routeIconsCache.key === cacheKey) {
    return routeIconsCache.value
  }

  const icons = new Set<string>()

  // 更精确的正则表达式匹配图标
  const iconPatterns = [
    // 匹配 meta: { icon: 'icon-name' }
    /meta\s*:\s*\{[^}]*icon\s*:\s*['"]([^'"]+)['"]/g,
    // 匹配 meta.icon = 'icon-name'
    /meta\.icon\s*=\s*['"]([^'"]+)['"]/g,
    // 匹配 icon: 'icon-name'（单独的属性）
    /(?:^|\s|,)icon\s*:\s*['"]([^'"]+)['"]/g,
  ]

  // 扩展无效图标名称列表
  const invalidIcons = new Set([
    // JavaScript 关键字
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

    // TypeScript 关键字
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
    'extends',

    // 常见的非图标字符串
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
    'No-break',
    'space',
    'Byte',
    'Order',
    'Mark',
    'Line',
    'Separator',
    'trimmed',
    'undefined',
    'null',
    'true',
    'false',

    // 常见的变量名和方法名
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
    'computed',

    // 其他可能的干扰字符串
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

    // 单字符
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',

    // 特殊字符
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
  ])

  /**
   * 验证图标名称是否有效
   * @param iconName 图标名称
   * @returns 是否有效
   */
  function isValidIconName(iconName: string): boolean {
    // 基本长度检查
    if (!iconName || iconName.length === 0 || iconName.length > 50) {
      return false
    }

    // 检查是否在无效列表中
    if (invalidIcons.has(iconName)) {
      return false
    }

    // 检查是否为纯数字
    if (/^\d+$/.test(iconName)) {
      return false
    }

    // 检查是否包含空白字符
    if (/\s/.test(iconName)) {
      return false
    }

    // 检查是否只包含有效字符（字母、数字、中划线、下划线、冒号）
    if (!/^[a-zA-Z0-9\-_:]+$/.test(iconName)) {
      return false
    }

    // 检查是否以字母开头（图标名通常以字母开头）
    if (!/^[a-zA-Z]/.test(iconName)) {
      return false
    }

    return true
  }

  files.forEach((filePath: string) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')

      // 移除注释，避免从注释中提取图标名
      const cleanContent = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
        .replace(/\/\/.*$/gm, '') // 移除行注释

      iconPatterns.forEach(pattern => {
        let match
        // 重置正则表达式的 lastIndex
        pattern.lastIndex = 0

        while ((match = pattern.exec(cleanContent))) {
          const iconName = match[1]?.trim()

          if (iconName && isValidIconName(iconName)) {
            icons.add(iconName)
          }
        }
      })
    } catch (error) {
      console.warn(`Failed to read file: ${filePath}`, error)
    }
  })

  const result = Array.from(icons)

  // 开发环境下静默输出找到的图标数量（仅在调试模式下显示详细信息）
  if (process.env.NODE_ENV === 'development' && process.env.VITE_DEBUG === 'true') {
    console.log(
      `[UnoCSS] Found ${result.length} valid icons:`,
      result.slice(0, 10),
      result.length > 10 ? '...' : ''
    )
  }

  routeIconsCache = {
    key: cacheKey,
    value: result,
  }

  return routeIconsCache.value
}

/**
 * 获取TypeScript文件列表
 */
function getTsFiles(dir: string): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  function traverse(currentPath: string) {
    try {
      const items = fs.readdirSync(currentPath, { withFileTypes: true })

      items.forEach(item => {
        const fullPath = path.join(currentPath, item.name)

        if (item.isDirectory()) {
          traverse(fullPath)
        } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.vue'))) {
          files.push(fullPath)
        }
      })
    } catch (error) {
      console.warn(`Failed to read directory: ${currentPath}`, error)
    }
  }

  traverse(dir)
  return files
}

function createCacheKey(files: string[]): string {
  if (files.length === 0) {
    return 'empty'
  }

  const latestMtime = files.reduce((latest, filePath) => {
    try {
      const stats = fs.statSync(filePath)
      return Math.max(latest, stats.mtimeMs)
    } catch {
      return latest
    }
  }, 0)

  return `${files.length}-${latestMtime}`
}

/**
 * 获取自定义图标配置
 * 自动扫描 src/assets/icons 文件夹下的所有图标集
 * @returns 返回图标集名称和对应的图标类名列表
 */
export function getCustomIcons(): Record<string, string[]> {
  // 检查缓存
  if (customIconsCache) {
    return customIconsCache.value
  }

  const icons: Record<string, string[]> = {}

  try {
    const files = globSync('src/assets/icons/**/*.svg', { nodir: true })

    files.forEach((filePath: string) => {
      const fileName = path.basename(filePath) // 获取文件名，包括后缀
      const fileNameWithoutExt = path.parse(fileName).name // 获取去除后缀的文件名
      const folderName = path.basename(path.dirname(filePath)) // 获取文件夹名

      if (!icons[folderName]) {
        icons[folderName] = []
      }
      icons[folderName].push(`i-${folderName}:${fileNameWithoutExt}`)
    })

    // 缓存结果
    customIconsCache = {
      key: `${files.length}-${Date.now()}`,
      value: icons,
    }
  } catch (error) {
    console.warn('[UnoCSS] Failed to scan custom icons:', error)
  }

  return icons
}

/**
 * 获取自定义图标的类名列表（用于 safelist）
 */
export function getCustomIconClasses(): string[] {
  const icons = getCustomIcons()
  return Object.values(icons).flat()
}

/**
 * 获取动态安全列表
 */
export function getDynamicSafelist() {
  const routeMetaIcons = getRouteMetaIcons()
  const customIconClasses = getCustomIconClasses()

  return [
    // 功能色相关 - 基础主题色
    'bg-primary100',
    'bg-primary200',
    'bg-primary300',
    'text-text100',
    'text-text200',
    'bg-bg100',
    'bg-bg200',
    'bg-bg300',

    // 主题相关 - 已删除不存在的变量

    // 功能色相关 - 基础颜色
    'text-primaryColor',
    'text-secondaryColor',
    'text-successColor',
    'text-infoColor',
    'text-warnColor',
    'text-helpColor',
    'text-dangerColor',
    'text-contrastColor',

    'bg-primaryColor',
    'bg-secondaryColor',
    'bg-successColor',
    'bg-infoColor',
    'bg-warnColor',
    'bg-helpColor',
    'bg-dangerColor',
    'bg-contrastColor',

    // 功能色相关 - 文本颜色
    'text-primaryTextColor',
    'text-secondaryTextColor',
    'text-successTextColor',
    'text-infoTextColor',
    'text-warnTextColor',
    'text-helpTextColor',
    'text-dangerTextColor',
    'text-contrastTextColor',

    // 功能色相关 - 边框颜色
    'border-primaryBorderColor',
    'border-secondaryBorderColor',
    'border-successBorderColor',
    'border-infoBorderColor',
    'border-warnBorderColor',
    'border-helpBorderColor',
    'border-dangerBorderColor',
    'border-contrastBorderColor',

    // 悬停状态
    'hover:bg-primaryHoverColor',
    'hover:bg-secondaryHoverColor',
    'hover:bg-successHoverColor',
    'hover:bg-infoHoverColor',
    'hover:bg-warnHoverColor',
    'hover:bg-helpHoverColor',
    'hover:bg-dangerHoverColor',
    'hover:bg-contrastHoverColor',

    // 激活状态
    'active:bg-primaryActiveColor',
    'active:bg-secondaryActiveColor',
    'active:bg-successActiveColor',
    'active:bg-infoActiveColor',
    'active:bg-warnActiveColor',
    'active:bg-helpActiveColor',
    'active:bg-dangerActiveColor',
    'active:bg-contrastActiveColor',

    // 禁用状态
    'disabled:bg-primaryDisabledColor',
    'disabled:bg-secondaryDisabledColor',
    'disabled:bg-successDisabledColor',
    'disabled:bg-infoDisabledColor',
    'disabled:bg-warnDisabledColor',
    'disabled:bg-helpDisabledColor',
    'disabled:bg-dangerDisabledColor',
    'disabled:bg-contrastDisabledColor',

    // 布局快捷方式 - 确保 VSCode 插件能识别
    'full',
    'container',
    'screen',
    'center',
    'between',
    'around',
    'evenly',
    'start',
    'end',
    'center-col',
    'between-col',
    'evenly-col',
    'around-col',
    'start-col',
    'end-col',
    'center-start',
    'between-start',
    'center-end',
    'between-end',
    'grid-center',

    // 样式快捷方式 - 确保 VSCode 插件能识别
    'c-cp',
    'c-border',
    'c-border-primary',
    'c-border-accent',
    'c-border-danger',
    'c-border-success',
    'c-border-warning',
    'c-shadow',
    'c-shadow-primary',
    'c-shadow-accent',
    'c-shadow-danger',
    'c-shadow-success',
    'c-shadow-warning',
    'c-transitions',
    'c-transition',
    'c-transitionx',
    'c-transitionl',
    'c-card',
    'c-card-accent',
    'c-card-accent-active',
    'c-card-primary',
    'c-card-primary-active',
    'c-card-danger',
    'c-card-danger-active',
    'c-card-success',
    'c-card-success-active',
    'c-card-warning',
    'c-card-warning-active',

    // 文本快捷方式 - 确保 VSCode 插件能识别
    'text-ellipsis',
    'text-primary',
    'text-success',
    'text-warn',
    'text-danger',
    'text-info',
    'text-contrast',

    // 主题变量规则 - 常用尺寸类名（从 themeRules.ts 生成）
    'w-sidebarWidth',
    'w-sidebarCollapsedWidth',
    'h-headerHeight',
    'h-breadcrumbHeight',
    'h-footerHeight',
    'h-tabsHeight',
    'h-contentHeight',
    'h-contentBreadcrumbHeight',
    'h-contentTabsHeight',
    'h-contentsHeight',
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

    // 响应式类名
    'md:block',
    'md:w-sidebarWidth',
    'md:w-sidebarCollapsedWidth',
    'md:px-padding',
    'md:px0',
    'sm:hidden',

    // 颜色相关
    'color-text100',
    'color-text200',
    'color-primary100',
    'color-primary200',
    'color-primary300',
    'color-primary400',
    'color-accent100',
    'color-accent200',
    'border-tm',
    'border-color-accent100',
    'border-color-primary100',

    ...routeMetaIcons,
    ...customIconClasses,
  ]
}
