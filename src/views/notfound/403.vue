<script setup lang="ts">
defineOptions({ name: 'Error403' })

const router = useRouter()

function handleBack() {
  if (history.state?.back) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="h-full column-center gap-lg px-xl py-2xl text-center bg-surface-ground">
    <div class="center w-28 h-28 rounded-full bg-danger/10 shrink-0">
      <Icons
        name="i-lucide-shield-x"
        size="5xl"
        class="text-danger"
      />
    </div>
    <span class="text-5xl font-bold text-foreground tracking-tighter">403</span>
    <p class="text-lg font-semibold text-foreground m-0">
      {{ $t('router.error.forbidden') }}
    </p>
    <p class="text-sm text-muted-foreground m-0 max-w-[40ch]">
      {{ $t('router.error.forbiddenDesc') }}
    </p>
    <Button
      :label="$t('router.error.backToHome')"
      icon="i-lucide-home"
      class="mt-sm"
      @click="handleBack"
    />
  </div>
</template>
