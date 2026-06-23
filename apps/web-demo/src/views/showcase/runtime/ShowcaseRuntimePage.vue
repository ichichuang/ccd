<script setup lang="ts">
import { getRemainingShowcaseItem, type RemainingShowcaseId } from '../data/showcaseDemoContent'
import ShowcaseCard from '../shared/ShowcaseCard.vue'
import ShowcaseDemoPanel from '../shared/ShowcaseDemoPanel.vue'
import ShowcaseEmptyState from '../shared/ShowcaseEmptyState.vue'
import ShowcaseEvidencePanel from '../shared/ShowcaseEvidencePanel.vue'
import ShowcaseHero from '../shared/ShowcaseHero.vue'
import ShowcaseRelatedLinks from '../shared/ShowcaseRelatedLinks.vue'
import ShowcaseSection from '../shared/ShowcaseSection.vue'
import ShowcaseSourceLinks from '../shared/ShowcaseSourceLinks.vue'
import ShowcaseToolbar from '../shared/ShowcaseToolbar.vue'

type RuntimePageId = Extract<
  RemainingShowcaseId,
  | 'runtime-browser'
  | 'runtime-http'
  | 'runtime-layout'
  | 'runtime-overview'
  | 'runtime-state-ownership'
>

type RuntimeDemoKind = 'browser' | 'http' | 'layout' | 'overview' | 'stateOwnership'
type RuntimeActionStatus = 'checked' | 'ready' | 'reset'
type RuntimeContractKey = 'adapter' | 'boundary' | 'state'
type RuntimeNoteKey = 'desktop' | 'http' | 'layout' | 'storage'
type RuntimeRowKey =
  | 'adapterOwner'
  | 'breakpoint'
  | 'deviceType'
  | 'drawer'
  | 'layoutMode'
  | 'locale'
  | 'orientation'
  | 'permission'
  | 'requestBoundary'
  | 'requestClient'
  | 'sidebarMode'
  | 'stateOwner'
  | 'storageBoundary'
  | 'themeMode'

interface RuntimeRow {
  key: RuntimeRowKey
  labelKey: `showcase.runtimePages.rows.${RuntimeRowKey}`
  value: string
}

interface RuntimeConfig {
  kind: RuntimeDemoKind
  icon: `i-${string}`
  resultIcon: `i-${string}`
  pageSourcePath: string
  resultRowKeys: readonly RuntimeRowKey[]
  evidencePaths: readonly string[]
  noteKeys: readonly RuntimeNoteKey[]
}

interface RuntimeContractCard {
  key: RuntimeContractKey
  icon: `i-${string}`
}

defineOptions({ name: 'ShowcaseRuntimePage' })

const props = defineProps<{
  id: RuntimePageId
}>()

const theme = useThemeSwitch()
const localeRuntime = useLocale()
const layout = useLayoutRuntime()
const auth = useAuth()

const runtimeShellSourcePath = 'apps/web-demo/src/views/showcase/runtime/ShowcaseRuntimePage.vue'

