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
    <div class="auth-quick-accounts__header row-center">
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
  gap: calc(var(--spacing-sm) + var(--spacing-xs));
  padding: var(--spacing-md);
  border: 1px solid rgb(var(--foreground) / 10%);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(180deg, rgb(var(--muted) / 24%), rgb(var(--background) / 70%)),
    rgb(var(--card) / 72%);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 1px 2px rgb(var(--foreground) / 4%);
}

.auth-quick-accounts__header {
  gap: var(--spacing-sm);
  width: 100%;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0;
}

.auth-quick-accounts__header::before,
.auth-quick-accounts__header::after {
  display: block;
  flex: 1 1 auto;
  height: 1px;
  content: '';
  background: linear-gradient(90deg, transparent, rgb(var(--border) / 72%));
}

.auth-quick-accounts__header::after {
  background: linear-gradient(90deg, rgb(var(--border) / 72%), transparent);
}

.auth-quick-accounts__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm);
}

.auth-quick-accounts__chip {
  justify-content: center;
  min-width: 0;
  height: var(--control-height-sm);
  border: 1px solid rgb(var(--border) / 70%) !important;
  border-radius: var(--radius-5xl) !important;
  background: rgb(var(--card) / 88%) !important;
  color: rgb(var(--muted-foreground)) !important;
  font-size: var(--font-size-xs) !important;
  font-weight: 600 !important;
  letter-spacing: 0;
  transition:
    background-color var(--transition-sm) ease-out,
    border-color var(--transition-sm) ease-out,
    color var(--transition-sm) ease-out;
}

.auth-quick-accounts__chip:hover {
  border-color: rgb(
    var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 40%
  ) !important;
  background: rgb(
    var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 7%
  ) !important;
  color: rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b)) !important;
}

.auth-quick-accounts__chip--active {
  border-color: rgb(
    var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 60%
  ) !important;
  background:
    linear-gradient(
      180deg,
      rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 12%),
      rgb(var(--card) / 74%)
    ),
    rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 8%) !important;
  color: rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b)) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 5%),
    0 0 0 2px rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 7%) !important;
}

:global(.dark) .auth-quick-accounts {
  border-color: rgb(var(--foreground) / 16%);
  background:
    linear-gradient(180deg, rgb(var(--card) / 62%), rgb(var(--background) / 74%)),
    rgb(var(--background) / 62%);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 5%),
    0 1px 2px rgb(var(--background) / 24%);
}

:global(.dark) .auth-quick-accounts__header {
  color: rgb(var(--card-foreground) / 78%);
}

:global(.dark) .auth-quick-accounts__chip {
  border-color: rgb(var(--foreground) / 14%) !important;
  background: rgb(var(--card) / 58%) !important;
  color: rgb(var(--card-foreground) / 80%) !important;
}

:global(.dark) .auth-quick-accounts__chip--active {
  border-color: rgb(
    var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 62%
  ) !important;
  background:
    linear-gradient(
      180deg,
      rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 18%),
      rgb(var(--background) / 68%)
    ),
    rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 10%) !important;
}
</style>
