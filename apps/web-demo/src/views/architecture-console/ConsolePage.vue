<script setup lang="ts">
import type { FormSchema, ValidationResolver } from '@ccd/vue-ui'
import type { EChartsOption } from 'echarts'
import type { ConsoleTableRow, ConsoleTableStatus } from './configs/proTableDemo'
import type { ConsoleStat } from './data/consolePages'
import ArchitecturePageShell from './shared/ArchitecturePageShell.vue'
import CapabilityCard from './shared/CapabilityCard.vue'
import CommandPanel from './shared/CommandPanel.vue'
import DemoSection from './shared/DemoSection.vue'
import EvidencePanel from './shared/EvidencePanel.vue'
import RouteEvidenceTable from './shared/RouteEvidenceTable.vue'
import StatusBadgeRow from './shared/StatusBadgeRow.vue'
import { createConsoleTableColumns, createConsoleTableRows } from './configs/proTableDemo'
import { getConsolePage } from './data/consolePages'
import { DateUtils } from '@/utils/date'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ArchitectureConsolePage' })

interface ConsoleProFormValues extends Record<string, unknown> {
  capability?: string
  owner?: 'app' | 'package' | 'future'
  guarded?: boolean
  command?: string
  notes?: string
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
const { t } = useI18n()
const page = computed(() => getConsolePage(route.name))

function pageMessageKey(field: string): string {
  return `console.pages.${page.value.key}.${field}`
}

function statMessageKey(stat: ConsoleStat, field: string): string {
  return `console.stats.${stat.key}.${field}`
}

function demoMessageKey(section: string, field: string): string {
  return `console.demos.${section}.${field}`
}

const ownerValidationCommand: Record<NonNullable<ConsoleProFormValues['owner']>, string> = {
  app: 'Review in the app experience',
  package: 'Confirm reusable component fit',
  future: 'Plan a later extraction review',
}

const proFormSchema = computed<FormSchema<ConsoleProFormValues>>(() => ({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'section',
      name: 'proFormBasicGroup',
      label: t(demoMessageKey('proForm', 'groups.basic')),
      children: [
        {
          name: 'capability',
          label: t(demoMessageKey('proForm', 'fields.capability')),
          component: 'input',
          required: true,
          defaultValue: t(demoMessageKey('proForm', 'defaults.capability')),
          span: { xs: 12, md: 6 },
          rules: [
            {
              message: t(demoMessageKey('proForm', 'validation.capabilityRequired')),
              validator: value => typeof value === 'string' && value.trim().length > 0,
            },
            {
              message: t(demoMessageKey('proForm', 'validation.capabilityLength')),
              validator: value => typeof value === 'string' && value.trim().length >= 4,
            },
          ],
        },
        {
          name: 'owner',
          label: t(demoMessageKey('proForm', 'fields.owner')),
          component: 'select',
          defaultValue: 'app',
          span: { xs: 12, md: 6 },
          description: t(demoMessageKey('proForm', 'descriptions.owner')),
          options: [
            { label: t(demoMessageKey('proForm', 'owners.app')), value: 'app' },
            { label: t(demoMessageKey('proForm', 'owners.package')), value: 'package' },
            { label: t(demoMessageKey('proForm', 'owners.future')), value: 'future' },
          ],
        },
      ],
    },
    {
      type: 'section',
      name: 'proFormGovernanceGroup',
      label: t(demoMessageKey('proForm', 'groups.governance')),
      children: [
        {
          name: 'guarded',
          label: t(demoMessageKey('proForm', 'fields.guarded')),
          component: 'switch',
          defaultValue: true,
          span: { xs: 12, md: 4 },
          description: t(demoMessageKey('proForm', 'descriptions.guarded')),
        },
        {
          name: 'command',
          label: t(demoMessageKey('proForm', 'fields.command')),
          component: 'input',
          defaultValue: ownerValidationCommand.app,
          span: { xs: 12, md: 8 },
          deps: ['owner'],
          computed: ({ form }) => {
            const owner = form.owner ?? 'app'
            return ownerValidationCommand[owner]
          },
          props: { readonly: true },
          description: t(demoMessageKey('proForm', 'descriptions.command')),
        },
      ],
    },
    {
      name: 'notes',
      label: t(demoMessageKey('proForm', 'fields.notes')),
      component: 'textarea',
      defaultValue: t(demoMessageKey('proForm', 'defaults.notes')),
      requiredIf: ({ form }) => form.guarded === true,
      visibleIf: ({ form }) => form.guarded === true,
      deps: ['guarded'],
      span: { xs: 12 },
      props: { rows: 3 },
      description: t(demoMessageKey('proForm', 'descriptions.notes')),
    },
  ],
}))

