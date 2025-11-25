<script setup lang="ts">
import { getCurrentRoute, getFlatRouteList, goToRoute } from '@/common'
import { useLocale } from '@/hooks'
import { computed, ref } from 'vue'

const { $t } = useLocale()

// 当前路由 title
const currentRouteTitle = computed(() => {
  const currentRoute = getCurrentRoute()
  return $t(currentRoute.meta?.titleKey as string) || currentRoute.meta?.title
})

// 首页配置
const home = ref({
  icon: 'icon-line-md:mushroom-filled',
  route: '/',
})

// 获取面包屑数据
const items = computed(() => {
  const currentPath = getCurrentRoute().path
  const breadcrumbItems: Array<{ label: string; route?: string }> = []

  // 根据当前路径构建面包屑
  const pathSegments = currentPath.split('/').filter(Boolean)
  let currentPathBuilder = ''

  for (const segment of pathSegments) {
    currentPathBuilder += `/${segment}`
    const matchedRoute = getFlatRouteList().find(r => r.path === currentPathBuilder)
    if (matchedRoute) {
      const titleKey = matchedRoute.meta?.titleKey
      let label = ''

      if (titleKey) {
        // 优先使用 titleKey 进行国际化
        label = $t(titleKey)
      } else if (matchedRoute.meta?.title) {
        // 如果没有 titleKey，则使用 title
        label = matchedRoute.meta.title as string
      } else {
        label = matchedRoute.name as string
      }

      // 只设置 label，不设置 route，这样就不会有点击跳转功能
      const breadcrumbItem: { label: string; route?: string } = { label }
      breadcrumbItems.push(breadcrumbItem)
    }
  }

  return breadcrumbItems
})
</script>

<template lang="pug">
Breadcrumb(:home='home', :model='items')
  template(#item='{ item }')
    template(v-if='item.route')
      div(
        :class='[item.icon, "c-cp w-appFontSizex h-appFontSizex mb1"]',
        @click='goToRoute(item.route)'
      )
    template(v-else)
      template(v-if='item.label === currentRouteTitle')
        span.select-none {{ item.label }}
      template(v-else)
        span.color-text200.select-none {{ item.label }}
</template>
