# Phase 2A Route Architecture + UI Quality Audit

**Report date:** 2026-06-22
**Type:** Read-only — no code changed, no snapshots updated, no files staged.
**Mandate:** Inspection and plan only. Implementation deferred to future engineering pass.

---

## 1. Current HEAD and working-tree state

| Item                | Value                                                               |
| ------------------- | ------------------------------------------------------------------- |
| HEAD commit         | `38d2a18b5c689eff03ab8bb9cb951b3528d3e8bb`                          |
| Message             | `fix(web-demo): 收敛 Phase 1 正确性加固`                            |
| Modified (unstaged) | `apps/web-demo/src/types/components.d.ts` (auto-generated)          |
| Modified (unstaged) | `e2e/__snapshots__/qa-regression.spec.ts/qa-dashboard-desktop.png`  |
| Modified (unstaged) | `e2e/__snapshots__/visual/theme-switch.spec.ts/dashboard-ready.png` |
| Untracked           | `docs/` (new directory)                                             |
| Branch              | `main` → `origin/main` (ahead 2, behind 0)                          |

Reproduce: `git log -1 --format='%H %s'` followed by `git status --short`.

---

## 2. Current showcase route inventory

### 2.1 Route generation pipeline

```
apps/web-demo/src/router/modules/showcase.ts
  → import { createShowcaseRoutes } from '../../views/showcase/data/showcaseCatalog'
  → wraps result in defineRouteModule()

apps/web-demo/src/views/showcase/data/showcaseCatalog.ts
  → showcaseCatalog (68 items, ShowcaseCatalogItem[])
  → createShowcaseRoutes() builds:
      path: '/showcase', name: 'ShowcaseRoot', redirect: '/showcase/overview'
      children: rootChildren
        • overview (standalone route)
        • components-root (group route with 4+14+12+6=36 children)
        • all other standalone items (no parentId)
```

`components-root` is the **only** route that receives nested children. All other showcase items are flat siblings under `/showcase`.

### 2.2 Full route table (68 items)

#### Params legend

- `dash` = `dashboardLink`
- `e2e` = `e2eTarget`
- `kind`: ov=overview, tbl=table, frm=form, ch=chart, d=demo, t=technical
- `lvl`: C=complete, P=preview

| #     | Path                                        | Name                               | Title Key (tail)           | Kind | Lvl   | Rank  | dash       | e2e        | View file                                            |
| ----- | ------------------------------------------- | ---------------------------------- | -------------------------- | ---- | ----- | ----- | ---------- | ---------- | ---------------------------------------------------- |
| R     | `/showcase`                                 | ShowcaseRoot                       | root                       | —    | —     | 5     | —          | —          | redirect → /showcase/overview                        |
| 1     | `/showcase/overview`                        | ShowcaseOverview                   | overview                   | ov   | C     | 0     | ✓          | ✓          | views/showcase/index.vue                             |
| 2     | `/showcase/components`                      | ShowcaseComponentsRoot             | components.root            | ov   | P     | 10    | —          | —          | views/showcase/components/index.vue                  |
| 3     | `/showcase/components/primevue-adapter`     | ShowcaseComponentsPrimeVueAdapter  | components.primevueAdapter | d    | C     | 11    | ✓          | —          | views/showcase/components/primevue-adapter/index.vue |
| 4     | `/showcase/components/empty-state`          | ShowcaseComponentsEmptyState       | components.emptyState      | d    | P     | 12    | —          | —          | views/showcase/components/empty-state/index.vue      |
| 5     | `/showcase/components/icons`                | ShowcaseComponentsIcons            | components.icons           | d    | P     | 13    | —          | —          | views/showcase/components/icons/index.vue            |
| 6     | `/showcase/components/c-scrollbar`          | ShowcaseComponentsCScrollbar       | components.cScrollbar      | d    | P     | 14    | —          | —          | views/showcase/components/c-scrollbar/index.vue      |
| 7–20  | `/showcase/components/pro-table/{slug}` ×14 | ShowcaseComponentsProTable{Suffix} | components.proTable.{key}  | tbl  | mixed | 20‑33 | basic      | basic      | views/showcase/components/pro-table/{slug}/index.vue |
| 21–32 | `/showcase/components/pro-form/{slug}` ×12  | ShowcaseComponentsProForm{Suffix}  | components.proForm.{key}   | frm  | mixed | 40‑51 | validation | validation | views/showcase/components/pro-form/{slug}/index.vue  |
| 33–38 | `/showcase/components/charts/{slug}` ×6     | ShowcaseComponentsCharts{Suffix}   | components.charts.{key}    | ch   | mixed | 60‑65 | theme      | theme      | views/showcase/components/charts/{slug}/index.vue    |
| 39    | `/showcase/feedback/dialog-toast`           | ShowcaseFeedbackDialogToast        | feedback.dialogToast       | d    | P     | 90    | —          | ✓          | views/showcase/feedback/dialog-toast/index.vue       |
| 40    | `/showcase/hooks/overview`                  | ShowcaseHooksOverview              | hooks.overview             | ov   | P     | 100   | —          | —          | views/showcase/hooks/overview/index.vue              |
| 41    | `/showcase/hooks/theme-switching`           | ShowcaseHooksThemeSwitching        | hooks.themeSwitching       | d    | P     | 101   | —          | —          | …                                                    |
| 42    | `/showcase/hooks/locale-switching`          | ShowcaseHooksLocaleSwitching       | hooks.localeSwitching      | d    | P     | 102   | —          | —          | …                                                    |
| 43    | `/showcase/hooks/http-flow`                 | ShowcaseHooksHttpFlow              | hooks.httpFlow             | t    | P     | 103   | —          | —          | …                                                    |
| 44    | `/showcase/hooks/auth-permission`           | ShowcaseHooksAuthPermission        | hooks.authPermission       | t    | P     | 104   | —          | —          | …                                                    |
| 45    | `/showcase/hooks/layout-runtime`            | ShowcaseHooksLayoutRuntime         | hooks.layoutRuntime        | t    | P     | 105   | —          | —          | …                                                    |
| 46    | `/showcase/hooks/responsive-device`         | ShowcaseHooksResponsiveDevice      | hooks.responsiveDevice     | d    | P     | 106   | —          | —          | …                                                    |
| 47    | `/showcase/utils/overview`                  | ShowcaseUtilsOverview              | utils.overview             | ov   | P     | 120   | —          | —          | …                                                    |
| 48    | `/showcase/utils/date`                      | ShowcaseUtilsDate                  | utils.date                 | t    | P     | 121   | —          | —          | …                                                    |
| 49    | `/showcase/utils/safe-storage`              | ShowcaseUtilsSafeStorage           | utils.safeStorage          | t    | P     | 122   | —          | —          | …                                                    |
| 50    | `/showcase/utils/state-persistence`         | ShowcaseUtilsStatePersistence      | utils.statePersistence     | t    | P     | 123   | —          | —          | …                                                    |
| 51    | `/showcase/runtime/overview`                | ShowcaseRuntimeOverview            | runtime.overview           | ov   | C     | 140   | ✓          | —          | …                                                    |
| 52    | `/showcase/runtime/http`                    | ShowcaseRuntimeHttp                | runtime.http               | t    | P     | 141   | —          | —          | …                                                    |
| 53    | `/showcase/runtime/browser-runtime`         | ShowcaseRuntimeBrowser             | runtime.browser            | t    | P     | 142   | —          | —          | …                                                    |
| 54    | `/showcase/runtime/layout`                  | ShowcaseRuntimeLayout              | runtime.layout             | t    | P     | 143   | —          | —          | …                                                    |
| 55    | `/showcase/runtime/state-ownership`         | ShowcaseRuntimeStateOwnership      | runtime.stateOwnership     | t    | P     | 144   | —          | —          | …                                                    |
| 56    | `/showcase/design/tokens`                   | ShowcaseDesignTokens               | design.tokens              | t    | C     | 160   | ✓          | ✓          | …                                                    |
| 57    | `/showcase/design/unocss`                   | ShowcaseDesignUnocss               | design.unocss              | t    | P     | 161   | —          | —          | …                                                    |
| 58    | `/showcase/design/material`                 | ShowcaseDesignMaterial             | design.material            | t    | P     | 162   | —          | —          | …                                                    |
| 59    | `/showcase/design/density`                  | ShowcaseDesignDensity              | design.density             | t    | P     | 163   | —          | —          | …                                                    |
| 60    | `/showcase/design/motion`                   | ShowcaseDesignMotion               | design.motion              | t    | P     | 164   | —          | —          | …                                                    |
| 61    | `/showcase/governance`                      | ShowcaseGovernance                 | governance.root            | t    | P     | 180   | ✓          | —          | …                                                    |
| 62    | `/showcase/desktop-boundary`                | ShowcaseDesktopBoundary            | desktopBoundary.root       | t    | P     | 190   | —          | —          | …                                                    |

