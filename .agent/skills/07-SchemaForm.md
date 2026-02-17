---
description: 表单任务：多字段/校验/分步/分组/动态时使用 SchemaForm + useSchemaForm
globs: src/views/**/*.vue, src/components/**/*.vue
---

# SchemaForm 表单组件 Skill

## 1. Goal

当任务涉及**多字段表单、校验、分步、分组或动态 schema** 时，优先使用 SchemaForm + useSchemaForm，不手写大量 PrimeVue 表单组件拼装。

## 2. Pre-check

- **必读**：`docs/SCHEMA_FORM_COMPONENT.md`
- **规则**：`.agent/rules/10-ui-architecture.md` §2b、`.agent/rules/15-toolchain-first.md` §5

## 3. 判断标准

| 场景                                    | 使用                                    |
| --------------------------------------- | --------------------------------------- |
| 1–2 个字段、无校验/分步/分组            | PrimeVue InputText、Select、Calendar 等 |
| 多字段、需校验、分步、分组、动态 schema | **SchemaForm + useSchemaForm**          |

## 4. Steps

### Step 1: 确认是否属于表单场景

- 若为「多字段 + 校验/分步/分组/动态字段」→ 进入 Step 2。
- 若为简单 1–2 个输入 → 直接使用 PrimeVue 组件，无需本 Skill。

### Step 2: 阅读文档并选用入口

- 打开 `docs/SCHEMA_FORM_COMPONENT.md`，确认 Schema 结构（columns、layout、rules、steps/sections、transform、hidden 等）。
- **静态 Schema**：在页面内定义 `Schema`，用 `<SchemaForm v-model="formValues" :schema="schema" />`。
- **动态 Schema**：使用 `useSchemaForm({ initialSchema })`，得到 `schema`、`formValues`、`addField`、`removeField`、`updateField`、`moveField` 等，再传给 `<SchemaForm>`。

### Step 3: 实现与校验

- 类型从 `@/components/SchemaForm` 导入：Schema、SchemaColumnsItem、FormValues、EvalCtx、FieldRenderCtx。
- 校验：给 `<SchemaForm>` 加 `ref="formRef"`，调用 `formRef.value?.validate()`；useSchemaForm 不提供 validate()。
- 提交：`@submit` 或 `formRef.value?.submit()`。

### Step 4: 禁止项

- 禁止引用 `src/views/example/schema-form` 作为业务代码依赖（示例目录后期会删除）。
- 禁止在符合「多字段/校验/分步/分组/动态」时手写大量 PrimeVue 表单拼装。

## 5. 参考

- 组件：`src/components/SchemaForm`
- Hook：`src/hooks/modules/useSchemaForm.ts`
- 内部 Hooks：`src/components/SchemaForm/hooks/`（useFormSync、useValidation、useSteps 等，业务层通常只需 useSchemaForm）
