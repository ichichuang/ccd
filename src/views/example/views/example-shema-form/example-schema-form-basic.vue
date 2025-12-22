<script setup lang="tsx">
import type { Schema, SchemaColumnsItem } from '@/components/modules/schema-form/utils/types'
import { useDialog } from '@/hooks/components/useDialog'
import { useSchemaForm, type SchemaFormExpose } from '@/hooks/components/useSchemaForm'
import { ref } from 'vue'
const { openDialog, info, success, error } = useDialog()
// ==================== 表单 Schema 定义 ====================
const initialSchema: Schema = {
  columns: [
    // 基础输入组件
    {
      field: 'inputText',
      label: '文本输入',
      component: 'InputText',
      placeholder: '请输入文本',
      rules: 'required|min:3|max:20',
      help: '文本长度为3-20个字符',
      defaultValue: '默认初始文本',
      layout: {
        labelAlign: 'top',
        labelPosition: 'left',
        cols: 3,
      },
    },
    {
      field: 'inputNumber',
      label: '数字输入',
      component: 'InputNumber',
      placeholder: '请输入数字',
      rules: 'required|min:1|max:1000',
      help: '数字范围为1-100',
      props: {
        min: 1,
        max: 1000,
        step: 1,
      },
      layout: {
        labelAlign: 'top',
        labelPosition: 'left',
        cols: 3,
      },
    },
    {
      field: 'password',
      label: '密码输入',
      component: 'Password',
      placeholder: '请输入密码',
      rules: 'required|min:6',
      help: '密码至少6位',
      props: {
        toggleMask: true,
        feedback: false,
      },
      layout: {
        labelAlign: 'top',
        labelPosition: 'left',
        cols: 3,
      },
    },
    {
      field: 'inputMask',
      label: '手机号码',
      component: 'InputMask',
      placeholder: '请输入手机号',
      rules: 'required',
      help: '请输入11位手机号码',
      props: {
        mask: '99999999999',
        slotChar: '_',
      },
      layout: {
        labelAlign: 'top',
        labelPosition: 'left',
        cols: 3,
      },
    },
    {
      field: 'inputTexts',
      label: '文本输入',
      component: 'InputText',
      placeholder: '请输入文本',
      rules: 'required|min:3|max:20',
      help: '文本长度为3-20个字符',
      defaultValue: '默认初始文本',
      layout: {
        cols: 6,
        labelWidth: 160,
      },
    },
    {
      field: 'inputNumbers',
      label: '数字输入',
      component: 'InputNumber',
      placeholder: '请输入数字',
      rules: 'required|min:1|max:1000',
      help: '数字范围为1-100',
      props: {
        min: 1,
        max: 1000,
        step: 1,
      },
      layout: {
        cols: 6,
        labelWidth: 160,
      },
    },
    {
      field: 'textarea',
      label: '文本区域',
      component: 'Textarea',
      placeholder: '请输入详细描述',
      rules: 'required|min:10|max:500',
      help: '描述至少10个字符，最多500个字符',
      props: {
        rows: 4,
        autoResize: true,
      },
      layout: {
        labelPosition: 'right-top',
        cols: 12,
      },
      style: {
        labelClass: 'h-full',
      },
    },

    {
      field: 'inputGroup',
      label: '输入组',
      component: 'InputGroup',
      placeholder: '请输入邮箱',
      help: '带前缀和后缀的输入框',
      props: {
        addonBefore: '@',
        addonAfter: '.com',
      },
    },

    // 选择组件
    {
      field: 'select',
      label: '下拉选择',
      component: 'Select',
      placeholder: '请选择选项',
      rules: 'required',
      help: '请选择一个选项',
      props: {
        options: [
          { label: '选项1', value: 'option1' },
          { label: '选项2', value: 'option2' },
          { label: '选项3', value: 'option3' },
        ],
        value: null,
      },
    },
    {
      field: 'multiSelect',
      label: '多选下拉',
      component: 'MultiSelect',
      placeholder: '请选择多个选项',
      help: '可以选择多个选项',
      props: {
        options: [
          { label: '苹果', value: 'apple' },
          { label: '香蕉', value: 'banana' },
          { label: '橙子', value: 'orange' },
          { label: '葡萄', value: 'grape' },
        ],
        filter: true,
        maxSelectedLabels: 2,
        showSelectAll: true,
        value: [],
      },
    },
    {
      field: 'listbox',
      label: '列表框',
      component: 'Listbox',
      placeholder: '请选择选项',
      rules: 'required',
      help: '从列表中选择一个选项',
      props: {
        options: [
          { label: '北京', value: 'beijing' },
          { label: '上海', value: 'shanghai' },
          { label: '广州', value: 'guangzhou' },
          { label: '深圳', value: 'shenzhen' },
        ],
        multiple: false,
        filter: true,
        value: null,
      },
      layout: {
        cols: 4,
      },
    },
    {
      field: 'hidden',
      label: '隐藏',
      component: 'InputText',
      placeholder: '请输入文本',
      rules: 'required|min:3|max:20',
      defaultValue: '可以隐藏的表单项',
      layout: {
        cols: 8,
      },
      hidden: false,
      hideBlock: true,
    },
    {
      field: 'hideValue',
      label: '隐藏',
      component: 'InputText',
      placeholder: '请输入文本',
      rules: 'required|min:3|max:20',
      defaultValue: '可以隐藏但是保留值的表单项',
      hidden: false,
      hideValue: true,
    },
    {
      field: 'cascadeSelect',
      label: '级联选择',
      component: 'CascadeSelect',
      placeholder: '请选择地区',
      rules: 'required',
      help: '请选择省市区',
      props: {
        optionLabel: 'label',
        optionValue: 'value',
        options: [
          {
            label: '北京市',
            value: 'beijing',
            children: [
              {
                label: '朝阳区',
                value: 'chaoyang',
                children: [
                  { label: '三里屯', value: 'sanlitun' },
                  { label: '国贸', value: 'guomao' },
                ],
              },
              {
                label: '海淀区',
                value: 'haidian',
                children: [
                  { label: '中关村', value: 'zhongguancun' },
                  { label: '五道口', value: 'wudaokou' },
                ],
              },
            ],
          },
          {
            label: '上海市',
            value: 'shanghai',
            children: [
              {
                label: '浦东新区',
                value: 'pudong',
                children: [
                  { label: '陆家嘴', value: 'lujiazui' },
                  { label: '张江', value: 'zhangjiang' },
                ],
              },
              {
                label: '黄浦区',
                value: 'huangpu',
                children: [
                  { label: '外滩', value: 'waitan' },
                  { label: '南京路', value: 'nanjinglu' },
                ],
              },
            ],
          },
          {
            label: '广东省',
            value: 'guangdong',
            children: [
              {
                label: '广州市',
                value: 'guangzhou',
                children: [
                  { label: '天河区', value: 'tianhe' },
                  { label: '越秀区', value: 'yuexiu' },
                ],
              },
              {
                label: '深圳市',
                value: 'shenzhen',
                children: [
                  { label: '南山区', value: 'nanshan' },
                  { label: '福田区', value: 'futian' },
                ],
              },
            ],
          },
        ],
        value: null,
      },
    },
    {
      field: 'treeSelect',
      label: '树形选择',
      component: 'TreeSelect',
      placeholder: '请选择节点',
      help: '从树形结构中选择节点',
      props: {
        options: [
          {
            label: '根节点1',
            value: 'root1',
            children: [
              { label: '子节点1-1', value: 'child1-1' },
              { label: '子节点1-2', value: 'child1-2' },
            ],
          },
          {
            label: '根节点2',
            value: 'root2',
            children: [
              { label: '子节点2-1', value: 'child2-1' },
              { label: '子节点2-2', value: 'child2-2' },
            ],
          },
        ],
        selectionMode: 'single',
        filter: true,
        value: null,
      },
    },

    // 按钮类组件
    {
      field: 'selectButton',
      label: '选择按钮',
      component: 'SelectButton',
      rules: 'required',
      help: '点击按钮选择选项',
      props: {
        options: [
          { label: '选项A', value: 'a' },
          { label: '选项B', value: 'b' },
          { label: '选项C', value: 'c' },
        ],
        multiple: false,
        value: null,
      },
      style: {
        contentClass: 'w100%!',
      },
    },
    {
      field: 'toggleButton',
      label: '切换按钮',
      component: 'ToggleButton',
      help: '点击切换状态',
      defaultValue: false,
      props: {
        value: false,
      },
      style: {
        contentClass: 'wa',
      },
    },
    {
      field: 'toggleSwitch',
      label: '开关',
      component: 'ToggleSwitch',
      help: '滑动开关',
      defaultValue: false,
      props: {
        value: false,
      },
      style: {
        contentClass: 'center',
      },
    },

    // 特殊输入组件
    {
      field: 'autoComplete',
      label: '自动完成',
      component: 'AutoComplete',
      placeholder: '请输入关键词',
      help: '输入时自动提示',
      props: {
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
          { label: 'Cherry', value: 'cherry' },
          { label: 'Date', value: 'date' },
          { label: 'Elderberry', value: 'elderberry' },
        ],
        delay: 300,
        minLength: 1,
        value: '',
      },
    },
    {
      field: 'datePicker',
      label: '日期选择',
      component: 'DatePicker',
      rules: 'required',
      help: '请选择一个有效日期',
      props: {
        mode: 'date',
        valueFormat: 'timestamp',
        clearable: true,
        is24: true,
      },
    },
    {
      field: 'dateTimePicker',
      label: '日期时间选择',
      component: 'DatePicker',
      help: '选择日期和时间',
      props: {
        mode: 'datetime',
        valueFormat: 'timestamp',
        enableSeconds: true,
        clearable: true,
        is24: true,
      },
      layout: {
        cols: 6,
        labelAlign: 'top',
      },
    },
    {
      field: 'timePicker',
      label: '时间选择',
      component: 'DatePicker',
      help: '仅选择时间',
      props: {
        mode: 'time',
        valueFormat: 'timestamp',
        enableSeconds: false,
        is24: true,
        clearable: true,
      },
      layout: {
        cols: 6,
        labelAlign: 'top',
      },
    },
    {
      field: 'dateRangePicker',
      label: '日期范围选择',
      component: 'DatePicker',
      help: '选择日期范围',
      props: {
        mode: 'date',
        range: true,
        valueFormat: 'timestamp',
        clearable: true,
        presets: [
          {
            label: '今天',
            start: () => new Date(),
            end: () => new Date(),
          },
          {
            label: '最近7天',
            start: () => {
              const date = new Date()
              date.setDate(date.getDate() - 6)
              return date
            },
            end: () => new Date(),
          },
          {
            label: '最近30天',
            start: () => {
              const date = new Date()
              date.setDate(date.getDate() - 29)
              return date
            },
            end: () => new Date(),
          },
        ],
      },
      layout: {
        cols: 12,
        labelAlign: 'top',
      },
    },
    {
      field: 'colorPicker',
      label: '颜色选择',
      component: 'ColorPicker',
      help: '选择颜色',
      props: {
        defaultColor: '#ffffff',
        format: 'hex',
      },
    },
    {
      field: 'slider',
      label: '滑块',
      component: 'Slider',
      help: '拖动滑块选择数值',
      defaultValue: 50,
      props: {
        min: 0,
        max: 100,
        step: 1,
        showValue: true,
        range: false,
        value: 50,
      },
    },
    {
      field: 'rating',
      label: '评分',
      component: 'Rating',
      help: '点击星星评分',
      defaultValue: 0,
      props: {
        stars: 5,
        cancel: true,
        readonly: false,
        value: 0,
      },
    },

    // 复选框和单选
    {
      field: 'checkbox',
      label: '复选框',
      component: 'Checkbox',
      help: '勾选同意条款',
      defaultValue: false,
      props: {
        binary: true,
        value: false,
        options: [
          { label: '选项1', value: 'option1' },
          { label: '选项2', value: 'option2' },
          { label: '选项3', value: 'option3' },
        ],
      },
    },
    {
      field: 'radioButton',
      label: '单选按钮',
      component: 'RadioButton',
      rules: 'required',
      help: '选择一个选项',
      props: {
        options: [
          { label: '选项1', value: 'option1' },
          { label: '选项2', value: 'option2' },
          { label: '选项3', value: 'option3' },
        ],
      },
    },

    // 富文本编辑器
    {
      field: 'editor',
      label: '富文本编辑器',
      component: 'Editor',
      help: '支持富文本编辑',
      props: {
        editorStyle: { height: '200px' },
        placeholder: '请输入内容...',
        value: '',
      },
      layout: {
        labelAlign: 'top',
        labelPosition: 'left',
        cols: 12,
      },
    },
  ],
  layout: {
    labelAlign: 'left',
    labelPosition: 'right',
    showLabel: true,
    labelWidth: '6vw',
  },
  style: {
    contentClass: 'w-100%!',
  },
  gapX: 12,
  gapY: 24,
}

