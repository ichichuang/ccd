# Archetype Specification

> **目标读者：AI**。Archetype 定义 STRUCTURE，不定义样式。样式由 `UNOCSS_AND_ICONS.md`、`INDUSTRIAL_UX_DESIGN_SYSTEM.md` 约束。

Archetype defines STRUCTURE, not styling.

---

## Region scroll behavior (CScrollbar)

Scroll ownership is defined per archetype. When implementing regions, use `<CScrollbar>` as follows:

- **A1**: `data-region="content"` → wrap content in `<CScrollbar>` (page owns scroll).
- **A2**: `data-region="main-content"` and `data-region="inspector"` → each scrollable region wrapped in `<CScrollbar>`.
- **A4**: `data-region="datatable"` → **NOT** wrapped (table uses virtual scroll; nested scroll forbidden).
- **A5**: `data-region="form-body"` → wrap form body in `<CScrollbar>`.

**Reference:** `.cursor/rules/30-drift-check.mdc` (archetype sync with `page.state.ts`).

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
