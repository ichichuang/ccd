---
description: Antigravity Skills index
globs: **/*
---

# Antigravity Skills (skill index)

This directory contains standard operating procedures (SOP) for Antigravity Agent. Each skill file defines detailed steps and best practices for specific tasks.

## Skills List

### UI Components and Pages

1. **`01-build-ui-component.md`** – Build UI component
   - **Purpose**: Create reusable Vue 3 components
   - **Flow**: Scaffold -> Style -> Verify
   - **Scope**: `src/components/**/*.vue`
   - **Key steps**: Component structure, Props/Emits, UnoCSS styling, browser verification

2. **`02-build-page-view.md`** – Build page view
   - **Purpose**: Assemble full page views
   - **Flow**: Layout -> Components -> Logic Integration
   - **Scope**: `src/views/**/*.vue`
   - **Key steps**: Layout selection, component reuse, logic hook integration, type safety

### Bug Fixing and Refactoring

3. **`03-fix-ui-issue.md`** – Fix UI issue
   - **Purpose**: Debug and fix UI bugs
   - **Flow**: Reproduce -> Locate -> Fix -> Verify
   - **Scope**: `**/*.vue, **/*.ts`
   - **Key steps**: Reproduce, root cause analysis, apply fix, browser verification

4. **`05-refactor-component.md`** – Refactor component
   - **Purpose**: Extract logic and standardize styles
   - **Flow**: Extract Logic -> Hooks & Style Audit
   - **Scope**: `**/*.vue, **/*.ts`
   - **Key steps**: Extract logic to hooks, UnoCSS style audit, type safety

5. **`06-style-audit.md`** – Style audit
   - **Purpose**: Fix hardcoded styles, enforce UnoCSS compliance
   - **Flow**: Find Hardcoded -> Replace with UnoCSS
   - **Scope**: `**/*.vue, **/*.css, **/*.scss`
   - **Key steps**: Scan hardcoded values, map to semantic classes, replace and verify

### Full Feature Development

6. **`04-full-feature.md`** – Full feature development
   - **Purpose**: End-to-end feature implementation
   - **Flow**: API Definition -> Business Hook -> UI Integration
   - **Scope**: `**/*`
   - **Key steps**: API layer, business hook, UI integration, type safety and verification

### Form Component

7. **`07-SchemaForm.md`** – SchemaForm
   - **Purpose**: Multi-field forms, validation, steps, groups, dynamic fields
   - **Flow**: Read doc -> Define Schema -> useSchemaForm -> UI integration
   - **Scope**: `src/views/**/*.vue, src/components/**/*.vue`
   - **Prerequisites**: Must read `docs/ai-specs/SCHEMA_FORM_COMPONENT.md`
   - **Key steps**: Schema definition, useSchemaForm, dynamic fields, validation and submit

### Feedback and Notifications

8. **`08-toast-message-feedback.md`** – Toast & Message feedback
   - **Purpose**: Usage rules and implementation for Toast/Message
   - **Flow**: Choose scenario -> Select $message or $toast -> Call -> Verify
   - **Scope**: `src/**/*.{ts,vue}`
   - **Prerequisites**: Read `docs/ai-specs/TOAST_AND_MESSAGE.md`
   - **Key steps**: Component use `useToast()`; non-component use `window.$toast` / `window.$message`; $message centered; $toast positional; implementation notes

### Chart Component

9. **`09-use-echarts.md`** – UseEcharts
   - **Purpose**: Chart display and interaction, auto theme integration
   - **Flow**: Read doc -> Use UseEcharts -> Configure option -> Handle events
   - **Scope**: `src/views/**/*.vue, src/components/**/*.vue`
   - **Prerequisites**: Must read `docs/ai-specs/ECHARTS_THEME.md`
   - **Key steps**: `<UseEcharts>`, `option` prop, `on*` events, group/connectConfig, ref + ChartInstance
   - **Forbidden**: Manual ECharts, hardcoded colors, manual ThemeStore listeners

### Icons Color Customization

10. **`10-icons-color-styling.md`** – Icons color customization and class specificity

- **Purpose**: Fix when Icons color/opacity set via class does not apply

11. **`12-generate-industrial-page.md`** – Generate industrial page

- **Purpose**: Industrial monitoring/dashboard page SOP
- **Flow**: Gather context → Flex skeleton → Content areas → Polish → Self-check
- **Scope**: `src/views/**/*.vue`
- **Prerequisites**: Read `docs/ai-specs/INDUSTRIAL_UX_DESIGN_SYSTEM.md`
- **Flow**: Identify scenario -> Choose approach (color prop or class + !) -> Verify
- **Scope**: `**/*.vue, **/*.tsx`
- **Prerequisites**: `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1
- **Key steps**: Decision table (color prop first; add `!` when using class)
- **Reference**: `src/layouts/components/admin/AdminHeader.vue`

## Usage Guide

### Choosing the Right Skill

- **Create new component** → `01-build-ui-component.md`
- **Create new page** → `02-build-page-view.md`
- **Fix UI bug** → `03-fix-ui-issue.md`
- **Full feature development** → `04-full-feature.md`
- **Refactor component** → `05-refactor-component.md`
- **Fix style issues** → `06-style-audit.md`
- **Form-related task** → `07-SchemaForm.md`
- **Feedback notifications** → `08-toast-message-feedback.md`
- **Chart-related task** → `09-use-echarts.md`
- **Icons color not applying** → `10-icons-color-styling.md`
- **Industrial / dashboard page** → `12-generate-industrial-page.md`

### Skill Execution Flow

1. **Read related rules** before running a skill
2. **Follow skill steps** as defined in the file
3. **Verify result** with browser tool
4. **Checklist** – complete items in the skill file

### Prerequisite Docs

- **SchemaForm**: Must read `docs/ai-specs/SCHEMA_FORM_COMPONENT.md`
- **Toast/Message**: Must read `docs/ai-specs/TOAST_AND_MESSAGE.md`
- **Layout**: Must read `docs/ai-specs/ADAPTIVE_LAYOUT.md`
- **Auth**: Must read `docs/ai-specs/AUTH_AND_LOGIN_FLOW.md`
- **Icons color**: `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1

## Related Resources

- **Rules**: `.agent/rules/`
- **Project protocol**: `docs/ai-specs/PROJECT_PROTOCOL.md`
- **Golden samples**: `docs/ai-specs/GOLDEN_SAMPLES/`
- **Cursor skills**: `.cursor/skills/` (for mapping)

## Correspondence with Cursor Skills

- `01-build-ui-component.md` ↔ Cursor `06-assemble-ui-handoff.md`
- `02-build-page-view.md` ↔ Cursor `06-assemble-ui-handoff.md`
- `03-fix-ui-issue.md` ↔ Cursor `03-fix-logic-only.md` (Cursor focuses on logic)
- `04-full-feature.md` ↔ Cursor `01-generate-api-module.md` + `02-generate-feature-composable.md` + `06-assemble-ui-handoff.md`
- `05-refactor-component.md` ↔ Cursor `04-refactor-composable.md`
- `06-style-audit.md` ↔ Cursor rules auto-check
- `07-SchemaForm.md` ↔ Cursor `08-SchemaForm.md`
- `08-toast-message-feedback.md` ↔ Cursor `07-toast-message-feedback.md`
- `12-generate-industrial-page.md` ↔ Cursor: no direct counterpart (industrial scenario; treat as industrial variant of 02-build-page-view)
