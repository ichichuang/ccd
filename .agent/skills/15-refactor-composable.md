# Skill 04: Refactor to Composable (Extract logic to hooks)

## Goal

When business logic in a component/page grows (e.g. >10 lines, reusable, used in multiple places), extract it to `src/hooks/modules/useXxx.ts` and keep the UI layer clean.

## Pre-check (mandatory)

- `@docs/ai-specs/PROJECT_PROTOCOL.md`
- `@.cursor/rules/10-logic-layer.mdc`
- `@.cursor/rules/15-utils-and-hooks-first.mdc`

## Task

1. Identify extractable logic (requests, data processing, transforms, event subscriptions, size observers, etc.)
2. Create/update composable in `src/hooks/modules/useXxx.ts`
3. Page/component keeps only bindings (state/method mapping), no implementation details

## Hard Constraints

- Requests MUST go through `src/api/**` + `useHttpRequest`
- Reuse tools from `src/utils/*` (ids/lodashes/date/mitt, etc.)
- FORBIDDEN: any, fetch/axios

## Prompt Template (copy & use)

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md
Follow @.cursor/rules/10-logic-layer.mdc and @.cursor/rules/15-utils-and-hooks-first.mdc

Task: Extract business logic from the following file into a composable (keep UI unchanged)
- Source: @<path>
- Target: src/hooks/modules/use<Xxx>.ts

Requirements:
- <template> and class unchanged after extraction
- Logic layer follows useHttpRequest + src/api rules
- Prefer reusing src/utils utilities
```
