export interface ConsoleLoggerTarget {
  debug(message?: unknown, ...optionalParams: unknown[]): void
  info(message?: unknown, ...optionalParams: unknown[]): void
  warn(message?: unknown, ...optionalParams: unknown[]): void
  error(message?: unknown, ...optionalParams: unknown[]): void
}

export interface ConsoleLogger {
  debug(message: string, context?: unknown): void
  info(message: string, context?: unknown): void
  warn(message: string, context?: unknown): void
  error(message: string, context?: unknown): void
}

function writeConsole(
  target: ConsoleLoggerTarget,
  level: keyof ConsoleLogger,
  message: string,
  context: unknown
): void {
  if (context === undefined) {
    target[level](message)
    return
  }

  target[level](message, context)
}

export function createConsoleLogger(target: ConsoleLoggerTarget): ConsoleLogger {
  return {
    debug(message, context) {
      writeConsole(target, 'debug', message, context)
    },
    info(message, context) {
      writeConsole(target, 'info', message, context)
    },
    warn(message, context) {
      writeConsole(target, 'warn', message, context)
    },
    error(message, context) {
      writeConsole(target, 'error', message, context)
    },
  }
}
