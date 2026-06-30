---
title_en: 'ADR-009: ProTreeTable API Decision'
title_zh: ADR-009：ProTreeTable API 决策
aliases:
  - ADR-009
  - ProTreeTable API Decision
  - Tree table support
  - PrimeVue TreeTable wrapper
  - ProTreeTable API 决策
tags:
  - decisions
  - adr
  - architecture
  - vue-ui
  - pro-table
tags_zh:
  - 决策
  - ADR
  - 架构
  - Vue UI
  - ProTable
status: verified
confidence: 0.90
source_langs:
  - en
source_paths:
  - package.json
  - packages/vue-ui/src/ProTable/README.md
  - packages/vue-ui/src/ProTable/ProTable.vue
  - packages/vue-ui/src/ProTable/VirtualGridRenderer.vue
  - packages/vue-ui/src/ProTable/engine/types/props.ts
  - packages/vue-ui/src/ProTable/engine/types/tableState.ts
  - packages/vue-ui/src/ProTable/engine/engines/filtering.ts
  - packages/vue-ui/src/ProTable/engine/core/TableController.ts
  - packages/vue-ui/src/ProTreeTable/README.md
  - packages/vue-ui/src/ProTreeTable/index.ts
  - packages/vue-ui/src/ProTreeTable/types.ts
  - packages/vue-ui/src/ProTreeTable/ProTreeTable.vue
  - packages/vue-ui/src/ProTreeTable/ProTreeTable.spec.ts
  - apps/web-demo/src/views/showcase/components/pro-tree-table/overview/index.vue
  - apps/web-demo/src/views/showcase/components/pro-tree-table/shared/proTreeTableDemoData.ts
  - e2e/pro-tree-table-accessibility.spec.ts
  - wiki/generated/api-surface-report.json
  - wiki/generated/web-demo-ui-inventory.md
  - https://primevue.org/treetable
last_reviewed: '2026-06-30'
wiki_owner: LLM-maintained CCD architecture wiki
---

# ADR-009: ProTreeTable API Decision

## Status

Verified / P2-A closed / P2-B stabilization active.

P2-A1 through P2-A6 are complete as of 2026-06-30. The latest runtime and test baseline is `562beb0436bdda7d848ec54b37e4cbcb75f98b89`; P2-A6 was a read-only decision gate and produced no commit.

This page now owns the P2-B0 stabilization status sync and issue list. P2-B0 is documentation and governance only: it does not approve new runtime features, exports, generated reports, dependencies, or changes to the flat `ProTable` implementation.

P2-B1 records the filtering contract research and docs-only decision. It does not wire runtime filtering.

## Decision Summary

CCD should continue tree table support as an independent experimental `ProTreeTable` wrapper inside `@ccd/vue-ui`, backed by PrimeVue `TreeTable`.

Do not merge `ProTreeTable` into `ProTable`, do not add `treeMode` or `treeData` to `ProTable`, and do not route tree semantics through the flat `ProTable` row engine at this stage.

The completed P2-A baseline is sufficient to start P2-B stabilization. It is not sufficient to promote `ProTreeTable` out of experimental status.

## Background

The current `ProTable` baseline is stable after the P0/P1 upgrade work. Its engine remains a flat-row pipeline:

- Filtering, sorting, pagination, request loading, and selection operate over flat row arrays.
- Range selection depends on flat `processedRows` order.
- `VirtualGridRenderer` is a custom flat-grid path.
- DataTable editing and virtual-grid editing are scoped to flat rows.
- Generated API reports already expose the flat `ProTable` public surface.

PrimeVue `TreeTable` uses `TreeNode[]` and owns separate controlled maps for expansion and selection. It supports tree expansion, checkbox/single/multiple selection, pagination, filtering, sorting, frozen columns, and lazy loading. It does not currently provide the same DataTable editing and virtual-scroller API surface used by `ProTable`, so those capabilities are not part of the first tree table path.

## Decision

Create a new `ProTreeTable<T>` component inside `@ccd/vue-ui` as the first implementation path.

`ProTreeTable` should be a typed CCD wrapper around PrimeVue `TreeTable`, not a mode inside `ProTableProps`. It should start as experimental until API behavior, accessibility, selection semantics, and demo coverage are validated.

