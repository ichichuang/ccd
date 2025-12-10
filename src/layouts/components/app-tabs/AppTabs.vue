<script setup lang="ts">
import { getCurrentRoute, goToRoute } from '@/common'
import ScrollbarWrapper from '@/components/modules/scrollbar-wrapper/ScrollbarWrapper.vue'
import type { ScrollEvent } from '@/components/modules/scrollbar-wrapper/utils/types'
import { INTERVAL, STRATEGY } from '@/constants/modules/layout'
import { useElementSize, useLocale } from '@/hooks'
import { getCurrentLocale } from '@/locales'
import { usePermissionStore, useSizeStore } from '@/stores'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'

const { $t } = useLocale()

const sizeStore = useSizeStore()
const permissionStore = usePermissionStore()
const router = useRouter()

// 使用 store 的 tabs 计算属性
const tabs = computed(() => permissionStore.getTabs)

// 当前语言，用于触发 dynamicTabs 重新计算
const currentLocale = computed(() => getCurrentLocale())

// 获取内边距值
const paddingValue = computed(() => sizeStore.getPaddingValue)

// 动态计算标签文本的计算属性
// 优化：监听语言变化，确保语言切换时标签文本能正确更新
const dynamicTabs = computed(() => {
  // 访问 currentLocale 以建立依赖关系，确保语言变化时重新计算
  const _ = currentLocale.value
  return tabs.value.map(tab => ({
    ...tab,
    label: tab.titleKey ? $t(tab.titleKey) : tab.title || tab.name || '',
  }))
})

// 当前激活的标签页
const activeTab = computed(() => dynamicTabs.value.find(tab => tab.active))

// DOM refs
const containerRef = ref<HTMLElement | null>()
const trackRef = ref<HTMLElement>()
const scrollbarRef = ref<InstanceType<typeof ScrollbarWrapper>>()

// 右键菜单相关
const contextMenuRef = ref()
const contextMenuTarget = ref<TabItem | null>(null)

// 拖拽相关状态
const dragCleanupMap = new Map<string, () => void>()
const dropCleanupMap = new Map<string, () => void>()
const isDragging = ref(false)
const draggingTabKey = ref<string | null>(null)
const insertionIndex = ref(-1)
const layoutVersion = ref(0)
const draggingTab = ref<TabItem | null>(null)
const lastPositions = new Map<string, DOMRect>()
let isDropHandled = false
const resetDragState = () => {
  isDragging.value = false
  draggingTabKey.value = null
  insertionIndex.value = -1
  draggingTab.value = null
  isDropHandled = false
}

// 用于测量单个 tab 的元素集合
const itemRefs = new Map<string, HTMLElement>()
// 每个 tab 对应的 ResizeObserver，监听子项自身尺寸变化
const itemResizeObserverMap = new Map<string, ResizeObserver>()

// 设置拖拽功能
const setupDragAndDrop = (key: string, el: HTMLElement, tab: TabItem, index: number) => {
  // 清理旧的拖拽监听器
  const oldDragCleanup = dragCleanupMap.get(key)
  if (oldDragCleanup) {
    oldDragCleanup()
    dragCleanupMap.delete(key)
  }

  const oldDropCleanup = dropCleanupMap.get(key)
  if (oldDropCleanup) {
    oldDropCleanup()
    dropCleanupMap.delete(key)
  }

  // 固定标签不可拖拽，确保清理已存在的拖拽监听器
  if (tab.fixed) {
    // 确保清理已存在的拖拽监听器
    if (oldDragCleanup) {
      oldDragCleanup()
      dragCleanupMap.delete(key)
    }
    if (oldDropCleanup) {
      oldDropCleanup()
      dropCleanupMap.delete(key)
    }
    return
  }

  // 设置可拖拽
  const dragCleanup = draggable({
    element: el,
    getInitialData: () => ({
      type: 'tab',
      tabKey: key,
      index,
      tab,
    }),
    onDragStart: () => {
      isDragging.value = true
      draggingTabKey.value = key
      draggingTab.value = tab
      isDropHandled = false
    },
    // 兜底复位：拖拽在无目标处结束
    onDrop: () => {
      if (!isDropHandled && insertionIndex.value !== -1 && draggingTab.value) {
        reorderByInsertionIndex(draggingTab.value)
      }
      resetDragState()
    },
  })

  // 设置放置目标
  const dropCleanup = dropTargetForElements({
    element: el,
    getData: ({ input: _input, element: _element }) => ({
      type: 'tab-drop-target',
      index,
    }),
    onDragEnter: ({ location }) => {
      updateInsertionIndexForElement(el, index, location.current.input?.clientX)
    },
    onDrag: ({ location }) => {
      updateInsertionIndexForElement(el, index, location.current.input?.clientX)
    },
    onDrop: ({ source }) => {
      if (source.data.type === 'tab' && insertionIndex.value !== -1) {
        isDropHandled = true
        reorderByInsertionIndex(source.data.tab as TabItem)
      }
      resetDragState()
    },
  })

  dragCleanupMap.set(key, dragCleanup)
  dropCleanupMap.set(key, dropCleanup)
}