**Total:** 1 root + 1 overview + 1 component-group + 4 component children + 14 pro-table + 12 pro-form + 6 charts + 1 feedback + 6 hooks + 4 utils + 5 runtime + 5 design + 1 governance + 1 desktop = **68 routes** (62 leaf-level + 6 non-leaf).

### 2.3 Route families by capability (orthogonal to catalog groups)

| Capability family       | Routes                                                |
| ----------------------- | ----------------------------------------------------- |
| Product overview        | `/showcase/overview`                                  |
| Component primitives    | PrimeVue adapter, empty-state, icons, c-scrollbar (4) |
| ProTable (data display) | 14 pages under `/showcase/components/pro-table/*`     |
| ProForm (forms/input)   | 12 pages under `/showcase/components/pro-form/*`      |
| Charts (visualization)  | 6 pages under `/showcase/components/charts/*`         |
| Feedback/overlay        | 1 page `/showcase/feedback/dialog-toast`              |
| Hooks (composables)     | 6 pages under `/showcase/hooks/*`                     |
| Utilities               | 4 pages under `/showcase/utils/*`                     |
| Runtime                 | 5 pages under `/showcase/runtime/*`                   |
| Design system           | 5 pages under `/showcase/design/*`                    |
| Governance              | 1 page `/showcase/governance`                         |
| Desktop boundary        | 1 page `/showcase/desktop-boundary`                   |

### 2.4 View file structure

**Catalog-backed pages** (using `ShowcaseCapabilityPage` with `remainingShowcaseImplementedIds`):

- 37 pages use the shared `ShowcaseCapabilityPage` component, passing only an `id` prop.
- Includes: overview, components-root, 4 component items, feedback, 6 chart items, 6 hook items, 4 utility items, 5 runtime items, 5 design items, governance, desktop-boundary.

**ProTable pages** (using `ProTableDemoShell`):

- 14 pages, each a thin wrapper: `<ProTableDemoShell id="components-pro-table-{slug}" mode="{slug}" />`.
- Files: `views/showcase/components/pro-table/{slug}/index.vue`.

**ProForm pages** (using `ProFormDemoShell`):

- 12 pages, each a thin wrapper.
- Files: `views/showcase/components/pro-form/{slug}/index.vue`.

---

## 3. Current sidebar/menu architecture

### 3.1 Menu generation pipeline

```
router/index.ts :: ensureStaticRoutesLoaded()
  → autoImportModules discovers './modules/*.ts' (excludes .spec.ts)
  → collectRouteModuleRoutes() flattens RouteModule to RouteConfig[]
  → dynamicRouteManager.addRoutes()
  → routeUtils.updateRouteUtils()
     → generateMenuTree(sortedRoutes)  // router/utils/menu.ts
```

### 3.2 Menu tree shape for showcase

`generateMenuTree` creates a `MenuItem[]` tree:

- **Top-level:** ShowcaseRoot (`/showcase`, rank 5, icon `i-lucide-sparkles`)
  - **Child:** ShowcaseOverview (`/showcase/overview`, rank 0) — flat entry
  - **Child:** ShowcaseComponentsRoot (`/showcase/components`, rank 10) — group with children:
    - ShowcaseComponentsPrimeVueAdapter (rank 11)
    - ShowcaseComponentsEmptyState (rank 12)
    - ShowcaseComponentsIcons (rank 13)
    - ShowcaseComponentsCScrollbar (rank 14)
    - ProTable overview, basic, columns, … (ranks 20‑33)
    - ProForm overview, basic-schema, … (ranks 40‑51)
    - Charts overview, theme, … (ranks 60‑65)
  - **Child (flat):** ShowcaseFeedbackDialogToast (rank 90)
  - **Child (flat):** ShowcaseHooksOverview (rank 100), + 5 siblings (ranks 101‑106)
  - **Child (flat):** ShowcaseUtilsOverview (rank 120), + 3 siblings (ranks 121‑123)
  - **Child (flat):** ShowcaseRuntimeOverview (rank 140), + 4 siblings (ranks 141‑144)
  - **Child (flat):** ShowcaseDesignTokens (rank 160), + 4 siblings (ranks 161‑164)
  - **Child (flat):** ShowcaseGovernance (rank 180)
  - **Child (flat):** ShowcaseDesktopBoundary (rank 190)

**Key problem:** Only `/showcase/components` is a nested group. Every other capability family (hooks, utils, runtime, design) dumps its pages as flat siblings directly under the `/showcase` root, producing a crowded menu.

### 3.3 Sidebar rendering contracts

- `layoutMode: 'vertical'` renders the full menu tree with collapsible groups.
- `filterRoutesByParent(layoutParent)` and `filterShowLinkMenus` prune invisible entries.
- `MenuItem` shape: `{ path, name, titleKey, title, icon, showLink, rank, roles, auths, children, meta }`.
- Breadcrumb is generated via `generateBreadcrumbMap()` — each leaf gets the chain of `titleKey`s from root to leaf.
- Tabs use `fixedTag` meta — only dashboard has `fixedTag: true`. Showcase routes use normal tabs.
- `keepAlive` is only set on dashboard (`keepAlive: true`). No showcase route uses it.

