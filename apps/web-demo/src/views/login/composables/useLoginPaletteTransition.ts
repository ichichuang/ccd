import { gsap } from '@/plugins/animation'
import { useThemeStore } from '@/stores/modules/system'
import { readRootCssVar, readElementCssVar, waitForNextFrame } from '@/adapters/css-reader.adapter'
import type { Ref } from 'vue'

/**
 * Login-local numeric RGB channel variables.
 *
 * These are set on #login-page as bare numbers (e.g. "106").
 * All login colour surfaces derive from them via
 *   rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 52%)
 *
 * GSAP tweens numeric channel values only — no string-format colour tweening.
 */
export const AUTH_CHANNEL_VARS = [
  '--auth-primary-r',
  '--auth-primary-g',
  '--auth-primary-b',
  '--auth-accent-r',
  '--auth-accent-g',
  '--auth-accent-b',
] as const

export type AuthChannelVar = (typeof AUTH_CHANNEL_VARS)[number]

export interface LoginPaletteTransition {
  /** Trigger a smooth palette switch. Returns true if a GSAP tween was started. */
  switchPalette: (name: string) => Promise<boolean>
  /** Cleanup active tween. Call onBeforeUnmount. */
  dispose: () => void
}

interface ChannelSnapshot {
  pr: number
  pg: number
  pb: number
  ar: number
  ag: number
  ab: number
}

/**
 * Parse a space-separated RGB triplet from a computed CSS value.
 *
 * Accepts the standard UnoCSS/CCD format "106 90 205".
 * Also handles "rgb(106, 90, 205)" or "rgb(106 90 205)" as fallback.
 * Returns the triplet as three numbers.
 */
function parseRgbTriplet(raw: string): [number, number, number] {
  const trimmed = raw.trim()
  if (!trimmed) return [0, 0, 0]

  // Standard UnoCSS space-separated: "106 90 205"
  const spaceParts = trimmed.split(/\s+/)
  if (spaceParts.length === 3) {
    const nums = spaceParts.map(Number)
    if (nums.every(n => !Number.isNaN(n))) return [nums[0], nums[1], nums[2]]
  }

  // rgb(...) format fallback
  const rgbMatch = trimmed.match(/rgb\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*\)/)
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])]
  }

  // Comma-separated triplet: "106,90,205"
  const commaParts = trimmed.split(',')
  if (commaParts.length === 3) {
    const nums = commaParts.map(Number)
    if (nums.every(n => !Number.isNaN(n))) return [nums[0], nums[1], nums[2]]
  }

  return [0, 0, 0]
}

/**
 * Read current --primary / --accent from the document root (global theme).
 * Fall back to #login-page if the root value is empty.
 */
function readGlobalPalette(loginRoot: HTMLElement): {
  primaryTriplet: [number, number, number]
  accentTriplet: [number, number, number]
} {
  const primaryRaw = readRootCssVar('--primary') || readElementCssVar(loginRoot, '--primary')
  const accentRaw = readRootCssVar('--accent') || readElementCssVar(loginRoot, '--accent')

  return {
    primaryTriplet: parseRgbTriplet(primaryRaw),
    accentTriplet: parseRgbTriplet(accentRaw),
  }
}

/**
 * Read current login-local numeric channel values from inline style.
 * These are the source of truth during a tween.
 */
function readChannels(root: HTMLElement): ChannelSnapshot {
  const s = root.style
  return {
    pr: Number(s.getPropertyValue('--auth-primary-r')) || 0,
    pg: Number(s.getPropertyValue('--auth-primary-g')) || 0,
    pb: Number(s.getPropertyValue('--auth-primary-b')) || 0,
    ar: Number(s.getPropertyValue('--auth-accent-r')) || 0,
    ag: Number(s.getPropertyValue('--auth-accent-g')) || 0,
    ab: Number(s.getPropertyValue('--auth-accent-b')) || 0,
  }
}

