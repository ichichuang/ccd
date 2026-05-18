import type { FormSchema } from '@/components/ProForm'

type DashboardTranslate = (key: string) => string

export interface QuickActionValues extends Record<string, unknown> {
  taskTitle: string
  owner: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string
  notes: string
  enableSla: boolean
}

export function createQuickActionSchema(t: DashboardTranslate): FormSchema {
  return {
    layout: { type: 'grid', gap: 'var(--spacing-md)' },
    fields: [
      {
        type: 'section',
        name: 'task_meta',
        label: t('dashboard.quickAction.fields.sectionLabel'),
        layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 12 } },
        children: [
          {
            name: 'taskTitle',
            component: 'input',
            label: t('dashboard.quickAction.fields.taskTitle'),
            required: true,
            span: { xs: 12, sm: 12 },
            rules: [
              {
                message: t('dashboard.quickAction.fields.taskTitleRequired'),
                validator: v => typeof v === 'string' && v.trim().length > 0,
              },
            ],
            props: { placeholder: t('dashboard.quickAction.fields.taskTitlePlaceholder') },
          },
          {
            name: 'owner',
            component: 'input',
            label: t('dashboard.quickAction.fields.owner'),
            required: true,
            span: { xs: 12, sm: 6 },
            props: { placeholder: t('dashboard.quickAction.fields.ownerPlaceholder') },
          },
          {
            name: 'priority',
            component: 'select',
            label: t('dashboard.quickAction.fields.priority'),
            span: { xs: 12, sm: 6 },
            props: {
              placeholder: t('dashboard.quickAction.fields.priorityPlaceholder'),
              options: [
                { label: t('dashboard.quickAction.fields.priorityP1'), value: 'P1' },
                { label: t('dashboard.quickAction.fields.priorityP2'), value: 'P2' },
                { label: t('dashboard.quickAction.fields.priorityP3'), value: 'P3' },
              ],
            },
            defaultValue: 'P2',
          },
          {
            name: 'dueDate',
            component: 'date',
            label: t('dashboard.quickAction.fields.dueDate'),
            span: { xs: 12, sm: 6 },
            props: {
              showIcon: true,
              placeholder: t('dashboard.quickAction.fields.dueDatePlaceholder'),
            },
          },
          {
            name: 'enableSla',
            component: 'switch',
            label: t('dashboard.quickAction.fields.enableSla'),
            span: { xs: 12, sm: 6 },
            defaultValue: true,
          },
          {
            name: 'notes',
            component: 'textarea',
            label: t('dashboard.quickAction.fields.notes'),
            span: { xs: 12, sm: 12 },
            props: { rows: 4, placeholder: t('dashboard.quickAction.fields.notesPlaceholder') },
          },
        ],
      },
    ],
  }
}

export function createQuickActionInitialValues(t: DashboardTranslate): QuickActionValues {
  return {
    taskTitle: t('dashboard.quickAction.defaults.taskTitle'),
    owner: t('dashboard.quickAction.defaults.owner'),
    priority: 'P1',
    dueDate: '2026-04-20',
    notes: t('dashboard.quickAction.defaults.notes'),
    enableSla: true,
  }
}
