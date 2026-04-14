<script setup lang="ts">
defineOptions({ name: 'AnimateRouterView' })

import { routeWhitePathList } from '@/router/utils/helper'
import { routeUtils } from '@/router'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/modules/layout'
import type { CssTime, PhaseValue, RouteTransition } from '@/types/modules/router'
import type { ComponentPublicInstance } from 'vue'

type TransitionPhase = 'enter' | 'leave'

const route = useRoute()
const layoutStore = useLayoutStore()
// Layout 核心开关：是否启用路由过渡 & KeepAlive
const enableTransition = computed(() => layoutStore.enableTransition)
const enableKeepAlive = computed(() => layoutStore.enableKeepAlive)
// 检查当前路由是否在白名单中
const isWhiteListRoute = computed(() =>
  (routeWhitePathList as readonly string[]).includes(route.path)
)

// routeUtils.keepAliveNames 基于路由 name；而 <KeepAlive include> 实际匹配组件 name。
// 为避免两者不一致导致“配置了 keepAlive 但未命中缓存”，维护一份组件名别名集做并集匹配。
const keepAliveRouteNamesRef = ref<string[]>(routeUtils.keepAliveNames)
const keepAliveAliasNamesRef = ref<string[]>([])
const routeComponentRef = ref<ComponentPublicInstance | null>(null)
const keepAliveMismatchWarned = new Set<string>()

// 只有在非白名单路由时才计算 keepAliveNames
const keepAliveNames = computed(() => {
  if (isWhiteListRoute.value) {
    return []
  }
  return Array.from(new Set([...keepAliveRouteNamesRef.value, ...keepAliveAliasNamesRef.value]))
})

// 监听路由变化，同步更新 keepAliveNames
watch(
  () => route.name,
  () => {
    const newKeepAliveNames = [...routeUtils.keepAliveNames]
    const sortedNew = [...newKeepAliveNames].sort((a, b) => a.localeCompare(b))
    const sortedPrev = [...keepAliveRouteNamesRef.value].sort((a, b) => a.localeCompare(b))
    if (JSON.stringify(sortedNew) !== JSON.stringify(sortedPrev)) {
      keepAliveRouteNamesRef.value = newKeepAliveNames
    }
  },
  { immediate: true }
)

const resolveRenderedComponentName = (): string | undefined => {
  const type = routeComponentRef.value?.$?.type as { name?: string; __name?: string } | undefined
  return type?.name || type?.__name
}

const warnKeepAliveNameMismatch = (renderedName?: string) => {
  if (!import.meta.env.DEV || route.meta?.keepAlive !== true) return
  const routeName = typeof route.name === 'string' ? route.name : ''
  const warnKey = route.fullPath
  if (keepAliveMismatchWarned.has(warnKey)) return

  if (!routeName) {
    keepAliveMismatchWarned.add(warnKey)
    console.warn(
      `[AnimateRouterView] keepAlive route "${route.fullPath}" 缺少字符串 route.name，KeepAlive include 依赖可匹配名称。建议为该路由配置 name，并与组件 defineOptions({ name }) 对齐。`
    )
    return
  }

  // 动态路由组件在异步解析/过渡阶段可能暂时不可读，避免误报。
  // 仅在成功解析到组件名后再执行一致性校验。
  if (!renderedName) return

  if (renderedName !== routeName) {
    keepAliveMismatchWarned.add(warnKey)
    console.warn(
      `[AnimateRouterView] keepAlive 名称不一致：route.name="${routeName}"，component.name="${renderedName}"，path="${route.fullPath}"。建议统一二者，避免缓存命中不稳定。`
    )
  }
}

watch(
  () => route.fullPath,
  async () => {
    if (!enableKeepAlive.value || route.meta?.keepAlive !== true) return
    await nextTick()
    const renderedName = resolveRenderedComponentName()
    warnKeepAliveNameMismatch(renderedName)
    if (!renderedName) return
    const exists =
      keepAliveRouteNamesRef.value.includes(renderedName) ||
      keepAliveAliasNamesRef.value.includes(renderedName)
    if (!exists) {
      keepAliveAliasNamesRef.value = [...keepAliveAliasNamesRef.value, renderedName]
    }
  },
  { immediate: true }
)

const rawTransition = computed(() => (route.meta?.transition as RouteTransition) || {})

const resolveGlobalTime = (value?: PhaseValue<CssTime>) =>
  typeof value === 'string' ? value : undefined

