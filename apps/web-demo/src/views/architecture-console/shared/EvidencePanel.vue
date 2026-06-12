<script setup lang="ts">
import type { ConsoleEvidence } from '../data/consolePages'

defineOptions({ name: 'EvidencePanel' })

defineProps<{
  items: ConsoleEvidence[]
}>()
</script>

<template>
  <section class="material-elevated col-stretch gap-md">
    <div class="row-between gap-md">
      <div class="col-stretch gap-xs">
        <h2 class="text-lg font-semibold text-foreground m-0">Evidence</h2>
        <p class="text-sm text-muted-foreground m-0">
          Repository paths and policy facts backing this route.
        </p>
      </div>
      <Icons
        name="i-lucide-file-check-2"
        size="xl"
        class="text-primary"
      />
    </div>

    <div class="grid grid-cols-1 gap-md xl:grid-cols-2">
      <article
        v-for="item in items"
        :key="item.label"
        class="demo-well col-stretch gap-xs"
      >
        <span class="text-xs font-semibold text-primary text-no-wrap">{{ item.label }}</span>
        <strong class="text-sm text-foreground">{{ item.value }}</strong>
        <span class="text-sm text-muted-foreground">{{ item.detail }}</span>
      </article>
    </div>
  </section>
</template>
