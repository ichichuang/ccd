# AI Workspace Standard

This repository uses `.ai/` as the single source of truth for all AI collaboration assets.

## Branch Governance

CCD currently uses three sibling delivery branches:

| Branch                  | AI Governance Contract                                      |
| ----------------------- | ----------------------------------------------------------- |
| `main`                  | Full Web architecture source with examples, docs, and gates |
| `desktop-version`       | Tauri v2 desktop rebuild line; desktop guardrails active    |
| `main-portable-version` | Clean portable starter; preserve `.ai/**` minimal contract  |

Only `main`, `desktop-version`, and `main-portable-version` are active governance branches.

## Canonical Paths

- Config: `.ai/config/**`
- Rules: `.ai/rules/**`
- Skills: `.ai/skills/**`
- Protocol: `.ai/protocol/**`
- Runtime templates: `.ai/runtime/*.template.txt`
- Manifests/locks: `.ai/manifests/**`

## Governance Generation

Generated governance outputs:

- `.ai/generated/**` -> machine-readable governance, compatibility, and drift outputs
- `docs/generated/**` -> generated reports and Mermaid diagrams
- `.ai/orchestration/**` -> declarative agent roles, scopes, permissions, and routing constraints
- `.ai/migrations/**` -> protocol evolution assets

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

## State Synchronization Contract

CCD uses an explicit client-side synchronization boundary for cross-tab and cross-device state.
Treat synchronization as an opt-in capability, not a default store behavior.

Canonical implementation:

- `src/sync/syncAction.ts`
- `src/sync/registry.ts`
- `src/sync/middleware.ts`
- `src/sync/runtime.ts`
- domain sync modules under `src/sync/**`

AI agents and human contributors MUST follow these rules:

- Cross-tab / cross-device state changes go through `syncAction(type, payload)`.
- Every sync type must be registered before use.
- Sync handlers patch only the owner store and run required side effects.
- Payloads include `updatedAt` and exclude runtime-only fields.
- Business stores are not automatically syncable; each domain sync type requires intentional design.
- Do not add `store.$subscribe()` based automatic synchronization.
- Do not send state sync frames directly through `BroadcastChannel` or `WebSocket` outside `src/sync/**`.
- Non-state transport exceptions require an explicit `scripts/ai-architecture-guard.mjs` allowlist entry.

State classification:

| State class                                    | Sync policy                                       |
| ---------------------------------------------- | ------------------------------------------------- |
| User preferences                               | Sync explicitly                                   |
| User-authored drafts / presets                 | Sync explicitly when product requires it          |
| List/dashboard server data                     | Usually re-fetch; sync only user-authored changes |
| Loading, modal, drawer, hover, animation       | Never sync                                        |
| Device, breakpoint, layout runtime derivations | Never sync                                        |

Architecture reference: [docs/architecture.md](../docs/architecture.md#explicit-sync-boundary).

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
- Validate command runtime: `pnpm env:doctor`
- Verify deterministic runtime wrapper: `pnpm runtime:env`
- Strict runtime migration gate: `pnpm runtime:env:strict`
- Quick architecture check: `pnpm arch:check:fast`
- One-shot architecture check: `pnpm arch:check`
- Full architecture gate: `pnpm arch:check:full`
- Clean local AI/browser runtime residue: `pnpm ai:clean`
- Aggressive cleanup when needed: `pnpm ai:clean -- --all`
- Validate structure: `pnpm ai:doctor` (runs `ai:guard` and `validate:tokens`)
- Validate generated business surfaces: `pnpm ai:guard`
- Validate theme token semantics and contrast: `pnpm validate:tokens`
  - `action` / `text` pairs must satisfy `>= 4.5`
  - `subtle` pairs must satisfy `>= 3.0`
  - decorative pairs such as `*-light` and `*-light-foreground` are non-blocking by default and surface as advisories
- Check drift-sensitive docs/config/style contracts: `pnpm drift-check`
- Check desktop/Tauri config surface when relevant: `pnpm sync:desktop-config`
- Run Codex preflight: `pnpm codex:preflight`

Recommended maintenance order:

```bash
pnpm arch:check
```

Governance reference: [docs/governance.md](../docs/governance.md).
