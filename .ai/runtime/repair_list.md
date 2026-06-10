# CCD Runtime Repair Ledger

- Target path: `.ai/runtime/repair_list.md`
- Template source: `.ai/runtime/repair_list.template.md`
- Owner decisions: `.ai/runtime/owner_decisions.md`
- Strategic guardrails: `docs/governance/strategic-guardrails.md`
- Rule coverage: `.ai/runtime/rule_coverage_matrix.md`
- Generated JSON target: `.ai/runtime/repair-ledger.json`
- Runtime state policy: `.ai/runtime/repair_list.md` is local runtime state; `pnpm ai:sync` may create it from `.ai/runtime/repair_list.template.md` when missing, but must not overwrite it once it exists.
- Last cleaned: 2026-06-10
- Cleanup rule applied: all completed repair task lines were removed. This file contains no actionable open repair items.
- Owner decision: keep the current CCD repository and perform staged modernization, not a full rebuild.

## 0. Purpose

This ledger is the AI-readable open repair surface for CCD after the final P4 strategic guardrail closure.

P0, P1, P2, and P3 repair work is closed for the current architecture program. The only unchecked entries that remain are non-actionable P4 strategic guardrails. They stay visible to `pnpm ai:doctor --open` because current repository policy uses the open ledger as the durable warning surface for deferred strategic or blocked work.

Durable item details live in `docs/governance/strategic-guardrails.md`. This file intentionally keeps only parseable open task lines plus the minimum policy context required by AI workflows.

## 1. Ledger Format Contract

- Open strategic guardrails use unchecked task lines so `pnpm ai:doctor --open` remains warning-preserving.
- Actionable repair tasks must not be kept in this file unless they are current work with an owner-approved lane.
- Completed task lines are intentionally not kept in this cleaned runtime ledger.
- Each unchecked task must start with `- [ ] [Module] Task`.
- The `Module` label must include priority, for example `[P4-HttpCore-Blocked]`.
- Parser compatibility: `scripts/migrate-ledger.mjs` must parse `- [ ] [Module] Task`.
- Legacy icon lines are migration-only and must not be introduced into this ledger.

## 2. Architectural Non-Negotiables

- `packages/contracts` contains interfaces, DTOs, and cross-runtime contracts only.
- `packages/core` remains runtime-neutral and must not become a frontend utility bucket.
- Runtime capabilities must be injected through contracts and app adapters.
- Runtime APIs are allowed only in app adapter layers or approved runtime-specific boundaries.
- Root package remains orchestration-only.
- Internal package boundaries must remain visible through workspace package resolution and build outputs.
- Do not add global `@ccd/*` TypeScript path aliases to `tsconfig.base.json`.
- Do not weaken `governance:gate`, `ai:doctor`, `ai:guard`, generated artifact rules, architecture guard rules, dependency-cruiser rules, package-boundary checks, or supply-chain checks.
- Do not move alova HTTP runtime into `packages/core` or a generic shared request runtime.
- Do not move safeStorage crypto, compression, serializer, migration, or runtime facade into `@ccd/shared-utils`.
- Do not replace PrimeVue, alova, pnpm, Turborepo, Vite, Vue, or Tauri without direct source evidence and an approved architecture decision.
- Do not mix Vite major migration, UI refactor, HTTP runtime refactor, desktop security work, and dependency upgrades in one branch.
- Do not create a new organization, new repository, starter repository, standalone design-system repository, or full rebuild as a substitute for current-repo architecture repair.

## 3. Current Open Issue Statistics

| Priority | Count | Scope |
| -------- | ----: | ----- |
| P0 | 0 | No current blockers identified by the deep-research report. |
| P1 | 0 | High-priority governance/security/delivery defects are closed in this stage. |
| P2 | 0 | Medium-priority modernization and isolated dependency lanes are closed for this stage. |
| P3 | 0 | Cleanup, documentation, audit-readback, and developer-experience issues are closed for this stage. |
| P4 | 10 | Non-actionable strategic guardrails that remain visible to `ai:doctor --open`. |
| Total | 10 | No actionable open repair items remain. |

## 4. P0-P3 Closure

No open P0, P1, P2, or P3 tasks remain in this runtime ledger.

Completed evidence is recorded in the relevant governance and ADR documents:

- `docs/governance/README.md`
- `docs/governance/historical-artifacts.md`
- `docs/governance/github-governance.md`
- `docs/governance/dependency-policy.md`
- `docs/governance/desktop-security-scope-review.md`
- `docs/governance/primevue-i18n-verification.md`
- `docs/adr/ADR-004-runtime-environment-policy.md`
- `docs/adr/ADR-007-runtime-stack-and-tooling-choices.md`
- `docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md`

## 5. P4 Strategic Guardrails

These entries are non-actionable strategic guardrails. Do not implement them in repair, cleanup, dependency, desktop, or governance-closeout lanes unless the owner records a future approval with scope, prerequisites, validation, and rollback.

