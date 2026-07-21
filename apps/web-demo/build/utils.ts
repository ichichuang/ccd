import { readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dependencies, devDependencies, engines, name, version } from '../../../package.json'

/** 启动 node 进程时所在工作目录的绝对路径 */
export const root: string = process.cwd()

/**
 * @description 根据可选的路径片段生成一个新的绝对路径
 */
export const pathResolve = (dir = '.', metaUrl = import.meta.url): string => {
  const currentFileDir = dirname(fileURLToPath(metaUrl))
  return resolve(currentFileDir, dir)
}

/** * ✅ 设置别名系统 (符合 v3.0 架构规范)
 * 1. @ -> 源码根目录
 * 2. @! -> api 目录
 * 3. @& -> 布局专用组件目录，支持显式引入布局相关组件
 */
export const alias: Record<string, string> = {
  '@': pathResolve('../src'),
  '@!': pathResolve('../src/api'),
  '@&': pathResolve('../src/layouts/components'),
  // lottie-web → light 版本（无表达式引擎），节省 ~230KB
  // 安全前提：所有 Lottie JSON 已验证 0 处 "e":1（无表达式）
  'lottie-web': 'lottie-web/build/player/esm/lottie_light.min.js',
}

/** 应用信息 */
export const __APP_INFO__ = {
  pkg: { name, version, engines, dependencies, devDependencies },
  lastBuildTime: new Date().toLocaleString(),
}

/** 环境变量类型定义 */
export interface ViteEnv {
  VITE_PORT: number
  VITE_PUBLIC_PATH: string
  VITE_ROUTER_MODE: 'history' | 'hash'
  VITE_CDN: boolean
  VITE_COMPRESSION: 'none' | 'gzip' | 'brotli' | 'both'
  VITE_BUILD_SOURCEMAP: boolean
  VITE_API_BASE_URL: string
  VITE_APP_TITLE: string
  VITE_APP_ENV: 'development' | 'production'
  VITE_PINIA_PERSIST_KEY_PREFIX: string
  VITE_ROOT_REDIRECT: string
  VITE_DROP_DEBUGGER: boolean
  VITE_DROP_CONSOLE: boolean
  VITE_DEV_TOOLS?: boolean
  /** ✅ 开发环境下是否输出主题 RGB 变量解析日志 */
  VITE_THEME_DEBUG?: boolean
  /** 客户端请求超时（毫秒） */
  VITE_API_TIMEOUT: number
  /** 开发环境代理超时（毫秒） */
  VITE_PROXY_TIMEOUT: number
  [key: string]: any
}

const compressionModes = ['none', 'gzip', 'brotli', 'both'] as const
const routerModes = ['history', 'hash'] as const
const appEnvironments = ['development', 'production'] as const
const storagePrefixPattern = /^[A-Za-z0-9:_-]{3,80}$/

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isPublicPath(value: string): boolean {
  if (isHttpUrl(value)) return value.endsWith('/')
  return value.startsWith('/') && value.endsWith('/')
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0
}

export function getViteEnvSchemaIssues(env: ViteEnv): string[] {
  const issues: string[] = []

  if (!isPositiveInteger(env.VITE_PORT) || env.VITE_PORT > 65_535) {
    issues.push('VITE_PORT must be an integer between 1 and 65535')
  }

  if (!isPublicPath(env.VITE_PUBLIC_PATH)) {
    issues.push(
      'VITE_PUBLIC_PATH must be /, a root-relative path ending in /, or an http(s) URL ending in /'
    )
  }

  if (!routerModes.includes(env.VITE_ROUTER_MODE)) {
    issues.push('VITE_ROUTER_MODE must be history or hash')
  }

  if (!compressionModes.includes(env.VITE_COMPRESSION)) {
    issues.push('VITE_COMPRESSION must be one of none, gzip, brotli, both')
  }

  if (!isHttpUrl(env.VITE_API_BASE_URL)) {
    issues.push('VITE_API_BASE_URL must be an absolute http(s) URL')
  }

  if (!appEnvironments.includes(env.VITE_APP_ENV)) {
    issues.push('VITE_APP_ENV must be development or production')
  }

  if (!storagePrefixPattern.test(env.VITE_PINIA_PERSIST_KEY_PREFIX)) {
    issues.push(
      'VITE_PINIA_PERSIST_KEY_PREFIX must be 3-80 characters using letters, digits, colon, underscore, or hyphen'
    )
  }

  if (!env.VITE_ROOT_REDIRECT.startsWith('/')) {
    issues.push('VITE_ROOT_REDIRECT must be an absolute app path')
  }

  if (!isPositiveInteger(env.VITE_API_TIMEOUT)) {
    issues.push('VITE_API_TIMEOUT must be a positive integer in milliseconds')
  }

  if (!isPositiveInteger(env.VITE_PROXY_TIMEOUT)) {
    issues.push('VITE_PROXY_TIMEOUT must be a positive integer in milliseconds')
  }

  if (
    isPositiveInteger(env.VITE_API_TIMEOUT) &&
    isPositiveInteger(env.VITE_PROXY_TIMEOUT) &&
    env.VITE_PROXY_TIMEOUT < env.VITE_API_TIMEOUT
  ) {
    issues.push('VITE_PROXY_TIMEOUT must be greater than or equal to VITE_API_TIMEOUT')
  }

  return issues
}

