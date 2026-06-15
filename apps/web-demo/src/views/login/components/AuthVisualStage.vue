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

const isUsernameActive = computed(() => props.characterState.activeField === 'username')
const isPasswordActive = computed(() => props.characterState.activeField === 'password')
const isAppsActive = computed(() => usernameSignal.value > 0 && passwordSignal.value > 0)

const stageStyle = computed<Record<string, string>>(() => ({
  '--auth-username-signal': usernameSignal.value.toFixed(3),
  '--auth-password-signal': passwordSignal.value.toFixed(3),
  '--auth-contracts-opacity': isUsernameActive.value ? '1.0' : '0.65',
  '--auth-core-opacity': isPasswordActive.value ? '1.0' : '0.65',
  '--auth-apps-opacity': isAppsActive.value ? '1.0' : '0.65',
  '--auth-contracts-stroke': isUsernameActive.value
    ? 'rgb(var(--primary))'
    : 'rgb(var(--border) / 35%)',
  '--auth-core-stroke': isPasswordActive.value ? 'rgb(var(--accent))' : 'rgb(var(--border) / 35%)',
  '--auth-apps-stroke': isAppsActive.value ? 'rgb(var(--success))' : 'rgb(var(--border) / 35%)',
}))
</script>

<template>
  <section
    id="auth-visual-stage"
    data-testid="auth-visual-stage"
    class="auth-visual-stage col-between"
    :class="{
      'auth-visual-stage--mobile': responsive.isMobile,
      'auth-visual-stage--tablet': responsive.isTablet,
      'auth-visual-stage--compact': responsive.isCompact,
    }"
    :style="stageStyle"
    aria-labelledby="login-brand-title"
  >
    <header class="auth-visual-stage__header col-stretch z-content">
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

    <!-- Compact static architecture blueprint diagram -->
    <div
      class="auth-visual-stage__diagram center z-content"
      aria-hidden="true"
    >
      <svg
        class="auth-diagram-svg"
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="flow-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stop-color="rgb(var(--primary))"
              stop-opacity="0.1"
            />
            <stop
              offset="50%"
              stop-color="rgb(var(--primary))"
              stop-opacity="1"
            />
            <stop
              offset="100%"
              stop-color="rgb(var(--accent))"
              stop-opacity="0.1"
            />
          </linearGradient>
          <linearGradient
            id="core-radial"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stop-color="rgb(var(--primary))"
            />
            <stop
              offset="100%"
              stop-color="rgb(var(--accent))"
            />
          </linearGradient>
        </defs>

        <!-- Thin Connection Paths -->
        <!-- Contracts to Core -->
        <path
          d="M 95 120 L 160 120"
          stroke="rgb(var(--border) / 12%)"
          stroke-width="1.0"
        />
        <path
          d="M 95 120 L 160 120"
          stroke="url(#flow-gradient)"
          stroke-width="1.5"
          class="auth-flow-path auth-flow-path--1"
        />

        <!-- Core to Apps -->
        <path
          d="M 240 120 L 305 120"
          stroke="rgb(var(--border) / 12%)"
          stroke-width="1.0"
        />
        <path
          d="M 240 120 L 305 120"
          stroke="url(#flow-gradient)"
          stroke-width="1.5"
          class="auth-flow-path auth-flow-path--2"
        />

        <!-- Contracts Layer Node -->
        <g
          class="auth-diagram-node auth-diagram-node--contracts"
          transform="translate(20, 95)"
        >
          <rect
            width="75"
            height="50"
            rx="6"
            fill="rgb(var(--card) / 50%)"
            stroke="var(--auth-contracts-stroke)"
            stroke-width="1.2"
            class="auth-node-rect"
          />
          <text
            x="37.5"
            y="29.5"
            fill="rgb(var(--foreground))"
            font-size="9"
            font-weight="700"
            text-anchor="middle"
            letter-spacing="0.8"
          >
            {{ t('login.diagram.contracts') }}
          </text>
        </g>

        <!-- Apps Layer Node -->
        <g
          class="auth-diagram-node auth-diagram-node--apps"
          transform="translate(305, 95)"
        >
          <rect
            width="75"
            height="50"
            rx="6"
            fill="rgb(var(--card) / 50%)"
            stroke="var(--auth-apps-stroke)"
            stroke-width="1.2"
            class="auth-node-rect"
          />
          <text
            x="37.5"
            y="29.5"
            fill="rgb(var(--foreground))"
            font-size="9"
            font-weight="700"
            text-anchor="middle"
            letter-spacing="0.8"
          >
            {{ t('login.diagram.apps') }}
          </text>
        </g>

        <!-- Static Core Node -->
        <g
          data-testid="auth-static-core"
          class="auth-diagram-node auth-diagram-node--core"
          transform="translate(160, 80)"
        >
          <!-- Pulsing ambient glow -->
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="url(#core-radial)"
            opacity="0.04"
            class="auth-core-glow"
          />
          <!-- Outer Hexagon -->
          <polygon
            points="40,12 64,26 64,54 40,68 16,54 16,26"
            fill="rgb(var(--card) / 80%)"
            stroke="var(--auth-core-stroke)"
            stroke-width="1.5"
          />
          <!-- Clean Core Dot -->
          <circle
            cx="40"
            cy="40"
            r="3.5"
            fill="var(--auth-core-stroke)"
          />
          <!-- Label -->
          <text
            x="40"
            y="88"
            fill="rgb(var(--primary))"
            font-size="8.5"
            font-weight="800"
            text-anchor="middle"
            letter-spacing="1"
          >
            {{ t('login.diagram.core') }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Small static architecture badge -->
    <div class="auth-visual-stage__architecture z-content">
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

    <!-- Floating evidence chips -->
    <div class="auth-visual-stage__signals z-content">
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
        icon="i-lucide-lock"
        :active="characterState.showPassword"
      />
      <AuthSignalCard
        :label="t('login.signals.validationPassed')"
        icon="i-lucide-check-circle"
        :active="isAppsActive"
      />
    </div>
  </section>
</template>

<style scoped>
.auth-visual-stage {
  --auth-stage-surface: 82%;
  --auth-stage-muted: 48%;
  --auth-stage-grid: 6%;

  position: relative;
  min-height: 100%;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  overflow: hidden;
  border: 1px solid rgb(var(--border) / 45%);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(ellipse at 15% 15%, rgb(var(--primary) / 10%), transparent 35%),
    radial-gradient(ellipse at 75% 75%, rgb(var(--accent) / 8%), transparent 35%),
    linear-gradient(
      140deg,
      rgb(var(--card) / var(--auth-stage-surface)),
      rgb(var(--muted) / var(--auth-stage-muted))
    ),
    rgb(var(--background));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    inset 0 0 0 1px rgb(var(--primary) / 4%),
    0 var(--spacing-xl) var(--spacing-5xl) rgb(var(--background) / 20%);
}

.auth-visual-stage::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(rgb(var(--foreground) / var(--auth-stage-grid)) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / var(--auth-stage-grid)) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(180deg, rgb(var(--foreground) / 60%), transparent 80%);
}

