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
  border: 1px solid rgb(var(--border) / 45%);
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgb(var(--card) / 50%), rgb(var(--background) / 20%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 var(--spacing-2xs) var(--spacing-md) rgb(var(--background) / 6%);
  color: rgb(var(--muted-foreground));
  transition:
    border-color var(--transition-md) ease-out,
    color var(--transition-md) ease-out,
    box-shadow var(--transition-md) ease-out;
}

.auth-signal-card--active {
  border-color: rgb(var(--primary) / 60%);
  color: rgb(var(--foreground));
  background: linear-gradient(135deg, rgb(var(--primary) / 8%), rgb(var(--card) / 60%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 0 12px rgb(var(--primary) / 10%),
    0 var(--spacing-2xs) var(--spacing-md) rgb(var(--primary) / 4%);
}

.auth-signal-card__icon {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  border-radius: var(--radius-full);
  background: rgb(var(--primary) / 8%);
  color: rgb(var(--primary));
  transition: background-color var(--transition-md) ease-out;
}

.auth-signal-card--active .auth-signal-card__icon {
  background: rgb(var(--primary) / 15%);
}

.auth-signal-card__label {
  min-width: 0;
  font-size: var(--font-size-xs);
  font-weight: 650;
  line-height: 1.25;
}
</style>
