# CCD P4 Planning-Only Report

## Scope

- Repo: `/Users/cc/MyPorject/ccd`
- Baseline: `main` at `0cc9d3835c77f554782ee9d80fde2684bf178596`
- Operator baseline: GitHub governance planning sealed; CI Guardian `26682295113` PASS.
- Lane: P4 planning-only classification.
- Implementation: not performed.

Explicitly untouched: packages, source moves, dependency upgrades, Vite 8, GitHub remote settings, `.github/**`, auth flow, HTTP runtime, runtime UI, package manifests, generated governance files, staging, commit, push, reset, clean, rebase, and branch switching.

CCD Vue constraints remain active for any future UI/TSX lane: auto-import first; no manual Vue API imports covered by auto-imports; no `import { h } from 'vue'`; no `h()`; TSX render/return only.

## P4 Classification Table

| P4 item | Classification | Owner | Rationale | Risk | Prerequisites | Exit criteria | Future lane shape | Validation requirements | Rollback strategy | Evidence path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DOC-004 P4 umbrella | DEFERRED | Owner / Architect | Strategic work remains outside current repair scope. | Low now; high if misread as implementation approval. | Business case, approval, branch strategy, prerequisite review. | Each child item is approved, blocked, deferred, or out of scope with evidence. | Planning/approval lane first; one isolated implementation lane per item. | `pnpm docs:commands`, `pnpm ai:doctor --open`, `pnpm codex:preflight`, `pnpm validate:governance`, `git diff --check`. | Revert docs/evidence only. | This report; P4 plan |
| P4-NewOrganization-Deferred | OUT_OF_SCOPE | Owner / Operator | New org/repo is a SPEC non-goal and remote governance is operator-gated. | High remote, CI, ownership, release, and migration blast radius. | Business charter, migration plan, owner/operator approval, remote settings snapshot. | Approved target org/repo, ownership, required checks, migration and rollback plan. | Separate GitHub remote governance discovery lane. | Human review, GitHub governance evidence, CI Guardian dry PR if approved. | Restore remote settings from snapshot; revert `.github/**` PR normally. | `docs/ai-plan/SPEC.md`; `.ai/runtime/repair_list.md` |
| P4-Starter-Deferred | APPROVAL_REQUIRED | Owner / Architect | Starter depends on stable package boundaries and distribution policy. | Medium/high package topology and API drift. | Stable contracts/core/vue-ui/vue-primevue-adapter, starter scope, export/version policy. | Approved starter scope, package contract, release plan, validation budget. | Starter discovery plan, then isolated scaffold lane. | `pnpm ci:prepare-internal`, `pnpm api:report`, `pnpm arch:runtime`, starter build/smoke after approval. | Revert starter scaffold lane; keep current package topology unchanged unless approved. | `.ai/runtime/repair_list.md`; target architecture docs |
| P4-DesignSystem-Deferred | APPROVAL_REQUIRED | Owner / Architect | Split requires stable UI primitives, adapter boundaries, tokens, and public API policy. | High API/theme/release coupling. | UI primitive policy, adapter approval, token ownership, consumer migration plan. | Approved target, export list, migration inventory, validation matrix. | Design-system architecture proposal, then split lane if approved. | `pnpm validate:tokens`, `pnpm --filter @ccd/vue-ui build`, `pnpm api:report`, visual-token/e2e after approval. | Revert split PR or restore exports/docs; regenerate reports only through official commands. | `.ai/runtime/repair_list.md`; D-007 |
| P4-RekaUI-Deferred | BLOCKED_BY_OWNER | Owner / Architect | No approved headless primitive gap exists; PrimeVue adapter remains the UI strategy. | Medium/high UI, accessibility, dependency, and wrapper drift. | Gap report, PrimeVue-wrapper analysis, dependency approval, accessibility plan. | Owner approves exact gap, dependency/version, wrapper boundary, migration limits. | Evaluation-only spike first; no app runtime change until accepted. | Official dependency/source review, targeted tests, `pnpm lint:check`, `pnpm e2e:visual` after prototype approval. | Remove prototype dependency/wrappers; restore manifests and lockfile. | `.ai/runtime/repair_list.md`; approval gates |
| P4-TanStackQuery-Deferred | BLOCKED_BY_PRODUCT | Product / Owner / Security | Server-state complexity is not proven beyond alova plus explicit adapters; cache/session semantics need product/security approval. | High cache, auth, retry, stale-data, and dependency risk. | Product use case, HTTP contract/test prerequisites, security review, dependency approval. | Product/security approves use case, cache policy, auth failure behavior, validation matrix. | Product/security decision lane, then isolated request-state spike. | Request-layer tests, auth/session e2e, `pnpm type-check`, `pnpm validate:governance`, dependency/supply checks after approval. | Revert dependency/prototype; restore manifests/lockfile; preserve tests. | `.ai/runtime/repair_list.md`; HTTP-007 decision evidence |
| P4-DesktopDriftCI | BLOCKED_BY_OPERATOR | Operator / Desktop owner | CI enforcement touches `.github/**` and desktop drift scope. | Medium/high CI blockage and desktop release friction. | Enforcement scope, `.github/**` approval, desktop drift command contract, required-check decision. | Operator approves CI scope, workflow paths, dry-run evidence, rollback path. | Local drift reporting plan first; `.github/**` implementation only in a dedicated PR. | `pnpm build:desktop`, `pnpm budget:desktop`, drift check, `pnpm governance:github-workflows`, `pnpm validate:governance`, CI Guardian dry run after approval. | Revert `.github/**` PR or remove required check with operator signoff; restore branch-protection snapshot. | owner decisions; GitHub governance planning report |

