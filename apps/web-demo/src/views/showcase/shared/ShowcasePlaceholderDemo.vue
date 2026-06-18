<script setup lang="ts">
import { showcaseCatalog, showcaseCatalogGroups } from '../data/showcaseCatalog'
import type { ShowcaseCatalogItem } from '../data/types'
import ShowcaseCatalogGrid from './ShowcaseCatalogGrid.vue'
import ShowcaseDemoPanel from './ShowcaseDemoPanel.vue'
import ShowcaseFeatureCard from './ShowcaseFeatureCard.vue'
import ShowcasePageShell from './ShowcasePageShell.vue'

defineOptions({ name: 'ShowcasePlaceholderDemo' })

const props = defineProps<{
  item?: ShowcaseCatalogItem
}>()

const route = useRoute()

function getFallbackItem(): ShowcaseCatalogItem {
  const [firstItem] = showcaseCatalog
  if (!firstItem) throw new Error('[ShowcasePlaceholderDemo] Showcase catalog is empty.')
  return firstItem
}

const fallbackItem = getFallbackItem()

const currentItem = computed(() => {
  if (props.item) return props.item

  const routeShowcaseId = route.meta.showcaseId
  if (typeof routeShowcaseId === 'string') {
    const matchedItem = showcaseCatalog.find(item => item.id === routeShowcaseId)
    if (matchedItem) return matchedItem
  }

  const pathMatchedItem = showcaseCatalog.find(item => item.path === route.path)
  return pathMatchedItem ?? fallbackItem
})

const currentGroup = computed(() => {
  return showcaseCatalogGroups.find(group => group.id === currentItem.value.groupId)
})

const currentGroupItems = computed(() => {
  return showcaseCatalog
    .filter(item => item.groupId === currentItem.value.groupId)
    .sort((a, b) => a.rank - b.rank)
})

const currentGroupList = computed(() => {
  const group = currentGroup.value
  return group ? [group] : []
})

const groupDescriptionKey = computed(() => {
  return currentGroup.value?.descriptionKey ?? 'showcase.placeholder.why.description'
})
</script>

<template>
  <ShowcasePageShell :item="currentItem">
    <template #demo>
      <ShowcaseDemoPanel
        :title="$t('showcase.placeholder.demo.title')"
        :description="$t('showcase.placeholder.demo.description')"
      >
        <div class="col-stretch min-w-0 gap-md">
          <div class="row-start min-w-0 gap-md">
            <span class="glass-icon-box text-primary">
              <Icons
                :name="currentItem.icon"
                size="xl"
              />
            </span>
            <div class="col-stretch min-w-0 gap-xs">
              <h2 class="text-lg font-semibold text-foreground m-0">
                {{ $t('showcase.placeholder.demo.stateTitle') }}
              </h2>
              <p class="text-sm text-muted-foreground m-0">
                {{ $t('showcase.placeholder.demo.stateDescription') }}
              </p>
            </div>
          </div>

          <div class="row-start min-w-0 gap-sm flex-wrap">
            <Tag
              :value="$t(`showcase.shell.demoLevels.${currentItem.demoLevel}`)"
              severity="info"
            />
            <Tag
              :value="$t(`showcase.shell.kinds.${currentItem.kind}`)"
              severity="secondary"
            />
          </div>
        </div>
      </ShowcaseDemoPanel>
    </template>

    <template #features>
      <ShowcaseFeatureCard
        icon="i-lucide-badge-help"
        :title="$t('showcase.placeholder.what.title')"
        :description="$t(`${currentItem.localeBaseKey}.description`)"
        :tag="$t(`showcase.shell.kinds.${currentItem.kind}`)"
      />
      <ShowcaseFeatureCard
        icon="i-lucide-sparkles"
        :title="$t('showcase.placeholder.why.title')"
        :description="$t(groupDescriptionKey)"
        :tag="$t(`showcase.shell.demoLevels.${currentItem.demoLevel}`)"
      />
    </template>

    <template #explanation>
      <ShowcaseFeatureCard
        icon="i-lucide-mouse-pointer-click"
        :title="$t('showcase.placeholder.try.title')"
        :description="$t(`${currentItem.localeBaseKey}.try`)"
      />
      <ShowcaseFeatureCard
        icon="i-lucide-file-code-2"
        :title="$t('showcase.placeholder.source.title')"
        :description="$t(`${currentItem.localeBaseKey}.source`)"
      />
    </template>

    <template #aside>
      <section class="col-stretch min-w-0 gap-md">
        <div class="col-stretch min-w-0 gap-xs">
          <h2 class="text-lg font-semibold text-foreground m-0">
            {{ $t('showcase.placeholder.catalog.title') }}
          </h2>
          <p class="text-sm text-muted-foreground m-0">
            {{ $t('showcase.placeholder.catalog.description') }}
          </p>
        </div>

        <ShowcaseCatalogGrid
          :items="currentGroupItems"
          :groups="currentGroupList"
          :active-id="currentItem.id"
        />
      </section>
    </template>
  </ShowcasePageShell>
</template>
