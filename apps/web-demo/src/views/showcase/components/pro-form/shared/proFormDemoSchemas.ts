import type { FormSchema, SelectOption, ValidationResolver } from '@ccd/vue-ui'

export type ProFormDemoMode =
  | 'api-events'
  | 'async-data'
  | 'basic-schema'
  | 'conditional-visibility'
  | 'dependencies-computed'
  | 'field-arrays'
  | 'grouped-layout'
  | 'overview'
  | 'plugins-draft'
  | 'reactions'
  | 'submit-states'
  | 'validation'

export type ProFormDemoPriority = 'high' | 'medium' | 'low'
export type ProFormDemoOwner = 'product' | 'support' | 'operations'
export type ProFormDemoRegion = 'americas' | 'emea' | 'apac'
export type ProFormDemoPlan = 'starter' | 'growth' | 'scale'
export type ProFormDemoRisk = 'low' | 'medium' | 'high'

export interface ProFormDemoValues extends Record<string, unknown> {
  requestName?: string
  ownerTeam?: ProFormDemoOwner
  priority?: ProFormDemoPriority
  audience?: string
  deliveryWindow?: string
  summary?: string
  needsApproval?: boolean
  approvalNote?: string
  region?: ProFormDemoRegion
  plan?: ProFormDemoPlan
  assignee?: string
  seatCount?: number
  seatPrice?: number
  monthlyCost?: number
  riskLevel?: ProFormDemoRisk
  mitigation?: string
  publishReady?: boolean
  followUp?: string
  milestones?: string[]
  draftTitle?: string
  draftSummary?: string
  eventPreference?: string
  eventNotes?: string
}

export type ProFormDemoTranslate = (key: string, params?: Record<string, string | number>) => string

interface ValidationIssue {
  path: keyof ProFormDemoValues & string
  message: string
}

const REGION_ASSIGNEE_OPTIONS: Record<ProFormDemoRegion, readonly string[]> = {
  americas: ['Maya Chen', 'Noah Rivera'],
  emea: ['Amina Laurent', 'Jonas Weber'],
  apac: ['Mei Tan', 'Ravi Shah'],
}

const DEFAULT_MILESTONES = ['Intake review', 'Customer preview', 'Launch handoff'] as const

function requiredString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function minimumStringLength(value: unknown, minLength: number): boolean {
  return typeof value === 'string' && value.trim().length >= minLength
}

function validationIssuesToErrors(issues: readonly ValidationIssue[]): Record<string, string[]> {
  const errors: Record<string, string[]> = {}

  issues.forEach(issue => {
    const current = errors[issue.path] ?? []
    errors[issue.path] = [...current, issue.message]
  })

  return errors
}

function ownerOptions(t: ProFormDemoTranslate): SelectOption[] {
  return [
    { label: t('showcase.proForm.options.owners.product'), value: 'product' },
    { label: t('showcase.proForm.options.owners.support'), value: 'support' },
    { label: t('showcase.proForm.options.owners.operations'), value: 'operations' },
  ]
}

function priorityOptions(t: ProFormDemoTranslate): SelectOption[] {
  return [
    { label: t('showcase.proForm.options.priorities.high'), value: 'high' },
    { label: t('showcase.proForm.options.priorities.medium'), value: 'medium' },
    { label: t('showcase.proForm.options.priorities.low'), value: 'low' },
  ]
}

function regionOptions(t: ProFormDemoTranslate): SelectOption[] {
  return [
    { label: t('showcase.proForm.options.regions.americas'), value: 'americas' },
    { label: t('showcase.proForm.options.regions.emea'), value: 'emea' },
    { label: t('showcase.proForm.options.regions.apac'), value: 'apac' },
  ]
}

function planOptions(t: ProFormDemoTranslate): SelectOption[] {
  return [
    { label: t('showcase.proForm.options.plans.starter'), value: 'starter' },
    { label: t('showcase.proForm.options.plans.growth'), value: 'growth' },
    { label: t('showcase.proForm.options.plans.scale'), value: 'scale' },
  ]
}

function riskOptions(t: ProFormDemoTranslate): SelectOption[] {
  return [
    { label: t('showcase.proForm.options.risks.low'), value: 'low' },
    { label: t('showcase.proForm.options.risks.medium'), value: 'medium' },
    { label: t('showcase.proForm.options.risks.high'), value: 'high' },
  ]
}

function eventOptions(t: ProFormDemoTranslate): SelectOption[] {
  return [
    { label: t('showcase.proForm.options.events.email'), value: 'email' },
    { label: t('showcase.proForm.options.events.review'), value: 'review' },
    { label: t('showcase.proForm.options.events.call'), value: 'call' },
  ]
}

