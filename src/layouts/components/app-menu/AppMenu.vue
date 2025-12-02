<script setup lang="ts">
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
      OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-moon-clear-line')
    template(v-else)
      OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-sun-line')
  ColorSwitch.fixed.b-gap.r-gap
template(v-else)
  //- 全屏布局
  template(v-if='currentLayoutMode === "ratio"')
  template(v-else-if='currentLayoutMode === "fullscreen"')
  template(v-else-if='currentLayoutMode === "admin"')
    .between.gap-gap(class='h100%')
      .c-card-accent.shadow-none.size-1-1.center(@click='toggle')
        template(v-if='fullscreen')
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-fullscreen-exit-line')
        template(v-else)
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-fullscreen-line')
      //- 桌面端
      .c-card-accent.shadow-none.size-1-1.center.hidden(
        class='md:block',
        @click='toggleSetting("desktop", $event)'
      )
        OhVueIcon.text-ellipsis.w-appFontSizex.h-appFontSizex(name='ri-settings-3-line')
      //- 移动端
      .c-card-accent.shadow-none.size-1-1.center.hidden(
        class='sm:block md:hidden',
        @click='toggleMobileMenu'
      )
        OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-grid-fill')
      .c-card-accent.shadow-none.size-1-1.center(
        class='md:hidden',
        @click='toggleSetting("mobile", $event)'
      )
        OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-settings-3-line')
      .c-card-accent.shadow-none.size-1-1.center(@click='toggleThemeWithAnimation($event)')
        template(v-if='isDark')
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-moon-clear-line')
        template(v-else)
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='ri-sun-line')

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
