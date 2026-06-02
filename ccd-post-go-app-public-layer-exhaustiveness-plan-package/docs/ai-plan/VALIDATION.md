# VALIDATION

## Baseline validation

Run:

- `git diff --check`
- `pnpm docs:commands`
- `pnpm ai:doctor`
- `pnpm ai:doctor --open`
- `pnpm ai:guard -- --format=json`
- `pnpm validate:governance`

## Per-milestone validation

Each milestone must run:

- `git diff --check`
- `pnpm docs:commands`
- scoped tests for touched packages/apps
- `pnpm ai:guard -- --format=json` if PrimeVue/UI/app boundary changes occur
- `pnpm validate:governance` if policies/docs/generated/API surfaces change

## Final validation matrix

- `git diff --check`
- `pnpm docs:commands`
- `pnpm project:doctor`
- `pnpm ai:doctor`
- `pnpm ai:doctor --open`
- `pnpm codex:preflight`
- `pnpm ci:prepare-internal`
- `pnpm ci:smoke:packages`
- `pnpm arch:runtime`
- `pnpm arch:boundaries`
- `pnpm api:report`
- `pnpm ai:guard -- --format=json`
- `pnpm validate:governance`
- `pnpm type-check`
- `pnpm test:run`
- `pnpm --filter @ccd/web-demo test`
- `pnpm build:web-demo`
- `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts`
- `git diff -- apps/web-demo/src/types/auto-imports.d.ts`
- `pnpm build:desktop`
- `pnpm drift-check`

## Failure handling

If validation fails:

1. Stop.
2. Record failing command and log path.
3. Do not expand scope.
4. Do not push.
5. Fix only if root cause is within current lane.
