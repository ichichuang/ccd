<script setup lang="ts">
defineOptions({ name: 'AuthSignalCard' })

defineProps<{
  label: string
  icon: string
  active?: boolean
}>()
</script>

<template>
  <article
    class="auth-signal-card row-start"
    :class="{ 'auth-signal-card--active': active }"
  >
    <span
      class="auth-signal-dot"
      :class="{ 'auth-signal-dot--active': active }"
    />
    <span class="auth-signal-card__label">{{ label }}</span>
  </article>
</template>

<style scoped>
.auth-signal-card {
  gap: var(--spacing-sm);
  min-width: 0;
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid rgb(var(--border) / 40%);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgb(var(--card) / 60%), rgb(var(--background) / 20%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 2px 4px rgb(var(--background) / 4%);
  color: rgb(var(--muted-foreground));
  transition:
    border-color var(--transition-md) ease-out,
    color var(--transition-md) ease-out,
    background-color var(--transition-md) ease-out,
    box-shadow var(--transition-md) ease-out;
}

.auth-signal-card--active {
  border-color: rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 50%);
  color: rgb(var(--foreground));
  background: linear-gradient(
    135deg,
    rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 4%),
    rgb(var(--card) / 70%)
  );
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 4px 12px rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 3%);
}

.auth-signal-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: var(--radius-full);
  background: rgb(var(--border) / 90%);
  transition:
    background-color var(--transition-md) ease-out,
    box-shadow var(--transition-md) ease-out;
}

.auth-signal-dot--active {
  background: rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b));
  box-shadow: 0 0 8px rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b));
}

.auth-signal-card__label {
  min-width: 0;
  font-size: var(--font-size-xs);
  font-weight: 550;
  line-height: 1.25;
  letter-spacing: 0.02em;
}
</style>
