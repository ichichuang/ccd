---
description: Logic layer: API -> Hook -> UI layered architecture
globs: **/*.vue, **/*.ts, **/*.tsx
alwaysApply: true
---

# Logic Layer Rules

## 1. Three-Layer Architecture

For any data-driven feature, strictly follow this flow:

1. **Layer 1: API definition** (`src/api/<module>/<feature>.ts`)
   - Define types (DTOs).
   - Use `alovaInstance` for method builders.
   - Do NOT put Hook logic here; pure API definition only.

2. **Layer 2: Business Hook** (`src/hooks/modules/use<Feature>.ts`)
   - Import API methods.
   - Use `useHttpRequest` to manage state (loading, data, error).
   - Export reactive state and methods to UI.

3. **Layer 3: UI consumer** (`src/views/...` or `src/components/...`)
   - Import Hook: `const { list, loading, refresh } = useFeature()`
   - Bind to template: `:loading="loading"`, `v-for="item in list"`.
   - **Zero** API calls in UI. **Zero** complex data processing in UI.

## 2. Logic Placement Map

| Logic type                | Correct location                           |
| ------------------------- | ------------------------------------------ |
| HTTP requests             | `src/api/`                                 |
| Business state            | `src/hooks/modules/`                       |
| Global state (user/theme) | `src/stores/modules/`                      |
| UI state (toggle/form)    | `src/components/` (local `ref`/`reactive`) |
| Data formatting           | `src/utils/` or `useDateUtils`             |
| Element resize            | `useAppElementSize`                        |

## 3. Explicitly Forbidden

- ❌ FORBIDDEN: `axios.get()` or `fetch()` in components.
- ❌ FORBIDDEN: Defining interfaces/types in `.vue` files (move to `src/types/` or `src/api/`).
- ❌ FORBIDDEN: Using `localStorage` directly (use `safeStorage` or Pinia persist).