function textField(
  t: ProFormDemoTranslate,
  name: keyof ProFormDemoValues & string,
  span = 6
): FormSchema<ProFormDemoValues>['fields'][number] {
  return {
    name,
    component: 'input',
    label: t(`showcase.proForm.fields.${name}.label`),
    description: t(`showcase.proForm.fields.${name}.description`),
    defaultValue: '',
    span,
    props: {
      placeholder: t(`showcase.proForm.fields.${name}.placeholder`),
    },
  }
}

function requestBasics(t: ProFormDemoTranslate): FormSchema<ProFormDemoValues>['fields'] {
  return [
    {
      ...textField(t, 'requestName', 6),
      required: true,
      rules: [
        {
          message: t('showcase.proForm.validation.requestNameRequired'),
          validator: requiredString,
        },
      ],
    },
    {
      name: 'ownerTeam',
      component: 'select',
      label: t('showcase.proForm.fields.ownerTeam.label'),
      description: t('showcase.proForm.fields.ownerTeam.description'),
      defaultValue: 'product',
      options: ownerOptions(t),
      span: 6,
    },
    {
      name: 'priority',
      component: 'select',
      label: t('showcase.proForm.fields.priority.label'),
      description: t('showcase.proForm.fields.priority.description'),
      defaultValue: 'medium',
      options: priorityOptions(t),
      span: 6,
    },
    {
      ...textField(t, 'audience', 6),
      required: true,
      rules: [
        {
          message: t('showcase.proForm.validation.audienceRequired'),
          validator: requiredString,
        },
      ],
    },
    {
      name: 'summary',
      component: 'textarea',
      label: t('showcase.proForm.fields.summary.label'),
      description: t('showcase.proForm.fields.summary.description'),
      defaultValue: '',
      span: 12,
      props: {
        rows: 3,
        placeholder: t('showcase.proForm.fields.summary.placeholder'),
      },
      rules: [
        {
          message: t('showcase.proForm.validation.summaryLength'),
          validator: value => !requiredString(value) || minimumStringLength(value, 12),
        },
      ],
    },
  ]
}

function conditionalFields(t: ProFormDemoTranslate): FormSchema<ProFormDemoValues>['fields'] {
  return [
    {
      name: 'needsApproval',
      component: 'switch',
      label: t('showcase.proForm.fields.needsApproval.label'),
      description: t('showcase.proForm.fields.needsApproval.description'),
      defaultValue: false,
      span: 6,
    },
    {
      name: 'riskLevel',
      component: 'select',
      label: t('showcase.proForm.fields.riskLevel.label'),
      description: t('showcase.proForm.fields.riskLevel.description'),
      defaultValue: 'low',
      options: riskOptions(t),
      span: 6,
    },
    {
      name: 'approvalNote',
      component: 'textarea',
      label: t('showcase.proForm.fields.approvalNote.label'),
      description: t('showcase.proForm.fields.approvalNote.description'),
      defaultValue: '',
      deps: ['needsApproval', 'riskLevel'],
      visibleIf: ({ form }) => form.needsApproval === true || form.riskLevel === 'high',
      requiredIf: ({ form }) => form.riskLevel === 'high',
      span: 12,
      props: {
        rows: 3,
        placeholder: t('showcase.proForm.fields.approvalNote.placeholder'),
      },
      rules: [
        {
          message: t('showcase.proForm.validation.approvalNoteRequired'),
          validator: value => !requiredString(value) || minimumStringLength(value, 10),
        },
      ],
    },
    {
      name: 'mitigation',
      component: 'textarea',
      label: t('showcase.proForm.fields.mitigation.label'),
      description: t('showcase.proForm.fields.mitigation.description'),
      defaultValue: '',
      deps: ['riskLevel'],
      disabledIf: ({ form }) => form.riskLevel !== 'high',
      span: 12,
      props: {
        rows: 2,
        placeholder: t('showcase.proForm.fields.mitigation.placeholder'),
      },
    },
  ]
}

