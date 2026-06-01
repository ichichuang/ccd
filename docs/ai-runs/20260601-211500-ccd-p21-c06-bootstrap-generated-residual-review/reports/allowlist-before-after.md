# Allowlist Before / After (P21)

| Metric | Before P21 | After P21 |
| --- | ---: | ---: |
| Exact allowlist rows (`approvedPrimeVueAppImportFiles`) | 5 | 5 |
| Showcase exception paths | 1 (`primevue-collection/**`) | 1 (unchanged) |
| Guard allowlist rows removed | 0 | 0 |
| Runtime source files changed | 0 | 0 |

## Exact rows (unchanged)

1. `apps/desktop/src/plugins/index.ts`
2. `apps/web-demo/build/plugins.ts`
3. `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
4. `apps/web-demo/src/plugins/modules/primevue.ts`
5. `apps/web-demo/src/types/components.d.ts`

## Evidence

- `scripts/ai-architecture-guard.mjs` `approvedPrimeVueAppImportFiles` Set (lines 139–145)
- `pnpm ai:guard -- --format=json` → `ok: true`, `findings: []`
