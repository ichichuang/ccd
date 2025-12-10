<script setup lang="ts">
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

const doLogin = async () => {
  const { valid } = await submitForm()
  if (!valid) {
    loading.value = false
    return
  }
  const values = getFormValues()
  loading.value = true
  try {
    const { token } = await login({
      username: values.username,
      password: values.password,
    })
    await userStore.setToken(token)
    window.$toast.success(t('common.messages.loginSuccess'), t('common.messages.welcomeMessage'))
  } catch (_error) {
    window.$toast?.error?.(t('common.messages.loginFailed'))
  } finally {
    loading.value = false
  }
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
  // 背景气泡
  AnimateWrapper.fixed(:show='true', enter='fadeIn', duration='1s')
    .absolute.w-8vw.h-8vw.rounded-full.blur-3xl.bg-primary100.l-gapl.t-gapl
  AnimateWrapper.fixed(:show='true', enter='fadeIn', duration='1s')
    .absolute.w-8vw.h-8vw.rounded-full.blur-3xl.bg-accent100.r-gapl.b-gapl
  AnimateWrapper.fixed(:show='true', enter='lightSpeedInLeft', duration='1s')
    .absolute.w-50vw.h-50vw.rounded-full.bg-primary200.left--10vw.bottom--10vw.c-shadow-primary
  AnimateWrapper.fixed(:show='true', enter='lightSpeedInRight', duration='2s')
    .absolute.w-50vw.h-50vw.rounded-full.bg-accent200.right--10vw.top--10vw.c-shadow-accent

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
          .between-start
            .c-cp.c-transitions(class='hover:text-primary100') {{ t('common.actions.register') }}
          .between-end.gap-gaps
            span.c-cp.c-transitions(class='hover:text-primary100') {{ t('common.actions.forgotPassword') }}
            span.c-cp.c-transitions(class='hover:text-primary100') {{ t('common.actions.recoverAccount') }}

        Button.fw-bold(:loading='loading', @click='doLogin') {{ loading ? t('common.actions.loginInProgress') : t('common.auth.login.loginButton') }}
        .mt-gapl
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
