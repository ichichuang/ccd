<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AuthSignalCard from './AuthSignalCard.vue'
import type { LoginCharacterState, LoginResponsiveState } from '../types'

defineOptions({ name: 'AuthVisualStage' })

const props = defineProps<{
  responsive: LoginResponsiveState
  characterState: LoginCharacterState
}>()

const { t } = useI18n({ useScope: 'global' })

const usernameSignal = computed(
  () => Math.min(Math.max(props.characterState.usernameLength, 0), 20) / 20
)
const passwordSignal = computed(
  () => Math.min(Math.max(props.characterState.passwordLength, 0), 18) / 18
)

const stageStyle = computed<Record<string, string>>(() => ({
  '--auth-username-signal': usernameSignal.value.toFixed(3),
  '--auth-password-signal': passwordSignal.value.toFixed(3),
}))

const isUsernameActive = computed(() => props.characterState.activeField === 'username')
const isPasswordActive = computed(() => props.characterState.activeField === 'password')
</script>

<template>
  <section
    id="auth-visual-stage"
    class="auth-visual-stage col-between"
    :class="{
      'auth-visual-stage--mobile': responsive.isMobile,
      'auth-visual-stage--tablet': responsive.isTablet,
      'auth-visual-stage--compact': responsive.isCompact,
    }"
    :style="stageStyle"
    aria-labelledby="login-brand-title"
  >
    <header class="auth-visual-stage__header col-stretch">
      <span class="auth-visual-stage__eyebrow">{{ t('login.gatewayEyebrow') }}</span>
      <h1
        id="login-brand-title"
        class="auth-visual-stage__title"
      >
        CCD
      </h1>
      <p class="auth-visual-stage__subtitle">
        {{ t('login.stageSubtitle') }}
      </p>
    </header>

    <div
      class="auth-visual-stage__orbital"
      aria-hidden="true"
    >
      <div class="auth-visual-stage__orbit auth-visual-stage__orbit--outer" />
      <div class="auth-visual-stage__orbit auth-visual-stage__orbit--inner" />
      <div class="auth-visual-stage__core center">
        <Icons
          name="i-lucide-orbit"
          size="xl"
        />
      </div>
      <div class="auth-visual-stage__flow auth-visual-stage__flow--contracts" />
      <div class="auth-visual-stage__flow auth-visual-stage__flow--core" />
      <div class="auth-visual-stage__flow auth-visual-stage__flow--apps" />
    </div>

    <div class="auth-visual-stage__architecture">
      <span>contracts</span>
      <Icons
        name="i-lucide-arrow-right"
        size="xs"
      />
      <span>core</span>
      <Icons
        name="i-lucide-arrow-right"
        size="xs"
      />
      <span>apps</span>
    </div>

    <div class="auth-visual-stage__signals">
      <AuthSignalCard
        :label="t('login.signals.governanceGate')"
        icon="i-lucide-shield-check"
        :active="isUsernameActive"
      />
      <AuthSignalCard
        :label="t('login.signals.runtimeIsolated')"
        icon="i-lucide-boxes"
        :active="isPasswordActive"
      />
      <AuthSignalCard
        :label="t('login.signals.safeStorage')"
        icon="i-lucide-lock-keyhole"
        :active="characterState.showPassword"
      />
      <AuthSignalCard
        :label="t('login.signals.validationPassed')"
        icon="i-lucide-badge-check"
        :active="usernameSignal > 0 && passwordSignal > 0"
      />
    </div>
  </section>
</template>

<style scoped>
.auth-visual-stage {
  position: relative;
  min-height: 100%;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  overflow: hidden;
  border: 1px solid rgb(var(--border) / 48%);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(circle at 18% 18%, rgb(var(--primary) / 18%), transparent 28%),
    radial-gradient(circle at 82% 72%, rgb(var(--accent) / 14%), transparent 30%),
    linear-gradient(135deg, rgb(var(--card) / 62%), rgb(var(--background) / 24%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 5%),
    0 var(--spacing-xl) var(--spacing-5xl) rgb(var(--background) / 24%);
}

.auth-visual-stage::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(rgb(var(--foreground) / 5%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / 5%) 1px, transparent 1px);
  background-size:
    calc(var(--spacing-xl) + var(--spacing-sm)) calc(var(--spacing-xl) + var(--spacing-sm)),
    calc(var(--spacing-xl) + var(--spacing-sm)) calc(var(--spacing-xl) + var(--spacing-sm));
  mask-image: linear-gradient(180deg, rgb(var(--foreground) / 76%), transparent 82%);
}

