<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'AuthQuickAccounts' })

defineProps<{
  selected?: 'admin' | 'user' | null
}>()

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
    <div class="auth-quick-accounts__header row-start">
      <span>{{ t('login.quickAccounts') }}</span>
    </div>
    <div class="auth-quick-accounts__grid">
      <Button
        id="login-fill-admin"
        type="button"
        severity="secondary"
        variant="text"
        class="auth-quick-accounts__chip ring-focus-focus"
        :class="{ 'auth-quick-accounts__chip--active': selected === 'admin' }"
        :aria-pressed="selected === 'admin'"
        :label="t('login.quickAdmin')"
        @click="handleAdminClick"
      />
      <Button
        id="login-fill-user"
        type="button"
        severity="secondary"
        variant="text"
        class="auth-quick-accounts__chip ring-focus-focus"
        :class="{ 'auth-quick-accounts__chip--active': selected === 'user' }"
        :aria-pressed="selected === 'user'"
        :label="t('login.quickUser')"
        @click="handleUserClick"
      />
    </div>
  </section>
</template>

<style scoped>
.auth-quick-accounts {
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid rgb(var(--border) / 40%);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, rgb(var(--muted) / 10%), rgb(var(--background) / 50%));
}

.auth-quick-accounts__header {
  padding: 0 var(--spacing-xs);
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0;
}

.auth-quick-accounts__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm);
}

.auth-quick-accounts__chip {
  justify-content: center;
  min-width: 0;
  border: 1px solid rgb(var(--border) / 50%) !important;
  border-radius: var(--radius-full) !important;
  background: rgb(var(--card)) !important;
  color: rgb(var(--muted-foreground)) !important;
  font-size: var(--font-size-xs) !important;
  font-weight: 600 !important;
  letter-spacing: 0;
  transition:
    background-color var(--transition-sm) ease-out,
    border-color var(--transition-sm) ease-out,
    color var(--transition-sm) ease-out,
    transform var(--transition-sm) ease-out;
}

.auth-quick-accounts__chip:hover {
  border-color: rgb(var(--primary) / 40%) !important;
  background: rgb(var(--primary) / 6%) !important;
  color: rgb(var(--primary)) !important;
}

.auth-quick-accounts__chip--active {
  border-color: rgb(var(--primary) / 60%) !important;
  background: rgb(var(--primary) / 8%) !important;
  color: rgb(var(--primary)) !important;
}

.auth-quick-accounts__chip:active {
  transform: translateY(0.5px);
}
</style>
