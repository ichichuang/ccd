<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  createDateUtilsPreviewRows,
  createSafeStoragePreviewRows,
  createStatePersistencePreviewRows,
  type UtilityPreviewRow,
} from '../../data/showcaseUtilityDemos'
import ShowcaseCard from '../ShowcaseCard.vue'
import ShowcaseEmptyState from '../ShowcaseEmptyState.vue'
import ShowcaseSection from '../ShowcaseSection.vue'
import ShowcaseToolbar from '../ShowcaseToolbar.vue'

defineOptions({ name: 'ShowcaseUtilityDemo' })

type UtilityDemoKind = 'date' | 'overview' | 'safe-storage' | 'state-persistence'
type UtilityActionStatus = 'ready' | 'rerun' | 'reset'
type UtilitySampleKey = 'primary' | 'secondary' | 'tertiary'

interface UtilityDemoConfig {
  icon: `i-${string}`
  outputIcon: `i-${string}`
}

interface UtilitySampleRow {
  key: UtilitySampleKey
  labelKey: `showcase.remaining.utils.${string}`
  valueKey: `showcase.remaining.utils.${string}`
}

const props = defineProps<{
  kind: string
}>()

const { t } = useI18n()
const dateUtils = useDateUtils()

const utilityDemoKinds: readonly UtilityDemoKind[] = [
  'date',
  'overview',
  'safe-storage',
  'state-persistence',
]

const utilityConfigs: Record<UtilityDemoKind, UtilityDemoConfig> = {
  overview: {
    icon: 'i-lucide-wrench',
    outputIcon: 'i-lucide-list-checks',
  },
  date: {
    icon: 'i-lucide-calendar-clock',
    outputIcon: 'i-lucide-clock-3',
  },
  'safe-storage': {
    icon: 'i-lucide-lock-keyhole',
    outputIcon: 'i-lucide-shield-check',
  },
  'state-persistence': {
    icon: 'i-lucide-database',
    outputIcon: 'i-lucide-save',
  },
}

const sampleRowsByUtility: Record<UtilityDemoKind, readonly UtilitySampleRow[]> = {
  overview: [
    {
      key: 'primary',
      labelKey: 'showcase.remaining.utils.overview.samplePrimaryLabel',
      valueKey: 'showcase.remaining.utils.overview.samplePrimaryValue',
    },
    {
      key: 'secondary',
      labelKey: 'showcase.remaining.utils.overview.sampleSecondaryLabel',
      valueKey: 'showcase.remaining.utils.overview.sampleSecondaryValue',
    },
    {
      key: 'tertiary',
      labelKey: 'showcase.remaining.utils.overview.sampleTertiaryLabel',
      valueKey: 'showcase.remaining.utils.overview.sampleTertiaryValue',
    },
  ],
  date: [
    {
      key: 'primary',
      labelKey: 'showcase.remaining.utils.date.samplePrimaryLabel',
      valueKey: 'showcase.remaining.utils.date.samplePrimaryValue',
    },
    {
      key: 'secondary',
      labelKey: 'showcase.remaining.utils.date.sampleSecondaryLabel',
      valueKey: 'showcase.remaining.utils.date.sampleSecondaryValue',
    },
    {
      key: 'tertiary',
      labelKey: 'showcase.remaining.utils.date.sampleTertiaryLabel',
      valueKey: 'showcase.remaining.utils.date.sampleTertiaryValue',
    },
  ],
  'safe-storage': [
    {
      key: 'primary',
      labelKey: 'showcase.remaining.utils.safe-storage.samplePrimaryLabel',
      valueKey: 'showcase.remaining.utils.safe-storage.samplePrimaryValue',
    },
    {
      key: 'secondary',
      labelKey: 'showcase.remaining.utils.safe-storage.sampleSecondaryLabel',
      valueKey: 'showcase.remaining.utils.safe-storage.sampleSecondaryValue',
    },
    {
      key: 'tertiary',
      labelKey: 'showcase.remaining.utils.safe-storage.sampleTertiaryLabel',
      valueKey: 'showcase.remaining.utils.safe-storage.sampleTertiaryValue',
    },
  ],
  'state-persistence': [
    {
      key: 'primary',
      labelKey: 'showcase.remaining.utils.state-persistence.samplePrimaryLabel',
      valueKey: 'showcase.remaining.utils.state-persistence.samplePrimaryValue',
    },
    {
      key: 'secondary',
      labelKey: 'showcase.remaining.utils.state-persistence.sampleSecondaryLabel',
      valueKey: 'showcase.remaining.utils.state-persistence.sampleSecondaryValue',
    },
    {
      key: 'tertiary',
      labelKey: 'showcase.remaining.utils.state-persistence.sampleTertiaryLabel',
      valueKey: 'showcase.remaining.utils.state-persistence.sampleTertiaryValue',
    },
  ],
}

