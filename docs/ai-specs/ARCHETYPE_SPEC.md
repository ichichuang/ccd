# Archetype Specification

> **目标读者：AI**。Archetype 定义 STRUCTURE，不定义样式。样式由 `UNOCSS_AND_ICONS.md`、`INDUSTRIAL_UX_DESIGN_SYSTEM.md` 约束。

Archetype defines STRUCTURE, not styling.

---

## Automation Awareness (Drift-Fix Self-Healer)

The `scripts/drift-fix.ts` script automatically applies layout fixes to **all** `.vue` files that contain `data-archetype` and have a corresponding `page.state.ts` in the same directory. Run via `pnpm heal`. AI MUST be aware of this behavior to avoid conflicts.

**CScrollbar auto-wrapping:**

- **A1**: `data-region="content"` → auto-wrapped in `<CScrollbar>` when missing
- **A2**: `data-region="main-content"` and `data-region="inspector"` → auto-wrapped in `<CScrollbar>` when missing
- **A4**: `data-region="datatable"` → **NOT** wrapped (table uses virtual scroll; nested scroll forbidden)
- **A5**: `data-region="form-body"` → auto-wrapped in `<CScrollbar>` when missing

**AI behavior rules:**

- **DO NOT** manually add `<CScrollbar>` inside regions that drift-fix will auto-wrap. This causes duplication and conflicting nested scrollbars.
- If a region needs scroll, leave it unwrapped; drift-fix will inject `<CScrollbar>` on `pnpm drift-fix` or equivalent.
- If you must add scroll before drift-fix runs, use `<CScrollbar>`—but be aware drift-fix will not duplicate it (it checks for existing CScrollbar before wrapping).
- When in doubt, run `pnpm heal` after structural changes to let the self-healer apply canonical layout.

**Reference:** `scripts/drift-fix.ts`, `.cursor/rules/30-drift-check.mdc`

---

## A1 — Toolbar + Content

**STRUCTURE**

- page
  - toolbar (shrink-0)
  - content (flex-1 min-h-0, scrollable)

**SCROLL MODEL**

- global scroll disabled (`h-full overflow-hidden`)
- content owns scroll via `<CScrollbar>`

**COMPONENT MAP**

- ToolbarActions
- CScrollbar
- EmptyState
- PageSection

**FORBIDDEN**

- side inspectors
- modal workflow

---

## A2 — Sidebar Inspector

**STRUCTURE**

- main content
- right inspector panel (Drawer or fixed panel)

**SCROLL MODEL**

- independent scroll areas

**COMPONENT MAP**

- DataPanel
- InspectorTabs
- SchemaForm
- useDialog

**FORBIDDEN**

- full page wizard

---

## A3 — Stats Grid

**STRUCTURE**

- metrics header
- card grid
- optional chart row

**SCROLL MODEL**

- single vertical scroll via CScrollbar

**COMPONENT MAP**

- StatsCard
- UseEcharts (ChartContainer)
- SkeletonBlock

**FORBIDDEN**

- dense tables as primary content

---

## A4 — Table + Drawer

**STRUCTURE**

- toolbar (shrink-0)
- data table
- side drawer (PrimeVue Drawer)

**SCROLL MODEL**

- table virtual scroll only
- no nested scroll containers

**COMPONENT MAP**

- DataTable
- TableToolbar
- Drawer + SchemaForm / useDialog
- Pagination

**FORBIDDEN**

- nested scroll containers
- multi-column form beside table
- page scrolling
- primary CTA inside rows

---

## A5 — Form Wizard

**STRUCTURE**

- stepper
- form body (flex-1 min-h-0, scrollable)
- sticky footer CTA (shrink-0)

**SCROLL MODEL**

- body scroll only

**COMPONENT MAP**

- SchemaForm
- Stepper
- StickyFooterCTA

**FORBIDDEN**

- secondary primary actions
- wizard steps as separate pages (use single-page stepper)
