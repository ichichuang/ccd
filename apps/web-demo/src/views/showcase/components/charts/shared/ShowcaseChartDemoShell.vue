<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  createShowcaseChartOption,
  type ShowcaseChartDemoKind,
} from '../../../data/showcaseChartOptions'
import {
  getRemainingShowcaseContent,
  getRemainingShowcaseItem,
  type RemainingShowcaseId,
} from '../../../data/showcaseDemoContent'
import ShowcaseCard from '../../../shared/ShowcaseCard.vue'
import ShowcaseDemoPanel from '../../../shared/ShowcaseDemoPanel.vue'
import ShowcaseEmptyState from '../../../shared/ShowcaseEmptyState.vue'
import ShowcaseEvidencePanel from '../../../shared/ShowcaseEvidencePanel.vue'
import ShowcaseHero from '../../../shared/ShowcaseHero.vue'
import ShowcaseRelatedLinks from '../../../shared/ShowcaseRelatedLinks.vue'
import ShowcaseSection from '../../../shared/ShowcaseSection.vue'
import ShowcaseSourceLinks from '../../../shared/ShowcaseSourceLinks.vue'
import ShowcaseToolbar from '../../../shared/ShowcaseToolbar.vue'

defineOptions({ name: 'ShowcaseChartDemoShell' })

const props = defineProps<{
  id: RemainingShowcaseId
}>()

const { t } = useI18n()
const compact = ref(false)
const loading = ref(false)
const readyCount = ref(0)
const finishedCount = ref(0)

const item = computed(() => getRemainingShowcaseItem(props.id))
const content = computed(() => getRemainingShowcaseContent(props.id))
const chartKind = computed<ShowcaseChartDemoKind>(() => {
  const value = content.value.demoKind.replace('chart-', '')

  if (
    value === 'dashboard-preview' ||
    value === 'events' ||
    value === 'overview' ||
    value === 'responsive' ||
    value === 'states' ||
    value === 'theme'
  ) {
    return value
  }

  return 'overview'
})
const option = computed(() => createShowcaseChartOption(chartKind.value))
const chartEvents = computed(() => ({
  finished: recordFinished,
}))
const isResponsiveDemo = computed(() => chartKind.value === 'responsive')
const isStateDemo = computed(() => chartKind.value === 'states')
const isEventDemo = computed(() => chartKind.value === 'events')
const demoDescription = computed(() =>
  t(`showcase.remaining.demos.${content.value.demoKind}.description`)
)
const chartNote = computed(() => t(`showcase.remaining.chart.${chartKind.value}.note`))
const chartRegionLabel = computed(() =>
  t('showcase.remaining.chart.regionLabel', {
    title: t(item.value.titleKey),
  })
)
const shellSourcePaths = computed(() => [
  `apps/web-demo/src/views/showcase/components/charts/${chartKind.value}/index.vue`,
  'apps/web-demo/src/views/showcase/components/charts/shared/ShowcaseChartDemoShell.vue',
  ...item.value.sourcePaths,
])
const wrapperEvidencePaths = [
  'apps/web-demo/src/adapters/charts/UseEcharts.vue',
  'apps/web-demo/src/views/showcase/data/showcaseChartOptions.ts',
  'packages/vue-charts/src/UseEcharts/UseEcharts.vue',
] as const

function recordReady(): void {
  readyCount.value += 1
}

function recordFinished(): void {
  finishedCount.value += 1
}
</script>