// ==================== 表单 Ref 管理 ====================
const schemaFormRef = ref<SchemaFormExpose | null>(null)

// ==================== 使用 useSchemaForm Hook (P2 重构后) ====================
const {
  formValues, // 🔥 绑定到 v-model
  schema,
  getFormValues,
  resetForm,
  clearForm,
  addField,
  removeField,
  updateField,
  getField,
  getFieldValue,
  setFieldValue,
  moveField,
  setValues,
  hasField,
  getFieldIndex,
} = useSchemaForm({ initialSchema })

// ==================== 表单操作函数 ====================

const handleSubmit = (values: Record<string, any>) => {
  console.log('表单提交:', values)
  success('表单提交成功')
}

// ==================== 演示操作函数 ====================

// 获取表单数据（校验后）
const handleGetFormData = async () => {
  if (!schemaFormRef.value) {
    window.$toast.error('表单组件未就绪')
    return
  }

  // 🔥 P2 重构：通过 ref 调用组件的 validate 方法
  const { valid } = await schemaFormRef.value.validate()
  if (valid) {
    const formData = getFormValues() // 从 hook 获取表单值
    console.log('表单值:', formData)
    openDialog({
      header: '表单数据',
      contentRenderer: () => {
        return <pre>{JSON.stringify(formData, null, 2)}</pre>
      },
      hideClose: true,
      hideFooter: true,
    })
  } else {
    window.$toast.error('表单校验未通过')
  }
}

