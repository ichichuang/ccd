import legacy from '@vitejs/plugin-legacy'
import type { PluginOption } from 'vite'

export const configLegacyPlugin = (): PluginOption => {
  return legacy({
    // 目标浏览器范围：默认范围，排除 IE11 (根据你的需求)
    targets: ['defaults', 'not IE 11'],

    // 生成 legacy chunk (用于不支持 ESM 的旧浏览器)
    renderLegacyChunks: true,

    // 开启后，插件会自动检测源码和 node_modules 中的特性使用情况
    // 并自动注入所需的 polyfills，无需手动列出
    modernPolyfills: true,
  })
}
