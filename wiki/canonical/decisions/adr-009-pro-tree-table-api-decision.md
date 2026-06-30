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
- TreeTable filtering from `filterable`.
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
| P2-B1    | Filtering contract research/decision     | Research or docs-only decision for `filterable` and TreeTable filtering semantics.         | Document whether filtering remains deferred, maps to a tree-specific state shape, or needs a future server contract. Compare visible-node, descendant, collapsed-node, and lazy-child behavior. Do not wire runtime filtering.                                                                              |
| P2-B2    | Server/lazy adapter contract design      | Design the server/lazy adapter contract without implementing real adapters.                | Specify root loading, child loading, error/retry shape, pagination ownership, child persistence ownership, and event payload ownership. Preserve `loadChildren` as the current local contract until a later task explicitly changes runtime.                                                                |
| P2-B3    | Visual polish and state inventory        | Token/state design for empty, loading, and error states.                                   | Produce a state inventory and acceptance checklist for tokenized empty/loading/error states. Any UI change must be a separate runtime task with screenshots and must not add editing, virtualization, filtering, or server behavior.                                                                        |
| P2-B4    | Selection/expansion edge-case audit      | Audit controlled state edge cases before adding new behavior.                              | Cover disabled mode, `node.selectable=false`, unknown keys, collapsed selected descendants, lazy children, checkbox partial state, duplicate key risks, and remount/transient-cache behavior. Output either docs-only findings or a test-only follow-up plan.                                               |
| P2-B5    | Accessibility hardening follow-up        | Required if P2-B3 changes UI states or interaction surfaces.                               | Re-run and extend keyboard, axe, screenshot, and manual ARIA checks for new states. Preserve the statement that accessibility is smoke-tested, not globally certified.                                                                                                                                      |
| P2-B6    | Experimental-versus-beta decision gate   | Decide whether to keep experimental status or promote to beta after B1-B5 evidence exists. | Record pass/fail status for B1-B5, unresolved API risks, required validation evidence, rollback path, and recommendation. Promotion to beta requires a separate docs decision and must not imply `ProTable` integration.                                                                                    |

## Future Feature Decision Gates

The following features require separate decision records or explicitly scoped follow-up tasks before any runtime implementation:

- Filtering.
- Real server adapters.
- Editing.
- Virtualization.
- Tree range selection.
- Shared headless hierarchy engine.
- ProTable integration.

Until those gates pass, `ProTreeTable` must remain independent and experimental, and `ProTable treeMode` remains rejected.

## P2-B Rollback And Validation Gates

P2-B0 rollback is documentation-only: revert the ADR-009 status/backlog changes, the package README status note, and any index/log updates made with the same docs task.

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

This ADR creates the design boundary for future Tree table work. It does not change runtime behavior, public exports, generated API reports, dependencies, or ProTable implementation files.

## Related Pages

- [[vue-ui-role]]
- [[vue-primevue-adapter-role]]
- [[web-demo-role]]
- [[adr-007-runtime-stack-and-tooling-choices]]