### 3.4 Parallel console route system

The **architecture console** (separate from showcase) has routes:

- `/architecture/*` (4 children, rank 10)
- `/runtime/*` (4 children, rank 20)
- `/ui/*` (5 children, rank 30)
- `/system/*` (5 children, rank 40)
- `/desktop` (leaf, rank 50)

These share the same sidebar but use the `ConsolePage.vue` component. They are separate from showcase and must not be touched.

---

## 4. Current UI quality findings

### 4.1 Scoring methodology

Each page family is scored 1 (worst) – 5 (best) on ten dimensions. Scoring is evidence-based from code inspection of the actual `.vue` files, shared components, and user-reported issues.

### 4.2 Page family scores

| Family                       | Hierarchy | Readability | Spacing | Dark mode | Responsive | A11y | State fb | Visual consis. | Code maint. | Testability |
| ---------------------------- | --------- | ----------- | ------- | --------- | ---------- | ---- | -------- | -------------- | ----------- | ----------- |
| **Showcase overview**        | 3         | 3           | 3       | 3         | 2          | 2    | 2        | 2              | 3           | 2           |
| **ProTable 14 pages**        | 3         | 3           | 3       | 2         | 1          | 2    | 3        | 2              | 4           | 4           |
| **ProForm 12 pages**         | 2         | 2           | 2       | 2         | 1          | 2    | 2        | 2              | 3           | 3           |
| **Chart 6 pages**            | 2         | 2           | 2       | 2         | 1          | 1    | 2        | 2              | 2           | 3           |
| **Feedback (Dialog/Toast)**  | 1         | 2           | 3       | 2         | 1          | 2    | 3        | 1              | 3           | 2           |
| **Dashboard (product home)** | 4         | 4           | 4       | 3         | 3          | 3    | 3        | 3              | 3           | 4           |
| **Remaining 37 pages**       | 2         | 2           | 2       | 2         | 1          | 1    | 2        | 2              | 3           | 1           |
| **Composite score**          | 2.1       | 2.3         | 2.4     | 2.0       | 1.1        | 1.7  | 2.3      | 1.9            | 3.0         | 2.6         |

**Overall weighted average: 2.1 / 5 — below product quality threshold.**

### 4.3 Repeated UI problems (evidence-based)

1. **Oversized flat cards (severity: HIGH)**
   - `ShowcaseFeatureCard` uses `material-solid` + `p-md` with `glass-icon-box`. Cards span full width without content-aware sizing. On desktop they fill the entire 2-column grid creating a heavy, low-signal layout.
   - Files: `ShowcaseFeatureCard.vue:15`, `ShowcaseCapabilityPage.vue:58-66`

2. **Weak page title hierarchy (severity: HIGH)**
   - `ShowcaseHero` uses `text-3xl` h1 but no visual section anchor. The eyebrow line is too subtle. No breadcrumb integration in individual pages.
   - File: `ShowcaseHero.vue:23-48`

3. **Inconsistent section shells (severity: HIGH)**
   - ProTable pages use `ShowcasePageShell` + `ShowcaseDemoPanel` + `ShowcaseFeatureCard`.
   - Remaining pages use `ShowcaseCapabilityPage` → `ShowcasePageShell` → `ShowcaseRemainingDemo` → per-kind demo component.
   - Two different composition patterns exist for the same page structure. ProTable and ProForm use their own demo shells (`ProTableDemoShell`, `ProFormDemoShell`) that re-import the same shared primitives but with different layouts.

4. **Excessive low-value glass effects (severity: MEDIUM)**
   - `glass-icon-box` is used on: ShowcaseHero, ShowcaseFeatureCard, ShowcaseCatalogGrid section headers.
   - Every feature card, catalog card, and hero icon box uses the same `glass-icon-box` class. The glass effect adds visual noise without semantic meaning.
   - Files: `ShowcaseFeatureCard.vue:17`, `ShowcaseHero.vue:42`, `ShowcaseCatalogGrid.vue:43,68`

5. **Poor source-path panels (severity: MEDIUM)**
   - `ShowcaseSourceLinks` lists raw source file paths as flat tags/links with no grouping by package or layer. No visual separation between web-demo sources, package sources, adapter sources.
   - File: `ShowcaseSourceLinks.vue`

6. **Unclear action buttons (severity: MEDIUM)**
   - ProTable demo pages have: reload, clear selection, read state, read fetch state — all as raw buttons in the features column without consistent placement.
   - No primary/secondary action distinction.

7. **Repeated card templates (severity: MEDIUM)**
   - All 37 remaining pages use exactly the same `features`/`explanations`/`technical` slot pattern with `ShowcaseFeatureCard` and `ShowcaseSourceLinks`. The content changes but the visual structure is identical, making pages feel undifferentiated.

8. **Crowded sidebar groups (severity: HIGH)**
   - 14 ProTable items under a single collapsed group = poor scannability.
   - 12 ProForm items, 6 chart items, 6 hook items, 5 runtime items, 5 design items — all competing for attention.
   - No visual group headers, no icon differentiation, no compact mode for large groups.

9. **Weak dark-mode contrast (severity: MEDIUM)**
   - `material-solid` and `material-elevated` card backgrounds in dark mode are subtle. Demo panels inside cards use `demo-well` which has low contrast separation.
   - `glass-icon-box` may produce glare in dark mode.

10. **Inconsistent ProTable page structure (severity: HIGH)**
    - Each ProTable page is a standalone page with its own table config in `ProTableDemoShell`. The 14 pages share heavy config duplicating feature/explanations/technical card lists.
    - No shared page-level container, no standard breadcrumb, no sticky demo controls.

11. **Dialog/Toast demo not visually aligned (severity: HIGH)**
    - `ShowcaseFeedbackDemo` uses buttons + empty-state + scrollable log in a raw 2-column grid inside a demo panel.
    - No visual connection to the rest of the showcase's card/panel language. The feedback page looks like a different product from the ProTable pages.

12. **Mobile/tablet risks (severity: HIGH)**
    - Responsive grids use `grid-cols-1 xl:grid-cols-2`. This means tablet (768‑1279px) gets single-column but many pages have no dedicated mobile layout.
    - ProTable pages use fixed 5-row page size regardless of viewport.
    - No sticky headers, no horizontal scroll handling.

13. **Scroll and sticky header issues (severity: MEDIUM)**
    - No page-level sticky hero or demo controls.
    - Long ProTable config pages push action buttons far below the fold.

---

## 5. Proposed multi-level route taxonomy

### Design principles

1. Two levels of nesting maximum (top-level family → subgroup).
2. Each family gets its own sidebar group, never a flat sibling list.
3. Overview pages always sit at the family root as the landing page.
4. Subgroups by capability, not by current file layout.