This decision keeps the existing `ProTable` engine stable and avoids coupling tree semantics to the flat row controller before those semantics have their own test surface.

## Non-Goals For The First Implementation

The first implementation must not:

- Add `treeMode` or `treeData` to `ProTable`.
- Modify `ProTable.vue`.
- Modify `VirtualGridRenderer.vue`.
- Add tree support to `VirtualGridRenderer`.
- Rework the flat `TableController`.
- Implement tree row editing.
- Implement virtual scrolling.
- Implement Shift-click tree range selection.
- Implement footer groups or advanced tree group styling.
- Implement server persistence.
- Build a shared headless hierarchical row engine.

## Option Comparison

| Option                              | Shape                                                                                                     |    Effort | Compatibility and risk                                                                                                                   | Decision                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- | --------: | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| A. `treeMode` in `ProTable`         | Add tree props and expansion/selection semantics to existing `ProTableProps`.                             |      High | Worst blast radius. The current engine is flat filter -> sort -> pagination; range selection and virtual grid behavior assume flat rows. | Rejected as first path. |
| B. New `ProTreeTable` wrapper       | Add a separate typed wrapper around PrimeVue `TreeTable` inside `@ccd/vue-ui`.                            |    Medium | Best near-term balance. Additive API, stable `ProTable`, isolated tree semantics.                                                        | Recommended.            |
| C. Headless hierarchical row engine | Build shared tree row state, expansion, filtering, sorting, pagination, selection, and adapter contracts. | Very high | Best possible long-term unification, but too much surface for the first slice.                                                           | Deferred.               |

## Proposed Public API Direction

These type sketches are design-only and must not be exported during P2-A0.

```ts
type ProTreeTableSelectionMode = false | 'single' | 'multiple' | 'checkbox'

type ProTreeTableExpandedKeys = Record<string, boolean>

type ProTreeTableSelectionKeys =
  | string
  | string[]
  | Record<string, boolean | { checked: boolean; partialChecked: boolean }>
  | null

interface ProTreeTableNode<T extends Record<string, unknown>> {
  key: string
  data: T
  label?: string
  children?: ProTreeTableNode<T>[]
  leaf?: boolean
  loading?: boolean
  selectable?: boolean
}

interface ProTreeTableColumn<T extends Record<string, unknown>> {
  id: string
  field?: Extract<keyof T, string>
  title: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  pinned?: false | 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  valueEnum?: Record<string, unknown>
  render?: (params: { node: ProTreeTableNode<T>; row: T; column: ProTreeTableColumn<T> }) => unknown
}

interface ProTreeTableLazyLoadParams<T extends Record<string, unknown>> {
  node: ProTreeTableNode<T>
  key: string
  sort: SortState
  filter: FilterState
  expandedKeys: ProTreeTableExpandedKeys
  selectionKeys: ProTreeTableSelectionKeys
}

interface ProTreeTableLazyLoadResult<T extends Record<string, unknown>> {
  children: ProTreeTableNode<T>[]
}

interface ProTreeTableProps<T extends Record<string, unknown>> {
  nodes: ProTreeTableNode<T>[]
  columns: ProTreeTableColumn<T>[]
  loading?: boolean
  disabled?: boolean
  selectionMode?: ProTreeTableSelectionMode
  expandedKeys?: ProTreeTableExpandedKeys
  selectionKeys?: ProTreeTableSelectionKeys
  lazy?: boolean
  loadChildren?: (params: ProTreeTableLazyLoadParams<T>) => Promise<ProTreeTableLazyLoadResult<T>>
  sort?: SortState
  filter?: FilterState
  paginator?: boolean
  page?: number
  pageSize?: number
  total?: number
}
```

`SortState` and `FilterState` should reuse existing CCD table state concepts where the type boundary is compatible. The tree-specific request payload must not reuse `ProTableLoadParams`.

## Proposed Props

