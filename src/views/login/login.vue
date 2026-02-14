<script setup lang="ts">
import { AUTH_ENABLED } from '@/constants/router'
import { useUserStore } from '@/stores/modules/user'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userStore = useUserStore()

const username = ref<string | undefined>('admin')
const password = ref<string | undefined>('123456')
const loading = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  if (!AUTH_ENABLED) {
    errorMessage.value = t('login.authDisabled')
    return
  }

  if (!username.value || !password.value) {
    errorMessage.value = t('login.required')
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    await userStore.login({
      username: username.value || '',
      password: password.value || '',
    })
    // 成功后，userStore.setUserInfo 内部会处理跳转
  } catch (error) {
    errorMessage.value = (error as Error).message || t('login.failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="layout-full column main-center cross-center bg-background">
    <div class="bg-card px-padding-lg py-padding-lg rounded-scale shadow-md w-80 md:w-96">
      <div class="fs-lg text-primary mb-margin-md">
        {{ t('login.title') }}
      </div>

      <div class="column gap-md mb-margin-md">
        <div>
          <label class="fs-sm text-foreground mb-1 block">{{ t('login.username') }}</label>
          <InputText
            v-model="username"
            class="w-full"
            autocomplete="username"
            :placeholder="t('login.placeholderUsername')"
          />
        </div>

        <div>
          <label class="fs-sm text-foreground mb-1 block">{{ t('login.password') }}</label>
          <Password
            v-model="password"
            class="w-full"
            :feedback="false"
            toggle-mask
            autocomplete="current-password"
            :placeholder="t('login.placeholderPassword')"
          />
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="fs-sm text-danger mb-margin-md"
      >
        {{ errorMessage }}
      </div>

      <Button
        class="w-full"
        :label="t('login.submit')"
        :loading="loading"
        @click="onSubmit"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
