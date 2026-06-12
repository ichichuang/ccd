<script setup lang="ts">
import type { FormSchema, ProTableColumn } from '@ccd/vue-ui'
import type { EChartsOption } from 'echarts'
import ArchitecturePageShell from './shared/ArchitecturePageShell.vue'
import CapabilityCard from './shared/CapabilityCard.vue'
import CommandPanel from './shared/CommandPanel.vue'
import DemoSection from './shared/DemoSection.vue'
import EvidencePanel from './shared/EvidencePanel.vue'
import RouteEvidenceTable from './shared/RouteEvidenceTable.vue'
import StatusBadgeRow from './shared/StatusBadgeRow.vue'
import { getConsolePage } from './data/consolePages'
import { DateUtils } from '@/utils/date'

defineOptions({ name: 'ArchitectureConsolePage' })

interface ConsoleTableRow extends Record<string, unknown> {
  layer: string
  owner: string
  status: string
  validation: string
}

type PrimeButtonSeverity =
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'help'
  | 'danger'
  | 'contrast'

interface PrimeButtonDemo {
  label: string
  severity?: PrimeButtonSeverity
}

const route = useRoute()
const page = computed(() => getConsolePage(route.name))

const proFormSchema: FormSchema = {
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'capability',
      label: 'Capability',
      component: 'input',
      required: true,
      defaultValue: 'Architecture console page shell',
      span: { xs: 12, md: 6 },
      rules: [
        {
          message: 'Capability is required',
          validator: value => typeof value === 'string' && value.trim().length > 0,
        },
      ],
    },
    {
      name: 'owner',
      label: 'Owner boundary',
      component: 'select',
      defaultValue: 'app',
      span: { xs: 12, md: 6 },
      options: [
        { label: 'App-local composition', value: 'app' },
        { label: 'Public package primitive', value: 'package' },
        { label: 'Future extraction lane', value: 'future' },
      ],
    },
    {
      name: 'guarded',
      label: 'Governance guarded',
      component: 'switch',
      defaultValue: true,
      span: { xs: 12, md: 4 },
    },
    {
      name: 'notes',
      label: 'Evidence notes',
      component: 'textarea',
      defaultValue: 'Keep composition app-local until a separate extraction lane proves ownership.',
      span: { xs: 12, md: 8 },
      props: { rows: 3 },
    },
  ],
}

const submittedSummary = ref('No submitted values yet')
const primeInput = ref<string | undefined>('InputText')
const primeNumber = ref(24)
const primePassword = ref('ccd-runtime')
const primeSelect = ref('contract')
const primeAutocomplete = ref('')
const primeAutocompleteSuggestions = ref<string[]>([])
const primeDate = ref<Date | Date[] | (Date | null)[] | null | undefined>(DateUtils.now().toDate())
const primeSelectOptions = [
  { label: 'Contracts', value: 'contract' },
  { label: 'Core', value: 'core' },
  { label: 'App runtime', value: 'app' },
]
const primeAutocompleteOptions = ['Architecture', 'Runtime', 'PrimeVue', 'Governance']
const primeButtons: PrimeButtonDemo[] = [
  { label: 'Primary' },
  { label: 'Secondary', severity: 'secondary' },
  { label: 'Success', severity: 'success' },
  { label: 'Info', severity: 'info' },
  { label: 'Warn', severity: 'warn' },
  { label: 'Help', severity: 'help' },
  { label: 'Danger', severity: 'danger' },
  { label: 'Contrast', severity: 'contrast' },
]

function handleConsoleFormSubmit(values: Record<string, unknown>): void {
  submittedSummary.value = Object.keys(values).join(', ')
}

function handleAutocompleteComplete(event: { query?: string }): void {
  const query = event.query?.toLowerCase() ?? ''
  primeAutocompleteSuggestions.value = primeAutocompleteOptions.filter(option =>
    option.toLowerCase().includes(query)
  )
}

const tableColumns: ProTableColumn<ConsoleTableRow>[] = [
  { id: 'layer', field: 'layer', title: 'Layer', sortable: true, minWidth: '160px' },
  { id: 'owner', field: 'owner', title: 'Owner', minWidth: '200px' },
  {
    id: 'status',
    field: 'status',
    title: 'Status',
    minWidth: '150px',
    valueEnum: {
      guarded: { label: 'Guarded', severity: 'success' },
      app: { label: 'App-owned', severity: 'info' },
      blocked: { label: 'Blocked', severity: 'warn' },
    },
  },
  { id: 'validation', field: 'validation', title: 'Validation', minWidth: '220px' },
]

const tableRows: ConsoleTableRow[] = [
  {
    layer: '@ccd/contracts',
    owner: 'interfaces and DTO contracts',
    status: 'guarded',
    validation: 'pnpm arch:boundaries',
  },
  {
    layer: '@ccd/core',
    owner: 'runtime-neutral orchestration',
    status: 'guarded',
    validation: 'pnpm arch:runtime',
  },
  {
    layer: 'apps/web-demo HTTP',
    owner: 'app-owned alova runtime',
    status: 'app',
    validation: 'pnpm ai:guard',
  },
  {
    layer: 'safeStorage runtime',
    owner: 'app-owned crypto/compression facade',
    status: 'blocked',
    validation: 'P4-SafeStorageShared-Blocked',
  },
]

const chartOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  legend: { show: true, top: 0 },
  grid: { left: 12, right: 12, top: 44, bottom: 12, containLabel: true },
  xAxis: { type: 'category' as const, data: ['contracts', 'core', 'web', 'desktop', 'wiki'] },
  yAxis: { type: 'value' as const },
  series: [
    {
      name: 'Evidence weight',
      type: 'bar',
      data: [100, 100, 92, 86, 95],
    },
    {
      name: 'Runtime risk',
      type: 'line',
      smooth: true,
      data: [0, 0, 12, 18, 5],
    },
  ],
}))