- `nodes`: controlled or externally provided `ProTreeTableNode<T>[]`.
- `columns`: `ProTreeTableColumn<T>[]`, initially a subset compatible with `ProTableColumn<T>`.
- `loading`: table-level loading state.
- `disabled`: disables interactive selection and expansion controls where supported.
- `selectionMode`: `false`, `single`, `multiple`, or `checkbox`.
- `expandedKeys`: controlled PrimeVue-style expansion map.
- `selectionKeys`: controlled PrimeVue-style selection map/value.
- `lazy`: enables lazy child loading behavior.
- `loadChildren`: tree-specific async child loader.
- `sort` and `filter`: controlled table state for future server integration.
- `paginator`, `page`, `pageSize`, and `total`: root-level pagination controls for the first server-facing path.

## Proposed Events

- `update:expandedKeys`: emitted when expansion state changes.
- `update:selectionKeys`: emitted when selection state changes.
- `node-expand`: emitted after a node expands.
- `node-collapse`: emitted after a node collapses.
- `node-select`: emitted when a selectable node is selected.
- `node-unselect`: emitted when a selectable node is unselected.
- `lazy-load`: emitted when a lazy node requires children.
- `lazy-load-error`: emitted when a lazy child loader rejects.
- `sort-change`: emitted when sort state changes.
- `filter-change`: emitted when filter state changes.
- `page-change`: emitted when root-level pagination changes.

Event payloads should expose CCD node wrappers and stable keys rather than leaking raw PrimeVue event objects as the public contract. Raw PrimeVue events may remain internal implementation details.

## Selection And Expansion Model

Expansion is controlled by `ProTreeTableExpandedKeys`, matching PrimeVue's object-map model.

Selection is controlled by `ProTreeTableSelectionKeys`. The wrapper should preserve PrimeVue-compatible shapes because checkbox selection needs partial-checked state, while single and multiple selection can remain key-oriented.

The first implementation should not attempt Shift-click range selection. Tree range selection is ambiguous across collapsed branches, filtered nodes, lazy children, and checkbox partial states, so it requires a separate design.

## Lazy Loading And Request Contract

Lazy loading must use a tree-specific contract:

```ts
type ProTreeTableLoadChildren<T extends Record<string, unknown>> = (
  params: ProTreeTableLazyLoadParams<T>
) => Promise<ProTreeTableLazyLoadResult<T>>
```

The loader receives the expanded node, stable key, current sort state, current filter state, expansion state, and selection state. It returns child nodes only. Root loading, root pagination, and server persistence remain separate concerns.

Do not overload `ProTableLoadParams`. Flat table request semantics cannot describe parent keys, child loading, partial selection, collapsed descendants, or root-versus-visible pagination without weakening the existing `ProTable` API.

Implementation note for P2-A4: the wrapper may keep loaded children in an internal transient clone for immediate rendering, but durable persistence remains caller-owned. Public success and failure events must use CCD-owned payloads such as `{ key, node, children }` and `{ key, node, error }`, not raw PrimeVue event objects.

## ProTableColumn Compatibility

`ProTreeTableColumn<T>` should begin as a subset of `ProTableColumn<T>`:

- `id`
- `field`
- `title`
- `width`
- `minWidth`
- `align`
- `pinned`
- `sortable`
- `filterable`
- `valueEnum`
- `render`

The first tree column should own the expander affordance. Node-aware render context can be added after the static wrapper proves the baseline behavior.

Column groups, footer groups, row editing metadata, virtual-grid-only fields, and ProTable-specific toolbar settings should not be included in the first API.

## Unsupported And Deferred Features

The following are explicitly deferred:

- `ProTable` `treeMode`.
- Shared headless hierarchical row engine.
- `VirtualGridRenderer` tree virtualization and tree virtual scrolling.
- Tree row editing.
- Shift-click tree range selection.
- Footer groups.
- Advanced tree group styling.
- Server persistence implementation.
- Real server adapters.
- TreeTable runtime filtering from `filterable`; P2-B1 documents the contract only.
- VNode or component column render output.
- Advanced column compatibility beyond the ADR-009 subset.
- URL synchronization for tree expansion and selection state.
- Column group parity with flat `ProTable`.
- Tree-aware export behavior.

## Accessibility Validation Plan

`ProTreeTable` should rely on PrimeVue `TreeTable` for the baseline treegrid semantics, then add CCD validation around the wrapper contract.

Future implementation gates should include:

- Keyboard smoke coverage for Tab, Shift+Tab, Enter, Space, and arrow-key navigation.
- Expansion and collapse state checks for screen-reader-visible state.
- Checkbox selection checks including partial selection state.
- Axe smoke checks on the demo route.
- Desktop and mobile screenshots for clipping, overlap, unreadable labels, and focus-ring visibility.
- Manual ARIA review before any custom editable tree cell work is approved.

## Test Plan

P2-A1 and later implementation slices should add focused tests before broad suite expansion:

- Unit tests for node normalization and stable key handling.
- Wrapper mount tests for expansion and selection `v-model` behavior.
- Event tests for node expand, collapse, select, unselect, lazy-load, sort, filter, and page events.
- Type tests or `vue-tsc` coverage for generic row data.
- Web-demo route smoke coverage with static local tree data.
- Accessibility smoke with Playwright plus axe when the demo route exists.
- Regression check confirming flat `ProTable` tests still pass after any package export or shared type change.

## Demo Route Plan

The first demo should be a new ProTreeTable showcase route, separate from existing ProTable routes.

Recommended initial shape:

- Route family: `/showcase/components/pro-tree-table/*` unless the showcase taxonomy is moved to a data-display family first.
- P2-A1 page: static local `TreeNode` data, one expander column, selection disabled by default or single selection only.
- No lazy loading in P2-A1.
- No editing or virtual scrolling.
- No server persistence.
- Utility copy should describe state, behavior, and scope, not marketing copy.
- Browser validation should use the existing Playwright route/screenshot conventions.

## Rollback Plan

P2-A0 rollback is documentation-only: remove this ADR and any index/log references added with it.

Future implementation rollback should remain additive and simple:

- Remove `ProTreeTable` files.
- Remove `ProTreeTable` exports.
- Remove web-demo routes, fixtures, and tests.
- Regenerate API reports only in the implementation slice that changed exports.
- Keep `ProTable.vue`, `VirtualGridRenderer.vue`, and the flat table engine untouched.

## Staged Roadmap

### Completed P2-A Baseline

- P2-A0: ADR-009 recorded the ProTreeTable API decision.
- P2-A1: Experimental static `ProTreeTable` wrapper and showcase route.
- P2-A2: Column compatibility baseline for the approved ADR-009 subset.
- P2-A3: Controlled expansion and selection contract.
- P2-A4: Tree-specific lazy `loadChildren` contract.
- P2-A5: ProTreeTable accessibility and E2E validation gates.
- P2-A6: Read-only decision gate.

### P2-A6 Decision Gate Result

P2-A6 compares three options:

| Option                          | Result   | Reason                                                                                                                |
| ------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| Continue `ProTreeTable` wrapper | Accepted | Best current balance: additive, isolated, testable, and already backed by a package README, unit tests, and E2E gate. |
| Extract headless hierarchy core | Deferred | Useful only after filtering, server, and selection semantics stabilize enough to justify shared engine work.          |
| Stop at P2-A wrapper            | Rejected | The wrapper has enough evidence to justify stabilization, but not production promotion.                               |

The accepted path is to continue `ProTreeTable` as an independent experimental wrapper and start P2-B stabilization. The rejected path remains `ProTable treeMode` for now.

### Current Supported Capability Baseline

The current experimental baseline supports:

- `nodes`, `columns`, `loading`, and `disabled`.
- `selectionMode`.
- Controlled `expandedKeys` and `selectionKeys` updates.
- `node-expand`, `node-collapse`, `node-select`, and `node-unselect` events.
- `lazy`, `loadChildren`, `lazy-load`, and `lazy-load-error`.
- One expander column, always the first configured column.
- Text cell output from field values and simple `valueEnum` label mapping.
- The ADR-009 column subset: `id`, `field`, `title`, `width`, `minWidth`, `align`, `pinned`, `sortable`, `filterable` as a typed but unwired flag, `valueEnum`, and text-only `render`.
- Route-level accessibility smoke for the experimental showcase route, including console/page-error smoke, axe smoke, treegrid marker checks, keyboard expansion, deterministic local lazy-load evidence, row selection evidence, and screenshot attachment.

This baseline remains experimental. It is a tested smoke baseline, not a production-readiness or full-accessibility claim.

## P2-B Stabilization Backlog

P2-B work must stay behind separate decision gates. P2-B0 is this documentation/status sync.

