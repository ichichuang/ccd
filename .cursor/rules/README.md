# Cursor Rules Index

This directory contains rule files that the Cursor AI editor must follow. Rules define mandatory constraints and forbidden patterns.

> **Note**: Rules (`.cursor/rules/*.mdc`) define "constraints/forbidden patterns"; Skills (`.cursor/skills/*.md`) define "how to give instructions / how to break down tasks".

## Rule Categories

### Core Architecture (auto-applied)

1. **`00-core-architecture.mdc`** – Core architecture constraints
   - **Purpose**: Core constraints for all generation tasks
   - **Scope**: `src/**/*.{ts,vue}`
   - **Auto-apply**: Yes (`alwaysApply: true`)
   - **Contents**:
     - Package manager (pnpm first)
     - Absolute forbidden (Options API, fetch/axios, hardcoding, etc.)
     - TypeScript syntax (no TS in template, no implicit type inference)
     - Design system (Theme, Size, Layout, Responsive)
     - Router system requirements
     - Auth flow requirements

### Logic Layer

2. **`10-logic-layer.mdc`** – Logic layer
   - **Purpose**: Rules for Hooks and business logic
   - **Scope**: `src/hooks/**/*.ts`
   - **Auto-apply**: No (file-match)
   - **Contents**:
     - Follow golden sample (`docs/ai-specs/GOLDEN_SAMPLES/useFeatureLogic.ts`)
     - Use `useHttpRequest` for HTTP
     - Explicit type annotations for ref/computed/reactive
     - No `any` (boundary exceptions)

3. **`12-api-layer.mdc`** – API layer
   - **Purpose**: Flat `src/api` structure, add new APIs under `src/api` first
   - **Scope**: `src/**/*.{ts,vue}`
   - **Auto-apply**: Yes (`alwaysApply: true`)
   - **Contents**:
     - Flat directory (no third-level dirs)
     - No `export default`
     - No generic export names (get/list/data, etc.)
     - Export naming (`build<Domain><Feature>Method`)

### Tools and Components

4. **`15-utils-and-hooks-first.mdc`** – Tools-first strategy
   - **Purpose**: Reuse `src/utils` and `src/hooks` before implementing
   - **Scope**: `src/**/*.{ts,vue}`
   - **Auto-apply**: Yes (`alwaysApply: true`)
   - **Contents**:
     - Mandatory lookup (HTTP, Storage, Date, Strings, etc.)
     - Tool lookup workflow
     - Function-level catalog
     - Placement rules for new tools

5. **`18-components-and-icons.mdc`** – Components and icons
   - **Purpose**: Prefer `src/components`, icons via Icons
   - **Scope**: `src/**/*.vue`
   - **Auto-apply**: Yes (`alwaysApply: true`)
   - **Contents**:
   - Component reuse map (CScrollbar, AnimateWrapper, Icons, UseEcharts, PrimeDialog)
   - Icon selection (Lucide → MDI → Logos → custom SVG)
   - Icons color/specificity: add `!` or use `color` prop when class fails; group-hover needs transition on Icons; see `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1, §6.3.2
   - Forbidden (raw SVG, external icon URLs)

### UI / Styling

6. **`20-ui-styling.mdc`** – UI / styling
   - **Purpose**: Colors, sizes, layout, UnoCSS, SCSS, transitions
   - **Scope**: `src/**/*.vue`
   - **Auto-apply**: No (file-match)
   - **Contents**:
     - Theme system (Theme Store, semantic variables)
     - Size system (Size Store, semantic classes)
     - Layout and responsive (Breakpoints, Layout Store)
     - UnoCSS usage (incl. transitions: hover/active/focus need transition; Icons group-hover needs transition on Icons; duration-scale pairs with transition\*; pt content needs transition too)
     - SCSS usage limits

7. **`22-layouts.mdc`** – Layouts
   - **Purpose**: LayoutMode, AdminLayoutMode, layout shell extension
   - **Scope**: `src/layouts/**/*.{ts,vue}`
   - **Auto-apply**: No (file-match)
   - **Contents**:
     - LayoutMode enum
     - AdminLayoutMode sub-modes
     - Layout shell extension
     - Layout-related stores

### Specific Scenarios

8. **`24-tsx-rendering.mdc`** – TSX rendering
   - **Purpose**: Use TSX for programmatic render, forbid `h()`
   - **Scope**: `src/**/*.{vue,tsx}`
   - **Auto-apply**: Yes (`alwaysApply: true`)
   - **Contents**: When to use TSX (render fns, dynamic slots, table cell renderers)

8a. **`27-ai-tsx-decision.mdc`** – AI TSX decision

- **Purpose**: lang switch, VNode vs template string, trigger words and causal rules
- **Scope**: `src/**/*.{vue,tsx}`
- **Auto-apply**: Yes (`alwaysApply: true`)
- **Contents**: Use `lang="tsx"` when using JSX; forbid template string `return \`<tag>...\``; TSX usage (Vue SFC vs standalone .tsx); forbidden patterns (no `h()`, no `createElement`)

