# Validation Summary (P17)

Baseline commit: `cc813fe3` (branch `main`, HEAD == origin/main).

## Baseline gates (pre-change)

| Command | Result |
|---|---|
| `git status --short` | clean |
| `git diff --check` | clean |
| `pnpm ai:guard -- --format=json` | pass (`ok:true`, findings: []) |
| `pnpm docs:commands` | pass |
| `pnpm ai:doctor` | pass (decorative WARN only) |
| `pnpm validate:governance` | pass |

## Phase 4 validation matrix (post-change)

| Command | Result |
|---|---|
| `git diff --check` | pass (clean) |
| `pnpm docs:commands` | pass (270 files) |
| `pnpm project:doctor` | pass |
| `pnpm ai:doctor` | pass (decorative WARN only) |
| `pnpm ai:doctor --open` | pass (80 open tasks, owner-accepted) |
| `pnpm codex:preflight` | pass |
| `pnpm arch:runtime` | pass (findings=387, exact_exceptions=297) |
| `pnpm arch:boundaries` | pass (781 modules, 1671 deps, no violations) |
| `pnpm api:report` | pass (regenerated api-surface-report) |
| `pnpm ai:guard -- --format=json` | pass (`ok:true`, findings: []) |
| `pnpm validate:governance` | pass (unified gate passed) |
| `pnpm --filter @ccd/vue-primevue-adapter build` | pass |
| `pnpm --filter @ccd/vue-primevue-adapter test` | pass (5 tests) |
| `pnpm --filter @ccd/vue-ui test` | pass (19 tests, 8 files) |
| `pnpm --filter @ccd/web-demo type-check` | pass |
| `pnpm --filter @ccd/web-demo test` | pass (339 tests, 48 files) |
| `pnpm type-check` | pass (22/22 tasks) |
| `pnpm test:run` | pass (455 tests, 80 files) |
| `pnpm build:web-demo` | pass (4.57 MB) |
| `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts` | pass |
| `git diff -- apps/web-demo/src/types/auto-imports.d.ts` | empty (good) |
| `pnpm build:desktop` | pass (1142 modules) |

## Required gate checklist

- ai:guard passes: YES
- validate:governance passes: YES
- build:web-demo passes: YES
- auto-imports diff empty after Prettier: YES
- final git status contains only intended P17 files/evidence: YES
- no unintended generated files dirty: only `docs/generated/api-surface-report.{json,md}` (owning-command-generated, intended, committed per P14 precedent)

Logs: see sibling `command-logs/` directory.
