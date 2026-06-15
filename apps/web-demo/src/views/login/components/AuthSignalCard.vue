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
  border: 1px solid rgb(var(--border) / 58%);
  border-radius: var(--radius-md);
  background:
    linear-gradient(135deg, rgb(var(--card) / 72%), rgb(var(--background) / 42%)),
    linear-gradient(90deg, rgb(var(--primary) / 9%), transparent 52%);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    0 var(--spacing-xs) var(--spacing-lg) rgb(var(--background) / 18%);
  color: rgb(var(--muted-foreground));
  transition:
    border-color var(--transition-md) ease-out,
    color var(--transition-md) ease-out,
    transform var(--transition-md) ease-out;
}

.auth-signal-card--active {
  border-color: rgb(var(--primary) / 52%);
  color: rgb(var(--foreground));
  background:
    linear-gradient(135deg, rgb(var(--primary) / 13%), rgb(var(--card) / 70%)),
    linear-gradient(90deg, rgb(var(--accent) / 8%), transparent 52%);
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
