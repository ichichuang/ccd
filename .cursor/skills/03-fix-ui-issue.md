---
description: Fix UI issue: Reproduce -> Fix -> Verify
globs: **/*.vue, **/*.ts
---

# Fix UI Issue Skill

## 1. Goal

Fix reported UI bugs or regressions.

## 2. Steps

### Step 1: Reproduce

1. Use `browser` tool to open the URL.
2. Confirm the issue exists (screenshot if helpful).
3. Check console for errors.

### Step 2: Locate Root Cause (LCD)

- Inspect component code.
- Check `uno.config.ts` for missing classes.
- Check logic hooks for data issues.
- **Vue template issues** (if you see `Error parsing JavaScript expression`, build failure, or TS type errors):
  - Multi-statement inline event handlers → Extract to script methods.
  - TypeScript syntax in template (`as`, `:`, `<>`) → Move to script.
  - `readonly` array `includes` type mismatch → Use `(ARRAY as readonly string[]).includes(val)` with explicit cast.
  - See `docs/ai-specs/VUE_TEMPLATE_ANTIPATTERNS.md`.
- **PrimeVue component colors**: If the issue involves Button/Dialog hover, pressed, outlined/text variants:
  - Check `initComponentButtonColorSchemeOptionsItems` in `src/utils/theme/colorAdapter.ts`
  - Ensure text/outlined use `get('Light')` for hover background, not `get('Text')` (\*-foreground) or `get('')` (solid)
  - See `docs/ai-specs/PRIMEVUE_THEME.md`

### Step 3: Fix

- Apply the fix.
- Ensure "no hardcoding" rules are followed.

### Step 4: Verify

1. Refresh the page in `browser`.
2. Confirm the bug is gone.
3. Check for regressions in related areas.
