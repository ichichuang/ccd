# CLAUDE.md — Project Intelligence File

> This file is the permanent memory and system instruction for Claude Code operating in this repository.
> Read it fully before writing ANY code. All rules here are non-negotiable.

---

## 1. Project Overview & Tech Stack

This is an enterprise-grade Vue 3 admin scaffold. It is a **template** — never reference it by any internal project name in generated code or comments.

| Layer           | Technology                               | Version |
| --------------- | ---------------------------------------- | ------- |
| Framework       | Vue 3 Composition API (`<script setup>`) | ^3.5.12 |
| Language        | TypeScript (strict)                      | ^5.8.3  |
| Build           | Vite                                     | ^7.3.1  |
| State           | Pinia                                    | ^3.0.3  |
| Router          | Vue Router                               | ^4.4.5  |
| UI Library      | PrimeVue **v4** (Unstyled mode)          | ^4.5.4  |
| Styling         | UnoCSS with semantic shortcuts           | ^66.6.0 |
| HTTP            | Alova (via `@/utils/http` wrapper)       | ^3.3.3  |
| Charts          | UseEcharts component (wraps vue-echarts) | ^6.0.0  |
| i18n            | vue-i18n + dayjs                         | —       |
| Package manager | `pnpm` (primary), fallback `npm`         | —       |

---

