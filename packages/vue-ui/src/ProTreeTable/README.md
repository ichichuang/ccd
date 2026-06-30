# ProTreeTable

Status: experimental, P2-A5 accessibility and E2E validation gate baseline.

`ProTreeTable` is an additive wrapper around PrimeVue `TreeTable` for tree-shaped data. It exists separately from `ProTable` so TreeTable semantics do not enter the flat ProTable row engine before ADR-009 follow-up gates.

## Supported in P2-A4

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
| `filterable` | Deferred             | The flag remains typed for compatibility, but TreeTable filter state, filter UI, and server/lazy filtering semantics are not wired in P2-A2.                   |

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
