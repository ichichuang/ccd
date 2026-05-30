# P4 Planning-Only Validation Summary

| Command | Exit code | Result | Log |
| --- | ---: | --- | --- |
| `pnpm docs:commands` | 0 | PASS; 142 documentation files scanned. | `../command-logs/01-pnpm-docs-commands.log` |
| `pnpm ai:doctor --open` | 0 | PASS; 80 open tasks, all explicitly blocked/deferred categories. | `../command-logs/02-pnpm-ai-doctor-open.log` |
| `pnpm codex:preflight` | 0 | PASS; preflight passed after internal package preparation and token contrast validation advisories. | `../command-logs/03-pnpm-codex-preflight.log` |
| `pnpm validate:governance` | 0 | PASS; unified governance gate passed. | `../command-logs/04-pnpm-validate-governance.log` |
| `git diff --check` | 0 | PASS. | `../command-logs/05-git-diff-check.log` |
| `git status --short --untracked-files=all` | 0 | PASS; expected P4 planning docs and active evidence files only. | `../command-logs/06-git-status-short-untracked-all.log` |

Generated drift handling: `pnpm validate:governance` regenerated and normalized official governance artifacts internally, but final `git status --short --untracked-files=all` shows no generated-file diff.

No staged, committed, pushed, reset, cleaned, rebased, branch-switched, package, source, `.github/**`, auth, HTTP runtime, runtime UI, package manifest, dependency, or manual generated-file change was performed.
