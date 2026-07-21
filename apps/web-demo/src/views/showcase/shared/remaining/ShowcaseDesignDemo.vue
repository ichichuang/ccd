<script setup lang="ts">
import ShowcaseCard from '../ShowcaseCard.vue'
import ShowcaseEmptyState from '../ShowcaseEmptyState.vue'
import ShowcaseSection from '../ShowcaseSection.vue'
import ShowcaseSourceLinks from '../ShowcaseSourceLinks.vue'
import ShowcaseToolbar from '../ShowcaseToolbar.vue'

type DesignActionStatus = 'ready' | 'reset' | 'sampled'
type DesignContractKey = 'evidence' | 'runtime' | 'tokens'
type DesignDemoKind = 'density' | 'material' | 'motion' | 'tokens' | 'unocss'
type DesignPreviewKey =
  | 'border'
  | 'comfortable'
  | 'compact'
  | 'elevated'
  | 'focus'
  | 'info'
  | 'loose'
  | 'micro'
  | 'panel'
  | 'primary'
  | 'reduced'
  | 'solid'
  | 'stable'
  | 'success'
  | 'shortcut'
  | 'warn'
type DesignResultKey =
  | 'activeRoute'
  | 'breakpoint'
  | 'densityMode'
  | 'deviceType'
  | 'themeMode'
  | 'transitionMode'

interface DesignConfig {
  evidencePaths: readonly string[]
  icon: `i-${string}`
  previewKeys: readonly DesignPreviewKey[]
  resultIcon: `i-${string}`
  resultKeys: readonly DesignResultKey[]
}

interface DesignContractCard {
  icon: `i-${string}`
  key: DesignContractKey
}

interface DesignPreviewRow {
  icon: `i-${string}`
  key: DesignPreviewKey
}

interface DesignResultRow {
  key: DesignResultKey
  labelKey: `showcase.remaining.design.results.${DesignResultKey}`
  value: string
}

defineOptions({ name: 'ShowcaseDesignDemo' })

const props = defineProps<{
  kind: string
}>()

const theme = useThemeSwitch()
const sizeStore = useSizeStore()
const layout = useLayoutRuntime()

const designDemoSourcePath =
  'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseDesignDemo.vue'

const designKinds: readonly DesignDemoKind[] = ['tokens', 'unocss', 'material', 'density', 'motion']

const designConfigs = {
  tokens: {
    icon: 'i-lucide-swatch-book',
    resultIcon: 'i-lucide-palette',
    previewKeys: ['primary', 'success', 'warn', 'info'],
    resultKeys: ['themeMode', 'densityMode', 'transitionMode', 'activeRoute'],
    evidencePaths: [
      'apps/web-demo/src/views/showcase/design/tokens/index.vue',
      'packages/design-tokens/src/**',
    ],
  },
  unocss: {
    icon: 'i-lucide-diamond',
    resultIcon: 'i-lucide-braces',
    previewKeys: ['shortcut', 'border', 'focus', 'primary'],
    resultKeys: ['densityMode', 'breakpoint', 'deviceType', 'activeRoute'],
    evidencePaths: [
      'apps/web-demo/src/views/showcase/design/unocss/index.vue',
      'packages/unocss-preset/src/shortcuts/semanticShortcuts.ts',
    ],
  },
  material: {
    icon: 'i-lucide-layers-3',
    resultIcon: 'i-lucide-panels-top-left',
    previewKeys: ['solid', 'elevated', 'panel'],
    resultKeys: ['themeMode', 'densityMode', 'breakpoint', 'activeRoute'],
    evidencePaths: [
      'apps/web-demo/src/views/showcase/design/material/index.vue',
      'packages/unocss-preset/src/shortcuts/semanticShortcuts.ts',
    ],
  },
  density: {
    icon: 'i-lucide-ruler',
    resultIcon: 'i-lucide-scan-line',
    previewKeys: ['compact', 'comfortable', 'loose'],
    resultKeys: ['densityMode', 'breakpoint', 'deviceType', 'activeRoute'],
    evidencePaths: [
      'apps/web-demo/src/views/showcase/design/density/index.vue',
      'packages/design-tokens/src/size.ts',
    ],
  },
  motion: {
    icon: 'i-lucide-move-3d',
    resultIcon: 'i-lucide-activity',
    previewKeys: ['micro', 'reduced', 'stable'],
    resultKeys: ['transitionMode', 'themeMode', 'densityMode', 'activeRoute'],
    evidencePaths: [
      'apps/web-demo/src/views/showcase/design/motion/index.vue',
      'apps/web-demo/src/plugins/animation/**',
    ],
  },
} satisfies Record<DesignDemoKind, DesignConfig>

