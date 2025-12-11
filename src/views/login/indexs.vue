<script setup lang="ts">
import { throttle } from '@#/index'
import { login } from '@/api'
import { SchemaForm } from '@/components/modules/schema-form'
import type { Schema } from '@/components/modules/schema-form/utils/types'
import { useThemeSwitch } from '@/hooks'
import { useSchemaForm } from '@/hooks/components/useSchemaForm'
import type { SupportedLocale } from '@/locales'
import { t } from '@/locales'
import { useUserStoreWithOut } from '@/stores'
import { useLocaleStore } from '@/stores/modules/locale'
import { computed, ref, watch } from 'vue'

const localeStore = useLocaleStore()
const userStore = useUserStoreWithOut()
const { toggleThemeWithAnimation, isDark } = useThemeSwitch()
const loading = ref(false)
const schemaFormRef = ref()
const localesOptions = computed(() => localeStore.availableLocales)
const locale = computed(() => localeStore.currentLocale)
const setLocale = (value: SupportedLocale) => {
  localeStore.switchLocale(value)
}
const loginSchema: Schema = {
  columns: [
    {
      field: 'username',
      label: t('common.auth.username'),
      component: 'InputText',
      placeholder: t('common.auth.username'),
      rules: 'required',
      props: {
        autocomplete: 'username',
        autofocus: true,
      },
    },
    {
      field: 'password',
      label: t('common.auth.password'),
      component: 'Password',
      placeholder: t('common.auth.password'),
      rules: 'required',
      props: {
        feedback: false,
        toggleMask: true,
        autocomplete: 'current-password',
      },
    },
  ],
  layout: {
    labelAlign: 'top',
    showLabel: false,
  },
}

const { schema, submitForm, getFormValues, setValues, updateField } = useSchemaForm({
  formRef: schemaFormRef,
  initialSchema: loginSchema,
})

/* 监听语言切换更改表单配置 */
watch(
  () => locale.value,
  () => {
    updateField('username', {
      label: t('common.auth.username'),
      placeholder: t('common.auth.username'),
    })
    updateField('password', {
      label: t('common.auth.password'),
      placeholder: t('common.auth.password'),
    })
  },
  { immediate: true }
)

// 点击计数和时间窗口管理
const clickTimes: number[] = []
const CLICK_WINDOW = 5000 // 5秒时间窗口
const MAX_CLICKS = 6 // 5秒内最大点击次数

// 清理过期的点击记录
const cleanExpiredClicks = () => {
  const now = Date.now()
  while (clickTimes.length > 0 && now - clickTimes[0] > CLICK_WINDOW) {
    clickTimes.shift()
  }
}

// 检查是否点击过快（每次点击都会调用，不受节流影响）
const checkClickTooFast = (): boolean => {
  cleanExpiredClicks()
  const now = Date.now()
  clickTimes.push(now)

  if (clickTimes.length > MAX_CLICKS) {
    window.$toast.warnIn(
      'bottom-right',
      t('common.messages.clickTooFast'),
      t('common.messages.pleaseWait')
    )
    // 显示警告后立即重置计数器
    clickTimes.length = 0
    return true
  }
  return false
}

// 原始登录函数（不包含快速点击检测，因为检测在外部）
const doLoginOriginal = async () => {
  const { valid } = await submitForm()
  if (!valid) {
    loading.value = false
    return
  }
  const values = getFormValues()
  loading.value = true
  login({
    username: values.username,
    password: values.password,
  })
    .then(({ token }) => {
      userStore.setToken(token)
      window.$toast.success(t('common.messages.loginSuccess'), t('common.messages.welcomeMessage'))
      loading.value = false
      // 登录成功后清空点击记录
      clickTimes.length = 0
    })
    .catch(_error => {
      loading.value = false
    })
}

// 使用节流包裹登录函数（3秒内最多执行一次）
const throttledLogin = throttle(doLoginOriginal, 1200)

// 登录函数包装器：先检查快速点击，再执行节流的登录
const doLogin = () => {
  // 每次点击都记录，不受节流影响
  if (checkClickTooFast()) {
    return
  }
  // 如果点击速度正常，执行节流的登录函数
  throttledLogin()
}

const handleAdminSchemaForm = () => {
  setValues({
    username: 'admin',
    password: '123456',
  })
}

const handleUserSchemaForm = () => {
  setValues({
    username: 'user',
    password: '123456',
  })
}
</script>