function computedFields(t: ProFormDemoTranslate): FormSchema<ProFormDemoValues>['fields'] {
  return [
    {
      name: 'plan',
      component: 'select',
      label: t('showcase.proForm.fields.plan.label'),
      description: t('showcase.proForm.fields.plan.description'),
      defaultValue: 'growth',
      options: planOptions(t),
      span: 6,
    },
    {
      name: 'seatCount',
      component: 'number',
      label: t('showcase.proForm.fields.seatCount.label'),
      description: t('showcase.proForm.fields.seatCount.description'),
      defaultValue: 24,
      span: 6,
      props: {
        min: 1,
        max: 500,
      },
    },
    {
      name: 'seatPrice',
      component: 'number',
      label: t('showcase.proForm.fields.seatPrice.label'),
      description: t('showcase.proForm.fields.seatPrice.description'),
      defaultValue: 18,
      span: 6,
      props: {
        min: 0,
        mode: 'currency',
        currency: 'USD',
      },
      deps: ['plan'],
      computed: ({ form }) => {
        if (form.plan === 'starter') return 12
        if (form.plan === 'scale') return 28
        return 18
      },
      disabledIf: () => true,
    },
    {
      name: 'monthlyCost',
      component: 'number',
      label: t('showcase.proForm.fields.monthlyCost.label'),
      description: t('showcase.proForm.fields.monthlyCost.description'),
      defaultValue: 432,
      span: 6,
      props: {
        mode: 'currency',
        currency: 'USD',
      },
      deps: ['seatCount', 'seatPrice'],
      computed: ({ form }) => Number(form.seatCount ?? 0) * Number(form.seatPrice ?? 0),
      disabledIf: () => true,
    },
  ]
}

function asyncFields(t: ProFormDemoTranslate): FormSchema<ProFormDemoValues>['fields'] {
  return [
    {
      name: 'region',
      component: 'select',
      label: t('showcase.proForm.fields.region.label'),
      description: t('showcase.proForm.fields.region.description'),
      defaultValue: 'americas',
      options: regionOptions(t),
      span: 6,
    },
    {
      name: 'assignee',
      component: 'select',
      label: t('showcase.proForm.fields.assignee.label'),
      description: t('showcase.proForm.fields.assignee.description'),
      defaultValue: 'Maya Chen',
      deps: ['region'],
      span: 6,
      options: ({ form }) => {
        const region = form.region === 'emea' || form.region === 'apac' ? form.region : 'americas'
        return Promise.resolve(
          REGION_ASSIGNEE_OPTIONS[region].map(name => ({ label: name, value: name }))
        )
      },
    },
  ]
}

function reactionFields(t: ProFormDemoTranslate): FormSchema<ProFormDemoValues>['fields'] {
  return [
    {
      name: 'publishReady',
      component: 'switch',
      label: t('showcase.proForm.fields.publishReady.label'),
      description: t('showcase.proForm.fields.publishReady.description'),
      defaultValue: false,
      span: 6,
    },
    {
      name: 'eventPreference',
      component: 'select',
      label: t('showcase.proForm.fields.eventPreference.label'),
      description: t('showcase.proForm.fields.eventPreference.description'),
      defaultValue: 'email',
      options: eventOptions(t),
      span: 6,
    },
    {
      name: 'followUp',
      component: 'textarea',
      label: t('showcase.proForm.fields.followUp.label'),
      description: t('showcase.proForm.fields.followUp.description'),
      defaultValue: t('showcase.proForm.defaults.followUp'),
      deps: ['publishReady', 'eventPreference'],
      span: 12,
      props: {
        rows: 3,
        placeholder: t('showcase.proForm.fields.followUp.placeholder'),
      },
      reactions: [
        {
          watch: 'publishReady',
          action: 'custom',
          effect: ({ form, setFieldValue }) => {
            if (form.publishReady === true) {
              setFieldValue('followUp', t('showcase.proForm.defaults.readyFollowUp'))
            }
          },
        },
        {
          watch: 'eventPreference',
          action: 'custom',
          effect: ({ form, setFieldProps }) => {
            setFieldProps('followUp', {
              placeholder: t(
                `showcase.proForm.reactionPlaceholders.${String(form.eventPreference)}`
              ),
            })
          },
        },
      ],
    },
  ]
}

function milestoneField(t: ProFormDemoTranslate): FormSchema<ProFormDemoValues>['fields'][number] {
  return {
    name: 'milestones',
    component: 'input',
    label: t('showcase.proForm.fields.milestones.label'),
    description: t('showcase.proForm.fields.milestones.description'),
    defaultValue: [...DEFAULT_MILESTONES],
    span: 12,
  }
}

function draftFields(t: ProFormDemoTranslate): FormSchema<ProFormDemoValues>['fields'] {
  return [
    {
      name: 'draftTitle',
      component: 'input',
      label: t('showcase.proForm.fields.draftTitle.label'),
      description: t('showcase.proForm.fields.draftTitle.description'),
      defaultValue: t('showcase.proForm.defaults.draftTitle'),
      span: 6,
      props: {
        placeholder: t('showcase.proForm.fields.draftTitle.placeholder'),
      },
    },
    {
      name: 'draftSummary',
      component: 'textarea',
      label: t('showcase.proForm.fields.draftSummary.label'),
      description: t('showcase.proForm.fields.draftSummary.description'),
      defaultValue: t('showcase.proForm.defaults.draftSummary'),
      span: 12,
      props: {
        rows: 3,
        placeholder: t('showcase.proForm.fields.draftSummary.placeholder'),
      },
    },
  ]
}

