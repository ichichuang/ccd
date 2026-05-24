<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LoginResponsiveState } from '../types'

const { t } = useI18n({ useScope: 'global' })

defineOptions({ name: 'LoginBrandPanel' })

defineProps<{
  responsive: LoginResponsiveState
}>()
</script>

<template>
  <header class="col-center gap-xs text-center">
    <span
      class="relative center h-[var(--spacing-2xl)] w-[var(--spacing-2xl)] rounded-xl border border-solid border-primary/25 bg-primary/10 text-primary shadow-sm"
    >
      <span class="absolute inset-[24%] rounded-lg bg-card/70" />
      <Icons
        name="i-lucide-orbit"
        size="lg"
        class="relative z-content"
      />
    </span>
    <div class="col-center gap-xs">
      <h1
        id="login-brand-title"
        class="m-0 text-3xl font-semibold leading-none tracking-tight text-foreground"
        :class="responsive.isMobile ? 'text-2xl' : ''"
      >
        CCD
      </h1>
      <p class="m-0 text-xs font-medium leading-none tracking-wide text-muted-foreground">
        {{ t('login.brandSloganLine1') }}
      </p>
    </div>
  </header>
</template>
