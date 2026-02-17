import type { Schema } from '@/components/SchemaForm'

export const sectionsSchema: Schema = {
  gap: 24,
  layout: {
    cols: 2,
  },
  sections: [
    {
      title: '基本信息',
      fields: ['firstName', 'lastName'],
    },
    {
      title: '联系方式',
      fields: ['city', 'zip', 'street'],
    },
    {
      title: '偏好设置',
      fields: ['newsletter', 'theme'],
    },
  ],
  columns: [
    {
      field: 'firstName',
      label: '名',
      component: 'InputText',
      layout: { span: 6 },
    },
    {
      field: 'lastName',
      label: '姓',
      component: 'InputText',
      layout: { span: 6 },
    },
    {
      field: 'city',
      label: '城市',
      component: 'InputText',
      layout: { span: 6 },
    },
    {
      field: 'zip',
      label: '邮编',
      component: 'InputNumber',
      props: { useGrouping: false },
      layout: { span: 6 },
    },
    {
      field: 'street',
      label: '街道地址',
      component: 'Textarea',
      layout: { span: 12 },
    },
    {
      field: 'newsletter',
      label: '订阅简报',
      component: 'ToggleSwitch',
    },
    {
      field: 'theme',
      label: '主题色',
      component: 'ColorPicker',
    },
  ],
}
