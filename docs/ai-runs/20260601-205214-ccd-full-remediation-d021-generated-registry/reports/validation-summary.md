# D-021 Validation Summary

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
- `pnpm drift-check`
- `pnpm arch:runtime`
- `pnpm arch:boundaries`
- `pnpm api:report`
- `pnpm ai:guard -- --format=json` - `{ ok: true, findings: [] }`
- `pnpm validate:governance`
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm --filter @ccd/web-demo test` - 48 files, 339 tests
- `pnpm type-check`
- `pnpm test:run` - 81 files, 458 tests
- `pnpm build:web-demo` before boundary change
- `pnpm ai:guard -- --format=json` after boundary change
- `pnpm drift-check` after boundary change
- `pnpm build:web-demo` after boundary change
- `pnpm build:web-demo` final validation
- `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts`
- `git diff --exit-code -- apps/web-demo/src/types/components.d.ts apps/web-demo/src/types/auto-imports.d.ts`
- `pnpm build:desktop`
- `git status --short --branch --untracked-files=all`

## Generator Evidence

- `components.d.ts` hash before baseline build: `267ca63692c4e94bf2c747bec08163f32ac6217a23a559bc5f1bfa53e0c975f3`
- `components.d.ts` hash after baseline build: `267ca63692c4e94bf2c747bec08163f32ac6217a23a559bc5f1bfa53e0c975f3`
- `components.d.ts` hash before boundary build: `267ca63692c4e94bf2c747bec08163f32ac6217a23a559bc5f1bfa53e0c975f3`
- `components.d.ts` hash after boundary build: `267ca63692c4e94bf2c747bec08163f32ac6217a23a559bc5f1bfa53e0c975f3`

## Logs

- Command logs are under `docs/ai-runs/20260601-205214-ccd-full-remediation-d021-generated-registry/command-logs/`.
