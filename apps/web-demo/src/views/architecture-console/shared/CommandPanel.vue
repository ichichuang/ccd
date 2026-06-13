<script setup lang="ts">
import type { ConsoleCommand } from '../data/consolePages'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'CommandPanel' })

defineProps<{
  commands: ConsoleCommand[]
}>()

const { t } = useI18n()

function commandDescriptionKey(item: ConsoleCommand): string {
  return `console.commands.${item.key}.description`
}
</script>

<template>
  <section class="material-elevated col-stretch min-w-0 gap-md">
    <div class="row-between gap-md">
      <div class="col-stretch min-w-0 gap-xs">
        <h2 class="text-lg font-semibold text-foreground m-0">
          {{ t('console.shared.commands.title') }}
        </h2>
        <p class="text-sm text-muted-foreground m-0">
          {{ t('console.shared.commands.description') }}
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
        class="demo-well col-stretch min-w-0 gap-xs"
      >
        <code class="code-inline w-full min-w-0 whitespace-normal break-words leading-normal">
          {{ item.command }}
        </code>
        <span class="text-sm text-muted-foreground">{{ t(commandDescriptionKey(item)) }}</span>
      </div>
    </div>
  </section>
</template>
