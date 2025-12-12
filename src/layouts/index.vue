<script setup lang="ts">
import { debounce } from '@/common'
import type { AnimateName } from '@/components/modules/animate-wrapper/utils/types'
import AdminLayout from '@/layouts/modules/LayoutAdmin.vue'
import FullScreenLayout from '@/layouts/modules/LayoutFullScreen.vue'
import RatioLayout from '@/layouts/modules/LayoutRatio.vue'
import { useLayoutStore } from '@/stores'
import { useMitt } from '@/utils'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const { emit, off } = useMitt()

const layoutStore = useLayoutStore()
const isLoading = computed(() => layoutStore.getIsLoading)

// 使用响应式路由对象，直接基于 meta.parent 计算布局，避免首屏/刷新时竞态
const route = useRoute()
const currentLayoutMode = computed<LayoutMode>(() => {
  return (route.meta?.parent as LayoutMode) || 'admin'
})

// 记录上一次布局，用于离场动画方向判断
const previousLayout = ref<LayoutMode>(currentLayoutMode.value)

// 同步当前布局到 store，并在路由变化时刷新
watch(
  currentLayoutMode,
  val => {
    layoutStore.setCurrentLayout(val)
  },
  { immediate: true }
)

watch(
  () => route.fullPath,
  () => {
    previousLayout.value = currentLayoutMode.value
    nextTick(() => layoutStore.setCurrentLayout(currentLayoutMode.value))
  }
)

// 保证动画可用
const isLoadingRef = ref(true)
watch(
  () => isLoading.value,
  loading => {
    if (loading) {
      nextTick(() => {
        isLoadingRef.value = true
      })
    } else {
      nextTick(() => {
        isLoadingRef.value = false
      })
    }
  },
  {
    immediate: true,
  }
)

// 动画配置
const layoutAnimations = {
  fullscreen: {
    enter: 'fadeIn',
    leave: 'fadeOut',
    duration: '1s',
  },
  admin: {
    enter: 'fadeIn',
    leave: 'fadeOut',
    duration: '1s',
  },
  ratio: {
    enter: 'fadeIn',
    leave: 'fadeOut',
    duration: '1s',
  },
}

// 根据布局类型获取进入动画
const getLayoutEnterAnimation = (layoutMode: LayoutMode) => {
  return (layoutAnimations[layoutMode]?.enter || 'fadeIn') as AnimateName
}

// 根据切换方向获取离开动画
const getLayoutLeaveAnimation = (fromLayout: string, toLayout: string) => {
  // 如果是相同布局，使用默认离开动画
  if (fromLayout === toLayout) {
    return (layoutAnimations[fromLayout as LayoutMode]?.leave || 'fadeOut') as AnimateName
  }

  // 根据布局层级决定动画方向
  const layoutLevels = { fullscreen: 0, admin: 1, ratio: 2 }
  const fromLevel = layoutLevels[fromLayout as LayoutMode] || 1
  const toLevel = layoutLevels[toLayout as LayoutMode] || 1

  // 向上层级切换（如admin->fullscreen）使用向上动画
  if (toLevel < fromLevel) {
    return 'fadeOutUp'
  }
  // 向下层级切换（如fullscreen->admin）使用向下动画
  else if (toLevel > fromLevel) {
    return 'fadeOutDown'
  }

  return (layoutAnimations[fromLayout as LayoutMode]?.leave || 'fadeOut') as AnimateName
}

// 获取动画时长
const getAnimationDuration = () => {
  return layoutAnimations[currentLayoutMode.value]?.duration || '1s'
}

const handleWindowResize = () => {
  emit('windowResize')
}

// 保存防抖后的函数引用，以便在卸载时正确移除
const debouncedResizeHandler = debounce(handleWindowResize, 500)

onMounted(() => {
  window.addEventListener('resize', debouncedResizeHandler)
})

onUnmounted(() => {
  // 移除 DOM 事件监听器
  window.removeEventListener('resize', debouncedResizeHandler)
  // 取消防抖函数中可能存在的待执行任务
  if (typeof (debouncedResizeHandler as any).cancel === 'function') {
    ;(debouncedResizeHandler as any).cancel()
  }
  // 移除 mitt 事件监听（虽然这里没有注册监听，但保持一致性）
  off('windowResize')
})
</script>

<template lang="pug">
//- 加载动画层
AnimateWrapper(:show='isLoadingRef', enter='fadeIn', leave='fadeOut', duration='500ms', delay='0s')
  .container.fixed.center.t-0.r-0.l-0.b-0.z-999
    Loading-Wave(:loading-size='3')

//- 主布局切换层 - 使用单一AnimateWrapper避免冲突
.fixed.t-0.r-0.l-0.b-0.z-2
  AnimateWrapper(
    :show='!isLoadingRef',
    :enter='getLayoutEnterAnimation(currentLayoutMode)',
    :leave='getLayoutLeaveAnimation(previousLayout, currentLayoutMode)',
    :duration='getAnimationDuration()',
    delay='0s'
  )
    //- 全屏布局
    template(v-if='currentLayoutMode === "fullscreen"')
      component(:is='FullScreenLayout')

    //- 管理布局
    template(v-if='currentLayoutMode === "admin"')
      component(:is='AdminLayout')

    //- 比例布局
    template(v-if='currentLayoutMode === "ratio"')
      component(:is='RatioLayout')
</template>
