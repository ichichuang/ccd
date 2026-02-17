import type { PluginOption } from 'vite'
import { brand } from '../src/constants/brand'

/**
 * 在构建/开发时向 index.html 注入品牌配置
 * 数据源：src/constants/brand.ts
 */
export function configHtmlPlugin(): PluginOption {
  return {
    name: 'vite:html-inject',
    transformIndexHtml(html: string) {
      return html
        .replace(/%BRAND_NAME%/g, brand.name)
        .replace(/%BRAND_SLOGAN%/g, brand.slogan)
        .replace(/%BRAND_AUTHOR%/g, brand.author)
    },
  }
}
