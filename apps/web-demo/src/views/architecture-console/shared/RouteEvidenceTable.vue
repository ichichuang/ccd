<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'RouteEvidenceTable' })

defineProps<{
  beforeCount: string
  afterCount: string
}>()

const { t } = useI18n()
</script>

<template>
  <section class="material-elevated col-stretch min-w-0 gap-md">
    <div class="row-between gap-md">
      <div class="col-stretch min-w-0 gap-xs">
        <h2 class="text-lg font-semibold text-foreground m-0">
          {{ t('console.routeReduction.title') }}
        </h2>
        <p class="text-sm text-muted-foreground m-0">
          {{ t('console.routeReduction.description') }}
        </p>
      </div>
      <Icons
        name="i-lucide-route"
        size="xl"
        class="text-primary"
      />
    </div>

    <div class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2">
      <div class="demo-well col-stretch gap-xs">
        <span class="text-sm text-muted-foreground">{{ t('console.routeReduction.before') }}</span>
        <strong class="text-2xl text-foreground">{{ beforeCount }}</strong>
        <span class="text-sm text-muted-foreground">
          {{ t('console.routeReduction.beforeDetail') }}
        </span>
      </div>
      <div class="demo-well col-stretch gap-xs">
        <span class="text-sm text-muted-foreground">{{ t('console.routeReduction.after') }}</span>
        <strong class="text-2xl text-foreground">{{ afterCount }}</strong>
        <span class="text-sm text-muted-foreground">
          {{ t('console.routeReduction.afterDetail') }}
        </span>
      </div>
    </div>
  </section>
</template>
