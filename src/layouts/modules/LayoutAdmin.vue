<script setup lang="ts">
import AppContainer from '@/layouts/components/app-container/AppContainer.vue'
import AppFooter from '@/layouts/components/app-footer/AppFooter.vue'
import AppHeader from '@/layouts/components/app-header/AppHeader'
import AppSidebar from '@/layouts/components/app-sidebar/AppSidebar.vue'
import AppTabs from '@/layouts/components/app-tabs/AppTabs.vue'
import AppTitle from '@/layouts/components/app-title/AppTitle'
import { useLayoutStore } from '@/stores'
import { computed } from 'vue'

const layoutStore = useLayoutStore()
const isPageLoading = computed(() => layoutStore.isPageLoading)
const showHeader = computed(() => layoutStore.getShowHeader)
const showSidebar = computed(() => layoutStore.getShowSidebar)
const showFooter = computed(() => layoutStore.getShowFooter)
const showTabs = computed(() => layoutStore.getShowTabs)
const isMobile = computed(() => layoutStore.getIsMobile)

// 侧边栏折叠
const sidebarCollapsed = computed(() => layoutStore.getSidebarCollapsed)

// 侧边栏内容区域动态类名 - 提取到计算属性，避免在模板中使用复杂字符串
const sidebarContentClass = computed(() => {
  const baseClass = showFooter.value
    ? 'h-[calc(100%-var(--header-height)-var(--footer-height))]'
    : 'h-[calc(100%-var(--header-height))]'

  return baseClass
})

// 侧边栏动态类名 - 提取到计算属性，避免在模板中使用复杂字符串
const sidebarClass = computed(() => {
  if (!showSidebar.value || isMobile.value) {
    return 'hidden w-0 '
  }

  if (sidebarCollapsed.value) {
    return 'hidden md:block w-0  md:w-sidebarCollapsedWidth'
  }

  return 'hidden md:block w-0  md:w-sidebarWidth'
})
</script>

<template lang="pug">
.full.between
  // 菜单栏目
  aside.h-full.relative.z-999.c-transitions(:class='sidebarClass')
    .full.bg-primary100.color-primary400(class='dark:bg-bg300 dark:color-primary100')
      .h-headerHeight.center(v-if='!isMobile')
        AppTitle
      div(
        :class='[sidebarContentClass, sidebarCollapsed ? "px0" : "px-paddings lg:px-padding xxl:px-paddingx"]',
        v-if='!isMobile'
      )
        .full
          AppSidebar
      // 底部占位
      template(v-if='showFooter')
        footer.h-footerHeight
          //- AppFooter

  // 主体
  main.h-full.w-375.flex-1
    // 头部
    template(v-if='showHeader')
      header.h-headerHeight.px-padding
        AppHeader
    // 标签页
    template(v-if='showTabs && !isMobile')
      section.h-tabsHeight
        AppTabs

    // 内容区域
    .w-full.relative.bg-bg300(
      class='dark:bg-bg100',
      :class='isMobile ? (showTabs ? "h-[calc(var(--content-breadcrumb-height)+var(--tabs-height))]" : "h-contentBreadcrumbHeight") : "h-contentBreadcrumbHeight"'
    )
      AppContainer.p-paddingx
      template(v-if='isPageLoading')
        .absolute.t-0.r-0.l-0.b-0.z-1.center
          Loading
        .absolute.t-0.r-0.l-0.b-0.bg-bg100.opacity-80

    // 底部
    template(v-if='showFooter')
      footer.h-footerHeight.bg-bg200(class='dark:bg-bg200')
        AppFooter
</template>
