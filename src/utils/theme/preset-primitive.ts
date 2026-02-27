/**
 * PrimeVue Preset - Primitive Layer
 * 建立 CSS 变量 → Token 的映射，与架构 ThemeCssVars 通过 semantic 引用对齐
 */

import { generateColorScale, generateBorderRadiusScale } from './primevue-theme-helpers'

export function buildPrimitiveLayer(): Record<string, unknown> {
  return {
    brand: {
      ...generateColorScale('primary', { hasHover: true }),
    },
    neutral: {
      0: 'rgb(var(--background))',
      50: 'rgb(var(--muted))',
      100: 'color-mix(in srgb, rgb(var(--muted)), rgb(var(--background)) 50%)',
      200: 'color-mix(in srgb, rgb(var(--border)), rgb(var(--muted)) 50%)',
      300: 'rgb(var(--border))',
      400: 'color-mix(in srgb, rgb(var(--muted-foreground)), rgb(var(--border)) 50%)',
      500: 'rgb(var(--muted-foreground))',
      600: 'color-mix(in srgb, rgb(var(--foreground)), rgb(var(--muted-foreground)) 50%)',
      700: 'rgb(var(--foreground))',
      800: 'color-mix(in srgb, rgb(var(--foreground)), black 20%)',
      900: 'color-mix(in srgb, rgb(var(--foreground)), black 40%)',
      950: 'color-mix(in srgb, rgb(var(--foreground)), black 60%)',
    },
    success: {
      ...generateColorScale('success', { hasHover: true }),
    },
    warning: {
      ...generateColorScale('warn', { hasHover: true }),
    },
    error: {
      ...generateColorScale('danger', { hasHover: true }),
    },
    accent: {
      ...generateColorScale('accent', { hasHover: false }),
    },
    borderRadius: {
      ...generateBorderRadiusScale(),
    },
  }
}