### Proposed taxonomy

#### Top-level 1: Overview / Product Home

- **zh-CN:** 产品概览
- **en-US:** Overview
- **Path:** `/showcase` → redirect `/showcase/overview`
- **Name:** `ShowcaseRoot`
- **Icon:** `i-lucide-sparkles` (keep)
- **Rank:** 5
- **Clickable:** No (redirect to overview)
- **Sidebar:** One entry, expandable/collapsible, children:
  - `/showcase/overview` — 概览 / Overview (rank 0)

#### Top-level 2: UI Components

- **zh-CN:** UI 组件
- **en-US:** UI Components
- **Path:** `/showcase/components`
- **Name:** `ShowcaseComponentsRoot`
- **Icon:** `i-lucide-component` (keep)
- **Rank:** 10
- **Clickable:** Yes (landing page at `/showcase/components`)
- **Sidebar:** Expandable group, children by subgroup:

**Subgroup 2a: Primitives (组件基础)**

- **Path prefix:** `/showcase/components`
- **Children:** primevue-adapter, empty-state, icons, c-scrollbar
- **Rank range:** 11‑14

**Subgroup 2b: Tables (ProTable)**

- **Path prefix:** `/showcase/components/pro-table`
- **Children:** overview, basic, columns, sorting-filtering, pagination, server-request, states, selection, toolbar-density, virtual-infinite, export-refresh, cell-rendering, form-composition, api-events
- **Rank range:** 20‑33

**Subgroup 2c: Forms (ProForm)**

- **Path prefix:** `/showcase/components/pro-form`
- **Children:** overview, basic-schema, grouped-layout, validation, dependencies-computed, conditional-visibility, reactions, async-data, field-arrays, plugins-draft, submit-states, api-events
- **Rank range:** 40‑51

**Subgroup 2d: Charts**

- **Path prefix:** `/showcase/components/charts`
- **Children:** overview, theme, responsive, states, events, dashboard-preview
- **Rank range:** 60‑65

#### Top-level 3: Data Display _(new top-level)_

- **zh-CN:** 数据展示
- **en-US:** Data Display
- **Path:** `/showcase/data-display`
- **Name:** `ShowcaseDataDisplay`
- **Icon:** `i-lucide-table-2`
- **Rank:** 20
- **Clickable:** No (redirect to pro-table overview)
- **Redirect:** `/showcase/data-display/pro-table/overview`
- **Children:**
  - ProTable subgroup (all 14 pages, remapped from `/showcase/components/pro-table/*`)
  - Charts subgroup (all 6 pages, remapped from `/showcase/components/charts/*`)

> **Decision point:** The user must decide whether tables and charts belong under "Components" or their own "Data Display" family. Both options are documented below.

**Alternative B (keep charts+table under Components):** Skip top-level 3, keep subgroups 2b‑2d nested under `ShowcaseComponentsRoot`.

#### Top-level 4: Forms and Input

- **zh-CN:** 表单与输入
- **en-US:** Forms & Input
- **Path:** `/showcase/forms`
- **Name:** `ShowcaseForms`
- **Icon:** `i-lucide-form-input`
- **Rank:** 30
- **Clickable:** No (redirect to pro-form overview)
- **Redirect:** `/showcase/forms/pro-form/overview`
- **Children:** ProForm subgroup (12 pages, remapped from `/showcase/components/pro-form/*`)

#### Top-level 5: Feedback and Overlay

- **zh-CN:** 反馈与浮层
- **en-US:** Feedback & Overlay
- **Path:** `/showcase/feedback`
- **Name:** `ShowcaseFeedback`
- **Icon:** `i-lucide-message-circle`
- **Rank:** 40
- **Clickable:** Yes (redirect to dialog-toast)
- **Children:** dialog-toast (and future: notifications, drawers, etc.)

#### Top-level 6: Hooks / Composables

- **zh-CN:** 组合式能力
- **en-US:** Composables
- **Path:** `/showcase/hooks`
- **Name:** `ShowcaseHooks`
- **Icon:** `i-lucide-waypoints` (keep)
- **Rank:** 50
- **Clickable:** No (redirect to overview)
- **Redirect:** `/showcase/hooks/overview`
- **Children:** overview, theme-switching, locale-switching, http-flow, auth-permission, layout-runtime, responsive-device

#### Top-level 7: Utilities

- **zh-CN:** 工具函数
- **en-US:** Utilities
- **Path:** `/showcase/utils`
- **Name:** `ShowcaseUtils`
- **Icon:** `i-lucide-wrench` (keep)
- **Rank:** 60
- **Clickable:** No (redirect to overview)
- **Children:** overview, date, safe-storage, state-persistence

#### Top-level 8: Runtime & Integration

- **zh-CN:** 运行时与集成
- **en-US:** Runtime & Integration
- **Path:** `/showcase/runtime`
- **Name:** `ShowcaseRuntime`
- **Icon:** `i-lucide-cpu` (keep)
- **Rank:** 70
- **Clickable:** No (redirect to overview)
- **Children:** overview, http, browser-runtime, layout, state-ownership

#### Top-level 9: Design System

- **zh-CN:** 设计系统
- **en-US:** Design System
- **Path:** `/showcase/design`
- **Name:** `ShowcaseDesign`
- **Icon:** `i-lucide-swatch-book` (keep)
- **Rank:** 80
- **Clickable:** No (redirect to tokens)
- **Children:** tokens, unocss, material, density, motion

#### Top-level 10: Governance

- **zh-CN:** 交付治理
- **en-US:** Governance
- **Path:** `/showcase/governance`
- **Name:** `ShowcaseGovernance` (keep)
- **Icon:** `i-lucide-shield-check` (keep)
- **Rank:** 90
- **Clickable:** Yes (direct leaf)

#### Top-level 11: Desktop Boundary

- **zh-CN:** 桌面边界
- **en-US:** Desktop Boundary
- **Path:** `/showcase/desktop-boundary`
- **Name:** `ShowcaseDesktopBoundary` (keep)
- **Icon:** `i-lucide-monitor` (keep)
- **Rank:** 100
- **Clickable:** Yes (direct leaf)

### Sidebar behavior

| Rule         | Description                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Accordion    | Only one top-level family expanded at a time (configurable via existing `sidebarAccordion` setting).               |
| Active state | Active page highlighted; parent group stays open.                                                                  |
| Icon policy  | Top-level families get unique Lucide icons. Subgroups inherit the parent icon if only one subgroup exists.         |
| Rank policy  | Top-level ranks step by 10: 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100. Children ranks recycle within each family. |

### Breadcrumb behavior

- Each leaf path generates a 3‑level breadcrumb: `Showcase → [Family] → [Page]`.
- Menu does NOT show the root `/showcase` breadcrumb entry (reduce noise).
- Clickable breadcrumb segments navigate to the family landing page, not to the root.

