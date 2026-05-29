import type { InjectionKey } from 'vue'
import type { TableController } from '../core/TableController'
import type { ProTableUrlSyncOptions } from '../types/props'

export interface UseProTableUrlSyncOptions<T extends Record<string, unknown>> {
  urlSync: boolean | ProTableUrlSyncOptions | undefined
  ctrl: TableController<T>
}

export interface UseProTableUrlSyncReturn {
  applyInitialRoute: () => void
  destroy: () => void
}

export type ProTableUrlSyncAdapter<T extends Record<string, unknown> = Record<string, unknown>> = (
  options: UseProTableUrlSyncOptions<T>
) => UseProTableUrlSyncReturn | void

export const PRO_TABLE_URL_SYNC_ADAPTER_KEY = Symbol(
  'PRO_TABLE_URL_SYNC_ADAPTER_KEY'
) as InjectionKey<ProTableUrlSyncAdapter>
