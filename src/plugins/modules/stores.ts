import store from '@/stores'
import { useThemeStore } from '@/stores/modules/theme'
import { useSizeStore } from '@/stores/modules/size'
import { useDeviceStore } from '@/stores/modules/device'
import { useLocaleStore } from '@/stores/modules/locale'

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
