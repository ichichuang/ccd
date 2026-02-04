import type { PluginOption } from 'vite'
import type { ViteEnv } from './utils'

/**
 * 在构建/开发时向 index.html 注入环境变量
 * 与 usePageTitle 逻辑一致：初始标题为 VITE_APP_TITLE，运行时由 usePageTitle 根据路由更新
 */
export function configHtmlPlugin(env: ViteEnv): PluginOption {
  const appTitle = env.VITE_APP_TITLE ?? ''

  return {
    name: 'vite:html-inject',
    transformIndexHtml(html: string) {
      return html.replace(/%VITE_APP_TITLE%/g, appTitle)
    },
  }
}
