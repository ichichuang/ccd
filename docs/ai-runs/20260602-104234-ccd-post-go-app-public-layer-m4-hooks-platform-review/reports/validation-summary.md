# M4 Validation Summary

| Command | Log | Result | Notes |
| --- | --- | --- | --- |
| `pnpm --filter @ccd/vue-hooks test` | `command-logs/pnpm-filter-vue-hooks-test.log` | PASS | 5 files, 15 tests passed. |
| `pnpm --filter @ccd/vue-app-platform test` | `command-logs/pnpm-filter-vue-app-platform-test.log` | PASS | 5 files, 21 tests passed. |
| `pnpm --filter @ccd/web-demo test -- ...` | `command-logs/pnpm-filter-web-demo-focused-hooks-tests.log` | PASS | 48 files, 339 tests passed. |
| `git diff --check` | `command-logs/git-diff-check.log` | PASS | No whitespace errors. |
| `pnpm docs:commands` | `command-logs/pnpm-docs-commands.log` | PASS | 385 documentation files scanned. |
| `pnpm ai:guard -- --format=json` | `command-logs/pnpm-ai-guard-format-json.log` | PASS | `ok: true`, no findings. |
| `pnpm validate:governance` | `command-logs/pnpm-validate-governance.log` | PASS | Unified governance gate passed. |
| `git diff --check` | `command-logs/post-restore-git-diff-check.log` | PASS | Re-run after generated diff restore. |
| `pnpm docs:commands` | `command-logs/post-restore-pnpm-docs-commands.log` | PASS | Re-run after generated diff restore. |

## Generated artifact note

`pnpm validate:governance` left a formatting-only diff in
`apps/web-demo/src/types/auto-imports.d.ts`. M4 did not authorize generated
registry changes, so the diff was recorded in
`command-logs/unexpected-auto-imports-generated-diff.log` and the file was
restored to `HEAD` before commit.
