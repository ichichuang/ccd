import { installAuthBridge } from '@/infra/auth/tokenProvider'
import { useUserStoreWithOut } from '@/stores/modules/session'

export function setupAuthBridge(): void {
  installAuthBridge({
    readToken: () => useUserStoreWithOut().getToken,
    onUnauthorized: async () => {
      await useUserStoreWithOut().logout()
    },
  })
}
