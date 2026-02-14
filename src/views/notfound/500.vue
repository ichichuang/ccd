<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <div>{{ t('router.error.serverError') }}</div>
</template>
<style lang="scss" scoped></style>
