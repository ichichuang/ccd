<script setup lang="ts">
import { DraftStorage, ProFormPlugins, type ProFormPlugin, type ProFormExpose } from '@ccd/vue-ui'
import { useI18n } from 'vue-i18n'
import { showcaseCatalog } from '../../../data/showcaseCatalog'
import type { ShowcaseCatalogItem } from '../../../data/types'
import ShowcaseDemoPanel from '../../../shared/ShowcaseDemoPanel.vue'
import ShowcaseFeatureCard from '../../../shared/ShowcaseFeatureCard.vue'
import ShowcasePageShell from '../../../shared/ShowcasePageShell.vue'
import ShowcaseRelatedLinks from '../../../shared/ShowcaseRelatedLinks.vue'
import ShowcaseSourceLinks from '../../../shared/ShowcaseSourceLinks.vue'
import ProFormFieldArrayControls from './ProFormFieldArrayControls.vue'
import {
  createProFormDemoInitialValues,
  createProFormDemoResolver,
  createProFormDemoSchema,
  type ProFormDemoMode,
  type ProFormDemoValues,
} from './proFormDemoSchemas'

type ProFormFeatureKey =
  | 'apiEvents'
  | 'asyncOptions'
  | 'conditionalLogic'
  | 'dependenciesComputed'
  | 'draftPlugin'
  | 'fieldArrays'
  | 'groupedLayout'
  | 'localFeedback'
  | 'reactions'
  | 'schemaBasics'
  | 'submitStates'
  | 'validation'

type ProFormTechnicalKey =
  | 'draftStorage'
  | 'exposedApis'
  | 'fieldArrayHook'
  | 'localOnly'
  | 'pluginApi'
  | 'proFormOnly'
  | 'schemaContracts'
  | 'validationResolver'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

interface ProFormModeConfig {
  features: readonly ProFormFeatureKey[]
  explanations: readonly ProFormFeatureKey[]
  technical: readonly ProFormTechnicalKey[]
  relatedIds: readonly string[]
  fieldArray?: boolean
  draft?: boolean
  submitStates?: boolean
  eventLog?: boolean
}

interface SummaryMessage {
  key: string
  params?: Record<string, string | number>
}

defineOptions({ name: 'ProFormDemoShell' })

const props = defineProps<{
  id: string
  mode: ProFormDemoMode
}>()

const { t } = useI18n()

const SHARED_SOURCE_PATHS = [
  'apps/web-demo/src/views/showcase/components/pro-form/shared/ProFormDemoShell.vue',
  'apps/web-demo/src/views/showcase/components/pro-form/shared/proFormDemoSchemas.ts',
]
const FIELD_ARRAY_SOURCE_PATH =
  'apps/web-demo/src/views/showcase/components/pro-form/shared/ProFormFieldArrayControls.vue'
const DRAFT_STORAGE_KEY = 'showcase-pro-form-draft'

