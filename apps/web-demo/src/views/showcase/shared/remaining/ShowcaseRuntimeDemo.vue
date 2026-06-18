<script setup lang="ts">
interface RuntimeRow {
  key: string
  icon: `i-${string}`
}

defineOptions({ name: 'ShowcaseRuntimeDemo' })

const props = defineProps<{
  kind: string
}>()

const currentRuntime = computed(() => props.kind.replace('runtime-', ''))

const rows: RuntimeRow[] = [
  { key: 'http', icon: 'i-lucide-webhook' },
  { key: 'browser', icon: 'i-lucide-globe-2' },
  { key: 'layout', icon: 'i-lucide-panels-top-left' },
  { key: 'stateOwnership', icon: 'i-lucide-database' },
]
</script>

<template>
  <section class="col-stretch min-w-0 gap-md">
    <div class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2">
      <article
        v-for="row in rows"
        :key="row.key"
        class="material-solid col-stretch min-w-0 gap-md p-md"
        :class="{ 'ring-2 ring-primary/30': currentRuntime.includes(row.key) }"
      >
        <span class="glass-icon-box text-primary">
          <Icons
            :name="row.icon"
            size="lg"
          />
        </span>
        <div class="col-stretch min-w-0 gap-xs">
          <h3 class="text-base font-semibold text-foreground m-0">
            {{ $t(`showcase.remaining.runtime.${row.key}.title`) }}
          </h3>
          <p class="text-sm text-muted-foreground m-0">
            {{ $t(`showcase.remaining.runtime.${row.key}.description`) }}
          </p>
        </div>
      </article>
    </div>

    <div class="demo-well col-stretch min-w-0 gap-xs">
      <h3 class="text-base font-semibold text-foreground m-0">
        {{ $t(`showcase.remaining.runtime.${currentRuntime}.focusTitle`) }}
      </h3>
      <p class="text-sm text-muted-foreground m-0">
        {{ $t(`showcase.remaining.runtime.${currentRuntime}.focusDescription`) }}
      </p>
    </div>
  </section>
</template>
