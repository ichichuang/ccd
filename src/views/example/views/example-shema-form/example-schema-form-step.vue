<script setup lang="ts">
import type { Schema } from '@/components/modules/schema-form/utils/types'
import { useSchemaForm } from '@/hooks/components/useSchemaForm'
import { ref, watch } from 'vue'

// ==================== 分步 Schema 定义 ====================
const initialSchema: Schema = {
  columns: [
    // Step 1: 基本信息
    {
      field: 'username',
      label: '用户名',
      component: 'InputText',
      placeholder: '请输入用户名',
      rules: 'required|min:3|max:20',
      help: '长度 3-20，推荐字母数字组合',
      layout: {
        cols: 4,
        labelAlign: 'top',
      },
    },
    {
      field: 'email',
      label: '邮箱',
      component: 'InputText',
      placeholder: '请输入邮箱',
      rules: 'required|email',
      layout: {
        cols: 4,
        labelAlign: 'top',
      },
    },

    // Step 2: 详情信息
    {
      field: 'age',
      label: '年龄',
      component: 'InputNumber',
      placeholder: '请输入年龄',
      rules: 'required|min:1|max:120|integer',
      props: {
        min: 1,
        max: 120,
        step: 1,
      },
      layout: {
        cols: 3,
        labelAlign: 'top',
      },
    },
    {
      field: 'gender',
      label: '性别',
      component: 'Select',
      rules: 'required',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
          { label: '其他', value: 'other' },
        ],
      },
      layout: {
        cols: 3,
        labelAlign: 'top',
      },
    },

    // Step 3: 偏好设置
    {
      field: 'interests',
      label: '兴趣爱好',
      component: 'MultiSelect',
      help: '可多选',
      props: {
        options: [
          { label: '编程', value: 'code' },
          { label: '阅读', value: 'read' },
          { label: '运动', value: 'sport' },
          { label: '音乐', value: 'music' },
        ],
        filter: true,
      },
      layout: {
        cols: 6,
        labelAlign: 'top',
      },
    },
    {
      field: 'notification',
      label: '消息通知',
      component: 'ToggleSwitch',
      help: '是否开启系统通知',
      props: {
        value: true,
      },
      layout: {
        cols: 2,
        labelAlign: 'top',
      },
      style: {
        contentClass: 'center',
      },
    },

    // Step 4: 时间安排
    {
      field: 'startDate',
      label: '开始日期',
      component: 'DatePicker',
      rules: 'required',
      help: '选择项目开始日期',
      props: {
        mode: 'date',
        valueFormat: 'timestamp',
        clearable: true,
        minDate: new Date(), // 不能选择过去日期
      },
      layout: {
        cols: 4,
        labelAlign: 'top',
      },
    },
    {
      field: 'endDate',
      label: '结束日期',
      component: 'DatePicker',
      rules: 'required',
      help: '选择项目结束日期',
      props: {
        mode: 'date',
        valueFormat: 'timestamp',
        clearable: true,
        minDate: new Date(), // 不能选择过去日期
      },
      layout: {
        cols: 4,
        labelAlign: 'top',
      },
    },
    {
      field: 'meetingTime',
      label: '会议时间',
      component: 'DatePicker',
      help: '选择会议的具体时间',
      props: {
        mode: 'datetime',
        valueFormat: 'timestamp',
        enableSeconds: false,
        clearable: true,
        is24: true,
        minDate: new Date(), // 不能选择过去时间
      },
      layout: {
        cols: 4,
        labelAlign: 'top',
      },
    },
  ],
  steps: [
    { title: '基本信息', fields: ['username', 'email'] },
    { title: '详情信息', fields: ['age', 'gender'] },
    { title: '偏好设置', fields: ['interests', 'notification'] },
    { title: '时间安排', fields: ['startDate', 'endDate', 'meetingTime'] },
  ],
  layout: {
    labelAlign: 'left',
    labelPosition: 'right',
    showLabel: true,
    labelWidth: 120,
  },
  style: {
    contentClass: 'w-100%!',
  },
  gapX: 12,
  gapY: 24,
}

// ==================== 表单 Ref & Hook ====================
const schemaFormRef = ref<any>(null)
const { formValues, schema, submitForm, getFormValues, updateField, setFieldValue } = useSchemaForm(
  {
    formRef: schemaFormRef,
    initialSchema,
  }
)

// ==================== 处理函数 ====================
const handleSubmit = async (_values: Record<string, any>) => {
  const { valid } = await submitForm()
  if (valid) {
    window.$toast?.success?.('表单校验通过并已提交！')
  } else {
    window.$toast?.error?.('当前步骤校验未通过，请检查必填项或格式')
  }
}

const handleSubmitForm = async () => {
  const { valid } = await submitForm()
  if (valid) {
    window.$toast?.success?.('表单校验通过并已提交！')
  } else {
    window.$toast?.error?.('当前步骤校验未通过，请检查必填项或格式')
  }
}

const handlePreviewValues = () => {
  const values = getFormValues()
  console.log('当前表单值:', values)
}

