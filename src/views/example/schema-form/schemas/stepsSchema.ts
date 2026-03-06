import type { Schema } from '@/components/SchemaForm'

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
    {
      field: 'confirmPassword',
      label: '确认密码',
      component: 'Password',
      props: { feedback: false },
      rules: 'required',
    },

    // ----------------- Step 2: Profile -----------------
    {
      field: 'nickname',
      label: '昵称',
      component: 'InputText',
    },
    {
      field: 'bio',
      label: '简介',
      component: 'Textarea',
      props: { autoResize: true, rows: 3, placeholder: '简单介绍一下自己' },
    },
    {
      field: 'avatar',
      label: '头像 URL',
      component: 'InputText',
    },

    // ----------------- Step 3: Confirmation -----------------
    {
      field: 'terms',
      label: '我同意条款',
      component: 'Checkbox',
      props: { binary: true },
      rules: 'required',
    },
    {
      field: 'notifications',
      label: '接收通知',
      component: 'ToggleSwitch',
    },
  ],
}
