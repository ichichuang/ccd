<script setup lang="ts">
import { getCurrentRoute, goToRoute } from '@/common'
import ScrollbarWrapper from '@/components/modules/scrollbar-wrapper/ScrollbarWrapper.vue'
import type { ScrollEvent } from '@/components/modules/scrollbar-wrapper/utils/types'
import { INTERVAL, STRATEGY } from '@/constants/modules/layout'
import { useElementSize, useLocale } from '@/hooks'
import { getCurrentLocale } from '@/locales'
import { usePermissionStore, useSizeStore, type TabItem } from '@/stores'
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
const dragOverIndex = ref(-1)

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
    },
    // 兜底复位：拖拽在无目标处结束
    onDrop: () => {
      isDragging.value = false
      dragOverIndex.value = -1
    },
  })

  // 设置放置目标
  const dropCleanup = dropTargetForElements({
    element: el,
    getData: ({ input: _input, element: _element }) => ({
      type: 'tab-drop-target',
      index,
    }),
    onDragEnter: () => {
      dragOverIndex.value = index
    },
    onDragLeave: () => {
      dragOverIndex.value = -1
    },
    onDrop: ({ source, location: _location }) => {
      isDragging.value = false
      dragOverIndex.value = -1

      if (source.data.type === 'tab') {
        // 类型安全检查
        const sourceTab = source.data.tab
        if (!sourceTab || typeof sourceTab !== 'object' || !('name' in sourceTab)) {
          return
        }

        const typedSourceTab = sourceTab as TabItem
        const targetTab = dynamicTabs.value[index]

        if (
          typedSourceTab &&
          targetTab &&
          typedSourceTab.name &&
          targetTab.name &&
          typedSourceTab.name !== targetTab.name
        ) {
          // 使用 tab 的唯一标识查找索引，避免索引不准确的问题
          const sourceIndex = dynamicTabs.value.findIndex(t => t.name === typedSourceTab.name)
          const targetIndex = dynamicTabs.value.findIndex(t => t.name === targetTab.name)

          if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
            // 调用 store 方法重新排序标签
            permissionStore.reorderTabs(sourceIndex, targetIndex)
          }
        }
      }
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

// 供模板使用的 ref 回调工厂
const createItemRef = (tab: TabItem, index: number) => (el: any) => {
  setItemRef(getKey(tab), el as HTMLElement | null, tab, index)
  // 当元素被设置时，延迟更新指示器
  if (el) {
    scheduleLayoutUpdate()
  }
}

// 指示器位置信息
const indicatorLeft = ref(0)
const indicatorWidth = ref(0)
const indicatorHeight = ref(0)
const containerHeight = ref(0)
const containerWidth = ref(0)
const showIndicator = ref(false)

// 水平滚动距离
const scrollLeft = ref(0)

// 用户手动滚动检测
const isUserScrolling = ref(false)
let userScrollTimer: NodeJS.Timeout | null = null
const USER_SCROLL_DEBOUNCE_TIME = 500 // 用户停止滚动后 500ms 才允许自动滚动
let isProgrammaticScroll = false // 标记是否是程序触发的滚动

// 统一的 rAF 调度器，合并同一帧内的多次测量与滚动
let rafId: number | null = null
const scheduleLayoutUpdate = (shouldAutoScroll = true) => {
  if (rafId !== null) {
    return
  }
  rafId = requestAnimationFrame(async () => {
    rafId = null
    await nextTick()
    // 再等待一帧，确保样式计算完成
    await new Promise(resolve => requestAnimationFrame(resolve))
    updateIndicator()
    // 只有在非用户滚动时才自动滚动
    if (shouldAutoScroll && !isUserScrolling.value) {
      scrollToActiveTabCenter()
    }
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
      icon: 'icon-line-md:close-small',
      command: () => closeTab(target),
      disabled: target.fixed, // 固定的标签不可删除
    },
    {
      label: $t('layout.tabs.closeAll'),
      icon: 'icon-line-md:close-circle-filled',
      command: () => closeAllTabs(),
      disabled: !hasOtherTabs,
    },
    {
      label: $t('layout.tabs.closeOther'),
      icon: 'icon-line-md:close',
      command: () => closeOtherTabs(target),
      disabled: !hasOtherTabs,
    },
    {
      label: $t('layout.tabs.closeLeft'),
      icon: 'icon-line-md:close',
      command: () => closeLeftTabs(target),
      disabled: !canCloseLeft,
    },
    {
      label: $t('layout.tabs.closeRight'),
      icon: 'icon-line-md:close',
      command: () => closeRightTabs(target),
      disabled: !canCloseRight,
    },
    {
      separator: true,
    },
    {
      label: target.fixed ? $t('layout.tabs.unFixed') : $t('layout.tabs.fixed'),
      icon: target.fixed ? 'icon-line-md:filter-minus-filled' : 'icon-line-md:filter-filled',
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

// 指示器更新逻辑
const updateIndicator = async (maxRetries = 10) => {
  const active = activeTab.value
  const track = trackRef.value

  if (!active || !track) {
    showIndicator.value = false
    return
  }

  const el = itemRefs.get(getKey(active))
  if (!el) {
    showIndicator.value = false
    return
  }

  // 等待样式计算完成
  await new Promise(resolve => requestAnimationFrame(resolve))

  // 确保元素已经完全渲染
  if (maxRetries > 0 && (el.offsetWidth === 0 || el.offsetHeight === 0)) {
    setTimeout(() => updateIndicator(maxRetries - 1), 20)
    return
  }

  const trackRect = track.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()

  if (!elRect.width || !elRect.height) {
    if (maxRetries > 0) {
      setTimeout(() => updateIndicator(maxRetries - 1), 20)
    }
    return
  }

  // 如果仍然获取不到合理尺寸，隐藏指示器
  if (elRect.width === 0 || elRect.height === 0) {
    showIndicator.value = false
    return
  }

  indicatorLeft.value = elRect.left - trackRect.left
  indicatorWidth.value = elRect.width
  indicatorHeight.value = elRect.height
  containerHeight.value = containerRef.value?.clientHeight ?? elRect.height
  containerWidth.value = containerRef.value?.clientWidth ?? elRect.width
  showIndicator.value = true
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
})

// 路由初始化和监听
const currentRoute = getCurrentRoute()
permissionStore.addTab(currentRoute.name || currentRoute.path)
permissionStore.updateTabActive(currentRoute.name || currentRoute.path)

// 组件挂载后初始化
onMounted(() => {
  // 延迟初始化，确保所有元素都已渲染
  scheduleLayoutUpdate()
  // 浏览器窗口尺寸变化（包含 DPR/缩放触发）时，统一做一次稳态重算
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
  ],
  () => {
    scheduleLayoutUpdate()
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
    .py-4.center.full(class='sm:py-6 md:py-paddings')
      .full.between-start(ref='trackRef', role='tablist', aria-label='App Tabs')
        //- 活动背景 - 只有在确认有合理尺寸时才渲染
        Transition(name='indicator', mode='out-in')
          .active-blob(
            v-if='showIndicator && indicatorWidth > 0 && indicatorHeight > 0',
            :style='{ "--left": indicatorLeft + "px", "--width": indicatorWidth + "px", "--height": indicatorHeight + "px" }'
          )

        //- 标签列表 - 直接使用 store 中的 tabs
        template(v-for='(tab, index) in dynamicTabs', :key='tab.name || tab.path')
          .center.relative.z-1.h-full.mr-padding.px-padding.bg-tm.border-none.color-text200.select-none.tab-item(
            :ref='createItemRef(tab, index)',
            :class='[tab.active ? "active color-accent100" : "color-text200 hover:color-text100", { "cursor-move": !tab.fixed, "c-cp": tab.fixed, dragging: isDragging && dragOverIndex === index, "drag-over": dragOverIndex === index && !isDragging }]',
            @click='goToRoute(String(tab?.name))',
            @contextmenu='handleContextMenu($event, tab)',
            :aria-haspopup='true',
            role='tab',
            :aria-selected='tab.active'
          )
            .between.gap-gaps
              .bg-text200.fs-appFontSizes(class='icon-line-md:hash-small', v-if='tab.fixed')
              p.truncate.c-cp {{ tab.label }}
              .bg-text200.fs-appFontSizes.c-cp(
                class='icon-line-md:remove hover:bg-dangerColor',
                v-if='tab.deletable && !tab.fixed',
                @click.stop='closeTab(tab)'
              )
          //- 分隔线
          .w-1.h-full.py-paddings(v-if='index !== dynamicTabs.length - 1')
            .full.bg-bg300
  //- 右键菜单
  ContextMenu(ref='contextMenuRef', :model='contextMenuItems', @hide='contextMenuTarget = null')
</template>

<style lang="scss" scoped>
/* 使用主题色变量的玻璃背景效果 Active Blob 样式 */
.active-blob {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateX(var(--left)) translateY(-50%);
  width: var(--width);
  height: var(--height);

  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent100) 20%, transparent),
      color-mix(in srgb, var(--accent100) 5%, transparent)
    ),
    color-mix(in srgb, var(--bg100) 80%, transparent);

  /* 玻璃背景效果 - 使用主背景色的半透明版本 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  /* 多层渐变背景 - 基于主题色创建玻璃效果 */

  /* 玻璃边框 - 使用主色调的半透明 */
  border: 1px solid color-mix(in srgb, var(--accent100) 20%, transparent);
  border-top: 1px solid transparent;
  border-bottom: 1px solid color-mix(in srgb, var(--accent200) 30%, transparent);
  border-left: 1px solid color-mix(in srgb, var(--accent100) 30%, transparent);

  /* 圆角 */
  border-radius: var(--rounded);
  /* 阴影增强立体感 - 使用强调色和主色 */
  box-shadow:
    0 8px 32px color-mix(in srgb, var(--accent100) 8%, transparent),
    0 4px 16px color-mix(in srgb, var(--accent100) 6%, transparent),
    0 1px 0 color-mix(in srgb, var(--accent100) 40%, transparent);

  /* 保留原有的滤镜和过渡效果 */
  filter: url(#app-tabs-goo);
  transition:
    transform 0.14s cubic-bezier(0.2, 0.8, 0.2, 1),
    width 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
    height 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
    background 0.3s ease,
    border 0.3s ease,
    box-shadow 0.3s ease;

  z-index: 1;
}

/* 悬停时增强玻璃效果 */
.tab-item {
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--bg200) 20%, transparent),
      color-mix(in srgb, var(--bg300) 5%, transparent)
    ),
    color-mix(in srgb, var(--bg100) 80%, transparent);

  border-radius: var(--rounded);

  box-shadow:
    0 8px 32px color-mix(in srgb, var(--primary200) 8%, transparent),
    0 4px 16px color-mix(in srgb, var(--primary200) 6%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--primary200) 40%, transparent);
  &.active {
    background: transparent;
  }
}

.dark .tab-item {
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--primary200) 20%, transparent),
      color-mix(in srgb, var(--primary300) 5%, transparent)
    ),
    color-mix(in srgb, var(--bg300) 80%, transparent);
}

// 指示器淡入淡出动画
.indicator-enter-active,
.indicator-leave-active {
  transition: opacity 0.25s ease;
}

.indicator-enter-from,
.indicator-leave-to {
  opacity: 0;
}

/* 拖拽相关样式 */
.cursor-move {
  cursor: move;
}

.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  transition: all 0.25s ease;
}

.drag-over {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent100) 20%, transparent);
  transition: all 0.25s ease;
}

/* 拖拽时的指示器 */
.drag-over::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent100);
  border-radius: 1px;
}
</style>
