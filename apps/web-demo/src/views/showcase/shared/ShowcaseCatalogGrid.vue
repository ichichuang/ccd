<script setup lang="ts">
import { showcaseCatalog, showcaseCatalogGroups } from '../data/showcaseCatalog'
import type { ShowcaseCatalogGroup, ShowcaseCatalogItem, ShowcaseDemoLevel } from '../data/types'

defineOptions({ name: 'ShowcaseCatalogGrid' })

const props = withDefaults(
  defineProps<{
    items?: readonly ShowcaseCatalogItem[]
    groups?: readonly ShowcaseCatalogGroup[]
    activeId?: string
  }>(),
  {
    items: () => showcaseCatalog,
    groups: () => showcaseCatalogGroups,
    activeId: undefined,
  }
)

const groupSections = computed(() => {
  return props.groups
    .map(group => ({
      group,
      items: props.items.filter(item => item.groupId === group.id).sort((a, b) => a.rank - b.rank),
    }))
    .filter(section => section.items.length > 0)
})

function getDemoLevelSeverity(level: ShowcaseDemoLevel): 'success' | 'info' {
  return level === 'complete' ? 'success' : 'info'
}
</script>

<template>
  <section class="col-stretch min-w-0 gap-lg">
    <article
      v-for="section in groupSections"
      :key="section.group.id"
      class="col-stretch min-w-0 gap-md"
    >
      <header class="row-start min-w-0 gap-md">
        <span class="glass-icon-box text-primary">
          <Icons
            :name="section.group.icon"
            size="lg"
          />
        </span>
        <div class="col-stretch min-w-0 gap-xs">
          <h2 class="text-lg font-semibold text-foreground m-0">
            {{ $t(section.group.titleKey) }}
          </h2>
          <p class="text-sm text-muted-foreground m-0">
            {{ $t(section.group.descriptionKey) }}
          </p>
        </div>
      </header>

      <div class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
        <RouterLink
          v-for="item in section.items"
          :key="item.id"
          :to="item.path"
          :aria-current="item.id === props.activeId ? 'page' : undefined"
          class="material-solid interactive-card col-stretch min-w-0 gap-sm p-md no-underline"
        >
          <div class="row-between min-w-0 gap-md">
            <span class="glass-icon-box text-primary">
              <Icons
                :name="item.icon"
                size="md"
              />
            </span>
            <Tag
              :value="$t(`showcase.shell.demoLevels.${item.demoLevel}`)"
              :severity="getDemoLevelSeverity(item.demoLevel)"
            />
          </div>

          <div class="col-stretch min-w-0 gap-xs">
            <h3 class="text-base font-semibold text-foreground m-0">
              {{ $t(item.titleKey) }}
            </h3>
            <p class="text-sm text-muted-foreground m-0 text-ellipsis-2">
              {{ $t(`${item.localeBaseKey}.description`) }}
            </p>
          </div>

          <div class="row-between min-w-0 gap-sm">
            <Tag
              :value="$t(`showcase.shell.kinds.${item.kind}`)"
              severity="secondary"
            />
            <Icons
              name="i-lucide-arrow-right"
              size="sm"
              class="text-muted-foreground"
            />
          </div>
        </RouterLink>
      </div>
    </article>
  </section>
</template>
