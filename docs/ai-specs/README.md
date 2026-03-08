# Project Docs Index (AI)

> **Target reader: AI**. This index is for AI to look up specs and component docs during code generation. For human developers, see [architecture/](../architecture/README.md) for project architecture.

---

## 📂 1. Architecture docs (for developers)

For human developers and GitHub visitors to understand project architecture:

| Doc                                                                               | Description                    |
| --------------------------------------------------------------------------------- | ------------------------------ |
| [architecture/README.md](../architecture/README.md)                               | Architecture docs index        |
| [architecture/ARCHITECTURE_OVERVIEW.md](../architecture/ARCHITECTURE_OVERVIEW.md) | Overview, layering, core flows |
| [architecture/TECH_STACK.md](../architecture/TECH_STACK.md)                       | Tech stack details             |
| [architecture/DIRECTORY_STRUCTURE.md](../architecture/DIRECTORY_STRUCTURE.md)     | Directory structure            |

---

## 🤖 2. Specs & component docs (for AI)

**Single source of truth (SSOT)** for AI code generation. Read the relevant docs by task type before generating code.

### 2.1 Core specs (AI must read)

0. **UI State Contract Package** (state authority)
   - **`UI_STATE_CONTRACT.md`** – UIDesignState definition, Primary vs Derived, forbidden combinations, validation rules
   - **`INTENT_PROFILES.md`** – Lookup core: intent → derived state
   - **`ARCHETYPE_SPEC.md`** – Layout archetypes (A1–A5), scroll model, component map, FORBIDDEN
   - **When to use**: Before generating or changing page UI; AI must output UIDesignState before writing code
   - **Reference**: `@./UI_STATE_CONTRACT.md`

1. **`PROJECT_PROTOCOL.md`** – Project protocol
   - **Scope**: Tech stack, directory norms, coding norms, router, auth, design system
   - **When to use**: Must read before any code generation task
   - **Reference**: `@./PROJECT_PROTOCOL.md`

1b. **`ENTERPRISE_GUARDRAILS.md`** – Enterprise guardrails (CRITICAL; wins on conflict)

- **Scope**: Boundaries and dependencies, type dilution, data immutability, component purity, design system, single responsibility, forbidden patterns
- **When to use**: All `*.ts` / `*.tsx` / `*.vue` generation and review; overrides other rules on conflict
- **Reference**: `@./ENTERPRISE_GUARDRAILS.md`

1a. **`AI_CODING_PROTOCOL.md`** – AI coding protocol

- **Scope**: Pre-generation decision flow, TSX/lang switch, VNode vs template strings, post-generation checklist
- **When to use**: Required when using DataTable column body/renderer, Dialog contentRenderer, SchemaForm custom render, or any programmatic rendering
- **Reference**: `@./AI_CODING_PROTOCOL.md`

2. **`BUILD_SYSTEM.md`** – Build system and auto-imports
   - **Scope**: Vite config, AutoImport, type generation, component scan scope
   - **Reference**: `@./BUILD_SYSTEM.md`

3. **`TYPESCRIPT_AND_LINTING.md`** – TypeScript and linting
   - **Scope**: Strict mode, explicit types, no `any`, ESLint, Vue template constraints
   - **Reference**: `@./TYPESCRIPT_AND_LINTING.md`

4. **`VUE_TEMPLATE_ANTIPATTERNS.md`** – Vue template antipatterns
   - **Scope**: Multi-statement inline handlers, TS in templates, readonly array `includes`, etc., and correct patterns
   - **When to use**: When you see `Error parsing JavaScript expression`, build failure, or TS type errors
   - **Reference**: `@./VUE_TEMPLATE_ANTIPATTERNS.md`

### 2.2 Design system

- **Color semantic authority**: `src/constants/theme/colorUsage.ts` (SSOT); see `.cursor/rules/21-color-authority.mdc`
- **Premium UI & token enforcement**: `.cursor/rules/101-premium-ui.mdc`, `102-primevue-unstyled.mdc`, `103-architecture-docs-enforcement.mdc` (same content in `.agent/rules/*.md`). Enforce design tokens (`fs-*`, `rounded-scale-md`, `duration-scale-md`), shortcuts (`behavior-hover-transition`, `surface-elevated`, `surface-item`, `interactive-focus-ring`), and SSOT (`uno.config.ts`, `src/constants/sizeScale.ts`).

