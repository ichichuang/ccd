---
description: Antigravity primary directive and core principles
globs: **/*
alwaysApply: true
---

# Antigravity Primary Directive

You are an autonomous Agent capable of full-stack changes. Your main operational constraints are:

## 1. Single Source of Truth (SSOT) Compliance

- **Docs are law**: You MUST follow `docs/ai-specs/PROJECT_PROTOCOL.md` and `docs/ai-specs/ANTIGRAVITY_UI_RULES.md` first.
- **AI coding protocol**: For programmatic rendering (DataTable column body/renderer, Dialog contentRenderer, etc.), read `docs/ai-specs/AI_CODING_PROTOCOL.md`, follow its decision flow and checklist; ensure `lang="tsx"` when using JSX; FORBIDDEN template strings like `return \`<tag>...\``.
- **Config-driven**: `uno.config.ts`, `src/constants/`, and `src/types/` are the SSOT for style and logic constraints. Do NOT invent new colors, sizes, or types in code.
- **Golden samples**: When creating files, strictly mimic the structure in `docs/ai-specs/GOLDEN_SAMPLES/`.
- **Build and auto-import**: Full list of auto-imported libs (vue, vue-router, pinia, @vueuse/core, @/locales t/$t), scanned dirs (stores, hooks, api, utils, constants/\*, CScrollbar), and component scope (only src/components; exclude src/layouts; PrimeVueResolver) are in **`docs/ai-specs/BUILD_SYSTEM.md`**. When unsure what can be used without `import`, consult that doc. Do NOT manually import `ref`/`computed`/`watch` from `'vue'`; remove unused imports; prefix intentionally unused vars with **`_`**.

## 2. "Tools & Hooks First" Strategy (strict)

Before writing any new logic or style code:

1. **Check existing tools**: MUST search `src/utils/` and `src/hooks/` for existing solutions.
2. **Reuse, do NOT reinvent**:
   - Need HTTP? Use `useHttpRequest` / `alovaInstance`. **Never** use `fetch`/`axios` directly.
   - Need formatting? Use `useDateUtils` / `strings.ts`.
   - Need storage? Use `safeStorage`.
   - Need icons? Use `<Icons name="..." />` matching `uno-icons` safelist.

## 3. "No Hardcoding" Strategy

- **Styles**: **Never** write hardcoded px/rem/hex colors in `<style>` or `:style`.
  - ✅ Use UnoCSS utility classes (e.g. `p-md`, `text-primary`, `bg-card`).
  - ✅ If dynamic, use CSS variables (e.g. `style="--custom-height: 100px"`).
- **Text**: Use i18n keys if available (check `src/locales`), or at least centralized constants.

## 4. Verification Requirements

You are an **Agent**, not just a code generator. You MUST verify your work.

- **Build check**: After creating/modifying files, run build or type check when uncertain.
- **Browser verification**: Use the `browser` tool:
  1. Open the page being modified.
  2. Verify no console errors (red text).
  3. Verify visual layout matches expectation (e.g. "button is red and centered").
  4. Verify interactivity (click button, submit form).

## 5. File and Directory Structure

- **API layer**: `src/api/<module>/<feature>.ts` (flat two levels).
- **Hooks**: `src/hooks/modules/` (business logic) or `src/hooks/layout/` (UI/infrastructure).
- **Components**: `src/components/<PascalCase>/` or `src/views/<module>/`.
- **Images**: Place in `src/assets/images` or `public/`.
