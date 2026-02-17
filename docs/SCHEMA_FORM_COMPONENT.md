# SchemaForm 表单组件

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及多字段表单、校验、分步、分组或动态 schema 时必读。
>
> 项目基于 Schema 驱动的表单组件，支持 20+ PrimeVue 控件、校验、分步、分组、动态字段、持久化等。当需要**多字段表单、校验、分步、分组或动态 schema** 时，优先使用 SchemaForm + useSchemaForm，禁止手写大量 PrimeVue 表单组件拼装。

## 1. 概述

- **组件**：`SchemaForm`（`src/components/SchemaForm`）
- **Hook**：`useSchemaForm`（`src/hooks/modules/useSchemaForm.ts`）
- **导出**：`import { SchemaForm, useSchemaForm } from '@/components/SchemaForm'`
- **类型**：`Schema`、`SchemaColumnsItem`、`FormValues`、`EvalCtx`、`FieldRenderCtx` 等从 `@/components/SchemaForm` 导出

## 2. 何时使用 SchemaForm

| 场景                                    | 使用                                  |
| --------------------------------------- | ------------------------------------- |
| 1–2 个字段、无校验/分步/分组            | PrimeVue 组件（InputText、Select 等） |
| 多字段、需校验、分步、分组、动态 schema | **SchemaForm + useSchemaForm**        |

## 3. 快速使用

### 3.1 标准用法（Schema 静态）

```vue
<script setup lang="ts">
// ref 由自动导入提供，可省略 import { ref } from 'vue'，见 docs/BUILD_SYSTEM.md
import { SchemaForm } from '@/components/SchemaForm'
import type { Schema, FormValues } from '@/components/SchemaForm'

const schema: Schema = {
  gap: 24,
  layout: { cols: 2, labelWidth: 120 },
  columns: [
    { field: 'name', label: '姓名', component: 'InputText', props: { placeholder: '请输入' } },
    { field: 'email', label: '邮箱', component: 'InputText', rules: 'required|email' },
  ],
}

const formValues = ref<FormValues>({})
</script>
<template>
  <SchemaForm
    v-model="formValues"
    :schema="schema"
    @submit="values => console.log(values)"
  />
</template>
```

### 3.2 动态 Schema（useSchemaForm 无头模式）

```vue
<script setup lang="ts">
import { SchemaForm, useSchemaForm } from '@/components/SchemaForm'
import type { Schema } from '@/components/SchemaForm'

const initialSchema: Schema = {
  columns: [
    { field: 'name', label: '姓名', component: 'InputText', defaultValue: 'Guest' },
    { field: 'email', label: '邮箱', component: 'InputText', rules: 'required|email' },
  ],
}

const { schema, formValues, addField, removeField, updateField, moveField, resetForm, clearForm } =
  useSchemaForm({ initialSchema })
</script>
<template>
  <SchemaForm
    v-model="formValues"
    :schema="schema"
  />
</template>
```

## 4. API 速查

### 4.1 SchemaForm Props

| Prop              | 类型                               | 说明                                                                     |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `schema`          | Schema                             | 必填，表单配置                                                           |
| `modelValue`      | FormValues                         | v-model 绑定的表单值                                                     |
| `disabled`        | boolean                            | 禁用                                                                     |
| `preview`         | boolean                            | 预览模式（只显示值）                                                     |
| `remember`        | boolean                            | 内容记忆（localStorage）                                                 |
| `persist`         | `{ key, ttl?, onError? }` \| false | 持久化配置；onError(op, error) 为读写失败时回调，DEV 下仍会 console.warn |
| `optionsCacheTTL` | number                             | 动态 options 缓存时间(ms)                                                |
| `submitTransform` | (values) => values                 | 提交前转换                                                               |

### 4.2 SchemaForm 事件

| 事件                | 参数                               |
| ------------------- | ---------------------------------- |
| `update:modelValue` | FormValues                         |
| `submit`            | FormValues                         |
| `error`             | { errors: Record<string, string> } |

### 4.3 SchemaForm ref 暴露

