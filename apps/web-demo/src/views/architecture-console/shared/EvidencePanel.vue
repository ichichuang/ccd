<script setup lang="ts">
import type { ConsoleEvidence } from '../data/consolePages'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'EvidencePanel' })

defineProps<{
  items: ConsoleEvidence[]
}>()

const { t } = useI18n()

function evidenceKey(item: ConsoleEvidence, field: string): string {
  return `console.evidence.${item.key}.${field}`
}
</script>

<template>
  <section class="material-elevated col-stretch min-w-0 gap-md">
    <div class="row-between gap-md">
      <div class="col-stretch min-w-0 gap-xs">
        <h2 class="text-lg font-semibold text-foreground m-0">
          {{ t('console.shared.evidence.title') }}
        </h2>
        <p class="text-sm text-muted-foreground m-0">
          {{ t('console.shared.evidence.description') }}
        </p>
      </div>
      <span class="glass-icon-box shrink-0 text-primary">
        <Icons
          name="i-lucide-file-check-2"
          size="xl"
        />
      </span>
    </div>

    <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-2">
      <article
        v-for="item in items"
        :key="item.key"
        class="demo-well col-stretch min-w-0 gap-xs"
      >
        <span class="text-xs font-semibold text-primary text-no-wrap">
          {{ t(evidenceKey(item, 'label')) }}
        </span>
        <strong class="text-sm text-foreground whitespace-normal break-words">
          {{ item.value }}
        </strong>
        <span class="text-sm text-muted-foreground">{{ t(evidenceKey(item, 'detail')) }}</span>
      </article>
    </div>
  </section>
</template>
