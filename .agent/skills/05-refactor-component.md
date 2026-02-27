---
description: Refactor component: Extract Logic -> Hooks & Style Audit
globs: **/*.vue, **/*.ts
---

# Refactor Component Skill

## 1. Goal

Clean up components by extracting logic and standardizing styles.

## 2. Steps

### Step 1: Logic Extraction

- Identify complex logic in `<script setup>`.
- Create a new hook in `src/hooks/modules/use<Feature>.ts`.
- Move specific logic (state, methods, computed) into the hook.
- Import and use the hook in the component.
- **Type safety**: Ensure all extracted variables have explicit type annotations:
  - ❌ `const loading = ref(false)` → ✅ `const loading = ref<boolean>(false)`
  - ❌ `const data = ref(null)` → ✅ `const data = ref<DataType | null>(null)`
  - ❌ `const items = []` → ✅ `const items: Item[] = []`

### Step 2: Tool Replacement

- Scan for inline `axios`/`fetch` → Replace with `useHttpRequest`.
- Scan for inline date formatting → Replace with `useDateUtils`.
- Scan for inline element resize logic → Replace with `useAppElementSize`.

### Step 3: Verify

- Ensure behavior is unchanged (regression test).
- Check `browser` console for errors.
