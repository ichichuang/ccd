/**
 * Project brand metadata.
 * Source of truth: project.config.json. Run pnpm project:sync after edits.
 */
export const brand = {
  /** Package, URL, browser-title, and og:title identifier. */
  name: "ccd",
  /** Header display title. */
  displayName: "CCD",
  /** Header display subtitle. */
  subtitle: 'Platform',
  /** Product and meta description. */
  description: "Reusable Vue and Tauri application platform.",
  /** Product positioning used for og:description. */
  slogan: "Reusable Vue and Tauri application platform.",
  /** og:author and meta author. */
  author: "Chi Chuang",
} as const

export type Brand = typeof brand