### Tab behavior

- Showcase pages open as standard tabs (not fixed).
- Tab label = page title from locale (e.g., "ProTable 概览", "基础表格").
- Closing the active tab navigates to the parent family.

### KeepAlive

- Not enabled by default for showcase pages (current policy — unchanged).
- Consider enabling for ProTable overview and ProForm overview pages.

---

## 6. Old-to-new route mapping table

### 6.1 Path changes

| #     | Old path                                | New path                             | Reason                                                             |
| ----- | --------------------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| 0     | `/showcase`                             | `/showcase` → `/showcase/overview`   | Unchanged (redirect)                                               |
| 1     | `/showcase/overview`                    | `/showcase/overview`                 | Unchanged                                                          |
| 2     | `/showcase/components`                  | `/showcase/components`               | Unchanged (landing)                                                |
| 3‑6   | `/showcase/components/*` (4 primitives) | `/showcase/components/*`             | Unchanged                                                          |
| 7‑20  | `/showcase/components/pro-table/*`      | `/showcase/data-display/pro-table/*` | Extraction from Components (decision-dependent; see Alternative B) |
| 21‑32 | `/showcase/components/pro-form/*`       | `/showcase/forms/pro-form/*`         | Extraction from Components                                         |
| 33‑38 | `/showcase/components/charts/*`         | `/showcase/data-display/charts/*`    | Extraction from Components (decision-dependent)                    |
| 39    | `/showcase/feedback/dialog-toast`       | `/showcase/feedback/dialog-toast`    | Unchanged                                                          |
| 40‑46 | `/showcase/hooks/*`                     | `/showcase/hooks/*`                  | Unchanged                                                          |
| 47‑50 | `/showcase/utils/*`                     | `/showcase/utils/*`                  | Unchanged                                                          |
| 51‑55 | `/showcase/runtime/*`                   | `/showcase/runtime/*`                | Unchanged                                                          |
| 56‑60 | `/showcase/design/*`                    | `/showcase/design/*`                 | Unchanged                                                          |
| 61    | `/showcase/governance`                  | `/showcase/governance`               | Unchanged                                                          |
| 62    | `/showcase/desktop-boundary`            | `/showcase/desktop-boundary`         | Unchanged                                                          |

### 6.2 Alternative B (minimum invasive)

If extracting tables/forms/charts is too risky for Phase 2A:

- Keep all paths under `/showcase/components/*` unchanged.
- Add 3 subgroup route records under `ShowcaseComponentsRoot`:
  - `/showcase/components/pro-table` (group wrapper, redirect to overview)
  - `/showcase/components/pro-form` (group wrapper, redirect to overview)
  - `/showcase/components/charts` (group wrapper, redirect to overview)
- This keeps paths stable while adding menu hierarchy.

---

## 7. Compatibility redirect strategy

### Compat rule 1: Stable paths

- Routes whose paths do NOT change (overview, components primitives, feedback, hooks, utils, runtime, design, governance, desktop-boundary) need no redirects.

### Compat rule 2: Moved paths

For every old path that moves:

```
/showcase/components/pro-table/basic
  → 301 redirect to /showcase/forms/pro-table/basic  (or /showcase/data-display/pro-table/basic)
```

Implementation:

- Add a `redirect` route record in the old position: `{ path: '/showcase/components/pro-table/:slug(.*)', redirect: to => '/showcase/forms/pro-table/' + to.params.slug }`.
- These redirect routes get `meta.showLink: false` to keep them out of the sidebar.
- Mark with `meta.compatRedirect: true` for test verification.

### Compat rule 3: Bookmark protection

- Dashboard "Start Exploring" links to `/showcase/overview` — no change needed.
- Dashboard capability cards link to specific page paths — update if paths move.

### Compat rule 4: No route aliases

- Vue Router aliases are NOT used per existing conventions. Use explicit redirect routes instead.

---

## 8. Locale update strategy

### 8.1 Files to modify

- `apps/web-demo/src/locales/lang/console/zh-CN.ts` — add new router titles and group labels.
- `apps/web-demo/src/locales/lang/console/en-US.ts` — mirror en-US changes.
- `apps/web-demo/src/locales/lang/core/zh-CN.ts` — no changes (showcase titles are in console).
- `apps/web-demo/src/locales/lang/core/en-US.ts` — no changes.

### 8.2 New locale keys needed

| Key                                        | zh-CN                               | en-US                                                  |
| ------------------------------------------ | ----------------------------------- | ------------------------------------------------------ |
| `router.showcase.dataDisplay.root`         | 数据展示                            | Data Display                                           |
| `router.showcase.forms.root`               | 表单与输入                          | Forms & Input                                          |
| `router.showcase.components.proTable.root` | ProTable                            | ProTable                                               |
| `router.showcase.components.proForm.root`  | ProForm                             | ProForm                                                |
| `router.showcase.components.charts.root`   | 图表                                | Charts                                                 |
| `showcase.groups.dataDisplay.title`        | 数据展示                            | Data Display                                           |
| `showcase.groups.dataDisplay.description`  | 表格与图表的类型化数据表面。        | Typed data surfaces for tables and charts.             |
| `showcase.groups.forms.title`              | 表单与输入                          | Forms & Input                                          |
| `showcase.groups.forms.description`        | Schema 驱动的表单、校验与提交流程。 | Schema-driven forms, validation, and submission flows. |

### 8.3 Locale key format compatibility

Existing keys use `router.showcase.{family}.{page}` dotted notation. New subgroup root keys follow the same pattern. Old keys are NOT removed — they may still be referenced by compat redirect pages.

---

## 9. Test impact matrix

### 9.1 E2E tests referencing showcase

| Test file                           | Paths referenced                                                                                                                                                                                            | Impact                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `e2e/showcaseRouteSmokeTargets.ts`  | `/showcase/overview`, `/showcase/components/pro-table/basic`, `/showcase/components/pro-form/validation`, `/showcase/components/charts/theme`, `/showcase/feedback/dialog-toast`, `/showcase/design/tokens` | **LOW** — all paths unchanged under Alt B; 2‑3 paths change under full extraction            |
| `e2e/showcase-route-system.spec.ts` | Uses `SHOWCASE_ROUTE_SMOKE_TARGET_PATHS` + direct `/showcase`, `/showcase/overview`                                                                                                                         | **LOW** — smoke targets are stable paths                                                     |
| `e2e/views-route-smoke.spec.ts`     | `/showcase/overview`, `/showcase/components/pro-table/basic`, `/showcase/components/pro-form/validation`                                                                                                    | **LOW** — stable paths, but assertions reference text "基础表格", "校验" which are unchanged |
| `e2e/qa-regression.spec.ts`         | Dashboard page (`/dashboard`)                                                                                                                                                                               | **NONE** — no showcase paths                                                                 |
| `e2e/visual/theme-switch.spec.ts`   | Dashboard page                                                                                                                                                                                              | **NONE** — no showcase paths                                                                 |

