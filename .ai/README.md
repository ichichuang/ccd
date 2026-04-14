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
- `CLAUDE.md` <= `.ai/protocol/AI.entry.md`
- `.cursor/settings.json` <= `.ai/config/cursor.settings.json`
- `.claude/settings.local.json` <= `.ai/config/claude.settings.local.json`
- `.cursor/rules/**` <= `.ai/rules/**`
- `.cursor/skills/**` <= `.ai/skills/cursor/**`
- `.claude/skills/**` <= `.ai/skills/claude/**`

Local runtime file:

- `.ai/runtime/repair_list.txt` is local working state generated from `.ai/runtime/repair_list.template.txt`.

Do not manually maintain generated adapters.

## Maintenance

- Generate adapters: `pnpm ai:sync`
- Validate structure: `pnpm ai:doctor`
- Run Codex preflight: `pnpm codex:preflight`