const runtimeConfigs = {
  'runtime-overview': {
    kind: 'overview',
    icon: 'i-lucide-cpu',
    resultIcon: 'i-lucide-map',
    pageSourcePath: 'apps/web-demo/src/views/showcase/runtime/overview/index.vue',
    resultRowKeys: [
      'adapterOwner',
      'requestBoundary',
      'storageBoundary',
      'stateOwner',
      'themeMode',
      'layoutMode',
    ],
    evidencePaths: [
      'apps/web-demo/src/adapters/runtime.adapter.ts',
      'apps/web-demo/src/adapters/http.adapter.ts',
      'apps/web-demo/src/adapters/device.adapter.ts',
      'apps/web-demo/src/hooks/layout/useLayoutRuntime.ts',
    ],
    noteKeys: ['http', 'storage', 'layout', 'desktop'],
  },
  'runtime-http': {
    kind: 'http',
    icon: 'i-lucide-webhook',
    resultIcon: 'i-lucide-activity',
    pageSourcePath: 'apps/web-demo/src/views/showcase/runtime/http/index.vue',
    resultRowKeys: [
      'requestClient',
      'requestBoundary',
      'adapterOwner',
      'permission',
      'themeMode',
      'locale',
    ],
    evidencePaths: [
      'apps/web-demo/src/adapters/http.adapter.ts',
      'apps/web-demo/src/hooks/modules/useHttpRequest.ts',
      'apps/web-demo/src/utils/http/instance.ts',
      'apps/web-demo/src/utils/http/interceptors.ts',
    ],
    noteKeys: ['http', 'storage', 'desktop'],
  },
  'runtime-browser': {
    kind: 'browser',
    icon: 'i-lucide-globe-2',
    resultIcon: 'i-lucide-monitor-smartphone',
    pageSourcePath: 'apps/web-demo/src/views/showcase/runtime/browser-runtime/index.vue',
    resultRowKeys: [
      'deviceType',
      'breakpoint',
      'orientation',
      'themeMode',
      'locale',
      'adapterOwner',
    ],
    evidencePaths: [
      'apps/web-demo/src/adapters/runtime.adapter.ts',
      'apps/web-demo/src/adapters/device.adapter.ts',
      'apps/web-demo/src/stores/modules/system/device.ts',
      'packages/contracts/src/runtime.ts',
    ],
    noteKeys: ['desktop', 'layout', 'storage'],
  },
  'runtime-layout': {
    kind: 'layout',
    icon: 'i-lucide-panels-top-left',
    resultIcon: 'i-lucide-layout-dashboard',
    pageSourcePath: 'apps/web-demo/src/views/showcase/runtime/layout/index.vue',
    resultRowKeys: [
      'layoutMode',
      'sidebarMode',
      'drawer',
      'breakpoint',
      'deviceType',
      'orientation',
    ],
    evidencePaths: [
      'apps/web-demo/src/hooks/layout/useLayoutRuntime.ts',
      'apps/web-demo/src/layouts/runtime/layoutRuntime.ts',
      'apps/web-demo/src/stores/modules/system/device.ts',
      'apps/web-demo/src/stores/modules/system/layout.ts',
    ],
    noteKeys: ['layout', 'desktop'],
  },
  'runtime-state-ownership': {
    kind: 'stateOwnership',
    icon: 'i-lucide-database',
    resultIcon: 'i-lucide-git-branch',
    pageSourcePath: 'apps/web-demo/src/views/showcase/runtime/state-ownership/index.vue',
    resultRowKeys: [
      'stateOwner',
      'storageBoundary',
      'adapterOwner',
      'themeMode',
      'locale',
      'permission',
    ],
    evidencePaths: [
      'apps/web-demo/src/stores/modules/system/theme.ts',
      'apps/web-demo/src/stores/modules/system/layout.ts',
      'apps/web-demo/src/utils/safeStorage/piniaSerializer.ts',
      'apps/web-demo/src/adapters/runtime.adapter.ts',
    ],
    noteKeys: ['storage', 'layout', 'http'],
  },
} satisfies Record<RuntimePageId, RuntimeConfig>

const runtimeRowLabelKeys = {
  adapterOwner: 'showcase.runtimePages.rows.adapterOwner',
  breakpoint: 'showcase.runtimePages.rows.breakpoint',
  deviceType: 'showcase.runtimePages.rows.deviceType',
  drawer: 'showcase.runtimePages.rows.drawer',
  layoutMode: 'showcase.runtimePages.rows.layoutMode',
  locale: 'showcase.runtimePages.rows.locale',
  orientation: 'showcase.runtimePages.rows.orientation',
  permission: 'showcase.runtimePages.rows.permission',
  requestBoundary: 'showcase.runtimePages.rows.requestBoundary',
  requestClient: 'showcase.runtimePages.rows.requestClient',
  sidebarMode: 'showcase.runtimePages.rows.sidebarMode',
  stateOwner: 'showcase.runtimePages.rows.stateOwner',
  storageBoundary: 'showcase.runtimePages.rows.storageBoundary',
  themeMode: 'showcase.runtimePages.rows.themeMode',
} satisfies Record<RuntimeRowKey, `showcase.runtimePages.rows.${RuntimeRowKey}`>

const runtimeBadgeKeys = {
  browser: 'showcase.runtimePages.badges.browser',
  http: 'showcase.runtimePages.badges.http',
  layout: 'showcase.runtimePages.badges.layout',
  overview: 'showcase.runtimePages.badges.overview',
  stateOwnership: 'showcase.runtimePages.badges.stateOwnership',
} satisfies Record<RuntimeDemoKind, `showcase.runtimePages.badges.${RuntimeDemoKind}`>

const runtimeNoteIcons = {
  desktop: 'i-lucide-monitor',
  http: 'i-lucide-webhook',
  layout: 'i-lucide-panels-top-left',
  storage: 'i-lucide-lock-keyhole',
} satisfies Record<RuntimeNoteKey, `i-${string}`>

