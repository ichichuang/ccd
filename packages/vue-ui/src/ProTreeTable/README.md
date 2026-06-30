# ProTreeTable

Status: experimental, P2-A closed; P2-B stabilization planning is active.

`ProTreeTable` is an additive wrapper around PrimeVue `TreeTable` for tree-shaped data. It exists separately from `ProTable` so TreeTable semantics do not enter the flat ProTable row engine before ADR-009 follow-up gates.

## Roadmap / Stabilization Status

P2-A1 through P2-A6 are complete. P2-A6 keeps `ProTreeTable` as an independent
experimental wrapper and starts P2-B stabilization.

The P2-B backlog, acceptance criteria, rollback plan, and future feature gates live in
`wiki/canonical/decisions/adr-009-pro-tree-table-api-decision.md`.

P2-B1 records the filtering contract decision. `filterable` remains typed but unwired; it does not
enable PrimeVue TreeTable filters, filter UI, local data filtering, or server requests.

P2-B2 records the server/lazy adapter contract decision. The current `loadChildren` contract remains
the local child-loading path; real root/server adapters, retry UI, URL/state persistence, and public
server-mode props/events remain deferred.

P2-B3 records the visual state inventory and polish contract. It defines future empty, loading,
lazy-loading, lazy-error, disabled, selection, responsive, focus, and deferred-scope acceptance
criteria without implementing runtime visual polish.

This README does not approve production readiness or new runtime behavior. Filtering, real server
adapters, editing, virtualization, tree range selection, a shared headless hierarchy engine, and
`ProTable` integration each require a separate decision gate before implementation.

## Supported Baseline

- `nodes`, `columns`, `loading`, `disabled`
- `selectionMode`
- `expandedKeys` with `update:expandedKeys`
- `selectionKeys` with `update:selectionKeys`
- `node-expand`, `node-collapse`, `node-select`, `node-unselect`
- `lazy`, `loadChildren`
- `lazy-load`, `lazy-load-error`
- one expander column, always the first configured column
- text cell output from field values, with simple `valueEnum` label mapping

## P2-A5 Validation Gates

P2-A5 adds validation infrastructure for the experimental showcase route. It does not expand the
runtime feature set.

The route-level Playwright gate covers:

- `/showcase/components/pro-tree-table/overview` render smoke.
- client-side console and page error smoke.
- axe smoke on the ProTreeTable demo region.
- a visible PrimeVue `treegrid` with wrapper experimental markers.
- keyboard row focus plus `ArrowRight` expansion of the lazy demo node.
- deterministic local lazy-load evidence for loaded children.
- row selection evidence after keyboard activation.
- deferred-scope copy that keeps unsupported features visible.
- screenshot evidence attached to the Playwright run.

The wrapper also exposes baseline accessibility metadata for the tested route: a TreeTable
`aria-label` and labels for the expander toggle buttons. This is a tested smoke baseline only, not a
claim that ProTreeTable is fully accessible for all future TreeTable configurations.

## Controlled Expansion

`expandedKeys` is a `Record<string, boolean>` map. `update:expandedKeys` emits a normalized
truthy-only map:

- falsey update payloads emit `{}`.
- entries with `false`, `0`, `null`, or `undefined` are removed.
- emitted values are always `{ [key]: true }` for expanded nodes.

`node-expand` and `node-collapse` emit CCD-owned payloads shaped as `{ key, node }`. Raw PrimeVue
event objects are not part of the public event contract, and events for unknown keys are ignored.

## Controlled Selection

`selectionMode` controls the public `update:selectionKeys` value shape:

| `selectionMode` | Emitted `selectionKeys` shape                                                | Notes                                                    |
| --------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------- |
| `false`         | no interactive selection updates                                             | The wrapper passes no PrimeVue selection mode.           |
| `single`        | `string \| null`                                                             | Selected key or `null` when no selected entry remains.   |
| `multiple`      | `string[]`                                                                   | Stable key array; false entries are removed.             |
| `checkbox`      | `Record<string, boolean \| { checked?: boolean; partialChecked?: boolean }>` | Preserves checkbox `checked` and `partialChecked` state. |

`disabled=true` suppresses PrimeVue interactive selection mode and ignores selection update events.
`node.selectable=false` is passed through to the underlying PrimeVue `TreeNode`; the wrapper does
not synthesize selection for non-selectable nodes.

`node-select` and `node-unselect` emit only CCD-owned `{ key, node }` payloads for known nodes.

## Lazy Loading

Lazy loading uses a tree-specific contract and intentionally does not reuse `ProTableLoadParams`.

```ts
type ProTreeTableLoadChildren<T extends Record<string, unknown>> = (
  params: ProTreeTableLazyLoadParams<T>
) => Promise<ProTreeTableLazyLoadResult<T>>
```

`ProTreeTableLazyLoadParams<T>` contains:

- `key`: the expanded node key.
- `node`: the known `ProTreeTableNode<T>`.
- `expandedKeys`: normalized current expansion state.
- `selectionKeys`: current selection state in the P2-A3 public shape.

`ProTreeTableLazyLoadResult<T>` returns child nodes only:

```ts
interface ProTreeTableLazyLoadResult<T extends Record<string, unknown>> {
  children: ProTreeTableNode<T>[]
}
```

