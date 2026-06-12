<script setup lang="ts">
defineOptions({ name: 'RouteEvidenceTable' })

defineProps<{
  beforeCount: string
  afterCount: string
}>()
</script>

<template>
  <section class="material-elevated col-stretch gap-md">
    <div class="row-between gap-md">
      <div class="col-stretch gap-xs">
        <h2 class="text-lg font-semibold text-foreground m-0">Route Reduction</h2>
        <p class="text-sm text-muted-foreground m-0">
          Legacy route records are replaced with a smaller architecture taxonomy.
        </p>
      </div>
      <Icons
        name="i-lucide-route"
        size="xl"
        class="text-primary"
      />
    </div>

    <div class="grid grid-cols-1 gap-md md:grid-cols-2">
      <div class="demo-well col-stretch gap-xs">
        <span class="text-sm text-muted-foreground">Before</span>
        <strong class="text-2xl text-foreground">{{ beforeCount }}</strong>
        <span class="text-sm text-muted-foreground">
          registered records with 99 legacy museum entries
        </span>
      </div>
      <div class="demo-well col-stretch gap-xs">
        <span class="text-sm text-muted-foreground">After</span>
        <strong class="text-2xl text-foreground">{{ afterCount }}</strong>
        <span class="text-sm text-muted-foreground">
          registered records in the console taxonomy
        </span>
      </div>
    </div>
  </section>
</template>
