# Cursor Skills (Project architecture prompt library)

This directory stores **copy-paste ready prompt templates** so Cursor follows project architecture (`docs/` + `.cursor/rules/*.mdc`) across tasks.

> Note: Rules (`.cursor/rules/*.mdc`) define "hard constraints/forbidden items"; Skills define "how to instruct / how to break down tasks".
> When using a Skill, explicitly @ reference in the prompt: `docs/ai-specs/PROJECT_PROTOCOL.md` and relevant `.cursor/rules/*.mdc`.

## Conventions (confirmed)

- **API type naming**: Domain prefix + feature prefix, e.g. `UserLoginReq` / `UserLoginRes`
- **API file exports**: May export both:
  - `build<Domain><Feature>Method(...)` (preferred, works with useHttpRequest)
  - `request<Domain><Feature>(...)` (optional convenience, MUST use Alova/`@/utils/http` internally)
- **API file limits** (AutoImport scans `src/api/**/*`): No `export default`; no generic top-level exports (get/list/data, etc.)

## Skills List

### API and business logic

1. **`01-generate-api-module.md`** - Generate API module
   - **Purpose**: New APIs land in `src/api/<module>/<feature>.ts`
   - **Flow**: Define DTO types → Create Method Builder → Optional convenience function
   - **Scope**: `src/api/**/*.ts`
   - **Key steps**: Flat structure (no third-level dirs), define req/res types (no any), export buildXxxMethod, no default export / generic names

2. **`02-generate-feature-composable.md`** - Generate business Hook
   - **Purpose**: Business logic Hook using useHttpRequest with API
   - **Flow**: Create Hook file → Use useHttpRequest → Define state and logic
   - **Scope**: `src/hooks/modules/**/*.ts`
   - **Key steps**: Follow golden sample, use useHttpRequest for HTTP, explicit type annotations, no any (boundary exception)

3. **`03-fix-logic-only.md`** - Logic-only fixes
   - **Purpose**: Fix logic only, no UI changes (template/class unchanged)
   - **Flow**: Locate issue → Fix logic → Verify
   - **Scope**: `src/hooks/**/*.ts`, `src/utils/**/*.ts`
   - **Key steps**: Do not change template/class; only script logic; keep type safety

4. **`04-refactor-composable.md`** - Refactor to Composable
   - **Purpose**: Extract bloated logic to `src/hooks/modules/`
   - **Flow**: Identify extractable logic → Create new Hook → Refactor references
   - **Scope**: `src/**/*.{ts,vue}`
   - **Key steps**: Identify duplicate/bloated logic, create Hook, update refs, keep type safety

### UI components and icons

5. **`05-add-icon.md`** - Add icon
   - **Purpose**: Smart icon selection (Lucide → MDI → Logos → custom SVG)
   - **Flow**: Search icon → Pick best match → Use Icons component
   - **Scope**: `src/**/*.vue`
   - **Key steps**: Prefer Lucide, fallback MDI, Logos for brands, custom SVG when needed, MUST use `<Icons>`

6. **`10-icons-color-styling.md`** - Icons color styling
   - **Purpose**: Fix flow when Icons color/opacity via class does not apply
   - **Flow**: Identify scenario → Choose solution (color prop or class + !) → Verify
   - **Scope**: `**/*.vue`, `**/*.tsx`
   - **Prerequisite**: `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1
   - **Key steps**: Use decision table (color prop first; add `!` when using class)

7. **`06-assemble-ui-handoff.md`** - Assemble UI handoff
   - **Purpose**: Generate UI prompt for Antigravity (UI only)
   - **Flow**: Analyze requirements → Generate UI prompt → Include full context
   - **Scope**: UI development tasks
   - **Key steps**: Clarify UI needs, list component deps, provide context, follow component reuse rules

### Feedback and forms

8. **`07-toast-message-feedback.md`** - Toast & Message feedback
   - **Purpose**: Toast and Message usage rules
   - **Flow**: Identify scenario → Choose $message or $toast → Call
   - **Scope**: `src/**/*.{ts,vue}`
   - **Prerequisite**: Read `docs/ai-specs/TOAST_AND_MESSAGE.md`
   - **Key steps**: Use useToast() in components; window.$toast / window.$message outside; $message centered, no close; $toast positionable, has close

9. **`08-form-skill.md`** - (Deprecated)

### Chart component

10. **`09-use-echarts.md`** - UseEcharts component
    - **Purpose**: Chart display and interaction, auto theme integration
    - **Flow**: Read docs → Use UseEcharts → Configure option → Handle events
    - **Scope**: `src/views/**/*.vue`, `src/components/**/*.vue`
    - **Prerequisite**: Read `docs/ai-specs/ECHARTS_THEME.md`
    - **Key steps**: Use `<UseEcharts>`, pass option prop, event handling (on\* props), multi-chart sync (group/connectConfig), programmatic control (ref + ChartInstance)
    - **Forbidden**: Manual ECharts init, hardcoded colors, manual ThemeStore listeners

## Usage Guide

### Choose the right Skill

When receiving a task, pick the matching Skill:

- **New API** → `01-generate-api-module.md`
- **Generate business Hook** → `02-generate-feature-composable.md`
- **Fix logic bug** → `03-fix-logic-only.md`
- **Refactor logic** → `04-refactor-composable.md`
- **Add icon** → `05-add-icon.md`
- **Icons color not applied** → `10-icons-color-styling.md`
- **UI task** → `06-assemble-ui-handoff.md`
- **Feedback notification** → `07-toast-message-feedback.md`
- **Chart task** → `09-use-echarts.md`

### Skill execution flow

1. **Read related rules** before executing
2. **Follow Skill steps** exactly
3. **Validate** against the Skill's checklist

### Prerequisite docs

Some Skills require reading docs first:

- **Toast/Message**: Read `docs/ai-specs/TOAST_AND_MESSAGE.md`
- **Layout**: Read `docs/ai-specs/ADAPTIVE_LAYOUT.md`
- **Icons color**: `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1

## General usage (recommended to copy)

Add at the start of every task prompt:

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md
Follow @.cursor/rules/00-core-architecture.mdc
And relevant rules:
- @.cursor/rules/10-logic-layer.mdc (logic)
- @.cursor/rules/12-api-layer.mdc (new API)
- @.cursor/rules/15-utils-and-hooks-first.mdc (utils first)
- @.cursor/rules/18-components-and-icons.mdc (components/icons)
- @.cursor/rules/20-ui-styling.mdc (UI/styling)
- @.cursor/rules/22-layouts.mdc (layout shells/Admin mode)
- @.cursor/rules/24-tsx-rendering.mdc (TSX for programmatic render, no h())
For layout/sidebar/responsive: read @docs/ai-specs/ADAPTIVE_LAYOUT.md and follow.
```
