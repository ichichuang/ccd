/**
 * 内容扫描配置 - 使用 UnoCSS 标准格式，确保 VSCode 插件能识别
 * 使用字符串数组格式，这是 UnoCSS 最标准和最兼容的格式
 * 明确列出所有文件扩展名，确保 layouts 目录下的文件也能被正确扫描
 */
export const contentConfig: string[] = [
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
]