const actionButtonPt = {
  root: {
    class:
      'ring-focus-focus focus:!outline-solid focus:!outline-2 focus:!outline-ring focus:!outline-offset-2',
  },
}

const runCount = ref(1)
const actionStatus = ref<UtilityActionStatus>('ready')

const currentUtility = computed<UtilityDemoKind>(() => {
  const candidate = props.kind.replace('utils-', '')
  return isUtilityDemoKind(candidate) ? candidate : 'date'
})

const currentConfig = computed(() => utilityConfigs[currentUtility.value])
const currentUtilityBadge = computed(() =>
  t(`showcase.remaining.utils.badges.${currentUtility.value}`)
)

const rows = computed<UtilityPreviewRow[]>(() => {
  if (currentUtility.value === 'safe-storage') return createSafeStoragePreviewRows()
  if (currentUtility.value === 'state-persistence') return createStatePersistencePreviewRows()
  return createDateUtilsPreviewRows()
})

const sampleRows = computed<readonly UtilitySampleRow[]>(
  () => sampleRowsByUtility[currentUtility.value]
)

const hookRows = computed<UtilityPreviewRow[]>(() => [
  {
    key: 'initialized',
    labelKey: 'showcase.remaining.utils.initialized',
    value: dateUtils.isInitialized.value
      ? t('showcase.remaining.utils.boolean.yes')
      : t('showcase.remaining.utils.boolean.no'),
  },
  {
    key: 'locale',
    labelKey: 'showcase.remaining.utils.locale',
    value: dateUtils.currentLocale.value,
  },
  {
    key: 'timezone',
    labelKey: 'showcase.remaining.utils.timezone',
    value: dateUtils.currentTimezone.value,
  },
])

function isUtilityDemoKind(value: string): value is UtilityDemoKind {
  return utilityDemoKinds.some(kind => kind === value)
}

function rerunSample(): void {
  runCount.value += 1
  actionStatus.value = 'rerun'
}

function resetSample(): void {
  runCount.value = 1
  actionStatus.value = 'reset'
}
</script>

