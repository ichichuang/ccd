/**
 * Theme Engine v4 — OKLCH Color Space Utilities
 *
 * Perceptually uniform color manipulation using the OKLab/OKLCH color space.
 * Pure functions. No DOM access. No side effects.
 *
 * Conversion chain: hex → sRGB → linear RGB → OKLab → OKLCH (and reverse).
 *
 * Reference: https://bottosson.github.io/posts/oklab/
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Oklch {
  l: number // lightness  0..1
  c: number // chroma     0..~0.4 (theoretical max ~0.5)
  h: number // hue        0..360
}

// ---------------------------------------------------------------------------
// sRGB Gamma helpers
// ---------------------------------------------------------------------------

function srgbToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(channel: number): number {
  const c = Math.max(0, Math.min(1, channel))
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  return Math.round(v * 255)
}

// ---------------------------------------------------------------------------
// Hex parsing / formatting
// ---------------------------------------------------------------------------

function hexToSrgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const num = parseInt(
    h.length === 3
      ? h
          .split('')
          .map(c => c + c)
          .join('')
      : h,
    16
  )
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function srgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  return '#' + ((1 << 24) | (clamp(r) << 16) | (clamp(g) << 8) | clamp(b)).toString(16).slice(1)
}

// ---------------------------------------------------------------------------
// sRGB → Linear RGB → OKLab → OKLCH
// ---------------------------------------------------------------------------

function linearRgbToOklab(lr: number, lg: number, lb: number): [number, number, number] {
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  const lCbrt = Math.cbrt(l)
  const mCbrt = Math.cbrt(m)
  const sCbrt = Math.cbrt(s)
  return [
    0.2104542553 * lCbrt + 0.793617785 * mCbrt - 0.0040720468 * sCbrt,
    1.9779984951 * lCbrt - 2.428592205 * mCbrt + 0.4505937099 * sCbrt,
    0.0259040371 * lCbrt + 0.7827717662 * mCbrt - 0.808675766 * sCbrt,
  ]
}

function oklabToOklch(lightness: number, a: number, b: number): Oklch {
  const C = Math.sqrt(a * a + b * b)
  let H = (Math.atan2(b, a) * 180) / Math.PI
  if (H < 0) H += 360
  return { l: lightness, c: C, h: H }
}

function oklchToOklab(oklch: Oklch): [number, number, number] {
  const hRad = (oklch.h * Math.PI) / 180
  return [oklch.l, oklch.c * Math.cos(hRad), oklch.c * Math.sin(hRad)]
}

function oklabToLinearRgb(lightness: number, a: number, b: number): [number, number, number] {
  const l = lightness + 0.3963377774 * a + 0.2158037573 * b
  const m = lightness - 0.1055613458 * a - 0.0638541728 * b
  const s = lightness - 0.0894841775 * a - 1.291485548 * b
  const l3 = l * l * l
  const m3 = m * m * m
  const s3 = s * s * s
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
}

// ---------------------------------------------------------------------------
// Public API: Parse
// ---------------------------------------------------------------------------

/**
 * Parse a hex color string into OKLCH.
 * @param input - hex string like "#ff0000" or "#f00"
 */
export function parseColor(input: string): Oklch {
  const [r, g, b] = hexToSrgb(input)
  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)
  const [L, a, bVal] = linearRgbToOklab(lr, lg, lb)
  return oklabToOklch(L, a, bVal)
}

/**
 * Convert an OKLCH color to RGB channel string.
 * @returns "r g b" format for CSS variables
 */
export function toRgbChannels(oklch: Oklch): string {
  const [L, a, b] = oklchToOklab(oklch)
  const [lr, lg, lb] = oklabToLinearRgb(L, a, b)
  const r = linearToSrgb(lr)
  const g = linearToSrgb(lg)
  const bC = linearToSrgb(lb)
  return `${r} ${g} ${bC}`
}

/**
 * Convert an OKLCH color to hex string.
 */
export function toHex(oklch: Oklch): string {
  const [L, a, b] = oklchToOklab(oklch)
  const [lr, lg, lb] = oklabToLinearRgb(L, a, b)
  return srgbToHex(linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb))
}

// ---------------------------------------------------------------------------
// Public API: Manipulate
// ---------------------------------------------------------------------------

