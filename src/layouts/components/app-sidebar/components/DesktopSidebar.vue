<script setup lang="ts">
import { useLayoutStore } from '@/stores'
import type { MenuItem } from 'primevue/menuitem'
import Popover from 'primevue/popover'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  items: MenuItem[]
  componentsProps: Record<string, any>
}>()

const layoutStore = useLayoutStore()
// 折叠状态
const isCollapsed = computed(() => layoutStore.sidebarCollapsed)

// Popover 引用
type PopoverInstance = InstanceType<typeof Popover>
const menuPopoverRef = ref<PopoverInstance | null>(null)
// 触发器容器引用
const triggerRef = ref<HTMLElement | null>(null)
const route = useRoute()

// 切换 Popover 显示/隐藏
const handleToggle = (event: MouseEvent) => {
  menuPopoverRef.value?.toggle(event)
}

const handleHide = () => {
  menuPopoverRef.value?.hide()
}

// 展开延迟
const expandedDelay = ref<boolean>(false)
// 折叠延迟
const collapsedDelay = ref<boolean>(false)

let expandTimeout: NodeJS.Timeout | null = null
let collapseTimeout: NodeJS.Timeout | null = null

watch(
  isCollapsed,
  flag => {
    try {
      // 清除之前的定时器
      if (expandTimeout) {
        clearTimeout(expandTimeout)
        expandTimeout = null
      }
      if (collapseTimeout) {
        clearTimeout(collapseTimeout)
        collapseTimeout = null
      }

      if (flag) {
        // 折叠时
        expandedDelay.value = flag
        collapseTimeout = setTimeout(() => {
          try {
            collapsedDelay.value = flag
          } catch (error) {
            console.warn('DesktopSidebar: 设置折叠延迟失败', error)
          }
        }, 200) // 增加延迟时间
      } else {
        // 展开时
        collapsedDelay.value = flag
        expandTimeout = setTimeout(() => {
          try {
            expandedDelay.value = flag
          } catch (error) {
            console.warn('DesktopSidebar: 设置展开延迟失败', error)
          }
        }, 200) // 增加延迟时间
      }
    } catch (error) {
      console.warn('DesktopSidebar: 处理折叠状态变化失败', error)
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => route.fullPath,
  () => {
    handleHide()
  }
)

const containerRef = ref<HTMLElement>()
const containerHeight = computed(() => {
  // 添加安全检查，防止在组件卸载后访问 DOM
  if (!containerRef.value) {
    return 0
  }
  try {
    return containerRef.value.clientHeight || 0
  } catch (error) {
    console.warn('DesktopSidebar: 无法获取容器高度', error)
    return 0
  }
})
const isReady = ref(false)
let resizeObserver: ResizeObserver | null = null
const observedHeight = ref(0)
onMounted(async () => {
  await nextTick()
  isReady.value = true
  // 监听容器尺寸变化，实时刷新高度相关渲染
  if ('ResizeObserver' in window && containerRef.value) {
    resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) {
        return
      }
      const height = Math.round(entry.contentRect.height)
      if (height !== observedHeight.value) {
        observedHeight.value = height
        nextTick(() => {})
      }
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  // 清理定时器
  if (expandTimeout) {
    clearTimeout(expandTimeout)
    expandTimeout = null
  }
  if (collapseTimeout) {
    clearTimeout(collapseTimeout)
    collapseTimeout = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>
<template lang="pug">
.center(class='md:hidden')
  //- 触发器容器
  .full.center.c-cp(ref='triggerRef', role='button', tabindex='0', @click='handleToggle')
    OhVueIcon.w-appFontSizel.h-appFontSizel.color-primary100(name='ri-apps-line')

  //- Popover 面板
  Popover.bg-tm.border-none.overflow-hidden(ref='menuPopoverRef', :dismissable='true')
    .full.w-80vw.h-80vh.p-0.overflow-hidden(class='sm:w-60vw sm:h-60vh', @click.self='handleHide')
      ScrollbarWrapper(
        style='background: transparent; height: 100%',
        :color-scheme='{ thumbColor: "transparent", thumbHoverColor: "transparent", thumbActiveColor: "transparent", trackColor: "transparent", trackHoverColor: "transparent", trackActiveColor: "transparent" }',
        @container-click='handleHide'
      )
        .c-border.p-padding.bg-bg200.rounded-rounded.pt-0
          PrimeMenu(
            :type='"panel"',
            :items='props.items',
            :components-props='props.componentsProps'
          )

.full.relative.z-999.hidden(class='md:block', ref='containerRef')
  //- 折叠状态菜单
  AnimateWrapper(
    :show='collapsedDelay',
    enter='slideInLeft',
    leave='fadeOutLeft',
    duration='120ms'
  )
    .w-full(:style='{ height: (observedHeight || containerHeight) + "px" }')
      PrimeMenu(
        v-if='collapsedDelay',
        :type='"tier"',
        :items='props.items',
        :components-props='props.componentsProps'
      )

  //- 展开状态菜单
  AnimateWrapper(
    :show='!expandedDelay',
    enter='slideInLeft',
    leave='slideOutLeft',
    duration='120ms'
  )
    ScrollbarWrapper(
      :style='{ height: (observedHeight || containerHeight) + "px" }',
      :size='1',
      :color-scheme='{ thumbColor: "transparent", thumbHoverColor: "transparent", thumbActiveColor: "transparent", trackColor: "transparent", trackHoverColor: "transparent", trackActiveColor: "transparent" }'
    )
      PrimeMenu(
        v-if='!expandedDelay',
        :type='"panel"',
        :items='props.items',
        :components-props='props.componentsProps'
      )
</template>
