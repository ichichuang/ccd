/**
 * 标准化 Hex 颜色值 (修复 3 位 hex 并进行非法校验)
 */
function normalizeHex(hex: string): string {
  // 基础校验：必须以 # 开头
  if (!hex || !hex.startsWith('#')) {
    console.error(`[Theme Engine] 非法颜色值: ${hex}，已回退为 #000000`)
    return '#000000'
  }

  let h = hex.replace('#', '')

  // 自动处理 3 位 -> 6 位展开
  if (h.length === 3) {
    h = h
      .split('')
      .map(char => char + char)
      .join('')
  }

  // 最终校验：必须是 6 位合法字符
  const hexRegex = /^[0-9a-fA-F]{6}$/
  if (!hexRegex.test(h)) {
    console.error(`[Theme Engine] 颜色格式错误: #${h}`)
    return '#000000'
  }

  return '#' + h
}

/**
 * 将 Hex 颜色转换为 RGB 通道字符串
 * @example "#ffffff" -> "255 255 255"
 */
export function hexToRgb(hex: string): string {
  const h = normalizeHex(hex).replace('#', '')
  const num = parseInt(h, 16)
  return `${(num >> 16) & 255} ${(num >> 8) & 255} ${num & 255}`
}

/**
 * 调整颜色亮度 (修正 3 位 hex 计算逻辑)
 */
export function adjustBrightness(hex: string, percent: number): string {
  const h = normalizeHex(hex).replace('#', '')
  // 限制百分比在安全范围
  const p = Math.max(-100, Math.min(100, percent))

  const num = parseInt(h, 16)
  const amt = Math.round(2.55 * p)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt

  const clamp = (val: number) => Math.max(0, Math.min(255, val))

  return '#' + (0x1000000 + clamp(R) * 0x10000 + clamp(G) * 0x100 + clamp(B)).toString(16).slice(1)
}

/**
 * 混合两个 Hex 颜色 (用于生成有品牌倾向的 Accent)
 * @param color1 前景色
 * @param color2 背景色
 * @param weight color1 的权重 (0-1)
 */
export function mixHex(color1: string, color2: string, weight: number): string {
  const c1 = normalizeHex(color1).replace('#', '')
  const c2 = normalizeHex(color2).replace('#', '')
  const w = Math.max(0, Math.min(1, weight))
  const num1 = parseInt(c1, 16)
  const num2 = parseInt(c2, 16)
  const r = Math.round(((num1 >> 16) & 255) * w + ((num2 >> 16) & 255) * (1 - w))
  const g = Math.round(((num1 >> 8) & 0xff) * w + ((num2 >> 8) & 0xff) * (1 - w))
  const b = Math.round((num1 & 0xff) * w + (num2 & 0xff) * (1 - w))
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
}

/**
 * 判断颜色是否为深色 (修正 3 位 hex 误判问题)
 */
export function isDarkColor(hex: string): boolean {
  const h = normalizeHex(hex).replace('#', '')
  const rgb = parseInt(h, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff

  // 基于 Luma 亮度公式判断
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luma < 128
}

/**
 * 将 RGB 通道字符串转换为 Hex 颜色
 * @example "255 255 255" -> "#ffffff"
 */
export function rgbToHex(rgb: string): string {
  const parts = rgb.trim().split(/\s+/)
  if (parts.length !== 3) {
    console.error(`[Theme Engine] 非法 RGB 格式: ${rgb}，已回退为 #000000`)
    return '#000000'
  }

  const r = parseInt(parts[0], 10)
  const g = parseInt(parts[1], 10)
  const b = parseInt(parts[2], 10)

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.error(`[Theme Engine] RGB 值解析失败: ${rgb}`)
    return '#000000'
  }

  const clamp = (val: number) => Math.max(0, Math.min(255, val))
  const hex = (val: number) => clamp(val).toString(16).padStart(2, '0')

  return `#${hex(r)}${hex(g)}${hex(b)}`
}
