# Skill 08: SchemaForm Component Usage

## Goal

When the task involves multi-field forms (validation, steps, groups, dynamic fields), use SchemaForm + useSchemaForm instead of hand-writing PrimeVue form components.

## Pre-check

- `@docs/ai-specs/SCHEMA_FORM_COMPONENT.md`
- `@.cursor/rules/18-components-and-icons.mdc`

## Decision criteria

| Scenario                                            | Use                              |
| --------------------------------------------------- | -------------------------------- |
| 1–2 fields, no complex logic                        | PrimeVue InputText / Select etc. |
| Multi-field, validation/steps/groups/dynamic schema | **SchemaForm + useSchemaForm**   |

## Output

- Define Schema (columns, layout, rules, steps/sections, transform, hidden, etc.)
- Drive form via SchemaForm or useSchemaForm
- Import types from `@/components/SchemaForm`: Schema, SchemaColumnsItem, FormValues, EvalCtx, FieldRenderCtx
- **Validation**: Use SchemaForm ref, `formRef.value?.validate()`; useSchemaForm does NOT provide validate()
- **Transform**: Use column `transform: { input?, output? }` for "external→control" or "control→submit"
- **Persistence**: `persist` for short-term drafts (key/ttl); `remember` for content memory; step form and remember are mutually exclusive; see docs

## Forbidden

- Import from `src/views/example/schema-form` (example dir may be removed later)
- Hand-writing many PrimeVue form components instead of SchemaForm
