<script setup lang="ts">
import { debounce, throttle } from '@/common'
import { INTERVAL, STRATEGY } from '@/constants/modules/layout'
import { useThemeSwitch } from '@/hooks'
import { useFull } from '@/hooks/layout/useFull'
import { t } from '@/locales'
import { useLayoutStore, useUserStore } from '@/stores'
import { computed, ref } from 'vue'
const { toggleThemeWithAnimation, isDark } = useThemeSwitch()
const { fullscreen, toggle } = useFull()
const userStore = useUserStore()
const layoutStore = useLayoutStore()
const isLoggedIn = computed(() => userStore.getIsLogin)
const currentLayoutMode = computed(() => layoutStore.getCurrentLayout)

/* 控制设置面板显示状态 */
const desktopSettingVisible = ref(false)
const mobileSettingVisible = ref<any>(null)
// 打开/关闭弹出框
const toggleSetting = (type: 'desktop' | 'mobile', event?: any) => {
  if (type === 'desktop') {
    desktopSettingVisible.value = !desktopSettingVisible.value
  } else {
    mobileSettingVisible.value?.toggle(event)
  }
}

const handleLogout = () => {
  userStore.logout()
}

/* 控制侧边栏折叠 */
const sidebarCollapsed = computed(() => layoutStore.getSidebarCollapsed)
const _toggleSidebarCollapsed = () => {
  layoutStore.setSidebarCollapsed(!sidebarCollapsed.value)
}
const toggleSidebarCollapsed =
  STRATEGY === 'debounce'
    ? debounce(_toggleSidebarCollapsed, INTERVAL)
    : throttle(_toggleSidebarCollapsed, INTERVAL)

/* 控制移动端菜单显示 */
const mobileSidebarVisible = computed(() => layoutStore.getMobileSidebarVisible)
const toggleMobileMenu = () => {
  layoutStore.setMobileSidebarVisible(!mobileSidebarVisible.value)
}
</script>

<template lang="pug">
//- 未登录-登录界面
template(v-if='!isLoggedIn')
  .c-card-accent.c-border-accent.size-1-1.center(@click='toggleThemeWithAnimation($event)')
    template(v-if='isDark')
      .fs-appFontSizex(class='icon-line-md:moon-twotone-alt-loop')
    template(v-else)
      .fs-appFontSizex(class='icon-line-md:sunny-outline-twotone')
  ColorSwitch.fixed.b-gap.r-gap
template(v-else)
  //- 全屏布局
  template(v-if='currentLayoutMode === "ratio"')
  template(v-else-if='currentLayoutMode === "fullscreen"')
  template(v-else-if='currentLayoutMode === "screen"')
    .c-card-accent.shadow-none.size-1-1.center(@click='toggleThemeWithAnimation($event)')
      template(v-if='isDark')
        .fs-appFontSizex(class='icon-line-md:moon-twotone-alt-loop')
      template(v-else)
        .fs-appFontSizex(class='icon-line-md:sunny-outline-twotone')
  template(v-else-if='currentLayoutMode === "admin"')
    .between.gap-gap(class='h100%')
      .c-card-accent.shadow-none.size-1-1.center(@click='toggle')
        template(v-if='fullscreen')
          .fs-appFontSizex(class='icon-line-md:arrows-vertical-alt')
        template(v-else)
          .fs-appFontSizex(class='icon-line-md:arrows-vertical')
      //- 桌面端
      .hidden.c-card-accent.shadow-none.size-1-1.center(
        class='md:block',
        @click='toggleSidebarCollapsed',
        v-if='currentLayoutMode === "admin"'
      )
        .fs-appFontSizex(v-if='layoutStore.getSidebarCollapsed', class='icon-line-md:arrow-open-right')
        .fs-appFontSizex(v-else, class='icon-line-md:arrow-open-left')
      .c-card-accent.shadow-none.size-1-1.center.hidden(
        class='md:block',
        @click='toggleSetting("desktop", $event)'
      )
        .text-ellipsis.fs-appFontSizex(class='icon-line-md:cog-filled')
      //- 移动端
      .c-card-accent.shadow-none.size-1-1.center.hidden(
        class='sm:block md:hidden',
        @click='toggleMobileMenu'
      )
        .fs-appFontSizex(class='icon-line-md:grid-3-filled')
      .c-card-accent.shadow-none.size-1-1.center(
        class='md:hidden',
        @click='toggleSetting("mobile", $event)'
      )
        .fs-appFontSizex(class='icon-line-md:cog-filled')
      .c-card-accent.shadow-none.size-1-1.center(@click='toggleThemeWithAnimation($event)')
        template(v-if='isDark')
          .fs-appFontSizex(class='icon-line-md:moon-twotone-alt-loop')
        template(v-else)
          .fs-appFontSizex(class='icon-line-md:sunny-outline-twotone')

//- 桌面端设置面板抽屉
Drawer(v-model:visible='desktopSettingVisible', position='right', class='w32% lg:w28% xl:w24% xls:w22%')
  template(#header)
    .font-bold.fs-appFontSizex {{ t('common.settings.title') }}
  .full.gap-24.between-col.start-col.relative
    .between-start.gap-gap
      span {{ t('common.settings.theme') }}
      ThemeSwitch
    .between-start.gap-gap
      span {{ t('common.settings.size') }}
      SizeSwitch
    .between-start.gap-gap
      span {{ t('common.settings.rounded') }}
      RoundSwitch
    .between-start.gap-gap
      span {{ t('common.settings.padding') }}
      PaddingSwitch
    .between-start.gap-gap
      span {{ t('common.settings.language') }}
      LocalesSwitch
    ColorSwitch.absolute.b-gap.r-gap
    //- FontSizeSwitchDesktop
  template(#footer)
    .flex.items-center.gap-gapl.px-paddingl
      Button.flex-auto(:label='t("common.settings.systemManagement")')
      Button.flex-auto(
        :label='t("common.settings.logout")',
        severity='danger',
        variant='text',
        raised,
        @click='handleLogout'
      )

//- 移动端设置面板弹出框
Popover(ref='mobileSettingVisible')
  .gap-gap.between-col.start-col.w-60vw(class='sm:w-40vw')
    .between-start.gap-gap
      span {{ t('common.settings.theme') }}
      ThemeSwitch
    //- ColorSwitch.absolute.b-gap.r-gap
    SizeSwitch
    PaddingSwitch
    RoundSwitch
    LocalesSwitch
    //- FontSizeSwitchMobile
    Button.flex-auto(
      :label='t("common.settings.logout")',
      severity='danger',
      variant='text',
      raised,
      @click='handleLogout'
    )
</template>
<style lang="scss" scoped></style>
