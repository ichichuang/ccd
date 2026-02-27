---
description: Form tasks: use SchemaForm + useSchemaForm for multi-field, validation, steps, groups, dynamic schema
globs: src/views/**/*.vue, src/components/**/*.vue
---

# SchemaForm Skill

## 1. Goal

When the task involves **multi-field forms, validation, steps, groups, or dynamic schema**, prefer SchemaForm + useSchemaForm instead of hand-writing many PrimeVue form components.

## 2. Pre-check

- **Required reading**: `docs/ai-specs/SCHEMA_FORM_COMPONENT.md`
- **Rules**: `.agent/rules/10-ui-architecture.md` §2b, `.agent/rules/15-toolchain-first.md` §5

## 3. Decision Criteria

| Scenario                                               | Use                                          |
| ------------------------------------------------------ | -------------------------------------------- |
| 1–2 fields, no validation/steps/groups                 | PrimeVue InputText, Select, DatePicker, etc. |
| Multi-field, validation, steps, groups, dynamic schema | **SchemaForm + useSchemaForm**               |

## 4. Steps

### Step 1: Confirm Form Scenario

- If "multi-field + validation/steps/groups/dynamic fields" → proceed to Step 2.
- If simple 1–2 inputs → use PrimeVue components directly; this Skill is not needed.

### Step 2: Read Doc and Choose Entry

- Open `docs/ai-specs/SCHEMA_FORM_COMPONENT.md`, confirm Schema structure (columns, layout, rules, steps/sections, transform, hidden, etc.).
- **Static Schema**: Define `Schema` in the page, use `<SchemaForm v-model="formValues" :schema="schema" />`.
- **Dynamic Schema**: Use `useSchemaForm({ initialSchema })`, obtain `schema`, `formValues`, `addField`, `removeField`, `updateField`, `moveField`, etc., then pass to `<SchemaForm>`.

### Step 3: Implement and Validate

- Types from `@/components/SchemaForm`: Schema, SchemaColumnsItem, FormValues, EvalCtx, FieldRenderCtx.
- Validation: Add `ref="formRef"` to `<SchemaForm>`, call `formRef.value?.validate()`; useSchemaForm does not provide `validate()`.
- Submit: `@submit` or `formRef.value?.submit()`.

### Step 4: Forbidden

- Do NOT reference `src/views/example/schema-form` as a business dependency (example dir may be removed later).
- Do NOT hand-write many PrimeVue form components when the scenario matches "multi-field / validation / steps / groups / dynamic".

## 5. Reference

- Component: `src/components/SchemaForm`
- Hook: `src/hooks/modules/useSchemaForm.ts`
- Internal hooks: `src/components/SchemaForm/hooks/` (useFormSync, useValidation, useSteps, etc.; business layer usually only needs useSchemaForm)