const MODE_CONFIGS: Record<ProFormDemoMode, ProFormModeConfig> = {
  overview: {
    features: ['schemaBasics', 'localFeedback'],
    explanations: ['dependenciesComputed', 'validation'],
    technical: ['proFormOnly', 'schemaContracts'],
    relatedIds: ['components-pro-form-basic-schema', 'components-pro-form-validation'],
  },
  'basic-schema': {
    features: ['schemaBasics', 'groupedLayout'],
    explanations: ['validation', 'localFeedback'],
    technical: ['proFormOnly', 'schemaContracts'],
    relatedIds: ['components-pro-form-grouped-layout', 'components-pro-form-validation'],
  },
  'grouped-layout': {
    features: ['groupedLayout', 'schemaBasics'],
    explanations: ['dependenciesComputed', 'conditionalLogic'],
    technical: ['schemaContracts', 'proFormOnly'],
    relatedIds: ['components-pro-form-basic-schema', 'components-pro-form-dependencies-computed'],
  },
  validation: {
    features: ['validation', 'localFeedback'],
    explanations: ['schemaBasics', 'conditionalLogic'],
    technical: ['validationResolver', 'exposedApis'],
    relatedIds: ['components-pro-form-basic-schema', 'components-pro-form-submit-states'],
    eventLog: true,
  },
  'dependencies-computed': {
    features: ['dependenciesComputed', 'schemaBasics'],
    explanations: ['localFeedback', 'conditionalLogic'],
    technical: ['schemaContracts', 'exposedApis'],
    relatedIds: ['components-pro-form-conditional-visibility', 'components-pro-form-reactions'],
  },
  'conditional-visibility': {
    features: ['conditionalLogic', 'validation'],
    explanations: ['dependenciesComputed', 'localFeedback'],
    technical: ['schemaContracts', 'validationResolver'],
    relatedIds: ['components-pro-form-dependencies-computed', 'components-pro-form-validation'],
  },
  reactions: {
    features: ['reactions', 'localFeedback'],
    explanations: ['dependenciesComputed', 'apiEvents'],
    technical: ['schemaContracts', 'exposedApis'],
    relatedIds: ['components-pro-form-dependencies-computed', 'components-pro-form-api-events'],
    eventLog: true,
  },
  'async-data': {
    features: ['asyncOptions', 'localFeedback'],
    explanations: ['dependenciesComputed', 'validation'],
    technical: ['localOnly', 'schemaContracts'],
    relatedIds: ['components-pro-form-dependencies-computed', 'components-pro-form-api-events'],
  },
  'field-arrays': {
    features: ['fieldArrays', 'localFeedback'],
    explanations: ['schemaBasics', 'validation'],
    technical: ['fieldArrayHook', 'exposedApis'],
    relatedIds: ['components-pro-form-basic-schema', 'components-pro-form-submit-states'],
    fieldArray: true,
  },
  'plugins-draft': {
    features: ['draftPlugin', 'localFeedback'],
    explanations: ['schemaBasics', 'submitStates'],
    technical: ['pluginApi', 'draftStorage'],
    relatedIds: ['components-pro-form-submit-states', 'components-pro-form-api-events'],
    draft: true,
  },
  'submit-states': {
    features: ['submitStates', 'localFeedback'],
    explanations: ['validation', 'apiEvents'],
    technical: ['exposedApis', 'localOnly'],
    relatedIds: ['components-pro-form-validation', 'components-pro-form-api-events'],
    submitStates: true,
  },
  'api-events': {
    features: ['apiEvents', 'localFeedback'],
    explanations: ['reactions', 'validation'],
    technical: ['exposedApis', 'schemaContracts'],
    relatedIds: ['components-pro-form-reactions', 'components-pro-form-submit-states'],
    eventLog: true,
  },
}

const FEATURE_ICONS: Record<ProFormFeatureKey, `i-${string}`> = {
  apiEvents: 'i-lucide-radio',
  asyncOptions: 'i-lucide-cloud',
  conditionalLogic: 'i-lucide-eye',
  dependenciesComputed: 'i-lucide-route',
  draftPlugin: 'i-lucide-save',
  fieldArrays: 'i-lucide-list-plus',
  groupedLayout: 'i-lucide-panels-top-left',
  localFeedback: 'i-lucide-message-square-text',
  reactions: 'i-lucide-zap',
  schemaBasics: 'i-lucide-braces',
  submitStates: 'i-lucide-loader-circle',
  validation: 'i-lucide-badge-check',
}

const TECHNICAL_ICONS: Record<ProFormTechnicalKey, `i-${string}`> = {
  draftStorage: 'i-lucide-database',
  exposedApis: 'i-lucide-terminal-square',
  fieldArrayHook: 'i-lucide-list-plus',
  localOnly: 'i-lucide-wifi-off',
  pluginApi: 'i-lucide-plug',
  proFormOnly: 'i-lucide-form-input',
  schemaContracts: 'i-lucide-file-code-2',
  validationResolver: 'i-lucide-shield-check',
}

let pluginInstallCount = 0

const formRef = ref<ProFormExpose<ProFormDemoValues> | null>(null)
const submitState = ref<SubmitState>('idle')
const forceSubmitError = ref(false)
const actionMessage = ref<SummaryMessage>({ key: 'showcase.proForm.actions.ready' })
const stateMessage = ref<SummaryMessage | null>(null)
const valuesMessage = ref<SummaryMessage | null>(null)
const draftMessage = ref<SummaryMessage | null>(null)
const eventMessages = ref<string[]>([])