const contractCards: readonly RuntimeContractCard[] = [
  { key: 'adapter', icon: 'i-lucide-plug' },
  { key: 'boundary', icon: 'i-lucide-route' },
  { key: 'state', icon: 'i-lucide-database' },
]
const runCount = ref(1)
const actionStatus = ref<RuntimeActionStatus>('ready')

const item = computed(() => getRemainingShowcaseItem(props.id))
const currentConfig = computed(() => runtimeConfigs[props.id])
const currentKind = computed(() => currentConfig.value.kind)
const currentBadgeKey = computed(() => runtimeBadgeKeys[currentKind.value])
const pageSourcePaths = computed(() => [currentConfig.value.pageSourcePath, runtimeShellSourcePath])

const resultRows = computed<RuntimeRow[]>(() =>
  currentConfig.value.resultRowKeys.map(key => ({
    key,
    labelKey: runtimeRowLabelKeys[key],
    value: getRuntimeRowValue(key),
  }))
)

function getRuntimeRowValue(key: RuntimeRowKey): string {
  switch (key) {
    case 'adapterOwner':
      return 'apps/web-demo/src/adapters/**'
    case 'breakpoint':
      return layout.breakpoint.value
    case 'deviceType':
      return layout.deviceType.value
    case 'drawer':
      return layout.useDrawer.value ? 'drawer' : 'inline'
    case 'layoutMode':
      return layout.effectiveMode.value
    case 'locale':
      return localeRuntime.locale.value
    case 'orientation':
      return layout.orientation.value
    case 'permission':
      return auth.hasAuth('*:*:*') ? 'allowed' : 'limited'
    case 'requestBoundary':
      return 'api -> hooks -> views'
    case 'requestClient':
      return 'alova + useHttpRequest'
    case 'sidebarMode':
      return layout.sidebarMode.value
    case 'stateOwner':
      return 'store / page / adapter'
    case 'storageBoundary':
      return 'safeStorage facade'
    case 'themeMode':
      return theme.mode.value
  }
}

function runRuntimeCheck(): void {
  runCount.value += 1
  actionStatus.value = 'checked'
}

function resetRuntimeCheck(): void {
  runCount.value = 1
  actionStatus.value = 'reset'
}

const actionButtonPt = {
  root: {
    class:
      'ring-focus-focus focus:!outline-solid focus:!outline-2 focus:!outline-ring focus:!outline-offset-2',
  },
}
</script>

