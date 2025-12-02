import { getCurrentRoute, getFlatRouteList } from '@/common'
import { useLocale } from '@/hooks'
import { useLayoutStore } from '@/stores'
import type { DefineComponent } from 'vue'
import { computed, defineComponent, h, ref } from 'vue'
import DesktopBreadcrumb from './components/DesktopBreadcrumb.vue'
import MobileBreadcrumb from './components/MobileBreadcrumb.vue'

interface HomeConfig {
  icon: string
  route: string
}

interface BreadcrumbItem {
  label: string
  route?: string
  icon?: string
}

export default defineComponent({
  name: 'AppBreadcrumb',
  setup() {
    const layoutStore = useLayoutStore()
    const isMobile = computed(() => layoutStore.getIsMobile)

    const { $t } = useLocale()

    const currentRouteTitle = computed(() => {
      const currentRoute = getCurrentRoute()
      const titleKey = currentRoute.meta?.titleKey as string | undefined
      if (titleKey) {
        return $t(titleKey) || (currentRoute.meta?.title as string | undefined) || ''
      }
      return (
        (currentRoute.meta?.title as string | undefined) ||
        (currentRoute.name as string | undefined) ||
        ''
      )
    })

    const home = ref<HomeConfig>({
      icon: 'ri-slack-line',
      route: '/',
    })

    const items = computed<BreadcrumbItem[]>(() => {
      const currentPath = getCurrentRoute().path
      const breadcrumbItems: BreadcrumbItem[] = []

      const pathSegments = currentPath.split('/').filter(Boolean)
      let currentPathBuilder = ''

      for (const segment of pathSegments) {
        currentPathBuilder += `/${segment}`
        const matchedRoute = getFlatRouteList().find(r => r.path === currentPathBuilder)
        if (matchedRoute) {
          const titleKey = matchedRoute.meta?.titleKey as string | undefined
          let label = ''

          if (titleKey) {
            label = $t(titleKey)
          } else if (matchedRoute.meta?.title) {
            label = matchedRoute.meta.title as string
          } else {
            label = matchedRoute.name as string
          }

          // 只设置 label，不设置 route，这样就不会有点击跳转功能
          const breadcrumbItem: BreadcrumbItem = { label }
          breadcrumbItems.push(breadcrumbItem)
        }
      }

      return breadcrumbItems
    })

    const desktopComponent = DesktopBreadcrumb as unknown as DefineComponent<{
      home: HomeConfig
      items: BreadcrumbItem[]
      currentRouteTitle: string
    }>

    const mobileComponent = MobileBreadcrumb as unknown as DefineComponent<{
      home: HomeConfig
      items: BreadcrumbItem[]
      currentRouteTitle: string
    }>

    return () => {
      const homeValue = home.value
      const itemsValue = items.value
      const titleValue = currentRouteTitle.value

      const component = isMobile.value ? mobileComponent : desktopComponent

      return h(
        'div',
        { class: 'full' },
        h(component, {
          home: homeValue,
          items: itemsValue,
          currentRouteTitle: titleValue,
        })
      )
    }
  },
})
