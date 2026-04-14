# CCD AI Core Protocol (SSOT)

Canonical AI collaboration contract for all CCD-based projects.

## 0) Canonical Structure

All AI governance assets live under `.ai/`:

- `.ai/rules/**` -> architecture and implementation rules
- `.ai/skills/**` -> skill catalogs and references
- `.ai/protocol/**` -> execution protocol and adapters
- `.ai/runtime/**` -> runtime task ledgers and mutable coordination files
- `.ai/manifests/**` -> lock/manifests

Compatibility paths (`AGENTS.md`, `CLAUDE.md`, `.cursor/**`, `.claude/**`) are adapters only. Do not treat them as source-of-truth.

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
- For large refactors, keep runtime ledger synchronized via `.ai/runtime/repair_list.txt`.

## 2) Rule Priority

Apply precedence from `core/00-global-architect.mdc`:

1. L1 Runtime and Data Safety
2. L2 Architecture Laws
3. L3 Implementation Rules
4. L4 Examples (non-authoritative)

Bootstrap order per task:

1. `.ai/rules/core/00-global-architect.mdc`
2. `.ai/rules/core/00-root-gatekeeper.mdc`
3. `.ai/rules/core/01-preflight-checklist.mdc`
4. Domain rules by touched modules

## 3) Skill Routing Strategy

Core implementation skills:

- `.ai/skills/claude/vue`
- `.ai/skills/claude/vueuse-functions`
- `.ai/skills/claude/unocss`
- `.ai/skills/claude/vite`

Tooling skills:

- `.ai/skills/cursor/github`
- `.ai/skills/cursor/playwright-mcp`

Adapter note:

- Some tools expose aliases like `@.claude/skills/*` or `@.cursor/skills/*`; these are aliases of `.ai/skills/**`.

Policy:

- Select the minimal required skill set for the task.
- Avoid unrelated skill mixing.
- Apply in sequence: rules -> implementation skills -> delivery/testing skills.

## 4) Mandatory Workflow

1. Understand requirement and map touched modules.
2. Load rules and extract hard constraints.
3. Select skills and state why each is required.
4. Execute preflight checklist (`core/01-preflight-checklist.mdc`).
5. Implement with boundary/type discipline.
6. Validate with targeted checks.
7. Report changed files, rules/skills used, validation results, and residual risks.

## 5) Validation Baseline

Run when relevant:

- `pnpm ai:doctor`
- `pnpm codex:preflight`
- `pnpm type-check`
- `pnpm lint:check`
- `pnpm test:run`

For UI-critical changes, run e2e via `.ai/skills/cursor/playwright-mcp`.