| Priority | Item                                     | Scope                                                                                      | Acceptance criteria                                                                                                                                                                                                                                                                                         |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2-B0    | Stabilization status sync and issue list | Docs/governance only.                                                                      | ADR-009 records P2-A closure, P2-A6 decision result, current supported capabilities, deferred scope, P2-B backlog, rollback, and validation gates. README status is synchronized without claiming production readiness. No runtime files, generated reports, dependencies, or flat `ProTable` files change. |
| P2-B1    | Filtering contract research/decision     | Completed docs-only decision for `filterable` and TreeTable filtering semantics.           | ADR-009 records the runtime boundary, option comparison, recommended future contract, local/server split, collapsed-descendant behavior, lazy-child behavior, relation to flat `FilterState`, and future runtime acceptance criteria. No runtime filtering is wired.                                        |
| P2-B2    | Server/lazy adapter contract design      | Design the server/lazy adapter contract without implementing real adapters.                | Specify root loading, child loading, error/retry shape, pagination ownership, child persistence ownership, and event payload ownership. Preserve `loadChildren` as the current local contract until a later task explicitly changes runtime.                                                                |
| P2-B3    | Visual polish and state inventory        | Token/state design for empty, loading, and error states.                                   | Produce a state inventory and acceptance checklist for tokenized empty/loading/error states. Any UI change must be a separate runtime task with screenshots and must not add editing, virtualization, filtering, or server behavior.                                                                        |
| P2-B4    | Selection/expansion edge-case audit      | Audit controlled state edge cases before adding new behavior.                              | Cover disabled mode, `node.selectable=false`, unknown keys, collapsed selected descendants, lazy children, checkbox partial state, duplicate key risks, and remount/transient-cache behavior. Output either docs-only findings or a test-only follow-up plan.                                               |
| P2-B5    | Accessibility hardening follow-up        | Required if P2-B3 changes UI states or interaction surfaces.                               | Re-run and extend keyboard, axe, screenshot, and manual ARIA checks for new states. Preserve the statement that accessibility is smoke-tested, not globally certified.                                                                                                                                      |
| P2-B6    | Experimental-versus-beta decision gate   | Decide whether to keep experimental status or promote to beta after B1-B5 evidence exists. | Record pass/fail status for B1-B5, unresolved API risks, required validation evidence, rollback path, and recommendation. Promotion to beta requires a separate docs decision and must not imply `ProTable` integration.                                                                                    |

## P2-B1 Filtering Contract Decision

P2-B1 is a docs-only decision gate. The current runtime remains unchanged:

- `ProTreeTableColumn.filterable` remains typed but unwired.
- `ProTreeTableProps` does not expose filter state, filter mode, or filter events.
- `ProTreeTable.vue` does not pass PrimeVue `filters`, `filterMode`, or `Column.filter`.
- The unit suite keeps the guard that `filterable: true` does not enable PrimeVue filters.
- `ProTreeTable` remains experimental.
- `ProTable treeMode` remains rejected.

### Filtering Research Findings

PrimeVue `TreeTable` has its own filtering model:

- Public docs expose `filters` and `filterMode` on `TreeTable`, with filter inputs supplied through `Column` filter templates.
- PrimeVue supports a `global` filter key and per-field filter entries.
- PrimeVue `filterMode` is `lenient` by default and also supports `strict`.
- In `lenient` mode, a matching parent includes its descendants without continuing to filter the full subtree.
- In `strict` mode, descendants continue to be filtered even when the parent matches.
- The installed PrimeVue 4.5.5 type surface defines `TreeTableFilterMetaData` as `{ value, matchMode }`, `TreeTableFilterMeta` as a keyed filter object, and a non-lazy `TreeTableFilterEvent.filteredValue`.
- PrimeVue local filtering is skipped when `lazy=true`; lazy tables return the supplied `value` and expect page/sort/filter information to be handled by the caller/server path.
- TreeTable row rendering still depends on `expandedKeys`. A descendant that survives filtering remains hidden under a collapsed ancestor unless the display expansion state reveals that ancestor.

The existing flat `ProTable` filter model is not directly reusable. `FilterState` is only:

```ts
interface FilterState {
  global: string
  columns: Record<string, unknown>
}
```