.auth-visual-stage__header {
  position: relative;
  gap: var(--spacing-xs);
  max-width: 58%;
}

.auth-visual-stage__eyebrow,
.auth-visual-stage__architecture {
  color: rgb(var(--primary));
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.auth-visual-stage__title {
  margin: 0;
  color: rgb(var(--foreground));
  font-size: clamp(var(--font-size-4xl), 7vw, var(--font-size-5xl));
  font-weight: 760;
  letter-spacing: 0;
  line-height: 1;
}

.auth-visual-stage__subtitle {
  max-width: 520px;
  margin: 0;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: 1.7;
}

.auth-visual-stage__orbital {
  position: absolute;
  right: 6%;
  top: 14%;
  width: min(46%, 360px);
  aspect-ratio: 1;
}

.auth-visual-stage__orbit,
.auth-visual-stage__core,
.auth-visual-stage__flow {
  position: absolute;
  border-radius: var(--radius-full);
}

.auth-visual-stage__orbit {
  inset: 0;
  border: 1px solid rgb(var(--primary) / 18%);
  background: conic-gradient(
    from 90deg,
    rgb(var(--primary) / 0%),
    rgb(var(--primary) / 34%),
    rgb(var(--accent) / 24%),
    rgb(var(--primary) / 0%)
  );
  mask-image: radial-gradient(circle, transparent 58%, rgb(var(--foreground)) 59%);
  animation: auth-orbit-spin calc(var(--transition-5xl) * 28) linear infinite;
}

.auth-visual-stage__orbit--inner {
  inset: 17%;
  border-color: rgb(var(--accent) / 18%);
  animation-direction: reverse;
  animation-duration: calc(var(--transition-5xl) * 20);
}

.auth-visual-stage__core {
  inset: 34%;
  border: 1px solid rgb(var(--border) / 66%);
  background:
    radial-gradient(circle, rgb(var(--primary) / 20%), transparent 72%), rgb(var(--card) / 72%);
  color: rgb(var(--primary));
  box-shadow:
    inset 0 0 0 1px rgb(var(--foreground) / 6%),
    0 var(--spacing-md) var(--spacing-2xl) rgb(var(--primary) / 22%);
}

.auth-visual-stage__flow {
  height: var(--spacing-xs);
  background: rgb(var(--primary) / 32%);
  transform-origin: left center;
}

.auth-visual-stage__flow--contracts {
  left: 4%;
  right: 58%;
  top: 44%;
  transform: scaleX(calc(0.28 + (var(--auth-username-signal) * 0.72)));
}

.auth-visual-stage__flow--core {
  left: 29%;
  right: 28%;
  top: 58%;
  background: rgb(var(--accent) / 28%);
  transform: scaleX(calc(0.24 + (var(--auth-password-signal) * 0.76)));
}

.auth-visual-stage__flow--apps {
  left: 58%;
  right: 3%;
  top: 72%;
  background: rgb(var(--success) / 28%);
  transform: scaleX(
    calc(0.22 + ((var(--auth-username-signal) + var(--auth-password-signal)) * 0.39))
  );
}

.auth-visual-stage__architecture {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: fit-content;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid rgb(var(--primary) / 24%);
  border-radius: var(--radius-full);
  background: rgb(var(--primary) / 10%);
}

.auth-visual-stage__signals {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm);
  max-width: 68%;
}

.auth-visual-stage--compact {
  padding: var(--spacing-lg);
}

.auth-visual-stage--compact .auth-visual-stage__signals {
  max-width: 74%;
}

.auth-visual-stage--tablet {
  min-height: 340px;
}

.auth-visual-stage--tablet .auth-visual-stage__header,
.auth-visual-stage--tablet .auth-visual-stage__signals {
  max-width: 64%;
}

.auth-visual-stage--mobile {
  min-height: 228px;
  padding: var(--spacing-md);
}

.auth-visual-stage--mobile .auth-visual-stage__header {
  max-width: 100%;
}

.auth-visual-stage--mobile .auth-visual-stage__subtitle,
.auth-visual-stage--mobile .auth-visual-stage__signals {
  display: none;
}

.auth-visual-stage--mobile .auth-visual-stage__orbital {
  right: -10%;
  top: 18%;
  width: 48%;
  opacity: 0.72;
}

@keyframes auth-orbit-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-visual-stage__orbit {
    animation: none;
  }
}
</style>
