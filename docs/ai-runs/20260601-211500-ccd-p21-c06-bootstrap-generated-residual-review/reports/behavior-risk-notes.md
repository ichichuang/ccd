# Behavior Risk Notes (P21)

## R1 — Desktop plugin install

- **Risk:** Breaking `app.use(PrimeVue, createPrimeVueAdapterConfig({ sizeSource }))` breaks themed controls and ripple across desktop.
- **Mitigation if ever migrated:** Adapter-owned `installPrimeVueRuntime` must call identical config + `installPrimeVueServices`; desktop smoke on `DesktopHome`.

## R2 — Build-time PrimeVueResolver

- **Risk:** Changing resolver changes which components are auto-imported in SFC templates → bundle size and runtime component resolution drift.
- **Mitigation:** Byte-compare generated `components.d.ts` and production chunk graph; run `scripts/drift-check.mjs` expectations.

## R3 — AppPrimeVueGlobals

- **Risk:** Six Toast position groups (`tl`–`br`), `window.$toast` / `window.$message`, locale sync via `applyPrimeVueLocale`, route-fullPath dialog `closeAll`.
- **Mitigation:** Any wrapper must preserve group IDs, mount timing (`onMounted`), and global CSS in `<style lang="scss">` (PT cannot replace `:not()` selectors per file comment).

## R4 — Web `setupPrimeVue`

- **Risk:** Initial locale from store, `PRIME_DIALOG_RUNTIME_CONFIG_KEY` provide (`translate`, draggable predicate).
- **Mitigation:** Keep provide in app plugin module even if `PrimeVue` import moves to adapter.

## R5 — Generated `components.d.ts`

- **Risk:** Type-only drift breaks `vue-tsc` for template global components.
- **Mitigation:** Regenerate only via `unplugin-vue-components` / `build:web-demo`; never hand-edit.

## Showcase (out of scope)

- `primevue-collection/**` remains D-017 Option D owner-accepted residual; no P21 change.