## 2. Build, Lint & Dev Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build (vue-tsc + vite build)
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint auto-fix
pnpm type-check   # vue-tsc --build --force (no emit)
```

**Node.js ≥ 24.3.0 required.**

---

## 3. Strict Coding Conventions

### 3.1 Vue Component Rules

- **MANDATORY**: `<script setup lang="ts">` for ALL components. Options API is FORBIDDEN.
- **MANDATORY**: All composables must declare explicit return types to prevent "inferred type cannot be named" TS errors.
- **FORBIDDEN**: TypeScript syntax in `<template>` (move casts/assertions to `<script setup>`).
- **FORBIDDEN**: `defineProps` with index signatures combined with `withDefaults` (Vue compiler crash).
- **Auto-imports active** in `.vue` files — do NOT manually import Vue primitives or PrimeVue components:
  - FORBIDDEN: `import { ref, computed } from 'vue'`
  - FORBIDDEN: `import Card from 'primevue/card'`
  - ALLOWED: type-only imports `import type { Ref } from 'vue'`
  - EXCEPTION: `src/layouts/**`, standalone `.tsx` files, `src/router/`, `src/utils/`, `src/api/`, `src/plugins/` must explicitly import everything.

### 3.2 TypeScript Rules

- **FORBIDDEN**: `any` in business logic, components, or stores.
  - Allowed ONLY in: `src/adapters/`, `src/utils/http/interceptors.ts`, `src/utils/safeStorage/**`, `src/utils/date/**`, `src/components/UseEcharts/**`, `src/hooks/modules/useChartTheme/**`
- **REQUIRED**: All variables must have explicit type annotations (no implicit inference).
- **REQUIRED**: Type guards before accessing methods on `unknown` or general `object` types.
- **REQUIRED**: Generics must be preserved explicitly through multiple layers (never degrade to `any`/`unknown`).
- Use `tsconfig.app.json` for app code; `tsconfig.node.json` for build tools only. Never mix.

### 3.3 File Naming & Directory Structure

| Layer               | Location                                | Case                                     | Example                         |
| ------------------- | --------------------------------------- | ---------------------------------------- | ------------------------------- |
| Views               | `src/views/`                            | `kebab-case` dirs + `index.vue`          | `user-management/index.vue`     |
| Components          | `src/components/`                       | `PascalCase` dir + `PascalCase.vue`      | `DataGrid/DataGrid.vue`         |
| Component internals | `src/components/X/`                     | lowercase subdirs                        | `utils/`, `hooks/`, `wrappers/` |
| Composables         | `src/hooks/`                            | `camelCase` files starting with `use`    | `useFormState.ts`               |
| Utils/API/Stores    | `src/utils/`, `src/api/`, `src/stores/` | `camelCase`                              | `chartUtils.ts`                 |
| Type definitions    | `src/types/`                            | `PascalCase` + `Types` suffix or `.d.ts` | `ThemeTypes.ts`                 |

### 3.4 Identifier Naming (ESLint enforced)

- Interfaces, types, enums, classes → `PascalCase`
- Variables, functions, methods, parameters → `camelCase`
- Constants → `UPPER_CASE`

### 3.5 API Layer (Flat, 2-level max)

Structure: `src/api/<module>/<feature>.ts` — exactly 2 levels. 3+ levels are FORBIDDEN.

Each file contains:

1. DTO types (`<Domain><Feature>Req`, `<Domain><Feature>Res`, `<Domain><Feature>DTO`)
2. Method builders: `build<Domain><Feature>Method(client, params) => client.Get<XxxRes>(...)`
3. Optional convenience: `request<Domain><Feature>(params)` wrapping the builder

- **FORBIDDEN**: default exports from `src/api/**`
- **FORBIDDEN**: generic names (`get`, `post`, `list`, `data`, `request`, `service`)
- NEVER use raw `fetch` or `axios` — always use Alova via `@/utils/http`

### 3.6 Data Layer Rules

**Strict decoupling — forbidden cross-layer calls:**

- Pinia stores MUST NOT import `vue-router` or call `router.push()`
- Pinia stores MUST NOT call API functions directly
- API modules MUST NOT import Pinia stores
- NEVER call `router.addRoute()` / `router.removeRoute()` directly — use `DynamicRouteManager`

**Correct flow:** `src/api/**` → `src/hooks/modules/use*.ts` → `src/stores/**` → `src/views/**`

### 3.7 Data Immutability

- FORBIDDEN: in-place array/object mutation (`array.sort()`, `array.splice()`, `route.children = []`)
- REQUIRED: clone before mutating: `[...arr].sort()`, `{ ...obj, key: val }`
- All utility functions must be pure (return new, don't mutate input)

### 3.8 TSX & Render Functions

- When ANY JSX syntax appears in a script block → MUST use `lang="tsx"`
- FORBIDDEN: `h()` function — use TSX instead
- FORBIDDEN: `createElement()` — use TSX instead
- FORBIDDEN: template string as HTML (`` return `<span>${x}</span>` `` returns string, not VNode)
- Use TSX for: table cell renderers, dropdown templates, complex dynamic VNodes, render functions
- Default to SFC `.vue`; use standalone `.tsx` only for pure render components, config exports, layouts

---

## 4. UI & Design System Rules

### 4.1 Color System (Semantic Tokens ONLY)

**SSOT**: `src/constants/theme/colorUsage.ts`

| Token                                  | Usage                                |
| -------------------------------------- | ------------------------------------ |
| `primary`                              | Brand, primary CTAs                  |
| `primary-hover`                        | ALL hover feedback                   |
| `primary-light`                        | Focus preselection, subtle bg        |
| `accent`                               | Tab indicators, badges, markers      |
| `ring`                                 | Focus rings ONLY (`focus:ring-ring`) |
| `neutral`                              | Structural surfaces, borders         |
| `success`, `danger`, `warning`, `info` | Status states                        |

- **FORBIDDEN**: hardcoded hex/RGB (`#fff`, `rgb(255,0,0)`)
- **FORBIDDEN**: raw Tailwind color classes (`text-red-500`, `bg-blue-500`)
- **FORBIDDEN**: `rgba(0,0,0,x)` for shadows — use `rgb(var(--foreground) / <alpha>)`
- **FORBIDDEN**: `ring`, `outline`, bare `border` / `border-{color}` utilities for decoration — use `shadow` only
- **EXCEPTION**: `border-b-default`, `border-t-default`, `border-l-default` shortcuts are permitted (built-in weak separators using `border-border/15`)

### 4.2 Size & Spacing (Design Token Scale)

**ABSOLUTE RULE**: NO raw `rem`, `em`, or `px` in business code.

| Need           | Token                                                            |
| -------------- | ---------------------------------------------------------------- |
| Spacing        | `p-padding-lg`, `m-margin-md`, `gap-scale-md`                    |
| Font size      | `fs-xs`, `fs-sm`, `fs-md`, `fs-lg`, `fs-xl`, `fs-2xl`–`fs-5xl`   |
| Border radius  | `rounded-scale-md`, `def-rounded`                                |
| Layout width   | `layout-content-narrow`, `layout-content`, `layout-content-wide` |
| Sidebar/header | `w-sidebarWidth`, `h-headerHeight`                               |
| Duration       | `duration-scale-md` (FORBIDDEN: `duration-300`, `duration-200`)  |

### 4.3 UnoCSS Semantic Shortcuts (MANDATORY use)

**Flex/alignment** — FORBIDDEN to write raw Tailwind composition:

- MUST: `center`, `row-center`, `row-between`, `column-center`, `column-between`
- FORBIDDEN: `flex justify-center items-center`

**Density** — use shortcut classes:

- `density-compact`, `density-normal`, `density-comfortable`, `density-responsive`
- `layout-stack` for vertical form/card stacks
- `layout-wrap` for flex-wrap containers

**Typography**:

- Single-line truncation: `text-single-line-ellipsis`
- Two-line truncation: `text-two-line-ellipsis`
- Muted text: `text-muted` or `text-secondary`

**Surfaces & Elevation**:

- Canvas: `bg-background`
- Elevated cards: `surface-elevated` (= `bg-card` + `shadow-soft`)
- Sunken tracks: `surface-sunken` or `bg-muted/30`
- Glass/sticky elements: `glass-surface` or `glass-surface-lg`
- Card hover: `interactive-hover-card` or `interactive-hover-tile`
- Focus: `interactive-focus-ring` (box-shadow based, NEVER `focus:ring-*` for decorative rings)

**Transitions**:

- MUST: `behavior-hover-transition` or `transition-all duration-scale-md ease-out`
- For physical lift: `hover:-translate-y-1` + shadow diffusion

### 4.3-B: Class Stacking Prohibition Rules (Anti-Hallucination)

**Rule N-1 — Shortcut expansion values NEVER co-exist with the shortcut itself**

> **ABSOLUTE RULE**: When using a shortcut, NEVER simultaneously write the atomic classes that the shortcut expands into.
> FORBIDDEN examples:
>
> - `flex items-center justify-center center` — `center` already contains `flex items-center justify-center`
> - `flex flex-col layout-stack` — `layout-stack` already contains `flex flex-col`
> - `w-full h-full layout-full` — `layout-full` already contains `w-full h-full`
> - `bg-card shadow-soft surface-elevated` — `surface-elevated` already contains both
> - `transition-all duration-scale-md behavior-hover-transition` — shortcut already contains both
> - `gap-md p-padding-md density-normal` — `density-normal` already contains both
>   **Correct**: write only the shortcut, remove its expanded atomic classes.

---

**Rule N-2 — Flex atomic classes are mutually exclusive with flex shortcuts**

> **ABSOLUTE RULE**: When using any flex shortcut, NEVER write `flex`, `flex-row`, `flex-col`, `items-*`, `justify-*`.
> Flex shortcuts (each already contains `flex`):
> `center`, `row`, `column`, `row-center`, `row-between`, `row-start`, `column-center`, `column-between`, `layout-stack`, `layout-wrap`
> FORBIDDEN: `flex row-between`, `flex flex-col column-center`, `flex items-center row-center`
> **Correct**: `row-between`, `column-center` (standalone, no `flex` prefix)

---

**Rule N-3 — `.pv-input-fluid` is a PrimeVue-exclusive class**

> **ABSOLUTE RULE**: `.pv-input-fluid` is ONLY for wrapping PrimeVue input components (InputText, Select, etc.) to force `width: 100%` on the inner `.p-inputtext` element.
> NEVER use `.pv-input-fluid` on generic `div`, `section`, or layout containers.
> For general full-width needs: use `w-full` or `layout-full` (pick one, never both).

---

**Rule N-4 — Hover/transition shortcuts are tiered; pick exactly one tier**

> Hover and transition shortcuts are organized in 3 tiers — **select exactly one, NEVER stack across tiers**:
>
> - **Tier 1 (inline elements / menu items):** `behavior-hover-transition` (transition only, no lift)
> - **Tier 2 (cards / panels):** `interactive-hover-card` (transition + `-translate-y-1` + shadow; already includes Tier 1)
> - **Tier 3 (tiles / grid items):** `interactive-hover-tile` (heavier float effect on top of shadow-soft)
>   FORBIDDEN: `behavior-hover-transition interactive-hover-card` (Tier 1+2 stack)
>   FORBIDDEN: `interactive-hover interactive-hover-card` (legacy + current shortcut stack)

---

### 4.4 Layout System

**Layer 1 — LayoutMode** (via `route.meta.parent`):

- `'admin'` → standard admin shell
- `'fullscreen'` → login/error pages
- `'ratio'` → fixed-ratio dashboards (requires `meta.ratio`)

**Layer 2 — AdminLayoutMode** (when inside `admin`):

- `'vertical'` → sidebar left
- `'horizontal'` → top menu
- `'mix'` → sidebar + top menu

**CRITICAL — Transparent Root Policy**:

- Routes with `meta.parent === 'admin'` MUST NOT set background on root wrapper
- Root element classes: `h-full flex flex-col overflow-hidden` ONLY
- Background is provided by LayoutAdmin canvas; internal cards use `surface-elevated`, `glass-surface`, etc.

### 4.5 PrimeVue v4 — Mandatory Rules

- **Always use v4 component names**:
  - `Select` (NOT `Dropdown`), `DatePicker` (NOT `Calendar`), `ToggleSwitch` (NOT `InputSwitch`), `Drawer` (NOT `Sidebar`)
- Styling via `pt` (pass-through) props using UnoCSS classes — NEVER write `<style>` for PrimeVue overrides
- NEVER use PrimeVue's built-in themes — project uses unstyled + custom preset

### 4.6 Scrollbars & Overflow

- ALL scrollable containers MUST use `<CScrollbar>` component — NEVER bare `overflow-auto`

### 4.7 Icons

- ALL icons via `<Icons>` component using Lucide / Solar / Phosphor / Logos sets
- FORBIDDEN: raw SVG inline, base64 data URIs, external image URLs for icons

### 4.8 Empty States & Loading

- Every data page MUST have:
  1. Loading skeleton or spinner while fetching
  2. `<EmptyState>` component (icon + title + description + optional CTA) when no data
- FORBIDDEN: blank screens with no feedback
- Empty state copy via `$t('emptyState.*')` — FORBIDDEN: hardcoded strings

---

## 5. Architectural Patterns

### 5.1 Utility Lookup (Search Before Implementing)

Before writing ANY utility logic, check existing utilities:

| Need              | Use                                                                        |
| ----------------- | -------------------------------------------------------------------------- |
| HTTP requests     | `@/utils/http/*` + `useHttpRequest`                                        |
| Secure storage    | `@/utils/safeStorage/*`                                                    |
| Global events     | `@/utils/mitt`                                                             |
| Deep clone/merge  | `@/utils/lodashes` (`deepClone`, `deepEqual`, `deepMerge`, `pick`, `omit`) |
| Unique IDs        | `@/utils/ids` (`generateUniqueId`, `generateIdFromKey`)                    |
| Date utilities    | `@/utils/date/`, `@/hooks/modules/useDateUtils`                            |
| String utilities  | `@/utils/strings` (`toKebabCase`, etc.)                                    |
| Breakpoint/device | `@/utils/deviceSync` (pre-mount), stores (runtime)                         |
| ECharts theme     | `@/hooks/modules/useChartTheme/`                                           |
| Element resize    | `@/hooks/modules/useAppElementSize`                                        |
| Theme switch      | `@/hooks/modules/useThemeSwitch`                                           |
| Locale switch     | `@/hooks/modules/useLocale`                                                |
| Page title        | `@/hooks/layout/usePageTitle`                                              |
| Loading state     | `@/hooks/layout/useLoading`                                                |
| Progress bar      | `@/hooks/layout/useNprogress`                                              |

### 5.2 Composable Pattern (HTTP + State)

```typescript
// src/hooks/modules/useXxx.ts
import type { XxxRes } from '@/api/module/feature'
import { buildXxxMethod } from '@/api/module/feature'

export function useXxx() {
  const { loading, data, error, send } = useHttpRequest<XxxRes>(buildXxxMethod)
  // Explicit types on ALL refs:
  const items = ref<XxxRes[]>([])
  return { loading, items, send }
}
```

### 5.3 Dialog & Toast

- Complex dialogs: `useDialog()` from `@/hooks/modules/useDialog`
- Simple confirmation: `useConfirm().require()`
- Toast inside components: `useToast()` (PrimeVue)
- Toast outside components: `window.$toast` / `window.$message`
- FORBIDDEN: direct `<Dialog>` instantiation in business code

### 5.4 Router Conventions

- Define all routes in `src/router/modules/*.ts` using `RouteConfig | RouteConfig[]`
- FORBIDDEN: defining routes inside views or components
- Always set complete `meta`: `{ title, parent, rank, roles, auths, keepAlive }`
- Navigation helpers (MUST use): `goBack`, `goToRoute`, `replaceRoute`, `refreshCurrentRoute` from `src/router/utils/helper.ts`
- Dynamic routes: use `DynamicRouteManager` ONLY

### 5.5 ECharts

- MUST: `<UseEcharts>` component for ALL charts
- FORBIDDEN: raw ECharts init, `vue-echarts` directly, hardcoded colors in chart options
- Canvas colors from `getChartSystemVariables()` / `useChartTheme()`
- Glassmorphism: `withAlpha(background, 0.x)`, tooltip `withAlpha(config.card, 0.92)`

---

## 6. ProForm Engine

The ProForm engine is the project's enterprise form system. It lives in `src/components/ProForm/`.

### 6.1 Architecture Overview

```
Schema (FormSchema)
  └── FormController (Orchestrator)
       ├── SubscriptionStore   — per-field reactive state, field-level subscribers
       ├── DependencyGraph     — DAG of field→field dependencies
       ├── Scheduler           — topological sort for update order
       ├── TransactionManager  — batch atomic updates, prevent cascading re-renders
       ├── ValidationEngine    — rules[] + custom resolver, race-condition safe
       ├── Logic Engines       — VisibilityEngine, DisableEngine, RequiredEngine, ComputedEngine
       └── LifecycleManager    — fieldMount hooks, async options loading
  └── PrimeVueRenderer (Renderer)
       └── ProFormNode         — recursive schema tree renderer
            └── Field Components (14 types via FieldRegistry)
```

**Design axiom**: The engine core (`engine/`) has ZERO imports from PrimeVue or DOM. It is headless.

### 6.2 Schema Structure

```typescript
// Root schema
interface FormSchema {
  fields: FormSchemaNode[]
  layout?: NodeLayoutSchema
}

// Field node
interface FieldSchema {
  name: string // Unique key (maps to form values)
  component: string // Registry key: 'input'|'select'|'textarea'|'number'|'switch'|'checkbox'|'radio'|'date'|'multiselect'|'slider'|'mask'|'rating'|'upload'
  label?: string
  required?: boolean
  description?: string
  defaultValue?: unknown
  props?: Record<string, unknown> // Component-specific props
  rules?: ValidationRule[] // [{message, validator: (v) => boolean|Promise<boolean>}]
  deps?: string[] // Fields this depends on
  visibleIf?: (ctx: LogicContext) => boolean
  disabledIf?: (ctx: LogicContext) => boolean
  requiredIf?: (ctx: LogicContext) => boolean
  computed?: (ctx: LogicContext) => unknown
  options?: SelectOption[] | ((ctx: LogicContext) => Promise<SelectOption[]>)
  span?: number | Record<BreakpointKey, number> // 12-column responsive grid
  transform?: (value: unknown, formValues: unknown) => unknown // Serializer on submit
}

// Group/layout node
interface GroupSchema {
  type: 'group' | 'section' | 'card' | 'collapse' | 'tabs' | 'step'
  label?: string
  layout?: NodeLayoutSchema & { span?: ResponsiveSpan }
  children: FormSchemaNode[]
}

// Logic context (available in all logic functions)
interface LogicContext {
  form: TValues // ALL current form values
  field: string // This field's name
}
```

### 6.3 useForm Hook (Primary API)

```typescript
import { useForm } from '@/components/ProForm'
import type { FormSchema } from '@/components/ProForm'

const schema = reactive<FormSchema>({ fields: [...] })

const { form, handleSubmit, getValues } = useForm({
  schema,
  initialValues: { username: 'Admin' },
  validateOn: 'blur',    // 'change' | 'blur' | 'submit'
  persistKey: 'my-form', // optional: enables localStorage draft auto-save
  autoSave: true,        // optional: save on every change
})

// Imperative form API
form.setValue('fieldName', value)
form.setFieldsValue({ a: 1, b: 2 })
form.validate()         // Promise<boolean>
form.reset()
form.resetFields(['name', 'email'])
form.clearValidate()
form.setFieldProps('fieldName', { disabled: true }) // Dynamic schema updates

// Submit handler
const onSubmit = handleSubmit(async (values) => { /* API call */ })
```

### 6.4 ProForm Component Props

```vue
<ProForm
  :schema="schema"
  :layout="'vertical'"          <!-- 'horizontal' | 'vertical' -->
  :label-width="'120px'"
  :label-align="'right'"        <!-- 'left' | 'right' -->
  :disabled="globalDisabled"
  :readonly="globalReadonly"
  @submit="onSubmit"