5. **`PRIMEVUE_V4_API.md`** – PrimeVue v4 API (no v3 deprecated names; see https://primevue.org/)
6. **`PRIMEVUE_THEME.md`** – PrimeVue theme
7. **`UNOCSS_AND_ICONS.md`** – UnoCSS and icons
8. **`FOCUS_AND_OUTLINE_STYLING.md`** – Focus/outline styling (minimize suppression, no long chains)
   - **When to use**: Menu items, breadcrumbs, focusable buttons
   - **Reference**: `@./FOCUS_AND_OUTLINE_STYLING.md`
9. **`ECHARTS_THEME.md`** – ECharts and theme
10. **`INDUSTRIAL_UX_DESIGN_SYSTEM.md`** – Industrial UX design system
    - **Scope**: Desktop layout skeleton, industrial state colors, fail-safe design, Toast duration, connection awareness
    - **When to use**: Industrial monitoring/dashboard pages
    - **Reference**: `@./INDUSTRIAL_UX_DESIGN_SYSTEM.md`

11. **`EMPTY_STATE_AND_ROBUSTNESS.md`** – Empty state & UI robustness
    - **Scope**: Industrial empty state pattern, EmptyState component, no double blank, i18n checks
    - **When to use**: Tables/charts/dashboards with no data, connection lost, empty-state design
    - **Reference**: `@./EMPTY_STATE_AND_ROBUSTNESS.md`

### 2.3 Component docs

9. **`SCHEMA_FORM_COMPONENT.md`** – SchemaForm
10. **`DataTable_COMPONENT.md`** – DataTable
11. **`DIALOG_COMPONENT.md`** – PrimeDialog
12. **`TOAST_AND_MESSAGE.md`** – Toast & Message (§6 style overrides: center, close button, padding)

### 2.4 Layout and routing

14. **`ADAPTIVE_LAYOUT.md`** – Adaptive layout
15. **`AUTH_AND_LOGIN_FLOW.md`** – Auth and login

### 2.5 Workflow and environment

16. **`AI_COLLABORATION.md`** (under `docs/`) – Cursor + Antigravity workflow, AI skills, common prompts
17. **`ANTIGRAVITY_UI_RULES.md`** – Antigravity UI rules (long form; `.agent/rules/` is authoritative on conflict)
18. **`ENV_AND_RUNTIME.md`** – Env vars and runtime

---

## 📖 AI usage guide

### Must-read

Before any code generation: `@./PROJECT_PROTOCOL.md`

**Architecture (recommended first or on demand):**

- `@docs/architecture/ARCHITECTURE_OVERVIEW.md` – Layering, data flow, design principles, directory roles
- `@docs/architecture/DIRECTORY_STRUCTURE.md` – Per-directory, per-file roles

> Architecture docs help AI understand Views → Components → Hooks → API/Store/Utils and avoid code that drifts from the architecture.

### Doc by scenario

| Task type                                               | Reference                                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Guardrails / forbidden (wins on conflict)               | `@./ENTERPRISE_GUARDRAILS.md`                                                              |
| Architecture / directory structure                      | `@docs/architecture/ARCHITECTURE_OVERVIEW.md`, `@docs/architecture/DIRECTORY_STRUCTURE.md` |
| Cursor + Antigravity / common prompts                   | `@docs/AI_COLLABORATION.md`                                                                |
| Forms (multi-field, validation, steps, groups, dynamic) | `@docs/SCHEMA_FORM_COMPONENT.md`                                                           |
| Data tables (list, pagination, sort, filter, export)    | `@docs/DataTable_COMPONENT.md`, `@docs/AI_CODING_PROTOCOL.md` (for column body/renderer)   |
| Layout / sidebar / responsive                           | `@./ADAPTIVE_LAYOUT.md`                                                                    |
| Auth / login                                            | `@./AUTH_AND_LOGIN_FLOW.md`                                                                |
| Feedback (non-component)                                | `@./TOAST_AND_MESSAGE.md`                                                                  |
| Dialogs                                                 | `@docs/DIALOG_COMPONENT.md`                                                                |
| Styling                                                 | `@./UNOCSS_AND_ICONS.md`, `@./PRIMEVUE_THEME.md`                                           |
| PrimeVue (Select, DatePicker, Drawer, etc.)             | `@./PRIMEVUE_V4_API.md` (no v3 names; see primevue.org)                                    |
| Charts                                                  | `@./ECHARTS_THEME.md`                                                                      |
| Types / annotations                                     | `@./TYPESCRIPT_AND_LINTING.md`                                                             |
| Vue template parse error / build / TS errors            | `@./VUE_TEMPLATE_ANTIPATTERNS.md`                                                          |
| Build / auto-import                                     | `@./BUILD_SYSTEM.md`                                                                       |
| Env config                                              | `@./ENV_AND_RUNTIME.md`                                                                    |
| Deployment / Nginx / gzip                               | `@../DEPLOYMENT.md`                                                                        |
| Context menu                                            | `@./PROJECT_PROTOCOL.md` §8.5.5                                                            |
| Network state / large upload                            | `@./PROJECT_PROTOCOL.md` §8.4.6                                                            |
| Industrial / dashboard pages                            | `@./INDUSTRIAL_UX_DESIGN_SYSTEM.md`                                                        |
| Empty state / robustness                                | `@./EMPTY_STATE_AND_ROBUSTNESS.md`                                                         |

### How to reference

Use `@` in prompts:

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md first
For forms: @docs/ai-specs/SCHEMA_FORM_COMPONENT.md
For layout: @docs/ai-specs/ADAPTIVE_LAYOUT.md
```

### Doc principles

- Docs are the **single source of truth (SSOT)**.
- Code generation must follow them strictly.
- Do not hardcode logic that conflicts with the docs.

---

## 🔗 Related config

- **Cursor rules**: `.cursor/rules/` (enforced)
- **Cursor skills**: `.cursor/skills/` (procedures)
- **Antigravity rules**: `.agent/rules/` (authoritative; AI must follow)
- **Antigravity skills**: `.agent/skills/`
- **`ANTIGRAVITY_UI_RULES.md`**: Long-form Antigravity UI; conflicts resolved by `.agent/rules/`
- **Golden samples**: `docs/ai-specs/GOLDEN_SAMPLES/` – useFeatureLogic, UIComponent, ApiModule, StoreExample; **DataTable column body** in `DataTableBodyColumn.vue`
- **Example views**: `src/views/example/` – DataTable, SchemaForm, UseEcharts, PrimeDialog examples; prefer these when generating similar features
- **System configuration**: `src/views/system-configuration/` – theme, size, breakpoints, layout/device, scrollbar, UnoCSS; shows infra; `example` shows business component usage

---

## 🎯 AI quick lookup

| Need                                | Doc                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| Guardrails / forbidden              | `ENTERPRISE_GUARDRAILS.md` (wins on conflict)                                                    |
| Architecture                        | `architecture/ARCHITECTURE_OVERVIEW.md`, `DIRECTORY_STRUCTURE.md`                                |
| system-configuration vs example     | system-configuration = infra demo; example = business component usage                            |
| Which components                    | `PROJECT_PROTOCOL.md` §1.1                                                                       |
| How to style                        | `UNOCSS_AND_ICONS.md`                                                                            |
| How to build forms                  | `SCHEMA_FORM_COMPONENT.md`                                                                       |
| How to build tables                 | `DataTable_COMPONENT.md`                                                                         |
| Schema-first                        | `.cursor/rules/35-schema-driven-development.mdc`, `.agent/rules/35-schema-driven-development.md` |
| How to type                         | `TYPESCRIPT_AND_LINTING.md`                                                                      |
| Template parse error / antipatterns | `VUE_TEMPLATE_ANTIPATTERNS.md`                                                                   |
| How to do routing                   | `PROJECT_PROTOCOL.md` §10                                                                        |
| How to do auth                      | `AUTH_AND_LOGIN_FLOW.md`                                                                         |
| How to do layout                    | `ADAPTIVE_LAYOUT.md`                                                                             |
| How to do feedback                  | `TOAST_AND_MESSAGE.md`                                                                           |
| How to do dialogs                   | `DIALOG_COMPONENT.md`                                                                            |
| How to do charts                    | `ECHARTS_THEME.md`                                                                               |
| Context menu                        | `PROJECT_PROTOCOL.md` §8.5.5                                                                     |
| Network / large upload              | `PROJECT_PROTOCOL.md` §8.4.6                                                                     |
| Deployment / Nginx / gzip           | `DEPLOYMENT.md`                                                                                  |
