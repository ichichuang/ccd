# CCD Codex Quickstart

This guide is for CCD architecture projects only.

## 1) One-Time Setup Per Repo

1. Ensure these paths exist:
   - `.ai/config/**`
   - `.ai/rules/**`
   - `.ai/skills/**`
   - `.ai/protocol/**`
2. Generate local adapters and install repo-managed Codex skills:

```bash
pnpm ai:sync
pnpm ai:sync:codex
```

3. Ensure generated adapters now exist: `AGENTS.md`, `.cursor/**`, and `~/.codex/skills/**` contains the repo skills.
4. Run:

```bash
pnpm ai:doctor
pnpm codex:preflight
```

## 2) Recommended Codex Run Modes

Default for daily development:

```bash
codex --profile default
```

High-risk mode (temporary sandbox/container only):

```bash
codex --profile yolo
```

## 3) Skill Decision Matrix

- Component/page/composable implementation:
  - `.ai/skills/core/vue`
- Reusable logic, sensors, state helpers:
  - `.ai/skills/core/vueuse-functions`
- Styling/theme/token/shortcut updates:
  - `.ai/skills/core/unocss`
- Build/config/plugin/env/toolchain updates:
  - `.ai/skills/core/vite`
- GitHub workflow (issue/PR/checks/reviews/.github):
  - `.ai/skills/codex/github-ops`
- UI flow regression/e2e:
  - `.ai/skills/codex/architecture-browser-master`
- Vague or multi-surface task routing:
  - `.ai/skills/codex/task-orchestrator`
- Cursor compatibility:
  - `.ai/skills/cursor/{github,playwright-mcp}`

## 4) Low-Token Skill Routing

Before opening multiple skill docs, route the task first:

```bash
python3 .ai/skills/codex/task-orchestrator/scripts/skill_router.py "处理 GitHub PR review comments 并检查 .github workflows" --json
```

This returns:

- the smallest likely skill set
- the prechecks to run first
- token-saving guidance for that route

Use this when the task is vague, spans multiple surfaces, or might involve browser/GitHub workflows.

## 5) Browser Recorder Workflow

For repeated UI tasks, stop re-describing browser steps to the model.

1. Record the real flow in Playwright CRX and export Python.
2. Import the recording once:

```bash
python3 .ai/skills/codex/architecture-browser-master/scripts/browser_automator.py \
  flow-import \
  --recording /absolute/path/to/recording.py \
  --flow-name login-flow
```

3. Replay it locally through Playwright CLI:

```bash
python3 .ai/skills/codex/architecture-browser-master/scripts/browser_automator.py \
  flow-run \
  --flow artifacts/browser/flows/login-flow.json \
  --session login-flow
```

4. If login is involved, add `--state-in` or `--state-out` so the session becomes reusable.

This keeps Codex at the orchestration layer while the browser work runs through local scripts and compact summaries.

## 6) Task Prompt Template (Copy and Fill)

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
  .ai/skills/core/vue
  .ai/skills/core/vueuse-functions
  .ai/skills/core/unocss
  .ai/skills/core/vite
  .ai/skills/codex/task-orchestrator
  .ai/skills/codex/architecture-browser-master
  .ai/skills/codex/github-ops
  .ai/skills/cursor/github
  .ai/skills/cursor/playwright-mcp
- Explain selection briefly before implementation.

Output format:
1) Ready for Action checklist
2) Implementation plan
3) Code changes
4) Validation results (type-check/lint/test/e2e as needed)
5) Risks and follow-ups
```

## 7) Reuse in New CCD-Based Product Repos

Copy these files into the new repo root:

- `.ai/README.md`
- `.ai/config/cursor.settings.json`
- `.ai/protocol/AI.entry.md`
- `.ai/protocol/AGENTS.core.md`
- `.ai/runtime/repair_list.template.txt`
- `docs/codex/quickstart.md`
- `scripts/ai-doctor.mjs`
- `scripts/ai-sync.mjs`
- `scripts/ai-sync-codex.mjs`
- `scripts/codex-preflight.mjs`

Then add `ai:doctor`, `ai:sync`, `ai:sync:codex`, and `codex:preflight` to `package.json` scripts and run:

```bash
pnpm ai:sync
pnpm ai:sync:codex
pnpm ai:clean
pnpm ai:doctor
pnpm codex:preflight
```

`pnpm ai:clean` is conservative by default. Use `pnpm ai:clean -- --all` only when you explicitly want to drop local browser artifacts, `tmp/`, and Codex browser session caches.
