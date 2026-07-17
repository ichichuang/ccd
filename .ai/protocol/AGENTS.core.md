# CCD AI Core Protocol (SSOT)

Canonical AI collaboration contract for all CCD-based projects.

## 0) Canonical Structure

All AI governance assets live under `.ai/`:

- `.ai/config/**` -> canonical tool/editor configuration
- `.ai/rules/**` -> architecture and implementation rules
- `.ai/skills/**` -> skill catalogs and references
- `.ai/protocol/**` -> execution protocol and adapters
- `.ai/runtime/*.template.md` -> versioned runtime templates
- `.ai/manifests/**` -> lock/manifests

Compatibility paths (`AGENTS.md`, `CLAUDE.md`) are generated adapters only. Do not treat them as source-of-truth.

## 1) Non-Negotiable Constraints

- Load and follow applicable rules before coding.
- Reuse existing wrappers/hooks/utils before creating new abstractions.
- Keep strict layer boundaries:
  - No raw `fetch` / `axios` / `XMLHttpRequest`
  - No raw `localStorage` / `sessionStorage` for business data
  - No direct HTTP<->router/store cross-coupling outside approved bridges
- Preserve type safety:
  - No `any` in business code
  - No assertion-driven business logic shortcuts
- For large refactors, keep the local runtime ledger synchronized via `.ai/runtime/repair_list.md`.

## 2) Rule Priority

Apply precedence from `core/00-global-architect.mdc`:

1. L1 Runtime and Data Safety
2. L2 Architecture Laws
3. L3 Implementation Rules
4. L4 Examples (non-authoritative)

Bootstrap order per task:

1. `.ai/rules/core/00-global-architect.mdc`
2. `.ai/rules/core/00-root-gatekeeper.mdc`
3. `.ai/rules/core/01-global-preflight.mdc`
4. `.ai/rules/core/02-ui-preflight.mdc` when visual surfaces are touched
5. `.ai/rules/core/10-ai-generation-workflow.mdc` when creating or restructuring routes/pages/hooks
6. Domain rules by touched modules

## 3) Skill Routing Strategy

Core implementation skills:

- `.ai/skills/core/vue`
- `.ai/skills/core/vueuse-functions`
- `.ai/skills/core/unocss`
- `.ai/skills/core/vite`

Codex-first tooling skills:

- `.ai/skills/codex/task-orchestrator`
- `.ai/skills/codex/architecture-browser-master`
- `.ai/skills/codex/github-ops`
- `.ai/skills/codex/desktop-tauri-guard`

Adapter note:

- `AGENTS.md` is the generated shared entrypoint for Codex and AGENTS-aware tools.
- `CLAUDE.md` is the generated Claude AI pointer to `AGENTS.md`.
- Codex and Claude Skill copies are noncanonical runtime materializations of repository `.ai/skills/**` sources.

Automatic trigger heuristics:

- Run the Node router at `.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs` first; use the Python router only as a fallback.
- For Vue SFCs, composables, UnoCSS, Vite, or toolchain edits, load the matching `.ai/skills/core/*` skill for the touched surface.
- Route generic UI work with explicit UI evidence to `project-ui`; non-UI Vue work may route to `vue` without activating `project-ui`.
- For new page or route composition with explicit creation evidence, route to `project-ui` + `task-orchestrator` + `vue`.
- Activate `.ai/skills/codex/architecture-browser-master` only for explicit browser, screenshot, navigation, Playwright, or runtime-validation evidence.
- For Playwright CRX recordings, codegen exports, traces, or recorded-flow replay, route to `.ai/skills/codex/architecture-browser-master` and prefer local flow import or replay over manual browser rediscovery.
- For ambiguous, multi-step, or cross-module tasks, route to `.ai/skills/codex/task-orchestrator` before editing.
- For GitHub, PR, issue, review comment, Actions, workflow, CI, release, branch protection, or `.github/**` tasks, route to `.ai/skills/codex/github-ops`.
- For GitHub tasks, inspect `.github/**`, current git remotes, and workflow files before acting so the chosen automation matches repo reality.
- For Tauri, desktop bridge, capability sync, `src-tauri/**`, `desktopWindow`, or desktop drift-cleanup tasks, route to `.ai/skills/codex/desktop-tauri-guard`.