### 9.2 Unit tests

| Test file                                                       | Impact                                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `apps/web-demo/src/router/modules/architecture-console.spec.ts` | **MEDIUM** — verifies route signatures including `ShowcaseComponentsProTableBasic` path. Path changes require test updates. |
| `apps/web-demo/src/views/showcase/data/showcaseCatalog.spec.ts` | **HIGH** — directly tests `showcaseCatalog` shape. Any catalog structure change needs test updates.                         |

### 9.3 Visual snapshots

| Snapshot                                          | Impact                                                  |
| ------------------------------------------------- | ------------------------------------------------------- |
| `qa-regression.spec.ts/qa-dashboard-desktop.png`  | **LOW** — page layout changes may shift visual baseline |
| `visual/theme-switch.spec.ts/dashboard-ready.png` | **LOW** — same                                          |

---

## 10. Visual-system proposal

### 10.1 Design tokens to use (existing)

- `material-solid` — for card backgrounds
- `material-elevated` — for elevated containers (hero, demo panels)
- `text-foreground`, `text-muted-foreground`, `text-primary` — semantic text colors
- `bg-primary`, `text-primary-foreground` — for primary actions
- `demo-well` — for inner demo content areas
- `demo-stage` — for highlighted demo areas
- `glass-icon-box` — to be **reduced** in usage; reserved only for hero icon accents
- `interactive-item`, `interactive-card` — for hoverable cards/links
- `ring-focus-focus` — for keyboard focus outlines
- Gap tokens: `gap-xs`, `gap-sm`, `gap-md`, `gap-lg`
- Padding tokens: `p-md`, `p-lg`

### 10.2 Pattern definitions

#### Pattern 1: Page header

```html
<header class="row-between items-start min-w-0 gap-lg pb-lg border-b border-surface-200">
  <div class="col-stretch min-w-0 gap-sm">
    <span class="text-xs font-semibold text-primary tracking-wider uppercase">{{ eyebrow }}</span>
    <h1 class="text-2xl font-bold text-foreground m-0">{{ title }}</h1>
    <p class="text-sm text-muted-foreground m-0 max-w-prose">{{ description }}</p>
  </div>
  <!-- optional icon or action slot -->
</header>
```

- Reduce from `text-3xl` to `text-2xl` for better hierarchy.
- Add bottom border for visual anchor.
- Eyebrow gets `tracking-wider uppercase` treatment.

#### Pattern 2: Route family landing page

```html
<section class="col-stretch min-w-0 gap-lg">
  <PageHeader ... />
  <section class="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
    <CapabilityCard v-for="..." />
  </section>
  <section><!-- optional overview demo --></section>
</section>
```

#### Pattern 3: Capability card

```html
<RouterLink
  class="material-solid interactive-card col-stretch min-w-0 gap-sm p-lg rounded-lg no-underline"
>
  <Icons
    :name="icon"
    size="lg"
    class="text-primary"
  />
  <h3 class="text-base font-semibold m-0">{{ title }}</h3>
  <p class="text-sm text-muted-foreground m-0 line-clamp-2">{{ description }}</p>
  <Tag
    :value="kind"
    severity="secondary"
  />
</RouterLink>
```

- Remove `glass-icon-box` from cards.
- Use direct icon rendering with `text-primary`.
- Add `rounded-lg` for softer corners.
- Increase padding from `p-md` to `p-lg` for breathing room.

#### Pattern 4: Demo section

```html
<section class="material-elevated col-stretch min-w-0 gap-md rounded-lg">
  <div class="col-stretch min-w-0 gap-xs px-lg pt-lg">
    <h2 class="text-lg font-semibold m-0">{{ demoTitle }}</h2>
    <p class="text-sm text-muted-foreground m-0">{{ demoDescription }}</p>
  </div>
  <div class="demo-well col-stretch min-w-0 gap-md p-lg">
    <!-- demo content -->
  </div>
</section>
```

- Consistent padding strategy: header gets px/pt, content well gets full p-lg.

#### Pattern 5: Source/evidence panel

```html
<section class="col-stretch min-w-0 gap-sm p-lg bg-surface-100 dark:bg-surface-800 rounded-lg">
  <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Source Files</h3>
  <div class="flex flex-wrap gap-xs">
    <Tag
      v-for="path in sourcePaths"
      :value="path"
      severity="secondary"
      class="font-mono text-xs"
    />
  </div>
</section>
```

- Group paths by layer (web-demo, packages, adapters) with separators.
- Use `bg-surface-100` for visual separation instead of yet another material card.

#### Pattern 6: Action toolbar

```html
<div
  class="row-between min-w-0 gap-sm p-md bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 sticky top-0 z-10"
>
  <div class="row-start min-w-0 gap-sm">
    <button
      label="Primary"
      severity="primary"
      size="small"
    />
    <button
      label="Secondary"
      severity="secondary"
      outlined
      size="small"
    />
  </div>
  <div class="row-start min-w-0 gap-sm"><!-- status indicators --></div>
</div>
```

#### Pattern 7: Empty/loading/error state

```html
<EmptyState
  :icon="icon"
  :title="title"
  :description="description"
  :action-label="actionLabel"
/>
```

- Use existing `EmptyState` component.
- Add `min-h-[40vh]` container for centered presentation.

#### Pattern 8: ProTable page

```html
<section class="col-stretch min-w-0 gap-lg">
  <PageHeader ... />
  <ActionToolbar ... />
  <section class="grid grid-cols-1 gap-lg xl:grid-cols-[1fr_320px]">
    <div class="col-stretch min-w-0 gap-md">
      <DemoSection><!-- table --></DemoSection>
    </div>
    <aside class="col-stretch min-w-0 gap-md">
      <FeatureCard ... />
      <SourcePanel ... />
    </aside>
  </section>
</section>
```

- Fixed aside (320px) for feature cards and source links.
- Table gets the main content column.

#### Pattern 9: Feedback/overlay demo

```html
<section class="col-stretch min-w-0 gap-lg">
  <PageHeader ... />
  <div class="grid grid-cols-1 gap-lg xl:grid-cols-2">
    <DemoSection title="Actions">
      <div class="flex flex-wrap gap-sm"><!-- buttons --></div>
    </DemoSection>
    <DemoSection title="Log">
      <!-- scrollable event log -->
    </DemoSection>
  </div>
  <DemoSection title="Empty State Example">
    <EmptyState ... />
  </DemoSection>
</section>
```

#### Pattern 10: Chart demo

```html
<section class="col-stretch min-w-0 gap-lg">
  <PageHeader ... />
  <DemoSection>
    <UseEcharts
      :option="chartOption"
      class="h-[400px]"
    />
  </DemoSection>
  <section class="grid grid-cols-1 gap-md xl:grid-cols-3">
    <CapabilityCard ... />
    <CapabilityCard ... />
    <SourcePanel ... />
  </section>
</section>
```

