<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LoginResponsiveState } from '../types'

const { t } = useI18n({ useScope: 'global' })

defineOptions({ name: 'LoginBrandPanel' })

const props = defineProps<{
  responsive: LoginResponsiveState
}>()

const runtimeStatuses = [
  { icon: 'i-lucide-orbit', labelKey: 'login.trustAdminConsole', tone: 'surface-primary' },
  { icon: 'i-lucide-shield-check', labelKey: 'login.trustRoleControl', tone: 'surface-success' },
  { icon: 'i-lucide-activity', labelKey: 'login.trustSecureAccess', tone: 'surface-info' },
] as const

const brandRootClass = computed(() =>
  props.responsive.showBrandSummary ? 'order-first text-center' : 'text-left'
)

const logoClass = computed(() => (props.responsive.showFullBrand ? 'p-sm' : 'p-xs'))

const titleClass = computed(() => (props.responsive.showFullBrand ? 'text-4xl' : 'text-2xl'))
</script>

<template>
  <section
    v-if="!responsive.compactHeight || !responsive.showBrandSummary"
    class="relative min-w-0 col-stretch"
    :class="[brandRootClass, responsive.showFullBrand ? 'gap-lg' : 'gap-sm']"
  >
    <div
      class="col-stretch"
      :class="responsive.showFullBrand ? 'gap-md' : 'gap-xs'"
    >
      <div
        class="gap-sm"
        :class="responsive.showBrandSummary ? 'row-center' : 'row-start'"
      >
        <span
          class="center rounded-lg surface-primary"
          :class="logoClass"
        >
          <Icons
            name="i-lucide-cpu"
            :size="responsive.showFullBrand ? 'lg' : 'md'"
          />
        </span>
        <div class="min-w-0 col-stretch gap-xs">
          <div
            class="min-w-0 gap-sm"
            :class="responsive.showBrandSummary ? 'row-center' : 'row-start'"
          >
            <span
              class="font-bold leading-none tracking-tight text-foreground"
              :class="titleClass"
            >
              CCD
            </span>
            <span
              class="rounded-md border border-solid border-primary/20 bg-primary/10 px-sm py-xs text-sm font-semibold text-primary"
            >
              Web Demo
            </span>
          </div>
          <p class="m-0 text-sm font-medium leading-snug text-muted-foreground">
            AI Operating System
          </p>
        </div>
      </div>

      <div
        v-if="!responsive.compactHeight && responsive.mode !== 'mobile'"
        class="max-w-xl col-stretch gap-xs"
        :class="responsive.showBrandSummary ? 'mx-auto text-center' : ''"
      >
        <h1
          id="login-brand-title"
          class="m-0 font-semibold leading-tight tracking-tight text-card-foreground"
          :class="responsive.showFullBrand ? 'text-4xl' : 'text-xl'"
        >
          Governed AI.
          <br />
          Ready to run.
        </h1>
        <p
          v-if="responsive.showFullBrand || responsive.showCompactBrand"
          class="m-0 leading-relaxed text-muted-foreground"
          :class="responsive.showFullBrand ? 'text-base' : 'text-sm'"
        >
          {{ t('login.brandSloganLine1') }}
        </p>
      </div>
    </div>

    <div
      v-if="responsive.showFeatureCards"
      class="grid max-w-xl grid-cols-3 gap-sm"
    >
      <div
        v-for="status in runtimeStatuses"
        :key="status.labelKey"
        class="rounded-lg border border-solid border-border bg-muted/30 p-sm shadow-sm col-stretch gap-sm"
      >
        <span
          class="center rounded-md p-xs self-start max-lg:self-center"
          :class="status.tone"
        >
          <Icons
            :name="status.icon"
            size="md"
          />
        </span>
        <span class="text-sm font-medium leading-snug text-foreground">
          {{ t(status.labelKey) }}
        </span>
      </div>
    </div>

    <div
      v-if="responsive.showArchitectureStrip"
      class="max-w-xl row-between gap-md rounded-lg border border-solid border-border/60 bg-muted/25 p-md"
    >
      <div class="col-stretch gap-xs">
        <span class="text-xs font-semibold uppercase tracking-wider text-primary">
          Architecture Native
        </span>
        <span class="text-sm leading-snug text-muted-foreground">
          UnoCSS tokens, PrimeVue presets, adapter-safe runtime.
        </span>
      </div>
      <span class="glass-icon-box surface-success shrink-0">
        <Icons
          name="i-lucide-check"
          size="md"
        />
      </span>
    </div>
  </section>
</template>
