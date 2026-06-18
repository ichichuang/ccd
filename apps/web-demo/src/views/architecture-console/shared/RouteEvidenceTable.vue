<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'RouteEvidenceTable' })

const { t } = useI18n()
</script>

<template>
  <section class="material-elevated col-stretch min-w-0 gap-md">
    <div class="row-between gap-md">
      <div class="col-stretch min-w-0 gap-xs">
        <h2 class="text-lg font-semibold text-foreground m-0">
          {{ t('console.routeEvidence.title') }}
        </h2>
        <p class="text-sm text-muted-foreground m-0">
          {{ t('console.routeEvidence.description') }}
        </p>
      </div>
      <span class="glass-icon-box shrink-0 text-primary">
        <Icons
          name="i-lucide-route"
          size="xl"
        />
      </span>
    </div>

    <div class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-3">
      <div class="demo-well col-stretch gap-xs">
        <span class="text-sm text-muted-foreground">{{ t('console.routeEvidence.modules') }}</span>
        <strong class="text-lg text-foreground">
          {{ t('console.routeEvidence.modulesValue') }}
        </strong>
        <span class="text-sm text-muted-foreground">
          {{ t('console.routeEvidence.modulesDetail') }}
        </span>
      </div>
      <div class="demo-well col-stretch gap-xs">
        <span class="text-sm text-muted-foreground">{{ t('console.routeEvidence.metadata') }}</span>
        <strong class="text-lg text-foreground">
          {{ t('console.routeEvidence.metadataValue') }}
        </strong>
        <span class="text-sm text-muted-foreground">
          {{ t('console.routeEvidence.metadataDetail') }}
        </span>
      </div>
      <div class="demo-well col-stretch gap-xs">
        <span class="text-sm text-muted-foreground">{{ t('console.routeEvidence.locale') }}</span>
        <strong class="text-lg text-foreground">
          {{ t('console.routeEvidence.localeValue') }}
        </strong>
        <span class="text-sm text-muted-foreground">
          {{ t('console.routeEvidence.localeDetail') }}
        </span>
      </div>
    </div>
  </section>
</template>
