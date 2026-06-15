<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'AuthQuickAccounts' })

const emit = defineEmits<{
  'fill-admin': []
  'fill-user': []
}>()

const { t } = useI18n({ useScope: 'global' })

function handleAdminClick(): void {
  emit('fill-admin')
}

function handleUserClick(): void {
  emit('fill-user')
}
</script>

<template>
  <section class="auth-quick-accounts col-stretch">
    <div class="auth-quick-accounts__header row-between">
      <span>{{ t('login.quickAccounts') }}</span>
      <Icons
        name="i-lucide-key-round"
        size="xs"
      />
    </div>
    <div class="auth-quick-accounts__grid">
      <Button
        id="login-fill-admin"
        type="button"
        severity="secondary"
        variant="text"
        class="auth-quick-accounts__chip ring-focus-focus"
        :label="t('login.quickAdmin')"
        @click="handleAdminClick"
      />
      <Button
        id="login-fill-user"
        type="button"
        severity="secondary"
        variant="text"
        class="auth-quick-accounts__chip ring-focus-focus"
        :label="t('login.quickUser')"
        @click="handleUserClick"
      />
    </div>
  </section>
</template>

<style scoped>
.auth-quick-accounts {
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  border: 1px solid rgb(var(--border) / 48%);
  border-radius: var(--radius-lg);
  background: rgb(var(--muted) / 28%);
}

.auth-quick-accounts__header {
  padding: 0 var(--spacing-xs);
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1;
}

.auth-quick-accounts__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-xs);
}

.auth-quick-accounts__chip {
  justify-content: center;
  min-width: 0;
  border: 1px solid rgb(var(--border) / 38%) !important;
  border-radius: var(--radius-md) !important;
  background: rgb(var(--background) / 42%) !important;
  color: rgb(var(--muted-foreground)) !important;
  box-shadow: none !important;
  font-size: var(--font-size-sm) !important;
  font-weight: 700 !important;
  transition:
    background-color var(--transition-sm) ease-out,
    border-color var(--transition-sm) ease-out,
    color var(--transition-sm) ease-out,
    transform var(--transition-sm) ease-out;
}

.auth-quick-accounts__chip:hover {
  border-color: rgb(var(--primary) / 34%) !important;
  background: rgb(var(--primary) / 10%) !important;
  color: rgb(var(--primary)) !important;
}

.auth-quick-accounts__chip:active {
  transform: translateY(1px);
}
</style>
