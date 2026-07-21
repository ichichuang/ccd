<script setup lang="ts">
import DashboardLandingShell from './components/DashboardLandingShell.vue'
import { showcaseCatalog } from '@/views/showcase/data/showcaseCatalog'
import type { ShowcaseCatalogItem } from '@/views/showcase/data/types'

defineOptions({ name: 'Dashboard' })

type DashboardPreviewKind = 'table' | 'form' | 'chart' | 'tokens' | 'runtime' | 'governance'

interface DashboardBenefit {
  key: string
  icon: `i-${string}`
  titleKey: `showcase.dashboard.benefits.${string}.title`
  descriptionKey: `showcase.dashboard.benefits.${string}.description`
}

interface DashboardCapabilityCopy {
  id: string
  previewKind: DashboardPreviewKind
  eyebrowKey: `showcase.dashboard.capabilities.${string}.eyebrow`
  titleKey: `showcase.dashboard.capabilities.${string}.title`
  descriptionKey: `showcase.dashboard.capabilities.${string}.description`
  previewKey: `showcase.dashboard.capabilities.${string}.preview`
}

interface DashboardCapabilityLink extends DashboardCapabilityCopy {
  item: ShowcaseCatalogItem
}

interface DashboardPreviewTile {
  key: string
  icon: `i-${string}`
  titleKey: `showcase.dashboard.preview.${string}.title`
  descriptionKey: `showcase.dashboard.preview.${string}.description`
}

interface DashboardStoryStep {
  key: string
  icon: `i-${string}`
  titleKey: `showcase.dashboard.story.${string}.title`
  descriptionKey: `showcase.dashboard.story.${string}.description`
}

const dashboardBenefits: DashboardBenefit[] = [
  {
    key: 'buildingBlocks',
    icon: 'i-lucide-blocks',
    titleKey: 'showcase.dashboard.benefits.buildingBlocks.title',
    descriptionKey: 'showcase.dashboard.benefits.buildingBlocks.description',
  },
  {
    key: 'themes',
    icon: 'i-lucide-palette',
    titleKey: 'showcase.dashboard.benefits.themes.title',
    descriptionKey: 'showcase.dashboard.benefits.themes.description',
  },
  {
    key: 'dataWorkflows',
    icon: 'i-lucide-table-2',
    titleKey: 'showcase.dashboard.benefits.dataWorkflows.title',
    descriptionKey: 'showcase.dashboard.benefits.dataWorkflows.description',
  },
  {
    key: 'guidedInput',
    icon: 'i-lucide-list-checks',
    titleKey: 'showcase.dashboard.benefits.guidedInput.title',
    descriptionKey: 'showcase.dashboard.benefits.guidedInput.description',
  },
  {
    key: 'responsiveUx',
    icon: 'i-lucide-monitor-smartphone',
    titleKey: 'showcase.dashboard.benefits.responsiveUx.title',
    descriptionKey: 'showcase.dashboard.benefits.responsiveUx.description',
  },
  {
    key: 'runtimeSafety',
    icon: 'i-lucide-shield-check',
    titleKey: 'showcase.dashboard.benefits.runtimeSafety.title',
    descriptionKey: 'showcase.dashboard.benefits.runtimeSafety.description',
  },
]

