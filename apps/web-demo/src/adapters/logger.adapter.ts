import type { Logger } from '@ccd/core'

export const appLogger: Logger = {
  debug(message, details) {
    if (details === undefined) {
      globalThis.console.debug(message)
      return
    }

    globalThis.console.debug(message, details)
  },
  info(message, details) {
    if (details === undefined) {
      globalThis.console.info(message)
      return
    }

    globalThis.console.info(message, details)
  },
  warn(message, details) {
    if (details === undefined) {
      globalThis.console.warn(message)
      return
    }

    globalThis.console.warn(message, details)
  },
  error(message, details) {
    if (details === undefined) {
      globalThis.console.error(message)
      return
    }

    globalThis.console.error(message, details)
  },
}
