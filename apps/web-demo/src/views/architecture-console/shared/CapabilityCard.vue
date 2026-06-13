<script setup lang="ts">
import type { ConsoleCapability } from '../data/consolePages'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'CapabilityCard' })

defineProps<{
  item: ConsoleCapability
}>()

const { t } = useI18n()

function capabilityKey(item: ConsoleCapability, field: string): string {
  return `console.capabilities.${item.key}.${field}`
}

function capabilityBulletKey(item: ConsoleCapability, index: number): string {
  return `console.capabilities.${item.key}.bullets.${index}`
}
</script>

<template>
  <article class="material-elevated col-stretch min-w-0 gap-md">
    <div class="row-between gap-md">
      <span class="glass-icon-box">
        <Icons
          :name="item.icon"
          size="lg"
        />
      </span>
      <Tag
        :value="t(capabilityKey(item, 'status'))"
        severity="info"
      />
    </div>

    <div class="col-stretch min-w-0 gap-xs">
      <h2 class="text-lg font-semibold text-foreground m-0">
        {{ t(capabilityKey(item, 'title')) }}
      </h2>
      <p class="text-sm text-muted-foreground m-0">
        {{ t(capabilityKey(item, 'description')) }}
      </p>
    </div>

    <ul class="col-stretch gap-xs m-0 p-0 list-none">
      <li
        v-for="index in item.bulletCount"
        :key="capabilityBulletKey(item, index - 1)"
        class="row-start gap-xs text-sm text-foreground"
      >
        <Icons
          name="i-lucide-check"
          size="sm"
          class="text-success"
        />
        <span class="min-w-0">{{ t(capabilityBulletKey(item, index - 1)) }}</span>
      </li>
    </ul>
  </article>
</template>
