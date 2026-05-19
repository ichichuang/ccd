import { visualizer } from 'rollup-plugin-visualizer'
import type { PluginOption } from 'vite'

/**
 * 仅在 VITE_BUILD_ANALYZE=true 时启用的构建分析插件
 * 生成 stats.html 用于可视化分析包体积
 */
export function viteBuildPerformancePlugin(open = false): PluginOption {
  return visualizer({
    filename: 'dist/stats.html', // 产物路径
    open, // 是否自动打开浏览器
    gzipSize: true, // 显示 gzip 后大小
    brotliSize: true, // 显示 brotli 后大小
    template: 'treemap', // 视图模板 (treemap/sunburst/network)
    title: '构建产物分析',
    sourcemap: true,
  }) as PluginOption
}
