# ProTreeTable

Status: experimental, P2-A1 baseline.

`ProTreeTable` is an additive wrapper around PrimeVue `TreeTable` for static local tree data. It exists separately from `ProTable` so TreeTable semantics do not enter the flat ProTable row engine before ADR-009 follow-up gates.

## Supported in P2-A1

- `nodes`, `columns`, `loading`, `disabled`
- `selectionMode`
- `expandedKeys` with `update:expandedKeys`
- `selectionKeys` with `update:selectionKeys`
- `node-expand`, `node-collapse`, `node-select`, `node-unselect`
- one expander column, always the first configured column
- text cell output from field values, with simple `valueEnum` label mapping

## Deferred

- lazy loading and request adapters
- editing
- virtual scrolling
- Shift-click tree range selection
- ProTable `treeMode`
- shared headless hierarchical row engine
- advanced column compatibility
- server persistence

The public type sketches are implemented locally in `types.ts` and exported through the package root only as the experimental component API. They are not ProTable props and must not be added to `ProTable.vue`.
