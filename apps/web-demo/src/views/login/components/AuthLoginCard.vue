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
  gap: var(--spacing-lg);
  width: 100%;
  padding: var(--spacing-xl);
  border: 1px solid rgb(var(--border) / 62%);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(180deg, rgb(var(--card) / 96%), rgb(var(--card) / 86%)),
    radial-gradient(circle at 12% 0, rgb(var(--primary) / 10%), transparent 34%);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    0 var(--spacing-xl) var(--spacing-5xl) rgb(var(--background) / 34%);
}

.auth-login-card__header {
  align-items: flex-start;
  gap: var(--spacing-md);
}

.auth-login-card__identity {
  min-width: 0;
  gap: var(--spacing-sm);
}

.auth-login-card__logo {
  width: var(--spacing-2xl);
  height: var(--spacing-2xl);
  flex: 0 0 auto;
  border: 1px solid rgb(var(--primary) / 28%);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle, rgb(var(--primary) / 20%), transparent 70%), rgb(var(--primary) / 10%);
  color: rgb(var(--primary));
  box-shadow: inset 0 1px 0 rgb(var(--foreground) / 5%);
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
  font-size: var(--font-size-2xl);
  font-weight: 760;
  letter-spacing: 0;
  line-height: 1.18;
}

.auth-login-card__subtitle {
  margin: 0;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  line-height: 1.55;
}

.auth-login-card--compact {
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

@media (width <= 768px) {
  .auth-login-card {
    padding: var(--spacing-md);
  }

  .auth-login-card__header {
    gap: var(--spacing-sm);
  }

  .auth-login-card__subtitle {
    max-width: 96%;
  }
}
</style>