const resolvePhaseTime = (value: PhaseValue<CssTime> | undefined, phase: TransitionPhase) => {
  if (!value) {
    return undefined
  }
  if (typeof value === 'string') {
    return value
  }
  return value[phase]
}

const formatAnimateClass = (cls?: string) => {
  if (!cls) return undefined
  const tokens = cls.trim().split(/\s+/).filter(Boolean)

  if (tokens.length === 0) return undefined

  const normalized = tokens.map(token =>
    token.startsWith('animate__') ? token : `animate__${token}`
  )

  if (!normalized.includes('animate__animated')) {
    normalized.unshift('animate__animated')
  }

  return Array.from(new Set(normalized)).join(' ')
}

const enterActiveClass = computed(() =>
  enableTransition.value ? formatAnimateClass(rawTransition.value.enterClass) : undefined
)
const leaveActiveClass = computed(() =>
  enableTransition.value ? formatAnimateClass(rawTransition.value.leaveClass) : undefined
)
const isClassMode = computed(() => !!enterActiveClass.value || !!leaveActiveClass.value)

const finalTransitionName = computed(() => {
  if (!enableTransition.value || isClassMode.value) return undefined
  return rawTransition.value.name || layoutStore.transitionName || 'cinematic-fade'
})

const transitionMode = computed(() => {
  const mode = rawTransition.value.mode
  if (mode === 'default') return undefined
  return mode ?? 'out-in'
})

const transitionAppear = computed(
  () => enableTransition.value && rawTransition.value.appear !== false
)

/** 全局时长/延迟注入：字符串值写入容器，分阶段值在 hooks 写入元素 */
const styleVars = computed<Record<string, string>>(() => {
  if (!enableTransition.value) return {}

  const duration = resolveGlobalTime(rawTransition.value.duration)
  const delay = resolveGlobalTime(rawTransition.value.delay)
  const vars: Record<string, string> = {}

  if (duration) {
    vars['--route-transition-duration'] = duration
    vars['--animate-duration'] = duration
  }

  if (delay) {
    vars['--route-transition-delay'] = delay
    vars['--animate-delay'] = delay
  }

  return vars
})

const applyPhaseVars = (el: Element, phase: TransitionPhase) => {
  if (!enableTransition.value) return

  const element = el as HTMLElement
  const duration = resolvePhaseTime(rawTransition.value.duration, phase)
  const delay = resolvePhaseTime(rawTransition.value.delay, phase)

  if (duration) {
    element.style.setProperty('--animate-duration', duration)
    element.style.setProperty('--route-transition-duration', duration)
  } else {
    element.style.removeProperty('--animate-duration')
    element.style.removeProperty('--route-transition-duration')
  }

  if (delay) {
    element.style.setProperty('--animate-delay', delay)
    element.style.setProperty('--route-transition-delay', delay)
  } else {
    element.style.removeProperty('--animate-delay')
    element.style.removeProperty('--route-transition-delay')
  }
}

const handleBeforeAppear = (el: Element) => applyPhaseVars(el, 'enter')
const handleBeforeEnter = (el: Element) => applyPhaseVars(el, 'enter')
const handleBeforeLeave = (el: Element) => applyPhaseVars(el, 'leave')
</script>
<template>
  <div
    class="layout-full min-h-0"
    :style="styleVars"
  >
    <router-view
      v-slot="{ Component, route: currentRoute }"
      class="layout-full min-h-0"
    >
      <Transition
        :appear="transitionAppear"
        :mode="transitionMode"
        :name="finalTransitionName"
        :enter-active-class="enterActiveClass"
        :leave-active-class="leaveActiveClass"
        :type="isClassMode ? 'animation' : undefined"
        @before-appear="handleBeforeAppear"
        @before-enter="handleBeforeEnter"
        @before-leave="handleBeforeLeave"
      >
        <keep-alive
          v-if="enableKeepAlive"
          :include="keepAliveNames"
          :max="10"
        >
          <component
            :is="Component"
            :key="currentRoute.fullPath"
            ref="routeComponentRef"
            class="layout-full min-h-0"
          />
        </keep-alive>
        <component
          :is="Component"
          v-else
          :key="currentRoute.fullPath"
          ref="routeComponentRef"
          class="layout-full min-h-0"
        />
      </Transition>
    </router-view>
  </div>
</template>
