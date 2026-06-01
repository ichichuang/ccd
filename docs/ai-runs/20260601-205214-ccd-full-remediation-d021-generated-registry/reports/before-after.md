# D-021 Before And After

## Before

- `apps/web-demo/build/plugins.ts` directly imported `PrimeVueResolver` from `@primevue/auto-import-resolver`.
- `apps/web-demo/src/types/components.d.ts` was handled as an exact app allowlist row even though it is generated.
- PrimeVue exact allowlist count: 3.

## After

- `apps/web-demo/build/plugins.ts` imports only `createPrimeVueComponentResolver()` from local build tooling.
- `apps/web-demo/build/resolvers/primevue.ts` centralizes the direct `PrimeVueResolver()` call.
- `scripts/drift-check.mjs` enforces that the resolver boundary exists and calls `PrimeVueResolver()`.
- `scripts/ai-architecture-guard.mjs` classifies the generated component registry by generator header.
- PrimeVue exact allowlist count: 1.

## Behavior Preservation

- PrimeVue auto-registration remains enabled.
- `components.d.ts` stayed byte-stable by hash across `pnpm build:web-demo`.
- Build output completed with the same known router dynamic/static import warning.
