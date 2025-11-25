<script setup lang="ts">
import { useLayoutStore } from '@/stores'
import { computed } from 'vue'

const layoutStore = useLayoutStore()
const isPageLoading = computed(() => layoutStore.isPageLoading)
const showHeader = computed(() => layoutStore.getShowHeader)
const showSidebar = computed(() => layoutStore.getShowSidebar)
const showFooter = computed(() => layoutStore.getShowFooter)
const showTabs = computed(() => layoutStore.getShowTabs)

// 侧边栏折叠
const sidebarCollapsed = computed(() => layoutStore.getSidebarCollapsed)
</script>

<template lang="pug">
.full.between
  // 菜单栏目
  aside.h-full.relative.z-999.c-transitions(
    :class='showSidebar ? (sidebarCollapsed ? "md:block md:w-sidebarCollapsedWidth" : "md:block md:w-sidebarWidth") : "hidden md:w-0"'
  )
    .full.bg-bg300.color-accent100
      .h-headerHeight.center.hidden(class='md:block')
        AppTitle
      div(
        class='h-[calc(100%-var(--header-height)-var(--footer-height))]',
        :class='showFooter ? (sidebarCollapsed ? "h-[calc(100%-var(--header-height)-var(--footer-height))] px0" : "h-[calc(100%-var(--header-height)-var(--footer-height))] px-padding") : sidebarCollapsed ? "h-[calc(100%-var(--header-height))] px0" : "h-[calc(100%-var(--header-height))] px-padding"'
      )
        .full
          AppSidebar
      // 底部占位
      template(v-if='showFooter')
        footer.h-footerHeight
          AppFooter

  // 主体
  main.h-full.w-375.flex-1
    // 头部
    template(v-if='showHeader')
      header.h-headerHeight.px-padding
        AppHeader
    // 标签页
    template(v-if='showTabs')
      section.h-tabsHeight
        AppTabs

    // 内容区域
    .w-full.h-contentBreadcrumbHeight.relative.bg-bg200
      AppContainer.p-paddingx
      template(v-if='isPageLoading')
        .absolute.t-0.r-0.l-0.b-0.z-1.center
          Loading
        .absolute.t-0.r-0.l-0.b-0.bg-bg100.opacity-80

    // 底部
    template(v-if='showFooter')
      footer.h-footerHeight.bg-bg300
        AppFooter
</template>
