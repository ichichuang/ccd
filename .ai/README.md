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

## Maintenance

- Generate adapters: `pnpm ai:sync`
- Install local Codex skills: `pnpm ai:sync:codex`
- Clean local AI/browser runtime residue: `pnpm ai:clean`
- Aggressive cleanup when needed: `pnpm ai:clean -- --all`
- Validate structure: `pnpm ai:doctor`
- Run Codex preflight: `pnpm codex:preflight`
