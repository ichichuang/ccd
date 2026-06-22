<script setup lang="ts">
import { CScrollbar } from '@ccd/vue-ui'
import ShowcaseCard from './ShowcaseCard.vue'
import ShowcaseEmptyState from './ShowcaseEmptyState.vue'

interface ShowcaseEvidencePanelProps {
  title: string
  description: string
  emptyText: string
  sourcePaths: readonly string[]
}

defineOptions({ name: 'ShowcaseEvidencePanel' })

const props = defineProps<ShowcaseEvidencePanelProps>()

const shouldScroll = computed(() => props.sourcePaths.length > 4)
</script>

<template>
  <ShowcaseCard
    icon="i-lucide-folder-code"
    :title="props.title"
    :description="props.description"
  >
    <CScrollbar
      v-if="shouldScroll"
      class="max-h-[32vh]"
    >
      <ul class="col-stretch gap-xs m-0 p-0 list-none">
        <li
          v-for="sourcePath in props.sourcePaths"
          :key="sourcePath"
          class="demo-well min-w-0"
        >
          <code class="code-inline block min-w-0 break-all leading-normal select-all">
            {{ sourcePath }}
          </code>
        </li>
      </ul>
    </CScrollbar>

    <ul
      v-else-if="props.sourcePaths.length"
      class="col-stretch gap-xs m-0 p-0 list-none"
    >
      <li
        v-for="sourcePath in props.sourcePaths"
        :key="sourcePath"
        class="demo-well min-w-0"
      >
        <code class="code-inline block min-w-0 break-all leading-normal select-all">
          {{ sourcePath }}
        </code>
      </li>
    </ul>

    <ShowcaseEmptyState
      v-else
      icon="i-lucide-folder-x"
      :title="props.emptyText"
    />
  </ShowcaseCard>
</template>
