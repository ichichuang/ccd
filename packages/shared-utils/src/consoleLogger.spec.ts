import { describe, expect, it, vi } from 'vitest'
import { createConsoleLogger } from './consoleLogger'
import type { ConsoleLoggerTarget } from './consoleLogger'

function createTarget() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } satisfies ConsoleLoggerTarget
}

describe('createConsoleLogger', () => {
  it('writes messages to the matching console method', () => {
    const target = createTarget()
    const logger = createConsoleLogger(target)

    logger.debug('debug message')
    logger.info('info message')
    logger.warn('warn message')
    logger.error('error message')

    expect(target.debug).toHaveBeenCalledWith('debug message')
    expect(target.info).toHaveBeenCalledWith('info message')
    expect(target.warn).toHaveBeenCalledWith('warn message')
    expect(target.error).toHaveBeenCalledWith('error message')
  })

  it('passes context only when provided', () => {
    const target = createTarget()
    const logger = createConsoleLogger(target)
    const context = { requestId: 'req-1' }

    logger.warn('with context', context)
    logger.warn('without context')

    expect(target.warn).toHaveBeenNthCalledWith(1, 'with context', context)
    expect(target.warn).toHaveBeenNthCalledWith(2, 'without context')
  })
})
