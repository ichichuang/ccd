/**
 * Theme Engine v4 — CSS Variable Compiler
 *
 * Pure function. Converts a ResolvedTheme into ThemeCssVars (RGB channel strings only).
 * No branching, no optional chaining, no DOM access.
 *
 * All values are guaranteed to be valid hex at this point (validated by resolver).
 */

import { toRgbChannels, parseColor } from './color.js'
import type { ThemeCssVars } from '../types.js'
import type { ResolvedTheme } from './resolver.js'
import { emitThemeEvent } from './observability.js'

function rgb(hex: string): string {
  return toRgbChannels(parseColor(hex))
}

export function compileThemeVars(resolved: ResolvedTheme): ThemeCssVars {
  const vars: ThemeCssVars = {
    '--background': rgb(resolved.background),
    '--foreground': rgb(resolved.foreground),

    '--card': rgb(resolved.card),
    '--card-foreground': rgb(resolved.cardForeground),

    '--popover': rgb(resolved.card),
    '--popover-foreground': rgb(resolved.cardForeground),

    '--primary': rgb(resolved.primary.base),
    '--primary-foreground': rgb(resolved.primary.foreground),
    '--primary-hover': rgb(resolved.primary.hover),
    '--primary-hover-foreground': rgb(resolved.primary.hoverForeground),
    '--primary-light': rgb(resolved.primary.light),
    '--primary-light-foreground': rgb(resolved.primary.lightForeground),

    '--secondary': rgb(resolved.secondary.base),
    '--secondary-foreground': rgb(resolved.secondary.foreground),

    '--muted': rgb(resolved.muted.base),
    '--muted-foreground': rgb(resolved.muted.foreground),

    '--accent': rgb(resolved.accent.base),
    '--accent-foreground': rgb(resolved.accent.foreground),
    '--accent-hover': rgb(resolved.accent.hover),
    '--accent-hover-foreground': rgb(resolved.accent.hoverForeground),
    '--accent-light': rgb(resolved.accent.light),
    '--accent-light-foreground': rgb(resolved.accent.lightForeground),

    '--danger': rgb(resolved.danger.base),
    '--danger-foreground': rgb(resolved.danger.foreground),
    '--danger-hover': rgb(resolved.danger.hover),
    '--danger-hover-foreground': rgb(resolved.danger.hoverForeground),
    '--danger-light': rgb(resolved.danger.light),
    '--danger-light-foreground': rgb(resolved.danger.lightForeground),

    '--warn': rgb(resolved.warn.base),
    '--warn-foreground': rgb(resolved.warn.foreground),
    '--warn-hover': rgb(resolved.warn.hover),
    '--warn-hover-foreground': rgb(resolved.warn.hoverForeground),
    '--warn-light': rgb(resolved.warn.light),
    '--warn-light-foreground': rgb(resolved.warn.lightForeground),

    '--success': rgb(resolved.success.base),
    '--success-foreground': rgb(resolved.success.foreground),
    '--success-hover': rgb(resolved.success.hover),
    '--success-hover-foreground': rgb(resolved.success.hoverForeground),
    '--success-light': rgb(resolved.success.light),
    '--success-light-foreground': rgb(resolved.success.lightForeground),

    '--info': rgb(resolved.info.base),
    '--info-foreground': rgb(resolved.info.foreground),
    '--info-hover': rgb(resolved.info.hover),
    '--info-hover-foreground': rgb(resolved.info.hoverForeground),
    '--info-light': rgb(resolved.info.light),
    '--info-light-foreground': rgb(resolved.info.lightForeground),

    '--help': rgb(resolved.help.base),
    '--help-foreground': rgb(resolved.help.foreground),
    '--help-hover': rgb(resolved.help.hover),
    '--help-hover-foreground': rgb(resolved.help.hoverForeground),
    '--help-light': rgb(resolved.help.light),
    '--help-light-foreground': rgb(resolved.help.lightForeground),

    '--border': rgb(resolved.border),
    '--input': rgb(resolved.input),
    '--ring': rgb(resolved.ring),

    '--sidebar-background': rgb(resolved.sidebar.background),
    '--sidebar-foreground': rgb(resolved.sidebar.foreground),
    '--sidebar-primary': rgb(resolved.sidebar.primary),
    '--sidebar-primary-foreground': rgb(resolved.sidebar.primaryForeground),
    '--sidebar-accent': rgb(resolved.sidebar.accent),
    '--sidebar-accent-foreground': rgb(resolved.sidebar.accentForeground),
    '--sidebar-border': rgb(resolved.sidebar.border),
    '--sidebar-ring': rgb(resolved.sidebar.ring),
  }

  for (const key of Object.keys(vars).sort()) {
    emitThemeEvent({ type: 'TOKEN_DERIVED', token: key, source: 'semantic' })
  }

  return vars
}
