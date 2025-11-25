<script setup lang="ts">
import { goToRoute } from '@/common'
import { useLayoutStore } from '@/stores'
import { computed } from 'vue'

const layoutStore = useLayoutStore()

const showBreadcrumb = computed(() => layoutStore.getShowBreadcrumb)
const currentLayoutMode = computed(() => layoutStore.getCurrentLayout)

/* 控制移动端菜单显示 */
const mobileSidebarVisible = computed(() => layoutStore.getMobileSidebarVisible)
const toggleMobileMenu = () => {
  layoutStore.setMobileSidebarVisible(!mobileSidebarVisible.value)
}
</script>
<template lang="pug">
template(v-if='currentLayoutMode === "ratio"')
template(v-else-if='currentLayoutMode === "fullscreen"')
template(v-else-if='currentLayoutMode === "screen"')
  .full.between
    .center.hidden(class='sm:block')
      AppBreadcrumb(v-if='showBreadcrumb')
    .h-full.center.py-paddings.gap-gap(class='sm:hidden')
      .h-full.size-1-1.c-cp.p-paddings(@click='goToRoute("")')
        Image.full(src='./face.png')
    AppTopMenu
template(v-else-if='currentLayoutMode === "admin"')
  .full.between
    .center.hidden(class='sm:block')
      AppBreadcrumb(v-if='showBreadcrumb')
    .h-full.center.py-paddings.gap-gap(class='sm:hidden')
      .h-full.c-card-primary.shadow-none.size-1-1.center(@click='toggleMobileMenu')
        .fs-appFontSizex(class='icon-line-md:grid-3-filled')
      .h-full.size-1-1.c-cp.p-paddings(@click='goToRoute("")')
        Image.full(src='./face.png')
    AppTopMenu
</template>
