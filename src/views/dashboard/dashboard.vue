<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const inputText = ref<string | undefined>('')
defineOptions({ name: 'Dashboard' })
</script>
<template>
  <div class="p-padding-md">
    <div class="row-start gap-md">
      <Icons name="i-lucide-user" />
      <Icons name="i-lucide-settings" />
      <Icons name="i-lucide-home" />

      <Icons name="i-mdi-database-export" />
      <Icons name="i-mdi-card-account-details" />

      <Icons name="i-logos-vue" />
      <Icons name="i-logos-google-icon" />
      <Icons name="i-logos-typescript-icon" />

      <Icons name="i-custom:custom-juejin" />
      <Icons name="i-custom:language-cn" />
      <Icons name="i-custom:language-en" />

      <Button size="small">{{ t('dashboard.buttonSmall') }}</Button>
      <Button>{{ t('dashboard.buttonMedium') }}</Button>
      <Button size="large">{{ t('dashboard.buttonLarge') }}</Button>

      <InputText v-model="inputText" />
    </div>
    <div
      v-for="i in 100"
      :key="i"
    >
      {{ i }}：{{ t('dashboard.sampleText') }}
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