const setItemRef = (
  key: string | undefined,
  el: HTMLElement | null,
  tab: TabItem,
  index: number
) => {
  if (!key) {
    return
  }

  if (el) {
    itemRefs.set(key, el)
    // 设置拖拽功能
    nextTick(() => {
      setupDragAndDrop(key, el, tab, index)
    })
    // 监听该 tab 元素尺寸变化（字体/密度/内边距变化等）
    const ro = new ResizeObserver(() => {
      scheduleLayoutUpdate()
    })
    ro.observe(el)
    itemResizeObserverMap.set(key, ro)
  } else {
    itemRefs.delete(key)
    // 清理拖拽监听器
    const dragCleanup = dragCleanupMap.get(key)
    if (dragCleanup) {
      dragCleanup()
      dragCleanupMap.delete(key)
    }
    const dropCleanup = dropCleanupMap.get(key)
    if (dropCleanup) {
      dropCleanup()
      dropCleanupMap.delete(key)
    }
    // 清理 ResizeObserver
    const ro = itemResizeObserverMap.get(key)
    if (ro) {
      ro.disconnect()
      itemResizeObserverMap.delete(key)
    }
  }
}

const getKey = (tab: TabItem) => String(tab?.name ?? tab?.path ?? '')
const capturePositions = () => {
  itemRefs.forEach((el, key) => {
    lastPositions.set(key, el.getBoundingClientRect())
  })
}

const animateToNewPositions = () => {
  nextTick(() => {
    requestAnimationFrame(() => {
      itemRefs.forEach((el, key) => {
        const previous = lastPositions.get(key)
        if (!previous) {
          return
        }
        const rect = el.getBoundingClientRect()
        const deltaX = previous.left - rect.left
        if (!deltaX) {
          lastPositions.delete(key)
          return
        }
        el.style.transition = 'none'
        el.style.transform = `translateX(${deltaX}px)`
        requestAnimationFrame(() => {
          el.style.transition = 'transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1)'
          el.style.transform = ''
          const handleTransitionEnd = () => {
            el.style.transition = ''
            el.removeEventListener('transitionend', handleTransitionEnd)
          }
          el.addEventListener('transitionend', handleTransitionEnd, { once: true })
        })
        lastPositions.delete(key)
      })
    })
  })
}
const updateInsertionIndexForElement = (el: HTMLElement, tabIndex: number, clientX?: number) => {
  const rect = el.getBoundingClientRect()
  const threshold = rect.left + rect.width / 2
  const position = clientX ?? threshold
  insertionIndex.value = position <= threshold ? tabIndex : tabIndex + 1
}

const reorderByInsertionIndex = (sourceTab: TabItem | undefined | null) => {
  if (!sourceTab) {
    return
  }
  const sourceKey = sourceTab.name ?? sourceTab.path
  if (!sourceKey) {
    return
  }
  const sourceIndex = dynamicTabs.value.findIndex(
    tab => tab.name === sourceKey || tab.path === sourceKey
  )
  const targetIndex = insertionIndex.value

  if (sourceIndex === -1 || targetIndex === -1) {
    return
  }

  let finalIndex = targetIndex
  if (sourceIndex < targetIndex) {
    finalIndex -= 1
  }

  finalIndex = Math.max(0, Math.min(finalIndex, dynamicTabs.value.length - 1))

  if (finalIndex === sourceIndex) {
    return
  }

  capturePositions()
  permissionStore.reorderTabs(sourceIndex, finalIndex)
  animateToNewPositions()
}

