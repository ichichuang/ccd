/**
 * PrimeVue Preset - Components Layer
 * 聚合所有组件 preset，按 base / form / overlay / data / menu-nav-misc 合并
 */

import type { ColorAdapter } from '../colorAdapter'
import { buildBaseComponents } from './base'
import { buildFormComponents } from './form'
import { buildOverlayComponents } from './overlay'
import { buildDataComponents } from './data'
import { buildMenuNavMiscComponents } from './menuNavMisc'

export function buildAllComponents(colors: ColorAdapter): Record<string, unknown> {
  return {
    ...buildBaseComponents(),
    ...buildFormComponents(colors),
    ...buildOverlayComponents(),
    ...buildDataComponents(),
    ...buildMenuNavMiscComponents(),
  }
}
