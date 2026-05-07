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

The following are generated compatibility adapters for supported AI tools:

- `AGENTS.md` <= `.ai/protocol/AI.entry.md`
- `CLAUDE.md` <= `.ai/protocol/adapter-manifest.json` (points to `AGENTS.md`)

Local Codex materialization:

- `~/.codex/skills/**` <= `.ai/skills/core/** + .ai/skills/codex/**`
- Generate with `pnpm ai:sync:codex`

Local runtime file:

- `.ai/runtime/repair_list.txt` is local working state generated from `.ai/runtime/repair_list.template.txt`.

Do not manually maintain generated adapters.

## Skill Topology

CCD uses two skill layers:

| Layer | Location              | Purpose                                                            |
| ----- | --------------------- | ------------------------------------------------------------------ |
| Core  | `.ai/skills/core/**`  | Implementation skills for Vue, VueUse, UnoCSS, and Vite            |
| Codex | `.ai/skills/codex/**` | Low-token orchestration, browser automation, and GitHub operations |

Repo-managed Codex operations currently center on:

- `task-orchestrator`
- `architecture-browser-master`
- `github-ops`
- `desktop-tauri-guard`

Generation guardrails for business routes/pages:

- `pnpm ai:scaffold:view-route -- --segment <segment> --title-key <i18n.key> --kind <table|form|detail>`
- `pnpm ai:guard`

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
- One-shot Codex setup: `pnpm ai:setup:codex`
- Clean local AI/browser runtime residue: `pnpm ai:clean`
- Aggressive cleanup when needed: `pnpm ai:clean -- --all`
- Validate structure: `pnpm ai:doctor` (runs `ai:guard` and `validate:tokens`)
- Validate generated business surfaces: `pnpm ai:guard`
- Validate theme token contrast: `pnpm validate:tokens`
- Check drift-sensitive docs/config/style contracts: `pnpm drift-check`
- Check desktop/Tauri config surface when relevant: `pnpm sync:desktop-config`
- Run Codex preflight: `pnpm codex:preflight`

Recommended maintenance order:

```bash
pnpm ai:sync
pnpm ai:sync:codex
pnpm ai:doctor
pnpm codex:preflight
```
