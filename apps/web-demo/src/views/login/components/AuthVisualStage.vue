<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LoginCharacterState, LoginResponsiveState } from '../types'

defineOptions({ name: 'AuthVisualStage' })

const props = defineProps<{
  responsive: LoginResponsiveState
  characterState: LoginCharacterState
}>()

const { t } = useI18n({ useScope: 'global' })

const hasCredentialSignal = computed(
  () => props.characterState.usernameLength > 0 && props.characterState.passwordLength > 0
)
const hasPasswordSignal = computed(() => props.characterState.passwordLength > 0)
const isCoreActive = computed(
  () => props.characterState.activeField !== null || props.characterState.showPassword
)
</script>

<template>
  <section
    id="auth-visual-stage"
    data-testid="auth-visual-stage"
    class="auth-visual-stage"
    :class="{
      'auth-visual-stage--mobile': responsive.isMobile,
      'auth-visual-stage--tablet': responsive.isTablet,
      'auth-visual-stage--compact': responsive.isCompact,
    }"
    :aria-label="t('login.stageSubtitle')"
  >
    <div class="auth-visual-stage__chips">
      <span
        data-testid="auth-static-core"
        class="auth-architecture-chip auth-architecture-chip--topology"
        :class="{ 'auth-architecture-chip--active': isCoreActive }"
      >
        <span class="auth-architecture-chip__dot" />
        <span>
          {{ t('login.diagram.contracts') }} → {{ t('login.diagram.core') }} →
          {{ t('login.diagram.apps') }}
        </span>
      </span>
      <span class="auth-architecture-chip">
        {{ t('login.signals.governanceGate') }}
      </span>
      <span
        class="auth-architecture-chip"
        :class="{ 'auth-architecture-chip--active': hasPasswordSignal }"
      >
        {{ t('login.signals.runtimeIsolated') }}
      </span>
      <span
        class="auth-architecture-chip"
        :class="{ 'auth-architecture-chip--active': hasCredentialSignal }"
      >
        {{ t('login.signals.validationPassed') }}
      </span>
    </div>
    <p class="auth-visual-stage__caption">CCD Architecture Console</p>
  </section>
</template>

<style scoped>
.auth-visual-stage {
  position: relative;
  width: 100%;
  color: rgb(var(--muted-foreground));
  text-align: center;
}

.auth-visual-stage__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-xs);
  width: 100%;
}

.auth-architecture-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: calc(var(--spacing-xl) - var(--spacing-2xs));
  padding: var(--spacing-2xs) var(--spacing-md);
  border: 1px solid rgb(var(--border) / 55%);
  border-radius: var(--radius-full);
  background: rgb(var(--card) / 72%);
  box-shadow:
    0 1px 2px rgb(var(--background) / 4%),
    inset 0 1px 0 rgb(var(--foreground) / 3%);
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-xs);
  font-weight: 650;
  letter-spacing: 0;
  line-height: 1;
  transition:
    background-color var(--transition-sm) ease-out,
    border-color var(--transition-sm) ease-out,
    color var(--transition-sm) ease-out,
    box-shadow var(--transition-sm) ease-out;
}

.auth-architecture-chip--topology {
  gap: var(--spacing-xs);
}

.auth-architecture-chip--active {
  border-color: rgb(var(--primary) / 40%);
  background: rgb(var(--primary) / 6%);
  color: rgb(var(--primary));
}

.auth-architecture-chip__dot {
  width: calc(var(--spacing-xs) + var(--spacing-3xs));
  height: calc(var(--spacing-xs) + var(--spacing-3xs));
  flex: 0 0 auto;
  border-radius: var(--radius-full);
  background: rgb(var(--primary));
  box-shadow: 0 0 0 3px rgb(var(--primary) / 10%);
  opacity: 0.85;
}

.auth-visual-stage__caption {
  margin: var(--spacing-md) 0 0;
  color: rgb(var(--muted-foreground) / 70%);
  font-size: var(--font-size-xs);
  font-weight: 650;
  letter-spacing: 0;
  line-height: 1.3;
}

:global(.dark) .auth-architecture-chip {
  border-color: rgb(var(--border) / 45%);
  background: rgb(var(--background) / 54%);
  box-shadow:
    0 1px 2px rgb(var(--background) / 18%),
    inset 0 1px 0 rgb(var(--foreground) / 5%);
}

:global(.dark) .auth-architecture-chip--active {
  border-color: rgb(var(--primary) / 50%);
  background: rgb(var(--primary) / 10%);
}

.auth-visual-stage--compact .auth-visual-stage__caption {
  margin-top: var(--spacing-sm);
}

.auth-visual-stage--mobile .auth-visual-stage__chips {
  gap: var(--spacing-2xs);
}

.auth-visual-stage--mobile .auth-architecture-chip:not(.auth-architecture-chip--topology),
.auth-visual-stage--mobile .auth-visual-stage__caption {
  display: none;
}
</style>
