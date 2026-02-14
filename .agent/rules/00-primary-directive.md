---
description: Antigravity 主指令与核心原则 (Primary Directive)
globs: **/*
alwaysApply: true
---

# Antigravity Primary Directive

You are an autonomous agent capable of full-stack changes. Your primary operational constraints are defined below.

## 1. Single Source of Truth (SSOT) Adherence

- **Documentation is Law**: You MUST follow `docs/PROJECT_PROTOCOL.md` and `docs/ANTIGRAVITY_UI_RULES.md` above all else.
- **Config-Driven**: `uno.config.ts`, `src/constants/`, and `src/types/` are the SSOT for styles and logical constraints. Do NOT invent new colors, sizes, or types inline.
- **Golden Samples**: When creating files, you MUST strictly mimic the structure of `docs/GOLDEN_SAMPLES/`.
- **Build & Auto-Imports**: The full list of auto-imported libraries (vue, vue-router, pinia, @vueuse/core, @/locales t/$t), scanned dirs (stores, hooks, api, utils, constants/\*, CScrollbar), and Components scope (src/components only; src/layouts excluded; PrimeVueResolver) is in **`docs/BUILD_SYSTEM.md`**. When unsure what can be used without `import`, consult that document.

## 2. "Utility & Hooks First" Policy (Strict)

Before writing _any_ new logic or style code:

1. **Check Existing Tools**: You MUST search `src/utils/` and `src/hooks/` for existing solutions.
2. **Reuse, Don't Reinvent**:
   - Need HTTP? Use `useHttpRequest` / `alovaInstance`. **NEVER** use `fetch`/`axios` directly.
   - Need formatting? Use `useDateUtils` / `strings.ts`.
   - Need storage? Use `safeStorage`.
   - Need icons? Use `<Icons name="..." />` matching `uno-icons` safelist.

## 3. "No Hardcoding" Policy

- **Styles**: **NEVER** write hardcoded px/rem/hex colors in `<style>` or `:style`.
  - ✅ Use UnoCSS utility classes (e.g., `p-md`, `text-primary`, `bg-card`).
  - ✅ Use CSS variables if dynamic (e.g., `style="--custom-height: 100px"`).
- **Text**: Use i18n keys if available (check `src/locales`), or at least centralized constants.

## 4. Verification Mandate

You are an **Agent**, not just a code generator. You MUST verify your work.

- **Build Check**: After creating/modifying files, ALWAYS run a build check or type check if uncertain.
- **Browser Verification**: Use the `browser` tool to:
  1. Open the page being modified.
  2. Verify no console errors (red text).
  3. Verify the visual layout matches expectations (e.g., "The button is red and centered").
  4. Verify interactivity (click buttons, submit forms).

## 5. File & Directory Structure

- **API Layer**: `src/api/<module>/<feature>.ts` (Flat 2-level).
- **Hooks**: `src/hooks/modules/` (Business logic) or `src/hooks/layout/` (UI/Infra).
- **Components**: `src/components/<PascalCase>/` or `src/views/<module>/`.
- **Images**: Place in `src/assets/images` or `public/`.
