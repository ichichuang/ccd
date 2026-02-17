/**
 * 项目品牌配置 - 单一数据源
 * 用于：HTML meta、布局 Header、usePageTitle、permission 路由守卫、构建信息
 *
 * 同步说明：修改品牌后，需手动同步 package.json 的 name / description / author 与 brand 一致
 */
export const brand = {
  /** 项目标识（小写，用于 package、URL、浏览器标题、og:title） */
  name: 'ccd',
  /** Header 展示主标题 */
  displayName: 'CCD Admin',
  /** Header 展示副标题 */
  subtitle: 'Enterprise',
  /** 简短描述（package.json description、meta description） */
  description: '现代化全局后台管理框架',
  /** 分享用 slogan（og:description） */
  slogan: '先进的架构，优雅的代码，高效的开发体验',
  /** 作者（og:author、meta author） */
  author: 'Chris Chi',
} as const

export type Brand = typeof brand
