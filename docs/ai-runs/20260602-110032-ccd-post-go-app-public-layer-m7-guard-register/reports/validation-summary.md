# M7 Validation Summary

Validation runs after STATUS update.

| Command | Result | Evidence |
| --- | --- | --- |
| `git diff --check` | PASS | `command-logs/git-diff-check.log` |
| `pnpm docs:commands` | PASS; 401 files scanned | `command-logs/pnpm-docs-commands.log` |
| `pnpm ai:guard -- --format=json` | PASS | `command-logs/pnpm-ai-guard-format-json.log` |
| `pnpm drift-check` | PASS | `command-logs/pnpm-drift-check.log` |
| `pnpm arch:runtime` | PASS | `command-logs/pnpm-arch-runtime.log` |
| `pnpm arch:boundaries` | PASS | `command-logs/pnpm-arch-boundaries.log` |
| `pnpm validate:governance` | PASS | `command-logs/pnpm-validate-governance.log` |

## Drift check

`git diff --name-only` after validation listed only:

- `ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/CHANGE_SUMMARY.md`
- `ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/STATUS.md`

No production source, manifest, lockfile, generated registry, or guard source diff
was present.
