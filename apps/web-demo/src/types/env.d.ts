/**
 * 核心类型与环境定义
 * * 职责：
 * 1. 注入 Vue/Vue-Router 全局类型，解决 App/Component 识别问题
 * 2. 扩展 Vite 环境变量声明 (ImportMetaEnv)
 * 3. 注入项目全局工具函数类型 (如 $t)
 */

/// <reference types="vite/client" />

// 1. 核心依赖引入：确保 TS 编译器加载 Vue 的类型定义
import 'vue'
import 'vue-router'

// 2. 扩展 Vue 模块定义
declare module 'vue' {
  interface ComponentCustomProperties {
    /** 全局多语言转换函数 */
    $t: typeof import('@/locales').t
  }
}

/** Design Compiler 架构锚点：允许 data-archetype / data-region 通过模板类型校验 */
declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    'data-archetype'?: string
    'data-region'?: string
  }
}

// 3. 注入全局命名空间
declare global {
  // 基础类型映射：解决 setupLocales 等文件中 App 找不到的问题
  type App<T = unknown> = import('vue').App<T>
  type Component = import('vue').Component

  /** 全局多语言工具 (由 AutoImport 自动注入，此处提供 TS 支持) */
  const $t: typeof import('@/locales').t

  // 布局与主题相关全局类型
  type LayoutMode = import('./systems/layout').LayoutMode

  /** 构建时注入的应用信息（vite.config define，对象或 JSON 字符串，仅含 pkg.name/version 与 lastBuildTime） */
  const __APP_INFO__: string | { pkg?: { name?: string; version?: string }; lastBuildTime?: string }

  // 非组件环境全局 API
  interface Window {
    $message?: {
      success: (message: string, title?: string) => void
      danger: (message: string, title?: string) => void
      info: (message: string, title?: string) => void
      warn: (message: string, title?: string) => void
    }
    $toast?: {
      dangerIn: (position: string, summary: string, detail?: string) => void
      successIn: (position: string, summary: string, detail?: string) => void
      infoIn: (position: string, summary: string, detail?: string) => void
      warnIn: (position: string, summary: string, detail?: string) => void
      secondaryIn: (position: string, summary: string, detail?: string) => void
      contrastIn: (position: string, summary: string, detail?: string) => void
      add: (options: unknown) => void
      clear: () => void
      removeGroup?: (group: string) => void
    }
    $i18n?: { d: (date: Date, formatKey: string, locale: string) => string }
  }
}

/**
 * 扩展 Vite 的环境变量接口
 */
declare interface ImportMetaEnv {
  // ========== 应用基础配置 ==========
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_ENV: 'development' | 'production'
  readonly VITE_API_BASE_URL: string
  readonly VITE_PORT?: string
  readonly VITE_DESKTOP_PORT?: string
  readonly VITE_ROUTER_MODE: 'history' | 'hash'
  readonly VITE_PUBLIC_PATH?: string
  readonly VITE_PINIA_PERSIST_KEY_PREFIX?: string
  readonly VITE_PUBLIC_STORAGE_OBFUSCATION_KEY: string
  readonly VITE_PUBLIC_STORAGE_OBFUSCATION_KEY_PREVIOUS?: string
  readonly VITE_ROOT_REDIRECT: string

  // ========== API 超时（字符串形式） ==========
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_PROXY_TIMEOUT?: string

  // ========== 布尔型配置（值为字符串 'true' | 'false'） ==========
  readonly VITE_DROP_DEBUGGER: 'true' | 'false'
  readonly VITE_DROP_CONSOLE: 'true' | 'false'
  readonly VITE_BUILD_SOURCEMAP: 'true' | 'false'
  readonly VITE_LEGACY: 'true' | 'false'
  readonly VITE_CDN: 'true' | 'false'
  readonly VITE_AUTH_ENABLED?: 'true' | 'false'
  readonly VITE_DEMO_MOCK_ENABLED?: 'true' | 'false'
  readonly VITE_SYNC_WS_URL?: string

  // ========== 主题相关调试 ==========
  readonly VITE_THEME_DEBUG?: 'true' | 'false'

  // ========== 索引签名 ==========
  readonly [key: `VITE_${string}`]: string | undefined
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
