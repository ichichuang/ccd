import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { usePermissionStore } from '@/stores/modules/session'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
import type { CScrollbar } from '@/components/CScrollbar'
import type { Ref } from 'vue'

export type ContextMenuAction = 'reload' | 'close' | 'closeOthers' | 'closeAll'

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  targetPath: string
}

export interface UseAdminTabsReturn {
  tabs: Ref<TabItem[]>
  scrollContainer: Ref<InstanceType<typeof CScrollbar> | null>
  tabsContainerRef: Ref<HTMLElement | null>
  activeTabStyle: Ref<{ left: string; width: string; opacity: string }>
  contextMenu: Ref<ContextMenuState>
  getTabLabel: (tab: TabItem) => string
  isActive: (tab: TabItem) => boolean
  updateActiveTabPosition: (behavior?: ScrollBehavior, options?: { skipScroll?: boolean }) => void
  setTabRef: (el: HTMLElement | null, path: string) => void
  onTabClick: (tab: TabItem) => void
  onCloseTab: (e: Event | undefined, tab: TabItem) => void
  onContextMenu: (e: MouseEvent, tab: TabItem) => void
  closeContextMenu: () => void
  handleContextAction: (action: ContextMenuAction) => void
  t: (key: string, ...args: unknown[]) => string
}

let routeReloadSeq = 0

export function useAdminTabs(): UseAdminTabsReturn {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const permissionStore = usePermissionStore()
  const { tabs } = storeToRefs(permissionStore)

  const scrollContainer = ref<InstanceType<typeof CScrollbar> | null>(null)
  const tabRefs = ref<Map<string, HTMLElement>>(new Map())
  const tabsContainerRef = ref<HTMLElement | null>(null)

  const activeTabStyle = ref({
    left: '0',
    width: '0',
    opacity: '0',
  })

  const contextMenu = ref<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetPath: '',
  })

  const getTabLabel = (tab: TabItem) => {
    return tab.titleKey ? t(tab.titleKey) : (tab.title ?? tab.name)
  }

  const isActive = (tab: TabItem) => {
    return route.path === tab.path
  }

  // 防重入 + 同一 tick 合并，避免 route/tabs/resize 多路触发导致栈溢出
  let isUpdatingPosition = false
  let pendingUpdate: { behavior: ScrollBehavior; skipScroll: boolean } | null = null
  let scheduled = false

  const updateActiveTabPosition = (
    behavior: ScrollBehavior = 'smooth',
    options?: { skipScroll?: boolean }
  ) => {
    const skipScroll = options?.skipScroll ?? false
    if (pendingUpdate) {
      pendingUpdate = { behavior, skipScroll }
      return
    }
    pendingUpdate = { behavior, skipScroll }
    if (scheduled) return
    scheduled = true
    nextTick(() => {
      scheduled = false
      const p = pendingUpdate
      pendingUpdate = null
      if (!p || isUpdatingPosition) return
      isUpdatingPosition = true
      try {
        const currentPath = route.path
        const activeTabEl = tabRefs.value.get(currentPath)

        if (activeTabEl) {
          activeTabStyle.value = {
            left: `${activeTabEl.offsetLeft}px`,
            width: `${activeTabEl.offsetWidth}px`,
            opacity: '1',
          }
          if (!p.skipScroll) {
            activeTabEl.scrollIntoView({
              behavior: p.behavior,
              block: 'nearest',
              inline: 'center',
            })
          }
        } else {
          activeTabStyle.value.opacity = '0'
        }
      } finally {
        isUpdatingPosition = false
      }
    })
  }

  const setTabRef = (el: HTMLElement | null, path: string) => {
    if (el) {
      tabRefs.value.set(path, el)
    } else {
      tabRefs.value.delete(path)
    }
  }

  const onTabClick = (tab: TabItem) => {
    contextMenu.value.visible = false
    if (tab.path !== route.path) {
      router.push(tab.path)
    }
  }

  const onCloseTab = (e: Event | undefined, tab: TabItem) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (tab.fixed || !tab.deletable) return

    const wasCurrent = isActive(tab)
    tabRefs.value.delete(tab.path)
    permissionStore.removeTab(tab.path)

    if (wasCurrent) {
      const remaining = tabs.value
      if (remaining.length > 0) {
        const nextTab = remaining[remaining.length - 1]
        router.push(nextTab.path)
      } else {
        router.push(import.meta.env.VITE_ROOT_REDIRECT || '/dashboard')
      }
    }
  }

  const onContextMenu = (e: MouseEvent, tab: TabItem) => {
    e.preventDefault()
    contextMenu.value = {
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetPath: tab.path,
    }
  }

  const closeContextMenu = () => {
    contextMenu.value.visible = false
  }

  const handleContextAction = (action: ContextMenuAction) => {
    const targetPath = contextMenu.value.targetPath
    const targetTab = tabs.value.find(t => t.path === targetPath)
    if (!targetTab) return

    switch (action) {
      case 'reload': {
        const refreshRouteView = async (): Promise<void> => {
          const nextQuery = {
            ...route.query,
            _r: String(++routeReloadSeq),
          }
          await router.replace({ path: route.path, query: nextQuery })
        }

        if (targetPath && targetPath !== route.path) {
          void router.push(targetPath).then(refreshRouteView)
        } else {
          void refreshRouteView()
        }
        break
      }
      case 'close': {
        onCloseTab(undefined, targetTab)
        break
      }
      case 'closeOthers': {
        const tabsToKeep = tabs.value
          .filter(tab => tab.fixed || tab.path === targetPath)
          .map(tab => tab.path)

        permissionStore.removeTabsExcept(tabsToKeep)
        if (!tabsToKeep.includes(route.path)) {
          router.push(targetPath)
        }
        break
      }
      case 'closeAll': {
        const fixedTabs = tabs.value.filter(tab => tab.fixed).map(t => t.path)
        permissionStore.removeTabsExcept(fixedTabs)

        if (fixedTabs.length > 0) {
          router.push(fixedTabs[fixedTabs.length - 1])
        } else {
          router.push('/')
        }
        break
      }
    }
    closeContextMenu()
  }

  // Watchers：route 回调放入 nextTick，避免与 tabs 等在同一 tick 交叉触发
  watch(
    () => route.path,
    () => {
      contextMenu.value.visible = false
      nextTick(() => {
        updateActiveTabPosition('smooth')
      })
    }
  )

  watch(
    () => tabs.value.length,
    () => {
      nextTick(() => {
        updateActiveTabPosition('smooth')
      })
    }
  )

  // Resize：仅更新指示条位置，不 scrollIntoView，避免 resize → scroll → resize 环路
  useAppElementSize(
    tabsContainerRef,
    () => {
      updateActiveTabPosition('auto', { skipScroll: true })
    },
    { mode: 'throttle', delay: 100 }
  )

  onMounted(() => {
    document.addEventListener('click', closeContextMenu)
    setTimeout(() => updateActiveTabPosition('auto'), 50)
    setTimeout(() => updateActiveTabPosition('auto'), 300)
  })

  onUnmounted(() => {
    document.removeEventListener('click', closeContextMenu)
  })

  return {
    tabs,
    scrollContainer,
    tabsContainerRef,
    activeTabStyle,
    contextMenu,
    getTabLabel,
    isActive,
    updateActiveTabPosition,
    setTabRef,
    onTabClick,
    onCloseTab,
    onContextMenu,
    closeContextMenu,
    handleContextAction,
    t,
  }
}