## Files Inspected

- `AGENTS.md`
- `.ai/protocol/AI.entry.md`
- `.ai/protocol/AGENTS.core.md`
- `.ai/rules/core/00-global-architect.mdc`
- `.ai/rules/core/00-root-gatekeeper.mdc`
- `.ai/rules/core/01-global-preflight.mdc`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/owner_decisions.md`
- `docs/ai-plan/SPEC.md`
- `docs/ai-plan/PLAN.md`
- `docs/ai-plan/STATUS.md`
- `docs/ai-plan/VALIDATION.md`
- `docs/ai-plan/DECISIONS.md`
- `docs/ai-plan/RISK_REGISTER.md`
- `docs/ai-plan/EVIDENCE_POLICY.md`
- `docs/ai-plan/SECURITY_AND_APPROVALS.md`
- `docs/ai-plan/ROLLBACK.md`
- `ccd-architecture-optimization-plan/README.md`
- `ccd-architecture-optimization-plan/02-target-architecture.md`
- `ccd-architecture-optimization-plan/03-master-priority-roadmap.md`
- `ccd-architecture-optimization-plan/04-validation-and-evidence-strategy.md`
- `ccd-architecture-optimization-plan/05-approval-gates.md`
- `ccd-architecture-optimization-plan/ledgers/issue-ledger.md`
- `ccd-architecture-optimization-plan/ledgers/task-ledger.md`
- `ccd-architecture-optimization-plan/plans/04-P4-strategic-deferred-work.md`
- Recent evidence reports under `docs/ai-runs/**`, including M13 P4, P2, P3, HTTP-001, HTTP-007, DEPS-004, and GitHub governance planning reports.

No files named as S0/S1/S2/S3/S4 reports were found under `docs/ai-runs/**/reports/`; the recent lane evidence reports above were used as the available S0-S4-adjacent evidence set.

## Validation

Final validation logs are under `../command-logs/` and summarized in `validation-summary.md`.

## Residual Risks

- Future P4 implementation remains unapproved and must not start from this planning report alone.
- Desktop drift CI, GitHub remote governance, dependency/tooling changes, and UI library evaluation remain approval-gated.
- New org/repo work remains out of scope unless the owner/operator replaces the current program boundary with a new approved charter.
