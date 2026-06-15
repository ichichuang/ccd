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
const motionInstanceId = 'auth-motion-core-v1'
const motionCoreAttrs: Record<string, string> = {
  'data-auth-motion-core': 'true',
  'data-motion-instance': motionInstanceId,
}

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
    <div
      class="auth-visual-stage__map"
      aria-hidden="true"
    >
      <div class="auth-visual-stage__frame auth-visual-stage__frame--outer" />
      <div class="auth-visual-stage__frame auth-visual-stage__frame--inner" />
      <div class="auth-visual-stage__plane auth-visual-stage__plane--primary" />
      <div class="auth-visual-stage__plane auth-visual-stage__plane--accent" />
      <div class="auth-visual-stage__axis auth-visual-stage__axis--x" />
      <div class="auth-visual-stage__axis auth-visual-stage__axis--y" />
      <div
        class="auth-visual-stage__motion-core"
        v-bind="motionCoreAttrs"
      >
        <div class="auth-visual-stage__orbit auth-visual-stage__orbit--outer" />
        <div class="auth-visual-stage__orbit auth-visual-stage__orbit--middle" />
        <div class="auth-visual-stage__orbit auth-visual-stage__orbit--inner" />
        <div class="auth-visual-stage__core center">
          <Icons
            name="i-lucide-orbit"
            size="xl"
          />
        </div>
      </div>
      <div class="auth-visual-stage__flow auth-visual-stage__flow--contracts" />
      <div class="auth-visual-stage__flow auth-visual-stage__flow--core" />
      <div class="auth-visual-stage__flow auth-visual-stage__flow--apps" />
    </div>

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
  --auth-stage-surface: 78%;
  --auth-stage-muted: 44%;
  --auth-stage-grid: 6%;
  --auth-stage-depth: 18%;
  --auth-core-spin-duration: calc(var(--transition-5xl) * 72);

  position: relative;
  min-height: 100%;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  overflow: hidden;
  border: 1px solid rgb(var(--border) / 58%);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(ellipse at 18% 16%, rgb(var(--primary) / 18%), transparent 34%),
    radial-gradient(ellipse at 74% 72%, rgb(var(--accent) / 14%), transparent 36%),
    linear-gradient(
      140deg,
      rgb(var(--card) / var(--auth-stage-surface)),
      rgb(var(--muted) / var(--auth-stage-muted))
    ),
    rgb(var(--background));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 7%),
    inset 0 0 0 1px rgb(var(--primary) / 6%),
    0 var(--spacing-xl) var(--spacing-5xl) rgb(var(--background) / 28%);
}

.auth-visual-stage::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(rgb(var(--foreground) / var(--auth-stage-grid)) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / var(--auth-stage-grid)) 1px, transparent 1px);
  background-size:
    calc(var(--spacing-xl) + var(--spacing-sm)) calc(var(--spacing-xl) + var(--spacing-sm)),
    calc(var(--spacing-xl) + var(--spacing-sm)) calc(var(--spacing-xl) + var(--spacing-sm));
  mask-image: linear-gradient(180deg, rgb(var(--foreground) / 74%), transparent 84%);
}

.auth-visual-stage::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background:
    linear-gradient(
      90deg,
      rgb(var(--background) / 8%),
      transparent 24%,
      transparent 70%,
      rgb(var(--background) / 12%)
    ),
    radial-gradient(ellipse at 68% 44%, rgb(var(--primary) / 12%), transparent 34%);
  mix-blend-mode: soft-light;
}

.auth-visual-stage__header {
  position: relative;
  gap: var(--spacing-xs);
  max-width: 54%;
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
  max-width: 560px;
  margin: 0;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: 1.7;
}

