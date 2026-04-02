<script setup lang="ts">
defineOptions({ name: 'Error404' })

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
  <div
    class="layout-screen flex flex-col items-center justify-center gap-lg px-xl py-2xl text-center bg-muted"
  >
    <div class="center w-28 h-28 rounded-full bg-warn/10 shrink-0">
      <Icons
        name="i-lucide-file-question"
        size="5xl"
        class="text-warn"
      />
    </div>
    <span class="text-5xl font-bold text-foreground tracking-tighter">404</span>
    <p class="text-lg font-semibold text-foreground m-0">
      {{ $t('router.error.notFound') }}
    </p>
    <p class="text-sm text-muted-foreground m-0 max-w-[40ch]">
      {{ $t('router.error.notFoundDesc') }}
    </p>
    <Button
      :label="$t('router.error.backToHome')"
      icon="i-lucide-home"
      class="mt-sm"
      @click="handleBack"
    />
  </div>
</template>
