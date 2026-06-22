// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { consolePages, getConsolePage } from './consolePages'
import type { ConsolePageModel } from './types'

void ({} as ConsolePageModel)

describe('consolePages', () => {
  it('every valid route name returns its model', () => {
    const pageNames = Object.keys(consolePages)
    expect(pageNames.length).toBeGreaterThan(0)

    for (const name of pageNames) {
      const model = getConsolePage(name)
      expect(model).toBeDefined()
      expect(model!.id).toBe(name)
    }
  })

  it('unknown names return undefined', () => {
    expect(getConsolePage('NonExistentRoute')).toBeUndefined()
    expect(getConsolePage('')).toBeUndefined()
    expect(getConsolePage(123)).toBeUndefined()
    expect(getConsolePage(null)).toBeUndefined()
    expect(getConsolePage(undefined)).toBeUndefined()
  })

  it('no topology fallback for unknown names', () => {
    const result = getConsolePage('SomeRandomPage')
    expect(result).toBeUndefined()
    // Must not return ArchitectureTopology as fallback
    if (result) {
      expect(result.id).not.toBe('ArchitectureTopology')
    }
  })

  it('lookup performs no navigation', () => {
    // getConsolePage is a pure function — it should never trigger side effects
    const beforeKeys = Object.keys(consolePages)
    getConsolePage('NonExistent')
    getConsolePage('ArchitectureTopology')
    const afterKeys = Object.keys(consolePages)
    expect(afterKeys).toEqual(beforeKeys)
  })

  it('ArchitectureTopology model is still accessible by name', () => {
    const model = getConsolePage('ArchitectureTopology')
    expect(model).toBeDefined()
    expect(model!.id).toBe('ArchitectureTopology')
    expect(model!.key).toBe('topology')
  })
})
