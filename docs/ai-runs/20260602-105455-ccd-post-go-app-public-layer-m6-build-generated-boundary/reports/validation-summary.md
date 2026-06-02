# M6 Validation Summary

| Command | Log | Result | Notes |
| --- | --- | --- | --- |
| `pnpm drift-check` | `command-logs/pnpm-drift-check.log` | PASS | Drift check passed, including PrimeVue resolver boundary. |
| `pnpm build:web-demo` | `command-logs/pnpm-build-web-demo.log` | PASS | Web demo build completed. |
| `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts` | `command-logs/pnpm-prettier-auto-imports.log` | PASS | Auto-imports normalized. |
| `git diff -- apps/web-demo/src/types/auto-imports.d.ts apps/web-demo/src/types/components.d.ts` | `command-logs/post-prettier-generated-types-diff.log` | PASS | Empty diff after normalization. |
| `pnpm api:report` | `command-logs/pnpm-api-report.log` | PASS | API report command exited 0. |
| `git diff -- docs/generated .ai/generated .ai/governance/api-snapshots` | `command-logs/post-api-report-generated-diff.log` | PASS | Empty generated governance/API diff. |
| `git diff --check` | `command-logs/git-diff-check.log` | PASS | No whitespace errors. |
| `pnpm docs:commands` | `command-logs/pnpm-docs-commands.log` | PASS | 395 documentation files scanned. |
| `pnpm ai:guard -- --format=json` | `command-logs/pnpm-ai-guard-format-json.log` | PASS | `ok: true`, no findings. |
| `pnpm validate:governance` | `command-logs/pnpm-validate-governance.log` | PASS | Unified governance gate passed. |