const dashboardCapabilityCopy: DashboardCapabilityCopy[] = [
  {
    id: 'components-pro-table-basic',
    previewKind: 'table',
    eyebrowKey: 'showcase.dashboard.capabilities.dataTables.eyebrow',
    titleKey: 'showcase.dashboard.capabilities.dataTables.title',
    descriptionKey: 'showcase.dashboard.capabilities.dataTables.description',
    previewKey: 'showcase.dashboard.capabilities.dataTables.preview',
  },
  {
    id: 'components-pro-form-validation',
    previewKind: 'form',
    eyebrowKey: 'showcase.dashboard.capabilities.smartForms.eyebrow',
    titleKey: 'showcase.dashboard.capabilities.smartForms.title',
    descriptionKey: 'showcase.dashboard.capabilities.smartForms.description',
    previewKey: 'showcase.dashboard.capabilities.smartForms.preview',
  },
  {
    id: 'components-charts-theme',
    previewKind: 'chart',
    eyebrowKey: 'showcase.dashboard.capabilities.charts.eyebrow',
    titleKey: 'showcase.dashboard.capabilities.charts.title',
    descriptionKey: 'showcase.dashboard.capabilities.charts.description',
    previewKey: 'showcase.dashboard.capabilities.charts.preview',
  },
  {
    id: 'design-tokens',
    previewKind: 'tokens',
    eyebrowKey: 'showcase.dashboard.capabilities.designSystem.eyebrow',
    titleKey: 'showcase.dashboard.capabilities.designSystem.title',
    descriptionKey: 'showcase.dashboard.capabilities.designSystem.description',
    previewKey: 'showcase.dashboard.capabilities.designSystem.preview',
  },
  {
    id: 'runtime-overview',
    previewKind: 'runtime',
    eyebrowKey: 'showcase.dashboard.capabilities.runtime.eyebrow',
    titleKey: 'showcase.dashboard.capabilities.runtime.title',
    descriptionKey: 'showcase.dashboard.capabilities.runtime.description',
    previewKey: 'showcase.dashboard.capabilities.runtime.preview',
  },
  {
    id: 'governance',
    previewKind: 'governance',
    eyebrowKey: 'showcase.dashboard.capabilities.delivery.eyebrow',
    titleKey: 'showcase.dashboard.capabilities.delivery.title',
    descriptionKey: 'showcase.dashboard.capabilities.delivery.description',
    previewKey: 'showcase.dashboard.capabilities.delivery.preview',
  },
]

const dashboardPreviewTiles: DashboardPreviewTile[] = [
  {
    key: 'table',
    icon: 'i-lucide-table-2',
    titleKey: 'showcase.dashboard.preview.table.title',
    descriptionKey: 'showcase.dashboard.preview.table.description',
  },
  {
    key: 'form',
    icon: 'i-lucide-list-checks',
    titleKey: 'showcase.dashboard.preview.form.title',
    descriptionKey: 'showcase.dashboard.preview.form.description',
  },
  {
    key: 'chart',
    icon: 'i-lucide-chart-no-axes-combined',
    titleKey: 'showcase.dashboard.preview.chart.title',
    descriptionKey: 'showcase.dashboard.preview.chart.description',
  },
]

const dashboardStorySteps: DashboardStoryStep[] = [
  {
    key: 'align',
    icon: 'i-lucide-git-branch',
    titleKey: 'showcase.dashboard.story.align.title',
    descriptionKey: 'showcase.dashboard.story.align.description',
  },
  {
    key: 'adapt',
    icon: 'i-lucide-plug',
    titleKey: 'showcase.dashboard.story.adapt.title',
    descriptionKey: 'showcase.dashboard.story.adapt.description',
  },
  {
    key: 'ship',
    icon: 'i-lucide-badge-check',
    titleKey: 'showcase.dashboard.story.ship.title',
    descriptionKey: 'showcase.dashboard.story.ship.description',
  },
]

function getCatalogItem(id: string): ShowcaseCatalogItem | undefined {
  return showcaseCatalog.find(item => item.id === id && item.dashboardLink === true)
}

function isDashboardCapabilityLink(
  value: DashboardCapabilityLink | null
): value is DashboardCapabilityLink {
  return value !== null
}

const dashboardCapabilities = computed<DashboardCapabilityLink[]>(() =>
  dashboardCapabilityCopy
    .map(copy => {
      const item = getCatalogItem(copy.id)
      if (!item) return null
      return {
        ...copy,
        item,
      }
    })
    .filter(isDashboardCapabilityLink)
)
</script>

