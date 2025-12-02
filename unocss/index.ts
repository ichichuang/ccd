import extractorPug from '@unocss/extractor-pug'
import { defineConfig } from 'unocss'
import { presets } from './presets'
import { rules } from './rules'
import { shortcuts } from './shortcuts'
import { transformers } from './transformers'
import { getDynamicSafelist } from './utils/icons'
import { themeConfig } from './utils/theme'
import { variants } from './variants'

export default defineConfig({
  // 内容扫描配置 - 使用字符串数组格式，这是 VSCode 插件最兼容的格式
  // 明确包含所有文件，确保 layouts 目录也能被扫描
  content: [
    // 明确包含所有 Vue 文件路径（包括 layouts 目录）
    'src/**/*.vue',
    'src/**/*.js',
    'src/**/*.ts',
    'src/**/*.jsx',
    'src/**/*.tsx',
    'src/**/*.md',
    'src/**/*.mdx',
    'src/**/*.html',
    // 包含样式文件以支持 @apply 指令
    'src/**/*.css',
    'src/**/*.scss',
    'src/**/*.sass',
    'src/**/*.less',
    'src/**/*.styl',
    'src/**/*.stylus',
  ] as any,

  // 使 UnoCSS 能正确从 Pug 模板中提取类名（支持 .class / #id 等简写）
  extractors: [extractorPug()],

  // 预设配置
  presets,

  // 安全列表 - 优化性能，只包含必要的类
  safelist: getDynamicSafelist(),

  // 变换器
  transformers,

  // 自定义变体 - 只保留实际使用的
  variants,

  // 快捷方式配置 - 已经是对象格式，不需要 as any
  shortcuts,

  // 自定义规则
  rules,

  // 主题配置
  theme: themeConfig,
})