export function assertValidViteEnv(env: ViteEnv): void {
  const issues = getViteEnvSchemaIssues(env)
  if (issues.length === 0) return

  throw new Error(`Invalid Vite environment:\n${issues.map(issue => `- ${issue}`).join('\n')}`)
}

/**
 * @description 自动识别并转换环境变量类型
 */
export const wrapperEnv = (envConf: Record<string, any>): ViteEnv => {
  const ret: Record<string, any> = {}

  const numberKeys = ['VITE_PORT', 'VITE_API_TIMEOUT', 'VITE_PROXY_TIMEOUT']
  const booleanKeys = [
    'VITE_CDN',
    'VITE_BUILD_SOURCEMAP',
    'VITE_DROP_DEBUGGER',
    'VITE_DROP_CONSOLE',
    'VITE_DEV_TOOLS',
    'VITE_THEME_DEBUG', // ✅ 加入布尔转换列表
  ]

  Object.keys(envConf).forEach(key => {
    let value = envConf[key]?.replace(/\\n/g, '\n') ?? ''

    if (booleanKeys.includes(key)) {
      value = value === 'true'
    } else if (numberKeys.includes(key)) {
      const num = Number(value)
      value = isNaN(num) ? 0 : num
    }

    ret[key] = value
    process.env[key] = typeof value === 'object' ? JSON.stringify(value) : String(value)
  })

  const env = {
    VITE_PORT: ret.VITE_PORT ?? 8888,
    VITE_PUBLIC_PATH: ret.VITE_PUBLIC_PATH ?? '/',
    VITE_ROUTER_MODE: ret.VITE_ROUTER_MODE ?? 'history',
    VITE_CDN: ret.VITE_CDN ?? false,
    VITE_COMPRESSION: ret.VITE_COMPRESSION ?? 'none',
    VITE_BUILD_SOURCEMAP: ret.VITE_BUILD_SOURCEMAP ?? false,
    VITE_API_BASE_URL: ret.VITE_API_BASE_URL ?? '',
    VITE_APP_TITLE: ret.VITE_APP_TITLE ?? '',
    VITE_APP_ENV: ret.VITE_APP_ENV ?? 'development',
    VITE_PINIA_PERSIST_KEY_PREFIX: ret.VITE_PINIA_PERSIST_KEY_PREFIX ?? '',
    VITE_ROOT_REDIRECT: ret.VITE_ROOT_REDIRECT ?? '',
    VITE_DROP_DEBUGGER: ret.VITE_DROP_DEBUGGER ?? false,
    VITE_DROP_CONSOLE: ret.VITE_DROP_CONSOLE ?? false,
    VITE_DEV_TOOLS: ret.VITE_DEV_TOOLS,
    VITE_API_TIMEOUT: ret.VITE_API_TIMEOUT ?? 10000,
    VITE_PROXY_TIMEOUT: ret.VITE_PROXY_TIMEOUT ?? 15000,
    ...ret,
  }

  assertValidViteEnv(env)

  return env
}

/**
 * @description 获取指定目录的构建体积
 */
export const getPackageSize = (options: {
  folder?: string
  callback: (size: string) => void
  format?: boolean
}): void => {
  const { folder = 'dist', callback, format = true } = options

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  const getDirSize = (dir: string): number => {
    let size = 0
    try {
      const files = readdirSync(dir)
      files.forEach(file => {
        const filePath = join(dir, file)
        const stats = statSync(filePath)
        if (stats.isDirectory()) {
          size += getDirSize(filePath)
        } else {
          size += stats.size
        }
      })
    } catch (_error) {
      return 0
    }
    return size
  }

  const totalSize = getDirSize(folder)
  callback(format ? formatBytes(totalSize) : String(totalSize))
}