Detailed status, reason, prerequisites, owner approval requirement, allowed future lane, and validation guardrail for every item are recorded in:

- `docs/governance/strategic-guardrails.md`

### Tasks

- [ ] [P4-Desktop-RustCommands] NON-ACTIONABLE STRATEGIC GUARDRAIL: add Rust command handlers only through audited typed IPC boundaries when backend commands are actually introduced.
- [ ] [P4-Desktop-RustErrors] NON-ACTIONABLE STRATEGIC GUARDRAIL: use structured Rust-side IPC error types instead of string-only errors when commands are introduced.
- [ ] [P4-Desktop-UpdaterDeepLink-Blocked] NON-ACTIONABLE STRATEGIC GUARDRAIL: keep updater and deep-link runtime disabled until a desktop security model is approved.
- [ ] [P4-NewOrganization-Deferred] NON-ACTIONABLE STRATEGIC GUARDRAIL: do not create a new GitHub organization or new repository until current repository governance and architecture are stable and explicitly approved.
- [ ] [P4-Starter-Deferred] NON-ACTIONABLE STRATEGIC GUARDRAIL: create `ccd-vue-starter` only after public package APIs and release policy are stable.
- [ ] [P4-DesignSystem-Deferred] NON-ACTIONABLE STRATEGIC GUARDRAIL: split a standalone design-system repository only after UI primitives and adapter boundaries are stable.
- [ ] [P4-RekaUI-Deferred] NON-ACTIONABLE STRATEGIC GUARDRAIL: evaluate Reka UI only for specific headless primitive gaps after PrimeVue adapter boundaries are stable.
- [ ] [P4-TanStackQuery-Deferred] NON-ACTIONABLE STRATEGIC GUARDRAIL: evaluate TanStack Query Vue only if server-state complexity exceeds what alova plus explicit adapters can cleanly handle.
- [ ] [P4-HttpCore-Blocked] NON-ACTIONABLE STRATEGIC GUARDRAIL: do not promote alova HTTP runtime into `packages/core` or a new generic shared request package.
- [ ] [P4-SafeStorageShared-Blocked] NON-ACTIONABLE STRATEGIC GUARDRAIL: do not promote safeStorage crypto, compression, serializer, migration, maintenance, or runtime facade to `@ccd/shared-utils`.

## 6. Validation Matrix

Use the smallest valid validation set first, then escalate.

| Change type | Minimum validation | Full validation |
| ----------- | ------------------ | --------------- |
| Ledger Markdown change | `pnpm ai:sync`, `pnpm ai:doctor --open`, `pnpm codex:preflight` | `pnpm governance:gate` |
| Strategic guardrail registry | `pnpm docs:commands`, `pnpm ai:doctor --open` | `pnpm validate` |
| Generated/docs artifacts | `pnpm docs:commands`, `pnpm governance:gate` | `pnpm validate` |
| Runtime boundaries | `pnpm arch:runtime`, `pnpm arch:boundaries` | `pnpm validate` |
| Package/public API | `pnpm api:report`, package build | `pnpm build:ci`, `pnpm validate` |
| Desktop security | `pnpm desktop:security`, desktop smoke | `pnpm build:desktop`, cargo desktop check, `pnpm validate` |
| Remote governance readback | GitHub settings/API readback when authorized | `pnpm governance:github-workflows`, docs review |

## 7. Anti-Patterns

Do not do the following:

- Do not rewrite CCD from scratch.
- Do not create a new organization or repository as a substitute for architecture repair.
- Do not add a new all-in-one command while leaving `validate` misleading and partial.
- Do not keep overlapping public root aliases that have no distinct user-facing contract.
- Do not perform catalog centralization and dependency upgrades in the same change.
- Do not mix Vite major migration with script cleanup, UI work, HTTP runtime work, or dependency modernization.
- Do not promote app-owned HTTP runtime into `packages/core`.
- Do not promote safeStorage runtime into `@ccd/shared-utils`.
- Do not replace PrimeVue or alova without direct source evidence and owner approval.
- Do not add global `@ccd/*` TypeScript aliases.
- Do not hand-edit generated governance artifacts.
- Do not mutate GitHub branch protection, rulesets, or required checks without an explicit remote-governance lane.
- Do not treat deferred P4 strategy items as current defects.

## 8. Completion Criteria

This ledger is considered stable when:

- `.ai/runtime/repair_list.md` exists locally and is used by AI workflows.
- This file contains no stale completed repair task lines.
- This file contains no actionable open repair items.
- P4 guardrails remain visible to `pnpm ai:doctor --open` as non-actionable strategic guardrails.
- `scripts/migrate-ledger.mjs` can generate `.ai/runtime/repair-ledger.json` from this Markdown.
- `pnpm ai:sync` preserves existing local Markdown ledger content.
- `pnpm ai:doctor --open`, `pnpm codex:preflight`, and `pnpm governance:gate` pass.
