<script setup lang="ts">
import { goToRoute } from '@/router/utils/helper'

defineOptions({ name: 'Error500' })

const router = useRouter()

function handleBack() {
  if (history.state?.back) {
    router.back()
  } else {
    goToRoute('Dashboard')
  }
}
</script>

<template>
  <div class="layout-screen col-center gap-lg px-xl py-2xl">
    <div
      class="card glass-card col-center gap-xl text-center text-card-foreground w-full max-w-[40ch] rounded-xl p-xl"
    >
      <div
        class="surface-danger rounded-full center shrink-0 w-[var(--spacing-4xl)] h-[var(--spacing-4xl)]"
      >
        <Icons
          name="i-lucide-server-crash"
          size="5xl"
        />
      </div>
      <span class="text-5xl font-bold tracking-tighter">500</span>
      <p class="text-lg font-semibold m-0">
        {{ $t('router.error.serverError') }}
      </p>
      <p class="text-sm text-muted-foreground m-0">
        {{ $t('router.error.serverErrorDesc') }}
      </p>
      <Button
        :label="$t('router.error.backToHome')"
        icon="i-lucide-home"
        @click="handleBack"
      />
    </div>
  </div>
</template>
