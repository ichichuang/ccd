import { describe, expect, it } from 'vitest'
import {
  normalizeHex,
  hexToRgb,
  rgbToHex,
  adjustBrightness,
  mixHex,
  isDarkColor,
  applyOpacityToColor,
  shiftHue,
} from './colors'

describe('normalizeHex', () => {
  it('expands 3-digit hex to 6-digit', () => {
    expect(normalizeHex('#fff')).toBe('#ffffff')
    expect(normalizeHex('#000')).toBe('#000000')
    expect(normalizeHex('#f00')).toBe('#ff0000')
  })

  it('passes through valid 6-digit hex', () => {
    expect(normalizeHex('#abcdef')).toBe('#abcdef')
    expect(normalizeHex('#ABCDEF')).toBe('#ABCDEF')
  })

  it('returns #000000 for invalid input', () => {
    expect(normalizeHex('')).toBe('#000000')
    expect(normalizeHex('red')).toBe('#000000')
    expect(normalizeHex('#xyz')).toBe('#000000')
  })
})

describe('hexToRgb', () => {
  it('converts white', () => {
    expect(hexToRgb('#ffffff')).toBe('255 255 255')
  })

  it('converts black', () => {
    expect(hexToRgb('#000000')).toBe('0 0 0')
  })

  it('converts red', () => {
    expect(hexToRgb('#ff0000')).toBe('255 0 0')
  })

  it('handles 3-digit input', () => {
    expect(hexToRgb('#fff')).toBe('255 255 255')
  })
})

describe('rgbToHex', () => {
  it('converts "255 255 255" to #ffffff', () => {
    expect(rgbToHex('255 255 255')).toBe('#ffffff')
  })

  it('converts "0 0 0" to #000000', () => {
    expect(rgbToHex('0 0 0')).toBe('#000000')
  })

  it('round-trips with hexToRgb', () => {
    const hex = '#3b82f6'
    expect(rgbToHex(hexToRgb(hex))).toBe(hex)
  })

  it('returns #000000 for invalid format', () => {
    expect(rgbToHex('invalid')).toBe('#000000')
    expect(rgbToHex('255 255')).toBe('#000000')
  })
})

describe('adjustBrightness', () => {
  it('returns same color at 0%', () => {
    expect(adjustBrightness('#808080', 0)).toBe('#808080')
  })

  it('clamps to white at +100%', () => {
    const result = adjustBrightness('#000000', 100)
    expect(result).toBe('#ffffff')
  })

  it('clamps to black at -100%', () => {
    const result = adjustBrightness('#ffffff', -100)
    expect(result).toBe('#000000')
  })
})

describe('mixHex', () => {
  it('weight 1.0 returns first color', () => {
    expect(mixHex('#ff0000', '#0000ff', 1)).toBe('#ff0000')
  })

  it('weight 0.0 returns second color', () => {
    expect(mixHex('#ff0000', '#0000ff', 0)).toBe('#0000ff')
  })

  it('weight 0.5 returns midpoint', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080')
  })
})

describe('isDarkColor', () => {
  it('black is dark', () => {
    expect(isDarkColor('#000000')).toBe(true)
  })

  it('white is not dark', () => {
    expect(isDarkColor('#ffffff')).toBe(false)
  })

  it('mid-gray threshold (luma ~128)', () => {
    // #808080 has luma = 128 exactly, so < 128 is false
    expect(isDarkColor('#7f7f7f')).toBe(true)
  })
})

describe('applyOpacityToColor', () => {
  it('applies opacity to hex', () => {
    const result = applyOpacityToColor('#ff0000', 50)
    expect(result).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('applies opacity to 3-digit hex', () => {
    const result = applyOpacityToColor('#f00', 100)
    expect(result).toBe('rgba(255, 0, 0, 1)')
  })

  it('converts rgb to rgba', () => {
    const result = applyOpacityToColor('rgb(255, 0, 0)', 50)
    expect(result).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('converts hsl to hsla', () => {
    const result = applyOpacityToColor('hsl(0, 100%, 50%)', 50)
    expect(result).toBe('hsla(0, 100%, 50%, 0.5)')
  })

  it('returns black rgba for unsupported format', () => {
    const result = applyOpacityToColor('invalid', 50)
    expect(result).toBe('rgba(0, 0, 0, 0.5)')
  })
})

describe('shiftHue', () => {
  it('0 degree shift returns same color', () => {
    expect(shiftHue('#ff0000', 0)).toBe('#ff0000')
  })

  it('360 degree shift returns same color', () => {
    expect(shiftHue('#ff0000', 360)).toBe('#ff0000')
  })
})