// ==================== 动态日期联动 ====================
// 防止递归更新的标志
let isUpdatingDateFields = false

const getTodayFloor = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const toDateValue = (value: any): Date | null => {
  if (value === null || value === undefined) {
    return null
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed
}

const addDays = (date: Date, delta: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + delta)
  return next
}

const isSameValue = (a: any, b: any) => {
  const normalize = (val: any) => {
    if (val instanceof Date) {
      return val.getTime()
    }
    return val
  }
  return normalize(a) === normalize(b)
}

const patchDateFieldProps = (field: string, patch: Record<string, any>) => {
  const target = schema.columns.find(column => column.field === field)
  if (!target) {
    return
  }
  const nextProps: Record<string, any> = { ...(target.props || {}) }
  let changed = false
  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined) {
      if (key in nextProps) {
        delete nextProps[key]
        changed = true
      }
      return
    }
    if (isSameValue(nextProps[key], value)) {
      return
    }
    nextProps[key] = value
    changed = true
  })
  if (!changed) {
    return
  }
  updateField(field, { props: nextProps })
}

// 防抖定时器
let dateConstraintTimer: NodeJS.Timeout | null = null

const syncDateFieldConstraints = (rawStart: any, rawEnd: any) => {
  const today = getTodayFloor()
  let normalizedStart = toDateValue(rawStart)
  let normalizedEnd = toDateValue(rawEnd)

  const minEndDate = (() => {
    if (!normalizedStart) {
      return today
    }
    const dayAfterStart = addDays(normalizedStart, 1)
    return dayAfterStart.getTime() > today.getTime() ? dayAfterStart : today
  })()

  patchDateFieldProps('endDate', {
    minDate: minEndDate,
  })

  if (normalizedEnd && normalizedEnd.getTime() <= minEndDate.getTime()) {
    setFieldValue('endDate', null)
    normalizedEnd = null
  }

  patchDateFieldProps('startDate', {
    minDate: today,
    maxDate: normalizedEnd ? addDays(normalizedEnd, -1) : undefined,
  })

  if (normalizedStart && normalizedEnd && normalizedStart.getTime() >= normalizedEnd.getTime()) {
    setFieldValue('startDate', null)
    normalizedStart = null
  }

  if (!normalizedStart || !normalizedEnd) {
    patchDateFieldProps('meetingTime', {
      minDate: today,
      maxDate: undefined,
      disabled: true,
    })
    if (formValues.value.meetingTime) {
      setFieldValue('meetingTime', null)
    }
    return
  }

  const minMeeting = new Date(Math.max(normalizedStart.getTime(), today.getTime()))
  const maxMeeting = addDays(normalizedEnd, -1)

  if (maxMeeting.getTime() <= minMeeting.getTime()) {
    patchDateFieldProps('meetingTime', {
      minDate: minMeeting,
      maxDate: undefined,
      disabled: true,
    })
    if (formValues.value.meetingTime) {
      setFieldValue('meetingTime', null)
    }
    return
  }

  patchDateFieldProps('meetingTime', {
    minDate: minMeeting,
    maxDate: maxMeeting,
    disabled: false,
  })

  const meetingValue = toDateValue(formValues.value.meetingTime)
  if (
    meetingValue &&
    (meetingValue.getTime() < minMeeting.getTime() || meetingValue.getTime() > maxMeeting.getTime())
  ) {
    setFieldValue('meetingTime', null)
  }
}

watch(
  () => [formValues.value.startDate, formValues.value.endDate],
  ([startValue, endValue]) => {
    if (isUpdatingDateFields) {
      return
    }
    if (dateConstraintTimer) {
      clearTimeout(dateConstraintTimer)
    }
    dateConstraintTimer = setTimeout(() => {
      isUpdatingDateFields = true
      try {
        syncDateFieldConstraints(startValue, endValue)
      } finally {
        isUpdatingDateFields = false
        dateConstraintTimer = null
      }
    }, 100)
  },
  { immediate: true }
)
</script>

<template lang="pug">
div
  // 操作按钮区域（吸顶区域）
  .c-card.rounded-0.px-padding.between-col.items-start.sticky.top-0.z-2.gap-gaps.items-start.gap-gap
    .fs-appFontSizex SchemaForm 分步表单示例
    .color-text200 使用 steps 配置分步骤填写，内置下一步/上一步与提交
    .between-start.gap-gap
      Button(@click='handleSubmitForm') 校验并提交
      Button(@click='handlePreviewValues') 打印当前值

  .c-border.p-padding.my-gapl
    // 分步表单组件
    SchemaForm(:schema='schema', @submit='handleSubmit', ref='schemaFormRef', :remember='true')

  .full.c-card-accent.fs-appFontSizes.between-col.gap-gap
    span.fs-appFontSizex 表单数据实时预览：
    pre.c-border-primary.p-paddings.full {{ JSON.stringify(formValues, null, 2) }}
</template>

<style lang="scss" scope></style>
