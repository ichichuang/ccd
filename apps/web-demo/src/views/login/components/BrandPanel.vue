<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LoginResponsiveState } from '../types'

defineOptions({ name: 'LoginBrandPanel' })

defineProps<{
  responsive: LoginResponsiveState
}>()

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <header
    class="login-brand-panel gap-sm"
    :class="
      responsive.isMobile || responsive.isTablet ? 'col-center text-center' : 'row-start text-left'
    "
  >
    <span
      class="relative center h-[var(--spacing-2xl)] w-[var(--spacing-2xl)] shrink-0 rounded-lg border border-solid border-primary/25 bg-primary/10 text-primary shadow-sm"
    >
      <span class="absolute inset-[24%] rounded-md bg-card/70" />
      <Icons
        name="i-lucide-orbit"
        size="lg"
        class="relative z-content"
      />
    </span>
    <div
      class="col-stretch gap-xs"
      :class="responsive.isMobile || responsive.isTablet ? 'items-center' : 'items-start'"
    >
      <h1
        id="login-brand-title"
        class="m-0 text-3xl font-semibold leading-none text-foreground"
        :class="responsive.isMobile ? 'text-2xl' : ''"
      >
        CCD
      </h1>
      <p class="m-0 text-xs font-medium leading-snug text-muted-foreground">
        {{ t('login.brandSloganLine1') }}
      </p>
    </div>
  </header>
</template>
