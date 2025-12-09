<script setup lang="ts">
import { goToRoute } from '@/common'
import AppBreadcrumb from '@/layouts/components/app-breadcrumb/AppBreadcrumb'
import AppTopMenu from '@/layouts/components/app-menu/AppMenu'
import AppSidebar from '@/layouts/components/app-sidebar/AppSidebar.vue'
import { useLayoutStore } from '@/stores'
import { computed } from 'vue'
const layoutStore = useLayoutStore()
const currentBreakpoint = computed(() => layoutStore.getCurrentBreakpoint)
const showBreadcrumb = computed(() => layoutStore.getShowBreadcrumb)
const appBreadcrumbComponent = AppBreadcrumb
const appTopMenuComponent = AppTopMenu
</script>
<template lang="pug">
.full.between.gap-gap
  .center.gap-gap(class='md:hidden')
    AnimateWrapper(:show='true', enter='fadeInLeft', leave='fadeOutLeft', duration='1s')
      .c-cp.w-appFontSizel.h-appFontSizel(@click='goToRoute("")')
        Image(src='./face.png')
    .center
      AppSidebar(v-if='currentBreakpoint === "xs" || currentBreakpoint === "sm"')
  .center.w-full
    component(:is='appBreadcrumbComponent', v-if='showBreadcrumb')
  component(:is='appTopMenuComponent')
</template>
<style lang="scss" scoped></style>