const previewRows = {
  border: { key: 'border', icon: 'i-lucide-square-dashed' },
  comfortable: { key: 'comfortable', icon: 'i-lucide-between-horizontal-end' },
  compact: { key: 'compact', icon: 'i-lucide-minimize-2' },
  elevated: { key: 'elevated', icon: 'i-lucide-square-stack' },
  focus: { key: 'focus', icon: 'i-lucide-focus' },
  info: { key: 'info', icon: 'i-lucide-info' },
  loose: { key: 'loose', icon: 'i-lucide-maximize-2' },
  micro: { key: 'micro', icon: 'i-lucide-mouse-pointer-click' },
  panel: { key: 'panel', icon: 'i-lucide-panel-top' },
  primary: { key: 'primary', icon: 'i-lucide-sparkles' },
  reduced: { key: 'reduced', icon: 'i-lucide-eye-off' },
  shortcut: { key: 'shortcut', icon: 'i-lucide-blocks' },
  solid: { key: 'solid', icon: 'i-lucide-square' },
  stable: { key: 'stable', icon: 'i-lucide-badge-check' },
  success: { key: 'success', icon: 'i-lucide-circle-check' },
  warn: { key: 'warn', icon: 'i-lucide-triangle-alert' },
} satisfies Record<DesignPreviewKey, DesignPreviewRow>

const designResultLabelKeys = {
  activeRoute: 'showcase.remaining.design.results.activeRoute',
  breakpoint: 'showcase.remaining.design.results.breakpoint',
  densityMode: 'showcase.remaining.design.results.densityMode',
  deviceType: 'showcase.remaining.design.results.deviceType',
  themeMode: 'showcase.remaining.design.results.themeMode',
  transitionMode: 'showcase.remaining.design.results.transitionMode',
} satisfies Record<DesignResultKey, `showcase.remaining.design.results.${DesignResultKey}`>

const contractCards: readonly DesignContractCard[] = [
  { key: 'tokens', icon: 'i-lucide-swatch-book' },
  { key: 'runtime', icon: 'i-lucide-route' },
  { key: 'evidence', icon: 'i-lucide-folder-code' },
]

const actionButtonPt = {
  root: {
    class:
      'ring-focus-focus focus:!outline-solid focus:!outline-2 focus:!outline-ring focus:!outline-offset-2',
  },
}

const runCount = ref(1)
const actionStatus = ref<DesignActionStatus>('ready')
const selectedPreviewIndex = ref(0)

const currentDesign = computed<DesignDemoKind>(() => {
  const candidate = props.kind.replace('design-', '')
  return isDesignDemoKind(candidate) ? candidate : 'tokens'
})

const currentConfig = computed(() => designConfigs[currentDesign.value])
const currentBadgeKey = computed(
  () => `showcase.remaining.design.badges.${currentDesign.value}` as const
)
const currentSummaryKey = computed(
  () => `showcase.remaining.design.summary.${currentDesign.value}` as const
)
const currentNoteKey = computed(
  () => `showcase.remaining.design.notes.${currentDesign.value}` as const
)

const currentPreviewRows = computed<readonly DesignPreviewRow[]>(() =>
  currentConfig.value.previewKeys.map(key => previewRows[key])
)

