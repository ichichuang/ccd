# M5 UI / PrimeVue Review

## Decision

Status: `NOT_APPLICABLE`.

M5 found no production app UI or PrimeVue wrapper source that is eligible for
migration under the current plan.

## Evidence

The app direct PrimeVue import search found only:

- `apps/web-demo/build/resolvers/primevue.ts`
- `apps/web-demo/src/types/components.d.ts`
- `apps/web-demo/package.json`

These are build dependency, generated registry, and app dependency manifest
surfaces. They are not production app UI source files.

## Package owner posture

- `@ccd/vue-ui` already owns CCD UI wrappers, ProForm, ProTable, PrimeDialog,
  and governed PrimeVue wrapper components.
- `@ccd/vue-primevue-adapter` already owns PrimeVue runtime install, PT
  presets, services, locale helpers, global message APIs, tooltip directive,
  and typed PrimeVue adapter facades.
- App hook/UI facades such as `useDialog` and ProTable URL sync remain app-owned
  because they inject app i18n/router policy.

## Generated registry posture

- `apps/web-demo/src/types/components.d.ts` remains generated-owned.
- It was not manually edited in M5.
- `pnpm build:web-demo` produced a formatting-only `auto-imports.d.ts` diff.
  The diff was recorded and normalized with the final-matrix command
  `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts`.
  Post-prettier diff was empty.

## Outcome

No source migration was performed. M5 validates that UI/PrimeVue residual app
surfaces are package-owned, generated-owned, or build-owned as previously
classified.