| 属性/方法                     | 说明                                        |
| ----------------------------- | ------------------------------------------- |
| `values`                      | 当前表单值（过滤空值）                      |
| `valuesRef`                   | 当前绑定值的 ref（即 modelValue 的引用）    |
| `validate()`                  | 触发验证，返回 `Promise<{ valid, errors }>` |
| `submit()`                    | 触发提交                                    |
| `reset()`                     | 重置（恢复 defaultValue）                   |
| `clear()`                     | 清空                                        |
| `setFieldValue(field, value)` | 设置单字段                                  |
| `setValues(newValues)`        | 批量设置                                    |
| `stepAccessibility`           | 步骤可达性（分步表单）                      |

### 4.4 useSchemaForm 返回值

| 分类      | 方法/属性                                                                                                 | 说明                         |
| --------- | --------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 响应式    | `schema`, `formValues`                                                                                    | schema 只读，formValues 可写 |
| 整体      | `getFormValues()`, `resetForm()`, `clearForm()`                                                           | 取值、重置、清空             |
| 字段 CRUD | `addField(field, index?)`, `removeField(name)`, `updateField(name, updates)`, `moveField(name, newIndex)` | 增删改、移动                 |
| 字段值    | `getFieldValue(name)`, `setFieldValue(name, value)`                                                       | 单字段读写                   |
| 批量      | `setValues(newValues)`                                                                                    | 批量赋值                     |
| 工具      | `hasField(name)`, `getFieldIndex(name)`, `getField(name)`                                                 | 存在性、索引、配置           |

**无头模式校验**：`useSchemaForm` 不提供 `validate()`。校验请使用 **SchemaForm 的 ref**：给 `<SchemaForm>` 加 `ref="formRef"`，调用 `formRef.value?.validate()`。

## 5. 与 PrimeVue 的分工

| 场景                                  | 使用                           |
| ------------------------------------- | ------------------------------ |
| 简单 1–2 个字段                       | PrimeVue InputText、Select 等  |
| 多字段、校验、分步、分组、动态 schema | **SchemaForm + useSchemaForm** |

## 6. Schema 核心配置

- **columns**：表单项列表（field、label、component、rules、dependsOn、visible、disabled、readonly、transform、hidden 等）
- **layout**：全局布局（cols、span、labelWidth、labelPosition、labelAlign、showLabel 等）；单字段可用 **column.layout** 覆盖。
- **style**：全局样式（labelClass、contentClass、labelStyle、contentStyle）；单字段可用 **column.style** 覆盖。标签外观类名使用 `style.labelClass`（如 UnoCSS）；标签文字居中对齐使用 `style.labelStyle: { textAlign: 'center' }`（全局或单字段）。
- **示例页**：路由「示例 > SchemaForm」下提供 **布局与样式 (Layout & Style)** tab，演示全局 layout/style 与单表单项覆盖；**无头模式 (Hook)** tab 演示 setFieldValue、setValues、updateField(label/layout/style) 等动态操作。
- **sections**：分组（title、fields）
- **steps**：分步（title、fields）
- **component**：见下表「支持的 component 类型」。
- **rules**：见下文「字符串规则」或 Yup Schema、函数、异步函数。**必填星号（\*）**仅当 rules 包含字符串 `'required'` 或 Yup 的 required 时显示；仅使用自定义函数校验时不会自动显示星号，若需显示请在 rules 中显式加入 `'required'`（如 `rules: ['required', myValidateFn]`）。
- **dependsOn**：依赖字段，触发重渲染
- **visible/disabled/readonly**：支持 `boolean` 或 `(ctx: EvalCtx) => boolean`
- **transform**：`{ input?, output? }`。**input**：外部 → 控件（初始值、modelValue 同步进表单时应用）；**output**：控件 → 提交（提交时应用）。ctx 为 `{ values, column }`。
- **hidden / hideValue / hideBlock**：`hidden: true` 时隐藏该字段。`hideValue: true` 表示隐藏但仍参与取值（如提交、validate）；`hideBlock: true` 表示隐藏但保留栅格占位。组合效果：仅 hidden 且不占位不取值；hidden + hideBlock 占位；hidden + hideValue 可取值；hidden + hideBlock + hideValue 占位且可取值。
- **Custom**：`component: 'Custom'` + `props.render(ctx: FieldRenderCtx)` 自定义 TSX 渲染

### 6.1 支持的 component 类型

