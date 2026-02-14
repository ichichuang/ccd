---
description: 重构组件：Extract Logic -> Hooks & Style Audit
globs: **/*.vue, **/*.ts
---

# Refactor Component Skill

## 1. Goal

Clean up a component by extracting logic and standardizing styles.

## 2. Steps

### Step 1: Logic Extraction

- Identify complex logic in `<script setup>`.
- Create a new hook in `src/hooks/modules/use<Feature>.ts`.
- Move specific logic (state, methods, computed) to the hook.
- Import and use the hook in the component.

### Step 2: Utility Replacement

- Scan for inline `axios`/`fetch` calls -> Replace with `useHttpRequest`.
- Scan for inline date formatting -> Replace with `useDateUtils`.
- Scan for inline element resizing -> Replace with `useAppElementSize`.

### Step 3: Verify

- Ensure functionality remains unchanged (Regression Testing).
- Check `browser` console for errors.