export function createProFormDemoInitialValues(
  t: ProFormDemoTranslate,
  mode: ProFormDemoMode
): Partial<ProFormDemoValues> {
  const base: Partial<ProFormDemoValues> = {
    requestName: t('showcase.proForm.defaults.requestName'),
    ownerTeam: 'product',
    priority: mode === 'validation' ? 'high' : 'medium',
    audience: t('showcase.proForm.defaults.audience'),
    summary: t('showcase.proForm.defaults.summary'),
    deliveryWindow: t('showcase.proForm.defaults.deliveryWindow'),
    needsApproval: mode === 'conditional-visibility',
    region: 'americas',
    plan: 'growth',
    assignee: 'Maya Chen',
    seatCount: 24,
    seatPrice: 18,
    monthlyCost: 432,
    riskLevel: mode === 'conditional-visibility' ? 'high' : 'low',
    publishReady: false,
    eventPreference: 'email',
    followUp: t('showcase.proForm.defaults.followUp'),
    milestones: [...DEFAULT_MILESTONES],
  }

  if (mode === 'validation') {
    return {
      ...base,
      requestName: '',
      summary: '',
      approvalNote: '',
    }
  }

  return base
}

export function createProFormDemoSchema(
  t: ProFormDemoTranslate,
  mode: ProFormDemoMode
): FormSchema<ProFormDemoValues> {
  const fieldsByMode: Record<ProFormDemoMode, FormSchema<ProFormDemoValues>['fields']> = {
    overview: [
      {
        type: 'group',
        name: 'overviewRequest',
        label: t('showcase.proForm.groups.request'),
        children: [...requestBasics(t).slice(0, 4), ...computedFields(t).slice(0, 2)],
      },
    ],
    'basic-schema': requestBasics(t),
    'grouped-layout': [
      {
        type: 'group',
        name: 'requestGroup',
        label: t('showcase.proForm.groups.request'),
        layout: { type: 'grid', span: 12 },
        children: requestBasics(t),
      },
      {
        type: 'group',
        name: 'planningGroup',
        label: t('showcase.proForm.groups.planning'),
        layout: { type: 'grid', span: 12 },
        children: [...computedFields(t), ...conditionalFields(t).slice(0, 2)],
      },
    ],
    validation: [...requestBasics(t), ...conditionalFields(t).slice(0, 3)],
    'dependencies-computed': [...requestBasics(t).slice(0, 2), ...computedFields(t)],
    'conditional-visibility': [...requestBasics(t).slice(0, 3), ...conditionalFields(t)],
    reactions: [...requestBasics(t).slice(0, 2), ...reactionFields(t)],
    'async-data': [...requestBasics(t).slice(0, 2), ...asyncFields(t)],
    'field-arrays': [...requestBasics(t).slice(0, 2), milestoneField(t)],
    'plugins-draft': draftFields(t),
    'submit-states': [...requestBasics(t).slice(0, 4), ...conditionalFields(t).slice(0, 2)],
    'api-events': [...requestBasics(t).slice(0, 3), ...reactionFields(t).slice(0, 2)],
  }

  return {
    layout: {
      type: 'grid',
      gap: 'var(--spacing-md)',
    },
    fields: fieldsByMode[mode],
  }
}

export function createProFormDemoResolver(
  t: ProFormDemoTranslate,
  mode: ProFormDemoMode
): ValidationResolver<ProFormDemoValues> {
  return async (values: ProFormDemoValues) => {
    const issues: ValidationIssue[] = []

    if (!requiredString(values.requestName) && mode !== 'plugins-draft') {
      issues.push({
        path: 'requestName',
        message: t('showcase.proForm.validation.requestNameRequired'),
      })
    }

    if (mode === 'validation' && !minimumStringLength(values.summary, 12)) {
      issues.push({
        path: 'summary',
        message: t('showcase.proForm.validation.summaryLength'),
      })
    }

    if (values.riskLevel === 'high' && !minimumStringLength(values.approvalNote, 10)) {
      issues.push({
        path: 'approvalNote',
        message: t('showcase.proForm.validation.approvalNoteRequired'),
      })
    }

    if (
      Array.isArray(values.milestones) &&
      values.milestones.some(item => !minimumStringLength(item, 3))
    ) {
      issues.push({
        path: 'milestones',
        message: t('showcase.proForm.validation.milestonesRequired'),
      })
    }

    return {
      valid: issues.length === 0,
      errors: validationIssuesToErrors(issues),
    }
  }
}
