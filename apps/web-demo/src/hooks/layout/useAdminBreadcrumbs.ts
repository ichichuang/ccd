import type { ComputedRef, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordName, RouteLocationNormalizedLoaded } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Composer } from 'vue-i18n'
import type { PrimeVueTieredMenuInstance } from '@ccd/vue-primevue-adapter'
import { getActiveDistance, goToRoute, type PrimeMenuModelItem } from '@/router/utils/helper'

/** 面包屑一级子项（弹层内展示） */
export interface BreadcrumbChildItem {
  path: string
  name?: RouteRecordName
  title: string
  icon?: string
}

/** 面包屑项（含可选子项列表，用于仅目录父级点击弹层） */
export interface AdminBreadcrumbItem {
  path: string
  redirect?: string
  name?: RouteRecordName
  allowRedirect?: boolean
  title: string
  icon?: string
  childItems?: BreadcrumbChildItem[]
}

export function useAdminBreadcrumbs(): {
  route: RouteLocationNormalizedLoaded
  t: Composer['t']
  breadcrumbs: ComputedRef<AdminBreadcrumbItem[]>
  openDropdownPath: Ref<string | null>
  onMenuHide: (itemPath: string) => void
  getActiveDistance: (item: PrimeMenuModelItem) => number // wraps getActiveDistance(route, item)
  bindBreadcrumbMenuRef: (path: string) => (el: unknown) => void
  childItemsToPrimeModel: (childItems: BreadcrumbChildItem[]) => PrimeMenuModelItem[]
  onBreadcrumbClick: (item: AdminBreadcrumbItem, isLast: boolean, e: Event) => void
  handleTieredMenuClick: (
    item: PrimeMenuModelItem,
    ev: Event,
    action?: { onClick?: (ev: Event) => void }
  ) => void
} {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  /** 每个带子项的面包屑节点对应一个独立的 TieredMenu 实例，key 使用该节点 path */
  const breadcrumbMenuRefs = ref<Map<string, PrimeVueTieredMenuInstance>>(new Map())
  /** 当前展开的下拉对应面包屑项 path，用于展开/收起不同图标 */
  const openDropdownPath = ref<string | null>(null)

  const onMenuHide = (itemPath: string) => {
    if (openDropdownPath.value === itemPath) {
      openDropdownPath.value = null
    }
  }

  const getActiveDistanceForItem = (item: PrimeMenuModelItem) => getActiveDistance(route, item)

  const setBreadcrumbMenuRef = (key: string, el: PrimeVueTieredMenuInstance | null) => {
    if (el) {
      breadcrumbMenuRefs.value.set(key, el)
    } else {
      breadcrumbMenuRefs.value.delete(key)
    }
  }

  const bindBreadcrumbMenuRef = (path: string) => (el: unknown) => {
    setBreadcrumbMenuRef(path, el as PrimeVueTieredMenuInstance | null)
  }

  // 路由变化时关闭下拉并清空 model
  watch(
    () => route.fullPath,
    () => {
      breadcrumbMenuRefs.value.forEach(menu => menu.hide())
      openDropdownPath.value = null
    }
  )

  /** 面包屑子项转 PrimeVue TieredMenu model */
  const childItemsToPrimeModel = (childItems: BreadcrumbChildItem[]): PrimeMenuModelItem[] =>
    childItems.map(c => ({
      key: c.path,
      label: c.title,
      icon: c.icon,
      route: {
        path: c.path,
        name: typeof c.name === 'string' ? c.name : undefined,
      },
      level: 0,
    }))

  const getResolvedPath = (item: { name?: RouteRecordName; path: string }) => {
    if (item.name) {
      try {
        const resolved = router.resolve({ name: item.name, params: route.params })
        return resolved.href
      } catch {
        // Fallback
      }
    }

    let path = item.path
    if (path.includes(':')) {
      Object.keys(route.params).forEach(key => {
        path = path.replace(`:${key}`, route.params[key] as string)
      })
    }
    return path
  }

  const breadcrumbs = computed(() => {
    const matched = route.matched.filter(
      item =>
        item.meta && (item.meta.title || item.meta.titleKey) && item.meta.hideBreadcrumb !== true
    )

    return matched.map(item => {
      const redirect = typeof item.redirect === 'string' ? item.redirect : undefined
      const allowRedirect = Boolean(item.redirect || item.children.length === 0)

      const rawChildren = Array.isArray(item.children) ? item.children : []
      const visibleChildren = rawChildren.filter(
        child =>
          child.meta &&
          child.meta.showLink !== false &&
          (child.meta.title != null || child.meta.titleKey != null) &&
          child.meta.hideBreadcrumb !== true
      )

      const childItems: BreadcrumbChildItem[] | undefined =
        visibleChildren.length > 0
          ? visibleChildren
              .sort((a, b) => ((a.meta?.rank as number) ?? 999) - ((b.meta?.rank as number) ?? 999))
              .map(child => ({
                path: child.path,
                name: child.name,
                title: child.meta?.titleKey
                  ? t(child.meta.titleKey as string)
                  : ((child.meta?.title as string) ?? ''),
                icon: child.meta?.icon,
              }))
          : undefined

      return {
        path: item.path,
        redirect,
        name: item.name,
        allowRedirect,
        title: item.meta.titleKey ? t(item.meta.titleKey as string) : (item.meta.title as string),
        icon: item.meta.icon,
        childItems: childItems?.length ? childItems : undefined,
      } as AdminBreadcrumbItem
    })
  })

  const handleLink = (item: AdminBreadcrumbItem) => {
    if (item.redirect) {
      router.push(item.redirect)
      return
    }
    const targetPath = getResolvedPath(item)
    router.push(targetPath)
  }

  const handleFolderClick = (item: AdminBreadcrumbItem, e: Event) => {
    if (!item.childItems?.length) {
      handleLink(item)
      return
    }

    const menuRef = breadcrumbMenuRefs.value.get(item.path)
    if (!menuRef) return

    if (openDropdownPath.value === item.path) {
      menuRef.hide()
      openDropdownPath.value = null
      return
    }

    breadcrumbMenuRefs.value.forEach((ref, key) => {
      if (key !== item.path) ref.hide()
    })

    openDropdownPath.value = item.path
    nextTick(() => {
      menuRef.toggle(e)
    })
  }

  const onBreadcrumbClick = (item: AdminBreadcrumbItem, isLast: boolean, e: Event) => {
    if (isLast) return
    if (item.childItems?.length) {
      e.preventDefault()
      e.stopPropagation()
      handleFolderClick(item, e)
    } else {
      handleLink(item)
    }
  }

  const handleTieredMenuClick = (
    item: PrimeMenuModelItem,
    ev: Event,
    action?: { onClick?: (ev: Event) => void }
  ) => {
    if (item.route?.path) {
      ev.preventDefault()
      goToRoute(item.route?.name ?? item.route?.path, undefined, undefined, false)
    }
    if (typeof action?.onClick === 'function') action.onClick(ev)
  }

  return {
    route,
    t,
    breadcrumbs,
    openDropdownPath,
    onMenuHide,
    getActiveDistance: getActiveDistanceForItem,
    bindBreadcrumbMenuRef,
    childItemsToPrimeModel,
    onBreadcrumbClick,
    handleTieredMenuClick,
  }
}
