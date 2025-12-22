<script setup lang="ts">
import type { Schema } from '@/components/modules/schema-form/utils/types'
import { useSchemaForm, type SchemaFormExpose } from '@/hooks/components/useSchemaForm'
import { ref } from 'vue'

// ==================== 分组 Schema 定义 ====================
const initialSchema: Schema = {
  columns: [
    // 基本信息
    {
      field: 'username',
      label: '用户名',
      component: 'InputText',
      placeholder: '请输入用户名',
      rules: 'required|min:3|max:20',
      help: '长度 3-20，推荐字母数字组合',
      layout: { cols: 4, labelAlign: 'top' },
    },
    {
      field: 'email',
      label: '邮箱',
      component: 'InputText',
      placeholder: '请输入邮箱',
      rules: 'required|email',
      layout: { cols: 4, labelAlign: 'top' },
    },

    // 联系方式
    {
      field: 'phone',
      label: '手机号',
      component: 'InputMask',
      placeholder: '请输入手机号',
      rules: 'required',
      props: { mask: '99999999999', slotChar: '_' },
      layout: { cols: 3, labelAlign: 'top' },
    },
    {
      field: 'city',
      label: '所在城市',
      component: 'Select',
      rules: 'required',
      props: {
        options: [
          { label: '北京', value: 'beijing' },
          { label: '上海', value: 'shanghai' },
          { label: '深圳', value: 'shenzhen' },
        ],
      },
      layout: { cols: 3, labelAlign: 'top' },
    },

    // 偏好设置
    {
      field: 'interests',
      label: '兴趣爱好',
      component: 'MultiSelect',
      props: {
        options: [
          { label: '编程', value: 'code' },
          { label: '阅读', value: 'read' },
          { label: '运动', value: 'sport' },
          { label: '音乐', value: 'music' },
        ],
        filter: true,
      },
      layout: { cols: 6, labelAlign: 'top' },
    },
    {
      field: 'notification',
      label: '消息通知',
      component: 'ToggleSwitch',
      props: { value: true },
      layout: { cols: 2, labelAlign: 'top' },
      style: { contentClass: 'center' },
    },
    {
      field: 'birthday',
      label: '生日',
      component: 'DatePicker',
      rules: 'required',
      help: '请选择您的生日',
      props: {
        mode: 'date',
        valueFormat: 'timestamp',
        clearable: true,
        maxDate: new Date(), // 不能选择未来日期
      },
      layout: { cols: 4, labelAlign: 'top' },
    },
    {
      field: 'appointmentTime',
      label: '预约时间',
      component: 'DatePicker',
      help: '选择预约的日期和时间',
      props: {
        mode: 'datetime',
        valueFormat: 'timestamp',
        enableSeconds: false,
        clearable: true,
        is24: true,
        minDate: new Date(), // 不能选择过去时间
      },
      layout: { cols: 4, labelAlign: 'top' },
    },
  ],
  sections: [
    { title: '基本信息', fields: ['username', 'email', 'birthday'] },
    { title: '联系方式', fields: ['phone', 'city', 'appointmentTime'] },
    { title: '偏好设置', fields: ['interests', 'notification'] },
  ],
  layout: {
    labelAlign: 'left',
    labelPosition: 'right',
    showLabel: true,
    labelWidth: 120,
  },
  style: { contentClass: 'w-100%!' },
  gapX: 12,
  gapY: 24,
}

// ==================== 表单 Ref & Hook (P2 重构后) ====================
const schemaFormRef = ref<SchemaFormExpose | null>(null)
const { formValues, schema, getFormValues } = useSchemaForm({
  initialSchema,
})

// ==================== 处理函数 ====================
const handleSubmit = (values: Record<string, any>) => {
  console.log('分组表单提交:', values)
  window.$toast?.success?.('提交成功！')
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
</script>

<template lang="pug">
div
  // 操作按钮区域（吸顶区域）
  .bg-bg200.p-padding.rounded-rounded.px-padding.between-col.items-start.sticky.top-0.z-2.gap-gaps.items-start.gap-gap
    b.fs-appFontSize SchemaForm 分组表单示例
    .fs-appFontSizes 使用 sections 配置将字段分组展示
    .between-start.gap-gap
      Button.py-2.px-4(@click='handleSubmitForm') 校验并提交
      Button.py-2.px-4(@click='handlePreviewValues') 打印当前值

  .p-padding
    // 分组表单组件
    SchemaForm(:schema='schema', v-model='formValues', @submit='handleSubmit', ref='schemaFormRef')

  .full.c-card.fs-appFontSizes.between-col.gap-gap
    span.fs-appFontSizex 表单数据实时预览：
    pre.c-border-primary.p-paddings.full {{ JSON.stringify(formValues, null, 2) }}
</template>

<style lang="scss" scope></style>
