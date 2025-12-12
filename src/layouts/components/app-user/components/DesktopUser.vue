<script setup lang="tsx">
import defaultAvatar from '@/assets/images/default-avatar.jpeg'
import { ScrollbarWrapper } from '@/components/modules/scrollbar-wrapper'
import { useElementSize, useThemeSwitch } from '@/hooks'
import { useDialog } from '@/hooks/components/useDialog'
import { t, type SupportedLocale } from '@/locales'
import { useColorStore, useLocaleStore, useSizeStore, useUserStore } from '@/stores'
import { useI18nPaddingOptions, useI18nRoundedOptions, useI18nSizeOptions } from '@/utils'
import { OhVueIcon } from 'oh-vue-icons'
import Button from 'primevue/button'
import Image from 'primevue/image'
import Popover from 'primevue/popover'
import { computed, defineComponent, ref, watch, type ComputedRef } from 'vue'
const { toggleThemeWithAnimation, isDark } = useThemeSwitch()
const { openDialog, closeDialog } = useDialog()

const colorStore = useColorStore()
const mode = computed(() => colorStore.mode)
const userStore = useUserStore()
const userInfo = computed(() => userStore.getUserInfo)
const userName = computed(() => userInfo.value?.username ?? '')
const userAvatar = computed(() => userInfo.value?.avatar || defaultAvatar)

// 头像加载失败处理
const displayAvatar = ref<string>(userAvatar.value)
const handleAvatarError = () => {
  if (displayAvatar.value !== defaultAvatar) {
    displayAvatar.value = defaultAvatar
  }
}

// 监听 userAvatar 变化，更新 displayAvatar
watch(
  userAvatar,
  newAvatar => {
    displayAvatar.value = newAvatar || defaultAvatar
  },
  { immediate: true }
)

// 尺寸相关
const sizeStore = useSizeStore()
const gapsValue = computed(() => sizeStore.getGap)
const appSizeFontx = computed(() => sizeStore.getFontSizexValue)
const sizeOptions = useI18nSizeOptions() as ComputedRef<SizeOptions[]>
const size = computed(() => sizeStore.getSize)
const setSize = (value: SizeOptions['value']) => {
  sizeStore.setSize(value)
}

// 圆角相关
const roundedOptions = useI18nRoundedOptions() as ComputedRef<RoundedOptions[]>
const rounded = computed(() => sizeStore.getRounded)
const setRounded = (value: RoundedOptions['key']) => {
  sizeStore.setRounded(value)
}

// 间距相关
const paddingOptions = useI18nPaddingOptions() as ComputedRef<PaddingOptions[]>
const padding = computed(() => sizeStore.getPadding)
const setPadding = (value: PaddingOptions['key']) => {
  sizeStore.setPadding(value)
}

// 语言相关
const localeStore = useLocaleStore()
const localesOptions = computed(() => localeStore.availableLocales)
const locale = computed(() => localeStore.currentLocale)
const setLocale = (value: SupportedLocale) => {
  localeStore.switchLocale(value)
}

// 配色相关
const themeOptions = computed(() => colorStore.getThemeOptions)
const themeValue = computed(() => colorStore.getThemeValue)
const setTheme = (value: ThemeColor['value']) => {
  colorStore.setTheme(value)
}

type PopoverInstance = InstanceType<typeof Popover>
const userPopoverRef = ref<PopoverInstance | null>(null)

const handleToggle = (event: MouseEvent) => {
  userPopoverRef.value?.toggle(event)
}