| 类型          | 说明                                    |
| ------------- | --------------------------------------- |
| InputText     | 文本输入                                |
| Password      | 密码输入                                |
| InputNumber   | 数字输入                                |
| InputMask     | 输入掩码                                |
| InputGroup    | 输入组（可配置 addonBefore/addonAfter） |
| Textarea      | 多行文本                                |
| Checkbox      | 复选框                                  |
| RadioButton   | 单选按钮                                |
| Select        | 下拉单选                                |
| MultiSelect   | 多选                                    |
| Listbox       | 列表框                                  |
| SelectButton  | 选择按钮                                |
| CascadeSelect | 级联选择                                |
| AutoComplete  | 自动完成                                |
| TreeSelect    | 树形选择                                |
| DatePicker    | 日期/范围（可配置 valueFormat）         |
| ColorPicker   | 颜色选择                                |
| Slider        | 滑块                                    |
| Rating        | 评分                                    |
| ToggleSwitch  | 开关                                    |
| ToggleButton  | 切换按钮                                |
| Custom        | 自定义渲染（props.render）              |

## 7. 验证与必填

- **必填星号**：标签旁的 `*` 由 `isFieldRequired(column)` 决定，仅当 `rules` 为字符串且包含 `required`、或为 Yup Schema/数组中含有 required 时为 true；**仅使用函数规则时返回 false**，不会显示星号。若既要自定义校验又要星号，请写 `rules: ['required', myValidateFn]` 或 `rules: 'required'` 并配合其他方式校验。
- **校验执行**：字符串规则见下表；函数与 Yup 由 useValidation 统一处理。**异步规则**：函数返回 `Promise<true | string>` 时，步骤可达性、下一步校验、ref.validate() 及提交校验中均会 await，行为与同步规则一致。

### 7.1 字符串规则（rules 字符串，用 `|` 分隔）

| 规则      | 写法示例                               | 说明                                             |
| --------- | -------------------------------------- | ------------------------------------------------ |
| required  | `required`                             | 必填                                             |
| min       | `min:5`                                | 字符串最少 5 字符 / 数字最小值 5                 |
| max       | `max:10`                               | 字符串最多 10 字符 / 数字最大值 10               |
| minLength | `minLength:5`                          | 长度不小于 5（字符串或数组）                     |
| maxLength | `maxLength:10`                         | 长度不大于 10                                    |
| email     | `email`                                | 邮箱格式                                         |
| url       | `url`                                  | URL 格式                                         |
| integer   | `integer`                              | 必须为整数                                       |
| pattern   | `pattern:/^\\d+$/` 或 `pattern:^\\d+$` | 正则匹配；非法正则配置会返回「正则规则配置错误」 |

## 8. 预览模式与扩展

- **入口**：`preview` 为 true 时，表单项只展示格式化后的文本，不渲染输入控件。
- **扩展方式**：在 `src/components/SchemaForm/utils/formatPreview.ts` 的 `PREVIEW_FORMATTERS` Map 中按组件名注册 `(value, options) => string`；新增组件只需添加一行，无需改 FormItems。Checkbox/ToggleSwitch 的「是/否」由 FormItems 层做 i18n 覆盖；ColorPicker 色块、Textarea 换行等特殊 UI 仍在 FormItems 的 renderPreview 中处理。
- **i18n**：若需预览文案国际化，可在调用 `formatPreviewValue` 处传入 `t` 或 formatter 选项（见 formatPreview 可选参数）。

## 9. 注意事项

- **禁止**：在需要多字段/校验/分步/分组/动态表单时，手写大量 PrimeVue 表单组件拼装；必须使用 SchemaForm，见本文档。
- **Custom 组件**：`props.render` 需返回 TSX/VNode，使用 `<script setup lang="tsx">`，禁止 `h()`。
- **类型**：`Schema`、`SchemaColumnsItem`、`FormValues`、`EvalCtx`、`FieldRenderCtx` 从 `@/components/SchemaForm` 导入。
- **SchemaForm 内部 Hooks**：`src/components/SchemaForm/hooks/` 下的 useFormSync、useValidation、useSteps 等供 SchemaForm 内部使用，业务层通常只需 `useSchemaForm`。
- **persist 与 remember**：`persist` 为短期 localStorage 持久化（key/ttl），适合草稿恢复；`remember` 为 localStorage 缓存，适合长草稿。步骤表单与 remember 互斥。存储 key 前缀：persist 使用 `schemaform:` + 配置的 key；remember 使用 `{VITE_PINIA_PERSIST_KEY_PREFIX}-__form_cache__:` + 编码后的 formId，便于排查与避免冲突。
