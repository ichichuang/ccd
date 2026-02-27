---
description: 工业级 UX 强制检查清单，生成或修改 Vue 页面/组件时必须遵守
globs: src/views/**/*.vue, src/components/**/*.vue
---

# Industrial UX Standards（工业 UX 强制检查）

Whenever you create a new Vue page or modify an existing UI component, you MUST strictly adhere to `@docs/ai-specs/INDUSTRIAL_UX_DESIGN_SYSTEM.md` and `@docs/ai-specs/EMPTY_STATE_AND_ROBUSTNESS.md`.

## CRITICAL AI CHECKLIST BEFORE OUTPUTTING CODE

1. **Layout Check**: Did I wrap the page in `h-full flex flex-col overflow-hidden`? Are toolbars `shrink-0`? Is the scroll localized to the content body using `flex-1 min-h-0` and `<CScrollbar>`?
2. **Color Check**: Did I accidentally use raw colors like `text-red-500` or `bg-blue-500`? I MUST use semantic tokens (`text-danger`, `text-success`, `text-primary`, `text-muted-foreground`) per `colorUsage.ts`.
3. **Empty/Loading Check**: If this page fetches data, did I include a loading state (Skeleton or Spinner) and an empty state? For empty state, use `<EmptyState>` (icon + title + description) or the DataTable `#empty` slot with EmptyState structure. Choose the semantic icon per scenario (see EMPTY_STATE_AND_ROBUSTNESS.md §2.1). Avoid the double-blank anti-pattern (empty table header + floating text).
4. **PrimeVue Polish**: Are DataTables dense and striped? Do numeric columns align to the right? Do Tab headers have icons?
5. **Feedback Check**: Are destructive buttons protected by a confirmation dialog? Are Toast errors given enough time to be read (e.g., `life: 8000`)?
6. **Empty State i18n**: Are all empty-state titles and descriptions in `$t('emptyState.*')` or equivalent locale keys? Never hardcode empty-state strings.

If any of these answers is "No", rewrite the UI code before presenting it to the user.