// 供模板使用的 ref 回调工厂
const createItemRef = (tab: TabItem, index: number) => (el: any) => {
  setItemRef(getKey(tab), el as HTMLElement | null, tab, index)
  // 当元素被设置时，延迟更新指示器（不检查所有 ref，由 onMounted 统一处理）
  if (el) {
    // 延迟更新，确保元素已完全渲染
    nextTick(() => {
      scheduleLayoutUpdate(false, false)
    })
  }
}

// 容器尺寸信息
const containerHeight = ref(sizeStore.getTabsHeight ?? 0)
const containerWidth = ref(0)
const dropLineStyle = computed(() => {
  const _layoutVersion = layoutVersion.value
  void _layoutVersion

  const index = insertionIndex.value
  const track = trackRef.value
  if (index === -1 || !track) {
    return null
  }

  const tabsList = dynamicTabs.value
  const trackRect = track.getBoundingClientRect()
  if (!trackRect.width) {
    return null
  }

  const getTabRectWithMargins = (tabIndex: number) => {
    const tab = tabsList[tabIndex]
    if (!tab) {
      return null
    }
    const el = itemRefs.get(getKey(tab))
    if (!el) {
      return null
    }
    const rect = el.getBoundingClientRect()
    const styles = getComputedStyle(el)
    const marginLeft = Number.parseFloat(styles.marginLeft) || 0
    const marginRight = Number.parseFloat(styles.marginRight) || 0
    return {
      left: rect.left - marginLeft,
      right: rect.right + marginRight,
    }
  }

  let absoluteLeft = trackRect.left

  if (!tabsList.length) {
    absoluteLeft = trackRect.left
  } else if (index <= 0) {
    const rect = getTabRectWithMargins(0)
    if (!rect) {
      return null
    }
    absoluteLeft = rect.left
  } else if (index >= tabsList.length) {
    const rect = getTabRectWithMargins(tabsList.length - 1)
    if (!rect) {
      return null
    }
    absoluteLeft = rect.right
  } else {
    const rect = getTabRectWithMargins(index)
    if (!rect) {
      return null
    }
    absoluteLeft = rect.left
  }

  const relativeLeft = absoluteLeft - trackRect.left

  return {
    left: `${relativeLeft}px`,
    height: `${trackRect.height}px`,
  }
})

// 水平滚动距离
const scrollLeft = ref(0)

// 用户手动滚动检测
const isUserScrolling = ref(false)
let userScrollTimer: NodeJS.Timeout | null = null
const USER_SCROLL_DEBOUNCE_TIME = 500 // 用户停止滚动后 500ms 才允许自动滚动
let isProgrammaticScroll = false // 标记是否是程序触发的滚动

// 统一的 rAF 调度器，合并同一帧内的多次测量与滚动
let rafId: number | null = null
const scheduleLayoutUpdate = (shouldAutoScroll = true, force = false) => {
  // 如果强制更新，取消之前的调度
  if (force && rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }

  if (rafId !== null && !force) {
    return
  }
  rafId = requestAnimationFrame(async () => {
    rafId = null
    await nextTick()
    // 再等待一帧，确保样式计算完成
    await new Promise(resolve => requestAnimationFrame(resolve))
    // 只有在非用户滚动时才自动滚动
    if (shouldAutoScroll && !isUserScrolling.value) {
      scrollToActiveTabCenter()
    }
    layoutVersion.value += 1
  })
}

// 用于 window resize 事件监听器的包装函数
const handleResize = () => {
  scheduleLayoutUpdate()
}

// 右键菜单处理函数
const handleContextMenu = (event: MouseEvent, tab: TabItem) => {
  event.preventDefault()
  contextMenuTarget.value = tab
  contextMenuRef.value?.show(event)
}

