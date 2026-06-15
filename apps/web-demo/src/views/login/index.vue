<script setup lang="ts">
import { BREAKPOINTS } from '@ccd/design-tokens'
import { useDeviceStore } from '@/stores/modules/system'
import AuthShaderBackdrop from './components/AuthShaderBackdrop.vue'
import AuthVisualStage from './components/AuthVisualStage.vue'
import LoginForm from './components/LoginForm.vue'
import LoginShell from './components/LoginShell.vue'
import type { LoginCharacterState, LoginResponsiveState } from './types'

defineOptions({ name: 'LoginPage' })

const deviceStore = useDeviceStore()

const viewportWidth = computed(() => deviceStore.width)
const viewportHeight = computed(() => deviceStore.height)

const responsiveState = computed<LoginResponsiveState>(() => ({
  isMobile: viewportWidth.value < BREAKPOINTS.md,
  isTablet: viewportWidth.value >= BREAKPOINTS.md && viewportWidth.value < BREAKPOINTS.xl,
  isCompact: viewportWidth.value < BREAKPOINTS.lg || viewportHeight.value <= 740,
}))

const characterState = ref<LoginCharacterState>({
  activeField: null,
  usernameLength: 0,
  passwordLength: 0,
  showPassword: false,
})

function handleCharacterStateChange(nextState: LoginCharacterState): void {
  characterState.value = nextState
}

function preventDecorativeSelection(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  if (target.closest('input, textarea, [contenteditable="true"]')) return
  event.preventDefault()
}
</script>

<template>
  <main
    id="login-page"
    class="layout-screen relative isolate select-none bg-background text-foreground"
    @selectstart="preventDecorativeSelection"
  >
    <AuthShaderBackdrop />

    <div class="login-page__content relative z-content layout-full center">
      <LoginShell :responsive="responsiveState">
        <template #visual>
          <AuthVisualStage
            :responsive="responsiveState"
            :character-state="characterState"
          />
        </template>

        <LoginForm
          :responsive="responsiveState"
          @character-state-change="handleCharacterStateChange"
        />
      </LoginShell>
    </div>
  </main>
</template>

<style scoped>
.login-page__content {
  padding: calc(var(--safe-top) + var(--spacing-xl)) calc(var(--safe-right) + var(--spacing-xl))
    calc(var(--safe-bottom) + var(--spacing-xl)) calc(var(--safe-left) + var(--spacing-xl));
}

@media (width <= 1024px) {
  .login-page__content {
    padding: calc(var(--safe-top) + var(--spacing-md)) calc(var(--safe-right) + var(--spacing-md))
      calc(var(--safe-bottom) + var(--spacing-md)) calc(var(--safe-left) + var(--spacing-md));
  }
}

@media (width <= 768px) {
  .login-page__content {
    align-items: flex-start;
    padding: calc(var(--safe-top) + var(--spacing-sm)) calc(var(--safe-right) + var(--spacing-sm))
      calc(var(--safe-bottom) + var(--spacing-sm)) calc(var(--safe-left) + var(--spacing-sm));
  }
}
</style>
