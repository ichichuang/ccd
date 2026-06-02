# M1 Validation Summary

| Command | Result | Log |
| --- | --- | --- |
| `git diff --check` | PASS | `command-logs/git-diff-check.log` |
| `pnpm docs:commands` | PASS | `command-logs/pnpm-docs-commands.log` |
| `pnpm ai:guard -- --format=json` | PASS, 0 findings | `command-logs/pnpm-ai-guard-format-json.log` |
| `pnpm validate:governance` | PASS | `command-logs/pnpm-validate-governance.log` |

## Generated output note

`pnpm validate:governance` ran the owning governance generators. Post-validation `git diff --name-only` showed no tracked generated drift.

## Scoped tests

Not applicable in M1. This lane produced inventory/evidence only and made no production source changes.
