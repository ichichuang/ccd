# CCD Codex Quickstart

This guide is for CCD architecture projects only.

## 1) One-Time Setup Per Repo

1. Ensure these paths exist:
   - `.ai/rules/**`
   - `.ai/skills/**`
   - `.ai/protocol/**`
2. Ensure root `AGENTS.md` exists and is up to date.
3. Run:

```bash
pnpm ai:doctor
pnpm codex:preflight
```

## 2) Recommended Codex Run Modes

Default for daily development:

```bash
codex -a never -s workspace-write
```

High-risk mode (temporary sandbox/container only):

```bash
codex -a never -s danger-full-access
```

## 3) Skill Decision Matrix

- Component/page/composable implementation:
  - `@.claude/skills/vue`
- Reusable logic, sensors, state helpers:
  - `@.claude/skills/vueuse-functions`
- Styling/theme/token/shortcut updates:
  - `@.claude/skills/unocss`
- Build/config/plugin/env/toolchain updates:
  - `@.claude/skills/vite`
- GitHub workflow (issue/PR/checks):
  - `@.cursor/skills/github`
- UI flow regression/e2e:
  - `@.cursor/skills/playwright-mcp`

## 4) Task Prompt Template (Copy and Fill)

```text
Implement [feature-name] on CCD architecture.

Must follow:
1) AGENTS.md
2) .ai/protocol/AGENTS.core.md
3) .ai/rules/core/00-global-architect.mdc
4) .ai/rules/core/00-root-gatekeeper.mdc
5) .ai/rules/core/01-preflight-checklist.mdc
6) Domain rules under .ai/rules/{architecture,components,core,design-system,integrations}

Skill policy:
- Select only required skills from:
  @.claude/skills/vue
  @.claude/skills/vueuse-functions
  @.claude/skills/unocss
  @.claude/skills/vite
  @.cursor/skills/github
  @.cursor/skills/playwright-mcp
- Explain selection briefly before implementation.

Output format:
1) Ready for Action checklist
2) Implementation plan
3) Code changes
4) Validation results (type-check/lint/test/e2e as needed)
5) Risks and follow-ups
```

## 5) Reuse in New CCD-Based Product Repos

Copy these files into the new repo root:
- `AGENTS.md`
- `.ai/README.md`
- `.ai/protocol/AGENTS.core.md`
- `docs/codex/quickstart.md`
- `scripts/ai-doctor.mjs`
- `scripts/ai-sync.mjs`
- `scripts/codex-preflight.mjs`

Then add `ai:doctor`, `ai:sync`, and `codex:preflight` to `package.json` scripts and run:

```bash
pnpm ai:doctor
pnpm codex:preflight
```
