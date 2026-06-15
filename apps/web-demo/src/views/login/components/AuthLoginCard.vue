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
  gap: var(--spacing-3xl);
  width: 100%;
  padding: var(--spacing-4xl);
  overflow: hidden;
  border: 1px solid rgb(var(--border) / 70%);
  border-radius: var(--radius-2xl);
  background: rgb(var(--card));
  box-shadow:
    0 1px 3px rgb(var(--background) / 10%),
    0 16px 40px -8px rgb(var(--background) / 12%),
    0 32px 64px -16px rgb(var(--background) / 16%);
}

.auth-login-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: 1.5px;
  content: '';
  background: linear-gradient(
    90deg,
    transparent,
    rgb(var(--primary) / 40%),
    rgb(var(--accent) / 25%),
    transparent
  );
  opacity: 0.9;
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
  color: rgb(var(--primary) / 90%);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: uppercase;
}

.auth-login-card__title {
  margin: 0;
  color: rgb(var(--foreground));
  font-size: var(--font-size-2xl);
  font-weight: 800;
  letter-spacing: -0.015em;
  line-height: 1.15;
}

.auth-login-card__subtitle {
  margin: 0;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  font-weight: 450;
  line-height: 1.45;
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
  padding: var(--spacing-xl);
}

:global(.dark) .auth-login-card {
  border-color: rgb(var(--border) / 45%);
  background: linear-gradient(180deg, rgb(var(--card)), rgb(var(--background) / 98%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 0 0 1px rgb(var(--primary) / 6%),
    0 24px 64px rgb(var(--background) / 35%),
    0 0 30px rgb(var(--primary) / 3%);
}

@media (width <= 768px) {
  .auth-login-card {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .auth-login-card__title {
    font-size: var(--font-size-xl);
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
