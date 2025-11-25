<script setup lang="ts">
import { login } from '@/api'
import { t } from '@/locales'
import { useUserStoreWithOut } from '@/stores'
import { ref } from 'vue'

const userStore = useUserStoreWithOut()
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true

  try {
    const {
      data: { token },
    } = await login({ username: 'admin', password: '123456' })
    userStore.setToken(token)
  } catch (error) {
    console.error(`❌ ${t('common.messages.loginFailed')}:`, error)
    userStore.logout()
  } finally {
    loading.value = false
  }
}
</script>

<template lang="pug">
.full.h-100vh.center.bg-bg200
  .center-col.gap-gap(class='w90% sm:w80% md:w46% lg:w28% xls:w26%')
    .fs-appFontSizex.font-bold {{ t('common.auth.login.title') }}
    .fs-appFontSize {{ t('common.actions.register') }}
    .c-shadow.p-padding.rounded-xl.wfull.c-border.p-paddingl.bg-bg100
      .wfull.h-60.grid.grid-cols-3.gap-gap
        .c-card-accent.center.bg-bg100 {{ t('common.social.qq') }}
        .c-card-accent.center.bg-bg100 {{ t('common.social.wechat') }}
        .c-card-accent.center.bg-bg100 {{ t('common.social.alipay') }}
      .full.center
        Divider.w-full.p0.my2(align='center', type='dotted')
          span.font-bold {{ t('common.auth.accountPasswordLogin') }}

      Button.full(:disabled='loading', severity='help', @click='handleLogin') {{ loading ? t('common.actions.loginInProgress') : t('common.auth.login.loginButton') }}
    .full.between-end
      .text-warn.c-cp(class='duration-200!') {{ t('common.actions.forgotPassword') }}
      .text-danger.c-cp(class='duration-200!') {{ t('common.actions.recoverAccount') }}
</template>