<template lang="pug">
.fixed.inset-0.center.bg-bg100.select-none
  // 背景气泡 - **添加律动类名**
  // 小气泡 1 (慢速)
  .absolute.w-8vw.h-8vw.rounded-full.blur-3xl.bg-primary100.l-gapl.t-gapl.animate-bubble-slow
  // 小气泡 2 (中速)
  .absolute.w-8vw.h-8vw.rounded-full.blur-3xl.bg-accent100.r-gapl.b-gapl.animate-bubble-medium
  AnimateWrapper.fixed(:show='true', enter='lightSpeedInLeft', duration='1s')
    // 大气泡 1 (快速/长周期)
    .absolute.w-50vw.h-50vw.rounded-full.bg-primary200.left--10vw.bottom--10vw.c-shadow-primary.animate-bubble-fast
  AnimateWrapper.fixed(:show='true', enter='lightSpeedInRight', duration='2s')
    // 大气泡 2 (中速)
    .absolute.w-50vw.h-50vw.rounded-full.bg-accent200.right--10vw.top--10vw.c-shadow-accent.animate-bubble-medium

  // 语言切换
  .fixed.t-gap.r-gapl.grid.grid-cols-3.gap-gaps
    template(v-for='item in localesOptions', :key='item.key')
      .c-cp.c-card.p-paddings(@click='setLocale(item.key)')
        .fs-appFontSizex.w-appFontSizex.h-appFontSizex.center.c-transitions(class='hover:scale-110') {{ item.flag }}
  // 登录卡片
  AnimateWrapper(:show='true', enter='zoomIn', duration='800ms', enter-delay='1s')
    .relative.bg-bg100.rounded-rounded.backdrop-blur-xl.c-shadow-primary.p-paddingl.gap-gap.between-col(
      class='w-90% sm:w-80% md:w-46% lg:w-30% xl:w-28% xxl:w-26%'
    )
      .between-start.gap-gap
        Image.w-appFontSizel.h-appFontSizel(src='./face.png')
        .flex-1.between.gap-gap.items-end
          b {{ t('common.auth.login.title') }}
          .between.gap-gaps
            .color-text200.fs-appFontSizes {{ t('common.actions.welcome') }}
            .center.gap-gaps
              Button.p-paddings.rounded-rounded.bg-bg200(
                text,
                @click='toggleThemeWithAnimation($event)'
              )
                OhVueIcon.w-appFontSize.h-appFontSize(
                  :name='isDark ? "ri-sun-line" : "ri-moon-clear-line"'
                )

      //- 分割线
      .w-full.h-1.my-gaps.bg-primary100.opacity-80

      .px-paddingl.between-col.gap-gaps
        //- 表单
        .fs-appFontSize {{ t('common.auth.accountPasswordLogin') }}
        SchemaForm(ref='schemaFormRef', :schema='schema')

        .between-col.color-text200.fs-appFontSizes
          AnimateWrapper.w-full(
            :show='true',
            enter='zoomInLeft',
            duration='1400ms',
            enter-delay='1400ms'
          )
            .between-start.full
              .c-cp.c-transitions(class='hover:text-primary100') {{ t('common.actions.register') }}
          AnimateWrapper.w-full(
            :show='true',
            enter='zoomInRight',
            duration='1400ms',
            enter-delay='1400ms'
          )
            .between-end.gap-gaps.full
              span.c-cp.c-transitions(class='hover:text-primary100') {{ t('common.actions.forgotPassword') }}
              span.c-cp.c-transitions(class='hover:text-primary100') {{ t('common.actions.recoverAccount') }}

        Button.fw-bold(:loading='loading', @click='doLogin') {{ loading ? t('common.actions.loginInProgress') : t('common.auth.login.loginButton') }}
        AnimateWrapper.w-full(:show='true', enter='fadeIn', enter-delay='2400ms')
          .mt-gapl.full
            .center.color-accent100.fs-appFontSizes
              span {{ t('common.actions.otherLogin') }}
            .between.fs-appFontSizes
              Button(
                size='small',
                severity='success',
                text,
                outlined,
                @click='handleAdminSchemaForm'
              ) {{ t('common.actions.admin') }}
              Button(size='small', severity='warn', text, outlined, @click='handleUserSchemaForm') {{ t('common.actions.user') }}
</template>

<style scoped lang="scss">
/*
  ==============================================
  背景气泡律动动画 (Bubble Pulse Animation) - 优化后
  ==============================================
*/

// 定义气泡律动动画的关键帧
@keyframes bubblePulse {
  // 0% 和 100% 保持默认样式 (与 Vue 过渡终点对齐)
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  // 50% 达到最大的“呼吸”状态
  50% {
    // 稍微缩小，并增加模糊感 (如果需要)
    transform: scale(0.92);
    // 降低透明度，营造气泡在背景中“淡入淡出”的呼吸效果
    opacity: 0.6;
  }
}

// 慢速律动: 15秒周期 (使用 ease-in-out 使变化平滑)
.animate-bubble-slow {
  // 移除 alternate，使用 infinite 实现平滑循环
  animation: bubblePulse 15s ease-in-out infinite;
  animation-delay: 0s;
}

// 中速律动: 10秒周期，1秒初始延迟
.animate-bubble-medium {
  animation: bubblePulse 10s ease-in-out infinite;
  animation-delay: 1s;
}

// 快速/长周期律动: 15秒周期，3秒初始延迟
.animate-bubble-fast {
  animation: bubblePulse 15s ease-in-out infinite;
  animation-delay: 3s;
}
</style>
