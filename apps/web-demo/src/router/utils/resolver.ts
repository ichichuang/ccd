/**
 * 组件路径解析：Vite glob 与视图组件解析
 * 职责：根据后端 component 字符串解析并加载实际组件，不涉及路由树或菜单逻辑。
 */

import { appLogger } from '@/adapters/logger.adapter'

const modules = import.meta.glob<() => Promise<unknown>>('@/views/**/*.{vue,tsx}')

/** 404 落页组件路径（与 import.meta.glob 的 key 一致：Vite 解析 @ 为 /src） */
const FALLBACK_404_KEY = '/src/views/notfound/404.vue'

/**
 * 根据路由 path 生成稳定的名称
 * 例如：'/' -> 'Index', '/system/user' -> 'SystemUser', '/user/:id/edit' -> 'UserIdEdit'
 */
export function generateNameByPath(path: string): string {
  if (!path || path === '/') return 'Index'

  let name = path.replace(/^\//, '')
  name = name.replace(/\/:/g, '-')
  name = name.replace(/\//g, '-')

  const pascal = name
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  return pascal || 'Unknown'
}

/** 返回 404 落页组件加载器，若 key 不存在则返回 noop 占位避免路由线程崩溃 */
function getFallbackLoader(): () => Promise<unknown> {
  const loader = modules[FALLBACK_404_KEY]
  if (typeof loader === 'function') return loader
  return () => Promise.resolve(null)
}

/**
 * 根据后端 component 字符串获取实际组件
 * 解析失败时返回 404 落页，不抛出异常以保证路由线程不崩溃
 * @param componentName 例如 'login'、'permission-page'
 */
export function loadView(componentName: string): () => Promise<unknown> {
  try {
    const supportedExtensions = ['.vue', '.tsx', '.jsx']
    const componentPath = parseComponentPath(componentName)
    const matchedComponent = findComponentFile(componentPath, supportedExtensions)

    if (matchedComponent) {
      return matchedComponent
    }

    appLogger.error(`🪒-Router: ❌ 组件未找到: ${componentName}`)
    appLogger.error(`🪒-Router: 🔍 尝试的路径: ${componentPath.join(', ')}`)
    appLogger.error(`🪒-Router: 📁 可用的模块:`, Object.keys(modules))
  } catch (_e) {
    appLogger.error(`🪒-Router: loadView 解析异常，使用 404 落页: ${componentName}`)
  }

  return getFallbackLoader()
}

/**
 * 解析组件路径，支持多种命名规范
 */
function parseComponentPath(componentName: string): string[] {
  const paths: string[] = []

  if (componentName.startsWith('@')) {
    const [module, ...rest] = componentName.split('/')
    const moduleName = module.substring(1)
    if (rest.length > 0) {
      paths.push(`/src/views/${moduleName}/views/${rest.join('/')}`)
    } else {
      paths.push(`/src/views/${moduleName}/index`)
    }
  } else if (componentName.includes('/')) {
    paths.push(`/src/views/${componentName}`)
  } else if (componentName.includes('-')) {
    const [firstPart] = componentName.split('-')
    paths.push(`/src/views/${firstPart}/views/${componentName}`)
  } else {
    paths.push(`/src/views/${componentName}/index`)
  }

  return paths
}

function findComponentFile(
  possiblePaths: string[],
  extensions: string[]
): (() => Promise<unknown>) | null {
  for (const basePath of possiblePaths) {
    for (const ext of extensions) {
      const fullPath: string = `${basePath}${ext}`
      if (modules[fullPath]) {
        return modules[fullPath]
      }
    }
  }
  return null
}

export function validateComponentFile(componentName: string): {
  exists: boolean
  foundPath: string | null
  possiblePaths: string[]
  availableModules: string[]
} {
  const supportedExtensions = ['.vue', '.tsx', '.jsx']
  const componentPath = parseComponentPath(componentName)
  const matchedComponent = findComponentFile(componentPath, supportedExtensions)
  const availableModules = Object.keys(modules)
  const foundPath = matchedComponent
    ? availableModules.find(path => modules[path] === matchedComponent) || null
    : null

  return {
    exists: !!matchedComponent,
    foundPath,
    possiblePaths: componentPath.flatMap(path => supportedExtensions.map(ext => `${path}${ext}`)),
    availableModules,
  }
}

export function getAvailableComponentPaths(): string[] {
  return Object.keys(modules)
}

export function isUsingFallbackComponent(component: unknown): boolean {
  return component === modules[FALLBACK_404_KEY]
}
