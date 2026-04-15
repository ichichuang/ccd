import store from '@/stores'
import { useThemeStore } from '@/stores/modules/system'
import { useSizeStore } from '@/stores/modules/system'
import { useDeviceStore } from '@/stores/modules/system'
import { useLocaleStore } from '@/stores/modules/system'

export const setupStores = (app: App) => {
  app.use(store)

  const themeStore = useThemeStore()
  const sizeStore = useSizeStore()
  const deviceStore = useDeviceStore()
  const localeStore = useLocaleStore()
  themeStore.init()
  sizeStore.init()
  deviceStore.init()
  localeStore.initLocale()
}
