---
description: UI 架构规范：UnoCSS、PrimeVue 与组件系统
globs: **/*.vue, **/*.tsx, **/*.ts
alwaysApply: true
---

# UI Architecture & Styling Rules

## 1. UnoCSS (The Only Way to Style)

- **Semantic Classes**: Prefer semantic classes over raw utilities.
  - ✅ `text-primary`, `bg-card`, `border-border`
  - ❌ `text-[#333]`, `bg-white`, `border-gray-200`
- **Size Scale**: Use the project's size scale (`xs` to `5xl`).
  - ✅ `p-md`, `m-lg`, `gap-sm`, `rounded-md`, `fs-xl`
  - ❌ `p-[10px]`, `m-20px`, `gap-4` (Tailwind style numbers are generally FORBIDDEN unless matched to scale)
- **Layout Variables**: Use strict layout keys from `uno.config.ts`.
  - ✅ `w-sidebarWidth`, `h-headerHeight`
- **Shortcuts**: Use shortcuts defined in `uno.config.ts` for common patterns.
  - `row-center`, `column-center`, `interactive-hover`

- **Global Visual Hardcoding Ban for Agents**:
  - When generating or editing UI code, you MUST NOT introduce any hardcoded visual values (px/rem/hex for spacing, size, font-size, colors, radius, shadows, or media queries) in templates, TSX, CSS/SCSS, or PrimeVue `pt` configs.
  - All visual decisions MUST be expressed via the Theme/Size/Layout systems + UnoCSS semantic classes and CSS variables (e.g. `px-padding-lg`, `m-margin-md`, `gap-xl`, `fs-sm`, `w-sidebarWidth`, `h-headerHeight`, `text-foreground`, `bg-surface-ground`, `rounded-scale`, `md:...`).
  - UnoCSS class names you generate MUST be valid according to `uno.config.ts` patterns and shortcuts (semantic size/layout/color patterns, fs-\*, layout variables, defined shortcuts, etc.).
  - Tailwind-style numeric utilities or arbitrary value classes that are not explicitly mapped in `uno.config.ts` (e.g. `p-4`, `mt-6`, `w-[240px]`) are considered invalid and are FORBIDDEN.

## 2. PrimeVue Integration

- **Unstyled Mode**: We use PrimeVue in unstyled mode or with PassThrough.
- **Global Components**: `AppPrimeVueGlobals.vue` handles global Toast/Dialog/Confirm.
- **Custom Wrappers**:
  - **Dialog**: MUST use `useDialog()` hook instead of `<Dialog>` component directly for dynamic content.
  - **Icons**: MUST use `<Icons name="..." />` component.

## 3. Component Structure (Vue 3 SBA)

- **Script**: `<script setup lang="ts">` (Composition API only).
- **Template**: Keep it clean. Move complex logic to `computed` or `hooks`.
- **Style**:
  - Avoid `<style>` tags. Use UnoCSS classes.
  - If `<style>` is necessary (complex animations), use `<style lang="scss" scoped>`.
  - Use `:deep()` for overriding child component styles.

## 4. Icon Strategy

- **Component**: Always use `@/components/Icons/Icons.vue`.
- **Naming**:
  - Lucide (Preferred): `i-lucide-home`
  - MDI: `i-mdi-account`
  - Custom: `i-custom-xxx`
- **Safelist**: Ensure properly named icons so `uno-icons.ts` can detect them.
