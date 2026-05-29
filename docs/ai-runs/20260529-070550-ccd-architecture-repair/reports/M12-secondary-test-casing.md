# M12 Secondary Test / Case-Sensitivity Report

## Scope

- Lane: M12 / `P3-Tests`, `P3-CaseSensitivity`, `P3-Verify`.
- Changes were limited to date utility export/import casing.
- No DateUtils behavior, directive runtime behavior, test framework config, Vite/dependency lane, or Login Diorama work was changed.

## Changes

- `apps/web-demo/src/utils/date/index.ts`
  - Added named aggregate export `DateUtils` from `./dateUtils`.
- `apps/web-demo/src/views/example/utils/http-advanced.vue`
  - Changed direct `@/utils/date/dateUtils` import to `@/utils/date`.
- `apps/web-demo/src/views/example/architecture/router-meta/keep-alive.vue`
  - Changed direct `@/utils/date/dateUtils` import to `@/utils/date`.

## Directive Spec Finding

Focused directive specs already call Vue 3 directive hooks with four arguments through helper tuples:

- `el`
- `binding`
- `vnode`
- `prevVNode`

No `@ts-expect-error`, `@ts-ignore`, or `expect-error` usage remained in the focused directive files.

Evidence:

- `command-logs/M12-T1-20260529-082430-directive-dateutils-noise-scan.log`

## Validation

- Focused directive Vitest: PASS, 8 files / 25 tests
  - `command-logs/M12-T1-20260529-082500-focused-directive-vitest.log`
- Web demo type-check: PASS
  - `command-logs/M12-T2-20260529-082520-web-demo-type-check.log`
- Web demo build: PASS
  - `command-logs/M12-T2-20260529-082535-pnpm-build-web-demo.log`
- Lint check: PASS with two existing `vue/one-component-per-file` warnings in `packages/vue-hooks/src/createAutoMittHook.spec.ts`
  - `command-logs/M12-T1-20260529-082555-pnpm-lint-check.log`
- `pnpm check`: PASS with the same two existing warnings
  - `command-logs/M12-T3-20260529-082620-pnpm-check.log`

## Residual Risk

- Existing lint warnings in `packages/vue-hooks/src/createAutoMittHook.spec.ts` remain outside this lane because the repair list scoped M12 to directive specs, import casing, and residual surface capture.
