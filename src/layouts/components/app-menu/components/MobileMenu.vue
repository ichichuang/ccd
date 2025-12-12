<script setup lang="ts">
import { useThemeSwitch } from '@/hooks'
import AppUser from '@/layouts/components/app-user/AppUser'
import { useLayoutStore } from '@/stores'
import { computed, ref } from 'vue'
const { toggleThemeWithAnimation, isDark } = useThemeSwitch()
const appUserComponent = AppUser
const layoutStore = useLayoutStore()

/* 菜单栏折叠控制逻辑 */
const sidebarCollapsed = computed(() => layoutStore.getSidebarCollapsed)
const _toggleSidebarCollapsed = () => {
  layoutStore.setSidebarCollapsed(!sidebarCollapsed.value)
  rotateSum.value += 180
}

const rotateSum = ref<number>(sidebarCollapsed.value ? 180 : 0)
</script>

<template lang="pug">
.center.gap-gap
  .c-card-primary.p-paddings.c-transitions.size-1-1(
    @click='toggleThemeWithAnimation($event)',
    @touch='toggleThemeWithAnimation($event)'
  )
    template(v-if='isDark')
      Icons(name='ri-moon-clear-line', size='s')
    template(v-else)
      Icons(name='ri-sun-line', size='s')

  //- 用户信息
  component(:is='appUserComponent')
</template>
<style lang="scss" scope></style>