// 表单整体操作
const handleGetFormValues = () => {
  const formValues = getFormValues()
  console.log('表单值:', formValues)
  openDialog({
    header: '表单值',
    contentRenderer: () => {
      return <pre>{JSON.stringify(formValues, null, 2)}</pre>
    },
    hideClose: true,
    hideFooter: true,
  })
}

const handleResetForm = () => {
  resetForm()
  success('表单已重置到初始状态')
}

const handleClearForm = () => {
  clearForm()
  info('表单已清空')
}

const handleSubmitForm = async () => {
  if (!schemaFormRef.value) {
    error('表单组件未就绪')
    return
  }

  // 🔥 P2 重构：通过 ref 调用组件的 submit 方法
  schemaFormRef.value.submit()
  // 注意：submit 方法会触发 @submit 事件，实际的验证和提交逻辑在 handleSubmit 中处理
}

// 表单项操作
const handleAddField = () => {
  const newField: SchemaColumnsItem = {
    field: `newField_${Date.now()}`,
    label: '新字段',
    component: 'InputText',
    placeholder: '这是一个新添加的字段',
    help: '通过 useSchemaForm hook 动态添加的字段',
  }

  try {
    addField(newField, 0) // 添加到第一个位置
    success('字段添加成功！')
  } catch (_error) {
    error(`字段添加失败: ${_error}`)
  }
}