const modeConfig = computed(() => MODE_CONFIGS[props.mode])
const item = computed(() => requireCatalogItem(props.id))
const schema = computed(() => createProFormDemoSchema(t, props.mode))
const initialValues = computed(() => createProFormDemoInitialValues(t, props.mode))
const resolver = computed(() => createProFormDemoResolver(t, props.mode))
const relatedIds = computed(() => modeConfig.value.relatedIds)
const featureKeys = computed(() => modeConfig.value.features)
const explanationKeys = computed(() => modeConfig.value.explanations)
const technicalKeys = computed(() => modeConfig.value.technical)
const sourcePaths = computed(() => {
  const sharedPaths = modeConfig.value.fieldArray
    ? [...SHARED_SOURCE_PATHS, FIELD_ARRAY_SOURCE_PATH]
    : SHARED_SOURCE_PATHS
  return [...item.value.sourcePaths, ...sharedPaths]
})
const demoTitle = computed(() => t(`${item.value.localeBaseKey}.try`))
const demoDescription = computed(() => t(`showcase.proForm.modes.${props.mode}.demo`))
const actionSummary = computed(() => t(actionMessage.value.key, actionMessage.value.params ?? {}))
const stateSummary = computed(() => {
  if (!stateMessage.value) return t('showcase.proForm.state.empty')
  return t(stateMessage.value.key, stateMessage.value.params ?? {})
})
const valuesSummary = computed(() => {
  if (!valuesMessage.value) return t('showcase.proForm.values.empty')
  return t(valuesMessage.value.key, valuesMessage.value.params ?? {})
})
const draftSummary = computed(() => {
  if (!draftMessage.value) return t('showcase.proForm.draft.empty')
  return t(draftMessage.value.key, draftMessage.value.params ?? {})
})
const persistKey = computed(() => (modeConfig.value.draft ? DRAFT_STORAGE_KEY : undefined))
const submitSeverity = computed(() => {
  if (submitState.value === 'success') return 'success'
  if (submitState.value === 'error') return 'danger'
  if (submitState.value === 'submitting') return 'warn'
  return 'info'
})
const submitStateLabel = computed(() => t(`showcase.proForm.submitState.${submitState.value}`))

watch(
  () => props.mode,
  () => {
    submitState.value = 'idle'
    forceSubmitError.value = false
    actionMessage.value = { key: 'showcase.proForm.actions.ready' }
    stateMessage.value = null
    valuesMessage.value = null
    draftMessage.value = null
    eventMessages.value = []
    if (modeConfig.value.draft) installDraftPlugin()
  },
  { immediate: true }
)

function requireCatalogItem(id: string): ShowcaseCatalogItem {
  const catalogItem = showcaseCatalog.find(candidate => candidate.id === id)
  if (!catalogItem) throw new Error(`[ProFormDemoShell] Missing showcase catalog item: ${id}`)
  return catalogItem
}

function getFeatureIcon(key: ProFormFeatureKey): `i-${string}` {
  return FEATURE_ICONS[key]
}

function getTechnicalIcon(key: ProFormTechnicalKey): `i-${string}` {
  return TECHNICAL_ICONS[key]
}

function boolLabel(value: boolean): string {
  return t(value ? 'showcase.proForm.booleans.yes' : 'showcase.proForm.booleans.no')
}

function fieldList(values: Record<string, unknown>): string {
  const fields = Object.keys(values).filter(key => values[key] !== undefined)
  return fields.length ? fields.join(', ') : t('showcase.proForm.values.none')
}

function pushEvent(key: string, detail: string): void {
  if (!modeConfig.value.eventLog) return
  eventMessages.value = [t(key, { detail }), ...eventMessages.value].slice(0, 5)
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    const { start } = useTimeoutFn(resolve, ms, { immediate: false })
    start()
  })
}

