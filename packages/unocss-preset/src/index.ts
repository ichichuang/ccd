import type { UserConfig } from 'unocss'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import {
  configureCcdUnoPresetProject,
  getCustomIconClasses,
  getEngineSafelist,
  getPresetIconsCollections,
  invalidateIconCaches,
} from './safelist/index.js'
import { semanticShortcuts } from './shortcuts/semanticShortcuts.js'
import { theme } from './theme/index.js'

type CcdUnoEngineConfig = Pick<UserConfig, 'safelist' | 'shortcuts' | 'rules' | 'theme'>
type CcdUnoTheme = NonNullable<UserConfig['theme']>
type CcdUnoShortcuts = NonNullable<UserConfig['shortcuts']>

export interface CcdUnoExtensionOptions {
  safelist?: NonNullable<UserConfig['safelist']>
  shortcuts?: CcdUnoShortcuts
  rules?: NonNullable<UserConfig['rules']>
  theme?: CcdUnoTheme
}

export {
  configureCcdUnoPresetProject,
  getCustomIconClasses,
  getEngineSafelist,
  getPresetIconsCollections,
  invalidateIconCaches,
  semanticShortcuts,
  theme,
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function mergeThemeRecords(
  base: Record<string, unknown>,
  extension: Record<string, unknown>
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(extension)) {
    const current = next[key]
    next[key] =
      isPlainRecord(current) && isPlainRecord(value) ? mergeThemeRecords(current, value) : value
  }

  return next
}

export function mergeCcdUnoTheme(
  baseTheme: CcdUnoTheme,
  extensionTheme?: CcdUnoTheme
): CcdUnoTheme {
  if (!extensionTheme) return baseTheme
  return mergeThemeRecords(
    baseTheme as Record<string, unknown>,
    extensionTheme as Record<string, unknown>
  ) as CcdUnoTheme
}

export function createCcdUnoTheme(extensionTheme?: CcdUnoTheme): CcdUnoTheme {
  const transitionTimingFunction = theme.transitionTimingFunction as Record<string, string>
  const themeResolved = {
    ...theme,
    easing: {
      ...transitionTimingFunction,
    },
  } as typeof theme & { easing: Record<string, string> }

  return mergeCcdUnoTheme(themeResolved, extensionTheme)
}

export function createCcdUnoEngineConfig(
  extensions: CcdUnoExtensionOptions = {}
): CcdUnoEngineConfig {
  const extensionShortcuts = Array.isArray(extensions.shortcuts)
    ? extensions.shortcuts
    : extensions.shortcuts
      ? [extensions.shortcuts]
      : []

  return {
    safelist: [...getEngineSafelist(), ...(extensions.safelist ?? [])],
    shortcuts: [semanticShortcuts, ...extensionShortcuts],
    rules: [
      ['group', {}],
      ['safe-top', { 'padding-top': 'var(--safe-top)' }],
      ['safe-bottom', { 'padding-bottom': 'var(--safe-bottom)' }],
      ['safe-left', { 'padding-left': 'var(--safe-left)' }],
      ['safe-right', { 'padding-right': 'var(--safe-right)' }],
      ...(extensions.rules ?? []),
    ],
    theme: createCcdUnoTheme(extensions.theme),
  }
}

export interface CcdUnoConfigOptions {
  root?: string
  tsJsGlob?: string
  extensions?: CcdUnoExtensionOptions
}

export function createCcdUnoConfig(options: CcdUnoConfigOptions = {}): UserConfig {
  configureCcdUnoPresetProject({ root: options.root })

  const projectTsJsGlob = options.tsJsGlob ?? 'apps/web-demo/src/**/*.{js,ts}'

  return defineConfig({
    presets: [
      presetUno({ dark: 'class' }),
      presetAttributify(),
      presetTypography(),
      presetIcons({
        prefix: 'i-',
        extraProperties: { display: 'inline-block' },
        collections: getPresetIconsCollections(),
      }),
    ],

    ...createCcdUnoEngineConfig(options.extensions),

    content: {
      pipeline: {
        include: [
          /\.(vue|svelte|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
          projectTsJsGlob,
        ],
        exclude: [
          /[\\/]node_modules[\\/]/,
          /[\\/]\.pnpm[\\/]/,
          /[\\/]dist[\\/]/,
          /[\\/]\.git[\\/]/,
          /[\\/]\.ai[\\/]/,
          /[\\/]\.cursor[\\/]/,
          /[\\/]src-tauri[\\/]target[\\/]/,
          /\.d\.ts($|\?)/,
        ],
      },
    },

    transformers: [transformerDirectives(), transformerVariantGroup()],
  })
}