The flat filtering engine filters a flat row array. It has no parent/descendant semantics, no lazy-unloaded child semantics, and no tree expansion interaction. `ProTreeTable` may reuse the `global + columns` concept, but must not import or couple to the flat `FilterState`, `ProTableLoadParams`, or flat row filtering engine.

### Options Compared

| Option                                     | API clarity                                                                       | `filterable` compatibility                                                                       | Collapsed/descendant semantics                                                                  | Lazy/server implications                                                    | Accessibility and test burden                                                              | Rollback risk |
| ------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------- |
| A. Keep filtering deferred                 | Clearest current boundary.                                                        | Keeps the flag as eligibility metadata only.                                                     | No runtime semantics to explain beyond "not wired".                                             | No server contract needed now.                                              | No new UI or keyboard surface.                                                             | Lowest.       |
| B. Future local client tree filtering      | Clear if introduced behind explicit filter state and local mode.                  | `filterable` can decide which columns participate.                                               | Must define parent-match inclusion, descendant-match ancestor reveal, and clear/reset behavior. | Cannot search unloaded lazy children.                                       | Requires unit tests plus keyboard, focus, empty-state, and axe/screenshot checks.          | Medium.       |
| C. Future server/lazy filtering only       | Clear for remote data but too narrow for static local trees.                      | `filterable` becomes request metadata, not local UI behavior.                                    | Server must decide whether returned rows include ancestor context and matching descendants.     | Best fit for unloaded descendants, but requires a server/lazy adapter gate. | Requires loading/error/empty state and request ownership tests.                            | Medium.       |
| D. Future explicit local/server mode split | Best long-term contract because mode owns semantics instead of overloading flags. | `filterable` remains an eligibility flag; behavior comes from `filteringMode` and `filterState`. | Local mode can define deterministic reveal behavior while server mode delegates returned shape. | Server/lazy semantics can evolve in P2-B2 without forcing local filtering.  | Highest total surface, but testable in smaller local-first and server-contract follow-ups. | Medium-high.  |

### Recommendation

Keep the current runtime at Option A after P2-B1: `filterable` remains typed but unwired.

Adopt Option D as the documented future contract shape. Filtering must be introduced only through a separate runtime task, with an explicit mode split rather than making `filterable` itself turn on PrimeVue filtering.

The first possible runtime slice should be a narrow P2-B1R local filtering task after this decision. Server/lazy filtering remains behind P2-B2 server/lazy adapter design. P2-B1R and P2-B2 may share the same CCD-owned filter state shape, but neither should reuse flat `ProTableLoadParams` or the flat filtering engine.

### Proposed Future Contract

Future filtering should use CCD-owned state and events:

```ts
type ProTreeTableFilteringMode = false | 'local' | 'server'

type ProTreeTableFilterMatchMode =
  | 'contains'
  | 'startsWith'
  | 'equals'
  | 'in'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'dateIs'
  | 'dateBefore'
  | 'dateAfter'

interface ProTreeTableFilterRule {
  value: unknown
  matchMode?: ProTreeTableFilterMatchMode
}

interface ProTreeTableFilterState {
  global: string
  columns: Record<string, ProTreeTableFilterRule>
}

interface ProTreeTableFilterChangeEvent<T extends Record<string, unknown>> {
  mode: Exclude<ProTreeTableFilteringMode, false>
  filterState: ProTreeTableFilterState
  visibleNodes?: ProTreeTableNode<T>[]
}
```

Proposed future props and events, if a runtime task accepts them:

- `filteringMode?: ProTreeTableFilteringMode`.
- `filterState?: ProTreeTableFilterState`.
- `defaultFilterState?: ProTreeTableFilterState` only if an uncontrolled path is explicitly accepted.
- `update:filterState`.
- `filter-change` with a CCD-owned payload, not a raw PrimeVue event object.

`filterable` should mean only "this column may participate in future filtering." It must not independently create filter UI, pass `Column.filter`, or mutate data.

Local filtering semantics:

- Evaluate only currently loaded `nodes`.
- Default global and text column matching should be `contains`; any PrimeVue-backed runtime must set match modes explicitly instead of inheriting PrimeVue defaults.
- Exclude columns with `filterable === false`.
- A row matches when the row itself matches all active column filters and the global filter, or when a loaded descendant matches.
- A matching parent includes its loaded descendant subtree for context.
- A matching descendant reveals its ancestor chain.
- Filtering must not mutate caller-owned `expandedKeys`.
- To avoid hidden descendant matches, local filtering should derive a display-only expansion map for matched ancestor chains while filters are active. Clearing filters restores the caller-controlled expansion state.
- Local filtering must not fetch lazy children. Unloaded descendants are unknown and excluded from local matching.
- Clear/reset normalizes to `{ global: '', columns: {} }`, clears any display-only filter expansion, and emits one controlled update.

Server filtering semantics:

- Server mode does not filter the local tree in the component.
- The component emits CCD-owned filter state to the caller/adapter.
- The caller/server owns returned root nodes, ancestor context, matching descendants, totals if any, and unloaded-child semantics.
- Lazy child loading must receive current filter state only after the P2-B2 server/lazy adapter contract explicitly adds it.
- Server mode must not reuse `ProTableLoadParams`.

### Future P2-B1R Runtime Acceptance Criteria

A future local filtering implementation is acceptable only when it:

- Adds an explicit filtering mode and CCD-owned filter state.
- Keeps `filterable` as eligibility metadata rather than an activation switch.
- Covers self-match, parent-match, descendant-match, ancestor reveal, clear/reset, and collapsed-branch restore behavior with unit tests.
- Covers lazy-unloaded children as unknown in local mode.
- Keeps server mode as event-only unless P2-B2 has approved adapter semantics.
- Adds route-level accessibility checks if new filter UI, empty state, loading state, or focus movement is introduced.
- Leaves `ProTable.vue`, `VirtualGridRenderer.vue`, and the flat `TableController` untouched.
- Updates generated API reports only if the public export surface changes in that runtime task.

## Future Feature Decision Gates

The following features require separate decision records or explicitly scoped follow-up tasks before any runtime implementation:

- Filtering runtime implementation.
- Real server adapters.
- Editing.
- Virtualization.
- Tree range selection.
- Shared headless hierarchy engine.
- ProTable integration.

Until those gates pass, `ProTreeTable` must remain independent and experimental, and `ProTable treeMode` remains rejected.

## P2-B Rollback And Validation Gates

P2-B0 and P2-B1 rollback is documentation-only: revert the ADR-009 status/backlog/filtering-decision changes, the package README status note, and any index/log updates made with the same docs task.

Before any new runtime feature is approved, the implementing task must define rollback and run at least:

- `git diff --check`.
- Focused `ProTreeTable` unit tests for the changed contract.
- `mise exec -- pnpm wiki:validate` when wiki files change.
- `mise exec -- pnpm type-check` or the narrower repo-approved equivalent for public type changes.
- `mise exec -- pnpm lint:check` when source files change.
- ProTreeTable route E2E/accessibility checks when UI states or interactions change.
- Flat `ProTable` regression checks whenever shared package exports, table contracts, or table internals are touched.
- `mise exec -- pnpm api:report` only when public export surface changes.
- UI inventory generation/check only when route topology changes.

## Historical P2-A1 Acceptance Criteria

P2-A1 is acceptable only when:

- A minimal experimental `ProTreeTable` wrapper exists inside `@ccd/vue-ui`.
- The wrapper uses static local tree data in a web-demo route.
- No tree APIs are added to `ProTableProps`.
- `ProTable.vue` and `VirtualGridRenderer.vue` remain unchanged.
- No lazy loading, editing, virtual scrolling, range selection, footer groups, or server persistence is implemented.
- Generic node typing is preserved without introducing public `any`.
- The demo route has keyboard and screenshot smoke coverage or a documented blocker.
- Flat `ProTable` targeted tests still pass.
- API report changes, if exports are added in that future slice, are regenerated and reviewed in that slice only.

## Current Impact

This ADR creates the design boundary for future Tree table work. P2-B1 documents the filtering contract decision only. It does not change runtime behavior, public exports, generated API reports, dependencies, or ProTable implementation files.

## Related Pages

- [[vue-ui-role]]
- [[vue-primevue-adapter-role]]
- [[web-demo-role]]
- [[adr-007-runtime-stack-and-tooling-choices]]
