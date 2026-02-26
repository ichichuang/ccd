/**
 * 标准化 Hex 颜色值 (修复 3 位 hex 并进行非法校验)
 */
export function normalizeHex(hex: string): string {
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

/**
 * 将颜色叠加透明度，输出为 rgba/hsla 字符串
 * - 支持：#rgb/#rrggbb、rgb/rgba、hsl/hsla
 * - opacity: 0~100
 */
export function applyOpacityToColor(color: string, opacity: number): string {
  // 限定透明度为 0~100
  const alpha = Math.max(0, Math.min(100, opacity)) / 100

  // 移除空格并转小写
  color = color.trim().toLowerCase()

  // 1. rgba(...) / rgb(...)：直接替换/补齐 alpha
  const rgbaMatch = color.match(/^rgba?\(([^)]+)\)$/)
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map(p => p.trim())
    const [r, g, b] = parts.map(Number)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // 2. HEX #rrggbb or #rgb
  if (color.startsWith('#')) {
    let r = 0
    let g = 0
    let b = 0
    if (color.length === 4) {
      // #rgb
      r = parseInt(color[1] + color[1], 16)
      g = parseInt(color[2] + color[2], 16)
      b = parseInt(color[3] + color[3], 16)
    } else if (color.length === 7) {
      // #rrggbb
      r = parseInt(color.slice(1, 3), 16)
      g = parseInt(color.slice(3, 5), 16)
      b = parseInt(color.slice(5, 7), 16)
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // 3. hsl(...) -> hsla(...)
  const hslMatch = color.match(/^hsl\(([^)]+)\)$/)
  if (hslMatch) {
    return color.replace(/^hsl\(([^)]+)\)$/, `hsla($1, ${alpha})`)
  }

  // 4. hsla(...)：替换 alpha（保留 h/s/l）
  const hslaMatch = color.match(/^hsla\(([^,]+),([^,]+),([^,]+),[^)]+\)$/)
  if (hslaMatch) {
    const [h, s, l] = [hslaMatch[1], hslaMatch[2], hslaMatch[3]]
    return `hsla(${h}, ${s}, ${l}, ${alpha})`
  }

  // 5. 不支持的格式：回退黑色
  console.warn(`Unsupported color format: "${color}"`)
  return `rgba(0, 0, 0, ${alpha})`
}

// ---------------------------------------------------------------------------
// 内部工具：HSL 转换（供 shiftHue 使用，不 export）
// ---------------------------------------------------------------------------

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const h = normalizeHex(hex).replace('#', '')
  const num = parseInt(h, 16)
  const r = ((num >> 16) & 255) / 255
  const g = ((num >> 8) & 255) / 255
  const b = (num & 255) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let hVal = 0
  let sVal = 0
  const lVal = (max + min) / 2

  if (max !== min) {
    const d = max - min
    sVal = lVal > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        hVal = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        hVal = ((b - r) / d + 2) / 6
        break
      default:
        hVal = ((r - g) / d + 4) / 6
    }
  }

  return {
    h: hVal * 360,
    s: sVal * 100,
    l: lVal * 100,
  }
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const hNorm = (((h % 360) + 360) % 360) / 360
  const sNorm = Math.max(0, Math.min(100, s)) / 100
  const lNorm = Math.max(0, Math.min(100, l)) / 100

  let r: number
  let g: number
  let b: number

  if (sNorm === 0) {
    r = g = b = lNorm
  } else {
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
    const p = 2 * lNorm - q
    r = hue2rgb(p, q, hNorm + 1 / 3)
    g = hue2rgb(p, q, hNorm)
    b = hue2rgb(p, q, hNorm - 1 / 3)
  }

  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val * 255)))
  return '#' + (0x1000000 + clamp(r) * 0x10000 + clamp(g) * 0x100 + clamp(b)).toString(16).slice(1)
}

/**
 * 按色相偏移 HEX 颜色
 * @param hex - 输入 HEX 颜色
 * @param degree - 色相偏移度数（正数顺时针，负数逆时针），会循环 0~360
 * @returns 偏移后的 HEX 颜色
 */
export function shiftHue(hex: string, degree: number): string {
  const hsl = hexToHsl(hex)
  const newH = (hsl.h + degree + 360) % 360
  return normalizeHex(hslToHex(newH, hsl.s, hsl.l))
}
