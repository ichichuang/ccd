<script setup lang="ts">
import { routeWhitePathList } from '@/common'
import { routeUtils } from '@/router'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
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
const rawTransition = computed(() => route.meta?.transition || {})
const hasCustomClass = computed(() =>
  Boolean(
    (rawTransition.value as any).enterTransition || (rawTransition.value as any).leaveTransition
  )
)
const transitionName = computed(() =>
  !hasCustomClass.value ? (rawTransition.value as any).name || '' : ''
)
const enterActiveClass = computed(
  () =>
    (rawTransition.value as any).enterTransition ||
    'animate__animated animate__fadeIn animate__fast enter-active-class'
)
const leaveActiveClass = computed(
  () =>
    (rawTransition.value as any).leaveTransition ||
    'animate__animated animate__slideOutLeft animate__fast leave-active-class'
)
</script>
<template lang="pug">
router-view(v-slot='{ Component }')
  //- 使用 Transition 统一管理进入/离开/切换动画（支持 meta.transition 动态配置）
  Transition(
    mode='out-in',
    appear,
    :name='transitionName || undefined',
    :appear-active-class='hasCustomClass ? enterActiveClass : !transitionName ? enterActiveClass : undefined',
    :enter-active-class='hasCustomClass ? enterActiveClass : !transitionName ? enterActiveClass : undefined',
    :leave-active-class='hasCustomClass ? leaveActiveClass : !transitionName ? leaveActiveClass : undefined'
  )
    //- 始终使用单一包裹元素，避免子组件多根导致过渡无效
    //- 关键修复：不要在 component 上使用 key，因为 keep-alive 需要自己管理组件缓存
    //- 如果使用 key，每次 key 变化都会强制重新创建组件，从而绕过 keep-alive
    //- 统一使用 KeepAlive；白名单时 keepAliveNames 为空数组，相当于不缓存
    //- 注意：keep-alive 的 include 匹配的是组件的 name（defineOptions 中设置的），不是路由的 name
    keep-alive(:include='keepAliveNames', :max='10')
      component(:is='Component')
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
