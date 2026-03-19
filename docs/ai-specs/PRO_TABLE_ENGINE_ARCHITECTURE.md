## ProTable Engine Architecture (V1.0)

This document targets **ProTable maintainers**. It describes the shipped V1.0 architecture: the dual-engine rendering model, the TableController bridge, and the SSOT configuration strategy.

### 1) Dual-Engine Architecture: PrimeVue DataTable + Virtual Grid

ProTable supports two rendering engines behind a single component API:

- **Standard engine**: PrimeVue DataTable (slot/Column-based rendering, DataTable layout/interaction model)
- **Virtual Grid engine**: `@tanstack/vue-virtual` (windowed row rendering) implemented in `VirtualGridRenderer.vue`

The engines are mutually exclusive and selected by `virtualScroll`.

### 2) The Bridge: `TableController` as the single data/behavior brain

`src/components/ProTable/engine/core/TableController.ts` is the orchestrator that normalizes behavior across engines:

- Sort state: engine-level sort state machine (`SORT_DEFAULTS`, sorting engine)
- Filter state: global + column filters (`FILTER_DEFAULTS`, filtering engine)
- Pagination state: page/pageSize/total (`PAGINATION_DEFAULTS`, pagination engine)
- Selection state: row selection + key tracking (selection engine)
- Column visibility: visibility engine for hiding/showing columns

Both renderers consume **controller outputs** (especially `processedRows`) so UI remains a thin adapter:

- PrimeVue DataTable path binds `:value="ctrl.processedRows.value"`
- Virtual Grid path reads `controller.processedRows.value` and renders only visible virtual items

Maintainer rule: never re-implement filtering/sorting/pagination logic in renderers or views; extend controller engines instead.

### 3) SSOT Design: `engine/config.ts` prevents UI logic fragmentation

All defaults and fallback values are centralized in:

- `src/components/ProTable/engine/config.ts`

Examples of SSOT groups:

- `PRO_TABLE_PROPS_DEFAULTS`: default props for `ProTable.vue`
- `PAGINATION_DEFAULTS`: default page/pageSize/options
- `INFINITE_SCROLL_DEFAULTS`: setup delay + bottom distance threshold
- `VIRTUAL_GRID_DEFAULTS`: estimate row height, overscan, grid column fallback
- `TOOLBAR_DEFAULTS`: debounce for global search
- `UI_DEFAULTS`: UI fallbacks (selection column width, fixed height fallback)

Hard constraint: do not hardcode “equivalent values” anywhere else. If a default exists in config.ts, it must be imported and used.

### 4) Smart Global Search & Filtering (Out-of-the-box, opt-out)

The global search engine is designed to work without per-column `searchable: true` flags.

Core behavior (see `src/components/ProTable/engine/engines/filtering.ts`):

- Any column with a `field` is considered searchable by default.
- Searching is **opt-out**:
  - `col.filterable === false` disables participation
  - `col.meta?.searchable === false` disables participation
- Nested field paths (e.g. `user.name`) are supported via safe path resolution.
- If no searchable columns remain, global search does not destroy the dataset; it returns all rows.

This strategy avoids the common “empty pool” bug and prevents UI authors from having to annotate columns for basic search behavior.

### 5) Dual-engine mutual exclusions (Regression guardrails)

- `virtualScroll` must not coexist with pagination UI (avoid conflicting mental model + performance traps).
- Renderers must not leak engine-specific assumptions across branches:
  - Virtual Grid defaults (row height, overscan, CSS grid templates) must remain inside `VirtualGridRenderer.vue`.
  - PrimeVue DataTable props/events/styling remain inside the standard branch.
