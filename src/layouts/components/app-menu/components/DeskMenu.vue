<script setup lang="ts">
import { debounce, throttle } from '@/common'
import { INTERVAL, STRATEGY } from '@/constants/modules/layout'
import { useThemeSwitch } from '@/hooks'
import { useFull } from '@/hooks/layout/useFull'
import AppUser from '@/layouts/components/app-user/AppUser'
import { useLayoutStore } from '@/stores'
import { computed, ref } from 'vue'
const { toggleThemeWithAnimation, isDark } = useThemeSwitch()
const appUserComponent = AppUser

const { fullscreen, toggle } = useFull()
const layoutStore = useLayoutStore()

/* 菜单栏折叠控制逻辑 */
const sidebarCollapsed = computed(() => layoutStore.getSidebarCollapsed)
const _toggleSidebarCollapsed = () => {
  layoutStore.setSidebarCollapsed(!sidebarCollapsed.value)
  rotateSum.value += 180
}
const toggleSidebarCollapsed =
  STRATEGY === 'debounce'
    ? debounce(_toggleSidebarCollapsed, INTERVAL)
    : throttle(_toggleSidebarCollapsed, INTERVAL)
const rotateSum = ref<number>(sidebarCollapsed.value ? 180 : 0)
</script>

<template lang="pug">
.center.gap-gap
  //- 折叠按钮
  .c-card-primary.p-paddings.c-transitions.size-1-1.hidden(class='md:flex', @click='toggleSidebarCollapsed')
    Icons.c-transitions(name='ri-flutter-fill', :style='{ transform: `rotate(${rotateSum}deg)` }')
  //- 全屏按钮
  .c-card-primary.p-paddings.c-transitions.size-1-1(@click='toggle')
    template(v-if='fullscreen')
      Icons.c-transitions.fw-bold(name='ri-fullscreen-exit-line', animation='ring', hover)
    template(v-else)
      Icons.c-transitions.fw-bold(name='ri-fullscreen-line', animation='ring', hover)
  //- <md : 颜色模式切换
  .block(class='md:hidden')
    .c-card-primary.p-paddings.c-transitions.size-1-1(@click='toggleThemeWithAnimation($event)')
      template(v-if='isDark')
        Icons(name='ri-moon-clear-line', size='s')
      template(v-else)
        Icons(name='ri-sun-line', size='s')

  //- 用户信息
  component(:is='appUserComponent')
</template>
<style lang="scss" scope></style>
