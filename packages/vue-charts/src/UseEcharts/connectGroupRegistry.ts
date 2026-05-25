import { connect as echartsConnect, disconnect as echartsDisconnect } from 'echarts/core'

export interface ConnectGroupRegistry {
  register: (groupId: string, token: symbol) => void
  unregister: (groupId: string, token: symbol) => void
  isRegistered: (groupId: string, token: symbol) => boolean
  getGroupMemberCount: (groupId: string) => number
}

export function createConnectGroupRegistry(
  connectFn: (groupId: string) => string = echartsConnect,
  disconnectFn: (groupId: string) => void = echartsDisconnect
): ConnectGroupRegistry {
  const groupMembers = new Map<string, Set<symbol>>()

  const register = (groupId: string, token: symbol): void => {
    if (!groupId) return

    const members = groupMembers.get(groupId) ?? new Set<symbol>()
    if (members.has(token)) {
      if (!groupMembers.has(groupId)) {
        groupMembers.set(groupId, members)
      }
      return
    }

    const shouldConnect = members.size === 0
    members.add(token)
    groupMembers.set(groupId, members)

    if (shouldConnect) {
      connectFn(groupId)
    }
  }

  const unregister = (groupId: string, token: symbol): void => {
    if (!groupId) return

    const members = groupMembers.get(groupId)
    if (!members || !members.has(token)) return

    members.delete(token)
    if (members.size === 0) {
      groupMembers.delete(groupId)
      disconnectFn(groupId)
      return
    }

    groupMembers.set(groupId, members)
  }

  const isRegistered = (groupId: string, token: symbol): boolean => {
    if (!groupId) return false
    return groupMembers.get(groupId)?.has(token) ?? false
  }

  const getGroupMemberCount = (groupId: string): number => {
    if (!groupId) return 0
    return groupMembers.get(groupId)?.size ?? 0
  }

  return {
    register,
    unregister,
    isRegistered,
    getGroupMemberCount,
  }
}

const sharedConnectGroupRegistry = createConnectGroupRegistry()

export const registerConnectGroup = sharedConnectGroupRegistry.register
export const unregisterConnectGroup = sharedConnectGroupRegistry.unregister
export const isConnectGroupRegistered = sharedConnectGroupRegistry.isRegistered
export const getConnectGroupMemberCount = sharedConnectGroupRegistry.getGroupMemberCount
