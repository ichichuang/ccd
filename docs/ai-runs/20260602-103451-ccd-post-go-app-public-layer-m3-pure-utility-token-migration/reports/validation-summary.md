# M3 Validation Summary

| Command | Log | Result | Notes |
| --- | --- | --- | --- |
| `pnpm --filter @ccd/design-tokens test` | `command-logs/pnpm-filter-design-tokens-test.log` | PASS | Vitest exited 0 with `--passWithNoTests`. |
| `pnpm --filter @ccd/desktop type-check` | `command-logs/pnpm-filter-desktop-type-check.log` | FAIL | Initial import path used root export for `generateThemeVars`. |
| `pnpm --filter @ccd/desktop type-check` | `command-logs/pnpm-filter-desktop-type-check-rerun.log` | PASS | Passed after importing from `@ccd/design-tokens/theme-engine`. |
| `pnpm build:desktop` | `command-logs/pnpm-build-desktop.log` | PASS | Desktop Vite build completed. |
| `pnpm arch:runtime` | `command-logs/pnpm-arch-runtime.log` | PASS | Runtime surface validation passed. |
| `pnpm validate:governance` | `command-logs/pnpm-validate-governance.log` | PASS | Unified governance gate passed. |
| `git diff --check` | `command-logs/git-diff-check.log` | PASS | No whitespace errors. |
| `pnpm docs:commands` | `command-logs/pnpm-docs-commands.log` | PASS | 375 documentation files scanned. |
| `pnpm ai:guard -- --format=json` | `command-logs/pnpm-ai-guard-format-json.log` | PASS | `ok: true`, no findings. |
| `git diff --check` | `command-logs/post-status-git-diff-check.log` | PASS | Re-run after STATUS update. |
| `pnpm docs:commands` | `command-logs/post-status-pnpm-docs-commands.log` | PASS | Re-run after STATUS update. |

## Validation note

The failed command was fixed within the M3 lane and rerun successfully. No
manifest, lockfile, generated registry, or unrelated source change was used to
make validation pass.
