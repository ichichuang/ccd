# ProTreeTable

Status: experimental, P2-A2 column compatibility baseline.

`ProTreeTable` is an additive wrapper around PrimeVue `TreeTable` for static local tree data. It exists separately from `ProTable` so TreeTable semantics do not enter the flat ProTable row engine before ADR-009 follow-up gates.

## Supported in P2-A2

- `nodes`, `columns`, `loading`, `disabled`
- `selectionMode`
- `expandedKeys` with `update:expandedKeys`
- `selectionKeys` with `update:selectionKeys`
- `node-expand`, `node-collapse`, `node-select`, `node-unselect`
- one expander column, always the first configured column
- text cell output from field values, with simple `valueEnum` label mapping

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
