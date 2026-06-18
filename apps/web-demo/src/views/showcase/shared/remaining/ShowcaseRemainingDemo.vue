<script setup lang="ts">
import type { RemainingShowcaseDemoKind, RemainingShowcaseId } from '../../data/showcaseDemoContent'
import type { ShowcaseCatalogItem } from '../../data/types'
import ShowcaseCatalogDemo from './ShowcaseCatalogDemo.vue'
import ShowcaseChartDemo from './ShowcaseChartDemo.vue'
import ShowcaseComponentDemo from './ShowcaseComponentDemo.vue'
import ShowcaseDesignDemo from './ShowcaseDesignDemo.vue'
import ShowcaseFeedbackDemo from './ShowcaseFeedbackDemo.vue'
import ShowcaseHookDemo from './ShowcaseHookDemo.vue'
import ShowcaseRuntimeDemo from './ShowcaseRuntimeDemo.vue'
import ShowcaseUtilityDemo from './ShowcaseUtilityDemo.vue'

interface RemainingShowcaseContentProp {
  id: RemainingShowcaseId
  demoKind: RemainingShowcaseDemoKind
}

defineOptions({ name: 'ShowcaseRemainingDemo' })

const props = defineProps<{
  item: ShowcaseCatalogItem
  content: RemainingShowcaseContentProp
}>()

const isCatalogDemo = computed(() => props.content.demoKind.startsWith('catalog-'))
const isComponentDemo = computed(() => props.content.demoKind.startsWith('component-'))
const isChartDemo = computed(() => props.content.demoKind.startsWith('chart-'))
const isHookDemo = computed(() => props.content.demoKind.startsWith('hook-'))
const isUtilityDemo = computed(() => props.content.demoKind.startsWith('utils-'))
const isRuntimeDemo = computed(() => props.content.demoKind.startsWith('runtime-'))
const isDesignDemo = computed(() => props.content.demoKind.startsWith('design-'))
</script>

<template>
  <ShowcaseCatalogDemo
    v-if="isCatalogDemo"
    :item="props.item"
    :kind="props.content.demoKind"
  />
  <ShowcaseComponentDemo
    v-else-if="isComponentDemo"
    :kind="props.content.demoKind"
  />
  <ShowcaseChartDemo
    v-else-if="isChartDemo"
    :kind="props.content.demoKind"
  />
  <ShowcaseHookDemo
    v-else-if="isHookDemo"
    :kind="props.content.demoKind"
  />
  <ShowcaseUtilityDemo
    v-else-if="isUtilityDemo"
    :kind="props.content.demoKind"
  />
  <ShowcaseRuntimeDemo
    v-else-if="isRuntimeDemo"
    :kind="props.content.demoKind"
  />
  <ShowcaseDesignDemo
    v-else-if="isDesignDemo"
    :kind="props.content.demoKind"
  />
  <ShowcaseFeedbackDemo v-else />
</template>
