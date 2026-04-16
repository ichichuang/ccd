# AI Entry (Unified)

Canonical AI protocol is:

- `.ai/protocol/AGENTS.core.md`

Load this entrypoint, then continue with:

1. `.ai/protocol/AGENTS.core.md`
2. `.ai/rules/core/00-global-architect.mdc`
3. `.ai/rules/core/00-root-gatekeeper.mdc`
4. `.ai/rules/core/01-global-preflight.mdc`
5. `.ai/rules/core/02-ui-preflight.mdc` when visual surfaces are touched
6. Domain rules under `.ai/rules/**`

This file is the shared entrypoint target for:

- `AGENTS.md` (Codex and other AGENTS-aware agent CLIs)

Per-AI adapter guidance:

- Codex: `.ai/protocol/adapters/codex.md`
- Cursor: `.ai/protocol/adapters/cursor.md`

Current repo defaults:

- Treat this repository as `Vue 3 + TypeScript + Vite + UnoCSS + PrimeVue + Playwright`.
- Treat desktop-runtime changes as `Tauri v2 + guest bindings` bridge work; route to `.ai/skills/codex/desktop-tauri-guard`.
- Prefer Playwright CLI plus `.ai/skills/codex/architecture-browser-master`.
- Prefer Playwright CRX for recording browser flows, then import the exported Python into `.ai/skills/codex/architecture-browser-master` flow assets.
- Fall back to `.ai/skills/cursor/playwright-mcp` only when the CLI route cannot satisfy the task.
- For desktop branch drift-sensitive changes, run `pnpm sync:desktop-config` and `pnpm check:drift`.
- Keep user-facing pages within Lighthouse 90+ budgets unless the task explicitly says otherwise.

Cross-project full-stack defaults:

- When a touched workspace uses React or Next.js, prefer TypeScript, Tailwind, React Server Components, Prisma, and tRPC.
- Keep schema-first data design, unified error handling, unit tests, and Playwright E2E coverage.
- Apply the same performance target of Lighthouse 90+ for user-facing routes.

Core mandate:

- `.ai/**` is the only source of truth.
- Adapter paths (`AGENTS.md`, `.cursor/**`) are generated compatibility entrypoints only.
- Materialize repo adapters with `pnpm ai:sync` and local Codex skills with `pnpm ai:sync:codex`.