const activePreview = computed<DesignPreviewRow>(() => {
  const rows = currentPreviewRows.value
  return rows[selectedPreviewIndex.value % rows.length] ?? rows[0] ?? previewRows.primary
})

const resultRows = computed<DesignResultRow[]>(() =>
  currentConfig.value.resultKeys.map(key => ({
    key,
    labelKey: designResultLabelKeys[key],
    value: resolveResultValue(key),
  }))
)

const sourcePaths = computed<readonly string[]>(() => [
  designDemoSourcePath,
  ...currentConfig.value.evidencePaths,
])

function isDesignDemoKind(value: string): value is DesignDemoKind {
  return designKinds.some(kind => kind === value)
}

function resolveResultValue(key: DesignResultKey): string {
  if (key === 'activeRoute') return `/showcase/design/${currentDesign.value}`
  if (key === 'breakpoint') return layout.breakpoint.value
  if (key === 'densityMode') return sizeStore.sizeName
  if (key === 'deviceType') return layout.deviceType.value
  if (key === 'themeMode') return theme.mode.value
  return theme.transitionMode.value
}

function getPreviewRowClass(key: DesignPreviewKey): Record<string, boolean> {
  const isTokenSurface = ['info', 'primary', 'success', 'warn'].includes(key)
  const isDefaultWell = ['border', 'focus', 'micro', 'reduced', 'shortcut', 'stable'].includes(key)

  return {
    'demo-well': isDefaultWell || key === 'compact' || key === 'comfortable' || key === 'loose',
    'gap-md': key === 'loose',
    'gap-sm':
      isDefaultWell ||
      isTokenSurface ||
      key === 'comfortable' ||
      key === 'elevated' ||
      key === 'panel' ||
      key === 'solid',
    'gap-xs': key === 'compact',
    'glass-panel': key === 'panel',
    'material-elevated': key === 'elevated',
    'material-solid': key === 'solid',
    'p-lg': key === 'loose',
    'p-md':
      isDefaultWell ||
      isTokenSurface ||
      key === 'comfortable' ||
      key === 'elevated' ||
      key === 'panel' ||
      key === 'solid',
    'p-sm': key === 'compact',
    'surface-info': key === 'info',
    'surface-primary': key === 'primary',
    'surface-success': key === 'success',
    'surface-warn': key === 'warn',
  }
}

function inspectSample(): void {
  runCount.value += 1
  actionStatus.value = 'sampled'
  selectedPreviewIndex.value = (selectedPreviewIndex.value + 1) % currentPreviewRows.value.length
}

function resetSample(): void {
  runCount.value = 1
  actionStatus.value = 'reset'
  selectedPreviewIndex.value = 0
}
</script>