<template>
  <article
    class="col-stretch min-w-0 gap-lg"
    data-testid="showcase-chart-shell"
  >
    <ShowcaseHero
      :eyebrow="$t(`${item.localeBaseKey}.eyebrow`)"
      :title="$t(`${item.localeBaseKey}.title`)"
      :description="$t(`${item.localeBaseKey}.description`)"
      :icon="item.icon"
    />

    <ShowcaseDemoPanel
      :title="$t(`${item.localeBaseKey}.try`)"
      :description="demoDescription"
    >
      <ShowcaseToolbar
        :title="$t('showcase.remaining.chart.controlsTitle')"
        :description="$t('showcase.remaining.chart.controlsDescription')"
        :summary="chartNote"
      >
        <template #actions>
          <Tag
            :value="$t('showcase.remaining.chart.wrapperDriven')"
            severity="info"
          />
          <Tag
            v-if="isEventDemo"
            :value="$t('showcase.remaining.chart.readyCount', { count: readyCount })"
            severity="success"
          />
          <Tag
            v-if="isEventDemo"
            :value="$t('showcase.remaining.chart.finishedCount', { count: finishedCount })"
            severity="secondary"
          />
        </template>

        <div
          v-if="isResponsiveDemo || isStateDemo"
          class="row-start min-w-0 gap-sm flex-wrap"
          role="group"
          :aria-label="$t('showcase.remaining.chart.controlsTitle')"
        >
          <ToggleSwitch
            v-if="isResponsiveDemo"
            v-model="compact"
            input-id="showcase-chart-compact-width"
          />
          <label
            v-if="isResponsiveDemo"
            for="showcase-chart-compact-width"
            class="text-sm text-muted-foreground"
          >
            {{ $t('showcase.remaining.chart.compactWidth') }}
          </label>
          <ToggleSwitch
            v-if="isStateDemo"
            v-model="loading"
            input-id="showcase-chart-loading-state"
          />
          <label
            v-if="isStateDemo"
            for="showcase-chart-loading-state"
            class="text-sm text-muted-foreground"
          >
            {{ $t('showcase.remaining.chart.loading') }}
          </label>
        </div>
      </ShowcaseToolbar>

      <section
        class="showcase-chart-stage demo-stage min-w-0"
        :class="{ 'showcase-chart-stage--compact': compact }"
        :aria-label="chartRegionLabel"
        data-testid="showcase-chart-region"
      >
        <UseEcharts
          :option="option"
          :loading="loading"
          :on-events="chartEvents"
          @chart-ready="recordReady"
        />
      </section>
    </ShowcaseDemoPanel>

    <ShowcaseSection
      :title="$t('showcase.remaining.chart.readinessTitle')"
      :description="$t('showcase.remaining.chart.readinessDescription')"
      icon="i-lucide-activity"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
        <ShowcaseCard
          icon="i-lucide-sliders-horizontal"
          :title="$t('showcase.remaining.chart.optionTitle')"
          :description="$t('showcase.remaining.chart.optionDescription')"
          :tag="$t(`showcase.remaining.chart.kind.${chartKind}`)"
        >
          <ul class="col-stretch gap-xs m-0 p-0 list-none">
            <li class="row-between min-w-0 gap-sm">
              <span class="text-sm text-muted-foreground">
                {{ $t('showcase.remaining.chart.optionRoute') }}
              </span>
              <code class="code-inline min-w-0 break-all text-right">
                {{ item.path }}
              </code>
            </li>
            <li class="row-between min-w-0 gap-sm">
              <span class="text-sm text-muted-foreground">
                {{ $t('showcase.remaining.chart.optionSource') }}
              </span>
              <code class="code-inline min-w-0 break-all text-right">showcaseChartOptions.ts</code>
            </li>
          </ul>
        </ShowcaseCard>

        <ShowcaseCard
          icon="i-lucide-radio"
          :title="$t('showcase.remaining.chart.wrapperStateTitle')"
          :description="$t('showcase.remaining.chart.wrapperStateDescription')"
          :tag="$t('showcase.remaining.chart.wrapperDriven')"
          tag-severity="success"
        >
          <div class="row-start min-w-0 gap-sm flex-wrap">
            <Tag
              :value="$t('showcase.remaining.chart.readyCount', { count: readyCount })"
              severity="success"
            />
            <Tag
              :value="$t('showcase.remaining.chart.finishedCount', { count: finishedCount })"
              severity="secondary"
            />
            <Tag
              v-if="isStateDemo && loading"
              :value="$t('showcase.remaining.chart.loading')"
              severity="warn"
            />
          </div>

          <ShowcaseEmptyState
            v-if="isEventDemo && readyCount === 0 && finishedCount === 0"
            icon="i-lucide-radio"
            :title="$t('showcase.remaining.chart.eventsEmptyTitle')"
            :description="$t('showcase.remaining.chart.eventsEmptyDescription')"
          />
        </ShowcaseCard>
      </div>
    </ShowcaseSection>

    <ShowcaseSection
      :title="$t('showcase.remaining.chart.evidenceTitle')"
      :description="$t('showcase.remaining.chart.evidenceDescription')"
      icon="i-lucide-folder-code"
      data-testid="showcase-chart-source-area"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
        <ShowcaseSourceLinks :source-paths="shellSourcePaths" />
        <ShowcaseEvidencePanel
          :title="$t('showcase.remaining.chart.wrapperEvidenceTitle')"
          :description="$t('showcase.remaining.chart.wrapperEvidenceDescription')"
          :empty-text="$t('showcase.shell.source.empty')"
          :source-paths="wrapperEvidencePaths"
        />
      </div>
    </ShowcaseSection>

    <ShowcaseRelatedLinks
      :item="item"
      :related-ids="item.relatedIds"
    />
  </article>
</template>

<style scoped>
.showcase-chart-stage {
  height: 44vh;
  min-height: 320px;
  max-height: 560px;
}

@media (width >= 768px) {
  .showcase-chart-stage--compact {
    max-width: 72%;
  }
}
</style>
