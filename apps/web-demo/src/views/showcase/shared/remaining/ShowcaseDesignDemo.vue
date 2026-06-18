<script setup lang="ts">
interface DesignRow {
  key: string
  className: string
}

defineOptions({ name: 'ShowcaseDesignDemo' })

const props = defineProps<{
  kind: string
}>()

const currentDesign = computed(() => props.kind.replace('design-', ''))

const tokenRows: DesignRow[] = [
  { key: 'primary', className: 'surface-primary' },
  { key: 'success', className: 'surface-success' },
  { key: 'warn', className: 'surface-warn' },
  { key: 'info', className: 'surface-info' },
]

const materialRows: DesignRow[] = [
  { key: 'solid', className: 'material-solid' },
  { key: 'elevated', className: 'material-elevated' },
  { key: 'panel', className: 'glass-panel' },
]

const rows = computed(() => (currentDesign.value === 'material' ? materialRows : tokenRows))
</script>

<template>
  <section class="col-stretch min-w-0 gap-md">
    <div class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="row in rows"
        :key="row.key"
        class="col-stretch min-w-0 gap-sm p-md"
        :class="row.className"
      >
        <span class="text-sm font-semibold">
          {{ $t(`showcase.remaining.design.rows.${row.key}.title`) }}
        </span>
        <span class="text-sm">
          {{ $t(`showcase.remaining.design.rows.${row.key}.description`) }}
        </span>
      </article>
    </div>

    <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
      <article class="demo-well col-stretch min-w-0 gap-xs">
        <h3 class="text-base font-semibold text-foreground m-0">
          {{ $t('showcase.remaining.design.semantic.title') }}
        </h3>
        <p class="text-sm text-muted-foreground m-0">
          {{ $t('showcase.remaining.design.semantic.description') }}
        </p>
      </article>
      <article class="demo-well col-stretch min-w-0 gap-xs">
        <h3 class="text-base font-semibold text-foreground m-0">
          {{ $t('showcase.remaining.design.density.title') }}
        </h3>
        <p class="text-sm text-muted-foreground m-0">
          {{ $t('showcase.remaining.design.density.description') }}
        </p>
      </article>
      <article class="demo-well col-stretch min-w-0 gap-xs">
        <h3 class="text-base font-semibold text-foreground m-0">
          {{ $t('showcase.remaining.design.motion.title') }}
        </h3>
        <p class="text-sm text-muted-foreground m-0">
          {{ $t('showcase.remaining.design.motion.description') }}
        </p>
      </article>
    </div>
  </section>
</template>
