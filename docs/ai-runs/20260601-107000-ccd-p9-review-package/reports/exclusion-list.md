# P9 Exclusion List

Files or paths **not recommended for commit** without explicit owner decision.

| file / path | reason | required owner decision |
|---|---|---|
| `.cursor/**` | local IDE / Cursor plans; causes codex:preflight FAIL | exclude from repo or add to .gitignore policy |
| `CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md` (repo root) | duplicate input copy; canonical is `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` | delete root copy or document dual-input policy |
| `docs/ai-runs/**/command-logs/*.log` (duplicate reruns) | optional trim of redundant command logs | keep all vs squash evidence |
| `docs/ai-runs/20260531-230000-ccd-m16a-ledger-evidence-polish/` | **missing** — STATUS references nonexistent dir | retro-create evidence or fix STATUS reference |
| `.ai/generated/**` if manually touched | must be command-regenerated only | verify generator command in commit message |
| `apps/web-demo/dist/**`, `packages/*/dist/**` | build artifacts | never commit |
| `node_modules/**` | dependencies | never commit |

## Inherited validation failure (not fixed in P9)

- `pnpm codex:preflight` fails while `.cursor` exists at repo root
- ai:sync drift message in preflight — run `pnpm ai:sync` only if owner authorizes adapter regeneration

## Stage/commit policy

P9 does **not** run `git add`, `git commit`, or `git push`. Owner must explicitly authorize each proposed commit group after human review.
