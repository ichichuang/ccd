import type { Logger } from '@ccd/core'
import { createConsoleLogger } from '@ccd/shared-utils'

export const appLogger: Logger = createConsoleLogger(globalThis.console)
