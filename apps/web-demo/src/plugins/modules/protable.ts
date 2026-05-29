import type { App } from 'vue'
import { PRO_TABLE_URL_SYNC_ADAPTER_KEY } from '@ccd/vue-ui'
import { useProTableUrlSync } from '@/hooks/modules/useProTableUrlSync'

export const setupProTable = (app: App) => {
  app.provide(PRO_TABLE_URL_SYNC_ADAPTER_KEY, useProTableUrlSync)
}