const handleRemoveField = () => {
  const fieldName = 'inputText'
  if (hasField(fieldName)) {
    const flag = removeField(fieldName)
    if (flag) {
      success(`字段 "${fieldName}" 删除成功！`)
    } else {
      error(`字段 "${fieldName}" 删除失败！`)
    }
  } else {
    error(`字段 "${fieldName}" 不存在！`)
  }
}

const handleUpdateField = () => {
  const fieldName = 'inputNumber'
  if (hasField(fieldName)) {
    const flag = updateField(fieldName, {
      label: '更新后的数字输入',
      help: '这个字段已经被更新了',
      props: {
        min: 0,
        max: 200,
        step: 5,
      },
    })
    if (flag) {
      success(`字段 "${fieldName}" 更新成功！`)
    } else {
      error(`字段 "${fieldName}" 更新失败！`)
    }
  } else {
    error(`字段 "${fieldName}" 不存在！`)
  }
}

const handleGetField = () => {
  const fieldName = 'select'
  const field = getField(fieldName)
  if (field) {
    success(`字段 "${fieldName}" 配置: ${JSON.stringify(field, null, 2)}`)
  } else {
    error(`字段 "${fieldName}" 不存在！`)
  }
}

const handleGetFieldValue = () => {
  const fieldName = 'inputText'
  const value = getFieldValue(fieldName)
  success(`字段 "${fieldName}" 的值: ${value}`)
}

