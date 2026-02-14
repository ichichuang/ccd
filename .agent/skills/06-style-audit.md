---
description: 样式审计：Find Hardcoded -> Replace with UnoCSS
globs: **/*.vue, **/*.css, **/*.scss
---

# Style Audit Skill

## 1. Goal

Identify and fix non-compliant styles (hardcoded values) in the codebase.

## 2. Steps

### Step 1: Scan

- Look for `<style>` blocks with raw CSS values.
- Look for `style="..."` attributes with hardcoded values.
- Look for non-semantic utility classes (e.g., `text-[#ff0000]`).

### Step 2: Map to System

- **Colors**: Map to `primary`, `secondary`, `destructive`, `success`, `info`, `warning` (and their `-light`, `-hover` variants).
- **Spacing**: Map to `xs`, `sm`, `md`, `lg`, `xl`, `2xl`... (`p-md`, `gap-lg`).
- **Layout**: Map to `w-sidebarWidth`, `h-headerHeight`.

### Step 3: Replace

- Convert `style="color: red"` -> `class="text-destructive"`.
- Convert `padding: 20px` -> `class="p-xl"` (check strict scale).

### Step 4: Verify

- Visually verify the changes in `browser`.
- Ensure no layout breakage.
