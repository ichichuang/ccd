# Resolver And Generated Registry Map

## Resolver Chain

1. `apps/web-demo/build/plugins.ts` configures `unplugin-vue-components`.
2. `Components({ resolvers: [...] })` now calls `createPrimeVueComponentResolver()`.
3. `apps/web-demo/build/resolvers/primevue.ts` owns the direct `PrimeVueResolver()` call.
4. The resolver produces runtime imports and type entries for PrimeVue components used by templates.

## Generated Registry

- File: `apps/web-demo/src/types/components.d.ts`
- Owner: `unplugin-vue-components`
- Generation command validated in this lane: `pnpm build:web-demo`
- Hash before boundary build: `267ca63692c4e94bf2c747bec08163f32ac6217a23a559bc5f1bfa53e0c975f3`
- Hash after boundary build: `267ca63692c4e94bf2c747bec08163f32ac6217a23a559bc5f1bfa53e0c975f3`

## Classification

- Build resolver direct PrimeVue import is allowed only in `apps/web-demo/build/resolvers/primevue.ts`.
- `components.d.ts` direct `primevue/*` type imports are allowed only when the generated header is present.
- Neither file remains in the exact app allowlist.
