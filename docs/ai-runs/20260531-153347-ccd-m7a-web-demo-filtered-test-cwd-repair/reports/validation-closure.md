# M7a Validation Closure

## Before

`pnpm --filter @ccd/web-demo test` failed with:

- failing spec: `apps/web-demo/src/utils/http/requestLayer.spec.ts`
- failing test: `auth bridge and coupling boundaries > keeps HTTP, adapter, and API source files decoupled from router, store, and session storage`
- failing path: `/Users/cc/MyPorject/ccd/apps/web-demo/apps/web-demo/src/utils/http`
- log: `command-logs/010-reproduce-pnpm-filter-web-demo-test.log`

## After

| command | log | result |
|---|---|---|
| `pnpm exec vitest run apps/web-demo/src/utils/http/requestLayer.spec.ts` | `command-logs/020-focused-request-layer-root.log` | pass, exit 0 |
| `pnpm --filter @ccd/web-demo test` | `command-logs/021-pnpm-filter-web-demo-test-after.log` | pass, exit 0; 45 files / 329 tests |
| `pnpm test:run` | `command-logs/030-pnpm-test-run.log` | pass, exit 0; 74 files / 429 tests |
| `pnpm type-check` | `command-logs/031-pnpm-type-check.log` | pass, exit 0 |
| `git diff --check` | `command-logs/032-git-diff-check.log` | pass, exit 0 |
| `pnpm docs:commands` | `command-logs/033-pnpm-docs-commands.log` | pass, exit 0 |
| `pnpm project:doctor` | `command-logs/034-pnpm-project-doctor.log` | pass, exit 0 |
| `pnpm ai:doctor --open` | `command-logs/035-pnpm-ai-doctor-open.log` | pass, exit 0 |
| `pnpm codex:preflight` | `command-logs/036-pnpm-codex-preflight.log` | pass, exit 0 |
| `pnpm arch:runtime` | `command-logs/037-pnpm-arch-runtime.log` | pass, exit 0 |
| `pnpm arch:boundaries` | `command-logs/038-pnpm-arch-boundaries.log` | pass, exit 0 |
| `pnpm api:report` | `command-logs/039-pnpm-api-report.log` | pass, exit 0 |
| `pnpm ai:guard -- --format=json` | `command-logs/040-pnpm-ai-guard-format-json.log` | pass, exit 0 |
| `pnpm validate:governance` | `command-logs/041-pnpm-validate-governance.log` | pass, exit 0 |
| `pnpm --filter @ccd/web-demo test` | `command-logs/042-pnpm-filter-web-demo-test-final.log` | pass, exit 0; 45 files / 329 tests |
| `pnpm type-check` | `command-logs/043-pnpm-type-check-final.log` | pass, exit 0 |
| `git diff --check` | `command-logs/050-final-git-diff-check.log` | pass, exit 0 |
| `pnpm docs:commands` | `command-logs/051-final-pnpm-docs-commands.log` | pass, exit 0 |
| `pnpm project:doctor` | `command-logs/052-final-pnpm-project-doctor.log` | pass, exit 0 |
| `pnpm ai:doctor --open` | `command-logs/053-final-pnpm-ai-doctor-open.log` | pass, exit 0 |
| `pnpm codex:preflight` | `command-logs/054-final-pnpm-codex-preflight.log` | pass, exit 0 |
| `pnpm arch:runtime` | `command-logs/055-final-pnpm-arch-runtime.log` | pass, exit 0 |
| `pnpm arch:boundaries` | `command-logs/056-final-pnpm-arch-boundaries.log` | pass, exit 0 |
| `pnpm api:report` | `command-logs/057-final-pnpm-api-report.log` | pass, exit 0 |
| `pnpm ai:guard -- --format=json` | `command-logs/058-final-pnpm-ai-guard-format-json.log` | pass, exit 0 |
| `pnpm validate:governance` | `command-logs/059-final-pnpm-validate-governance.log` | pass, exit 0 |
| `pnpm test:run` | `command-logs/060-final-pnpm-test-run.log` | pass, exit 0; 74 files / 429 tests |
| `pnpm --filter @ccd/web-demo test` | `command-logs/061-final-pnpm-filter-web-demo-test.log` | pass, exit 0; 45 files / 329 tests |
| `pnpm type-check` | `command-logs/062-final-pnpm-type-check.log` | pass, exit 0 |
| `git diff --exit-code -- apps/web-demo/src/types/auto-imports.d.ts` | `command-logs/063-final-auto-imports-drift-restored.log` | pass, exit 0 |
| `git diff --check` | `command-logs/070-final2-git-diff-check.log` | pass, exit 0 |
| `pnpm docs:commands` | `command-logs/071-final2-pnpm-docs-commands.log` | pass, exit 0 |

## Closure Status

`M7A_FILTERED_TEST_CWD_REPAIRED`

This closes the strict M7 validation gap without changing HTTP runtime behavior or safeStorage runtime behavior.