>
  <!-- Custom field render override -->
  <template #field-{fieldName}="{ state, onUpdate }">...</template>
  <!-- Custom footer -->
  <template #footer="{ formState, submit }">...</template>
</ProForm>
```

### 6.5 useField & useFieldArray

```typescript
// Inside a custom field component
const { value, state, setValue, validate } = useField<string>('fieldName')

// Dynamic array fields
const { fields, append, remove, move } = useFieldArray<Item>('items')
```

### 6.6 Custom Field Registration (Plugin System)

```typescript
import { ProFormPlugins } from '@/components/ProForm'
import type { ProFormPlugin } from '@/components/ProForm'

const myPlugin: ProFormPlugin = {
  name: 'custom-fields',
  install(ctx) {
    ctx.registerField('my-custom-input', {
      component: MyCustomInput,
      defaultProps: {},
      propsMapper: (field, componentProps) => ({ ...componentProps }),
    })
  },
}

ProFormPlugins.use(myPlugin)
```

### 6.7 ProForm Anti-Patterns (FORBIDDEN)

- FORBIDDEN: Direct import of `FormController` from engine core in views/components
- FORBIDDEN: Watching `form.state.values` with a deep watcher for side effects — use `deps` + `computed`/`visibleIf` instead
- FORBIDDEN: Mutating `schema.fields` directly after form init — use `form.setFieldProps()` for dynamic updates
- FORBIDDEN: Calling `getValues()` inside a `computed()` — use `form.state.values` reactive ref instead
- FORBIDDEN: Bypassing TransactionManager by setting SubscriptionStore state directly

---

## 7. Governance & Meta-Rules

### 7.1 Code Hygiene

- FORBIDDEN: project name or internal branding in any code, config, or comments
- FORBIDDEN: personal author names in headers
- Use generic placeholders: `[Project Name]`, `[Your Company]`
- All temp/debug files created during reasoning MUST be deleted before finishing a task

### 7.2 User Communication Language

- Architecture decisions, design intent, UX critique, error descriptions → **Chinese**
- File paths, code identifiers, component names, CLI commands, type names, code snippets → **keep in English**

### 7.3 Pre-Output Checklist (Run Before Every Code Generation)

1. [ ] No hardcoded hex/px/rem — using semantic tokens only
2. [ ] No `any` in business logic
3. [ ] No manual Vue/PrimeVue imports in `.vue` files
4. [ ] PrimeVue v4 component names used (`Select` not `Dropdown`, etc.)
5. [ ] TSX used for VNode generation, not `h()` or string templates
6. [ ] `lang="tsx"` set when JSX appears in script block
7. [ ] Root wrapper of admin routes has NO background class
8. [ ] Loading + EmptyState present on all data views
9. [ ] No direct `router.addRoute()` calls
10. [ ] No Pinia store calling API functions directly
11. [ ] Utility lookup performed before implementing new helpers

### 7.4 Schema-Driven Development

- Complex forms → define schema in `schemas/*.ts` first, then render with `<ProForm>`
- Complex tables → define columns in `configs/*.tsx` first with TSX cell renderers
- FORBIDDEN: inline template slots when config-based `render`/`body` prop applies

---

## 8. Key File Index

### Path Aliases

| Alias  | Target                     | Usage                                                               |
| ------ | -------------------------- | ------------------------------------------------------------------- |
| `@/*`  | `src/*`                    | General app source imports                                          |
| `@!/*` | `src/api/*`                | API layer shortcut — `import { buildXxx } from '@!/module/feature'` |
| `@&/*` | `src/layouts/components/*` | Layout component shortcut — used inside layout modules only         |

### Key Files

| Purpose            | Path                                                        |
| ------------------ | ----------------------------------------------------------- |
| Theme color SSOT   | `src/constants/theme/colorUsage.ts`                         |
| HTTP instance      | `src/utils/http/instance.ts`                                |
| HTTP interceptors  | `src/utils/http/interceptors.ts`                            |
| Alova HTTP hook    | `src/hooks/modules/useHttpRequest.ts`                       |
| Router helper      | `src/router/utils/helper.ts`                                |
| Router guards      | `src/router/utils/guards.ts`                                |
| Dynamic routes     | `src/router/utils/common.ts` (`processAsyncRoutes`)         |
| Auth constants     | `src/constants/router.ts`                                   |
| Layout store       | `src/stores/modules/layout.ts`                              |
| User store         | `src/stores/modules/user.ts`                                |
| UnoCSS config      | `uno.config.ts`                                             |
| ProForm entry      | `src/components/ProForm/index.ts`                           |
| ProForm types      | `src/components/ProForm/engine/types/index.ts`              |
| ProForm controller | `src/components/ProForm/engine/core/FormController.ts`      |
| Field registry     | `src/components/ProForm/engine/registry/FieldRegistry.ts`   |
| Built-in fields    | `src/components/ProForm/renderers/registerBuiltinFields.ts` |
| Login view         | `src/views/login/login.vue`                                 |
| Layout root        | `src/layouts/index.vue`                                     |
| Admin layout       | `src/layouts/modules/LayoutAdmin.tsx`                       |

---

_This file is maintained by Claude Code and updated whenever project architecture evolves._