function installDraftPlugin(): void {
  const beforeInstallCount = pluginInstallCount
  const plugin: ProFormPlugin = {
    name: 'showcase-pro-form-draft-plugin',
    install: () => {
      pluginInstallCount += 1
    },
  }

  ProFormPlugins.use(plugin)
  draftMessage.value = {
    key:
      pluginInstallCount > beforeInstallCount
        ? 'showcase.proForm.draft.pluginInstalled'
        : 'showcase.proForm.draft.pluginReady',
  }
}

function normalizeDraftPayload(payload: Record<string, unknown>): Partial<ProFormDemoValues> {
  return {
    draftTitle: typeof payload.draftTitle === 'string' ? payload.draftTitle : undefined,
    draftSummary: typeof payload.draftSummary === 'string' ? payload.draftSummary : undefined,
  }
}

async function handleValidate(): Promise<void> {
  const valid = (await formRef.value?.validate()) ?? false
  actionMessage.value = {
    key: valid ? 'showcase.proForm.actions.valid' : 'showcase.proForm.actions.invalid',
  }
  pushEvent('showcase.proForm.events.validate', boolLabel(valid))
}

function handleGetValues(): void {
  const values = formRef.value?.getValues() ?? {}
  valuesMessage.value = {
    key: 'showcase.proForm.values.summary',
    params: {
      fields: fieldList(values),
    },
  }
  actionMessage.value = { key: 'showcase.proForm.actions.valuesRead' }
  pushEvent('showcase.proForm.events.values', fieldList(values))
}

function handleGetFormState(): void {
  const formState = formRef.value?.getFormState()
  if (!formState) return

  stateMessage.value = {
    key: 'showcase.proForm.state.summary',
    params: {
      dirty: boolLabel(formState.dirty),
      valid: boolLabel(formState.valid),
      submitting: boolLabel(formState.submitting),
      errors: Object.keys(formState.errors).length,
    },
  }
  actionMessage.value = { key: 'showcase.proForm.actions.stateRead' }
  pushEvent('showcase.proForm.events.state', boolLabel(formState.valid))
}

async function handleSubmitApi(): Promise<void> {
  await formRef.value?.submit()
  actionMessage.value = { key: 'showcase.proForm.actions.submitCalled' }
  pushEvent('showcase.proForm.events.submitApi', submitState.value)
}

function handleSaveDraft(): void {
  if (!modeConfig.value.draft) return
  DraftStorage.save(DRAFT_STORAGE_KEY, formRef.value?.getValues() ?? {})
  draftMessage.value = { key: 'showcase.proForm.draft.saved' }
  actionMessage.value = { key: 'showcase.proForm.actions.draftSaved' }
}

function handleReadDraft(): void {
  if (!modeConfig.value.draft) return
  const draft = DraftStorage.load(DRAFT_STORAGE_KEY)
  if (!draft) {
    draftMessage.value = { key: 'showcase.proForm.draft.empty' }
    return
  }

  formRef.value?.form.setFieldsValue(normalizeDraftPayload(draft))
  draftMessage.value = { key: 'showcase.proForm.draft.loaded' }
  actionMessage.value = { key: 'showcase.proForm.actions.draftLoaded' }
}

function handleClearDraft(): void {
  if (!modeConfig.value.draft) return
  DraftStorage.clear(DRAFT_STORAGE_KEY)
  draftMessage.value = { key: 'showcase.proForm.draft.cleared' }
  actionMessage.value = { key: 'showcase.proForm.actions.draftCleared' }
}

async function handleFormSubmit(values: ProFormDemoValues): Promise<void> {
  submitState.value = 'submitting'
  actionMessage.value = {
    key: 'showcase.proForm.actions.submitting',
    params: {
      fields: fieldList(values),
    },
  }
  pushEvent('showcase.proForm.events.submit', fieldList(values))

  if (modeConfig.value.submitStates) {
    await wait(320)
  }

  if (modeConfig.value.submitStates && forceSubmitError.value) {
    submitState.value = 'error'
    actionMessage.value = { key: 'showcase.proForm.actions.submitFailed' }
    return
  }

  submitState.value = 'success'
  actionMessage.value = {
    key: 'showcase.proForm.actions.submitted',
    params: {
      fields: fieldList(values),
    },
  }
}
</script>