.auth-visual-stage__header {
  position: relative;
  gap: var(--spacing-2xs);
  max-width: 60%;
}

.auth-visual-stage__eyebrow,
.auth-visual-stage__architecture {
  color: rgb(var(--primary));
  font-size: var(--font-size-xs);
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.auth-visual-stage__title {
  margin: 0;
  color: rgb(var(--foreground));
  font-size: clamp(var(--font-size-4xl), 6vw, var(--font-size-5xl));
  font-weight: 765;
  letter-spacing: -0.025em;
  line-height: 1;
}

.auth-visual-stage__subtitle {
  max-width: 500px;
  margin: 0;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: 1.6;
}

/* Blueprint Architecture Diagram styles */
.auth-visual-stage__diagram {
  width: 100%;
  max-width: 380px;
  margin: auto;
}

.auth-diagram-svg {
  width: 100%;
  height: auto;
  color: rgb(var(--foreground));
}

.auth-diagram-node {
  transition: opacity var(--transition-md) ease-out;
}

.auth-diagram-node--contracts {
  opacity: var(--auth-contracts-opacity);
}

.auth-diagram-node--core {
  opacity: var(--auth-core-opacity);
}

.auth-diagram-node--apps {
  opacity: var(--auth-apps-opacity);
}

.auth-node-rect {
  transition:
    stroke var(--transition-md) ease-out,
    stroke-width var(--transition-md) ease-out;
}

/* Subtle line sweep - single dot dash effect */
.auth-flow-path {
  stroke-dasharray: 8 90;
  stroke-dashoffset: 98;
  animation: auth-flow-dash 5s linear infinite;
}

.auth-flow-path--1 {
  animation-duration: 4.5s;
}

.auth-flow-path--2 {
  animation-duration: 5.5s;
  animation-direction: reverse;
}

@keyframes auth-flow-dash {
  to {
    stroke-dashoffset: 0;
  }
}

/* Low frequency pulses for ambient indicators */
.auth-core-glow {
  animation: auth-core-pulse 6s ease-in-out infinite alternate;
}

@keyframes auth-core-pulse {
  0% {
    r: 32;
    opacity: 0.02;
  }

  100% {
    r: 38;
    opacity: 0.06;
  }
}

.auth-visual-stage__architecture {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: fit-content;
  margin: 0 auto;
  padding: var(--spacing-2xs) var(--spacing-sm);
  border: 1px solid rgb(var(--primary) / 20%);
  border-radius: var(--radius-full);
  background:
    linear-gradient(90deg, rgb(var(--primary) / 10%), rgb(var(--accent) / 6%)),
    rgb(var(--card) / 40%);
  box-shadow: 0 var(--spacing-xs) var(--spacing-lg) rgb(var(--primary) / 4%);
}

.auth-visual-stage__signals {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm);
  max-width: 80%;
  margin-top: auto;
}

:global(.dark) .auth-visual-stage {
  --auth-stage-surface: 42%;
  --auth-stage-muted: 18%;
  --auth-stage-grid: 7%;
}

.auth-visual-stage--compact {
  padding: var(--spacing-xl);
}

.auth-visual-stage--compact .auth-visual-stage__signals {
  max-width: 90%;
}

.auth-visual-stage--tablet {
  min-height: 340px;
}

.auth-visual-stage--tablet .auth-visual-stage__header,
.auth-visual-stage--tablet .auth-visual-stage__signals {
  max-width: 70%;
}

.auth-visual-stage--mobile {
  min-height: 220px;
  padding: var(--spacing-md);
}

.auth-visual-stage--mobile .auth-visual-stage__header {
  max-width: 100%;
}

.auth-visual-stage--mobile .auth-visual-stage__subtitle,
.auth-visual-stage--mobile .auth-visual-stage__signals,
.auth-visual-stage--mobile .auth-visual-stage__architecture {
  display: none;
}

.auth-visual-stage--mobile .auth-visual-stage__diagram {
  max-width: 280px;
  margin-top: var(--spacing-sm);
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .auth-flow-path,
  .auth-core-glow {
    animation: none !important;
  }
}
</style>
