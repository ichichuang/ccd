# D-024 Validation Summary

## Passed

- `git fetch origin main`
- `test ! -e .cursor`
- `test ! -e CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md`
- `pnpm --filter @ccd/vue-primevue-adapter test`
- `pnpm --filter @ccd/vue-primevue-adapter build`
- `pnpm --filter @ccd/vue-ui test` after adding PrimeVue test config injection
- `pnpm --filter @ccd/vue-ui build`
- `pnpm exec eslint --fix --no-warn-ignored ...changed files`
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm ai:guard -- --format=json`
- `pnpm --filter @ccd/web-demo test` - 48 files, 339 tests
- `pnpm build:web-demo`
- `pnpm api:report`
- `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts`
- `git diff --exit-code -- apps/web-demo/src/types/auto-imports.d.ts`
- `pnpm docs:commands`
- `pnpm project:doctor`
- `pnpm ai:doctor`
- `pnpm ai:doctor --open` (still reports 78 open tasks for D-023)
- `pnpm codex:preflight`
- `pnpm ci:prepare-internal`
- `pnpm ci:smoke:packages`
- `pnpm arch:runtime`
- `pnpm arch:boundaries`
- `pnpm api:report`
- `pnpm ai:guard -- --format=json`
- `pnpm validate:governance`
- `pnpm --filter @ccd/vue-ui type-check` after test fixture typing fix
- `pnpm type-check` after test fixture typing fix
- `pnpm test:run`
- `pnpm --filter @ccd/web-demo test`
- `pnpm build:web-demo`
- `pnpm build:desktop`
- `pnpm drift-check`
- Direct import inventory after migration: zero direct PrimeVue imports under
  `primevue-collection/**`.
- Local Playwright smoke: overview rendered, ConfirmPopup appeared through the adapter
  confirm facade, ProForm advanced rendered with wrapper-backed inputs/buttons/selects,
  and browser console/page errors were empty.

## Generated Output

- `apps/web-demo/src/types/components.d.ts` changed by the owning web-demo build:
  `ConfirmPopup` left the auto component registry after the page switched to the adapter
  facade.
- `docs/generated/api-surface-report.{md,json}` changed by `pnpm api:report` for
  `CcdInputText`, `PrimeVueConfirmOptions`, `PrimeVueConfirmService`, and
  `usePrimeVueConfirmService`.

## Notes

- Initial `@ccd/vue-ui` test run failed because bare jsdom lacked `$primevue.config`
  for `InputText`; the spec now injects the minimal PrimeVue config and the package test
  passes.
- Initial root `pnpm type-check` failed because the `$primevue` test fixture needed an
  explicit `ComponentCustomProperties` cast under the repo's Vue global type
  augmentation; the fixture was narrowed in the spec and both package/root type checks
  pass.
- One strict Playwright text wait was too narrow for the ProForm page; the follow-up
  route diagnostic confirmed the expected route, rendered text, component counts, and
  screenshot.
- A remote baseline check initially compared against a mistyped full hash from the
  running summary; the corrected evidence uses the stable short hash `6132c9c9` and
  confirms `origin/main` has not unexpectedly diverged.
