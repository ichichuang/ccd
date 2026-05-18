export type RuntimeFamily = 'web' | 'desktop' | 'portable'

export interface RuntimeCapabilities {
  tools: string[]
  network: boolean
  sandbox: 'none' | 'local' | 'isolated' | 'remote'
  portable: boolean
  remote: boolean
  hooks: boolean
}

export interface RuntimeRequirementSet {
  network?: boolean
  portable?: boolean
  sandbox?: boolean
  desktop?: boolean
  remote?: boolean
}

export interface ProviderContract {
  id: string
  expectedTransport: string
  runtimeFamilies: RuntimeFamily[]
}

export interface TransportContract {
  id: string
  protocol: 'http' | 'stdio' | 'ipc' | 'native'
  isolated: boolean
}

export interface RuntimeAdapterContract {
  id: string
  family: RuntimeFamily
  capabilities: RuntimeCapabilities
}
