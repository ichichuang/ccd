# Skill 08：SchemaForm 表单组件使用

## Goal

当任务涉及多字段表单（校验、分步、分组、动态字段）时，使用 SchemaForm + useSchemaForm，不手写 PrimeVue 表单组件拼装。

## Pre-check

- `@docs/SCHEMA_FORM_COMPONENT.md`
- `@.cursor/rules/18-components-and-icons.mdc`

## 判断标准

| 场景                                 | 使用                           |
| ------------------------------------ | ------------------------------ |
| 1–2 个字段、无复杂逻辑               | PrimeVue InputText / Select 等 |
| 多字段、需校验/分步/分组/动态 schema | **SchemaForm + useSchemaForm** |

## Output

- 定义 Schema（columns、layout、rules、steps/sections、transform、hidden 等）
- 使用 SchemaForm 或 useSchemaForm 驱动表单
- 类型从 `@/components/SchemaForm` 导入：Schema、SchemaColumnsItem、FormValues、EvalCtx、FieldRenderCtx
- **校验**：用 SchemaForm 的 ref，`formRef.value?.validate()`；useSchemaForm 不提供 validate()
- **转换**：需要「外部→控件」或「控件→提交」时用 column 的 `transform: { input?, output? }`
- **持久化**：`persist` 短期草稿（key/ttl）；`remember` 内容记忆；步骤表单与 remember 互斥，详见文档

## 禁止

- 引用 `src/views/example/schema-form`（示例目录后期会删除）
- 手写大量 PrimeVue 表单组件拼装替代 SchemaForm
