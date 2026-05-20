/**
 * Project brand metadata.
 * Source of truth: project.config.json. Run pnpm project:sync after edits.
 */
export const brand = {
  /** Package, URL, browser-title, and og:title identifier. */
  name: 'ccd',
  /** Header display title. */
  displayName: 'CCD',
  /** Header display subtitle. */
  subtitle: 'Platform',
  /** package.json description and meta description. */
  description: 'Self-protecting deterministic multi-runtime platform architecture.',
  /** og:description slogan. */
  slogan: 'Self-protecting deterministic multi-runtime platform architecture',
  /** og:author and meta author. */
  author: 'Chi Chuang',
} as const

export type Brand = typeof brand