// 右键菜单项配置
const contextMenuItems = computed(() => {
  const target = contextMenuTarget.value
  if (!target) {
    return []
  }

  const currentIndex = dynamicTabs.value.findIndex(tab => tab.name === target.name)
  const hasOtherTabs = dynamicTabs.value.length > 1
  const canCloseLeft = currentIndex > 0
  const canCloseRight = currentIndex < dynamicTabs.value.length - 1

  return [
    {
      label: $t('layout.tabs.close'),
      icon: 'ri-close-line',
      command: () => closeTab(target),
      disabled: target.fixed, // 固定的标签不可删除
    },
    {
      label: $t('layout.tabs.closeAll'),
      icon: 'ri-close-circle-fill',
      command: () => closeAllTabs(),
      disabled: !hasOtherTabs,
    },
    {
      label: $t('layout.tabs.closeOther'),
      icon: 'ri-close-line',
      command: () => closeOtherTabs(target),
      disabled: !hasOtherTabs,
    },
    {
      label: $t('layout.tabs.closeLeft'),
      icon: 'ri-close-line',
      command: () => closeLeftTabs(target),
      disabled: !canCloseLeft,
    },
    {
      label: $t('layout.tabs.closeRight'),
      icon: 'ri-close-line',
      command: () => closeRightTabs(target),
      disabled: !canCloseRight,
    },
    {
      separator: true,
    },
    {
      label: target.fixed ? $t('layout.tabs.unFixed') : $t('layout.tabs.fixed'),
      icon: target.fixed ? 'ri-filter-off-line' : 'ri-filter-fill',
      command: () => toggleFixedTab(target),
    },
  ]
})

// 标签页操作方法

// 关闭指定标签
const closeTab = (tab: TabItem) => {
  if (tab.fixed) {
    return // 固定的标签不可删除
  }

  const isClosingActiveTab = tab.active

  // 如果关闭的是当前激活的标签，需要跳转到其他标签
  if (isClosingActiveTab) {
    const currentIndex = dynamicTabs.value.findIndex(t => t.name === tab.name)
    const nextTab = dynamicTabs.value[currentIndex + 1] || dynamicTabs.value[currentIndex - 1]

    if (nextTab) {
      goToRoute(String(nextTab.name))
    } else {
      // 如果没有其他标签，跳转到首页
      router.push('/')
    }
  }

  // 使用 store 方法移除标签
  permissionStore.removeTab(tab.name || tab.path)
}

// 关闭所有标签
const closeAllTabs = () => {
  const currentRoute = getCurrentRoute()

  // 移除所有非固定标签页
  const nonFixedTabs = dynamicTabs.value.filter(tab => !tab.fixed)
  nonFixedTabs.forEach(tab => {
    permissionStore.removeTab(tab.name || tab.path)
  })

  // 如果当前路由不在固定标签中，跳转到第一个固定标签或首页
  const fixedTabs = dynamicTabs.value.filter(tab => tab.fixed)
  const isCurrentRouteFixed = fixedTabs.some(tab => tab.name === currentRoute.name)
  if (!isCurrentRouteFixed) {
    const firstFixedTab = fixedTabs[0]
    if (firstFixedTab) {
      goToRoute(String(firstFixedTab.name))
    } else {
      router.push('/')
    }
  }
}

// 关闭其他标签
const closeOtherTabs = (targetTab: TabItem) => {
  const tabsToKeep = dynamicTabs.value.filter(tab => tab.name === targetTab.name || tab.fixed)
  const namesToKeep = tabsToKeep.map(tab => tab.name || tab.path)

  // 保留指定的标签页，移除其他标签页
  permissionStore.removeTabsExcept(namesToKeep)

  // 如果目标标签不是当前激活的，跳转到目标标签
  if (!targetTab.active) {
    goToRoute(String(targetTab.name))
  }
}

// 关闭左侧标签
const closeLeftTabs = (targetTab: TabItem) => {
  const currentIndex = dynamicTabs.value.findIndex(tab => tab.name === targetTab.name)

  // 移除当前索引之前的标签页（保留固定标签页）
  const tabsToRemove = dynamicTabs.value.filter((tab, index) => index < currentIndex && !tab.fixed)

  // 逐个移除要删除的标签页
  tabsToRemove.forEach(tab => {
    permissionStore.removeTab(tab.name || tab.path)
  })

  if (!targetTab.active) {
    goToRoute(String(targetTab.name))
  }
}

