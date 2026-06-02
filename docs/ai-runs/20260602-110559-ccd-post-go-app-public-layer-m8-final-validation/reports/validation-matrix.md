# M8 Final Validation Matrix

| Lane | Command | Result | Evidence |
| --- | --- | --- | --- |
| Baseline | `git diff --check` | PASS | `command-logs/git-diff-check.log` |
| Docs | `pnpm docs:commands` | PASS; 401 files scanned | `command-logs/pnpm-docs-commands.log` |
| Doctor | `pnpm project:doctor` | PASS | `command-logs/pnpm-project-doctor.log` |
| Doctor | `pnpm ai:doctor` | PASS | `command-logs/pnpm-ai-doctor.log` |
| Doctor | `pnpm ai:doctor --open` | PASS; 0 open tasks | `command-logs/pnpm-ai-doctor-open.log` |
| Preflight | `pnpm codex:preflight` | PASS | `command-logs/pnpm-codex-preflight.log` |
| Packages | `pnpm ci:prepare-internal` | PASS | `command-logs/pnpm-ci-prepare-internal.log` |
| Packages | `pnpm ci:smoke:packages` | PASS | `command-logs/pnpm-ci-smoke-packages.log` |
| Architecture | `pnpm arch:runtime` | PASS | `command-logs/pnpm-arch-runtime.log` |
| Architecture | `pnpm arch:boundaries` | PASS | `command-logs/pnpm-arch-boundaries.log` |
| API | `pnpm api:report` | PASS | `command-logs/pnpm-api-report.log` |
| API | Generated/API diff check | PASS; empty diff | `command-logs/post-api-report-generated-diff-check.log` |
| Guard | `pnpm ai:guard -- --format=json` | PASS | `command-logs/pnpm-ai-guard-format-json.log` |
| Governance | `pnpm validate:governance` | PASS | `command-logs/pnpm-validate-governance.log` |
| Governance | Generated governance diff check | PASS; empty diff | `command-logs/post-validate-governance-generated-diff-check.log` |
| Typecheck | `pnpm type-check` | PASS; 22 tasks | `command-logs/pnpm-type-check.log` |
| Tests | `pnpm test:run` | PASS; 81 files, 462 tests | `command-logs/pnpm-test-run.log` |
| Tests | `pnpm --filter @ccd/web-demo test` | PASS; 48 files, 339 tests | `command-logs/pnpm-filter-web-demo-test.log` |
| Build | `pnpm build:web-demo` | PASS | `command-logs/pnpm-build-web-demo.log` |
| Build | `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts` | PASS | `command-logs/pnpm-prettier-auto-imports.log` |
| Build | `auto-imports.d.ts` diff check | PASS; empty diff | `command-logs/post-web-demo-auto-imports-diff-check.log` |
| Build | `pnpm build:desktop` | PASS | `command-logs/pnpm-build-desktop.log` |
| Drift | `pnpm drift-check` | PASS | `command-logs/pnpm-drift-check.log` |

## Final drift result

After the full matrix, `git diff --name-only` was empty. The only untracked
paths were this M8 evidence directory before report/status updates.

No manifest, lockfile, production source, generated registry, API snapshot, or
governance artifact drift remained.
