# CCD Codex Quickstart

This guide is for CCD architecture projects only.

Read this together with:

- `README.md`
- `docs/governance/product-lines.md`
- `docs/architecture.md`
- `docs/ai-workspace.md`
- `.ai/README.md`

## 1) One-Time Setup Per Repo

1. Ensure these paths exist:
   - `.ai/config/**`
   - `.ai/rules/**`
   - `.ai/skills/**`
   - `.ai/protocol/**`
2. Generate local adapters and install repo-managed Codex skills:

```bash
pnpm ai:setup:codex
```

Equivalent expanded sequence:

```bash
pnpm ai:sync
pnpm ai:sync:codex
pnpm ai:doctor
pnpm codex:preflight
```

For day-to-day architecture validation, use the one-shot command:

```bash
pnpm arch:check
```

Use `pnpm governance:gate` before PRs or architecture changes. Use `pnpm arch:check:fast` for quick local AI adapter feedback and `pnpm arch:check:full` for broader local validation when needed.

Extended governance commands:

```bash
pnpm governance:gate
pnpm arch:snapshot
pnpm arch:report
pnpm arch:visualize
pnpm env:doctor
pnpm runtime:env
pnpm runtime:env:strict
pnpm governance:validate
pnpm release:governance
pnpm protocol:migrate
pnpm adapters:validate
pnpm orchestration:validate
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

## 3.5) Branch Routing

- Work on `main` for shared core/Web architecture, governance, and browser-first delivery.
- Work in `apps/desktop` for Tauri v2 runtime, desktop bridge, capabilities, release metadata, and desktop validation.
- Treat portable starter branch guidance as historical; cleanup now happens in workspace packages and apps.
- Use the workspace package graph as the runtime SSOT.

Runtime references:

- `docs/runtime/web-runtime.md`
- `docs/runtime/desktop-runtime.md`
- `docs/runtime/portable-runtime.md`

## 4) Low-Token Skill Routing

Before opening multiple skill docs, route the task first:

```bash
pnpm ai:route:skills "处理 GitHub PR review comments 并检查 .github workflows" --json
```

This returns:

- the smallest likely skill set
- the prechecks to run first
- token-saving guidance for that route

Use this when the task is vague, spans multiple surfaces, or might involve browser/GitHub workflows.

## 4.2) New Route/Page Workflow

When Codex creates a new business page or route, start with the scaffold command instead of freehand generation:

```bash
pnpm ai:scaffold:view-route -- --segment system/user --title-key router.system.user.index --kind table
pnpm ai:guard
pnpm ai:doctor
```

Rules enforced by `pnpm ai:guard` include:

- no direct `router.push/replace` in business views
- no direct `@/api/**` imports in business views
- no native `<form>` in business views
- no sync `@/views/**` imports inside route modules
- no route records missing `name` or `meta.titleKey/title`
- no generated-code policy violations under governed apps/packages

## 4.5) Cleanup And Residue

Codex browser work can create local runtime state, especially when you save auth state or keep named sessions.

Common locations:

- `artifacts/browser/**`
- `~/.codex/tmp/architecture-browser-master/**`

Cleanup commands:

```bash
pnpm ai:clean
pnpm ai:clean -- --all
```

Use the conservative mode by default. Use `--all` only when you explicitly want to drop local browser evidence and cache state.

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

## 5.5) Generated Artifact Drift Context

If your change touches canonical AI governance assets, expect CI to rerun `pnpm ai:sync` and `pnpm ai:sync:codex`.

If those commands would modify `AGENTS.md`, `CLAUDE.md`, or `.ai/manifests/skills-lock.json`, CI will fail and require you to commit the synced artifacts first.

If your change touches topology, governance policies, public exports, or release rules, run:

```bash
pnpm governance:gate
```

Commit any resulting changes under `docs/generated/**`, `.ai/generated/**`, or `.ai/governance/api-snapshots/**`.

## 6) Task Prompt Template (Copy and Fill)

```text
Implement [feature-name] on CCD architecture.

Must follow:
1) AGENTS.md
2) .ai/protocol/AGENTS.core.md
3) .ai/rules/core/00-global-architect.mdc
4) .ai/rules/core/00-root-gatekeeper.mdc
5) .ai/rules/core/01-global-preflight.mdc
6) .ai/rules/core/02-ui-preflight.mdc when visual surfaces are touched
7) Domain rules under .ai/rules/{architecture,components,core,design-system,integrations}

Skill policy:
- Select only required skills from:
  .ai/skills/core/vue
  .ai/skills/core/vueuse-functions
  .ai/skills/core/unocss
  .ai/skills/core/vite
  .ai/skills/codex/task-orchestrator
  .ai/skills/codex/architecture-browser-master
  .ai/skills/codex/github-ops
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
- `.ai/protocol/adapter-manifest.json`
- `.ai/protocol/AI.entry.md`
- `.ai/protocol/AGENTS.core.md`
- `.ai/runtime/repair_list.template.txt`
- `docs/codex/quickstart.md`
- `scripts/ai-doctor.mjs`
- `scripts/ai-architecture-guard.mjs`
- `scripts/ai-route-view-scaffold.mjs`
- `scripts/ai-sync.mjs`
- `scripts/ai-sync-codex.mjs`
- `scripts/codex-preflight.mjs`
- `scripts/drift-check.mjs`
- `scripts/validate-token-contrast.ts`

Then add the AI governance scripts to `package.json` and run:

```bash
pnpm ai:setup:codex
pnpm arch:check
```

If the target branch has desktop/Tauri runtime assets, also add and run:

```bash
pnpm sync:desktop-config
```

`pnpm ai:clean` is conservative by default. Use `pnpm ai:clean -- --all` only when you explicitly want to drop local browser artifacts, `tmp/`, and Codex browser session caches.