const handleSetFieldValue = () => {
  const fieldName = 'inputText'
  const newValue = `设置的值 ${Date.now()}`
  setFieldValue(fieldName, newValue)
  success(`字段 "${fieldName}" 的值已设置为: ${newValue}`)
}

const handleMoveField = () => {
  const fieldName = 'inputNumber'
  const currentIndex = getFieldIndex(fieldName)
  if (currentIndex >= 0) {
    const newIndex = currentIndex === 0 ? 1 : 0
    const flag = moveField(fieldName, newIndex)
    if (flag) {
      success(`字段 "${fieldName}" 已从位置 ${currentIndex} 移动到位置 ${newIndex}`)
    } else {
      error(`字段 "${fieldName}" 移动失败！`)
    }
  } else {
    error(`字段 "${fieldName}" 不存在！`)
  }
}

const handleHiddenField = () => {
  const fieldName1 = 'hidden'
  const fieldName2 = 'hideValue'
  const hidden1 = getField(fieldName1)?.hidden
  const hidden2 = getField(fieldName2)?.hidden
  const flag1 = updateField(fieldName1, {
    hidden: !hidden1,
  })
  const flag2 = updateField(fieldName2, {
    hidden: !hidden2,
  })
  if (flag1 && flag2) {
    success(`字段 "${fieldName1}", "${fieldName2}" ${hidden1 ? '显示' : '隐藏'}成功！`)
  }
}

