import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { usePermissionStore } from '@/stores/modules/permission'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
import type { CScrollbar } from '@/components/CScrollbar'
import type { TabItem } from '@/stores/modules/permission'

export type ContextMenuAction = 'reload' | 'close' | 'closeOthers' | 'closeAll'

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  targetPath: string
}

export function useAdminTabs() {
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

  const updateActiveTabPosition = (behavior: ScrollBehavior = 'smooth') => {
    nextTick(() => {
      const currentPath = route.path
      const activeTabEl = tabRefs.value.get(currentPath)

      if (activeTabEl) {
        activeTabStyle.value = {
          left: `${activeTabEl.offsetLeft}px`,
          width: `${activeTabEl.offsetWidth}px`,
          opacity: '1',
        }

        activeTabEl.scrollIntoView({ behavior, block: 'nearest', inline: 'center' })
      } else {
        activeTabStyle.value.opacity = '0'
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
        // Reload current tab logic can be added here if needed
        window.location.reload()
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

  // Watchers
  watch(
    () => route.path,
    () => {
      updateActiveTabPosition('smooth')
      contextMenu.value.visible = false
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

  // Resize listener
  useAppElementSize(
    tabsContainerRef,
    () => {
      updateActiveTabPosition('auto')
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