// 关闭右侧标签
const closeRightTabs = (targetTab: TabItem) => {
  const currentIndex = dynamicTabs.value.findIndex(tab => tab.name === targetTab.name)

  // 移除当前索引之后的标签页（保留固定标签页）
  const tabsToRemove = dynamicTabs.value.filter((tab, index) => index > currentIndex && !tab.fixed)

  // 逐个移除要删除的标签页
  tabsToRemove.forEach(tab => {
    permissionStore.removeTab(tab.name || tab.path)
  })

  if (!targetTab.active) {
    goToRoute(String(targetTab.name))
  }
}

// 切换标签固定状态
const toggleFixedTab = (tab: TabItem) => {
  // 使用 store 方法更新标签的 meta 属性
  permissionStore.updateTabMeta(tab.name || tab.path, {
    fixed: !tab.fixed,
  })
}

// 自动滚动到选中tab项的中心
const scrollToActiveTabCenter = async (maxRetries = 10) => {
  const active = activeTab.value
  const scrollbar = scrollbarRef.value
  const track = trackRef.value

  if (!active || !scrollbar || !track) {
    return
  }

  const el = itemRefs.get(getKey(active))
  if (!el) {
    if (maxRetries > 0) {
      setTimeout(() => scrollToActiveTabCenter(maxRetries - 1), 50)
    }
    return
  }

  await new Promise(resolve => requestAnimationFrame(resolve))

  const scrollEl = scrollbar.getScrollEl()
  if (!scrollEl) {
    return
  }

  // 使用 getBoundingClientRect 获取更精确的位置信息
  const trackRect = track.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const scrollElRect = scrollEl.getBoundingClientRect()

  if (elRect.width === 0 && maxRetries > 0) {
    setTimeout(() => scrollToActiveTabCenter(maxRetries - 1), 50)
    return
  }

  if (elRect.width === 0) {
    return
  }

  // 计算相对于滚动容器的位置
  const relativeItemLeft = elRect.left - trackRect.left
  const itemCenter = relativeItemLeft + elRect.width / 2
  const targetScrollLeft = itemCenter - scrollElRect.width / 2
  const maxScrollLeft = scrollEl.scrollWidth - scrollElRect.width
  const clampedScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft))

  // 标记为程序触发的滚动，避免被识别为用户滚动
  isProgrammaticScroll = true
  scrollbar.scrollTo({
    left: clampedScrollLeft,
    behavior: 'smooth',
  })
}

// 处理水平滚动事件
const handleScrollHorizontal = (event: ScrollEvent) => {
  scrollLeft.value = event.scrollLeft

  // 检测用户手动滚动
  // 如果是程序触发的滚动，不标记为用户滚动
  if (!isProgrammaticScroll) {
    // 标记为用户正在滚动
    isUserScrolling.value = true

    // 清除之前的定时器
    if (userScrollTimer) {
      clearTimeout(userScrollTimer)
    }

    // 设置定时器，在用户停止滚动一段时间后清除标志
    userScrollTimer = setTimeout(() => {
      isUserScrolling.value = false
      userScrollTimer = null
    }, USER_SCROLL_DEBOUNCE_TIME)
  }

  // 重置程序滚动标志
  isProgrammaticScroll = false

  // 水平滚动时也重新调度一次，确保指示器与渲染同步
  // 但不自动滚动到高亮位置（shouldAutoScroll = false）
  scheduleLayoutUpdate(false)
}

// 利用 useElementSize 监听容器尺寸变化并联动更新
useElementSize(
  containerRef as unknown as Ref<HTMLElement | null>,
  entry => {
    containerWidth.value = entry.width
    containerHeight.value = entry.height
    scheduleLayoutUpdate()
  },
  { mode: STRATEGY, delay: INTERVAL }
)

// 监听轨道(track)尺寸变化，进一步提升窗口缩放/字体变化场景下的鲁棒性
useElementSize(
  trackRef as unknown as Ref<HTMLElement | null>,
  _entry => {
    scheduleLayoutUpdate()
  },
  { mode: STRATEGY, delay: INTERVAL }
)