// 批量操作
const handleSetValues = () => {
  const newValues = {
    // 基础输入组件
    inputText: '批量设置的文本内容',
    inputTexts: '批量设置的文本内容（大字段）',
    inputNumber: 88,
    inputNumbers: 188,
    password: 'password123',
    inputMask: '13800138000',
    textarea:
      '这是一个批量设置的文本区域内容，用于演示批量设置功能。内容可以很长，支持多行文本显示。',
    inputGroup: 'admin',
    hidden: '批量设置的隐藏字段',
    hideValue: '批量设置的保留值字段',

    // 选择组件
    select: 'option2',
    multiSelect: ['apple', 'banana'],
    listbox: 'shanghai',
    cascadeSelect: 'sanlitun', // 级联选择的最终值
    treeSelect: {
      ['child1-2']: true,
    },

    // 按钮类组件
    selectButton: 'b',
    toggleButton: true,
    toggleSwitch: true,

    // 特殊输入组件
    autoComplete: 'apple',
    datePicker: Date.now(),
    dateTimePicker: Date.now(),
    timePicker: Date.now(),
    dateRangePicker: [Date.now(), Date.now()],
    colorPicker: '0400ff',
    slider: 75,
    rating: 4,

    // 复选框和单选
    checkbox: true,
    radioButton: 'option2',

    // 富文本编辑器
    editor: '<p>这是批量设置的富文本内容</p><p>支持<strong>粗体</strong>和<em>斜体</em>等格式</p>',
  }
  setValues(newValues)
  success('批量设置所有表单项成功！')
}

// 工具方法
const handleHasField = () => {
  const fieldName = 'inputText'
  const exists = hasField(fieldName)
  if (exists) {
    success(`字段 "${fieldName}" 存在`)
  } else {
    error(`字段 "${fieldName}" 不存在！`)
  }
}

const handleGetFieldIndex = () => {
  const fieldName = 'inputNumber'
  const index = getFieldIndex(fieldName)
  if (index >= 0) {
    success(`字段 "${fieldName}" 的索引是: ${index}`)
  } else {
    error(`字段 "${fieldName}" 不存在！`)
  }
}
</script>

<template lang="pug">
div
  // 操作按钮区域（吸顶区域）
  .bg-bg200.p-padding.rounded-rounded.px-padding.between-col.items-start.sticky.top-0.z-2.gap-gaps.z-9999
    b.fs-appFontSize SchemaForm 组件类型示例 + useSchemaForm Hook 演示
    .fs-appFontSizes 展示所有支持的组件类型及其配置，以及 useSchemaForm hook 的各种功能
    div
      .fs-appFontSizes.color-accent100 表单整体操作
      .between-start.gap-gap
        Button(size='small', @click='handleGetFormData') 获取表单数据（校验后）
        Button(size='small', @click='handleGetFormValues') 获取表单值
        Button(size='small', @click='handleResetForm') 重置表单
        Button(size='small', @click='handleClearForm') 清空表单
        Button(size='small', @click='handleSubmitForm') 提交表单
    div
      .fs-appFontSizes.color-accent100 表单项操作
      .between-start.gap-gap
        Button(size='small', @click='handleAddField') 添加字段
        Button(size='small', @click='handleRemoveField') 删除字段
        Button(size='small', @click='handleUpdateField') 更新字段
        Button(size='small', @click='handleGetField') 获取字段配置
        Button(size='small', @click='handleGetFieldValue') 获取字段值
        Button(size='small', @click='handleSetFieldValue') 设置字段值
        Button(size='small', @click='handleMoveField') 移动字段
        Button(size='small', @click='handleHiddenField') 隐藏/显示字段
    div
      .fs-appFontSizes.color-accent100 批量操作
      .between-start.gap-gap
        Button(size='small', @click='handleSetValues') 批量设置值
    div
      .fs-appFontSizes.color-accent100 工具方法
      .between-start.gap-gap
        Button(size='small', @click='handleHasField') 检查字段存在
        Button(size='small', @click='handleGetFieldIndex') 获取字段索引
  .p-padding
    // 表单组件
    SchemaForm(:schema='schema', v-model='formValues', @submit='handleSubmit', ref='schemaFormRef')
  .full.c-card.fs-appFontSizes.between-col.gap-gap
    span.fs-appFontSizex 表单数据实时预览：
    pre.c-border-primary.p-paddings.full {{ JSON.stringify(formValues, null, 2) }}
</template>
