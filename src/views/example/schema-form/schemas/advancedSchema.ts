import type { Schema } from '@/components/schema-form'

export const advancedSchema: Schema = {
  gap: 24,
  layout: {
    cols: 2,
    labelWidth: 120,
  },
  columns: [
    {
      field: 'advancedInput',
      label: '高级输入',
      component: 'InputText',
      props: { placeholder: '测试输入 (高级)' },
    },
    {
      field: 'preference',
      label: '偏好',
      component: 'Select',
      props: {
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    },
  ],
}
