/**
 * 获取当前系统的颜色模式
 * @returns 当前系统的颜色模式
 */
export const getSystemColorMode = (): 'light' | 'dark' => {
  // 检查是否在浏览器环境中（SSR兼容）
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light' // 默认返回浅色主题
  }

  // 使用 CSS 媒体查询检测系统主题偏好
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  return mediaQuery.matches ? 'dark' : 'light'
}
