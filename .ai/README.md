# AI Workspace Standard

This repository uses `.ai/` as the single source of truth for all AI collaboration assets.

## Canonical Paths

- Config: `.ai/config/**`
- Rules: `.ai/rules/**`
- Skills: `.ai/skills/**`
- Protocol: `.ai/protocol/**`
- Runtime templates: `.ai/runtime/*.template.txt`
- Manifests/locks: `.ai/manifests/**`

## Compatibility Adapters

The following are generated compatibility adapters for specific tools:

- `AGENTS.md` <= `.ai/protocol/AI.entry.md`
- `.cursor/settings.json` <= `.ai/config/cursor.settings.json`
- `.cursor/rules/**` <= `.ai/rules/**`
- `.cursor/skills/**` <= `.ai/skills/core/** + .ai/skills/cursor/**`

Local Codex materialization:

- `~/.codex/skills/**` <= `.ai/skills/core/** + .ai/skills/codex/**`
- Generate with `pnpm ai:sync:codex`

Local runtime file:

- `.ai/runtime/repair_list.txt` is local working state generated from `.ai/runtime/repair_list.template.txt`.

Do not manually maintain generated adapters.

## Skill Topology

CCD uses three skill layers:

| Layer  | Location               | Purpose                                                            |
| ------ | ---------------------- | ------------------------------------------------------------------ |
| Core   | `.ai/skills/core/**`   | Implementation skills for Vue, VueUse, UnoCSS, and Vite            |
| Codex  | `.ai/skills/codex/**`  | Low-token orchestration, browser automation, and GitHub operations |
| Cursor | `.ai/skills/cursor/**` | Compatibility-only Cursor skill surface                            |

Repo-managed Codex operations currently center on:

- `task-orchestrator`
- `architecture-browser-master`
- `github-ops`
- `desktop-tauri-guard`

## Runtime Residue

Generated adapters are expected.
Local runtime residue is also expected, but it is not source of truth.

Common local runtime paths:

- `.ai/runtime/repair_list.txt`
- `artifacts/browser/**`
- `~/.codex/tmp/architecture-browser-master/**`

Browser automation intentionally writes compact summaries and optional evidence under `artifacts/browser/**`.

## Maintenance

- Generate adapters: `pnpm ai:sync`
- Install local Codex skills: `pnpm ai:sync:codex`
- Clean local AI/browser runtime residue: `pnpm ai:clean`
- Aggressive cleanup when needed: `pnpm ai:clean -- --all`
- Validate structure: `pnpm ai:doctor`
- Run Codex preflight: `pnpm codex:preflight`

Recommended maintenance order:

```bash
pnpm ai:sync
pnpm ai:sync:codex
pnpm ai:doctor
pnpm codex:preflight
```
