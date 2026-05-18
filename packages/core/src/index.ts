import type {
  CryptoProvider,
  EnvironmentProvider,
  FileSystemAdapter,
  Logger,
  NetworkClient,
  NetworkRequest,
  NetworkResponse,
  Scheduler,
  StorageAdapter,
} from '@ccd/contracts'

export type {
  CryptoProvider,
  EnvironmentProvider,
  FileSystemAdapter,
  Logger,
  NetworkClient,
  NetworkRequest,
  NetworkResponse,
  ScheduledTask,
  Scheduler,
  StorageAdapter,
} from '@ccd/contracts'

export interface CoreAdapters {
  storage: StorageAdapter
  network: NetworkClient
  logger: Logger
  filesystem?: FileSystemAdapter
  scheduler?: Scheduler
  crypto?: CryptoProvider
  environment?: EnvironmentProvider
}

export interface CoreRuntime {
  readonly adapters: CoreAdapters
  loadJson<T>(key: string, fallback: T): Promise<T>
  saveJson<T>(key: string, value: T): Promise<void>
  request<T = unknown>(request: NetworkRequest): Promise<NetworkResponse<T>>
}

export function createCoreRuntime(adapters: CoreAdapters): CoreRuntime {
  return {
    adapters,
    async loadJson(key, fallback) {
      const value = await adapters.storage.get(key)
      if (value === null) return fallback
      try {
        return JSON.parse(value) as unknown as typeof fallback
      } catch (error) {
        adapters.logger.warn('Failed to parse stored JSON value.', { key, error })
        return fallback
      }
    },
    async saveJson(key, value) {
      await adapters.storage.set(key, JSON.stringify(value))
    },
    request(request) {
      return adapters.network.request(request)
    },
  }
}