.auth-visual-stage__map {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.auth-visual-stage__frame,
.auth-visual-stage__plane,
.auth-visual-stage__axis {
  position: absolute;
  pointer-events: none;
}

.auth-visual-stage__frame {
  border: 1px solid rgb(var(--primary) / 11%);
  background: rgb(var(--background) / 3%);
}

.auth-visual-stage__frame--outer {
  inset: 10% 2% 5%;
}

.auth-visual-stage__frame--inner {
  inset: 23% -4% -9% 46%;
  border-color: rgb(var(--accent) / 12%);
}

.auth-visual-stage__plane {
  width: min(39%, 360px);
  aspect-ratio: 1;
  border: 1px solid rgb(var(--primary) / 24%);
  background:
    linear-gradient(135deg, rgb(var(--primary) / 18%), transparent 54%),
    linear-gradient(315deg, rgb(var(--accent) / 16%), transparent 58%);
  opacity: 0.78;
}

.auth-visual-stage__plane--primary {
  right: 5%;
  top: 18%;
  transform: rotate(42deg);
}

.auth-visual-stage__plane--accent {
  right: 15%;
  top: 31%;
  border-color: rgb(var(--accent) / 22%);
  opacity: 0.62;
  transform: rotate(80deg) scale(0.72);
}

.auth-visual-stage__axis {
  opacity: 0.72;
  background: linear-gradient(90deg, transparent, rgb(var(--primary) / 28%), transparent);
}

.auth-visual-stage__axis--x {
  right: 4%;
  top: 48%;
  width: 43%;
  height: 1px;
}

.auth-visual-stage__axis--y {
  right: 24%;
  top: 17%;
  width: 1px;
  height: 58%;
  background: linear-gradient(180deg, transparent, rgb(var(--accent) / 24%), transparent);
}

.auth-visual-stage__motion-core {
  position: absolute;
  right: 7%;
  top: 17%;
  width: min(43%, 380px);
  aspect-ratio: 1;
  transform-origin: center;
  animation: auth-motion-core-spin var(--auth-core-spin-duration) linear infinite;
  contain: layout paint;
  will-change: transform;
}

.auth-visual-stage__orbit,
.auth-visual-stage__core,
.auth-visual-stage__flow {
  position: absolute;
  border-radius: var(--radius-full);
}

.auth-visual-stage__orbit {
  inset: 0;
  border: 1px solid rgb(var(--primary) / 22%);
  background: conic-gradient(
    from 90deg,
    rgb(var(--primary) / 0%),
    rgb(var(--primary) / 38%),
    rgb(var(--accent) / 28%),
    rgb(var(--success) / 18%),
    rgb(var(--primary) / 0%)
  );
  mask-image: radial-gradient(circle, transparent 57%, rgb(var(--foreground)) 58%);
}

.auth-visual-stage__orbit--middle {
  inset: 17%;
  border-color: rgb(var(--accent) / 18%);
  opacity: 0.82;
  transform: rotate(34deg);
}

.auth-visual-stage__orbit--inner {
  inset: 31%;
  border-color: rgb(var(--success) / 18%);
  opacity: 0.7;
  transform: rotate(78deg);
}

.auth-visual-stage__core {
  inset: 36%;
  border: 1px solid rgb(var(--border) / 72%);
  background:
    radial-gradient(circle, rgb(var(--primary) / 24%), transparent 68%),
    linear-gradient(135deg, rgb(var(--card) / 90%), rgb(var(--background) / 64%));
  color: rgb(var(--primary));
  box-shadow:
    inset 0 0 0 1px rgb(var(--foreground) / 8%),
    0 var(--spacing-md) var(--spacing-2xl) rgb(var(--primary) / 26%);
}

.auth-visual-stage__flow {
  height: var(--spacing-xs);
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, rgb(var(--primary) / 8%), rgb(var(--primary) / 42%));
  transform-origin: left center;
}

.auth-visual-stage__flow--contracts {
  left: 50%;
  right: 35%;
  top: 43%;
  transform: scaleX(calc(0.28 + (var(--auth-username-signal) * 0.72)));
}

.auth-visual-stage__flow--core {
  left: 52%;
  right: 26%;
  top: 57%;
  background: linear-gradient(90deg, rgb(var(--accent) / 7%), rgb(var(--accent) / 36%));
  transform: scaleX(calc(0.24 + (var(--auth-password-signal) * 0.76)));
}

.auth-visual-stage__flow--apps {
  left: 66%;
  right: 11%;
  top: 70%;
  background: linear-gradient(90deg, rgb(var(--success) / 7%), rgb(var(--success) / 34%));
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
  background:
    linear-gradient(90deg, rgb(var(--primary) / 15%), rgb(var(--accent) / 9%)),
    rgb(var(--card) / 38%);
  box-shadow: 0 var(--spacing-xs) var(--spacing-xl) rgb(var(--primary) / 10%);
}

.auth-visual-stage__signals {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm);
  max-width: 70%;
}

:global(.dark) .auth-visual-stage {
  --auth-stage-surface: 56%;
  --auth-stage-muted: 22%;
  --auth-stage-grid: 7%;
  --auth-stage-depth: 28%;
}

.auth-visual-stage--compact {
  padding: var(--spacing-lg);
}

.auth-visual-stage--compact .auth-visual-stage__signals {
  max-width: 74%;
}

.auth-visual-stage--tablet {
  min-height: 360px;
}

.auth-visual-stage--tablet .auth-visual-stage__header,
.auth-visual-stage--tablet .auth-visual-stage__signals {
  max-width: 66%;
}

.auth-visual-stage--mobile {
  min-height: 236px;
  padding: var(--spacing-md);
}

.auth-visual-stage--mobile .auth-visual-stage__header {
  max-width: 100%;
}

.auth-visual-stage--mobile .auth-visual-stage__subtitle,
.auth-visual-stage--mobile .auth-visual-stage__signals {
  display: none;
}

.auth-visual-stage--mobile .auth-visual-stage__frame--inner,
.auth-visual-stage--mobile .auth-visual-stage__plane--accent,
.auth-visual-stage--mobile .auth-visual-stage__axis {
  display: none;
}

.auth-visual-stage--mobile .auth-visual-stage__motion-core {
  right: -7%;
  top: 22%;
  width: 43%;
  opacity: 0.72;
}

.auth-visual-stage--mobile .auth-visual-stage__plane--primary {
  right: -5%;
  top: 28%;
  width: 42%;
}

@keyframes auth-motion-core-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

:global(html.is-view-transitioning) .auth-visual-stage__motion-core {
  animation-delay: 0s !important;
  animation-duration: var(--auth-core-spin-duration) !important;
  animation-iteration-count: infinite !important;
  animation-name: auth-motion-core-spin !important;
  animation-timing-function: linear !important;
}

@media (prefers-reduced-motion: reduce) {
  .auth-visual-stage__motion-core {
    animation: none;
  }
}
</style>
