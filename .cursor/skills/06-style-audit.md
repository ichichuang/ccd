---
description: Style audit: Find Hardcoded -> Replace with UnoCSS
globs: **/*.vue, **/*.css, **/*.scss
---

# Style Audit Skill

## 1. Goal

Identify and fix non-compliant styles (hardcoded values) in the codebase.

## 2. Steps

### Step 1: Scan

- Look for `<style>` blocks with raw CSS values.
- Look for `style="..."` attributes with hardcoded values.
- Look for non-semantic utility classes (e.g. `text-[#ff0000]`).
- Look for TypeScript syntax in Vue templates (e.g. `:prop="value as any"`, `:prop="value as MyType"`, `:prop="value: Type"`).

### Step 2: Map to System

- **Colors**: Map to `primary`, `secondary`, `danger`, `success`, `info`, `warn` (and `-light`, `-hover` variants).
- **Spacing**: Map to `xs`, `sm`, `md`, `lg`, `xl`, `2xl`… (`p-md`, `gap-lg`).
- **Layout**: Map to `w-sidebarWidth`, `h-headerHeight`.

### Step 3: Replace

- Convert `style="color: red"` → `class="text-danger"`.
- Convert `padding: 20px` → `class="p-xl"` (check scale mapping).

### Step 4: Verify

- Visually verify changes in `browser`.
- Ensure no layout breakage.
