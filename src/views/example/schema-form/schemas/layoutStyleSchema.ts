import type { Schema } from '@/components/SchemaForm'

/**
 * 布局与样式示例 Schema
 * - 全局 layout/style 由页面控制区动态覆盖
 * - 下方在 schema 内直接写好全局 style（labelClass/labelStyle）与单项 style 示例，无需交互即可看到效果
 */
export const layoutStyleSchema: Schema = {
  gap: 24,
  layout: {
    cols: 2,
    labelWidth: 120,
    labelPosition: 'right',
    labelAlign: 'left',
    showLabel: true,
  },
  style: {
    labelClass: 'text-primary',
    labelStyle: { backgroundColor: 'red' },
  },
  columns: [
    {
      field: 'name',
      label: '姓名（全局布局）',
      component: 'InputText',
      props: { placeholder: '未覆盖' },
    },
    {
      field: 'email',
      label: '邮箱（全局布局）',
      component: 'InputText',
      props: { placeholder: '未覆盖' },
    },
    {
      field: 'remark',
      label: '备注（单项：顶部标签）',
      component: 'Textarea',
      props: { rows: 2, placeholder: '此字段覆盖为 labelAlign: top' },
      layout: { labelAlign: 'top', labelWidth: 80 },
    },
    {
      field: 'theme',
      label: '主题色（单项：labelClass + 标签居中）',
      component: 'ColorPicker',
      style: {
        labelClass: 'text-danger',
        labelStyle: { textAlign: 'center' },
      },
    },
    {
      field: 'subscribe',
      label: '订阅简报（全局）',
      component: 'ToggleSwitch',
    },
  ],
}
