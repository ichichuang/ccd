import type { ConsolePageModel } from './types'
import { architecturePages } from './architecture'
import { desktopPages } from './desktop'
import { runtimePages } from './runtime'
import { systemPages } from './system'
import { uiPages } from './ui'

export type {
  ConsoleCapability,
  ConsoleCommand,
  ConsoleEvidence,
  ConsolePageModel,
  ConsoleStat,
  ConsoleStatusItem,
} from './types'

export const consolePages: Record<string, ConsolePageModel> = {
  ...architecturePages,
  ...runtimePages,
  ...uiPages,
  ...systemPages,
  ...desktopPages,
}

export function getConsolePage(routeName: unknown): ConsolePageModel {
  if (typeof routeName === 'string' && routeName in consolePages) {
    return consolePages[routeName]
  }
  return consolePages.ArchitectureTopology
}