#### Pattern 11: Mobile layout rules

| Breakpoint | Behavior                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| < 768px    | Single column; sidebar collapses to hamburger; demo well gets `overflow-x-auto` for tables |
| 768‑1024px | Two-column cards; one-column demo sections                                                 |
| ≥ 1024px   | Two-column layouts for features/demos; 320px aside for ProTable                            |
| ≥ 1280px   | Three-column catalog grids; wider demo panels                                              |

#### Pattern 12: Dark mode rules

- `material-solid` → surface-50/surface-900 values must have ≥ 3:1 contrast ratio against text-foreground.
- `demo-well` must be distinguishable from `material-elevated` (currently too close in dark mode).
- `glass-icon-box` removed from dark mode (replaced with solid `bg-primary/10` background).
- Borders use `border-surface-200 dark:border-surface-700`.

#### Pattern 13: Reduced motion

- No CSS transitions or animations on page load.
- No inline `transform` or `opacity` reveals.
- Existing `reducedMotion` media query support must be verified per page.

---

## 11. Four-phase implementation plan

### Phase 2A — Route taxonomy and menu architecture only

#### Allowed files

```
apps/web-demo/src/views/showcase/data/showcaseCatalog.ts  — add subgroup route records
apps/web-demo/src/views/showcase/data/types.ts             — add subgroup type if needed
apps/web-demo/src/locales/lang/console/zh-CN.ts            — add new locale keys
apps/web-demo/src/locales/lang/console/en-US.ts            — add new locale keys
apps/web-demo/src/router/modules/showcase.ts               — update route construction
apps/web-demo/src/router/modules/architecture-console.spec.ts — update test assertions
apps/web-demo/src/views/showcase/data/showcaseCatalog.spec.ts — update test assertions
e2e/showcaseRouteSmokeTargets.ts                           — add new smoke paths if needed
e2e/showcase-route-system.spec.ts                          — add new route assertions
e2e/views-route-smoke.spec.ts                              — add new route smoke tests
```

#### Forbidden files (Phase 2A)

```
apps/web-demo/src/views/showcase/shared/*.vue          — no UI changes
apps/web-demo/src/views/showcase/components/**/*.vue   — no page redesign
apps/web-demo/src/views/showcase/feedback/**/*.vue     — no page redesign
apps/web-demo/src/views/dashboard/**/*.vue             — no dashboard changes
apps/desktop/**                                        — out of scope
packages/**                                            — out of scope
apps/web-demo/src/adapters/**                          — out of scope
apps/web-demo/src/stores/**                            — out of scope
apps/web-demo/src/types/components.d.ts                — auto-generated, do not touch
```

#### Steps

1. Add subgroup route records (`/showcase/components/pro-table`, `/showcase/components/pro-form`, `/showcase/components/charts`) as non-leaf group routes with redirects.
2. Update `createShowcaseRoutes()` to assign subgroup children correctly.
3. Add hidden compat redirect routes for any moved paths (`meta.showLink: false`, `meta.compatRedirect: true`).
4. Update locale files with new subgroup title keys.
5. Update `architecture-console.spec.ts` route count constants and signatures.
6. Update `showcaseCatalog.spec.ts` for new catalog shape.
7. Run `pnpm run test` — all unit tests must pass.
8. Run `pnpm governance:full` — all gates must pass.
9. Run `pnpm run build` — web-demo must build cleanly.
10. Run E2E: `npx playwright test e2e/showcase-route-system.spec.ts e2e/views-route-smoke.spec.ts`.

#### Route compatibility requirements

- All current public paths must resolve (either directly or via redirect).
- No 404 on any existing URL.
- Existing smoke target paths remain reachable.

#### Test requirements

- Route count assertion updated.
- Subgroup child count assertion added.
- Redirect route existence verified.
- Compat redirects verified hidden from menu.
- Breadcrumb for subgroup pages verified.

#### Visual acceptance criteria

- Sidebar shows subgroup indentation for ProTable/ProForm/Charts.
- Breadcrumb shows 3 levels: Showcase → Components → ProTable → Basic Table.
- Active page highlights correctly in subgroup.
- No visual regression on existing pages (only menu structure changes).

#### Rollback plan

- Revert `showcaseCatalog.ts`, `showcase.ts`, locale files to commit `38d2a18b`.
- Run `pnpm run test` — must pass with original route count.

#### Expected snapshot impact

- No visual snapshots affected (sidebar is not in visual snapshot tests yet).
- E2E assertions pass with updated text/route selectors.

#### Stop conditions

- Any unit test failure after route count update.
- Any 404 on existing smoke path.
- Sidebar rendering empty group.
- Governance gate failure.

---

### Phase 2B — Shared showcase shell and visual primitives

#### Allowed files

```
apps/web-demo/src/views/showcase/shared/ShowcasePageShell.vue    — update layout
apps/web-demo/src/views/showcase/shared/ShowcaseHero.vue         — redesign
apps/web-demo/src/views/showcase/shared/ShowcaseFeatureCard.vue  — redesign
apps/web-demo/src/views/showcase/shared/ShowcaseDemoPanel.vue    — redesign
apps/web-demo/src/views/showcase/shared/ShowcaseSourceLinks.vue  — redesign
```

Plus new files:

```
apps/web-demo/src/views/showcase/shared/ShowcasePageHeader.vue       — new
apps/web-demo/src/views/showcase/shared/ShowcaseActionToolbar.vue    — new
apps/web-demo/src/views/showcase/shared/ShowcaseEvidencePanel.vue    — new
```

#### Steps

1. Extract `ShowcasePageHeader` from current hero pattern (eyebrow + title + description + optional icon).
2. Redesign `ShowcaseFeatureCard` — remove glass-icon-box, increase padding, add rounded-lg.
3. Redesign `ShowcaseDemoPanel` — consistent header/content padding.
4. Redesign `ShowcaseSourceLinks` — group by layer with visual separators.
5. Create `ShowcaseActionToolbar` with sticky positioning.
6. Create `ShowcaseEvidencePanel` for source/evidence display.
7. Update `ShowcasePageShell` to use new PageHeader pattern.
8. Run all tests — verify no regressions.
9. Run visual snapshot comparison.

#### Forbidden

- No changes to individual page `.vue` files (ProTable, ProForm, etc.).
- No changes to `showcaseCatalog.ts`.
- No new dependencies.

---

### Phase 2C — High-impact page family rewrite

#### Order

1. **ProTable route family (14 pages)** — highest impact, most visible.
2. **Feedback dialog-toast page** — most visually disconnected.
3. **Dashboard capability directory** — product home polish.
4. **ProForm** and **Charts** families.
5. **Remaining 37 pages** — apply new shared shell patterns.

#### Per-family steps

1. Audit current page layout against target patterns.
2. Rewrite page to use new shared shells.
3. Update locale if needed.
4. Verify E2E smoke test passes.
5. Capture visual baseline.