Policy:

- Select the minimal required skill set for the task.
- Avoid unrelated skill mixing.
- Prefer machine-readable summaries and route manifests before opening large reference trees.
- Apply in sequence: rules -> implementation skills -> delivery/testing skills.

## 3.5) Protocol Versioning

Canonical version contract:

- `.ai/protocol/version.json`
- adapters must declare compatible protocol and adapter versions
- incompatible protocol projections must fail validation before execution
- migrations live under `.ai/migrations/**`

Validation commands:

- `pnpm protocol:migrate`
- `pnpm adapters:validate`
- `pnpm governance:validate`

## 4) Mandatory Workflow

1. Understand requirement and map touched modules.
2. Load rules and extract hard constraints.
3. Select skills and state why each is required.
4. Execute applicable preflight checklists (`core/01-global-preflight.mdc`, plus `core/02-ui-preflight.mdc` for visual surfaces).
5. Implement with boundary/type discipline.
6. Validate with targeted checks.
7. Report changed files, rules/skills used, validation results, and residual risks.

## 5) Validation Baseline

Run when relevant:

- `pnpm ai:guard`
- `pnpm ai:doctor`
- `pnpm env:doctor`
- `pnpm runtime:env`
- `pnpm runtime:env:strict`
- `pnpm runtime:exec`
- `pnpm runtime:exec:strict`
- `pnpm codex:preflight`
- `pnpm arch:runtime` for quick runtime leak detection
- `pnpm governance:gate` for one-shot architecture sync and validation
- `pnpm validate:governance` for PR/release local gates
- `pnpm type-check`
- `pnpm lint:check`
- `pnpm test:run`
- `pnpm sync:desktop-config` + `pnpm check:drift` for desktop bridge/capability changes

When browser validation is explicitly required, prefer Playwright CLI plus `.ai/skills/codex/architecture-browser-master`.

## 6) Stack Defaults

- Current repo truth: pnpm + Turbo monorepo with Vue 3, TypeScript, Vite, UnoCSS, PrimeVue, Vitest, and Playwright.
- Workspace truth: `packages/contracts -> packages/core -> apps/*` is the active runtime topology.
- Branch-based runtime lanes are retired; runtime ownership lives in workspace packages and app adapters.
- Preserve existing repository patterns before introducing React or Tailwind-specific abstractions.
- Keep performance work measurable and bias toward Lighthouse 90+ for user-facing routes.

## 7) Cross-Project Full-Stack Defaults

- When a touched workspace is React or Next.js based, prefer TypeScript, Tailwind, React Server Components, Prisma, and tRPC.
- Keep database work schema-first and centralize error handling at API boundaries.
- Require unit tests plus Playwright E2E coverage for risky user flows.
- Use Conventional Commits and keep diffs reviewable.

## Deterministic Skill Routing

Resolve repository Skills from task and path evidence before implementation:

```text
pnpm ai:route:skills -- "<task>" --json
```

The Node router is primary. Use `pnpm ai:route:skills:python -- "<task>" --json` only as the fallback. Load the stable Skill IDs returned by the normalized result; do not infer client-specific paths or branch-specific lanes.

Routing policy:

- Generic UI evidence selects `project-ui` as the primary route.
- New page or route composition requires explicit creation evidence and selects `project-ui` + `task-orchestrator` + `vue`.
- Browser validation requires explicit browser, screenshot, navigation, Playwright, or runtime evidence.
- Motion Skills activate only from explicit motion evidence; GSAP and animate-lite require their own narrow evidence.
- UnoCSS and Vite Skills activate only from their isolated configuration or implementation evidence.
- Non-UI requests remain isolated from the UI route chain.
- Existing design Skills and rules remain available through conditional routing; no legacy retirement is implied.

Validate routing with `pnpm ai:routing:validate`. Synchronize repository-owned Skills to an isolated Codex target with `pnpm ai:sync:codex`, an isolated Claude project with `pnpm ai:sync:claude`, or both with `pnpm ai:sync:skills`. Synchronized copies are noncanonical materializations; `.ai/**` remains the repository authority.
