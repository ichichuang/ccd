# CCD AI Workspace

This document explains how CCD's documentation system, AI workspace, and browser automation stack fit together.

If you only need the repo entrypoint, read [README.md](../README.md).
If you only need Codex startup commands, read [docs/codex/quickstart.md](./codex/quickstart.md).

---

## Documentation Map

| Document                                          | Purpose                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| [README.md](../README.md)                         | Product-facing entrypoint, branch model, setup, command map                       |
| [docs/branch-model.md](./branch-model.md)         | Branch roles for `main`, `desktop-version`, and `main-portable-version`           |
| [docs/architecture.md](./architecture.md)         | Runtime architecture, engine design, performance strategy, directory contracts    |
| [docs/ai-workspace.md](./ai-workspace.md)         | AI workspace topology, browser automation, generated artifacts, cleanup lifecycle |
| [docs/codex/quickstart.md](./codex/quickstart.md) | Codex-first workflow, skill routing, browser recorder usage                       |
| [.ai/README.md](../.ai/README.md)                 | Canonical AI workspace standard and maintenance contract                          |

The goal is to keep product architecture, AI governance, and day-to-day tooling separated but consistent.

---

## Workspace Topology

CCD now uses a Codex-first AI workspace with `.ai/` as the single source of truth.

### Canonical Source

- `.ai/config/**`
- `.ai/rules/**`
- `.ai/skills/**`
- `.ai/protocol/**`
- `.ai/manifests/**`
- `.ai/runtime/*.template.txt`

### Generated Adapters

- `AGENTS.md`
- `CLAUDE.md`

These are compatibility outputs only. They are regenerated from `.ai/**` and must not be treated as source files.

### Local Materialization

- `~/.codex/skills/**`

Codex discovers repo-managed skills through local installation, but those skills still originate from `.ai/skills/core/** + .ai/skills/codex/**`.

---

## Skill Topology

CCD intentionally separates skills by responsibility.

| Tier                | Location              | Role                                                                    |
| ------------------- | --------------------- | ----------------------------------------------------------------------- |
| Core implementation | `.ai/skills/core/**`  | Vue, VueUse, UnoCSS, Vite, and framework-adjacent implementation work   |
| Codex operations    | `.ai/skills/codex/**` | Routing, browser automation, GitHub automation, low-token orchestration |

Current high-leverage Codex skills:

- `task-orchestrator`
- `architecture-browser-master`
- `github-ops`

This split keeps framework knowledge reusable while allowing Codex-only workflows to evolve without polluting compatibility layers.

---

## Browser Automation System

CCD's browser workflow is designed to keep the model at the orchestration layer and move repetitive browser work into local scripts.

### Preferred Flow

1. Record a real interaction with Playwright CRX.
2. Export Python.
3. Import once with `flow-import`.
4. Replay many times with `flow-run`.
5. Save or load auth state only when needed.

Example:

```bash
python3 .ai/skills/codex/architecture-browser-master/scripts/browser_automator.py \
  flow-import \
  --recording /absolute/path/to/recording.py \
  --flow-name login-flow

python3 .ai/skills/codex/architecture-browser-master/scripts/browser_automator.py \
  flow-run \
  --flow artifacts/browser/flows/login-flow.json \
  --session login-flow
```

### Why This Matters

- Codex reads compact `summary.json` outputs instead of repeatedly inspecting the DOM.
- Stable UI flows become reusable local assets rather than prompt text.
- Browser debugging remains scriptable, reviewable, and cheaper in tokens.

---

## Generated And Runtime Artifacts

### Generated Outputs

- `AGENTS.md`
- `CLAUDE.md`
- `~/.codex/skills/**`

These are refreshed by:

```bash
pnpm ai:sync
pnpm ai:sync:codex
```

Business route/page generation is validated by:

```bash
pnpm ai:guard
```

### Runtime State

- `.ai/runtime/repair_list.txt`
- `artifacts/browser/**`
- `~/.codex/tmp/architecture-browser-master/**`

These are not canonical source. They exist to support local AI and browser workflows.

---

## Cleanup Model

CCD now has an explicit cleanup contract instead of leaving browser residue unmanaged.

### Conservative Cleanup

```bash
pnpm ai:clean
```

This removes safe residue such as empty browser session directories and empty local Codex browser cache folders.

### Aggressive Cleanup

```bash
pnpm ai:clean -- --all
```

This additionally removes:

- `artifacts/browser/**`
- `tmp/`
- `~/.codex/tmp/architecture-browser-master/**`

Use aggressive cleanup only when you intentionally want to discard local evidence and browser cache state.

---

## Branch And Desktop Governance

The old `feat/tauri-integration` branch is retired. The current branch model is:

- `main`: optimized Web architecture source with complete examples, docs, AI governance, and demo delivery.
- `desktop-version`: new sibling branch for rebuilding the Tauri v2 desktop application system from the final `main` baseline.
- `main-portable-version`: new sibling branch for a clean portable starter without unnecessary examples, demo directories, or redundant config.

Current governance rules are:

- AI governance adapters must stay synced through `pnpm ai:sync` and `pnpm ai:sync:codex`.
- `pnpm arch:check` is the one-shot local command for adapter sync, Codex skill sync, architecture doctor, drift check, Codex preflight, and `git diff --check`.
- `pnpm ai:doctor` verifies generated adapters and whether Husky / CI still invoke the doctor gate.
- CI runs `pnpm drift-check` and reruns sync to block drift if `AGENTS.md`, `CLAUDE.md`, or `.ai/manifests/skills-lock.json` would change.
- Desktop / Tauri runtime assets belong to `desktop-version`; desktop bridge and capability changes still require `pnpm sync:desktop-config` and `pnpm check:drift`.
- Portable cleanup belongs to `main-portable-version`; it must preserve `.ai/**` and generated adapter usability while pruning example-specific residue.

---

## Recommended Maintenance Cycle

For normal development:

```bash
pnpm arch:check
```

For new business routes/pages:

```bash
pnpm ai:scaffold:view-route -- --segment system/user --title-key router.system.user.index --kind table
pnpm ai:guard
pnpm ai:doctor
```

This is now the required scaffold-first path. Do not hand-write a fresh business route/view/hook trio when the scaffold command fits.

For browser-heavy work:

```bash
pnpm ai:route:skills "任务描述"
pnpm ai:clean
```

For architecture releases:

1. update canonical docs and skills
2. run local validation
3. commit to `main`
4. explicitly propagate applicable changes to `desktop-version` or `main-portable-version`
5. confirm CI drift defense stays clean after re-running sync in automation

This keeps documentation, automation, and generated adapters aligned around the same source of truth.