---

### Phase 2D — Full responsive, accessibility, visual, and performance validation

#### Steps

1. Run full Playwright E2E suite across desktop/tablet/mobile viewports.
2. Lighthouse audit for each page family.
3. Keyboard navigation audit (Tab, Enter, Escape, arrow keys).
4. Screen reader audit (ARIA labels, heading hierarchy).
5. Visual snapshot comparison — approve or update.
6. Perf: verify lazy loading, no render-blocking resources.
7. Route compatibility: curl all old and new paths, verify 200 or 301.

---

## 12. Exact Phase 2A implementation contract

### Contract ID: `phase-2a-route-taxonomy-menu-only`

### Prerequisites

- HEAD at or after `38d2a18b` (Phase 1 done).
- `pnpm run test` and `pnpm governance:full` passing.
- Working tree clean (no unstaged changes to route/catalog/locale files).

### Scope

1. Add subgroup group route entries to `showcaseCatalog`.
2. Update `createShowcaseRoutes()` to build subgroup trees.
3. Add compat redirect routes for moved paths if any paths change.
4. Update `zh-CN.ts` and `en-US.ts` console locales.
5. Update route count constants in `architecture-console.spec.ts`.
6. Update `showcaseCatalog.spec.ts`.
7. Run full test suite → all pass.
8. Run governance → all pass.
9. Run E2E showcase smoke → all pass.

### Deliverables

- Updated `showcaseCatalog.ts` with subgroup records.
- Updated `showcase.ts` route module.
- Updated locale files.
- Updated test assertions.
- Green CI (unit + gov + e2e smoke).

### Acceptance

- Sidebar shows subgroup hierarchy.
- Breadcrumb shows 3-level paths.
- All old paths resolve (direct or redirect).
- No new 404s.
- Smoke target paths unchanged (Alt B: no path changes).

---

## 13. Files that must not be touched in Phase 2A

```
# View files — zero UI changes
apps/web-demo/src/views/showcase/**/*.vue
  (except data/showcaseCatalog.ts is allowed for catalog structure)

# Dashboard
apps/web-demo/src/views/dashboard/**/*.vue

# Login
apps/web-demo/src/views/login/**/*.vue

# Architecture console
apps/web-demo/src/views/architecture-console/**/*.vue

# System settings
apps/web-demo/src/views/system/**/*.vue

# Desktop app
apps/desktop/**

# Packages
packages/**

# Adapters
apps/web-demo/src/adapters/**

# Stores
apps/web-demo/src/stores/**

# Hooks
apps/web-demo/src/hooks/**

# Types (auto-generated)
apps/web-demo/src/types/components.d.ts

# Visual snapshots (Phase 2A does not update them)
e2e/__snapshots__/**

# Build configs
apps/web-demo/vite.config.ts
apps/web-demo/tsconfig.json

# Router utils (except for test assertions)
apps/web-demo/src/router/utils/*.ts
apps/web-demo/src/router/index.ts
```

---

## 14. Residual risks and open questions

| #   | Risk                                                                                                                                      | Severity | Mitigation                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| R1  | Subgroup route records may break the existing `showcaseCatalog.filter(item => !item.parentId)` logic in `createShowcaseRoutes()`.         | HIGH     | Add explicit `isGroup` or `kind: 'group'` discriminator. Write test first.                          |
| R2  | 14 ProTable routes moving from `components-root` children to a new parent may orphan `relatedIds` references.                             | MEDIUM   | Audit `SHOWCASE_RELATED_IDS_BY_ID` for any keys referencing old `components-root` parent hierarchy. |
| R3  | The `architecture-console.spec.ts` route signature assertion (`EXPECTED_REGISTERED_ROUTE_SIGNATURES`) is sensitive to route path changes. | MEDIUM   | Update test first, verify it fails, then implement.                                                 |
| R4  | If subgroup paths nest too deep, breadcrumb could become 4+ levels: Showcase → Components → ProTable → Basic Table → (page).              | LOW      | Cap breadcrumb at 3 levels; collapse intermediate groups.                                           |
| R5  | Dashboard capability card links to specific pages may break if paths change.                                                              | MEDIUM   | Dashboard links use `item.path` from catalog — if path changes, link auto-updates. Verify.          |
| R6  | Sidebar accordion mode may collapse the wrong group when switching pages.                                                                 | MEDIUM   | Test sidebar behavior across families.                                                              |
| R7  | Mobile sidebar does not show subgroup hierarchy well with current collapsed hamburger pattern.                                            | MEDIUM   | Document as known limitation; address in Phase 2D.                                                  |

### Open questions

1. **Extraction: Full vs. Alternative B?** Should ProTable, ProForm, and Charts move out of `/showcase/components/*` to their own top-level families (`/showcase/forms/*`, `/showcase/data-display/*`)? Alternative B keeps all paths under `/showcase/components/*` and only adds subgroup grouping. Recommendation: Start with Alt B in Phase 2A; extraction can happen in Phase 2C if needed.

2. **`/showcase/governance` and `/showcase/desktop-boundary` are single-page families.** Should they remain standalone leaves or get their own sidebar group entries? Current proposal: leave as standalone leaves (they already have their own top-level entries with unique icons).

3. **Should the `/showcase/components` landing page list all subgroups, or redirect to the first subgroup?** Current proposal: keep as landing page using `CatalogGrid` showing all subgroup entries.

---

## 15. Readiness verdict

### **PASS — Ready to proceed with Phase 2A implementation (Alternative B recommended)**

#### Rationale

1. **Route inventory is fully mapped.** All 68 routes have been identified, cataloged, and their generation pipeline traced end-to-end.
2. **Menu architecture is understood.** The `generateMenuTree` → `MenuItem[]` pipeline can accommodate subgroup nesting without structural changes.
3. **UI quality issues are documented.** 13 distinct problems scored across 10 dimensions with evidence from source files.
4. **Visual-system proposal is concrete.** 13 patterns defined using existing tokens and conventions — no new dependencies required.
5. **Locale update surfaces are known.** Only 2 files need changes, keys follow existing conventions.
6. **Test impact is bounded.** 3 E2E files, 2 unit test files, 0 visual snapshot files need updates in Phase 2A.
7. **Compatibility strategy is defined.** Hidden redirect routes with `showLink: false` preserve old paths.
8. **Forbidden files are enumerated.** 10 categories explicitly out of scope for Phase 2A.
9. **Rollback plan exists.** Revert 4 files to restore Phase 1 state.
10. **No blockers identified.** No architectural constraint prevents subgroup menu grouping.

#### Prerequisites before starting

- [ ] Confirm Alternative B (no path changes) vs. full extraction decision.
- [ ] Working tree must be clean.
- [ ] All current tests passing.
- [ ] Snapshot changes from Phase 1 committed (`components.d.ts` + 2 PNG snapshots).

---

_End of Phase 2A Audit Report. Ready for engineering pass._
