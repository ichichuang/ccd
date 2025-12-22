<script setup lang="ts">
import type { Schema } from '@/components/modules/schema-form/utils/types'
import { useSchemaForm, type SchemaFormExpose } from '@/hooks/components/useSchemaForm'
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

// ==================== 表单 Ref & Hook (P2 重构后) ====================
const schemaFormRef = ref<SchemaFormExpose | null>(null)
const { formValues, schema, getFormValues, updateField, setFieldValue } = useSchemaForm({
  initialSchema,
})

// ==================== 处理函数 ====================
const handleSubmit = async (_values: Record<string, any>) => {
  // 🔥 P2 重构：handleSubmit 由 SchemaForm 的 @submit 事件触发，已经验证通过
  window.$toast?.success?.('表单校验通过并已提交！')
}

const handleSubmitForm = async () => {
  if (!schemaFormRef.value) {
    window.$toast?.error?.('表单组件未就绪')
    return
  }

  // 🔥 P2 重构：通过 ref 调用组件的 submit 方法
  schemaFormRef.value.submit()
  // 注意：submit 方法会触发 @submit 事件，实际的验证和提交逻辑在 handleSubmit 中处理
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
  // 🔥 P2 重构：schema 现在是 Readonly<Ref<Schema>>，需要通过 .value 访问
  const target = schema.value.columns.find((column: any) => column.field === field)
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

  // 规范化日期：只保留日期部分，忽略时间
  const normalizeDateOnly = (date: Date) => {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }

  const minEndDate = (() => {
    if (!normalizedStart) {
      return today
    }
    const normalizedStartDate = normalizeDateOnly(normalizedStart)
    const dayAfterStart = addDays(normalizedStartDate, 1)
    return dayAfterStart.getTime() > today.getTime() ? dayAfterStart : today
  })()

  patchDateFieldProps('endDate', {
    minDate: minEndDate,
  })

  // 🔥 修复：只有当结束日期严格小于最小结束日期时才清空
  // 如果结束日期等于或大于 minEndDate（即开始日期的下一天），这是合法的，不应该清空
  if (normalizedEnd) {
    const normalizedEndDate = normalizeDateOnly(normalizedEnd)
    if (normalizedEndDate.getTime() < minEndDate.getTime()) {
      setFieldValue('endDate', null)
      normalizedEnd = null
    }
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

  // 🔥 修复：会议时间可以选择开始日期到结束日期之间的任何时间（包括结束日期）
  // 规范化日期，只比较日期部分
  const normalizedStartDate = normalizeDateOnly(normalizedStart)
  const normalizedEndDate = normalizeDateOnly(normalizedEnd)

  // 最小会议时间：开始日期（或今天，取较大者）的 00:00:00
  const minMeeting = new Date(Math.max(normalizedStartDate.getTime(), today.getTime()))
  minMeeting.setHours(0, 0, 0, 0)

  // 最大会议时间：结束日期的 23:59:59
  const maxMeeting = new Date(normalizedEndDate)
  maxMeeting.setHours(23, 59, 59, 999)

  // 如果开始日期和结束日期是同一天，或者开始日期大于结束日期，禁用会议时间
  if (normalizedStartDate.getTime() > normalizedEndDate.getTime()) {
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

  // 启用会议时间选择，范围是开始日期到结束日期
  patchDateFieldProps('meetingTime', {
    minDate: minMeeting,
    maxDate: maxMeeting,
    disabled: false,
  })

  // 验证已选择的会议时间是否在有效范围内
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
  .bg-bg200.p-padding.rounded-rounded.px-padding.between-col.items-start.sticky.top-0.z-2.gap-gaps.items-start.gap-gap
    b.fs-appFontSize SchemaForm 分步表单示例
    .fs-appFontSizes 使用 steps 配置分步骤填写，内置下一步/上一步与提交
    .between-start.gap-gap
      Button.py-2.px-4(@click='handleSubmitForm') 校验并提交
      Button.py-2.px-4(@click='handlePreviewValues') 打印当前值

  .p-padding
    // 分步表单组件
    SchemaForm(
      :schema='schema',
      v-model='formValues',
      @submit='handleSubmit',
      ref='schemaFormRef',
      :remember='true'
    )

  .full.c-card.fs-appFontSizes.between-col.gap-gap
    span.fs-appFontSizex 表单数据实时预览：
    pre.c-border-primary.p-paddings.full {{ JSON.stringify(formValues, null, 2) }}
</template>

<style lang="scss" scope></style>