<template>
  <section
    class="col-stretch min-w-0 gap-lg"
  >
    <ShowcaseToolbar
      :title="$t('showcase.remaining.design.toolbarTitle')"
      :description="$t('showcase.remaining.design.toolbarDescription')"
      :summary="$t(currentSummaryKey)"
    >
      <template #actions>
        <Button
          :label="$t('showcase.remaining.design.inspectSample')"
          icon="i-lucide-scan-search"
          severity="primary"
          :pt="actionButtonPt"
          @click="inspectSample"
        />
        <Button
          :label="$t('showcase.remaining.design.resetSample')"
          icon="i-lucide-rotate-ccw"
          severity="secondary"
          outlined
          :pt="actionButtonPt"
          @click="resetSample"
        />
        <Tag
          :value="$t(currentBadgeKey)"
          severity="info"
        />
      </template>

      <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-3">
        <div class="demo-well row-between min-w-0 gap-sm">
          <span class="text-sm text-muted-foreground">
            {{ $t('showcase.remaining.design.runCount') }}
          </span>
          <strong
            class="code-inline m-0 min-w-0 text-sm font-semibold text-foreground"
          >
            {{ runCount }}
          </strong>
        </div>
        <div class="demo-well row-between min-w-0 gap-sm">
          <span class="text-sm text-muted-foreground">
            {{ $t('showcase.remaining.design.lastAction') }}
          </span>
          <strong
            class="code-inline m-0 min-w-0 break-words text-right text-sm font-semibold text-foreground"
          >
            {{ $t(`showcase.remaining.design.actionStatus.${actionStatus}`) }}
          </strong>
        </div>
        <div class="demo-well row-between min-w-0 gap-sm">
          <span class="text-sm text-muted-foreground">
            {{ $t('showcase.remaining.design.activeSample') }}
          </span>
          <strong
            class="code-inline m-0 min-w-0 break-words text-right text-sm font-semibold text-foreground"
          >
            {{ $t(`showcase.remaining.design.rows.${activePreview.key}.title`) }}
          </strong>
        </div>
      </div>

      <ShowcaseEmptyState
        icon="i-lucide-shield-check"
        :title="$t('showcase.remaining.design.readOnlyTitle')"
        :description="$t('showcase.remaining.design.readOnlyDescription')"
      />
    </ShowcaseToolbar>

    <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
      <ShowcaseCard
        :icon="currentConfig.icon"
        :title="$t('showcase.remaining.design.previewTitle')"
        :description="$t('showcase.remaining.design.previewDescription')"
        :tag="$t(currentBadgeKey)"
      >
        <div
          class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-2"
        >
          <article
            v-for="row in currentPreviewRows"
            :key="row.key"
            class="col-stretch min-w-0"
            :class="getPreviewRowClass(row.key)"
          >
            <span class="center rounded-md p-sm bg-primary-light text-primary">
              <Icons
                :name="row.icon"
                size="md"
              />
            </span>
            <div class="col-stretch min-w-0 gap-xs">
              <h3 class="text-base font-semibold text-foreground m-0">
                {{ $t(`showcase.remaining.design.rows.${row.key}.title`) }}
              </h3>
              <p class="text-sm text-muted-foreground m-0">
                {{ $t(`showcase.remaining.design.rows.${row.key}.description`) }}
              </p>
              <code class="code-inline m-0 min-w-0 break-all text-sm font-semibold text-foreground">
                {{ $t(`showcase.remaining.design.samples.${row.key}`) }}
              </code>
            </div>
          </article>
        </div>
      </ShowcaseCard>

      <ShowcaseCard
        :icon="currentConfig.resultIcon"
        :title="$t('showcase.remaining.design.stateTitle')"
        :description="$t('showcase.remaining.design.stateDescription')"
      >
        <dl
          class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-2"
          aria-live="polite"
        >
          <div
            v-for="row in resultRows"
            :key="row.key"
            class="demo-well col-stretch min-w-0 gap-xs"
          >
            <dt class="text-sm text-muted-foreground">
              {{ $t(row.labelKey) }}
            </dt>
            <dd
              class="code-inline m-0 min-w-0 break-all text-sm font-semibold text-foreground"
            >
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </ShowcaseCard>
    </div>

    <ShowcaseSection
      :title="$t('showcase.remaining.design.contractTitle')"
      :description="$t('showcase.remaining.design.contractDescription')"
      icon="i-lucide-badge-check"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
        <ShowcaseCard
          v-for="card in contractCards"
          :key="card.key"
          :icon="card.icon"
          :title="$t(`showcase.remaining.design.contract.${card.key}.title`)"
          :description="$t(`showcase.remaining.design.contract.${card.key}.description`)"
          :tag="$t('showcase.remaining.tags.technical')"
        />
      </div>
    </ShowcaseSection>

    <ShowcaseSection
      :title="$t('showcase.remaining.design.sourceTitle')"
      :description="$t('showcase.remaining.design.sourceDescription')"
      icon="i-lucide-folder-code"
    >
      <ShowcaseSourceLinks :source-paths="sourcePaths" />
    </ShowcaseSection>

    <p class="text-sm text-muted-foreground m-0">
      {{ $t(currentNoteKey) }}
    </p>
  </section>
</template>