<template>
  <DashboardLandingShell
    :eyebrow="$t('showcase.dashboard.hero.eyebrow')"
    :title="$t('showcase.dashboard.hero.title')"
    :description="$t('showcase.dashboard.hero.description')"
    :primary-action-label="$t('showcase.dashboard.hero.primaryAction')"
    primary-action-to="/showcase/overview"
    :secondary-action-label="$t('showcase.dashboard.hero.secondaryAction')"
    secondary-action-to="/showcase/governance"
  >
    <section class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="benefit in dashboardBenefits"
        :key="benefit.key"
        class="material-solid col-stretch min-w-0 gap-md p-md"
      >
        <span class="glass-icon-box text-primary">
          <Icons
            :name="benefit.icon"
            size="lg"
          />
        </span>
        <div class="col-stretch min-w-0 gap-xs">
          <h2 class="text-lg font-semibold text-foreground m-0">
            {{ $t(benefit.titleKey) }}
          </h2>
          <p class="text-sm text-muted-foreground m-0">
            {{ $t(benefit.descriptionKey) }}
          </p>
        </div>
      </article>
    </section>

    <section class="material-elevated col-stretch min-w-0 gap-lg">
      <div class="row-between min-w-0 gap-md">
        <div class="col-stretch min-w-0 gap-xs">
          <span class="text-xs font-semibold text-primary">
            {{ $t('showcase.dashboard.capabilities.eyebrow') }}
          </span>
          <h2 class="text-2xl font-semibold text-foreground m-0">
            {{ $t('showcase.dashboard.capabilities.title') }}
          </h2>
          <p class="text-sm text-muted-foreground m-0">
            {{ $t('showcase.dashboard.capabilities.description') }}
          </p>
        </div>
        <Tag
          :value="$t('showcase.dashboard.capabilities.catalogTag')"
          severity="info"
        />
      </div>

      <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-2 xl:grid-cols-3">
        <RouterLink
          v-for="capability in dashboardCapabilities"
          :key="capability.id"
          :to="capability.item.path"
          class="material-solid interactive-card col-stretch min-w-0 gap-md p-md no-underline"
        >
          <div class="row-between min-w-0 gap-md">
            <span class="glass-icon-box text-primary">
              <Icons
                :name="capability.item.icon"
                size="lg"
              />
            </span>
            <Tag
              :value="$t(`showcase.shell.kinds.${capability.item.kind}`)"
              severity="secondary"
            />
          </div>

          <div class="col-stretch min-w-0 gap-xs">
            <span class="text-xs font-semibold text-primary">
              {{ $t(capability.eyebrowKey) }}
            </span>
            <h3 class="text-lg font-semibold text-foreground m-0">
              {{ $t(capability.titleKey) }}
            </h3>
            <p class="text-sm text-muted-foreground m-0">
              {{ $t(capability.descriptionKey) }}
            </p>
          </div>

          <div
            class="dashboard-capability-preview demo-well"
            aria-hidden="true"
          >
            <div
              v-if="capability.previewKind === 'table'"
              class="dashboard-preview-stack"
            >
              <span class="dashboard-preview-line bg-primary-light" />
              <span class="dashboard-preview-line dashboard-preview-line-wide bg-muted" />
              <span class="dashboard-preview-line dashboard-preview-line-mid bg-muted" />
              <span class="dashboard-preview-line dashboard-preview-line-short bg-muted" />
            </div>

            <div
              v-else-if="capability.previewKind === 'form'"
              class="dashboard-preview-stack"
            >
              <span class="dashboard-preview-line bg-muted" />
              <span class="dashboard-preview-line dashboard-preview-line-mid bg-primary-light" />
              <span class="dashboard-preview-line dashboard-preview-line-wide bg-muted" />
              <span class="dashboard-preview-line dashboard-preview-line-short bg-success" />
            </div>

            <div
              v-else-if="capability.previewKind === 'chart'"
              class="dashboard-preview-bars"
            >
              <span class="dashboard-preview-bar dashboard-preview-bar-low bg-primary-light" />
              <span class="dashboard-preview-bar dashboard-preview-bar-mid bg-info" />
              <span class="dashboard-preview-bar dashboard-preview-bar-high bg-success" />
            </div>

            <div
              v-else-if="capability.previewKind === 'tokens'"
              class="dashboard-preview-swatches"
            >
              <span class="dashboard-preview-swatch bg-primary" />
              <span class="dashboard-preview-swatch bg-info" />
              <span class="dashboard-preview-swatch bg-success" />
              <span class="dashboard-preview-swatch bg-warn" />
            </div>

            <div
              v-else-if="capability.previewKind === 'runtime'"
              class="dashboard-preview-flow"
            >
              <span class="glass-capsule text-xs text-foreground">UI</span>
              <span class="dashboard-preview-connector bg-muted" />
              <span class="glass-capsule text-xs text-foreground">API</span>
              <span class="dashboard-preview-connector bg-muted" />
              <span class="glass-capsule text-xs text-foreground">App</span>
            </div>

            <div
              v-else
              class="dashboard-preview-stack"
            >
              <span class="dashboard-preview-line bg-success" />
              <span class="dashboard-preview-line dashboard-preview-line-wide bg-muted" />
              <span class="dashboard-preview-line dashboard-preview-line-mid bg-muted" />
              <span class="dashboard-preview-line dashboard-preview-line-short bg-primary-light" />
            </div>
          </div>

          <div class="row-between min-w-0 gap-sm">
            <span class="text-sm text-primary">{{ $t(capability.previewKey) }}</span>
            <Icons
              name="i-lucide-arrow-right"
              size="sm"
              class="text-primary"
            />
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
      <article
        v-for="tile in dashboardPreviewTiles"
        :key="tile.key"
        class="material-solid col-stretch min-w-0 gap-md p-md"
      >
        <div class="row-start min-w-0 gap-md">
          <span class="glass-icon-box text-primary">
            <Icons
              :name="tile.icon"
              size="md"
            />
          </span>
          <div class="col-stretch min-w-0 gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              {{ $t(tile.titleKey) }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ $t(tile.descriptionKey) }}
            </p>
          </div>
        </div>
      </article>
    </section>

    <section class="material-elevated col-stretch min-w-0 gap-lg">
      <div class="col-stretch min-w-0 gap-xs">
        <span class="text-xs font-semibold text-primary">
          {{ $t('showcase.dashboard.story.eyebrow') }}
        </span>
        <h2 class="text-2xl font-semibold text-foreground m-0">
          {{ $t('showcase.dashboard.story.title') }}
        </h2>
        <p class="text-sm text-muted-foreground m-0">
          {{ $t('showcase.dashboard.story.description') }}
        </p>
      </div>

      <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
        <article
          v-for="step in dashboardStorySteps"
          :key="step.key"
          class="demo-well col-stretch min-w-0 gap-md"
        >
          <span class="glass-icon-box text-primary">
            <Icons
              :name="step.icon"
              size="md"
            />
          </span>
          <div class="col-stretch min-w-0 gap-xs">
            <h3 class="text-lg font-semibold text-foreground m-0">
              {{ $t(step.titleKey) }}
            </h3>
            <p class="text-sm text-muted-foreground m-0">
              {{ $t(step.descriptionKey) }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </DashboardLandingShell>
</template>

<style scoped>
.dashboard-capability-preview {
  display: flex;
  min-width: 0;
  min-height: 22vh;
  align-items: center;
  justify-content: center;
}

.dashboard-preview-stack {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: var(--spacing-sm);
}

.dashboard-preview-line {
  display: block;
  width: 100%;
  height: var(--spacing-md);
  border-radius: var(--radius-sm);
}

.dashboard-preview-line-wide {
  width: 82%;
}

.dashboard-preview-line-mid {
  width: 64%;
}

.dashboard-preview-line-short {
  width: 46%;
}

.dashboard-preview-bars,
.dashboard-preview-swatches,
.dashboard-preview-flow {
  display: flex;
  width: 100%;
  min-width: 0;
  gap: var(--spacing-sm);
  align-items: flex-end;
  justify-content: center;
}

.dashboard-preview-bar {
  display: block;
  width: 24%;
  border-radius: var(--radius-sm);
}

.dashboard-preview-bar-low {
  height: calc(var(--spacing-xl) * 2);
}

.dashboard-preview-bar-mid {
  height: calc(var(--spacing-xl) * 3);
}

.dashboard-preview-bar-high {
  height: calc(var(--spacing-xl) * 4);
}

.dashboard-preview-swatch {
  display: block;
  width: 22%;
  height: calc(var(--spacing-xl) * 3);
  border-radius: var(--radius-md);
}

.dashboard-preview-flow {
  align-items: center;
}

.dashboard-preview-connector {
  display: block;
  width: 12%;
  height: var(--spacing-xs);
}
</style>
