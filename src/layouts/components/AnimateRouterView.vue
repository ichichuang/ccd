<script setup lang="ts">
import { routeWhitePathList } from '@/router/utils/helper'
import { routeUtils } from '@/router'
import { useRoute } from 'vue-router'

// 定义局部接口，让 AI 和 Lint 明白 transition 的结构
interface RouteTransition {
  name?: string
  enterTransition?: string
  leaveTransition?: string
}

const route = useRoute()
// 检查当前路由是否在白名单中
const isWhiteListRoute = computed(() => routeWhitePathList.includes(route.path as any))

// 使用 ref 包装 keepAliveNames，确保响应式更新
const keepAliveNamesRef = ref<string[]>(routeUtils.keepAliveNames)

// 只有在非白名单路由时才计算 keepAliveNames
// 直接使用 routeUtils.keepAliveNames，它已经通过 getKeepAliveNames 函数正确计算
const keepAliveNames = computed(() => {
  if (isWhiteListRoute.value) {
    return []
  }
  // 使用响应式的 keepAliveNamesRef，确保动态路由更新后能正确反映
  return keepAliveNamesRef.value
})

// 监听路由变化，同步更新 keepAliveNames
watch(
  () => route.name,
  (_newName, _oldName) => {
    // 当路由变化时，同步更新 keepAliveNames
    // 这确保了动态路由加载后 keepAliveNames 能正确更新
    const newKeepAliveNames = [...routeUtils.keepAliveNames]
    // 使用 JSON.stringify 比较数组内容，确保内容变化时也能更新
    if (
      JSON.stringify(newKeepAliveNames.sort()) !== JSON.stringify(keepAliveNamesRef.value.sort())
    ) {
      keepAliveNamesRef.value = newKeepAliveNames
    }
  },
  { immediate: true }
)

// 动态过渡：若提供 enter/leave 类名则优先使用；否则回退到 name；再回退到默认值
const rawTransition = computed(() => (route.meta?.transition as RouteTransition) || {})
const hasCustomClass = computed(() =>
  Boolean(rawTransition.value.enterTransition || rawTransition.value.leaveTransition)
)
const transitionName = computed(() => (!hasCustomClass.value ? rawTransition.value.name || '' : ''))
const enterActiveClass = computed(
  () =>
    rawTransition.value.enterTransition ||
    'animate__animated animate__fadeIn animate__fast enter-active-class'
)
const leaveActiveClass = computed(
  () =>
    rawTransition.value.leaveTransition ||
    'animate__animated animate__slideOutLeft animate__fast leave-active-class'
)
</script>
<template>
  <router-view v-slot="{ Component }">
    <Transition
      mode="out-in"
      appear
      :name="transitionName || undefined"
      :appear-active-class="
        hasCustomClass ? enterActiveClass : !transitionName ? enterActiveClass : undefined
      "
      :enter-active-class="
        hasCustomClass ? enterActiveClass : !transitionName ? enterActiveClass : undefined
      "
      :leave-active-class="
        hasCustomClass ? leaveActiveClass : !transitionName ? leaveActiveClass : undefined
      "
    >
      <keep-alive
        :include="keepAliveNames"
        :max="10"
      >
        <component :is="Component" />
      </keep-alive>
    </Transition>
  </router-view>
</template>
<style lang="scss" scoped>
.enter-active-class {
  animation-duration: 800ms !important;
}
.leave-active-class {
  animation-duration: 400ms !important;
  animation-timing-function: ease-in-out !important;
}
</style>