const proFormResolver = computed<ValidationResolver<ConsoleProFormValues>>(() => async values => {
  const errors: Record<string, string[]> = {}
  if (values.guarded === true) {
    const notes = values.notes
    if (typeof notes !== 'string' || notes.trim().length < 8) {
      errors.notes = [t(demoMessageKey('proForm', 'validation.notesRequired'))]
    }
  }
  return { valid: Object.keys(errors).length === 0, errors }
})
const submittedValues = ref<ConsoleProFormValues | null>(null)
const submittedSummary = computed(() => {
  if (!submittedValues.value) return t(demoMessageKey('proForm', 'summary.empty'))

  const fieldLabels = Object.keys(submittedValues.value)
    .map(field => t(demoMessageKey('proForm', `fields.${field}`)))
    .join(t(demoMessageKey('proForm', 'summary.separator')))

  return t(demoMessageKey('proForm', 'summary.submitted'), { fields: fieldLabels })
})
const submittedEvidence = computed(() => {
  if (!submittedValues.value) return null
  const owner = submittedValues.value.owner ?? 'app'
  return {
    owner: t(demoMessageKey('proForm', `owners.${owner}`)),
    command: submittedValues.value.command ?? ownerValidationCommand[owner],
  }
})
const primeInput = ref<string | undefined>('')
const primeNumber = ref(24)
const primePassword = ref('ccd-runtime')
const primeSelect = ref('contract')
const primeAutocomplete = ref('')
const primeAutocompleteSuggestions = ref<string[]>([])
const primeDate = ref<Date | Date[] | (Date | null)[] | null | undefined>(DateUtils.now().toDate())
const primeSelectOptions = computed(() => [
  { label: t(demoMessageKey('primeVue', 'options.contracts')), value: 'contract' },
  { label: t(demoMessageKey('primeVue', 'options.core')), value: 'core' },
  { label: t(demoMessageKey('primeVue', 'options.appRuntime')), value: 'app' },
])
const primeAutocompleteOptions = computed(() => [
  t(demoMessageKey('primeVue', 'autocomplete.architecture')),
  t(demoMessageKey('primeVue', 'autocomplete.runtime')),
  t(demoMessageKey('primeVue', 'autocomplete.primevue')),
  t(demoMessageKey('primeVue', 'autocomplete.governance')),
])
const primeButtons = computed<PrimeButtonDemo[]>(() => [
  { label: t(demoMessageKey('primeVue', 'buttons.primary')) },
  { label: t(demoMessageKey('primeVue', 'buttons.secondary')), severity: 'secondary' },
  { label: t(demoMessageKey('primeVue', 'buttons.success')), severity: 'success' },
  { label: t(demoMessageKey('primeVue', 'buttons.info')), severity: 'info' },
  { label: t(demoMessageKey('primeVue', 'buttons.warn')), severity: 'warn' },
  { label: t(demoMessageKey('primeVue', 'buttons.help')), severity: 'help' },
  { label: t(demoMessageKey('primeVue', 'buttons.danger')), severity: 'danger' },
  { label: t(demoMessageKey('primeVue', 'buttons.contrast')), severity: 'contrast' },
])

function handleConsoleFormSubmit(values: ConsoleProFormValues): void {
  submittedValues.value = values
}

