# D-020 Validation Summary

## Passed

- `git fetch origin main`
- `test ! -e .cursor`
- `test ! -e CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md`
- `git diff --check`
- `pnpm docs:commands`
- `pnpm project:doctor`
- `pnpm ai:doctor`
- `pnpm ai:doctor --open` - 78 open tasks
- `pnpm codex:preflight`
- `pnpm arch:runtime`
- `pnpm arch:boundaries`
- `pnpm api:report`
- `pnpm ai:guard -- --format=json` - `{ ok: true, findings: [] }`
- `pnpm validate:governance`
- `pnpm --filter @ccd/vue-primevue-adapter build`
- `pnpm --filter @ccd/vue-ui test`
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm --filter @ccd/web-demo test` - 48 files, 339 tests
- `pnpm type-check`
- `pnpm test:run` - 81 files, 458 tests
- `pnpm build:web-demo`
- `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts`
- `git diff --exit-code -- apps/web-demo/src/types/auto-imports.d.ts`
- `pnpm build:desktop`
- `git status --short --branch --untracked-files=all`

## Fixed During Lane

- Initial adapter build failed because a test fixture used a raw string for `sizeName`; the fixture was corrected to the typed size source shape and the adapter build passed afterward.
- After report creation, `git diff --check`, `pnpm docs:commands`, `pnpm ai:guard -- --format=json`, and `pnpm validate:governance` were re-run and passed.

## Logs

- Command logs are under `docs/ai-runs/20260601-203728-ccd-full-remediation-d020-primevue-bootstrap/command-logs/`.
