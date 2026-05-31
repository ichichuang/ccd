# Validation closure

All required M13 validation commands completed with exit code 0.

| command | result | log |
|---|---|---|
| `pnpm ci:prepare-internal` | pass | `command-logs/012_pnpm_ci_prepare_internal_after_patch.log` |
| `pnpm ci:smoke:packages` | pass | `command-logs/013_pnpm_ci_smoke_packages.log` |
| `pnpm --filter @ccd/web-demo type-check` | pass | `command-logs/014_web_demo_type_check_after_patch.log` |
| `pnpm --filter @ccd/desktop type-check` | pass | `command-logs/015_desktop_type_check_after_patch.log` |
| `pnpm build:web-demo` | pass | `command-logs/018_pnpm_build_web_demo.log` |
| `pnpm build:desktop` | pass | `command-logs/019_pnpm_build_desktop.log` |
| `pnpm type-check` | pass | `command-logs/021_pnpm_type_check.log` |
| `pnpm test:run` | pass: 79 files, 453 tests | `command-logs/022_pnpm_test_run.log` |
| `pnpm --filter @ccd/web-demo test` | pass: 48 files, 339 tests | `command-logs/023_web_demo_test.log` |
| `pnpm arch:runtime` | pass | `command-logs/024_pnpm_arch_runtime.log` |
| `pnpm arch:boundaries` | pass | `command-logs/016_pnpm_arch_boundaries_after_patch.log` |
| `pnpm api:report` | pass; generated API report | `command-logs/026_pnpm_api_report.log` |
| `pnpm ai:guard -- --format=json` | pass | `command-logs/025_pnpm_ai_guard_format_json.log` |
| `pnpm validate:governance` | pass; generated governance reports/graphs | `command-logs/027_pnpm_validate_governance.log` |
| `pnpm docs:commands` | pass | `command-logs/035_pnpm_docs_commands_final.log` |
| `pnpm project:doctor` | pass | `command-logs/028_pnpm_project_doctor.log` |
| `pnpm ai:doctor --open` | pass; reports 80 preexisting open ledger tasks | `command-logs/029_pnpm_ai_doctor_open.log` |
| `pnpm codex:preflight` | pass | `command-logs/030_pnpm_codex_preflight.log` |
| `git diff --check` | pass | `command-logs/037_git_diff_check_post_validation_report_update.log` |

Notes:

- `pnpm ai:doctor --open` is not a failure; it reports existing blocked/deferred ledger work outside M13.
- `pnpm codex:preflight` ran `pnpm validate:tokens` and reported existing decorative contrast advisories as warnings, not failures.
- Final status and diff evidence are recorded in `command-logs/033_git_diff_name_status_final.log` and `command-logs/034_git_status_short_untracked_all_final.log`.
