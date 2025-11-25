<script setup lang="ts">
import { useLayoutStore } from '@/stores'
import type { MenuItem } from 'primevue/menuitem'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  items: MenuItem[]
  componentsProps: Record<string, any>
}>()

const layoutStore = useLayoutStore()
// 折叠状态
const isCollapsed = computed(() => layoutStore.sidebarCollapsed)

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
.full.relative.z-999(ref='containerRef')
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
