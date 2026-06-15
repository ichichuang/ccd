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
        viewBox="0 0 400 220"
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
              stop-opacity="0.05"
            />
            <stop
              offset="50%"
              stop-color="rgb(var(--primary))"
              stop-opacity="0.8"
            />
            <stop
              offset="100%"
              stop-color="rgb(var(--accent))"
              stop-opacity="0.05"
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
          d="M 95 110 L 160 110"
          stroke="rgb(var(--border) / 10%)"
          stroke-width="0.8"
        />
        <path
          d="M 95 110 L 160 110"
          stroke="url(#flow-gradient)"
          stroke-width="1.2"
          class="auth-flow-path auth-flow-path--1"
        />

        <!-- Core to Apps -->
        <path
          d="M 240 110 L 305 110"
          stroke="rgb(var(--border) / 10%)"
          stroke-width="0.8"
        />
        <path
          d="M 240 110 L 305 110"
          stroke="url(#flow-gradient)"
          stroke-width="1.2"
          class="auth-flow-path auth-flow-path--2"
        />

        <!-- Contracts Layer Node -->
        <g
          class="auth-diagram-node auth-diagram-node--contracts"
          transform="translate(15, 92)"
        >
          <rect
            width="80"
            height="36"
            rx="8"
            fill="rgb(var(--card) / 20%)"
            stroke="var(--auth-contracts-stroke)"
            stroke-width="0.8"
            class="auth-node-rect"
          />
          <text
            x="40"
            y="22"
            fill="rgb(var(--muted-foreground))"
            font-size="8"
            font-weight="500"
            text-anchor="middle"
            letter-spacing="1.2"
          >
            {{ t('login.diagram.contracts') }}
          </text>
        </g>

        <!-- Apps Layer Node -->
        <g
          class="auth-diagram-node auth-diagram-node--apps"
          transform="translate(305, 92)"
        >
          <rect
            width="80"
            height="36"
            rx="8"
            fill="rgb(var(--card) / 20%)"
            stroke="var(--auth-apps-stroke)"
            stroke-width="0.8"
            class="auth-node-rect"
          />
          <text
            x="40"
            y="22"
            fill="rgb(var(--muted-foreground))"
            font-size="8"
            font-weight="500"
            text-anchor="middle"
            letter-spacing="1.2"
          >
            {{ t('login.diagram.apps') }}
          </text>
        </g>

        <!-- Static Core Node -->
        <g
          data-testid="auth-static-core"
          class="auth-diagram-node auth-diagram-node--core"
          transform="translate(160, 70)"
        >
          <!-- Pulsing ambient glow -->
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="url(#core-radial)"
            opacity="0.02"
            class="auth-core-glow"
          />
          <!-- Outer Hexagon -->
          <polygon
            points="40,16 61,28 61,52 40,64 19,52 19,28"
            fill="rgb(var(--card) / 30%)"
            stroke="var(--auth-core-stroke)"
            stroke-width="1"
          />
          <!-- Clean Core Dot -->
          <circle
            cx="40"
            cy="40"
            r="3"
            fill="var(--auth-core-stroke)"
          />
          <!-- Label -->
          <text
            x="40"
            y="82"
            fill="rgb(var(--primary))"
            font-size="8"
            font-weight="600"
            text-anchor="middle"
            letter-spacing="1.2"
          >
            {{ t('login.diagram.core') }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Small static architecture badge -->
    <div class="auth-visual-stage__architecture z-content">
      <span>contracts</span>
      <span class="auth-arch-dot" />
      <span>core</span>
      <span class="auth-arch-dot" />
      <span>apps</span>
    </div>

    <!-- Floating evidence chips -->
    <div class="auth-visual-stage__signals z-content">
      <AuthSignalCard
        :label="t('login.signals.governanceGate')"
        icon=""
        :active="isUsernameActive"
      />
      <AuthSignalCard
        :label="t('login.signals.runtimeIsolated')"
        icon=""
        :active="isPasswordActive"
      />
      <AuthSignalCard
        :label="t('login.signals.safeStorage')"
        icon=""
        :active="characterState.showPassword"
      />
      <AuthSignalCard
        :label="t('login.signals.validationPassed')"
        icon=""
        :active="isAppsActive"
      />
    </div>
  </section>
</template>

<style scoped>
.auth-visual-stage {
  --auth-stage-surface: 50%;
  --auth-stage-muted: 15%;
  --auth-stage-grid: 1.5%;

  position: relative;
  min-height: 100%;
  gap: var(--spacing-xl);
  padding: var(--spacing-3xl);
  overflow: hidden;
  border: 1px solid rgb(var(--border) / 40%);
  border-radius: var(--radius-2xl);
  background:
    radial-gradient(ellipse at 15% 15%, rgb(var(--primary) / 6%), transparent 35%),
    radial-gradient(ellipse at 75% 75%, rgb(var(--accent) / 4%), transparent 35%),
    linear-gradient(
      140deg,
      rgb(var(--card) / var(--auth-stage-surface)),
      rgb(var(--muted) / var(--auth-stage-muted))
    ),
    rgb(var(--background));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 var(--spacing-xl) var(--spacing-4xl) rgb(var(--background) / 10%);
}

.auth-visual-stage::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(rgb(var(--foreground) / var(--auth-stage-grid)) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / var(--auth-stage-grid)) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: linear-gradient(180deg, rgb(var(--foreground) / 80%), transparent 85%);
}

