<script setup lang="ts">
import type { ConsoleCommand } from '../data/consolePages'

defineOptions({ name: 'CommandPanel' })

defineProps<{
  commands: ConsoleCommand[]
}>()
</script>

<template>
  <section class="material-elevated col-stretch gap-md">
    <div class="row-between gap-md">
      <div class="col-stretch gap-xs">
        <h2 class="text-lg font-semibold text-foreground m-0">Validation Commands</h2>
        <p class="text-sm text-muted-foreground m-0">
          Commands remain script-backed and validated by wiki/governance gates.
        </p>
      </div>
      <Icons
        name="i-lucide-terminal"
        size="xl"
        class="text-primary"
      />
    </div>

    <div class="col-stretch gap-sm">
      <div
        v-for="item in commands"
        :key="item.command"
        class="demo-well col-stretch gap-xs"
      >
        <code class="code-inline">{{ item.command }}</code>
        <span class="text-sm text-muted-foreground">{{ item.description }}</span>
      </div>
    </div>
  </section>
</template>