function handleAutocompleteComplete(event: { query?: string }): void {
  const query = event.query?.toLowerCase() ?? ''
  primeAutocompleteSuggestions.value = primeAutocompleteOptions.value.filter(option =>
    option.toLowerCase().includes(query)
  )
}

const tableColumns = computed(() => createConsoleTableColumns(t))
const tableRows = computed(() => createConsoleTableRows(t))
const tableStatusFilter = ref<ConsoleTableStatus | 'all'>('all')
const tableLoading = ref(false)
const tableEmptyMode = ref(false)
const selectedTableRow = ref<ConsoleTableRow | null>(null)
const tableStatusFilterOptions = computed(() => [
  { label: t(demoMessageKey('proTable', 'filters.all')), value: 'all' },
  { label: t(demoMessageKey('proTable', 'status.guarded')), value: 'guarded' },
  { label: t(demoMessageKey('proTable', 'status.app')), value: 'app' },
  { label: t(demoMessageKey('proTable', 'status.blocked')), value: 'blocked' },
])
const filteredTableRows = computed(() => {
  if (tableEmptyMode.value) return []
  if (tableStatusFilter.value === 'all') return tableRows.value
  return tableRows.value.filter(row => row.status === tableStatusFilter.value)
})
const activeTableEvidence = computed(() => selectedTableRow.value ?? filteredTableRows.value[0])

function handleConsoleTableRowClick(row: ConsoleTableRow): void {
  selectedTableRow.value = row
}

const chartOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  legend: { show: true, top: 0 },
  grid: { left: 12, right: 12, top: 44, bottom: 12, containLabel: true },
  xAxis: {
    type: 'category' as const,
    data: [
      t(demoMessageKey('chart', 'axis.contracts')),
      t(demoMessageKey('chart', 'axis.core')),
      t(demoMessageKey('chart', 'axis.web')),
      t(demoMessageKey('chart', 'axis.desktop')),
      t(demoMessageKey('chart', 'axis.wiki')),
    ],
  },
  yAxis: { type: 'value' as const },
  series: [
    {
      name: t(demoMessageKey('chart', 'series.evidenceWeight')),
      type: 'bar',
      data: [100, 100, 92, 86, 95],
    },
    {
      name: t(demoMessageKey('chart', 'series.runtimeRisk')),
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
    :eyebrow="t(pageMessageKey('eyebrow'))"
    :title="t(pageMessageKey('title'))"
    :description="t(pageMessageKey('description'))"
  >
    <template #status>
      <StatusBadgeRow :items="page.status" />
    </template>

    <section class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-4">
      <article
        v-for="(stat, statIndex) in page.stats"
        :key="stat.key"
        class="architecture-stat-card material-elevated col-stretch min-w-0 gap-md"
        :class="statIndex === 0 ? 'lg:col-span-2' : ''"
      >
        <div class="row-between gap-md">
          <span class="text-sm text-muted-foreground">{{ t(statMessageKey(stat, 'label')) }}</span>
          <span class="glass-icon-box text-primary">
            <Icons
              :name="stat.icon"
              size="lg"
            />
          </span>
        </div>
        <strong
          class="text-foreground"
          :class="statIndex === 0 ? 'text-3xl' : 'text-2xl'"
        >
          {{ stat.value ?? t(statMessageKey(stat, 'value')) }}
        </strong>
        <span class="text-sm text-muted-foreground">{{ t(statMessageKey(stat, 'detail')) }}</span>
      </article>
    </section>

    <section class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-3">
      <CapabilityCard
        v-for="capability in page.capabilities"
        :key="capability.key"
        :item="capability"
      />
    </section>

    <RouteEvidenceTable v-if="showRouteEvidence" />

    <DemoSection
      v-if="showPrimeVueAdapterDemo"
      :title="t(demoMessageKey('primeVue', 'title'))"
      :description="t(demoMessageKey('primeVue', 'description'))"
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
            data-testid="prime-input-text"
            :placeholder="t(demoMessageKey('primeVue', 'fields.inputText'))"
            :aria-label="t(demoMessageKey('primeVue', 'fields.inputText'))"
          />
          <InputNumber
            v-model="primeNumber"
            :placeholder="t(demoMessageKey('primeVue', 'fields.inputNumber'))"
            input-id="primevue-input-number"
          />
          <Password
            v-model="primePassword"
            :placeholder="t(demoMessageKey('primeVue', 'fields.password'))"
            :feedback="false"
            toggle-mask
          />
          <Select
            v-model="primeSelect"
            :options="primeSelectOptions"
            option-label="label"
            option-value="value"
            :placeholder="t(demoMessageKey('primeVue', 'fields.select'))"
          />
          <AutoComplete
            v-model="primeAutocomplete"
            :suggestions="primeAutocompleteSuggestions"
            :placeholder="t(demoMessageKey('primeVue', 'fields.autocomplete'))"
            @complete="handleAutocompleteComplete"
          />
          <DatePicker
            v-model="primeDate"
            :placeholder="t(demoMessageKey('primeVue', 'fields.datePicker'))"
            show-icon
          />
        </div>
      </div>
    </DemoSection>

    <DemoSection
      v-if="showProFormDemo"
      :title="t(demoMessageKey('proForm', 'title'))"
      :description="t(demoMessageKey('proForm', 'description'))"
    >
      <div class="col-stretch min-w-0 gap-md">
        <div class="material-solid col-stretch min-w-0 gap-md p-md">
          <ProForm
            :schema="proFormSchema"
            :resolver="proFormResolver"
            @submit="handleConsoleFormSubmit"
          >
            <template #footer="{ submit }">
              <div
                class="col-stretch min-w-0 gap-md border-t border-solid border-border mt-md pt-md"
              >
                <div
                  v-if="submittedEvidence"
                  class="demo-well col-stretch min-w-0 gap-xs bg-success/10"
                >
                  <Tag
                    severity="success"
                    :value="t(demoMessageKey('proForm', 'summary.valid'))"
                  />
                  <span class="text-sm text-foreground">{{ submittedEvidence.owner }}</span>
                  <code
                    class="architecture-safe-code code-inline w-full min-w-0 whitespace-normal break-words leading-normal"
                  >
                    {{ submittedEvidence.command }}
                  </code>
                </div>
                <div class="row-between gap-md flex-wrap">
                  <span class="text-sm text-muted-foreground min-w-0">
                    {{ submittedSummary }}
                  </span>
                  <Button
                    :label="t(demoMessageKey('proForm', 'submit'))"
                    icon="i-lucide-check"
                    @click="submit"
                  />
                </div>
              </div>
            </template>
          </ProForm>
        </div>

        <aside class="demo-well col-stretch min-w-0 gap-sm">
          <span class="text-xs font-semibold text-primary text-no-wrap">
            {{ t(demoMessageKey('proForm', 'asideLabel')) }}
          </span>
          <p class="text-sm text-muted-foreground m-0">
            {{ t(demoMessageKey('proForm', 'asideDescription')) }}
          </p>
        </aside>
      </div>
    </DemoSection>

    <DemoSection
      v-if="showProTableDemo"
      :title="t(demoMessageKey('proTable', 'title'))"
      :description="t(demoMessageKey('proTable', 'description'))"
    >
      <div class="col-stretch min-w-0 gap-md">
        <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
          <section class="demo-well col-stretch min-w-0 gap-sm">
            <label class="text-xs font-medium text-muted-foreground text-ellipsis-1">
              {{ t(demoMessageKey('proTable', 'filters.status')) }}
            </label>
            <Select
              v-model="tableStatusFilter"
              :options="tableStatusFilterOptions"
              option-label="label"
              option-value="value"
            />
          </section>
          <section class="demo-well row-between min-w-0 gap-sm">
            <span class="text-sm text-foreground">
              {{ t(demoMessageKey('proTable', 'states.loading')) }}
            </span>
            <ToggleSwitch v-model="tableLoading" />
          </section>
          <section class="demo-well row-between min-w-0 gap-sm">
            <span class="text-sm text-foreground">
              {{ t(demoMessageKey('proTable', 'states.empty')) }}
            </span>
            <ToggleSwitch v-model="tableEmptyMode" />
          </section>
        </div>

        <div class="pro-table-demo-grid">
          <div class="material-solid col-stretch min-w-0 max-w-full overflow-hidden">
            <ProTable
              :columns="tableColumns"
              :data="filteredTableRows"
              :loading="tableLoading"
              row-key="id"
              :title="t(demoMessageKey('proTable', 'tableTitle'))"
              :pagination="{ pageSize: 3, pageSizeOptions: [3, 5] }"
              show-toolbar
              global-filter
              row-hover
              show-horizontal-lines
              @row-click="handleConsoleTableRowClick"
            >
              <template #empty>
                <EmptyState
                  icon="i-lucide-filter-x"
                  :title="t(demoMessageKey('proTable', 'emptyTitle'))"
                  :description="t(demoMessageKey('proTable', 'emptyDescription'))"
                />
              </template>
            </ProTable>
          </div>

          <aside class="demo-well col-stretch min-w-0 gap-sm">
            <span class="text-xs font-semibold text-primary text-no-wrap">
              {{ t(demoMessageKey('proTable', 'evidence.title')) }}
            </span>
            <template v-if="activeTableEvidence">
              <strong class="text-sm text-foreground">{{ activeTableEvidence.layer }}</strong>
              <p class="text-sm text-muted-foreground m-0">
                {{ activeTableEvidence.detail }}
              </p>
              <code
                class="architecture-safe-code code-inline w-full min-w-0 whitespace-normal break-words leading-normal"
              >
                {{ activeTableEvidence.evidencePath }}
              </code>
              <code
                class="architecture-safe-code code-inline w-full min-w-0 whitespace-normal break-words leading-normal"
              >
                {{ activeTableEvidence.validation }}
              </code>
            </template>
            <p
              v-else
              class="text-sm text-muted-foreground m-0"
            >
              {{ t(demoMessageKey('proTable', 'evidence.empty')) }}
            </p>
          </aside>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      v-if="showChartDemo"
      :title="t(demoMessageKey('chart', 'title'))"
      :description="t(demoMessageKey('chart', 'description'))"
    >
      <UseEcharts
        :option="chartOption"
        class="w-full h-[32vh] min-h-260px"
      />
    </DemoSection>

    <DemoSection
      v-if="showFeedbackDemo"
      :title="t(demoMessageKey('feedback', 'title'))"
      :description="t(demoMessageKey('feedback', 'description'))"
    >
      <div class="grid grid-cols-1 gap-md md:grid-cols-2">
        <EmptyState
          icon="i-lucide-circle-dashed"
          :title="t(demoMessageKey('feedback', 'emptyTitle'))"
          :description="t(demoMessageKey('feedback', 'emptyDescription'))"
        />
        <div class="demo-well col-stretch gap-sm">
          <div class="row-start gap-sm">
            <Icons
              name="i-lucide-message-circle"
              size="lg"
              class="text-primary"
            />
            <span class="text-sm font-semibold text-foreground">
              {{ t(demoMessageKey('feedback', 'facadeTitle')) }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground m-0">
            {{ t(demoMessageKey('feedback', 'facadeDescription')) }}
          </p>
        </div>
      </div>
    </DemoSection>

    <EvidencePanel :items="page.evidence" />
    <CommandPanel
      v-if="page.commands.length"
      :commands="page.commands"
    />
  </ArchitecturePageShell>
</template>

<style scoped>
.architecture-safe-code,
:deep(.architecture-safe-code) {
  overflow-wrap: anywhere;
}

.architecture-stat-card {
  position: relative;
  overflow: hidden;
}

.architecture-stat-card::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  border-top: 1px solid rgb(var(--primary) / 18%);
}

.pro-table-demo-grid {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--spacing-md);
}

@media (width >= 2560px) {
  .pro-table-demo-grid {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: start;
  }
}
</style>
