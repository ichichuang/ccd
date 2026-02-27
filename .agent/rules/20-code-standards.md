---
description: Code standards: naming, directory structure, best practices
globs: **/*.ts, **/*.vue, **/*.tsx
alwaysApply: true
---

# Code Standards

## 1. Naming Conventions

- **Components**: `PascalCase` (e.g. `UserCard.vue`, `UserProfile.tsx`).
- **Composables**: `camelCase`, prefix `use` (e.g. `useUserSession.ts`).
- **API files**: `camelCase` (e.g. `user.ts`, `orderService.ts`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g. `DEFAULT_PAGE_SIZE`).
- **Types/interfaces**: `PascalCase` (e.g. `UserDTO`, `ButtonProps`).

## 2. Directory Structure

### UI Components

- **Single file**: `src/components/UserCard.vue`
- **Complex component**:
  ```
  src/components/UserCard/
  ├── index.ts        # export * from './UserCard.vue'
  ├── UserCard.vue    # main component
  ├── components/     # subcomponents
  │   └── UserAvatar.vue
  └── utils/          # local helpers
  ```

### Views

- `src/views/<Module>/<Page>.vue`
- Keep flat structure within module when possible.

## 3. Imports and Unused Code

- **Vue**: Do NOT manually import `ref`, `computed`, `watch` from `'vue'` (auto-import); use `import type { Ref, ComputedRef } from 'vue'` only when exporting. See `docs/ai-specs/BUILD_SYSTEM.md`.
- **Unused**: Remove unused imports; prefix intentionally unused vars/destructuring with **`_`** (e.g. `_apiData`, `selectionComputed: _selectionComputed`).

## 4. TypeScript Best Practices

- **No `any`**: Use `unknown` or specific types.
- **Strict null checks**: Always handle `null`/`undefined`.
- **Explicit type annotations (required)**: All variable declarations MUST have explicit type annotations. No inference for variable declarations.
  - **Regular vars**: `const value: ReturnType = someFunction()` not inferred; `const items: Item[] = []` not `[]`.
  - **Reactive**: `const loading = ref<boolean>(false)`; `const data = ref<UserDTO | null>(null)`; `const result = computed<ProcessedResult>(...)`; `const state = reactive<{ count: number }>({ count: 0 })`.
- **Function signatures**: All params and return types explicit.
  - ❌ `function process(data)` → ✅ `function process(data: ProcessData): ProcessResult`
  - ❌ `const handler = (e) => {...}` → ✅ `const handler = (e: Event) => {...}`
- **Complex types**: Extract to `src/types/` or colocated `interface`/`type`. Prefer `interface` for extendable shapes; prefer `type` for unions/intersections.
- **Props**:
  ```ts
  interface Props {
    title: string
    count?: number
  }
  const props = withDefaults(defineProps<Props>(), { count: 0 })
  ```

## 4a. Vue Template Syntax (for AI Agents)

- **Forbidden**: TypeScript syntax in Vue `<template>`.
  - ❌ `:prop="value as any"`, `:prop="value as MyType"`, `:prop="value: MyType"`
  - ❌ Type assertions (`as`), annotations (`:`), generics (`<>`) in template bindings.
- **Forbidden**: Multi-statement inline event handlers. Extract to methods in `<script setup>`, call from template.
  - ❌ `@click="a = 1; b = 2"` → ✅ `@click="handleClick"` with `handleClick` in script.
- **Correct**: Define types and methods in `<script setup>`, use typed vars or method calls in template.
- **Reference**: `docs/ai-specs/VUE_TEMPLATE_ANTIPATTERNS.md` is SSOT.

## 4b. TSX and DataTable Column Rendering (for AI Agents)

When task involves DataTable column body, filterRenderer, editorRenderer, contentRenderer returning VNode:

- **MUST** use TSX (JSX); **forbidden** template strings: ❌ `body: row => return \`<span class="${cls}">${row.status}</span>\``, ✅ `body: row => <span class={\`font-semibold ${cls}\`}>{row.status}</span>`
- **If JSX in .vue**: MUST change `lang="ts"` to `lang="tsx"`.
- **Reference**: `docs/ai-specs/AI_CODING_PROTOCOL.md`, `.cursor/rules/27-ai-tsx-decision.mdc`, `docs/ai-specs/DataTable_COMPONENT.md` §7.1

## 5. Export Patterns

- **Named exports only**: Utils, Hooks, API. ❌ `export default function ...`
- **Default export allowed**: Only for Vue components (`.vue`).

## 6. Comments

- **JSDoc**: Use for all exported functions/types.
- **Separators**: Use `// === Section ===` in long files.

## 7. Color Class Guide (for AI Agents)

- **Color semantic SSOT**: `src/constants/theme/colorUsage.ts` (primary=brand, accent=interaction, ring=focus); forbidden to use primary for hover/focus/selection. See `.cursor/rules/21-color-authority.mdc`.
- When generating `bg-*`/`text-*`/`border-*`, use only tokens that exist in the design system. Borders: use shortcuts (`component-border`, `border-b-default`, `border-t-default`); forbidden `border border-border` alone.
- **Allowed background semantics**: `bg-background`, `bg-card`, `bg-muted`, `bg-primary`/`bg-accent`/`bg-danger`/`bg-warn`/`bg-success`/`bg-info` (+ `-hover`/`-light`), `bg-sidebar` family, `bg-surface-ground` (only `surface-*` allowed).
- **Agent forbidden**: Inventing `bg-surface-100/200`, `bg-surface-ground/50`, `bg-surface-hover`, `dark:bg-surface-700`, etc. Any `bg-*` not supported by `uno.config.ts` or documented tokens.
- For new background semantics: map to existing tokens first; if insufficient, ask human to extend theme rather than inventing new `bg-*` strings.

## 8. Width and Max-Width Guide (for AI Agents)

- **Do NOT use** Uno/Tailwind preset widths like `max-w-2xl` ~ `max-w-7xl` (fixed rem, conflicts with viewport/% layout).
- **Preferred content patterns**: `w-full max-w-[80vw] mx-auto`, `w-full max-w-[90vw] mx-auto`, `w-full max-w-[60vw] mx-auto`.
- For reusable semantic widths: use existing layout vars from `LAYOUT_DIMENSION_KEYS`; ask human to extend if needed.
- ✅ Use `%`, `vw`, `vh`, or layout vars from `uno.config.ts`.
- ❌ Do NOT use `max-w-2xl` ~ `max-w-7xl` in generated code.
