// import dayjs from 'dayjs'
import { readdir, stat } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dependencies, devDependencies, engines, name, version } from '../package.json'

/** 启动 node 进程时所在工作目录的绝对路径 */
export const root: string = process.cwd()

/**
 * @description 根据可选的路径片段生成一个新的绝对路径
 * @param dir 路径片段，默认当前目录
 * @param metaUrl 模块的完整 url
 */
export const pathResolve = (dir = '.', metaUrl = import.meta.url): string => {
  const currentFileDir = dirname(fileURLToPath(metaUrl))
  return resolve(currentFileDir, dir)
}

/** 设置别名 */
export const alias: Record<string, string> = {
  '@': pathResolve('../src'),
  '@!': pathResolve('../src/api'),
  '@#': pathResolve('../src/common'),
}

/** 应用信息 */
export const __APP_INFO__ = {
  pkg: { name, version, engines, dependencies, devDependencies },
  lastBuildTime: new Date().toLocaleString('zh-CN'),
}

/** 环境变量类型定义 */
export interface ViteEnv {
  VITE_PORT: number
  VITE_PUBLIC_PATH: string
  VITE_ROUTER_MODE: 'history' | 'hash'
  VITE_CDN: boolean
  VITE_COMPRESSION: 'none' | 'gzip' | 'brotli' | 'both'
  VITE_BUILD_SOURCEMAP: boolean
  VITE_BUILD_ANALYZE: boolean
  VITE_LEGACY: boolean
  VITE_API_BASE_URL: string
  VITE_APP_TITLE: string
  VITE_APP_VERSION: string
  VITE_APP_ENV: 'development' | 'production'
  VITE_PINIA_PERSIST_KEY_PREFIX: string
  VITE_ROOT_REDIRECT: string
  VITE_DEBUG: boolean
  VITE_DROP_DEBUGGER: boolean
  VITE_DROP_CONSOLE: boolean
  VITE_DEV_TOOLS?: boolean
}

/**
 * @description 将 Vite 加载的 env 对象包装为带类型的 ViteEnv
 */
export const wrapperEnv = (envConf: Record<string, any>): ViteEnv => {
  const booleanKeys = [
    'VITE_CDN',
    'VITE_BUILD_SOURCEMAP',
    'VITE_BUILD_ANALYZE',
    'VITE_LEGACY',
    'VITE_DEBUG',
    'VITE_DROP_DEBUGGER',
    'VITE_DROP_CONSOLE',
    'VITE_DEV_TOOLS',
  ]

  const numberKeys = ['VITE_PORT']

  const ret: Record<string, any> = {}

  Object.keys(envConf).forEach(key => {
    let value = envConf[key]?.replace(/\\n/g, '\n') ?? ''

    if (booleanKeys.includes(key)) {
      value = value === 'true'
    } else if (numberKeys.includes(key)) {
      const num = Number(value)
      value = isNaN(num) ? 0 : num
    }

    ret[key] = value
    // 同步写入 process.env
    process.env[key] = typeof value === 'object' ? JSON.stringify(value) : String(value)
  })

  return {
    VITE_PORT: ret.VITE_PORT,
    VITE_PUBLIC_PATH: ret.VITE_PUBLIC_PATH || '/',
    VITE_ROUTER_MODE: ret.VITE_ROUTER_MODE || 'history',
    VITE_CDN: ret.VITE_CDN,
    VITE_COMPRESSION: ret.VITE_COMPRESSION || 'none',
    VITE_BUILD_SOURCEMAP: ret.VITE_BUILD_SOURCEMAP,
    VITE_BUILD_ANALYZE: ret.VITE_BUILD_ANALYZE,
    VITE_LEGACY: ret.VITE_LEGACY,
    VITE_API_BASE_URL: ret.VITE_API_BASE_URL,
    VITE_APP_TITLE: ret.VITE_APP_TITLE,
    VITE_APP_VERSION: ret.VITE_APP_VERSION,
    VITE_APP_ENV: ret.VITE_APP_ENV || 'development',
    VITE_PINIA_PERSIST_KEY_PREFIX: ret.VITE_PINIA_PERSIST_KEY_PREFIX,
    VITE_ROOT_REDIRECT: ret.VITE_ROOT_REDIRECT,
    VITE_DEBUG: ret.VITE_DEBUG,
    VITE_DROP_DEBUGGER: ret.VITE_DROP_DEBUGGER,
    VITE_DROP_CONSOLE: ret.VITE_DROP_CONSOLE,
    VITE_DEV_TOOLS: ret.VITE_DEV_TOOLS,
  }
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
  const fileListTotal: number[] = []

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) {
      return '0 Bytes'
    }
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  const sum = (arr: number[]) => arr.reduce((prev, curr) => prev + curr, 0)

  readdir(folder, (err, files: string[]) => {
    if (err) {
      throw err
    }
    if (files.length === 0) {
      callback('0 Bytes')
      return
    }

    let processed = 0
    const checkEnd = () => {
      processed++
      if (processed === files.length) {
        callback(format ? formatBytes(sum(fileListTotal)) : String(sum(fileListTotal)))
      }
    }

    files.forEach(item => {
      stat(`${folder}/${item}`, (err, stats) => {
        if (err) {
          throw err
        }
        if (stats.isFile()) {
          fileListTotal.push(stats.size)
          checkEnd()
        } else if (stats.isDirectory()) {
          getPackageSize({
            folder: `${folder}/${item}/`,
            callback: checkEnd,
          })
        }
      })
    })
  })
}
