# AI Workspace Governance

CCD's AI workspace is the local operating surface for the governance system. It connects canonical `.ai/**` assets, generated adapters, Codex skills, browser automation, and validation commands into one orchestration flow.

If you only need the product entrypoint, read [README.md](../README.md). If you only need governance strategy, read [docs/governance.md](./governance.md). If you only need Codex startup commands, read [docs/codex/quickstart.md](./codex/quickstart.md).

---

## Documentation Map

| Document                                                          | Purpose                                                          |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| [README.md](../README.md)                                         | Product matrix and architecture entrypoint                       |
| [docs/governance/product-lines.md](./governance/product-lines.md) | Product line strategy and runtime separation                     |
| [docs/architecture.md](./architecture.md)                         | Multi-runtime architecture and isolation principles              |
| [docs/governance.md](./governance.md)                             | AI-native governance system and command tiers                    |
| [docs/ai-workspace.md](./ai-workspace.md)                         | AI workspace governance, generated artifacts, browser automation |
| [docs/runtime/web-runtime.md](./runtime/web-runtime.md)           | Web runtime contract                                             |
| [docs/runtime/desktop-runtime.md](./runtime/desktop-runtime.md)   | Desktop runtime contract                                         |
| [docs/runtime/portable-runtime.md](./runtime/portable-runtime.md) | Portable runtime contract                                        |
| [docs/codex/quickstart.md](./codex/quickstart.md)                 | Codex workflow and skill routing                                 |
| [.ai/README.md](../.ai/README.md)                                 | Canonical AI workspace standard                                  |

---

## Governance Flow

```text
authoring
  -> sync
  -> adapter generation
  -> governance gate
  -> remote workflow registry hygiene
  -> generated artifact drift validation
```

Use the architecture entrypoint:

```bash
pnpm governance:gate
```

Command tiers:

| Command                            | Scope                                                             |
| ---------------------------------- | ----------------------------------------------------------------- |
| `pnpm governance:gate`             | single CI-grade governance gate for architecture protection       |
| `pnpm governance:github-workflows` | GitHub Actions registry hygiene and orphan workflow detection     |
| `pnpm env:doctor`                  | node/pnpm runtime and shell wrapper validation                    |
| `pnpm runtime:env`                 | deterministic runtime wrapper verification                        |
| `pnpm runtime:env:strict`          | strict Node `mise` migration gate                                 |
| `pnpm arch:check:fast`             | `env:doctor + ai:doctor + drift-check`                            |
| `pnpm arch:check`                  | env, sync, Codex sync, doctor, drift, Codex preflight, diff check |
| `pnpm arch:check:full`             | `arch:check + lint + type-check + test:run`                       |

---

## Workspace Topology

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
- `~/.codex/skills/**`

These are compatibility outputs only. They are regenerated from `.ai/**` and must not be treated as source files.

### Runtime State

- `.ai/runtime/repair_list.txt`
- `.ai/runtime/repair-ledger.json`
- `artifacts/browser/**`
- `~/.codex/tmp/architecture-browser-master/**`

Runtime state supports local work and browser evidence. It is not canonical architecture source.

---

## Skill Topology

| Tier                | Location              | Role                                                                  |
| ------------------- | --------------------- | --------------------------------------------------------------------- |
| Core implementation | `.ai/skills/core/**`  | Vue, VueUse, UnoCSS, Vite, and framework-adjacent implementation work |
| Codex operations    | `.ai/skills/codex/**` | Routing, browser automation, GitHub automation, desktop guardrails    |

Current high-leverage Codex skills:

- `task-orchestrator`
- `architecture-browser-master`
- `github-ops`
- `desktop-tauri-guard`

---

## Browser Automation System

CCD keeps browser automation scriptable and low-token:

```text
Playwright CRX
  -> Python export
  -> flow-import
  -> flow-run
  -> summary.json
```

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

Principles:

- Codex reads compact summaries before raw logs or screenshots.
- Stable UI flows become reusable local assets.
- Auth state is saved only when the task requires it.

---

## Cleanup Model

Conservative cleanup:

```bash
pnpm ai:clean
```

Aggressive cleanup:

```bash
pnpm ai:clean -- --all
```

Aggressive cleanup can remove browser artifacts, `tmp/`, and Codex browser session caches. Use it only when local evidence can be discarded.

---

## Workspace Runtime Governance

- `packages/contracts`: implementation-free interfaces and shared types.
- `packages/core`: runtime-neutral platform logic.
- `apps/web-demo`: browser runtime adapters.
- `apps/desktop`: Tauri runtime adapters.
- `root`: orchestration-only shell.
- `legacy/root-app`: read-only historical archive; never imported by active graphs.

For architecture releases:

1. update canonical docs, rules, scripts, or skills
2. run `pnpm governance:gate`
3. run targeted runtime checks when needed
4. keep generated reports, API snapshots, and adapters committed with their source changes
