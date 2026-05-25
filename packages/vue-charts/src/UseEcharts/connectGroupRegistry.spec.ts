import { describe, expect, it, vi } from 'vitest'
import { createConnectGroupRegistry } from './connectGroupRegistry'

describe('connectGroupRegistry', () => {
  it('register group calls connect only on first member', () => {
    const connect = vi.fn()
    const disconnect = vi.fn()
    const registry = createConnectGroupRegistry(connect, disconnect)
    const tokenA = Symbol('a')
    const tokenB = Symbol('b')

    registry.register('g1', tokenA)
    registry.register('g1', tokenB)

    expect(connect).toHaveBeenCalledTimes(1)
    expect(connect).toHaveBeenCalledWith('g1')
    expect(registry.getGroupMemberCount('g1')).toBe(2)
  })

  it('multiple charts in same group disconnect only after last unregister', () => {
    const connect = vi.fn()
    const disconnect = vi.fn()
    const registry = createConnectGroupRegistry(connect, disconnect)
    const tokenA = Symbol('a')
    const tokenB = Symbol('b')

    registry.register('g2', tokenA)
    registry.register('g2', tokenB)

    registry.unregister('g2', tokenA)
    expect(disconnect).not.toHaveBeenCalled()
    expect(registry.getGroupMemberCount('g2')).toBe(1)

    registry.unregister('g2', tokenB)
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(disconnect).toHaveBeenCalledWith('g2')
    expect(registry.getGroupMemberCount('g2')).toBe(0)
  })

  it('group change unregisters old and registers new', () => {
    const connect = vi.fn()
    const disconnect = vi.fn()
    const registry = createConnectGroupRegistry(connect, disconnect)
    const token = Symbol('chart')

    registry.register('old-group', token)
    registry.unregister('old-group', token)
    registry.register('new-group', token)

    expect(connect).toHaveBeenNthCalledWith(1, 'old-group')
    expect(disconnect).toHaveBeenNthCalledWith(1, 'old-group')
    expect(connect).toHaveBeenNthCalledWith(2, 'new-group')
    expect(registry.isRegistered('new-group', token)).toBe(true)
    expect(registry.isRegistered('old-group', token)).toBe(false)
  })

  it('cleanup is idempotent', () => {
    const connect = vi.fn()
    const disconnect = vi.fn()
    const registry = createConnectGroupRegistry(connect, disconnect)
    const token = Symbol('chart')

    registry.register('g3', token)
    registry.unregister('g3', token)
    registry.unregister('g3', token)
    registry.unregister('missing-group', token)

    expect(connect).toHaveBeenCalledTimes(1)
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(registry.getGroupMemberCount('g3')).toBe(0)
  })
})