.auth-visual-stage__header {
  position: relative;
  gap: var(--spacing-2xs);
  max-width: 85%;
}

.auth-visual-stage__eyebrow {
  color: rgb(var(--primary) / 90%);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.auth-visual-stage__title {
  margin: 0;
  color: rgb(var(--foreground));
  font-size: clamp(var(--font-size-3xl), 5vw, var(--font-size-4xl));
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}

.auth-visual-stage__subtitle {
  max-width: 500px;
  margin: 0;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  font-weight: 450;
  line-height: 1.5;
}

/* Blueprint Architecture Diagram styles */
.auth-visual-stage__diagram {
  width: 100%;
  max-width: 360px;
  margin: auto;
}

.auth-diagram-svg {
  width: 100%;
  height: auto;
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
  stroke-dasharray: 6 70;
  stroke-dashoffset: 76;
  animation: auth-flow-dash 6s linear infinite;
}

.auth-flow-path--1 {
  animation-duration: 5s;
}

.auth-flow-path--2 {
  animation-duration: 6s;
  animation-direction: reverse;
}

@keyframes auth-flow-dash {
  to {
    stroke-dashoffset: 0;
  }
}

/* Low frequency pulses for ambient indicators */
.auth-core-glow {
  animation: auth-core-pulse 8s ease-in-out infinite alternate;
}

@keyframes auth-core-pulse {
  0% {
    r: 28;
    opacity: 0.01;
  }

  100% {
    r: 34;
    opacity: 0.03;
  }
}

.auth-visual-stage__architecture {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: fit-content;
  margin: 0 auto;
  padding: var(--spacing-3xs) var(--spacing-md);
  border: 1px solid rgb(var(--primary) / 15%);
  border-radius: var(--radius-full);
  background:
    linear-gradient(90deg, rgb(var(--primary) / 6%), rgb(var(--accent) / 4%)),
    rgb(var(--card) / 30%);
  color: rgb(var(--primary) / 90%);
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.auth-arch-dot {
  width: 3px;
  height: 3px;
  border-radius: var(--radius-full);
  background: rgb(var(--primary) / 40%);
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
  --auth-stage-surface: 35%;
  --auth-stage-muted: 10%;
  --auth-stage-grid: 2.5%;
}

.auth-visual-stage--compact {
  padding: var(--spacing-2xl);
}

.auth-visual-stage--compact .auth-visual-stage__signals {
  max-width: 90%;
}

.auth-visual-stage--tablet {
  min-height: 300px;
}

.auth-visual-stage--tablet .auth-visual-stage__header,
.auth-visual-stage--tablet .auth-visual-stage__signals {
  max-width: 70%;
}

.auth-visual-stage--mobile {
  min-height: 160px;
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
  max-width: 260px;
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
