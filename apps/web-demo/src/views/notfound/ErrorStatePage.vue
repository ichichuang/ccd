<script setup lang="ts">
import { useUserStore } from '@/stores/modules/session/user'

defineOptions({ name: 'ErrorStatePage' })

export interface ErrorStatePageProps {
  code: 403 | 404 | 500
}

const props = defineProps<ErrorStatePageProps>()

const router = useRouter()
const userStore = useUserStore()

// Read-only auth signal for 403 fallback
const isAuthenticated = computed(() => userStore.getIsLogin)

const pageConfig = computed(() => {
  switch (props.code) {
    case 404:
      return {
        titleKey: 'router.error.notFound',
        descriptionKey: 'router.error.notFoundDesc',
        icon: 'i-lucide-file-question',
        severityClass: 'surface-warn',
        showBack: false,
        showDashboard: true,
        showSignIn: false,
        showReload: false,
      }
    case 500:
      return {
        titleKey: 'router.error.serverError',
        descriptionKey: 'router.error.serverErrorDesc',
        icon: 'i-lucide-server-crash',
        severityClass: 'surface-danger',
        showBack: false,
        showDashboard: true,
        showSignIn: false,
        showReload: true,
      }
    case 403:
    default:
      return {
        titleKey: 'router.error.forbidden',
        descriptionKey: 'router.error.forbiddenDesc',
        icon: 'i-lucide-shield-x',
        severityClass: 'surface-danger',
        showBack: false,
        showDashboard: true,
        showSignIn: !isAuthenticated.value,
        showReload: false,
      }
  }
})

function handleDashboard() {
  router.replace({ name: 'Dashboard' })
}

function handleBack() {
  router.back()
}

function handleSignIn() {
  router.replace({ name: 'Login' })
}

function handleReload() {
  router.go(0)
}
</script>

<template>
  <div class="layout-screen col-center gap-lg px-xl py-2xl">
    <div
      class="card glass-card col-center gap-xl text-center text-card-foreground w-full max-w-[44ch] rounded-xl p-xl"
    >
      <div
        :class="`${pageConfig.severityClass} rounded-full center shrink-0 w-[var(--spacing-4xl)] h-[var(--spacing-4xl)]`"
      >
        <Icons
          :name="pageConfig.icon"
          size="5xl"
        />
      </div>

      <h1 class="text-5xl font-bold tracking-tighter">{{ code }}</h1>

      <p class="text-lg font-semibold m-0">
        {{ $t(pageConfig.titleKey) }}
      </p>
      <p class="text-sm text-muted-foreground m-0">
        {{ $t(pageConfig.descriptionKey) }}
      </p>

      <div class="row-center gap-md flex-wrap">
        <Button
          v-if="pageConfig.showDashboard"
          :label="$t('router.error.backToHome')"
          icon="i-lucide-home"
          :aria-label="$t('router.error.backToHome')"
          @click="handleDashboard"
        />

        <Button
          v-if="pageConfig.showBack"
          severity="secondary"
          :label="$t('router.error.goBack')"
          icon="i-lucide-arrow-left"
          :aria-label="$t('router.error.goBack')"
          @click="handleBack"
        />

        <Button
          v-if="pageConfig.showSignIn"
          severity="secondary"
          :label="$t('router.error.signIn')"
          icon="i-lucide-log-in"
          :aria-label="$t('router.error.signIn')"
          @click="handleSignIn"
        />

        <Button
          v-if="pageConfig.showReload"
          severity="secondary"
          :label="$t('router.error.reload')"
          icon="i-lucide-refresh-cw"
          :aria-label="$t('router.error.reload')"
          @click="handleReload"
        />
      </div>
    </div>
  </div>
</template>