// 设置对话框内容组件
const settingsDialogContent = defineComponent({
  setup() {
    // 左侧容器引用
    const leftContainerRef = ref<HTMLElement | null>(null)
    // 获取左侧容器高度
    const { height: leftContainerHeight } = useElementSize(leftContainerRef)

    return () => (
      <div class="flex gap-gap w-80vw sm:w-65vw md:w-50vw lg:w-48vw xl:w-46vw xxl:w-44vw">
        {/* 左侧：设置项 */}
        <div
          ref={leftContainerRef}
          class="flex-1 gap-gap between-col start-col"
        >
          {/* 尺寸设置 */}
          <div>
            <div class="mb-gaps fw-bold">{t('common.settings.size')}</div>
            <div class="grid grid-cols-3 gap-gap">
              {sizeOptions.value.map(item => (
                <div
                  key={item.value}
                  class={`c-card gap-gap c-cp center between-col py-padding c-transitions ${
                    size.value === item.value ? 'bg-primary100 color-primary400' : ''
                  }`}
                  onClick={() => setSize(item.value)}
                >
                  <OhVueIcon
                    class="w-appFontSizel h-appFontSizel"
                    name={
                      item.value === 'compact'
                        ? 'ri-layout-column-line'
                        : item.value === 'comfortable'
                          ? 'ri-layout-grid-line'
                          : 'ri-layout-row-line'
                    }
                  />
                  <div>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 圆角设置 */}
          <div>
            <div class="mb-gaps fw-bold">{t('common.settings.rounded')}</div>
            <div class="grid grid-cols-4 gap-gap">
              {roundedOptions.value.map(item => (
                <div
                  key={item.key}
                  class={`c-card gap-gap c-cp center between-col py-padding c-transitions ${
                    rounded.value === item.key ? 'bg-primary100 color-primary400' : ''
                  }`}
                  onClick={() => setRounded(item.key)}
                >
                  <OhVueIcon
                    class="w-appFontSizel h-appFontSizel"
                    name={
                      item.key === 'sharp'
                        ? 'ri-stop-line'
                        : item.key === 'smooth'
                          ? 'ri-stack-line'
                          : item.key === 'round'
                            ? 'ri-rainbow-line'
                            : 'ri-checkbox-blank-circle-line'
                    }
                  />
                  <div>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 间距设置 */}
          <div>
            <div class="mb-gaps fw-bold">{t('common.settings.padding')}</div>
            <div class="grid grid-cols-3 gap-gap">
              {paddingOptions.value.map(item => (
                <div
                  key={item.key}
                  class={`c-card gap-gap c-cp center between-col py-padding c-transitions ${
                    padding.value === item.key ? 'bg-primary100 color-primary400' : ''
                  }`}
                  onClick={() => setPadding(item.key)}
                >
                  <OhVueIcon
                    class="w-appFontSizel h-appFontSizel"
                    name={
                      item.key === 'sm'
                        ? 'ri-arrow-left-right-line'
                        : item.key === 'md'
                          ? 'ri-arrow-left-right-line'
                          : 'ri-arrow-left-right-fill'
                    }
                  />
                  <div>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：配色选择器 */}
        {leftContainerHeight.value > 0 && (
          <div
            class="w-appFontSizex between-col start-col"
            style={{ height: `${leftContainerHeight.value}px` }}
          >
            <div class="mb-gaps center">
              {isDark.value ? (
                <OhVueIcon
                  name="ri-moon-clear-line"
                  class="w-appFontSizex h-appFontSizex c-cp"
                  onClick={(e: MouseEvent) => toggleThemeWithAnimation(e)}
                />
              ) : (
                <OhVueIcon
                  name="ri-sun-line"
                  class="w-appFontSizex h-appFontSizex c-cp"
                  onClick={(e: MouseEvent) => toggleThemeWithAnimation(e)}
                />
              )}
            </div>
            <ScrollbarWrapper
              direction="vertical"
              class="flex-1"
              style={{
                height: `${leftContainerHeight.value - gapsValue.value - appSizeFontx.value}px`,
              }}
              size={1}
              color-scheme={{
                thumbColor: 'transparent',
                thumbHoverColor: 'transparent',
                thumbActiveColor: 'transparent',
                trackColor: 'transparent',
                trackHoverColor: 'transparent',
                trackActiveColor: 'transparent',
              }}
            >
              <div class="gap-gap between-col start-col">
                {themeOptions.value.map(item => (
                  <div
                    key={item.value}
                    class={`h-appFontSizel c-cp c-transitions c-border border-tm rounded-rounded hover:border-contrastColor ${
                      themeValue.value === item.value
                        ? 'py-paddingx c-border border-contrastColor!'
                        : ''
                    }`}
                    style={{ background: item.themeColors.primary100 }}
                    onClick={() => setTheme(item.value)}
                  ></div>
                ))}
              </div>
            </ScrollbarWrapper>
          </div>
        )}
      </div>
    )
  },
})

// 打开更多设置对话框
const openMoreSettingsDialog = () => {
  // 关闭 Popover
  userPopoverRef.value?.hide()
  const dialogIndex = openDialog({
    header: () => t('common.settings.title'),
    draggable: true,
    closeOnMask: false,
    contentRenderer: () => <settingsDialogContent />,
    footerButtons: [
      {
        label: () => t('common.settings.logout'),
        severity: 'danger',
        btnClick: () => {
          closeDialog(dialogIndex)
          userStore.logout()
        },
      },
      {
        label: () => t('layout.tabs.close'),
        severity: 'secondary',
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
    ],
  })
}
</script>
<template lang="pug">
.c-card-primary.px-paddings.py-0.center.rounded-rounded.overflow-hidden.c-cp.gap-0(
  class='md:py-2',
  role='button',
  tabindex='0',
  @click='handleToggle'
)
  Image.w-appFontSizel.h-appFontSizel.rounded-rounded.overflow-hidden(
    :src='displayAvatar',
    @error='handleAvatarError'
  )
  .h-appFontSizel.center.between-start.px-padding.c-transitions(
    class='hover:color-primary100 rounded-l-none!'
  ) {{ userName }}

//- 用户面板
Popover.w-80vw(ref='userPopoverRef', class='sm:w-56vw md:w-36vw lg:w-30vw xl:w-26vw xxl:w-24vw')
  .gap-gap.between-col.start-col.p-padding
    //- 用户信息
    .between-start
      Image.c-card-primary.p-0.w-100.h-100.rounded-rounded.overflow-hidden(
        :src='displayAvatar',
        @error='handleAvatarError'
      )
      .h-100.px-paddingx.between-col(class='w-[calc(100%-100px)]')
        .between
          .between-start.gap-gaps.pt-paddings
            OhVueIcon.w-appFontSizex.h-appFontSizex(name='hi-solid-user')
            b.fs-appFontSizex {{ userName }}
          .h-full
            OhVueIcon.w-appFontSizel.h-appFontSizel.c-cp(
              name='fc-settings',
              animation='wrench',
              speed='fast',
              hover,
              @click='openMoreSettingsDialog'
            )
        .between-col.gap-gaps
          .between-start.gap-gaps
            OhVueIcon.w-appFontSizes.h-appFontSizes(name='hi-solid-phone')
            p.fs-appFontSizes {{ userInfo.phone }}
          .between-start.gap-gaps
            OhVueIcon.w-appFontSizes.h-appFontSizes(name='hi-solid-mail')
            p.fs-appFontSizes {{ userInfo.email }}

    //- 系统颜色模式切换(浅色/深色/自动)
    .grid.grid-cols-5.gap-gap
      .c-card.grid-col-span-2.gap-gaps.c-cp.center.between-col.py-paddings.c-transitions(
        @click='toggleThemeWithAnimation($event, "light")',
        :class='{ "bg-primary100 color-primary400": mode === "light" }'
      )
        OhVueIcon.c-transition(
          name='hi-solid-light-bulb',
          :class='!isDark ? "color-accent100 w-appFontSizel h-appFontSizel" : "color-primary100 w-appFontSizex h-appFontSizex"'
        )
        .center.text-center {{ t('common.systemOptions.themeMode.light') }}
      .c-card.grid-col-span-1.gap-gaps.c-cp.center.between-col.py-paddings.c-transitions(
        @click='toggleThemeWithAnimation($event, "auto")',
        :class='{ "bg-primary100 color-primary400": mode === "auto" }'
      )
        OhVueIcon.w-appFontSizel.h-appFontSizel(name='fc-flash-auto')
        .center.text-center {{ t('common.systemOptions.themeMode.auto') }}
      .c-card.grid-col-span-2.gap-gaps.c-cp.center.between-col.py-paddings.c-transitions(
        @click='toggleThemeWithAnimation($event, "dark")',
        :class='{ "bg-primary100 color-primary400": mode === "dark" }'
      )
        OhVueIcon.c-transition(
          name='hi-solid-light-bulb',
          flip='vertical',
          :class='isDark ? "color-accent100 w-appFontSizel h-appFontSizel" : "color-primary100 w-appFontSizex h-appFontSizex"'
        )
        .center.text-center {{ t('common.systemOptions.themeMode.dark') }}

    //- 语言设置
    .grid.grid-cols-3.gap-gap
      template(v-for='item in localesOptions', :key='item.key')
        .c-card.gap-gaps.c-cp.center.between-col.py-paddings.c-transitions(
          @click='setLocale(item.key)',
          :class='{ "bg-primary100 color-primary400": locale === item.key }'
        )
          .text-2xl {{ item.flag }}
          div {{ item.name }}

    //- 更多按钮
    .between-end.gap-gap
      .hidden(class='dark:block')
        Button.c-transitions.gap-gaps(severity='info', raised, @click='openMoreSettingsDialog')
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='fc-support')
          span {{ t('common.settings.moreSettings') }}
      .block(class='dark:hidden')
        Button.c-transitions.gap-gaps(
          severity='info',
          variant='text',
          raised,
          @click='openMoreSettingsDialog'
        )
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='fc-support')
          span {{ t('common.settings.moreSettings') }}
      //- Button(:label='t("common.settings.personalCenter")', severity='info')
      .hidden(class='dark:block')
        Button.full.c-transitions.gap-gaps(severity='danger', @click='userStore.logout')
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='fc-sports-mode')
          span {{ t('common.settings.logout') }}
      .block(class='dark:hidden')
        Button.full.c-transitions.gap-gaps(
          severity='danger',
          variant='text',
          raised,
          @click='userStore.logout'
        )
          OhVueIcon.w-appFontSizex.h-appFontSizex(name='fc-sports-mode')
          span {{ t('common.settings.logout') }}
</template>
