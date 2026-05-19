# AI Orchestration

CCD orchestration is declared under `.ai/orchestration/**` and executed through deterministic local commands. It connects the protocol layer, skill routing, runtime/provider diagnostics, and governance validation without making generated adapter files canonical.

## Governance Model

The orchestration layer defines:

- agent roles
- execution scopes
- governance permissions
- protocol routing
- task delegation rules
- validation prechecks
- skill-selection heuristics

## Runtime Gate

Orchestrated agents must pass `pnpm env:doctor` before running architecture or governance automation. If a shell wrapper shadows `node` or `pnpm`, use:

```bash
bash scripts/exec.sh <command>
```

This resolves the pinned runtime directly and avoids shell-wrapper leakage.

## Skill Routing

Use the local router before ambiguous, cross-module, or multi-surface tasks:

```bash
node .ai/skills/codex/task-orchestrator/scripts/skill_router.mjs "<task>" --json
```

Fallback:

```bash
python3 .ai/skills/codex/task-orchestrator/scripts/skill_router.py "<task>" --json
```

Routing rules:

- GitHub, PR, issue, Actions, CI, release, review, remote branch, or `.github/**` work routes to `github-ops`.
- UI behavior, layout, screenshots, navigation, or browser evidence routes to `architecture-browser-master`.
- Tauri, desktop bridge, capability, `src-tauri/**`, or desktop drift cleanup routes to `desktop-tauri-guard`.
- Vague or cross-module work routes to `task-orchestrator` first.

## State and Evidence

| State                  | Location                                | Rule                                                      |
| ---------------------- | --------------------------------------- | --------------------------------------------------------- |
| runtime repair ledger  | `.ai/runtime/repair_list.txt`           | update when adding or resolving tracked architecture work |
| execution fingerprints | `.ai/execution/**`                      | governed runtime/provider state                           |
| browser artifacts      | `artifacts/browser/**`                  | local evidence, not canonical architecture source         |
| generated reports      | `.ai/generated/**`, `docs/generated/**` | commit when governance commands update them               |

## Current Manifest

- `.ai/orchestration/manifest.json`

## Validation

```bash
pnpm orchestration:validate
pnpm env:doctor
pnpm runtime:env
pnpm governance:validate
pnpm governance:gate
```
