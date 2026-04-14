# AI Workspace Standard

This repository uses `.ai/` as the single source of truth for all AI collaboration assets.

## Canonical Paths

- Rules: `.ai/rules/**`
- Skills: `.ai/skills/**`
- Protocol: `.ai/protocol/**`
- Runtime mutable files: `.ai/runtime/**`
- Manifests/locks: `.ai/manifests/**`

## Compatibility Adapters

The following are compatibility adapters for specific tools and may be symbolic links:
- `.cursor/rules` -> `.ai/rules`
- `.cursor/skills` -> `.ai/skills/cursor`
- `.claude/skills` -> `.ai/skills/claude`
- `repair_list.txt` -> `.ai/runtime/repair_list.txt`
- `skills-lock.json` -> `.ai/manifests/skills-lock.json`

Do not maintain duplicated content in adapters.

## Maintenance

- Validate structure: `pnpm ai:doctor`
- Repair adapters: `pnpm ai:sync`

