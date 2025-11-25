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
.full.center.c-gradient-bg-top-left
  .center-col.gap-gap(class='w90% sm:w80% md:w46% lg:w28% xls:w26%')
    .fs-appFontSizel.font-bold.color-accent100 ccd
    .c-shadow.p-padding.rounded-xl.wfull.c-border.p-paddingl.bg-bg100.center-col.gap-gap.c-gradient-primary-bottom-right
      .h-100.w-100.center
        Image.full(src='./face.png')

      Button.full(:disabled='loading', severity='help', @click='handleLogin') {{ loading ? t('common.actions.loginInProgress') : t('common.actions.enterSystem') }}
</template>
