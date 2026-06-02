# M0 Validation Summary

| Command | Result | Log |
|---|---|---|
| `git fetch origin main` | PASS | `command-logs/git-fetch-origin-main.log` |
| `git branch --show-current` | PASS, `main` | `command-logs/git-branch-show-current.log` |
| `git rev-parse --short HEAD` | PASS, `1d691428` | `command-logs/git-rev-parse-head.log` |
| `git rev-parse --short origin/main` | PASS, `1d691428` | `command-logs/git-rev-parse-origin-main.log` |
| `git status --short --untracked-files=all` | PASS, shows plan input and M0 evidence as untracked | `command-logs/git-status-short-untracked-all.log` |
| `git diff --check` | PASS | `command-logs/git-diff-check.log` |
| `pnpm docs:commands` | PASS | `command-logs/pnpm-docs-commands.log` |
| `pnpm ai:doctor` | PASS | `command-logs/pnpm-ai-doctor.log` |
| `pnpm ai:doctor --open` | PASS, 0 open tasks | `command-logs/pnpm-ai-doctor-open.log` |
| `pnpm ai:guard -- --format=json` | PASS, 0 findings | `command-logs/pnpm-ai-guard-format-json.log` |
| `pnpm validate:governance` | PASS | `command-logs/pnpm-validate-governance.log` |

## Generated output note

`pnpm ai:doctor` and `pnpm validate:governance` ran their owning build/governance generators. Post-validation `git diff --name-only` showed no tracked generated drift.
