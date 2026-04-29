import { installAuthBridge } from '@/infra/auth/tokenProvider'
import router from '@/router'
import { useUserStoreWithOut } from '@/stores/modules/session'

export function setupAuthBridge(): void {
  installAuthBridge({
    readToken: () => useUserStoreWithOut().getToken,
    onUnauthorized: async () => {
      const userStore = useUserStoreWithOut()
      await userStore.logout()

      const currentPath = router.currentRoute.value.fullPath
      if (currentPath !== '/login') {
        await router.replace({
          path: '/login',
          query: { redirect: currentPath },
        })
      }
    },
  })
}
