---
description: Full feature development: API Definition -> Business Hook -> UI Integration
globs: **/*
---

# Full Feature Development Skill

## 1. Goal

Implement an end-to-end feature from backend API definition to frontend UI.

## 2. Steps

### Step 1: API Definition (Layer 1)

- Create `src/api/<module>/<feature>.ts`.
- Define `Req` / `Res` / `DTO` interfaces.
- Use `alovaInstance` and export `build<Feature>Method`.

### Step 2: Business Logic Hook (Layer 2)

- Create `src/hooks/modules/use<Feature>.ts`.
- Import API from Step 1.
- Wrap API calls with `useHttpRequest`.
- Export reactive state (`data`, `loading`, `error`) and methods (`fetch`, `submit`).
- **Type safety**: All variables MUST have explicit type annotations:
  - ❌ `const loading = ref(false)` → ✅ `const loading = ref<boolean>(false)`
  - ❌ `const data = ref(null)` → ✅ `const data = ref<FeatureData | null>(null)`
  - ❌ `const result = computed(() => ...)` → ✅ `const result = computed<ResultType>(() => ...)`

### Step 3: UI Implementation (Layer 3)

- Create `src/views/<Module>/<Page>.vue`.
- Import hook from Step 2.
- Bind reactive state to template.
- Use UnoCSS for styling.
- Use components from `src/components/` — **no** manual import (auto-import). Layout components in `src/layouts/` require **explicit** import.

### Step 4: Verify

1. Check console for API errors.
2. Inspect network tab in `browser`.
3. Verify UI states (loading, error, success).
