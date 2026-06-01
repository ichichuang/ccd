# Behavior Risk Notes — P20

## Selected migration: use-app-element-size.vue → CcdTag

### Why this row was deferred in P19

P19 inventory noted no `CcdTag` wrapper existed; creating one was deferred to keep that lane to one minimal swap (`CcdTieredMenu`).

### Why P20 proceeds

- `createCcdPrimeControl` in `packages/vue-ui/src/CcdPrimeControls/index.ts` is an established, tested pattern for thin PrimeVue passthrough wrappers.
- `Tag` has no imperative ref API (no `toggle`/`show`/`hide` forwarding required).
- Props used in the example page are limited to `value` and `severity` — both forwarded via attrs passthrough.
- TSX render function requires explicit import (PrimeVueResolver auto-import does not apply to JSX); migrating the import removes the guard violation without changing visual output.
- Template `<Tag>` instances were also switched to `<CcdTag>` to avoid mixed governed/raw usage within the same file.

### Preserved behavior

- Tag severity values: `secondary`, `info` (unchanged).
- Dynamic value strings for width/height/callbackCount/mode/delay (unchanged).
- PrimeVue Tag CSS classes (`.p-tag`) still rendered via underlying component.

### Residual risk

- None observed in validation. Wrapper is attrs/slots passthrough only.

### Rows not migrated (expected residual)

- R1–R5 remain owner-accepted bootstrap/generated debt per decision rules 2–3.
