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
    : 'rgb(var(--border) / 38%)',
  '--auth-core-stroke': isPasswordActive.value ? 'rgb(var(--accent))' : 'rgb(var(--border) / 38%)',
  '--auth-apps-stroke': isAppsActive.value ? 'rgb(var(--success))' : 'rgb(var(--border) / 38%)',
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

    <!-- Static architecture blueprint diagram -->
    <div
      class="auth-visual-stage__diagram center z-content"
      aria-hidden="true"
    >
      <svg
        class="auth-diagram-svg"
        viewBox="0 0 400 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Fine blueprint grid -->
        <defs>
          <pattern
            id="blueprint-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              stroke-opacity="0.04"
              stroke-width="1"
            />
          </pattern>
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

        <!-- Diagram Background Grid -->
        <rect
          width="100%"
          height="100%"
          fill="url(#blueprint-grid)"
          rx="12"
        />

        <!-- Connection Paths -->
        <!-- Contracts to Core -->
        <path
          d="M 90 140 L 160 140"
          stroke="rgb(var(--border) / 12%)"
          stroke-width="1.5"
        />
        <path
          d="M 90 140 L 160 140"
          stroke="url(#flow-gradient)"
          stroke-width="2"
          class="auth-flow-path auth-flow-path--1"
        />

        <!-- Core to Apps -->
        <path
          d="M 240 140 L 310 140"
          stroke="rgb(var(--border) / 12%)"
          stroke-width="1.5"
        />
        <path
          d="M 240 140 L 310 140"
          stroke="url(#flow-gradient)"
          stroke-width="2"
          class="auth-flow-path auth-flow-path--2"
        />

        <!-- Vertical Align reference dashes -->
        <path
          d="M 200 70 L 200 210"
          stroke="rgb(var(--border) / 10%)"
          stroke-width="1"
          stroke-dasharray="3 3"
        />

        <!-- Contracts Layer Node -->
        <g
          class="auth-diagram-node auth-diagram-node--contracts"
          transform="translate(20, 115)"
        >
          <rect
            width="70"
            height="50"
            rx="6"
            fill="rgb(var(--card) / 78%)"
            stroke="var(--auth-contracts-stroke)"
            stroke-width="1.5"
            class="auth-node-rect"
          />
          <text
            x="35"
            y="29"
            fill="rgb(var(--foreground))"
            font-size="9"
            font-weight="700"
            text-anchor="middle"
            letter-spacing="0.5"
          >
            {{ t('login.diagram.contracts') }}
          </text>
          <circle
            cx="70"
            cy="25"
            r="3"
            fill="rgb(var(--primary))"
          />
        </g>

        <!-- Apps Layer Node -->
        <g
          class="auth-diagram-node auth-diagram-node--apps"
          transform="translate(310, 115)"
        >
          <rect
            width="70"
            height="50"
            rx="6"
            fill="rgb(var(--card) / 78%)"
            stroke="var(--auth-apps-stroke)"
            stroke-width="1.5"
            class="auth-node-rect"
          />
          <text
            x="35"
            y="29"
            fill="rgb(var(--foreground))"
            font-size="9"
            font-weight="700"
            text-anchor="middle"
            letter-spacing="0.5"
          >
            {{ t('login.diagram.apps') }}
          </text>
          <circle
            cx="0"
            cy="25"
            r="3"
            fill="rgb(var(--success))"
          />
        </g>

        <!-- Static Core Node (CCD Core Mark) -->
        <g
          data-testid="auth-static-core"
          class="auth-diagram-node auth-diagram-node--core"
          transform="translate(160, 100)"
        >
          <!-- Pulsing ambient glow -->
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="url(#core-radial)"
            opacity="0.05"
            class="auth-core-glow"
          />
          <!-- Hexagonal Casing -->
          <polygon
            points="40,10 66,25 66,55 40,70 14,55 14,25"
            fill="rgb(var(--card) / 92%)"
            stroke="var(--auth-core-stroke)"
            stroke-width="2"
          />
          <!-- Inner dashed hexagon -->
          <polygon
            points="40,17 59,28 59,52 40,63 21,52 21,28"
            fill="none"
            stroke="rgb(var(--primary) / 30%)"
            stroke-width="1"
            stroke-dasharray="2 2"
          />
          <!-- Central Crosshair / Dot -->
          <circle
            cx="40"
            cy="40"
            r="10"
            fill="rgb(var(--primary) / 10%)"
            stroke="rgb(var(--primary))"
            stroke-width="1.5"
          />
          <path
            d="M 37 40 L 43 40 M 40 37 L 40 43"
            stroke="rgb(var(--primary))"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <!-- Label -->
          <text
            x="40"
            y="88"
            fill="rgb(var(--primary))"
            font-size="8.5"
            font-weight="800"
            text-anchor="middle"
            letter-spacing="0.8"
          >
            {{ t('login.diagram.core') }}
          </text>
        </g>

        <!-- Floating indicators -->
        <g
          transform="translate(155, 40)"
          class="auth-diagram-indicator"
        >
          <rect
            width="90"
            height="20"
            rx="10"
            fill="rgb(var(--card) / 85%)"
            stroke="rgb(var(--primary) / 24%)"
            stroke-width="1"
          />
          <circle
            cx="12"
            cy="10"
            r="3.5"
            fill="rgb(var(--primary))"
          />
          <text
            x="24"
            y="13.5"
            fill="rgb(var(--muted-foreground))"
            font-size="8"
            font-weight="700"
          >
            {{ t('login.diagram.governed') }}
          </text>
        </g>

        <g
          transform="translate(155, 220)"
          class="auth-diagram-indicator"
        >
          <rect
            width="90"
            height="20"
            rx="10"
            fill="rgb(var(--card) / 85%)"
            stroke="rgb(var(--success) / 24%)"
            stroke-width="1"
          />
          <circle
            cx="12"
            cy="10"
            r="3.5"
            fill="rgb(var(--success))"
            class="auth-indicator-dot"
          />
          <text
            x="24"
            y="13.5"
            fill="rgb(var(--muted-foreground))"
            font-size="8"
            font-weight="700"
          >
            {{ t('login.diagram.isolated') }}
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

    <!-- Floating signal chips -->
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
        icon="i-lucide-lock-keyhole"
        :active="characterState.showPassword"
      />
      <AuthSignalCard
        :label="t('login.signals.validationPassed')"
        icon="i-lucide-badge-check"
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
  padding: var(--spacing-xl);
  overflow: hidden;
  border: 1px solid rgb(var(--border) / 58%);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(ellipse at 18% 16%, rgb(var(--primary) / 14%), transparent 34%),
    radial-gradient(ellipse at 74% 72%, rgb(var(--accent) / 10%), transparent 36%),
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
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.auth-visual-stage__title {
  margin: 0;
  color: rgb(var(--foreground));
  font-size: clamp(var(--font-size-4xl), 7vw, var(--font-size-5xl));
  font-weight: 760;
  letter-spacing: -0.02em;
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

/* Blueprint Architecture Diagram styles */
.auth-visual-stage__diagram {
  width: 100%;
  max-width: 420px;
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

/* Subtle dash movement for signal paths */
.auth-flow-path {
  stroke-dasharray: 6 6;
  animation: auth-flow-dash 12s linear infinite;
}

.auth-flow-path--1 {
  animation-duration: 8s;
}

.auth-flow-path--2 {
  animation-duration: 10s;
  animation-direction: reverse;
}

@keyframes auth-flow-dash {
  to {
    stroke-dashoffset: -24;
  }
}

/* Low frequency pulses for ambient indicators */
.auth-core-glow {
  animation: auth-core-pulse 8s ease-in-out infinite alternate;
}

.auth-indicator-dot {
  animation: auth-dot-pulse 4s ease-in-out infinite alternate;
}

@keyframes auth-core-pulse {
  0% {
    r: 32;
    opacity: 0.03;
  }

  100% {
    r: 38;
    opacity: 0.08;
  }
}

@keyframes auth-dot-pulse {
  0% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
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
  border: 1px solid rgb(var(--primary) / 24%);
  border-radius: var(--radius-full);
  background:
    linear-gradient(90deg, rgb(var(--primary) / 12%), rgb(var(--accent) / 8%)),
    rgb(var(--card) / 38%);
  box-shadow: 0 var(--spacing-xs) var(--spacing-xl) rgb(var(--primary) / 10%);
}

.auth-visual-stage__signals {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm);
  max-width: 72%;
  margin-top: auto;
}

:global(.dark) .auth-visual-stage {
  --auth-stage-surface: 42%;
  --auth-stage-muted: 18%;
  --auth-stage-grid: 7%;
}

.auth-visual-stage--compact {
  padding: var(--spacing-lg);
}

.auth-visual-stage--compact .auth-visual-stage__signals {
  max-width: 80%;
}

.auth-visual-stage--tablet {
  min-height: 380px;
}

.auth-visual-stage--tablet .auth-visual-stage__header,
.auth-visual-stage--tablet .auth-visual-stage__signals {
  max-width: 66%;
}

.auth-visual-stage--mobile {
  min-height: 240px;
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
  max-width: 320px;
  margin-top: var(--spacing-sm);
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .auth-flow-path,
  .auth-core-glow,
  .auth-indicator-dot {
    animation: none !important;
  }
}
</style>
