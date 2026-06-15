<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'AuthLoginCard' })

defineProps<{
  compact?: boolean
}>()

defineSlots<{
  actions?: () => unknown
  default?: () => unknown
}>()

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <section
    class="auth-login-card col-stretch"
    :class="{ 'auth-login-card--compact': compact }"
    aria-labelledby="login-card-title"
  >
    <header class="auth-login-card__header row-between">
      <div class="auth-login-card__identity row-start">
        <span class="auth-login-card__logo center">
          <Icons
            name="i-lucide-scan-line"
            size="lg"
          />
        </span>
        <div class="auth-login-card__copy col-stretch">
          <span class="auth-login-card__eyebrow">{{ t('login.gatewayEyebrow') }}</span>
          <h2
            id="login-card-title"
            class="auth-login-card__title"
          >
            {{ t('login.cardTitle') }}
          </h2>
          <p class="auth-login-card__subtitle">
            {{ t('login.cardSubtitle') }}
          </p>
        </div>
      </div>
      <slot name="actions" />
    </header>

    <slot />
  </section>
</template>

<style scoped>
.auth-login-card {
  position: relative;
  isolation: isolate;
  gap: var(--spacing-lg);
  width: 100%;
  padding: var(--spacing-xl);
  overflow: hidden;
  border: 1px solid rgb(var(--border) / 70%);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(ellipse at 10% 0, rgb(var(--primary) / 13%), transparent 34%),
    radial-gradient(ellipse at 100% 100%, rgb(var(--accent) / 8%), transparent 30%),
    linear-gradient(180deg, rgb(var(--card) / 98%), rgb(var(--card) / 91%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 8%),
    inset 0 0 0 1px rgb(var(--primary) / 5%),
    0 var(--spacing-xl) var(--spacing-5xl) rgb(var(--background) / 38%),
    0 var(--spacing-sm) var(--spacing-2xl) rgb(var(--primary) / 10%);
}

.auth-login-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: var(--spacing-xs);
  content: '';
  background: linear-gradient(
    90deg,
    rgb(var(--primary) / 0%),
    rgb(var(--primary) / 64%),
    rgb(var(--accent) / 44%),
    rgb(var(--primary) / 0%)
  );
  opacity: 0.72;
}

.auth-login-card::after {
  position: absolute;
  inset: var(--spacing-sm);
  pointer-events: none;
  content: '';
  border: 1px solid rgb(var(--border) / 28%);
  border-radius: calc(var(--radius-xl) - var(--spacing-2xs));
  background-image:
    linear-gradient(rgb(var(--foreground) / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / 4%) 1px, transparent 1px);
  background-size:
    calc(var(--spacing-xl) + var(--spacing-sm)) calc(var(--spacing-xl) + var(--spacing-sm)),
    calc(var(--spacing-xl) + var(--spacing-sm)) calc(var(--spacing-xl) + var(--spacing-sm));
  mask-image: linear-gradient(180deg, rgb(var(--foreground)), transparent 72%);
}

.auth-login-card__header {
  position: relative;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.auth-login-card__identity {
  min-width: 0;
  gap: var(--spacing-sm);
}

.auth-login-card__logo {
  width: calc(var(--spacing-2xl) + var(--spacing-2xs));
  height: calc(var(--spacing-2xl) + var(--spacing-2xs));
  flex: 0 0 auto;
  border: 1px solid rgb(var(--primary) / 34%);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle, rgb(var(--primary) / 26%), transparent 68%),
    linear-gradient(135deg, rgb(var(--primary) / 13%), rgb(var(--accent) / 8%));
  color: rgb(var(--primary));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 7%),
    0 var(--spacing-xs) var(--spacing-lg) rgb(var(--primary) / 14%);
}

.auth-login-card__copy {
  gap: var(--spacing-2xs);
  min-width: 0;
}

.auth-login-card__eyebrow {
  color: rgb(var(--primary));
  font-size: var(--font-size-xs);
  font-weight: 750;
  letter-spacing: 0;
  line-height: 1;
  text-transform: uppercase;
}

.auth-login-card__title {
  margin: 0;
  color: rgb(var(--foreground));
  font-size: var(--font-size-3xl);
  font-weight: 760;
  letter-spacing: 0;
  line-height: 1.12;
}

.auth-login-card__subtitle {
  margin: 0;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  line-height: 1.55;
  word-break: keep-all;
}

.auth-login-card--compact {
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

:global(.dark) .auth-login-card {
  background:
    radial-gradient(ellipse at 10% 0, rgb(var(--primary) / 17%), transparent 36%),
    radial-gradient(ellipse at 100% 100%, rgb(var(--accent) / 12%), transparent 32%),
    linear-gradient(180deg, rgb(var(--card) / 92%), rgb(var(--background) / 78%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 7%),
    inset 0 0 0 1px rgb(var(--primary) / 8%),
    0 var(--spacing-xl) var(--spacing-5xl) rgb(var(--background) / 52%),
    0 var(--spacing-sm) var(--spacing-2xl) rgb(var(--primary) / 12%);
}

@media (width <= 768px) {
  .auth-login-card {
    padding: var(--spacing-md);
  }

  .auth-login-card__title {
    font-size: var(--font-size-2xl);
  }

  .auth-login-card__header {
    gap: var(--spacing-sm);
  }

  .auth-login-card__subtitle {
    max-width: 96%;
  }
}
</style>
