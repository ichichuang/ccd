<script setup lang="ts">
import { BREAKPOINTS } from '@ccd/design-tokens'
import { useDeviceStore } from '@/stores/modules/system'
import HeaderActions from './components/HeaderActions.vue'
import BrandPanel from './components/BrandPanel.vue'
import AnimatedCharacters from './components/animated-characters/Index.vue'
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
    <div class="login-page__backdrop absolute inset-0 z-base pointer-events-none overflow-hidden">
      <div class="login-page__texture absolute inset-0" />
    </div>

    <div class="login-page__content relative z-content layout-full center">
      <div class="col-center w-full gap-sm">
        <LoginShell :responsive="responsiveState">
          <template #visual>
            <div class="login-visual-pane col-stretch h-full gap-md">
              <BrandPanel :responsive="responsiveState" />
              <div
                id="login-character-stage"
                class="login-character-stage relative min-h-[300px] flex-1"
              >
                <AnimatedCharacters
                  :active-field="characterState.activeField"
                  :username-length="characterState.usernameLength"
                  :password-length="characterState.passwordLength"
                  :show-password="characterState.showPassword"
                />
              </div>
            </div>
          </template>

          <LoginForm
            :responsive="responsiveState"
            @character-state-change="handleCharacterStateChange"
          />
        </LoginShell>
        <HeaderActions />
      </div>
    </div>
  </main>
</template>

<style scoped>
.login-page__backdrop {
  background:
    linear-gradient(
      135deg,
      rgb(var(--background) / 100%) 0%,
      rgb(var(--muted) / 38%) 52%,
      rgb(var(--background) / 100%) 100%
    ),
    linear-gradient(90deg, rgb(var(--primary) / 7%) 0%, rgb(var(--accent) / 7%) 100%);
}

.login-page__texture {
  background-image:
    linear-gradient(rgb(var(--foreground) / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / 4%) 1px, transparent 1px);
  background-size:
    44px 44px,
    44px 44px;
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    rgb(var(--foreground) / 74%) 16%,
    rgb(var(--foreground) / 56%) 84%,
    transparent 100%
  );
}

.login-page__content {
  padding: calc(var(--safe-top) + var(--spacing-lg)) calc(var(--safe-right) + var(--spacing-lg))
    calc(var(--safe-bottom) + var(--spacing-lg)) calc(var(--safe-left) + var(--spacing-lg));
}

.login-character-stage {
  min-height: clamp(260px, 34vh, 386px);
}

@media (width <= 1024px) {
  .login-page__content {
    padding: calc(var(--safe-top) + var(--spacing-md)) calc(var(--safe-right) + var(--spacing-md))
      calc(var(--safe-bottom) + var(--spacing-md)) calc(var(--safe-left) + var(--spacing-md));
  }

  .login-character-stage {
    min-height: 232px;
  }
}

@media (width <= 768px) {
  .login-page__content {
    align-items: flex-start;
    padding: calc(var(--safe-top) + var(--spacing-sm)) calc(var(--safe-right) + var(--spacing-sm))
      calc(var(--safe-bottom) + var(--spacing-sm)) calc(var(--safe-left) + var(--spacing-sm));
  }

  .login-character-stage {
    min-height: 188px;
  }
}
</style>