/** Increase lightness by deltaL (0..1 scale). Clamped to valid range. */
export function lighten(c: Oklch, deltaL: number): Oklch {
  return { ...c, l: Math.max(0, Math.min(1, c.l + deltaL)) }
}

/** Decrease lightness by deltaL (0..1 scale). Clamped to valid range. */
export function darken(c: Oklch, deltaL: number): Oklch {
  return { ...c, l: Math.max(0, Math.min(1, c.l - deltaL)) }
}

/** Adjust chroma by deltaC. Clamped to [0, 0.4]. */
export function adjustChroma(c: Oklch, deltaC: number): Oklch {
  return { ...c, c: Math.max(0, Math.min(0.4, c.c + deltaC)) }
}

/** Adjust hue by deltaH degrees. Wraps 0..360. */
export function adjustHue(c: Oklch, deltaH: number): Oklch {
  return { ...c, h: (((c.h + deltaH) % 360) + 360) % 360 }
}

/**
 * Mix two OKLCH colors in perceptual space.
 * @param ratio 0 = all c2, 1 = all c1
 */
export function mix(c1: Oklch, c2: Oklch, ratio: number): Oklch {
  const w = Math.max(0, Math.min(1, ratio))
  // Interpolate hue via shortest path
  let hDiff = c2.h - c1.h
  if (Math.abs(hDiff) > 180) {
    hDiff = hDiff > 0 ? hDiff - 360 : hDiff + 360
  }
  return {
    l: c1.l * w + c2.l * (1 - w),
    c: c1.c * w + c2.c * (1 - w),
    h: (((c1.h + hDiff * (1 - w)) % 360) + 360) % 360,
  }
}

// ---------------------------------------------------------------------------
// Public API: Contrast & Readability
// ---------------------------------------------------------------------------

/**
 * Compute WCAG 2.1 relative luminance (0..1) from an OKLCH color.
 * Converts via sRGB to use the standard WCAG coefficients.
 */
export function relativeLuminance(oklch: Oklch): number {
  const [L, a, b] = oklchToOklab(oklch)
  const [lr, lg, lb] = oklabToLinearRgb(L, a, b)
  // WCAG relative luminance uses different coefficients than OKLab
  const [R, G, B] = [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)]
  const toLinear = (c: number): number => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(R) + 0.7152 * toLinear(G) + 0.0722 * toLinear(B)
}

/**
 * WCAG 2.1 contrast ratio between two OKLCH colors.
 */
export function contrastRatio(c1: Oklch, c2: Oklch): number {
  const l1 = relativeLuminance(c1)
  const l2 = relativeLuminance(c2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Approximate perceptual distance in OKLCH space.
 * Uses lightness/chroma plus circular hue distance weighted by average chroma.
 */
export function deltaE(c1: Oklch, c2: Oklch): number {
  const deltaL = (c1.l - c2.l) * 100
  const deltaC = (c1.c - c2.c) * 100
  const rawHue = Math.abs(c1.h - c2.h)
  const hueDistance = Math.min(rawHue, 360 - rawHue) / 180
  const averageChroma = ((c1.c + c2.c) / 2) * 100
  const deltaH = hueDistance * averageChroma
  return Math.sqrt(deltaL * deltaL + deltaC * deltaC + deltaH * deltaH)
}

/**
 * Ensure the foreground color has sufficient contrast against the background.
 * If the preferred foreground doesn't meet the threshold, returns black or white.
 */
export function ensureReadableForeground(
  bg: Oklch,
  preferredFg: Oklch,
  minRatio: number = 4.5
): Oklch {
  if (contrastRatio(bg, preferredFg) >= minRatio) {
    return preferredFg
  }
  const black: Oklch = { l: 0, c: 0, h: 0 }
  const white: Oklch = { l: 1, c: 0, h: 0 }
  const blackCr = contrastRatio(bg, black)
  const whiteCr = contrastRatio(bg, white)
  return blackCr >= whiteCr ? black : white
}

// ---------------------------------------------------------------------------
// Convenience: hex → oklch → hex helpers
// ---------------------------------------------------------------------------

/** Parse hex and return OKLCH. Convenience alias for parseColor. */
export function hexToOklch(hex: string): Oklch {
  return parseColor(hex)
}

/** Convert OKLCH back to hex. Convenience alias for toHex. */
export function oklchToHex(oklch: Oklch): string {
  return toHex(oklch)
}
