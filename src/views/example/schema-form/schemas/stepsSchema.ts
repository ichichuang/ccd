import type { Schema } from '@/components/schema-form'

export const stepsSchema: Schema = {
  gap: 24,
  layout: {
    cols: 2,
  },
  steps: [
    {
      title: '账号信息',
      fields: ['username', 'password', 'confirmPassword'],
    },
    {
      title: '个人资料',
      fields: ['nickname', 'bio', 'avatar'],
    },
    {
      title: '完成设置',
      fields: ['terms', 'notifications'],
    },
  ],
  columns: [
    // ----------------- Step 1: Account -----------------
    {
      field: 'step1',
      label: '账户信息',
      component: 'Step',
      layout: { span: 12 },
    },
    {
      field: 'username',
      label: '用户名',
      component: 'InputText',
      props: { placeholder: '用于登录' },
      rules: 'required',
    },
    {
      field: 'password',
      label: '密码',
      component: 'Password',
      props: { feedback: false },
      rules: 'required|min:4',
    },

    // ----------------- Step 2: Profile -----------------
    {
      field: 'step2',
      label: '个人资料',
      component: 'Step',
      layout: { span: 12 },
    },
    {
      field: 'nickname',
      label: '昵称',
      component: 'InputText',
    },
    {
      field: 'avatar',
      label: '头像 URL',
      component: 'InputText',
    },

    // ----------------- Step 3: Confirmation -----------------
    {
      field: 'step3',
      label: '确认信息',
      component: 'Step',
      layout: { span: 12 },
    },
    {
      field: 'terms',
      label: '我同意条款',
      component: 'Checkbox',
      props: { binary: true },
      rules: 'required',
    },
    {
      field: 'newsletter',
      label: '订阅简报',
      component: 'ToggleSwitch',
    },
  ],
}
