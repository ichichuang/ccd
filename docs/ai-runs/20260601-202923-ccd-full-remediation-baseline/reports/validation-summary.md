# Validation Summary

| Command | Result | Log |
| --- | --- | --- |
| `git fetch origin main` | PASS | `../command-logs/00-git-fetch-origin-main.log` |
| `git branch --show-current` | PASS | `../command-logs/01-git-branch.log` |
| `git rev-parse --short HEAD` | PASS | `../command-logs/02-git-rev-parse-head.log` |
| `git rev-parse --short origin/main` | PASS | `../command-logs/03-git-rev-parse-origin-main.log` |
| `git status --short --untracked-files=all` | PASS | `../command-logs/04-git-status.log` |
| `.cursor` absent check | PASS | `../command-logs/05-cursor-absent.log` |
| root duplicate repair log absent check | PASS | `../command-logs/06-root-duplicate-absent.log` |
| `git diff --check` | PASS | `../command-logs/07-git-diff-check.log` |
| `pnpm docs:commands` | PASS | `../command-logs/08-pnpm-docs-commands.log` |
| `pnpm ai:doctor` | PASS | `../command-logs/09-pnpm-ai-doctor.log` |
| `pnpm ai:doctor --open` | PASS, 78 open tasks | `../command-logs/10-pnpm-ai-doctor-open.log` |
| `pnpm ai:guard -- --format=json` | PASS | `../command-logs/11-pnpm-ai-guard-json.log` |
| `pnpm validate:governance` | PASS | `../command-logs/12-pnpm-validate-governance.log` |
| `git log -10 --oneline --decorate` | PASS | `../command-logs/13-git-log.log` |

Baseline-only local classification:

- `../command-logs/14-local-exclude-plan-package.log` records the local `.git/info/exclude` entry for the external controlling plan package.
