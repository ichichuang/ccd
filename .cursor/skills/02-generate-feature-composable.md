# Skill 02: Generate Feature Composable (Business Hook)

## Goal

Based on existing API module (`src/api/<module>/<feature>.ts`), generate/update the corresponding business Hook (`src/hooks/modules/useXxx.ts`), return a unified `loading/data/error/send`, and add pagination/filtering state as needed.

## Inputs

- API module path: `src/api/<module>/<feature>.ts`
- Desired Hook name: e.g. `useUserLogin` / `useUserList`
- Business state: Whether pagination (page/pageSize/total), filters, refresh, cache strategy, etc. is needed

## Pre-check (mandatory)

Read and follow:

- `@docs/ai-specs/PROJECT_PROTOCOL.md`
- `@docs/ai-specs/GOLDEN_SAMPLES/useFeatureLogic.ts` (structure/style reference)
- `@.cursor/rules/10-logic-layer.mdc`
- `@.cursor/rules/15-utils-and-hooks-first.mdc`

## Golden Sample

`docs/ai-specs/GOLDEN_SAMPLES/useFeatureLogic.ts` wraps `useHttpRequest` and provides reference for the **loading/data/error/send** return shape. This Skill requires the generated Hook to:

1. Import `buildXxxMethod` from `src/api/<module>/<feature>.ts`
2. Call it via `useHttpRequest(buildXxxMethod)`
3. Return the same shape as useHttpRequest (loading/data/error/send)

## Task

1. Implement in `src/hooks/modules/useXxx.ts`:
   - Use `useHttpRequest` (from `@/hooks/modules/useHttpRequest`)
   - Call `build<Domain><Feature>Method` (preferred) or `request<Domain><Feature>` (fallback) from API module
2. Expose unified return shape (recommend matching golden sample): `loading/data/error/send`
3. If pagination/filtering: also expose `params` (ref/reactive) and methods like `reset`/`refresh`
4. Reuse existing utils (date/ids/lodashes/mitt, etc.); do NOT reimplement

## Output

- Full content of target Hook file `src/hooks/modules/useXxx.ts`

## Non-goals

- No UI (do not change template/class)
- No hardcoded URL in Hook (URL/Method building MUST be in API module)

## Validation

- [ ] Uses `useHttpRequest`
- [ ] API from `src/api/<module>/<feature>.ts` (not views/components)
- [ ] Return includes at least `loading/data/error/send`
- [ ] No fetch/axios
- [ ] No any
- [ ] All variables have explicit type annotations (including ref/computed/reactive)
  - [ ] `const loading = ref<boolean>(false)` not `const loading = ref(false)`
  - [ ] `const data = ref<DataType | null>(null)` not `const data = ref(null)`
  - [ ] `const result = computed<ResultType>(() => ...)` not `const result = computed(() => ...)`
  - [ ] `const items: Item[] = []` not `const items = []`
  - [ ] Function params and return types are explicit: `function process(data: ProcessData): ProcessResult`

## Prompt Template (copy & use)

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md
Reference @docs/ai-specs/GOLDEN_SAMPLES/useFeatureLogic.ts
Follow @.cursor/rules/10-logic-layer.mdc and @.cursor/rules/15-utils-and-hooks-first.mdc

Task: Generate business Hook for the following API module (no UI)
- API: @src/api/<module>/<feature>.ts
- Hook: src/hooks/modules/use<Xxx>.ts (name as use<Domain><Feature>, e.g. useUserLogin)

Requirements:
1) MUST use useHttpRequest
2) Call build<Domain><Feature>Method (preferred) or request<Domain><Feature> (fallback) from API module
3) Return loading/data/error/send, add pagination/filter state and refresh/reset as needed
4) Forbidden: fetch/axios; any; hardcoded URL in Hook
```
