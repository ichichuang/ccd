<script setup lang="ts">
import {
  debounce,
  getCurrentRoute,
  getCurrentRouteMeta,
  getMenuTree,
  goToRoute,
  throttle,
} from '@/common'
import { INTERVAL, STRATEGY } from '@/constants/modules/layout'
import { useLocale } from '@/hooks'
import { useLayoutStore } from '@/stores'
import type { MenuItem } from 'primevue/menuitem'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DesktopSidebar from './components/DesktopSidebar.vue'
import MobileSidebar from './components/MobileSidebar.vue'

const { $t } = useLocale()
// 安全的国际化函数
const safeT = (key: string, fallback?: string) => {
  try {
    return $t(key)
  } catch (error) {
    console.warn('AppSidebar: 国际化翻译失败', error)
    return fallback || key
  }
}

// 全局错误处理器，用于捕获 ResizeObserver 错误
const setupGlobalErrorHandler = () => {
  const originalErrorHandler = window.onerror
  window.onerror = (message, source, lineno, colno, error) => {
    // 检查是否是 ResizeObserver 相关的错误
    if (
      message &&
      typeof message === 'string' &&
      (message.includes('getBoundingClientRect') ||
        message.includes('ResizeObserver') ||
        message.includes('Cannot read properties of null'))
    ) {
      return true // 阻止错误继续传播
    }

    // 对于其他错误，调用原始处理器
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error)
    }
    return false
  }

  return () => {
    window.onerror = originalErrorHandler
  }
}

const layoutStore = useLayoutStore()
const isMobile = computed(() => layoutStore.getIsMobile)
const route = useRoute()
// 折叠状态
const isCollapsed = computed(() => {
  try {
    return layoutStore.sidebarCollapsed
  } catch (error) {
    console.warn('AppSidebar: 获取折叠状态失败', error)
    return false
  }
})
// 当前断点
const currentBreakpoint = computed(() => {
  try {
    return layoutStore.getCurrentBreakpoint
  } catch (error) {
    console.warn('AppSidebar: 获取当前断点失败', error)
    return 'lg'
  }
})

// 展开的菜单项 key 对象
const expandedKeys = computed(() => {
  try {
    return layoutStore.getExpandedMenuKeys || {}
  } catch (error) {
    console.warn('AppSidebar: 获取展开菜单键失败', error)
    return {}
  }
})

// PanelMenu 的组件属性配置
const componentsProps = computed(() => ({
  multiple: true, // 允许多个根节点同时展开
  expandedKeys: expandedKeys.value,
  ['onUpdate:expandedKeys'](val: any) {
    try {
      // 直接保存到 store
      layoutStore.setExpandedMenuKeys(val || {})
    } catch (error) {
      console.warn('AppSidebar: 更新展开菜单键失败', error)
    }
  },
}))

// 处理菜单树数据，转换为 PrimeVue MenuItem 格式
const processMenuTree = (menuItems: any[]): MenuItem[] => {
  try {
    const currentRoute = getCurrentRoute()
    const meta = getCurrentRouteMeta()
    const currentName = currentRoute.name || ''
    const currentPaths = meta?.parentPaths || []
    return menuItems
      .filter(item => {
        // 过滤掉不显示的菜单项
        if (item.showLink === false || item.meta?.showLink === false) {
          return false
        }
        return true
      })
      .map(item => {
        try {
          const newClass = currentPaths.includes(item.path)
            ? 'selecteds'
            : currentName === item.name
              ? 'selected'
              : ''
          const hasChildren = item.children && item.children.length > 0
          // 是否是叶子节点
          const isLeaf = !item.path.includes('/')
          // 是否是外链（如果是外链，则显示链接图标）
          const currentIcon = item.meta?.parent && item.meta?.parent !== 'admin' ? '（🔗）' : ''
          // 路由标题
          const currentTitle = item.titleKey
            ? safeT(item.titleKey, item.title || item.name)
            : item.title || item.name
          const menuItem: MenuItem = {
            key: item.path || item.name, // PanelMenu 需要 key 属性
            label:
              currentBreakpoint.value === 'sm' || currentBreakpoint.value === 'xs'
                ? currentTitle + currentIcon
                : isCollapsed.value && !isLeaf
                  ? ''
                  : currentTitle + currentIcon + ' \u00A0', // 支持国际化
            icon: item.meta?.icon, // 图标
            ...(hasChildren
              ? {}
              : {
                  command: () => {
                    try {
                      if (item.name) {
                        // 支持外链：goToRoute 内部将根据 isLink/linkUrl 处理
                        goToRoute(item.name)
                      }
                    } catch (error) {
                      console.warn('AppSidebar: 菜单项点击处理失败', error)
                    }
                  },
                }),
            items: hasChildren ? processMenuTree(item.children) : undefined,
            class: newClass,
          }
          return menuItem
        } catch (error) {
          console.warn('AppSidebar: 处理菜单项失败', error)
          return null
        }
      })
      .filter((item): item is MenuItem => item !== null) // 类型安全的过滤
      .sort((a, b) => {
        try {
          const rankA = menuItems.find(item => (item.path || item.name) === a.key)?.rank || 0
          const rankB = menuItems.find(item => (item.path || item.name) === b.key)?.rank || 0
          return rankA - rankB
        } catch (error) {
          console.warn('AppSidebar: 菜单项排序失败', error)
          return 0
        }
      })
  } catch (error) {
    console.warn('AppSidebar: 处理菜单树失败', error)
    return []
  }
}

