# Skill 06: Assemble UI Handoff (Hand off to Antigravity for UI)

## Goal

After Cursor has completed API/Hook logic, generate a "copy-paste ready for Antigravity" UI prompt so Antigravity only works on template/class/pt (no business logic changes) and strictly follows the design system.

## Inputs

- Logic file path (e.g. `src/hooks/modules/useUserList.ts`)
- Target component path (e.g. `src/views/user/UserList.vue` or `src/components/UserList.vue`)
- Components to use (e.g. DataTable / Dialog / Form)

## Pre-check (mandatory)

- `@docs/ai-specs/PROJECT_PROTOCOL.md`
- `@docs/ai-specs/ANTIGRAVITY_UI_RULES.md`
- `@docs/ai-specs/GOLDEN_SAMPLES/UIComponent.vue`
- `@.cursor/rules/20-ui-styling.mdc` (UnoCSS/theme/size/layout semantic classes)
- If **data tables** (list, pagination, sort, export): read `@docs/ai-specs/DataTable_COMPONENT.md`

## Output (required)

- A complete Antigravity prompt (output prompt text only, no code)

## Prompt Template (copy & use)

> Copy the block below to Antigravity.

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md and @docs/ai-specs/ANTIGRAVITY_UI_RULES.md
Match style of @docs/ai-specs/GOLDEN_SAMPLES/UIComponent.vue

Task: Assemble UI based on existing logic file (only change template/class/pt, not business logic)

Input logic:
- @<logic-file>

Output component:
- <component-path>

Requirements (CRITICAL):
1) Only change <template> and class / PrimeVue pt; keep all v-model, @click, methods, state names unchanged
2) MUST reuse project components first: Icons/CScrollbar/UseEcharts (as needed)
3) UnoCSS only: No hardcoded px/hex; use semantic classes for color/size/breakpoint/layout (uno.config.ts)
4) Mobile First: Must work at 375px, then md:/lg: for larger
5) Tables: Interactive data tables MUST use DataTable (see docs/ai-specs/DataTable_COMPONENT.md); other interactive components use PrimeVue (Dialog/Input/Button, etc.), consistent class/pt style
6) Non-component notifications: For interceptors, global error handler, use window.$toast / window.$message (see docs/ai-specs/TOAST_AND_MESSAGE.md); $message is centered, no close button; $toast is positionable, has close button
7) Layout/sidebar/responsive: Follow docs/ai-specs/ADAPTIVE_LAYOUT.md; do not change mode/sidebarCollapse directly; use effective visibility (showXxxEffective)
8) Vue template syntax: No TypeScript syntax in <template> (no `as`, type annotations `:`, generics `<>`); define types in <script setup>, use typed variables in template
```
