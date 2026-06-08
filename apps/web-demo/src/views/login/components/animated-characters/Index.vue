<script setup lang="ts">
import { isVisualE2EMode } from '@/utils/runtime/e2e'
import type { LoginFieldName } from '../../types'

defineOptions({ name: 'AnimatedCharacters' })

const props = withDefaults(
  defineProps<{
    activeField?: LoginFieldName | null
    usernameLength?: number
    passwordLength?: number
    showPassword?: boolean
  }>(),
  {
    activeField: null,
    usernameLength: 0,
    passwordLength: 0,
    showPassword: false,
  }
)

const visualStable = computed(() => isVisualE2EMode())
const usernameProgress = computed(() => Math.min(Math.max(props.usernameLength, 0), 20) / 20)
const passwordProgress = computed(() => Math.min(Math.max(props.passwordLength, 0), 18) / 18)
const isUsernameActive = computed(() => props.activeField === 'username')
const isPasswordActive = computed(() => props.activeField === 'password')

const dioramaStyle = computed<Record<string, string>>(() => ({
  '--login-username-progress': usernameProgress.value.toFixed(3),
  '--login-password-progress': passwordProgress.value.toFixed(3),
}))

const dioramaAttributes = computed<Record<string, string>>(() => ({
  'data-active-field': props.activeField ?? 'idle',
  'data-password-visible': String(props.showPassword),
  'data-visual-stable': String(visualStable.value),
}))
</script>

<template>
  <div
    class="login-diorama relative h-full w-full overflow-hidden rounded-lg border border-solid border-border/40 bg-card/72"
    :class="{
      'login-diorama--username': isUsernameActive,
      'login-diorama--password': isPasswordActive,
      'login-diorama--revealed': showPassword,
      'login-diorama--stable': visualStable,
    }"
    :style="dioramaStyle"
    v-bind="dioramaAttributes"
    aria-hidden="true"
  >
    <div class="login-diorama__grid absolute inset-0 z-base pointer-events-none" />
    <div
      class="login-diorama__beam login-diorama__beam--primary absolute z-base pointer-events-none"
    />
    <div
      class="login-diorama__beam login-diorama__beam--accent absolute z-base pointer-events-none"
    />

    <div class="login-diorama__platform absolute inset-x-[11%] bottom-[11%] z-content">
      <div class="h-[var(--spacing-xs)] rounded-full bg-foreground/10" />
      <div class="mx-auto mt-2xs h-[var(--spacing-xs)] w-[68%] rounded-full bg-primary/18" />
    </div>

    <div
      class="login-diorama__meter login-diorama__meter--username absolute left-[13%] top-[14%] z-content"
    >
      <span class="block h-full rounded-full bg-primary" />
    </div>
    <div
      class="login-diorama__meter login-diorama__meter--password absolute right-[13%] top-[14%] z-content"
    >
      <span class="block h-full rounded-full bg-accent" />
    </div>

    <div class="login-diorama__character login-diorama__character--left absolute z-content">
      <div
        class="login-diorama__head relative mx-auto rounded-full border border-solid border-primary/40 bg-primary/18"
      >
        <span
          class="login-diorama__antenna absolute left-1/2 top-[-22%] block rounded-full bg-primary/55"
        />
        <span
          class="login-diorama__eye login-diorama__eye--left absolute rounded-full bg-foreground"
        />
        <span
          class="login-diorama__eye login-diorama__eye--right absolute rounded-full bg-foreground"
        />
      </div>
      <div
        class="login-diorama__body mx-auto rounded-t-full border border-solid border-primary/35 bg-card/82"
      />
    </div>

    <div class="login-diorama__character login-diorama__character--right absolute z-content">
      <div
        class="login-diorama__head relative mx-auto rounded-full border border-solid border-accent/40 bg-accent/18"
      >
        <span
          class="login-diorama__antenna absolute left-1/2 top-[-22%] block rounded-full bg-accent/55"
        />
        <span
          class="login-diorama__eye login-diorama__eye--left absolute rounded-full bg-foreground"
        />
        <span
          class="login-diorama__eye login-diorama__eye--right absolute rounded-full bg-foreground"
        />
      </div>
      <div
        class="login-diorama__body mx-auto rounded-t-full border border-solid border-accent/35 bg-card/82"
      />
    </div>
  </div>
</template>

<style scoped>
.login-diorama {
  min-height: 264px;
  box-shadow:
    inset 0 0 0 1px rgb(var(--foreground) / 4%),
    0 var(--spacing-md) var(--spacing-2xl) rgb(var(--background) / 24%);
}

