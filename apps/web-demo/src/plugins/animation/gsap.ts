import { gsap } from 'gsap'

export { gsap }

export type GsapContext = ReturnType<typeof gsap.context>

export interface GsapContextOptions {
  scope?: Element | null
  isReducedMotion?: boolean
  ignoreReducedMotion?: boolean
}

export interface ScopedGsapContext {
  context: GsapContext | null
  isReducedMotion: boolean
  revert: () => void
}

export function createScopedGsapContext(
  setup: () => void,
  options: GsapContextOptions = {}
): ScopedGsapContext {
  const isReducedMotion = !options.ignoreReducedMotion && options.isReducedMotion === true

  if (isReducedMotion || !options.scope) {
    return {
      context: null,
      isReducedMotion,
      revert: () => undefined,
    }
  }

  const context = gsap.context(setup, options.scope)

  return {
    context,
    isReducedMotion,
    revert: () => context.revert(),
  }
}