onBeforeUnmount(() => {
  // 清理所有拖拽监听器
  dragCleanupMap.forEach(cleanup => cleanup())
  dropCleanupMap.forEach(cleanup => cleanup())
  dragCleanupMap.clear()
  dropCleanupMap.clear()
  itemRefs.clear()
  window.removeEventListener('resize', handleResize)
  // 断开所有 item ResizeObserver
  itemResizeObserverMap.forEach(ro => ro.disconnect())
  itemResizeObserverMap.clear()
  // 清理用户滚动定时器
  if (userScrollTimer) {
    clearTimeout(userScrollTimer)
    userScrollTimer = null
  }
  // 清理 rAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
})

// 路由初始化和监听
const currentRoute = getCurrentRoute()
permissionStore.addTab(currentRoute.name || currentRoute.path)
permissionStore.updateTabActive(currentRoute.name || currentRoute.path)

// 组件挂载后初始化
onMounted(() => {
  // 延迟初始化,确保所有元素都已渲染
  // 使用轮询方式检查所有 ref 是否都已设置完成
  const checkRefsReady = (attempts = 0) => {
    const active = activeTab.value
    if (!active) {
      // 如果没有激活的 tab,继续等待
      if (attempts < 30) {
        setTimeout(() => checkRefsReady(attempts + 1), 50)
      }
      return
    }

    const activeKey = getKey(active)
    const activeEl = itemRefs.get(activeKey)

    // 检查激活的 tab 的 ref 是否已设置,并且确保元素有尺寸
    if (activeEl && activeEl.offsetWidth > 0 && activeEl.offsetHeight > 0) {
      // 激活的 tab 已完全渲染,延迟一帧确保所有样式计算完成
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scheduleLayoutUpdate(true, true)
        })
      })
    } else {
      // 如果激活的 tab 的 ref 还没设置或尺寸为0,继续等待
      if (attempts < 50) {
        // 增加重试次数,缩短重试间隔
        setTimeout(() => checkRefsReady(attempts + 1), 30)
      } else {
        // 超时后仍然尝试更新一次
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scheduleLayoutUpdate(true, true)
          })
        })
      }
    }
  }

  // 延迟开始检查,给 Vue 一些时间渲染
  nextTick(() => {
    // 增加初始延迟,确保所有子组件都已挂载
    setTimeout(() => {
      checkRefsReady()
    }, 200)
  })

  // 浏览器窗口尺寸变化(包含 DPR/缩放触发)时,统一做一次稳态重算
  window.addEventListener('resize', handleResize)
})

router.afterEach(to => {
  // 如果路由声明 activeMenu，则以其为高亮目标
  const activeNameOrPath = (to.meta?.activeMenu as string) || to.name || to.path

  // 确保 activeMenu 对应的标签存在
  permissionStore.addTab(activeNameOrPath)
  // 也确保当前路由自身（若不同）存在，避免后续切回无法命中
  if (activeNameOrPath !== (to.name || to.path)) {
    permissionStore.addTab(to.name || to.path)
  }

  permissionStore.updateTabActive(activeNameOrPath)
  scheduleLayoutUpdate()
})

// 监听标签页变化，更新指示器
watch(
  [
    () => permissionStore.getTabs,
    () => sizeStore.getTabsHeight,
    () => sizeStore.getPaddingValue,
    () => sizeStore.getPaddingsValue,
    () => sizeStore.getPaddingxValue,
    () => sizeStore.getPaddinglValue,
    // 添加对 activeTab 的监听，确保在 activeTab 变化时更新指示器
    () => activeTab.value?.name,
    // 添加对 dynamicTabs 长度的监听，确保在 tabs 变化时更新
    () => dynamicTabs.value.length,
  ],
  () => {
    // 延迟更新，确保 DOM 已更新
    nextTick(() => {
      scheduleLayoutUpdate()
    })
  },
  { deep: true }
)
</script>