<template>
  <section
    class="col-stretch min-w-0 gap-lg"
    data-testid="showcase-runtime-page"
  >
    <ShowcaseHero
      :eyebrow="$t(`${item.localeBaseKey}.eyebrow`)"
      :title="$t(`${item.localeBaseKey}.title`)"
      :description="$t(`${item.localeBaseKey}.description`)"
      :icon="item.icon"
    />

    <ShowcaseSection
      :title="$t('showcase.runtimePages.boundaryTitle')"
      :description="$t('showcase.runtimePages.boundaryDescription')"
      icon="i-lucide-badge-check"
      data-testid="showcase-runtime-boundary"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
        <ShowcaseCard
          v-for="contract in contractCards"
          :key="contract.key"
          :icon="contract.icon"
          :title="$t(`showcase.runtimePages.contract.${contract.key}.title`)"
          :description="$t(`showcase.runtimePages.contract.${contract.key}.description`)"
          :tag="$t('showcase.remaining.tags.technical')"
        />
      </div>
    </ShowcaseSection>

    <ShowcaseDemoPanel
      :title="$t(`${item.localeBaseKey}.try`)"
      :description="$t(`showcase.runtimePages.${currentKind}.demoDescription`)"
    >
      <section
        class="col-stretch min-w-0 gap-lg"
        data-testid="showcase-runtime-demo"
      >
        <ShowcaseToolbar
          :title="$t('showcase.runtimePages.toolbarTitle')"
          :description="$t('showcase.runtimePages.toolbarDescription')"
          :summary="$t(`showcase.runtimePages.${currentKind}.focusDescription`)"
          data-testid="showcase-runtime-action-toolbar"
        >
          <template #actions>
            <Button
              :label="$t('showcase.runtimePages.runCheck')"
              icon="i-lucide-play"
              severity="primary"
              :pt="actionButtonPt"
              data-testid="showcase-runtime-run-check"
              @click="runRuntimeCheck"
            />
            <Button
              :label="$t('showcase.runtimePages.resetCheck')"
              icon="i-lucide-rotate-ccw"
              severity="secondary"
              outlined
              :pt="actionButtonPt"
              data-testid="showcase-runtime-reset-check"
              @click="resetRuntimeCheck"
            />
            <Tag
              :value="$t(currentBadgeKey)"
              severity="info"
            />
          </template>

          <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-2">
            <div class="demo-well row-between min-w-0 gap-sm">
              <span class="text-sm text-muted-foreground">
                {{ $t('showcase.runtimePages.runCount') }}
              </span>
              <strong
                class="code-inline m-0 min-w-0 text-sm font-semibold text-foreground"
                data-testid="showcase-runtime-run-count"
              >
                {{ runCount }}
              </strong>
            </div>
            <div class="demo-well row-between min-w-0 gap-sm">
              <span class="text-sm text-muted-foreground">
                {{ $t('showcase.runtimePages.lastAction') }}
              </span>
              <strong
                class="code-inline m-0 min-w-0 break-words text-right text-sm font-semibold text-foreground"
                data-testid="showcase-runtime-last-action"
              >
                {{ $t(`showcase.runtimePages.actionStatus.${actionStatus}`) }}
              </strong>
            </div>
          </div>

          <ShowcaseEmptyState
            icon="i-lucide-eye"
            :title="$t('showcase.runtimePages.readonlyTitle')"
            :description="$t('showcase.runtimePages.readonlyDescription')"
            data-testid="showcase-runtime-readonly-note"
          />
        </ShowcaseToolbar>

        <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
          <ShowcaseCard
            :icon="currentConfig.icon"
            :title="$t(`showcase.runtimePages.${currentKind}.focusTitle`)"
            :description="$t('showcase.runtimePages.stateDescription')"
            :tag="$t(currentBadgeKey)"
            data-testid="showcase-runtime-state-panel"
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
                  :data-testid="`showcase-runtime-state-${row.key}`"
                >
                  {{ row.value }}
                </dd>
              </div>
            </dl>
          </ShowcaseCard>

          <ShowcaseCard
            :icon="currentConfig.resultIcon"
            :title="$t('showcase.runtimePages.resultTitle')"
            :description="$t('showcase.runtimePages.resultDescription')"
            data-testid="showcase-runtime-result-panel"
          >
            <div class="col-stretch min-w-0 gap-sm">
              <div class="demo-well col-stretch min-w-0 gap-xs">
                <span class="text-sm text-muted-foreground">
                  {{ $t('showcase.runtimePages.resultRoute') }}
                </span>
                <code
                  class="code-inline block min-w-0 break-all text-sm font-semibold text-foreground select-all"
                >
                  {{ item.path }}
                </code>
              </div>
              <div class="demo-well col-stretch min-w-0 gap-xs">
                <span class="text-sm text-muted-foreground">
                  {{ $t('showcase.runtimePages.resultSource') }}
                </span>
                <code
                  class="code-inline block min-w-0 break-all text-sm font-semibold text-foreground select-all"
                >
                  {{ currentConfig.pageSourcePath }}
                </code>
              </div>
              <p class="text-sm text-muted-foreground m-0">
                {{ $t(`showcase.runtimePages.${currentKind}.note`) }}
              </p>
            </div>
          </ShowcaseCard>
        </div>
      </section>
    </ShowcaseDemoPanel>

    <ShowcaseSection
      :title="$t('showcase.runtimePages.notesTitle')"
      :description="$t('showcase.runtimePages.notesDescription')"
      icon="i-lucide-list-checks"
      data-testid="showcase-runtime-contract"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-2">
        <ShowcaseCard
          v-for="noteKey in currentConfig.noteKeys"
          :key="noteKey"
          :icon="runtimeNoteIcons[noteKey]"
          :title="$t(`showcase.runtimePages.notes.${noteKey}.title`)"
          :description="$t(`showcase.runtimePages.notes.${noteKey}.description`)"
          :tag="$t('showcase.remaining.tags.explanation')"
        />
      </div>
    </ShowcaseSection>

    <section
      class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2"
      data-testid="showcase-runtime-source-area"
    >
      <ShowcaseSourceLinks :source-paths="pageSourcePaths" />
      <ShowcaseEvidencePanel
        :title="$t('showcase.runtimePages.evidenceTitle')"
        :description="$t('showcase.runtimePages.evidenceDescription')"
        :empty-text="$t('showcase.shell.source.empty')"
        :source-paths="currentConfig.evidencePaths"
        data-testid="showcase-runtime-evidence-area"
      />
    </section>

    <ShowcaseRelatedLinks
      :item="item"
      :related-ids="item.relatedIds"
      data-testid="showcase-runtime-related"
    />
  </section>
</template>
