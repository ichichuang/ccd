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

export {
  configureCcdUnoPresetProject,
  getCustomIconClasses,
  getEngineSafelist,
  getPresetIconsCollections,
  invalidateIconCaches,
  semanticShortcuts,
  theme,
}

export function createCcdUnoEngineConfig(): Pick<
  UserConfig,
  'safelist' | 'shortcuts' | 'rules' | 'theme'
> {
  const transitionTimingFunction = theme.transitionTimingFunction as Record<string, string>
  const themeResolved = {
    ...theme,
    easing: {
      ...transitionTimingFunction,
    },
  } as typeof theme & { easing: Record<string, string> }

  return {
    safelist: getEngineSafelist(),
    shortcuts: [semanticShortcuts],
    rules: [
      ['group', {}],
      ['safe-top', { 'padding-top': 'var(--safe-top)' }],
      ['safe-bottom', { 'padding-bottom': 'var(--safe-bottom)' }],
      ['safe-left', { 'padding-left': 'var(--safe-left)' }],
      ['safe-right', { 'padding-right': 'var(--safe-right)' }],
    ],
    theme: themeResolved,
  }
}

export interface CcdUnoConfigOptions {
  root?: string
  tsJsGlob?: string
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

    ...createCcdUnoEngineConfig(),

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
