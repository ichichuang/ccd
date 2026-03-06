import type { Schema } from '@/components/SchemaForm'

const categoryOptions = [
  { label: '类型 A', value: 'a' },
  { label: '类型 B', value: 'b' },
  { label: '类型 C', value: 'c' },
]

export const wizardSchema: Schema = {
  gap: 24,
  layout: {
    cols: 1,
    labelWidth: 120,
  },
  steps: [
    { title: '基础信息', fields: ['name', 'email'] },
    { title: '详细配置', fields: ['category', 'notes'] },
    { title: '确认提交', fields: ['agreed'] },
  ],
  columns: [
    {
      field: 'name',
      label: '姓名',
      component: 'InputText',
      props: { placeholder: '请输入姓名' },
      rules: 'required',
    },
    {
      field: 'email',
      label: '邮箱',
      component: 'InputText',
      props: { placeholder: '请输入邮箱' },
      rules: 'required|email',
    },
    {
      field: 'category',
      label: '类型',
      component: 'Select',
      props: {
        options: categoryOptions,
        optionLabel: 'label',
        optionValue: 'value',
        placeholder: '请选择',
      },
    },
    { field: 'notes', label: '备注', component: 'InputText', props: { placeholder: '请输入备注' } },
    {
      field: 'agreed',
      label: '我已阅读并同意相关条款',
      component: 'Checkbox',
      props: { binary: true },
      rules: 'required',
    },
  ],
}