9. **`25-html-tag-semantics.mdc`** – HTML tag semantics and formatting
   - **Purpose**: Correct use of code/span/div/pre, avoid formatter conflicts and syntax errors
   - **Scope**: `src/**/*.{vue,tsx}`
   - **Auto-apply**: Yes (`alwaysApply: true`)
   - **Contents**:
     - `<code>` only in `<pre><code>` code blocks
     - `<span>` for inline styling, especially inside `<p>`
     - `<div>` for block containers and clickable blocks (not inside `<p>`)
     - HTML nesting (no block elements inside `<p>`)
     - Prettier/ESLint conflict handling

10. **`08-auth-login-flow.mdc`** – Auth / login flow

- **Purpose**: Login/logout, token, 401, route guards
- **Scope**: `src/**/*.{ts,vue}`
- **Auto-apply**: No (file-match)
- **Details**: `docs/ai-specs/AUTH_AND_LOGIN_FLOW.md`
- **Contents**: Login flow, token handling, 401 handling, route guards, dynamic routes

11. **`26-repair-list-workflow.mdc`** – Repair list workflow

- **Purpose**: repair_list.txt creation, writing, progress tracking, clearing

12. **`28-industrial-ux-standards.mdc`** – Industrial UX standards

- **Purpose**: Layout/Color/Empty/Loading/Feedback checklist for industrial pages
- **Scope**: `src/views/**/*.vue`, `src/components/**/*.vue`
- **Contents**: 5-item pre-output checklist, references `docs/ai-specs/INDUSTRIAL_UX_DESIGN_SYSTEM.md`
- **Scope**: Project root, check/fix tasks
- **Auto-apply**: Yes (`alwaysApply: true`)
- **Contents**:
  - Ask mode: ask before writing; Agent mode: auto-write
  - Plain txt format, ✅ for progress
  - Clear content when all resolved
  - In .gitignore, do not commit

## Usage Guide

### Auto-Applied Rules

Rules with `alwaysApply: true` are applied automatically; no manual reference needed:

- `00-core-architecture.mdc`
- `12-api-layer.mdc`
- `15-utils-and-hooks-first.mdc`
- `18-components-and-icons.mdc`
- `24-tsx-rendering.mdc`
- `27-ai-tsx-decision.mdc`
- `25-html-tag-semantics.mdc`
- `26-repair-list-workflow.mdc`

### File Matching

Rules with `globs` are matched by the edited file:

- Edit `src/hooks/**/*.ts` → `10-logic-layer.mdc` applied
- Edit `src/layouts/**/*.{ts,vue}` → `22-layouts.mdc` applied
- Edit `src/**/*.vue` → `20-ui-styling.mdc` applied

### Manual Reference

