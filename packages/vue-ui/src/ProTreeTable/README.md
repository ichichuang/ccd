# ProTreeTable

Status: experimental, P2-A3 controlled expansion and selection baseline.

`ProTreeTable` is an additive wrapper around PrimeVue `TreeTable` for static local tree data. It exists separately from `ProTable` so TreeTable semantics do not enter the flat ProTable row engine before ADR-009 follow-up gates.

## Supported in P2-A3

- `nodes`, `columns`, `loading`, `disabled`
- `selectionMode`
- `expandedKeys` with `update:expandedKeys`
- `selectionKeys` with `update:selectionKeys`
- `node-expand`, `node-collapse`, `node-select`, `node-unselect`
- one expander column, always the first configured column
- text cell output from field values, with simple `valueEnum` label mapping

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

- lazy loading and request adapters
- editing
- virtual scrolling
- Shift-click tree range selection
- ProTable `treeMode`
- shared headless hierarchical row engine
- VNode/component column render output
- TreeTable filtering from `filterable`
- advanced column compatibility beyond the ADR-009 subset
- server persistence

The public type sketches are implemented locally in `types.ts` and exported through the package root only as the experimental component API. They are not ProTable props and must not be added to `ProTable.vue`.