<template>
  <ShowcasePageShell
    :item="item"
    :related-ids="relatedIds"
  >
    <template #demo>
      <ShowcaseDemoPanel
        :title="demoTitle"
        :description="demoDescription"
      >
        <div class="col-stretch min-w-0 gap-md">
          <div class="row-start min-w-0 gap-sm flex-wrap">
            <Tag
              :value="$t(`showcase.shell.demoLevels.${item.demoLevel}`)"
              :severity="item.demoLevel === 'complete' ? 'success' : 'info'"
            />
            <Tag
              :value="$t(`showcase.proForm.modes.${props.mode}.label`)"
              severity="secondary"
            />
            <Tag
              :value="$t('showcase.proForm.badges.proFormOnly')"
              severity="contrast"
            />
          </div>

          <section class="demo-well col-stretch min-w-0 gap-sm">
            <div class="row-start min-w-0 gap-sm flex-wrap">
              <Button
                size="small"
                icon="i-lucide-badge-check"
                :label="$t('showcase.proForm.controls.validate')"
                @click="handleValidate"
              />
              <Button
                size="small"
                severity="secondary"
                outlined
                icon="i-lucide-list-checks"
                :label="$t('showcase.proForm.controls.getValues')"
                @click="handleGetValues"
              />
              <Button
                size="small"
                severity="secondary"
                outlined
                icon="i-lucide-activity"
                :label="$t('showcase.proForm.controls.getFormState')"
                @click="handleGetFormState"
              />
              <Button
                size="small"
                severity="secondary"
                outlined
                icon="i-lucide-send"
                :label="$t('showcase.proForm.controls.submitApi')"
                @click="handleSubmitApi"
              />
            </div>
            <p class="text-sm text-muted-foreground m-0">
              {{ actionSummary }}
            </p>
          </section>

          <section
            v-if="modeConfig.submitStates"
            class="demo-well row-between min-w-0 gap-md flex-wrap"
          >
            <div class="col-stretch min-w-0 gap-xs">
              <span class="text-sm font-semibold text-foreground">
                {{ $t('showcase.proForm.submitState.title') }}
              </span>
              <p class="text-sm text-muted-foreground m-0">
                {{ $t('showcase.proForm.submitState.description') }}
              </p>
            </div>
            <div class="row-start gap-sm">
              <ToggleSwitch v-model="forceSubmitError" />
              <span class="text-sm text-foreground">
                {{ $t('showcase.proForm.submitState.forceError') }}
              </span>
            </div>
          </section>

          <section
            v-if="modeConfig.draft"
            class="demo-well col-stretch min-w-0 gap-sm"
          >
            <div class="row-start min-w-0 gap-sm flex-wrap">
              <Button
                size="small"
                icon="i-lucide-save"
                :label="$t('showcase.proForm.controls.saveDraft')"
                @click="handleSaveDraft"
              />
              <Button
                size="small"
                severity="secondary"
                outlined
                icon="i-lucide-folder-open"
                :label="$t('showcase.proForm.controls.readDraft')"
                @click="handleReadDraft"
              />
              <Button
                size="small"
                severity="secondary"
                outlined
                icon="i-lucide-trash-2"
                :label="$t('showcase.proForm.controls.clearDraft')"
                @click="handleClearDraft"
              />
            </div>
            <p class="text-sm text-muted-foreground m-0">
              {{ draftSummary }}
            </p>
          </section>

          <section class="material-solid col-stretch min-w-0 gap-md p-md">
            <ProForm
              ref="formRef"
              :schema="schema"
              :initial-values="initialValues"
              :resolver="resolver"
              :persist-key="persistKey"
              :auto-save="modeConfig.draft === true"
              validate-on="submit"
              @submit="handleFormSubmit"
            >
              <template #field-milestones>
                <ProFormFieldArrayControls v-if="modeConfig.fieldArray" />
              </template>

              <template #footer="{ formState, submit }">
                <div class="col-stretch min-w-0 gap-md pt-md">
                  <div
                    class="border-t border-t-solid border-border"
                    aria-hidden="true"
                  />
                  <div class="row-between min-w-0 gap-md flex-wrap">
                    <div class="row-start gap-sm flex-wrap">
                      <Tag
                        :value="submitStateLabel"
                        :severity="submitSeverity"
                      />
                      <Tag
                        :value="
                          formState.valid
                            ? $t('showcase.proForm.state.valid')
                            : $t('showcase.proForm.state.invalid')
                        "
                        :severity="formState.valid ? 'success' : 'danger'"
                      />
                    </div>
                    <Button
                      icon="i-lucide-send"
                      :label="$t('showcase.proForm.controls.submit')"
                      :loading="formState.submitting || submitState === 'submitting'"
                      @click="submit"
                    />
                  </div>
                </div>
              </template>
            </ProForm>
          </section>

          <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
            <section class="demo-well col-stretch min-w-0 gap-xs">
              <span class="text-xs font-semibold text-primary">
                {{ $t('showcase.proForm.state.title') }}
              </span>
              <p class="text-sm text-muted-foreground m-0">
                {{ stateSummary }}
              </p>
            </section>

            <section class="demo-well col-stretch min-w-0 gap-xs">
              <span class="text-xs font-semibold text-primary">
                {{ $t('showcase.proForm.values.title') }}
              </span>
              <p class="text-sm text-muted-foreground m-0">
                {{ valuesSummary }}
              </p>
            </section>

            <section class="demo-well col-stretch min-w-0 gap-xs">
              <span class="text-xs font-semibold text-primary">
                {{ $t('showcase.proForm.submitState.shortTitle') }}
              </span>
              <p class="text-sm text-muted-foreground m-0">
                {{ submitStateLabel }}
              </p>
            </section>
          </div>

          <section
            v-if="modeConfig.eventLog"
            class="demo-well col-stretch min-w-0 gap-sm"
          >
            <span class="text-xs font-semibold text-primary">
              {{ $t('showcase.proForm.events.title') }}
            </span>
            <ul
              v-if="eventMessages.length"
              class="col-stretch gap-xs m-0 p-0 list-none"
            >
              <li
                v-for="message in eventMessages"
                :key="message"
                class="code-inline"
              >
                {{ message }}
              </li>
            </ul>
            <p
              v-else
              class="text-sm text-muted-foreground m-0"
            >
              {{ $t('showcase.proForm.events.empty') }}
            </p>
          </section>
        </div>
      </ShowcaseDemoPanel>
    </template>

    <template #features>
      <ShowcaseFeatureCard
        v-for="featureKey in featureKeys"
        :key="featureKey"
        :icon="getFeatureIcon(featureKey)"
        :title="$t(`showcase.proForm.features.${featureKey}.title`)"
        :description="$t(`showcase.proForm.features.${featureKey}.description`)"
        :tag="$t(`showcase.proForm.features.${featureKey}.tag`)"
      />
    </template>

    <template #explanation>
      <ShowcaseFeatureCard
        v-for="featureKey in explanationKeys"
        :key="featureKey"
        :icon="getFeatureIcon(featureKey)"
        :title="$t(`showcase.proForm.features.${featureKey}.title`)"
        :description="$t(`showcase.proForm.features.${featureKey}.description`)"
        :tag="$t(`showcase.proForm.features.${featureKey}.tag`)"
      />
    </template>

    <template #technical="{ item: scopedItem }">
      <ShowcaseFeatureCard
        v-for="technicalKey in technicalKeys"
        :key="technicalKey"
        :icon="getTechnicalIcon(technicalKey)"
        :title="$t(`showcase.proForm.technical.${technicalKey}.title`)"
        :description="$t(`showcase.proForm.technical.${technicalKey}.description`)"
        :tag="$t('showcase.shell.technical.title')"
      />
      <ShowcaseSourceLinks
        :item="scopedItem"
        :source-paths="sourcePaths"
      />
      <ShowcaseRelatedLinks
        :item="scopedItem"
        :related-ids="relatedIds"
      />
    </template>
  </ShowcasePageShell>
</template>