function setChannels(root: HTMLElement, snap: ChannelSnapshot): void {
  root.style.setProperty('--auth-primary-r', String(snap.pr))
  root.style.setProperty('--auth-primary-g', String(snap.pg))
  root.style.setProperty('--auth-primary-b', String(snap.pb))
  root.style.setProperty('--auth-accent-r', String(snap.ar))
  root.style.setProperty('--auth-accent-g', String(snap.ag))
  root.style.setProperty('--auth-accent-b', String(snap.ab))
}

function snapshotFromTriplets(
  primary: [number, number, number],
  accent: [number, number, number]
): ChannelSnapshot {
  return {
    pr: primary[0],
    pg: primary[1],
    pb: primary[2],
    ar: accent[0],
    ag: accent[1],
    ab: accent[2],
  }
}

/**
 * Creates a login-local palette transition coordinator.
 *
 * Uses numeric RGB channel variables so GSAP can interpolate smoothly
 * without colour-string parsing issues. No temporary halo/overlay,
 * no string-based capture, no abrupt clearing.
 */
export function useLoginPaletteTransition(
  loginRootRef: Ref<HTMLElement | null>,
  preferredReducedMotion: Ref<boolean>
): LoginPaletteTransition {
  const themeStore = useThemeStore()
  let activeTween: gsap.core.Tween | null = null

  function initChannels(root: HTMLElement): void {
    const { primaryTriplet, accentTriplet } = readGlobalPalette(root)
    setChannels(root, snapshotFromTriplets(primaryTriplet, accentTriplet))
  }

  // Lazily initialise channels on mount — one-shot.
  let channelsInitialised = false
  watch(
    loginRootRef,
    root => {
      if (root && !channelsInitialised) {
        initChannels(root)
        channelsInitialised = true
      }
    },
    { immediate: true }
  )

  async function switchPalette(name: string): Promise<boolean> {
    const root = loginRootRef.value
    if (!root) {
      themeStore.setTheme(name)
      return false
    }

    // Lazy init in case the watch didn't fire yet
    if (!channelsInitialised) {
      initChannels(root)
      channelsInitialised = true
    }

    // Kill any in-progress tween
    activeTween?.kill()
    activeTween = null

    // 1. Read current channel values from inline style
    const oldChannels = readChannels(root)

    // 2. Switch the theme (global CSS variables update)
    themeStore.setTheme(name)
    await nextTick()

    // Force a paint frame so global variables are resolved
    await waitForNextFrame()

    // 3. Parse target values from global theme
    const { primaryTriplet, accentTriplet } = readGlobalPalette(root)
    const newChannels = snapshotFromTriplets(primaryTriplet, accentTriplet)

    // 4. Reduced motion: set final values immediately, no tween
    if (preferredReducedMotion.value) {
      setChannels(root, newChannels)
      return false
    }

    // 5. Reset to old values so UI doesn't snap to new global before tween
    setChannels(root, oldChannels)

    // 6. Build GSAP tween target — numeric values only
    const tweenVars: Record<string, number> = {
      '--auth-primary-r': newChannels.pr,
      '--auth-primary-g': newChannels.pg,
      '--auth-primary-b': newChannels.pb,
      '--auth-accent-r': newChannels.ar,
      '--auth-accent-g': newChannels.ag,
      '--auth-accent-b': newChannels.ab,
    }

    return new Promise(resolve => {
      activeTween = gsap.to(root, {
        ...tweenVars,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => {
          // Ensure final values are set exactly (GSAP numeric interpolation
          // is reliable, but we set explicitly for safety)
          setChannels(root, newChannels)
          activeTween = null
          resolve(true)
        },
        onInterrupt: () => {
          // Another click — don't clear, the next call will set up its own tween
          activeTween = null
          resolve(false)
        },
      })
    })
  }

  function dispose(): void {
    activeTween?.kill()
    activeTween = null
  }

  onBeforeUnmount(dispose)

  return { switchPalette, dispose }
}
