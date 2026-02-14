---
description: 逻辑层规范：API -> Hook -> UI 分层架构
globs: **/*.vue, **/*.ts, **/*.tsx
alwaysApply: true
---

# Logic Layer Awareness

## 1. The Three-Tier Architecture

You MUST strictly follow this flow for any data-driven feature:

1.  **Level 1: API Definition** (`src/api/<module>/<feature>.ts`)
    - Define Types (DTOs).
    - Define Method Builders using `alovaInstance`.
    - **NO** hook logic here, just pure API definitions.

2.  **Level 2: Business Hook** (`src/hooks/modules/use<Feature>.ts`)
    - Import API methods.
    - Use `useHttpRequest` to manage state (`loading`, `data`, `error`).
    - Export reactive state and methods to the UI.

3.  **Level 3: UI Consumer** (`src/views/...` or `src/components/...`)
    - Import the Hook: `const { list, loading, refresh } = useFeature()`
    - Bind to Template: `:loading="loading"`, `v-for="item in list"`.
    - **ZERO** API calls in UI. **ZERO** complex data processing in UI.

## 2. Logic Placement Map

| Logic Type                | Correct Location                           |
| :------------------------ | :----------------------------------------- |
| HTTP Requests             | `src/api/`                                 |
| Business State            | `src/hooks/modules/`                       |
| Global State (User/Theme) | `src/stores/modules/`                      |
| UI State (Toggle, Form)   | `src/components/` (Local `ref`/`reactive`) |
| Data Formatting           | `src/utils/` or `useDateUtils`             |
| Element Resizing          | `useAppElementSize`                        |

## 3. Explicit Prohibitions

- ❌ **NO** `axios.get()` or `fetch()` in components.
- ❌ **NO** defining interfaces/types inside `.vue` files (move to `src/types/` or `src/api/`).
- ❌ **NO** direct usage of `localStorage` (use `safeStorage` or `Pinia persist`).