For complex tasks, explicitly reference rules:

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md first
Follow @.cursor/rules/00-core-architecture.mdc
Also follow task-related rules:
- @.cursor/rules/10-logic-layer.mdc (logic)
- @.cursor/rules/12-api-layer.mdc (new API)
- @.cursor/rules/15-utils-and-hooks-first.mdc (tools first)
- @.cursor/rules/18-components-and-icons.mdc (components/icons)
- @.cursor/rules/20-ui-styling.mdc (UI/styling)
- @.cursor/rules/22-layouts.mdc (layout shell/Admin sub-modes)
- @.cursor/rules/24-tsx-rendering.mdc (TSX for programmatic render, forbid h())
- @.cursor/rules/25-html-tag-semantics.mdc (HTML tag semantics and formatting)
```

### Rule Metadata

Each rule file has metadata:

- **`description`**: Rule description (for AI)
- **`globs`**: File patterns (for auto-apply)
- **`alwaysApply`**: Always apply (true/false)

## Related Docs

- **Project protocol**: `docs/ai-specs/PROJECT_PROTOCOL.md` (required)
- **Cursor skills**: `.cursor/skills/`
- **Antigravity rules**: `.agent/rules/` (see correspondence)
- **Details**: docs under `docs/`

## Rule Correspondence with Antigravity

This repository uses `.cursor/rules/` as the SSOT; `.agent/rules/` mirrors it with the same basenames (extension differs: `.mdc` vs `.md`).

- `00-core-architecture.mdc` ↔ `00-core-architecture.md`
- `01-naming-conventions.mdc` ↔ `01-naming-conventions.md`
- `02-boilerplate-immunity.mdc` ↔ `02-boilerplate-immunity.md`
- `03-auto-import-shield.mdc` ↔ `03-auto-import-shield.md`
- `04-strict-vue-typescript.mdc` ↔ `04-strict-vue-typescript.md`
- `05-architecture-decoupling.mdc` ↔ `05-architecture-decoupling.md`
- `06-data-immutability.mdc` ↔ `06-data-immutability.md`
- `07-compilation-boundaries.mdc` ↔ `07-compilation-boundaries.md`
- `08-auth-login-flow.mdc` ↔ `08-auth-login-flow.md`
- `09-enterprise-guardrails.mdc` ↔ `09-enterprise-guardrails.md`
- `10-logic-layer.mdc` ↔ `10-logic-layer.md`
- `12-api-layer.mdc` ↔ `12-api-layer.md`
- `15-utils-and-hooks-first.mdc` ↔ `15-utils-and-hooks-first.md`
- `18-components-and-icons.mdc` ↔ `18-components-and-icons.md`
- `20-ui-styling.mdc` ↔ `20-ui-styling.md`
- `21-color-system.mdc` ↔ `21-color-system.md`
- `22-layouts.mdc` ↔ `22-layouts.md`
- `24-tsx-rendering.mdc` ↔ `24-tsx-rendering.md`
- `25-html-tag-semantics.mdc` ↔ `25-html-tag-semantics.md`
- `26-repair-list-workflow.mdc` ↔ `26-repair-list-workflow.md`
- `27-ai-tsx-decision.mdc` ↔ `27-ai-tsx-decision.md`
- `28-industrial-ux-standards.mdc` ↔ `28-industrial-ux-standards.md`
- `29-focus-outline-styling.mdc` ↔ `29-focus-outline-styling.md`
- `30-drift-check.mdc` ↔ `30-drift-check.md`
- `31-temp-artifacts-lifecycle.mdc` ↔ `31-temp-artifacts-lifecycle.md`
- `35-schema-driven-development.mdc` ↔ `35-schema-driven-development.md`
- `36-pro-form-integration.mdc` ↔ `36-pro-form-integration.md`
- `40-echarts-visualization.mdc` ↔ `40-echarts-visualization.md`
- `50-user-centric-engineering.mdc` ↔ `50-user-centric-engineering.md`
- `101-premium-ui.mdc` ↔ `101-premium-ui.md`
- `102-primevue-unstyled.mdc` ↔ `102-primevue-unstyled.md`
- `103-architecture-docs-enforcement.mdc` ↔ `103-architecture-docs-enforcement.md`
- `104-anti-flicker-ring-less.mdc` ↔ `104-anti-flicker-ring-less.md`