const showProFormDemo = computed(() => page.value.id === 'UiProForm')
const showProTableDemo = computed(() => page.value.id === 'UiProTable')
const showChartDemo = computed(() => page.value.id === 'UiCharts')
const showFeedbackDemo = computed(() => page.value.id === 'UiFeedback')
const showRouteEvidence = computed(() => page.value.id === 'ArchitectureGovernance')
const showPrimeVueAdapterDemo = computed(() => page.value.id === 'UiPrimeVueAdapter')
</script>

<template>
  <ArchitecturePageShell
    :eyebrow="page.eyebrow"
    :title="page.title"
    :description="page.description"
  >
    <template #status>
      <StatusBadgeRow :items="page.status" />
    </template>

    <section class="grid grid-cols-1 gap-md lg:grid-cols-3">
      <article
        v-for="stat in page.stats"
        :key="stat.label"
        class="material-elevated col-stretch gap-md"
      >
        <div class="row-between gap-md">
          <span class="text-sm text-muted-foreground">{{ stat.label }}</span>
          <Icons
            :name="stat.icon"
            size="lg"
            class="text-primary"
          />
        </div>
        <strong class="text-2xl text-foreground">
          {{ stat.value }}
        </strong>
        <span class="text-sm text-muted-foreground">{{ stat.detail }}</span>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-md xl:grid-cols-3">
      <CapabilityCard
        v-for="capability in page.capabilities"
        :key="capability.title"
        :title="capability.title"
        :description="capability.description"
        :icon="capability.icon"
        :status="capability.status"
        :bullets="capability.bullets"
      />
    </section>

    <RouteEvidenceTable
      v-if="showRouteEvidence"
      before-count="106"
      after-count="29"
    />

    <DemoSection
      v-if="showPrimeVueAdapterDemo"
      title="Button Family"
      description="PrimeVue controls render through the approved adapter, global PT presets, and CCD tokens."
    >
      <div class="col-stretch gap-lg">
        <div class="row-start gap-sm flex-wrap">
          <Button
            v-for="button in primeButtons"
            :key="button.label"
            :label="button.label"
            :severity="button.severity"
            raised
          />
        </div>

        <div class="grid grid-cols-1 gap-md lg:grid-cols-3">
          <InputText
            v-model="primeInput"
            placeholder="InputText"
            aria-label="InputText"
          />
          <InputNumber
            v-model="primeNumber"
            placeholder="InputNumber"
            input-id="primevue-input-number"
          />
          <Password
            v-model="primePassword"
            placeholder="Password"
            :feedback="false"
            toggle-mask
          />
          <Select
            v-model="primeSelect"
            :options="primeSelectOptions"
            option-label="label"
            option-value="value"
            placeholder="Select"
          />
          <AutoComplete
            v-model="primeAutocomplete"
            :suggestions="primeAutocompleteSuggestions"
            placeholder="AutoComplete"
            @complete="handleAutocompleteComplete"
          />
          <DatePicker
            v-model="primeDate"
            placeholder="DatePicker"
            show-icon
          />
        </div>
      </div>
    </DemoSection>

    <DemoSection
      v-if="showProFormDemo"
      title="Schema-driven ProForm"
      description="A compact schema demo replaces the old route-per-feature ProForm museum."
    >
      <ProForm
        :schema="proFormSchema"
        @submit="handleConsoleFormSubmit"
      >
        <template #footer="{ submit }">
          <div class="row-between gap-md flex-wrap pt-md">
            <span class="text-sm text-muted-foreground">{{ submittedSummary }}</span>
            <Button
              label="Validate schema"
              icon="i-lucide-check"
              @click="submit"
            />
          </div>
        </template>
      </ProForm>
    </DemoSection>

    <DemoSection
      v-if="showProTableDemo"
      title="Typed ProTable"
      description="A single table demonstrates package boundaries and validation posture."
    >
      <ProTable
        :columns="tableColumns"
        :data="tableRows"
        row-key="layer"
        title="Boundary evidence"
        :pagination="{ pageSize: 4 }"
        show-toolbar
      />
    </DemoSection>

    <DemoSection
      v-if="showChartDemo"
      title="Token-aware chart runtime"
      description="UseEcharts renders themed evidence without raw ECharts initialization in the view."
    >
      <UseEcharts
        :option="chartOption"
        class="w-full h-[32vh] min-h-260px"
      />
    </DemoSection>

    <DemoSection
      v-if="showFeedbackDemo"
      title="Feedback primitives"
      description="The merged feedback surface keeps dialog, toast, empty state, icon, and scroll primitives discoverable."
    >
      <div class="grid grid-cols-1 gap-md md:grid-cols-2">
        <EmptyState
          icon="i-lucide-circle-dashed"
          title="No stale example routes"
          description="The architecture console replaces museum-style examples with focused evidence."
        />
        <div class="demo-well col-stretch gap-sm">
          <div class="row-start gap-sm">
            <Icons
              name="i-lucide-message-circle"
              size="lg"
              class="text-primary"
            />
            <span class="text-sm font-semibold text-foreground">Dialog and toast facade</span>
          </div>
          <p class="text-sm text-muted-foreground m-0">
            Business feedback continues through CCD abstractions instead of native alert or raw
            Toast.
          </p>
        </div>
      </div>
    </DemoSection>

    <EvidencePanel :items="page.evidence" />
    <CommandPanel :commands="page.commands" />
  </ArchitecturePageShell>
</template>