<template lang="pug">
.full.center.c-border.border-x-none(ref='containerRef')
  svg(width='0', height='0', style='position: absolute')
    defs
      filter#app-tabs-goo
        feGaussianBlur(in='SourceGraphic', stdDeviation='6', result='blur')
        feColorMatrix(
          in='blur',
          mode='matrix',
          values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7',
          result='goo'
        )
        feBlend(in='SourceGraphic', in2='goo')

  ScrollbarWrapper(
    ref='scrollbarRef',
    :style='{ height: containerHeight + "px", width: containerWidth - paddingValue * 2 + "px" }',
    :size='1',
    :wrapper-class='"rounded-rounded"',
    direction='horizontal',
    auto-hide='leave',
    @scroll-horizontal='handleScrollHorizontal',
    :color-scheme='{ thumbColor: "transparent", thumbHoverColor: "transparent", thumbActiveColor: "transparent", trackColor: "transparent", trackHoverColor: "transparent", trackActiveColor: "transparent" }'
  )
    .py-4.center.full(class='sm:py-6 md:py-7 xl:py-8')
      .full.between-start.relative.tabs-track(
        ref='trackRef',
        role='tablist',
        aria-label='App Tabs',
        :class='{ "tabs-track--dragging": isDragging, "tabs-track--hover": insertionIndex !== -1 }'
      )
        //- 标签列表 - 直接使用 store 中的 tabs
        template(v-for='(tab, index) in dynamicTabs', :key='tab.name || tab.path')
          .center.relative.z-1.h-full.mx-paddings.px-padding.select-none.rounded-rounded.tabs-item(
            :ref='createItemRef(tab, index)',
            :class='tab.active ? "active c-border bg-primary100 color-primary400 dark:bg-tm dark:c-border-primary dark:color-primary100" : "c-card-primary py-paddings hover:color-text100! focus:color-text100! active:color-text100! color-text200 border-tm!"',
            @click='goToRoute(String(tab?.name))',
            @contextmenu='handleContextMenu($event, tab)',
            :aria-haspopup='true',
            role='tab',
            :aria-selected='tab.active',
            :aria-grabbed='draggingTabKey === getKey(tab)'
          )
            .between.gap-gaps
              OhVueIcon.w-appFontSizes.h-appFontSizes(
                v-if='tab.fixed',
                name='ri-hashtag',
                :class='tab.active ? "color-primary400 dark:color-text100" : "color-text200"',
                animation='wrench',
                hover,
                speed='fast'
              )
              p.truncate(:class='!tab.fixed ? "cursor-move" : "c-cp"') {{ tab.label }}
              OhVueIcon.w-appFontSize.h-appFontSize.c-cp.c-transitions(
                v-if='tab.deletable && !tab.fixed',
                name='ri-close-fill',
                :class='[tab.active ? "color-primary400 dark:color-text100" : "color-text200", "hover:color-dangerColor"]',
                @click.stop='closeTab(tab)'
              )
        .tabs-drop-line(v-if='insertionIndex !== -1 && dropLineStyle', :style='dropLineStyle')
    //- 右键菜单
  ContextMenu(ref='contextMenuRef', :model='contextMenuItems', @hide='contextMenuTarget = null')
    template(#itemicon='{ item, class: className }')
      OhVueIcon(v-if='item.icon', :name='item.icon', :class='className')
</template>
<style lang="scss">
/* ============================================
   标签项基础样式
   ============================================ */
.tabs-item {
  /* 首尾标签去除外边距，避免轨道两端留白 */
  &:first-child {
    margin-left: 0 !important;
  }
  &:last-child {
    margin-right: 0 !important;
  }
}

/* ============================================
   标签轨道容器样式
   ============================================ */
.tabs-track {
  /* 轨道背景和阴影的过渡动画
     - 可调整: transition 时长和缓动函数
     - 示例: 0.25s ease 可改为 0.3s cubic-bezier(0.4, 0, 0.2, 1) */
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease;
  /* 使用主题圆角变量，可在主题配置中统一调整 */
  border-radius: var(--rounded);
}

/* 拖拽状态下的轨道样式
   - background: 拖拽时的背景色透明度（35% 可调整为 20-50%）
   - box-shadow: 拖拽时的阴影强度和颜色（24% 可调整为 15-35%） */
.tabs-track--dragging {
  box-shadow: 0 4px 30px color-mix(in srgb, var(--primary100) 35%, transparent);
}

/* 悬停状态下的轨道样式（当插入线显示时）
   - background: 悬停时的背景色透明度（20% 可调整为 10-30%） */
.tabs-track--hover {
  background: color-mix(in srgb, var(--bg200) 20%, transparent);
}

/* ============================================
   拖拽插入线样式（着陆点指示器）
   ============================================ */
.tabs-drop-line {
  /* 绝对定位，相对于 .tabs-track */
  position: absolute;
  top: 50%;
  left: 0; /* 通过 JS 动态设置，此处为初始值 */

  /* 线条尺寸
     - width: 线条宽度（1px 可调整为 2-4px）
     - height: 线条高度（100% 可调整为 80-100%） */
  width: 1px;
  height: 100%;

  /* 线条颜色和发光效果
     - background: 主色（var(--primary100) 可改为 var(--accent100) 或其他主题色）
     - box-shadow: 发光效果，第一个为内层光晕，第二个为外层光晕
       - 60% 和 40% 可调整发光强度（30-80%）
       - 10px 和 20px 可调整光晕扩散范围（5-30px） */
  background: var(--primary100);
  box-shadow:
    0 0 10px color-mix(in srgb, var(--primary100) 60%, transparent),
    0 0 20px color-mix(in srgb, var(--primary200) 40%, transparent);

  /* 圆角，999px 实现完全圆形端点 */
  border-radius: 999px;

  /* 居中定位（相对于 left 值）
     - translate(-50%, -50%): 向左上偏移自身宽高的 50%，实现完美居中 */
  transform: translate(-50%, -50%);

  /* 禁用鼠标事件，避免阻挡拖拽交互 */
  pointer-events: none;

  /* 插入线出现/消失的动画
     - transform: 位置变化动画（0.12s 可调整为 0.1-0.2s）
     - opacity: 透明度变化动画
     - ease: 缓动函数（可改为 ease-in-out、cubic-bezier 等） */
  transition:
    transform 0.12s ease,
    opacity 0.12s ease;

  /* 线条透明度（0.9 可调整为 0.7-1.0） */
  opacity: 0.9;

  /* 上端圆圈指示器
     - 使用 ::before 伪元素创建上端圆圈
     - 位置：top: 0（线条顶部）
     - 尺寸：6px 可调整为 4-10px
     - 颜色：与线条一致
     - 发光：与线条相同的发光效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 6px; /* 圆圈直径（可调整为 4-10px） */
    height: 6px; /* 圆圈直径（可调整为 4-10px） */
    background: var(--primary100);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow:
      0 0 8px color-mix(in srgb, var(--primary100) 70%, transparent),
      0 0 16px color-mix(in srgb, var(--primary200) 50%, transparent);
    transition:
      transform 0.12s ease,
      opacity 0.12s ease;
  }

  /* 下端圆圈指示器
     - 使用 ::after 伪元素创建下端圆圈
     - 位置：bottom: 0（线条底部）
     - 尺寸：与上端圆圈一致
     - 颜色和发光：与上端圆圈一致 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 6px; /* 圆圈直径（可调整为 4-10px） */
    height: 6px; /* 圆圈直径（可调整为 4-10px） */
    background: var(--primary100);
    border-radius: 50%;
    transform: translate(-50%, 50%);
    box-shadow:
      0 0 8px color-mix(in srgb, var(--primary100) 70%, transparent),
      0 0 16px color-mix(in srgb, var(--primary200) 50%, transparent);
    transition:
      transform 0.12s ease,
      opacity 0.12s ease;
  }
}

/* ============================================
   标签项交互样式
   ============================================ */
.tabs-item {
  /* 标签项状态变化的过渡动画
     - box-shadow: 阴影变化（0.2s 可调整为 0.15-0.3s）
     - background: 背景色变化
     - color: 文字颜色变化
     - cubic-bezier(0.2, 0.8, 0.2, 1): 自定义缓动曲线，可改为 ease、ease-in-out 等 */
  transition:
    box-shadow 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    background 0.2s ease,
    color 0.2s ease;

  /* 性能优化：提前告知浏览器该属性会变化，启用硬件加速 */
  will-change: box-shadow;
}

/* ============================================
   无障碍：减少动画偏好设置
   ============================================ */
@media (prefers-reduced-motion: reduce) {
  /* 当用户系统设置偏好减少动画时，禁用所有过渡效果
     确保对动画敏感的用户获得更好的体验 */
  .tabs-item {
    transition: none;
  }
}
</style>