const menuTree = getMenuTree()

// 转换菜单数据
const items = computed(() => {
  try {
    return processMenuTree(menuTree)
  } catch (error) {
    console.warn('AppSidebar: 转换菜单数据失败', error)
    return []
  }
})

const syncExpandedKeysWithCurrentRoute = () => {
  try {
    const parentPaths = Array.isArray(route.meta?.parentPaths) ? route.meta.parentPaths : []
    if (!parentPaths.length) {
      return
    }

    const currentExpanded = { ...(layoutStore.getExpandedMenuKeys || {}) }
    const uniqueParentPaths = [...new Set(parentPaths.filter(Boolean))]
    let updated = false

    uniqueParentPaths.forEach(path => {
      if (!currentExpanded[path]) {
        currentExpanded[path] = true
        updated = true
      }
    })

    if (updated) {
      layoutStore.setExpandedMenuKeys(currentExpanded)
    }
  } catch (error) {
    console.warn('AppSidebar: 同步当前路由展开状态失败', error)
  }
}

watch(
  () => route.fullPath,
  () => {
    syncExpandedKeysWithCurrentRoute()
  },
  {
    immediate: true,
  }
)

/* 折叠状态 */
const isCollapsedRef = ref(isCollapsed.value)
let collapseTimeout: NodeJS.Timeout | null = null
let lastCollapsedState = isCollapsed.value

// 折叠状态更新函数（根据全局策略包装）
const updateCollapsed = (bool: boolean) => {
  try {
    isCollapsedRef.value = bool
  } catch (error) {
    console.warn('AppSidebar: 设置折叠状态失败', error)
  }
}

const debouncedUpdateCollapsed =
  STRATEGY === 'debounce'
    ? debounce(updateCollapsed, INTERVAL)
    : throttle(updateCollapsed, INTERVAL)

watch(
  isCollapsed,
  (bool: boolean) => {
    try {
      // 如果状态没有变化，直接返回
      if (lastCollapsedState === bool) {
        return
      }

      lastCollapsedState = bool

      // 清除之前的定时器
      if (collapseTimeout) {
        clearTimeout(collapseTimeout)
        collapseTimeout = null
      }

      if (bool) {
        // 折叠时立即更新
        isCollapsedRef.value = bool
      } else {
        // 展开时延迟更新，给 PrimeVue 组件时间清理
        nextTick(() => {
          collapseTimeout = setTimeout(() => {
            debouncedUpdateCollapsed(bool)
          }, INTERVAL)
        })
      }
    } catch (error) {
      console.warn('AppSidebar: 处理折叠状态变化失败', error)
    }
  },
  {
    immediate: true,
  }
)

// 设置全局错误处理器
let cleanupErrorHandler: (() => void) | null = null

onMounted(() => {
  cleanupErrorHandler = setupGlobalErrorHandler()
})

// 组件卸载时清理定时器和错误处理器
onUnmounted(() => {
  if (collapseTimeout) {
    clearTimeout(collapseTimeout)
    collapseTimeout = null
  }
  if (cleanupErrorHandler) {
    cleanupErrorHandler()
    cleanupErrorHandler = null
  }
})
</script>
<template lang="pug">
.full.z-999(v-if='!isMobile')
  DesktopSidebar(:items='items', :components-props='componentsProps')
.full.z-999(v-else)
  MobileSidebar(:items='items', :components-props='componentsProps')
</template>