<template>
  <section
    class="col-stretch min-w-0 gap-lg"
    data-testid="showcase-utils-demo"
  >
    <ShowcaseToolbar
      :title="$t('showcase.remaining.utils.toolbarTitle')"
      :description="$t('showcase.remaining.utils.toolbarDescription')"
      :summary="$t(`showcase.remaining.utils.${currentUtility}.description`)"
      data-testid="showcase-utils-action-toolbar"
    >
      <template #actions>
        <Button
          :label="$t('showcase.remaining.utils.runSample')"
          icon="i-lucide-play"
          severity="primary"
          :pt="actionButtonPt"
          data-testid="showcase-utils-run-sample"
          @click="rerunSample"
        />
        <Button
          :label="$t('showcase.remaining.utils.resetSample')"
          icon="i-lucide-rotate-ccw"
          severity="secondary"
          outlined
          :pt="actionButtonPt"
          data-testid="showcase-utils-reset-sample"
          @click="resetSample"
        />
        <Tag
          :value="currentUtilityBadge"
          severity="info"
        />
      </template>

      <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-2">
        <div class="demo-well row-between min-w-0 gap-sm">
          <span class="text-sm text-muted-foreground">
            {{ $t('showcase.remaining.utils.runCount') }}
          </span>
          <strong
            class="code-inline m-0 min-w-0 text-sm font-semibold text-foreground"
            data-testid="showcase-utils-run-count"
          >
            {{ runCount }}
          </strong>
        </div>
        <div class="demo-well row-between min-w-0 gap-sm">
          <span class="text-sm text-muted-foreground">
            {{ $t('showcase.remaining.utils.lastAction') }}
          </span>
          <strong
            class="code-inline m-0 min-w-0 break-words text-right text-sm font-semibold text-foreground"
            data-testid="showcase-utils-last-action"
          >
            {{ $t(`showcase.remaining.utils.actionStatus.${actionStatus}`) }}
          </strong>
        </div>
      </div>
    </ShowcaseToolbar>

    <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
      <ShowcaseCard
        :icon="currentConfig.icon"
        :title="$t('showcase.remaining.utils.sampleTitle')"
        :description="$t('showcase.remaining.utils.sampleDescription')"
        :tag="currentUtilityBadge"
        data-testid="showcase-utils-sample-panel"
      >
        <dl class="grid min-w-0 grid-cols-1 gap-sm">
          <div
            v-for="sample in sampleRows"
            :key="sample.key"
            class="demo-well col-stretch min-w-0 gap-xs"
          >
            <dt class="text-sm text-muted-foreground">
              {{ $t(sample.labelKey) }}
            </dt>
            <dd class="code-inline m-0 min-w-0 break-all text-sm font-semibold text-foreground">
              {{ $t(sample.valueKey) }}
            </dd>
          </div>
        </dl>
      </ShowcaseCard>

      <ShowcaseCard
        :icon="currentConfig.outputIcon"
        :title="$t('showcase.remaining.utils.outputTitle')"
        :description="$t('showcase.remaining.utils.outputDescription')"
        data-testid="showcase-utils-output-panel"
      >
        <dl
          v-if="rows.length"
          class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-3 xl:grid-cols-1"
          aria-live="polite"
        >
          <div
            v-for="row in rows"
            :key="row.key"
            class="demo-well col-stretch min-w-0 gap-xs"
          >
            <dt class="text-sm text-muted-foreground">
              {{ $t(row.labelKey) }}
            </dt>
            <dd
              class="code-inline m-0 min-w-0 break-all text-sm font-semibold text-foreground"
              :data-testid="`showcase-utils-output-${row.key}`"
            >
              {{ row.value }}
            </dd>
          </div>
        </dl>

        <ShowcaseEmptyState
          v-else
          icon="i-lucide-list-x"
          :title="$t('showcase.remaining.utils.outputEmptyTitle')"
          :description="$t('showcase.remaining.utils.outputEmptyDescription')"
          data-testid="showcase-utils-output-empty"
        />
      </ShowcaseCard>
    </div>

    <ShowcaseCard
      v-if="currentUtility === 'date' || currentUtility === 'overview'"
      icon="i-lucide-globe-2"
      :title="$t('showcase.remaining.utils.runtimeTitle')"
      :description="$t('showcase.remaining.utils.runtimeDescription')"
      data-testid="showcase-utils-runtime-panel"
    >
      <dl class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-3">
        <div
          v-for="row in hookRows"
          :key="row.key"
          class="demo-well col-stretch min-w-0 gap-xs"
        >
          <dt class="text-sm text-muted-foreground">
            {{ $t(row.labelKey) }}
          </dt>
          <dd
            class="code-inline m-0 min-w-0 break-all text-sm font-semibold text-foreground"
            :data-testid="`showcase-utils-runtime-${row.key}`"
          >
            {{ row.value }}
          </dd>
        </div>
      </dl>
    </ShowcaseCard>

    <ShowcaseSection
      :title="$t('showcase.remaining.utils.contractTitle')"
      :description="$t('showcase.remaining.utils.contractDescription')"
      icon="i-lucide-badge-check"
      data-testid="showcase-utils-contract"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
        <ShowcaseCard
          icon="i-lucide-braces"
          :title="$t('showcase.remaining.utils.contractUtilityTitle')"
          :description="$t('showcase.remaining.utils.contractUtilityDescription')"
          :tag="$t('showcase.remaining.tags.technical')"
        />
        <ShowcaseCard
          icon="i-lucide-route"
          :title="$t('showcase.remaining.utils.contractRuntimeTitle')"
          :description="$t('showcase.remaining.utils.contractRuntimeDescription')"
          :tag="$t('showcase.remaining.tags.technical')"
        />
        <ShowcaseCard
          icon="i-lucide-folder-code"
          :title="$t('showcase.remaining.utils.contractEvidenceTitle')"
          :description="$t('showcase.remaining.utils.contractEvidenceDescription')"
          :tag="$t('showcase.remaining.tags.technical')"
        />
      </div>
    </ShowcaseSection>

    <p class="text-sm text-muted-foreground m-0">
      {{ $t(`showcase.remaining.utils.${currentUtility}.note`) }}
    </p>
  </section>
</template>
