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
  gap: calc(var(--spacing-xl) + var(--spacing-xs));
  width: 100%;
  max-width: 540px;
  padding: calc(var(--spacing-2xl) + var(--spacing-sm)) calc(var(--spacing-2xl) + var(--spacing-xs))
    var(--spacing-xl);
  overflow: hidden;
  border: 1px solid rgb(var(--foreground) / 12%);
  border-radius: var(--radius-2xl);
  background:
    radial-gradient(circle at 16% 8%, rgb(var(--background) / 80%), transparent 18%),
    radial-gradient(
      circle at 82% 86%,
      rgb(var(--auth-accent-r) var(--auth-accent-g) var(--auth-accent-b) / 10%),
      transparent 30%
    ),
    linear-gradient(180deg, rgb(var(--card) / 96%), rgb(var(--background) / 82%)), rgb(var(--card));
  backdrop-filter: blur(26px) saturate(1.16);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 8%),
    inset 0 -1px 0 rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 8%),
    0 1px 2px rgb(var(--foreground) / 6%),
    0 var(--spacing-xl) var(--spacing-5xl) rgb(var(--foreground) / 12%),
    0 0 var(--spacing-5xl)
      rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 9%);
  transition:
    background-color var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    border-color var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    box-shadow var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-login-card::before {
  position: absolute;
  top: 0;
  left: calc(var(--spacing-2xl) - var(--spacing-xs));
  right: calc(var(--spacing-2xl) - var(--spacing-xs));
  height: 2px;
  content: '';
  background: linear-gradient(
    90deg,
    transparent,
    rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 52%),
    rgb(var(--auth-accent-r) var(--auth-accent-g) var(--auth-accent-b) / 32%),
    transparent
  );
  opacity: 0.86;
  transition:
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-login-card::after {
  position: absolute;
  inset: 1px;
  content: '';
  border-radius: calc(var(--radius-2xl) - 1px);
  pointer-events: none;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    inset 0 0 var(--spacing-5xl)
      rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 3%);
  transition:
    box-shadow var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-login-card__header {
  position: relative;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.auth-login-card__identity {
  gap: var(--spacing-xs);
  min-width: 0;
  flex: 1 1 auto;
}

.auth-login-card__eyebrow {
  color: rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 90%);
  font-size: var(--font-size-xs);
  font-weight: 750;
  letter-spacing: 0;
  line-height: 1;
  transition: color var(--auth-theme-transition-duration, var(--transition-sm))
    var(--auth-theme-transition-ease, ease-out);
}

.auth-login-card__title {
  margin: 0;
  color: rgb(var(--foreground));
  font-size: var(--font-size-3xl);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.15;
  transition: color var(--auth-theme-transition-duration, var(--transition-sm))
    var(--auth-theme-transition-ease, ease-out);
}

.auth-login-card__subtitle {
  margin: 0;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  font-weight: 450;
  line-height: 1.45;
  word-break: keep-all;
  transition: color var(--auth-theme-transition-duration, var(--transition-sm))
    var(--auth-theme-transition-ease, ease-out);
}

.auth-login-card__actions {
  flex: 0 0 auto;
}

.auth-login-card__body {
  gap: var(--spacing-lg);
}

.auth-login-card--compact {
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
}

:global(.dark) .auth-login-card {
  border-color: rgb(var(--foreground) / 18%);
  background:
    linear-gradient(180deg, rgb(var(--foreground) / 8%), rgb(var(--foreground) / 3%)),
    radial-gradient(circle at 16% 8%, rgb(var(--foreground) / 10%), transparent 18%),
    radial-gradient(
      circle at 56% 0%,
      rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 9%),
      transparent 26%
    ),
    radial-gradient(
      circle at 82% 86%,
      rgb(var(--auth-accent-r) var(--auth-accent-g) var(--auth-accent-b) / 14%),
      transparent 30%
    ),
    linear-gradient(180deg, rgb(var(--card) / 98%), rgb(var(--background) / 62%)), rgb(var(--card));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 9%),
    inset 0 -1px 0 rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 10%),
    0 0 0 1px rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 10%),
    0 var(--spacing-xl) var(--spacing-4xl) rgb(var(--background) / 58%),
    0 0 var(--spacing-5xl)
      rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 10%);
}

:global(.dark) .auth-login-card__eyebrow {
  color: rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 96%);
}

:global(.dark) .auth-login-card__title {
  color: rgb(var(--card-foreground));
}

:global(.dark) .auth-login-card__subtitle {
  color: rgb(var(--card-foreground) / 84%);
}

:global(.dark) .auth-login-card::after {
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 8%),
    inset 0 0 0 1px rgb(var(--foreground) / 2%);
}

@media (width <= 768px) {
  .auth-login-card {
    padding: calc(var(--spacing-xl) + var(--spacing-xs)) calc(var(--spacing-lg) + var(--spacing-xs))
      var(--spacing-xl);
    gap: var(--spacing-md);
  }

  .auth-login-card__header {
    display: block;
  }

  .auth-login-card__identity {
    display: block;
  }

  .auth-login-card__eyebrow {
    display: block;
    margin-bottom: var(--spacing-md);
  }

  .auth-login-card__title {
    white-space: nowrap;
  }

  .auth-login-card__subtitle {
    max-width: 98%;
    margin-top: var(--spacing-xs);
  }

  .auth-login-card__actions {
    position: absolute;
    top: 0;
    right: 0;
    align-self: flex-start;
  }
}

@media (width <= 390px) {
  .auth-login-card {
    padding: var(--spacing-lg);
  }
}
</style>
