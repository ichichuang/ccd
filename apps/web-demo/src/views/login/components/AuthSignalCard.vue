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
    <span class="auth-signal-card__icon center">
      <Icons
        :name="icon"
        size="xs"
      />
    </span>
    <span class="auth-signal-card__label">{{ label }}</span>
  </article>
</template>

<style scoped>
.auth-signal-card {
  gap: var(--spacing-xs);
  min-width: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid rgb(var(--border) / 62%);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(135deg, rgb(var(--card) / 76%), rgb(var(--background) / 36%)),
    linear-gradient(90deg, rgb(var(--primary) / 8%), transparent);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 5%),
    0 var(--spacing-sm) var(--spacing-xl) rgb(var(--background) / 22%);
  color: rgb(var(--muted-foreground));
  transition:
    border-color var(--transition-md) ease-out,
    color var(--transition-md) ease-out,
    transform var(--transition-md) ease-out;
}

.auth-signal-card--active {
  border-color: rgb(var(--primary) / 44%);
  color: rgb(var(--foreground));
  transform: translateY(calc(var(--spacing-2xs) * -1));
}

.auth-signal-card__icon {
  width: var(--spacing-md);
  height: var(--spacing-md);
  flex: 0 0 auto;
  border-radius: var(--radius-full);
  background: rgb(var(--primary) / 12%);
  color: rgb(var(--primary));
}

.auth-signal-card__label {
  min-width: 0;
  font-size: var(--font-size-xs);
  font-weight: 650;
  line-height: 1.25;
}
</style>
