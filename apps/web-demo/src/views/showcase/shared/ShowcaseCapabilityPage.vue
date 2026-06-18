<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  getRemainingShowcaseContent,
  getRemainingShowcaseItem,
  remainingShowcaseCardIcons,
  type RemainingShowcaseCardKey,
  type RemainingShowcaseId,
} from '../data/showcaseDemoContent'
import ShowcaseDemoPanel from './ShowcaseDemoPanel.vue'
import ShowcaseFeatureCard from './ShowcaseFeatureCard.vue'
import ShowcasePageShell from './ShowcasePageShell.vue'
import ShowcaseRelatedLinks from './ShowcaseRelatedLinks.vue'
import ShowcaseSourceLinks from './ShowcaseSourceLinks.vue'
import ShowcaseRemainingDemo from './remaining/ShowcaseRemainingDemo.vue'

defineOptions({ name: 'ShowcaseCapabilityPage' })

const props = defineProps<{
  id: RemainingShowcaseId
}>()

const { t } = useI18n()

const item = computed(() => getRemainingShowcaseItem(props.id))
const content = computed(() => getRemainingShowcaseContent(props.id))
const demoDescription = computed(() =>
  t(`showcase.remaining.demos.${content.value.demoKind}.description`)
)

function getCardTitle(key: RemainingShowcaseCardKey): string {
  return t(`showcase.remaining.cards.${key}.title`)
}

function getCardDescription(key: RemainingShowcaseCardKey): string {
  return t(`showcase.remaining.cards.${key}.description`)
}
</script>

<template>
  <ShowcasePageShell
    :item="item"
    :related-ids="item.relatedIds"
  >
    <template #demo>
      <ShowcaseDemoPanel
        :title="$t(`${item.localeBaseKey}.try`)"
        :description="demoDescription"
      >
        <ShowcaseRemainingDemo
          :item="item"
          :content="content"
        />
      </ShowcaseDemoPanel>
    </template>

    <template #features>
      <ShowcaseFeatureCard
        v-for="featureKey in content.features"
        :key="featureKey"
        :icon="remainingShowcaseCardIcons[featureKey]"
        :title="getCardTitle(featureKey)"
        :description="getCardDescription(featureKey)"
        :tag="$t('showcase.remaining.tags.value')"
      />
    </template>

    <template #explanation>
      <ShowcaseFeatureCard
        v-for="explanationKey in content.explanations"
        :key="explanationKey"
        :icon="remainingShowcaseCardIcons[explanationKey]"
        :title="getCardTitle(explanationKey)"
        :description="getCardDescription(explanationKey)"
        :tag="$t('showcase.remaining.tags.explanation')"
      />
    </template>

    <template #technical>
      <ShowcaseFeatureCard
        v-for="technicalKey in content.technical"
        :key="technicalKey"
        :icon="remainingShowcaseCardIcons[technicalKey]"
        :title="getCardTitle(technicalKey)"
        :description="getCardDescription(technicalKey)"
        :tag="$t('showcase.remaining.tags.technical')"
      />
      <ShowcaseSourceLinks :source-paths="item.sourcePaths" />
      <ShowcaseRelatedLinks
        :item="item"
        :related-ids="item.relatedIds"
      />
    </template>
  </ShowcasePageShell>
</template>
