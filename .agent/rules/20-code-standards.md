---
description: 代码规范：命名、目录结构与最佳实践
globs: **/*.ts, **/*.vue, **/*.tsx
alwaysApply: true
---

# Code Standards

## 1. Naming Conventions

- **Components**: `PascalCase` (e.g., `UserCard.vue`, `UserProfile.tsx`).
- **Composables**: `camelCase` starting with `use` (e.g., `useUserSession.ts`).
- **API Files**: `camelCase` (e.g., `user.ts`, `orderService.ts`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGE_SIZE`).
- **Types/Interfaces**: `PascalCase` (e.g., `UserDTO`, `ButtonProps`).

## 2. Directory Structure

### UI Components

- **Single File**: `src/components/UserCard.vue`
- **Complex Component**:
  ```
  src/components/UserCard/
  ├── index.ts        # export * from './UserCard.vue'
  ├── UserCard.vue    # Main component
  ├── components/     # Sub-components
  │   └── UserAvatar.vue
  └── utils/          # Local helpers
  ```

### Views

- `src/views/<Module>/<Page>.vue`
- Maintain flat structure inside modules where possible.

## 3. TypeScript Best Practices

- **No `any`**: Use `unknown` or specific types.
- **Strict Null Checks**: Always handle `null`/`undefined`.
- **Props Definition**:
  ```ts
  // Preferred
  interface Props {
    title: string
    count?: number
  }
  const props = withDefaults(defineProps<Props>(), {
    count: 0,
  })
  ```

## 4. Export Patterns

- **Named Exports Only**: for Utils, Hooks, APIs.
  - ✅ `export const useUser = ...`
  - ❌ `export default function ...`
- **Default Exports Allowed**: for Vue Components (`.vue`) only.

## 5. Commenting

- **JSDoc**: Use JSDoc for all exported functions/types.
- **Separators**: Use `// === Section ===` to divide long files.

## 6. Color Class Guidelines (for AI Agents)

- When generating `bg-*` / `text-*` / `border-*` classes, **only use tokens that exist in the design system** (`uno.config.ts` + theme metadata).
- **Allowed background semantics (examples)**:
  - Page/container: `bg-background`
  - Card/panel: `bg-card`
  - Subtle block / code background: `bg-muted`
  - Status colors: `bg-primary` / `bg-accent` / `bg-destructive` / `bg-warn` / `bg-success` / `bg-info` (and `-hover`/`-light`)
  - Sidebar: `bg-sidebar` family
  - PrimeVue theme compatibility: `bg-surface-ground` is the **only** `surface-*` class that may be used.
- **FORBIDDEN** for agents:
  - Inventing Tailwind/PrimeVue-style classes: `bg-surface-100/200/...`, `bg-surface-ground/50`, `bg-surface-hover`, `dark:bg-surface-700`, etc.
  - Using any `bg-*` class that is not backed by `uno.config.ts` or documented design tokens.
- If you need a new background semantics in generated code:
  - Prefer mapping it to one of the existing tokens above.
  - If that is not enough, ask the human to extend the theme system instead of creating a new `bg-*` string in templates.

## 7. Width & Max-Width Guidelines (for AI Agents)

- When generating width-related classes, **do NOT use Uno/Tailwind preset sizes like `max-w-2xl` ~ `max-w-7xl`**:
  - These map to fixed `rem` values and conflict with our viewport/percentage-based layout strategy.
  - Treat all `max-w-?xl` utilities as forbidden in business code.

- Preferred patterns for content containers:
  - Full-width centered content: `w-full max-w-[80vw] mx-auto`
  - Docs / configuration pages: `w-full max-w-[90vw] mx-auto`
  - Narrow text blocks or examples: `w-full max-w-[60vw] mx-auto`

- If you need a reusable semantic width:
  - Prefer using existing layout variables (`w-sidebarWidth`, etc.) defined via `LAYOUT_DIMENSION_KEYS`.
  - If necessary, ask the human to extend `LAYOUT_DIMENSION_KEYS` + `uno.config.ts` instead of inventing new `max-w-*` strings.

- Summary for agents:
  - ✅ Use `%`, `vw`, `vh` or layout variables via `w-*` / `max-w-*` defined in `uno.config.ts`.
  - ❌ Do not use Tailwind-style `max-w-2xl` / `max-w-3xl` / `max-w-4xl` / `max-w-5xl` / `max-w-6xl` / `max-w-7xl` in generated code.
