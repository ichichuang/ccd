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
      <div class="auth-login-card__identity col-stretch">
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
      <div class="auth-login-card__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="auth-login-card__body col-stretch">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.auth-login-card {
  position: relative;
  isolation: isolate;
  gap: var(--spacing-2xl);
  width: 100%;
  padding: var(--spacing-3xl);
  overflow: hidden;
  border: 1px solid rgb(var(--border) / 45%);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(ellipse at 12% 0, rgb(var(--primary) / 6%), transparent 45%),
    radial-gradient(ellipse at 88% 100%, rgb(var(--accent) / 4%), transparent 40%),
    linear-gradient(180deg, rgb(var(--card)), rgb(var(--card) / 95%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 var(--spacing-2xl) var(--spacing-5xl) rgb(var(--background) / 20%),
    0 var(--spacing-xs) var(--spacing-2xl) rgb(var(--primary) / 3%);
}

.auth-login-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: 2px;
  content: '';
  background: linear-gradient(
    90deg,
    transparent,
    rgb(var(--primary) / 45%),
    rgb(var(--accent) / 30%),
    transparent
  );
  opacity: 0.85;
}

.auth-login-card::after {
  position: absolute;
  inset: var(--spacing-xs);
  pointer-events: none;
  content: '';
  border: 1px solid rgb(var(--border) / 12%);
  border-radius: calc(var(--radius-xl) - var(--spacing-xs));
  background-image:
    linear-gradient(rgb(var(--foreground) / 2%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / 2%) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(180deg, rgb(var(--foreground)), transparent 65%);
}

.auth-login-card__header {
  position: relative;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.auth-login-card__identity {
  gap: var(--spacing-2xs);
  min-width: 0;
  flex: 1 1 auto;
}

.auth-login-card__eyebrow {
  color: rgb(var(--primary));
  font-size: var(--font-size-xs);
  font-weight: 750;
  letter-spacing: 0.05em;
  line-height: 1;
  text-transform: uppercase;
}

.auth-login-card__title {
  margin: 0;
  color: rgb(var(--foreground));
  font-size: var(--font-size-3xl);
  font-weight: 760;
  letter-spacing: -0.015em;
  line-height: 1.15;
}

.auth-login-card__subtitle {
  margin: 0;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: 1.5;
  word-break: keep-all;
}

.auth-login-card__actions {
  flex: 0 0 auto;
}

.auth-login-card__body {
  gap: var(--spacing-xl);
}

.auth-login-card--compact {
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

:global(.dark) .auth-login-card {
  border-color: rgb(var(--border) / 30%);
  background:
    radial-gradient(ellipse at 12% 0, rgb(var(--primary) / 12%), transparent 45%),
    radial-gradient(ellipse at 88% 100%, rgb(var(--accent) / 8%), transparent 40%),
    linear-gradient(180deg, rgb(var(--card) / 98%), rgb(var(--background) / 90%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    inset 0 0 0 1px rgb(var(--primary) / 5%),
    0 var(--spacing-2xl) var(--spacing-5xl) rgb(var(--background) / 50%),
    0 0 25px rgb(var(--primary) / 4%);
}

@media (width <= 768px) {
  .auth-login-card {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .auth-login-card__title {
    font-size: var(--font-size-2xl);
  }

  .auth-login-card__subtitle {
    max-width: 98%;
  }

  .auth-login-card__header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .auth-login-card__actions {
    align-self: flex-start;
  }
}
</style>
