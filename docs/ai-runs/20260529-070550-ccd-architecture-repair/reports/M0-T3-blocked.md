# M0-T3 Blocked Report

## Status

`BLOCKED`

## Task

M0-T3 — Post-7 validation checkpoint.

## Summary

Checkpoint ran through `pnpm budget:desktop` successfully, then stopped at `pnpm validate:governance`.

Failure cause:

- `docs:commands` found `docs/ai-plan/PLAN.md:962`.
- The blind global latest-upgrade command example is parsed as a package script reference.
- `package.json` has no `up` script, so governance command validation fails.

## Commands

| Command | Result | Log |
|---|---|---|
| `pnpm install --frozen-lockfile` | PASS | `command-logs/M0-T3-20260529-072550-pnpm-install-frozen-lockfile.log` |
| `pnpm ci:prepare-internal` | PASS | `command-logs/M0-T3-20260529-072610-pnpm-ci-prepare-internal.log` |
| `pnpm ci:smoke:packages` | PASS | `command-logs/M0-T3-20260529-072631-pnpm-ci-smoke-packages.log` |
| `pnpm ai:doctor` | PASS | `command-logs/M0-T3-20260529-072642-pnpm-ai-doctor.log` |
| `pnpm codex:preflight` | PASS | `command-logs/M0-T3-20260529-072658-pnpm-codex-preflight.log` |
| `pnpm type-check` | PASS | `command-logs/M0-T3-20260529-072713-pnpm-type-check.log` |
| `pnpm lint:check` | PASS with warnings | `command-logs/M0-T3-20260529-072723-pnpm-lint-check.log` |
| `pnpm test:run` | PASS | `command-logs/M0-T3-20260529-072743-pnpm-test-run.log` |
| `pnpm build:web-demo` | PASS | `command-logs/M0-T3-20260529-072802-pnpm-build-web-demo.log` |
| `pnpm build:desktop` | PASS | `command-logs/M0-T3-20260529-072842-pnpm-build-desktop.log` |
| `pnpm budget:desktop` | PASS | `command-logs/M0-T3-20260529-072907-pnpm-budget-desktop.log` |
| `pnpm validate:governance` | FAIL | `command-logs/M0-T3-20260529-072915-pnpm-validate-governance.log` |

## Generated Drift

The failed governance command generated or refreshed these tracked generated outputs through official governance commands:

- `.ai/generated/governance-report.json`
- `docs/generated/api-surface-report.json`
- `docs/generated/graphs/dependency-graph.json`
- `docs/generated/sbom.json`

Known recurring generated drift also appeared:

- `apps/web-demo/src/types/auto-imports.d.ts`
- `apps/web-demo/src/views/example/components/icons/configs/iconLists.generated.ts`

No manual edits were made to generated governance outputs.

## Next Narrow Action

Fix or rephrase `docs/ai-plan/PLAN.md:962` so `docs:commands` no longer treats the blind global latest-upgrade example as a missing package script. Then rerun `pnpm validate:governance`. If it passes, continue the remaining M0-T3 commands: `pnpm build:ci`, `git diff --check`, and `git status --short --untracked-files=all`.
