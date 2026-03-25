import type { UserShortcuts } from 'unocss'
import { semanticShortcuts } from './shortcuts/semanticShortcuts'

// UnoCSS adapter layer for the Design Engine.
export const shortcuts: UserShortcuts = [semanticShortcuts]
