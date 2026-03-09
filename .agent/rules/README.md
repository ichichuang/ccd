# Agent Rules Index

This directory contains rule files that the Antigravity (or other agent) runner must follow. Rules define mandatory constraints and forbidden patterns.

> **Note**: Rules (`.agent/rules/*.md`) align with Cursor rules (`.cursor/rules/*.mdc`). Skills live in `.agent/skills/`.

## Rule File List

All rule files use `.md` extension. When a Cursor counterpart exists, the content is kept in sync; Cursor uses `.mdc` with the same base name.

| #   | File                                   | Cursor counterpart                      | Purpose (summary)                                                              |
| --- | -------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| 00  | `00-agent-tool-safety.md`              | `00-agent-tool-safety.mdc`              | Tool safety: no delete_file for refactors                                      |
| 00  | `00-core-architecture.md`              | `00-core-architecture.mdc`              | Core architecture (pnpm, no fetch/axios, design system, router)                |
| 00  | `00-ui-design-state.md`                | `00-ui-design-state.mdc`                | UIDesignState first; archetype from INTENT_PROFILES / ARCHETYPE_SPEC           |
| 01  | `01-naming-conventions.md`             | `01-naming-conventions.mdc`             | Naming: views kebab-case, components PascalCase, hooks useXxx, utils camelCase |
| 02  | `02-boilerplate-immunity.md`           | `02-boilerplate-immunity.mdc`           | No hardcoded brand / legacy names; generic placeholders                        |
| 03  | `03-auto-import-shield.md`             | `03-auto-import-shield.mdc`             | No redundant imports in .vue; auto-import scope and exceptions                 |
| 04  | `04-strict-vue-typescript.md`          | `04-strict-vue-typescript.mdc`          | Vue TSX strictness, no index signature with withDefaults, type narrowing       |
| 05  | `05-architecture-decoupling.md`        | `05-architecture-decoupling.mdc`        | Decoupling and boundary rules                                                  |
| 06  | `06-data-immutability.md`              | `06-data-immutability.mdc`              | Data immutability                                                              |
| 07  | `07-compilation-boundaries.md`         | `07-compilation-boundaries.mdc`         | Compilation boundaries                                                         |
| 08  | `08-auth-login-flow.md`                | `08-auth-login-flow.mdc`                | Auth / login flow; ref: AUTH_AND_LOGIN_FLOW.md                                 |
| 09  | `09-enterprise-guardrails.md`          | `09-enterprise-guardrails.mdc`          | Enterprise guardrails                                                          |
| 10  | `10-logic-layer.md`                    | `10-logic-layer.mdc`                    | Logic layer (hooks, golden sample)                                             |
| 12  | `12-api-layer.md`                      | `12-api-layer.mdc`                      | API layer: flat src/api, no default export, naming                             |
| 15  | `15-utils-and-hooks-first.md`          | `15-utils-and-hooks-first.mdc`          | Utils and hooks first; mandatory lookup map                                    |
| 18  | `18-components-and-icons.md`           | `18-components-and-icons.mdc`           | Components and Icons (CScrollbar, Icons, UseEcharts, etc.)                     |
| 20  | `20-ui-styling.md`                     | `20-ui-styling.mdc`                     | UI styling (theme, size, layout, UnoCSS, SCSS)                                 |
| 21  | `21-color-authority.md`                | `21-color-authority.mdc`                | Color authority (colorUsage.ts SSOT)                                           |
| 21  | `21-color-semantic-usage.md`           | `21-color-semantic-usage.mdc`           | Semantic color mapping                                                         |
| 22  | `22-layouts.md`                        | `22-layouts.mdc`                        | Layouts (LayoutMode, AdminLayoutMode)                                          |
| 24  | `24-tsx-rendering.md`                  | `24-tsx-rendering.mdc`                  | TSX for programmatic render; forbid h()                                        |
| 25  | `25-html-tag-semantics.md`             | `25-html-tag-semantics.mdc`             | HTML tag semantics (code/span/div/pre)                                         |
| 26  | `26-repair-list-workflow.md`           | `26-repair-list-workflow.mdc`           | repair_list.txt workflow                                                       |
| 27  | `27-ai-tsx-decision.md`                | `27-ai-tsx-decision.mdc`                | AI TSX decision (lang="tsx", VNode vs string)                                  |
| 28  | `28-industrial-ux-standards.md`        | `28-industrial-ux-standards.mdc`        | Industrial UX standards                                                        |
| 29  | `29-focus-outline-styling.md`          | `29-focus-outline-styling.mdc`          | Focus styling (focus-visible, interactive-focus-ring)                          |
| 30  | `30-drift-check.md`                    | `30-drift-check.mdc`                    | Archetype sync with page.state.ts; region scroll in ARCHETYPE_SPEC             |
| 31  | `31-temp-artifacts-lifecycle.md`       | `31-temp-artifacts-lifecycle.mdc`       | Temp artifacts lifecycle (delete before conclude)                              |
| 35  | `35-schema-driven-development.md`      | `35-schema-driven-development.mdc`      | Schema-driven (SchemaForm, DataTable)                                          |
| 40  | `40-echarts-visualization.md`          | `40-echarts-visualization.mdc`          | ECharts (UseEcharts, theme)                                                    |
| 50  | `50-user-centric-engineering.md`       | `50-user-centric-engineering.mdc`       | User-centric (8-field rule, empty CTA, errors)                                 |
| 101 | `101-premium-ui.md`                    | `101-premium-ui.mdc`                    | Premium UI + Phase 13.0 Golden Rules                                           |
| 102 | `102-primevue-unstyled.md`             | `102-primevue-unstyled.mdc`             | PrimeVue unstyled & PT                                                         |
| 103 | `103-architecture-docs-enforcement.md` | `103-architecture-docs-enforcement.mdc` | Architecture docs enforcement                                                  |
| 104 | `104-anti-flicker-ring-less.md`        | `104-anti-flicker-ring-less.mdc`        | Anti-flicker; shadow-only; no ring/border                                      |

## Sync Convention

- **Content**: Keep rule body aligned with `.cursor/rules/<same-basename>.mdc` where the file exists.
- **Extension**: Cursor uses `.mdc`, Agent uses `.md`. Frontmatter (`description`, `globs`, `alwaysApply`) is the same.

## Related

- **Project protocol**: `docs/ai-specs/PROJECT_PROTOCOL.md`
- **Cursor rules**: `.cursor/rules/` (index in `.cursor/rules/README.md`)
- **Agent skills**: `.agent/skills/`
