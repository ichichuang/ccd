<script setup lang="ts">
import { BREAKPOINTS } from '@ccd/design-tokens'
import { useDeviceStore } from '@/stores/modules/system'
import HeaderActions from './components/HeaderActions.vue'
import BrandPanel from './components/BrandPanel.vue'
import LoginForm from './components/LoginForm.vue'
import LoginShell from './components/LoginShell.vue'
import type { LoginResponsiveState } from './types'

const deviceStore = useDeviceStore()

const viewportWidth = computed(() => deviceStore.width)
const viewportHeight = computed(() => deviceStore.height)

const responsiveState = computed<LoginResponsiveState>(() => ({
  isMobile: viewportWidth.value < BREAKPOINTS.md,
  isCompact: viewportWidth.value < BREAKPOINTS.lg || viewportHeight.value <= 740,
}))

function preventDecorativeSelection(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  if (target.closest('input, textarea, [contenteditable="true"]')) return
  event.preventDefault()
}

defineOptions({ name: 'LoginPage' })
</script>

<template>
  <main
    class="layout-screen relative isolate select-none bg-background text-foreground"
    @selectstart="preventDecorativeSelection"
  >
    <div class="absolute inset-0 z-base pointer-events-none overflow-hidden">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgb(var(--primary)/0.18),transparent_32%),linear-gradient(145deg,rgb(var(--background)/1),rgb(var(--muted)/0.34)_55%,rgb(var(--background)/1))]"
      />
      <div
        class="absolute left-[32vw] top-[20vh] h-[46vh] w-[36vw] rounded-full bg-primary/8 blur-2xl"
      />
      <div
        class="absolute bottom-[-12vh] right-[-8vw] h-[34vh] w-[28vw] rounded-full bg-info/10 blur-2xl"
      />
    </div>

    <div class="relative z-content layout-full center px-md py-lg sm:px-lg">
      <div class="col-center gap-sm">
        <LoginShell :responsive="responsiveState">
          <BrandPanel :responsive="responsiveState" />
          <LoginForm :responsive="responsiveState" />
        </LoginShell>
        <HeaderActions />
      </div>
    </div>
  </main>
</template>