When `lazy=false`, `loadChildren` is never called. When `lazy=true`, the wrapper calls
`loadChildren` only for a known expanded node whose `children` are absent, `leaf` is not `true`,
and the node has not already been loaded by the wrapper.

Loaded children are held in an internal transient clone so the row can render immediately without
mutating the caller's `nodes` array. Consumers that need durable state or server persistence should
listen to `lazy-load` and update their own `nodes` source. Remounting the component or changing node
identity may clear the transient cache; long-term persistence is application-owned.

During a pending load, the wrapper passes `loading=true` on the target PrimeVue `TreeNode` while
preserving any caller-provided `node.loading` state.

`lazy-load` emits `{ key, node, children }`. `lazy-load-error` emits `{ key, node, error }` and
does not throw through the component event handler. Both events are CCD-owned payloads; raw PrimeVue
event objects are not public API.

## Filtering Status

Filtering is a documented future contract, not a runtime feature in the current experimental
baseline.

- `filterable` remains an eligibility flag only.
- The wrapper does not expose `filterState`, filtering mode, or filter events.
- The wrapper does not pass PrimeVue `filters`, `filterMode`, or `Column.filter`.
- Future local filtering requires a separate P2-B1R runtime task.
- Future server/lazy filtering remains behind the P2-B2 server/lazy adapter decision.
- Any future filtering task must preserve caller-owned `expandedKeys` and define descendant,
  collapsed-branch, lazy-unloaded-child, clear/reset, and accessibility behavior before runtime
  wiring.

## Server / Lazy Adapter Status

P2-B2 is a documented future contract, not a runtime feature in the current experimental baseline.

- Current `lazy` and `loadChildren` stay unchanged as the local child-loading contract.
- `loadChildren` must not be overloaded into root loading or a full server adapter.
- Future root/server loading should use a separate tree-specific `treeDataSource` or `treeRequest`
  adapter with explicit root and child load scopes.
- Future server requests may include the P2-B1 tree filter state only after filtering runtime is
  explicitly approved.
- Future pagination is root-only by default; child-level pagination, cursors, and URL/state
  persistence remain deferred.
- Durable root and child node persistence remains caller/adapter-owned. The wrapper owns only
  documented transient loading/error/rendering state.
- Future public events must remain CCD-owned payloads and must not expose raw PrimeVue events.
- `ProTableLoadParams` remains rejected for tree server/lazy contracts because it is a flat-row
  request payload and cannot represent root-versus-child loading, parent keys, expansion/selection
  snapshots, child persistence, or node-key-scoped stale response handling.

## Visual State Status

P2-B3 is a documented future visual contract, not a runtime polish implementation.

- Current empty rendering remains PrimeVue/default TreeTable behavior unless the caller wraps it.
- Current table-level `loading` and node-level lazy loading stay as the existing PrimeVue passthrough
  and transient `TreeNode.loading` behavior.
- Current lazy errors remain event-only through `lazy-load-error`; no retry UI or visible row-level
  error state is added.
- Current disabled behavior suppresses interactive selection updates; no new visual disabled state is
  added.
- The overview route keeps local evidence cards for expanded keys, selection, lazy-load counts, loaded
  children, and last event.
- Any future visual polish must run screenshot, route E2E, keyboard, and accessibility validation, and
  must keep `ProTreeTable` experimental unless a later promotion decision says otherwise.

## Column Compatibility

`ProTreeTableColumn<T>` intentionally implements only the ADR-009 approved subset:

| Column field | Status               | Notes                                                                                                                                                          |
| ------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | Supported            | Used as the stable Vue key.                                                                                                                                    |
| `field`      | Supported            | Reads text values from `ProTreeTableNode.data`.                                                                                                                |
| `title`      | Supported            | Passed to PrimeVue `Column.header`.                                                                                                                            |
| `width`      | Supported            | `number` values become px strings; non-empty strings pass through.                                                                                             |
| `minWidth`   | Supported            | `number` values become px strings; non-empty strings pass through.                                                                                             |
| `align`      | Supported            | Maps to static `text-left`, `text-center`, or `text-right` header/body classes.                                                                                |
| `pinned`     | Supported            | Maps to PrimeVue `frozen` / `alignFrozen`; any pinned column enables TreeTable scrolling.                                                                      |
| `sortable`   | Supported            | Boolean passthrough to PrimeVue `Column.sortable`.                                                                                                             |
| `valueEnum`  | Supported            | Text-only labels from strings or `{ label }` entries.                                                                                                          |
| `render`     | Supported, text-only | Callback may return `string`, `number`, `null`, or `undefined`; VNode/component render output is deferred because this wrapper must not use Vue `h()` helpers. |
| `filterable` | Deferred             | P2-B1 keeps this as typed-but-unwired eligibility metadata. It does not enable PrimeVue filters, local filtering, or server/lazy filtering.                    |

## Deferred

- editing
- virtual scrolling
- Shift-click tree range selection
- ProTable `treeMode`
- shared headless hierarchical row engine
- VNode/component column render output
- TreeTable filtering from `filterable`
- advanced column compatibility beyond the ADR-009 subset
- server persistence
- real server request adapters and URL/state persistence

The public type sketches are implemented locally in `types.ts` and exported through the package root only as the experimental component API. They are not ProTable props and must not be added to `ProTable.vue`.