.login-diorama__grid {
  background-image:
    linear-gradient(rgb(var(--foreground) / 5%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / 5%) 1px, transparent 1px),
    linear-gradient(
      135deg,
      rgb(var(--primary) / 12%) 0%,
      transparent 44%,
      rgb(var(--accent) / 10%) 100%
    );
  background-size:
    32px 32px,
    32px 32px,
    100% 100%;
  mask-image: linear-gradient(180deg, rgb(var(--foreground) / 72%), transparent 86%);
}

.login-diorama__meter {
  height: var(--spacing-xs);
  width: 22%;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: rgb(var(--foreground) / 9%);
}

.login-diorama__beam {
  height: 44%;
  width: 18%;
  opacity: 0.72;
  transform: skewX(-18deg);
}

.login-diorama__beam--primary {
  left: 18%;
  top: 12%;
  background: linear-gradient(180deg, rgb(var(--primary) / 20%), transparent);
}

.login-diorama__beam--accent {
  right: 18%;
  bottom: 10%;
  background: linear-gradient(180deg, rgb(var(--accent) / 18%), transparent);
}

.login-diorama__meter span {
  transform-origin: left center;
  transition: transform var(--transition-md) ease-out;
}

.login-diorama__meter--username span {
  transform: scaleX(calc(0.18 + (var(--login-username-progress) * 0.82)));
}

.login-diorama__meter--password span {
  transform: scaleX(calc(0.18 + (var(--login-password-progress) * 0.82)));
}

.login-diorama__character {
  bottom: 18%;
  width: 30%;
  transition:
    transform var(--transition-md) ease-out,
    filter var(--transition-md) ease-out;
}

.login-diorama__character--left {
  left: 18%;
  transform: translateX(calc(var(--login-username-progress) * 12%));
}

.login-diorama__character--right {
  right: 16%;
  transform: translateX(calc(var(--login-password-progress) * -12%));
}

.login-diorama--username .login-diorama__character--left,
.login-diorama--password .login-diorama__character--right {
  filter: drop-shadow(0 var(--spacing-xs) var(--spacing-sm) rgb(var(--primary) / 26%));
}

.login-diorama--password .login-diorama__character--right {
  filter: drop-shadow(0 var(--spacing-xs) var(--spacing-sm) rgb(var(--accent) / 26%));
}

.login-diorama__head {
  height: clamp(64px, 8vw, 92px);
  width: clamp(64px, 8vw, 92px);
  transition:
    transform var(--transition-md) ease-out,
    border-color var(--transition-md) ease-out,
    background-color var(--transition-md) ease-out;
}

.login-diorama__body {
  height: clamp(52px, 6vw, 76px);
  width: clamp(76px, 10vw, 110px);
  margin-top: calc(var(--spacing-xs) * -1);
}

.login-diorama__antenna {
  height: 24%;
  width: var(--spacing-xs);
  transform: translateX(-50%);
}

.login-diorama__eye {
  top: 42%;
  height: 14%;
  width: 14%;
  transition:
    transform var(--transition-md) ease-out,
    height var(--transition-md) ease-out,
    opacity var(--transition-md) ease-out;
}

.login-diorama__eye--left {
  left: 30%;
}

.login-diorama__eye--right {
  right: 30%;
}

.login-diorama--username .login-diorama__character--left .login-diorama__head,
.login-diorama--password .login-diorama__character--right .login-diorama__head {
  transform: translateY(calc(var(--spacing-xs) * -1));
}

.login-diorama--username .login-diorama__character--left .login-diorama__eye {
  transform: translateX(18%);
}

.login-diorama--password .login-diorama__character--right .login-diorama__eye {
  transform: translateX(-18%);
}

.login-diorama--password:not(.login-diorama--revealed)
  .login-diorama__character--right
  .login-diorama__eye {
  height: 6%;
}

.login-diorama--revealed .login-diorama__character--right .login-diorama__head {
  background: rgb(var(--accent) / 24%);
}

.login-diorama--stable *,
.login-diorama--stable *::before,
.login-diorama--stable *::after {
  transition-duration: 0ms !important;
}

@media (width <= 768px) {
  .login-diorama {
    min-height: 188px;
  }

  .login-diorama__character {
    bottom: 15%;
    width: 34%;
  }

  .login-diorama__character--left {
    left: 14%;
  }

  .login-diorama__character--right {
    right: 12%;
  }
}
</style>
