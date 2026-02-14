import type { Schema } from '@/components/schema-form'
import * as yup from 'yup'

export const validationSchema: Schema = {
  gap: 24,
  layout: {
    cols: 1,
    labelWidth: 150,
  },
  columns: [
    // --- 字符串规则 ---
    {
      field: 'requiredField',
      label: '必填项 (String Rule)',
      component: 'InputText',
      rules: 'required',
      help: '使用 rules: "required"',
    },
    {
      field: 'emailField',
      label: '邮箱 (String Rule)',
      component: 'InputText',
      rules: 'required|email',
      help: '使用 rules: "required|email"',
    },
    {
      field: 'minLength',
      label: '最少 5 字符 (String Rule)',
      component: 'InputText',
      rules: 'required|min:5',
      help: '使用 rules: "required|min:5"',
    },

    // --- Yup Schema ---
    {
      field: 'numberRange',
      label: '数字范围 (Yup)',
      component: 'InputNumber',
      rules: yup.number().required().min(10).max(100).label('数字范围'),
      help: '使用 Yup: number().min(10).max(100)',
    },
    {
      field: 'website',
      label: '网址 (Yup)',
      component: 'InputText',
      rules: yup.string().url().required().label('网址'),
      help: '使用 Yup: string().url()',
    },

    // --- 函数式校验 ---
    {
      field: 'customValidator',
      label: '自定义函数',
      component: 'InputText',
      rules: (value: unknown) => {
        if (value == null || value === '') return '必填'
        if (value === 'admin') return '不能使用 admin 作为值'
        return true
      },
      help: '使用函数校验：禁止输入 "admin"',
    },

    // --- 异步校验 ---
    {
      field: 'asyncValidator',
      label: '异步校验 (模拟)',
      component: 'InputText',
      rules: async (value: unknown) => {
        if (value == null || value === '') return true
        await new Promise(resolve => setTimeout(resolve, 1000))
        return String(value).includes('error') ? '模拟异步错误' : true
      },
      help: '输入包含 "error" 触发异步错误 (1s 延迟)',
    },
  ],
}
