---
description: 修复 UI 问题：Reproduce -> Fix -> Verify
globs: **/*.vue, **/*.ts
---

# Fix UI Issue Skill

## 1. Goal

Fix a reported UI bug or regression.

## 2. Steps

### Step 1: Reproduce

1. Use `browser` tool to visit the URL.
2. Confirm the issue exists (take screenshot if useful).
3. Check Console for errors.

### Step 2: LCD (Locate Cause)

- Inspect the component code.
- Check `uno.config.ts` for missing classes.
- Check logic hooks for data issues.
- **PrimeVue 组件配色**：若问题涉及 Button/Dialog 等组件的 hover、pressed、outlined/text 变体状态：
  - 检查 `src/utils/theme/primevue-preset.ts` 的 `initComponentButtonColorSchemeOptionsItems`
  - 确认 text/outlined 使用 `get('Light')` 作为 hover 背景，而非 `get('Text')`（\*-foreground）或 `get('')`（实色）
  - 详见 `docs/PRIMEVUE_THEME.md`

### Step 3: Fix

- Apply the fix.
- Ensure "No Hardcoding" rule is respected.

### Step 4: Verify

1. Refresh the page in `browser`.
2. Confirm the bug is gone.
3. Check for regressions in related areas.
