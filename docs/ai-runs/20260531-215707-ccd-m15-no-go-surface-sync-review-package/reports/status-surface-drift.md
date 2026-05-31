# M15 Status Surface Drift

## Baseline

- Accepted baseline: `M14_STATUS_LEDGER_RECONCILED_NO_GO`
- Branch: `main`
- Commit: `cc255d1a`
- M14 report availability: `reports/summary.md` exists; `reports/final-go-no-go.md`, `reports/blocker-register.md`, and `reports/issue-status-reconciliation.md` are missing and are represented inside the M14 summary.

## Drift Table

| file | current_claim | expected_claim_after_M14 | mismatch_type | issue_ids | required_change | risk | validation_needed |
|---|---|---|---|---|---|---|---|
| `README.md` | Before M15, no top-level M14/M15 `NO_GO` status and no explicit unresolved blocker set. | State M14 reconciliation passed, final status is `NO_GO`, full GO is not authorized, unresolved blockers remain, and `ai:doctor` has 80 open tasks. | `STALE_GO_STATUS` | G-01, G-03 | Add current governance status block. | Readers can infer clean GO. | `pnpm docs:commands`, `git diff --check` |
| `README.md` | Responsibility matrix omitted current package rows and listed removed app component paths as app-local candidates/do-not-move paths. | Match current package topology and treat ProForm/ProTable/PrimeDialog as `@ccd/vue-ui` owned, not app-local components. | `STALE_PACKAGE_TOPOLOGY` | D-05, D-08 | Update matrix and app-local candidate wording. | Agents may inspect nonexistent app paths or migrate backwards. | `pnpm docs:commands`, stale path grep |
| `docs/ai-plan/STATUS.md` | Before M15, current state described a prior P4 planning-only lane and stale final completion state. | Current state must describe M14 accepted `NO_GO` and M15 review package preparation. | `STALE_LANE_STATUS` | G-01, G-02, G-03 | Replace stale current-state surface with M14/M15 status and blocker table. | Top-level status can be misread as planning completion or clean completion. | `pnpm docs:commands`, `pnpm ai:doctor --open` |
| `docs/ai-plan/FINAL_GO_NO_GO.md` | Before M15, final decision was `CONDITIONAL_GO_FOR_IMPLEMENTABLE_P1`. | Final decision must be `NO_GO` until blockers and open tasks are resolved with evidence. | `STALE_GO_STATUS` | G-01, G-03 | Replace stale final decision surface with M14/M15 `NO_GO`. | Full GO could be claimed without blocker resolution. | `pnpm docs:commands`, `git diff --check` |
| `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` | Before M15, current lane and document version stopped at M14; D-05/G-01 still open despite M15 surface changes. | Record M15 lane, review package, issue status updates, and persistent unresolved blockers. | `STALE_LANE_STATUS` | D-05, D-08, D-11, G-01, G-02, G-03 | Add M15 section and update issue statuses. | Issue ledger can lag the review package. | `pnpm docs:commands`, `pnpm ai:doctor --open` |
| `docs/ai-plan/DECISIONS.md` | D-016 and D-017 had M14 reconciliation notes but no M15 surface-sync note. | D-016/D-017 remain `PROPOSED`; M15 must not imply approval. | `STALE_BLOCKER_STATUS` | B-07, C-06, D-016, D-017 | Add M15 note without changing approval status. | Proposed decisions could be mistaken as approved. | `pnpm docs:commands` |
| `scripts/ai-route-view-scaffold.mjs` | Generated hook templates imported `FormSchema` and `ProTableColumn` from removed app component paths. | Generated type imports should use current `@ccd/vue-ui` public API. | `TOOLING_STATUS_DRIFT` | D-11 | Change scaffold-generated type imports only. | Future generated routes can fail or encode stale ownership. | `node --check`, `pnpm ai:guard`, safe dry-run |
| `docs/generated/governance-report.md` | Current generated topology already lists current package graph. | No manual edit; generated files remain command-owned. | `NO_ACTION` | D-01, D-02, D-03 | None. | Manual edits would violate generated-file rule. | `pnpm validate:governance` |
| `docs/generated/api-surface-report.md` | Current generated API report includes current public package exports. | No manual edit; API report remains command-owned. | `NO_ACTION` | D-04 | None. | Manual edits would violate generated-file rule. | `pnpm api:report`, `pnpm validate:governance` |
| `docs/architecture/ownership-boundaries.md` | Current wording already uses current app-local facades and package owners. | No M15 top-level status change required. | `NO_ACTION` | A-03, D-08 | None in M15. | Existing dirty file is inherited from earlier lanes. | `pnpm docs:commands` |
| `docs/en/architecture-contract.md` | Current wording already uses current app-local facades and package owners. | No M15 top-level status change required. | `NO_ACTION` | A-03, D-08 | None in M15. | Existing dirty file is inherited from earlier lanes. | `pnpm docs:commands` |
| `docs/zh/02-architecture.md` | Current wording already uses current app-local facades and package owners. | No M15 top-level status change required. | `NO_ACTION` | A-03, D-08 | None in M15. | Existing dirty file is inherited from earlier lanes. | `pnpm docs:commands` |
| `docs/runtime/web-runtime.md` | Current wording already uses current app-local facades and package owners. | No M15 top-level status change required. | `NO_ACTION` | A-03, D-06 | None in M15. | Existing dirty file is inherited from earlier lanes. | `pnpm docs:commands` |
| `docs/ai-plan/PLAN.md` | Contains removed app component paths for ProForm/ProTable planning references. | Should eventually refer to `@ccd/vue-ui` ownership and package public APIs. | `STALE_GENERATED_REFERENCE` | D-08, D-11 | Out of M15 allowed edit list; record for follow-up. | Future agents can inspect or plan against removed app paths. | Future docs lane stale path grep |
| `docs/zh/04-project-control-center.md` | Contains removed app component paths in Chinese docs. | Should eventually match current README/architecture contract wording. | `STALE_GENERATED_REFERENCE` | D-08 | Out of M15 allowed edit list; record for follow-up. | Contributor docs can steer readers to removed paths. | Future docs lane stale path grep |
| `docs/zh/08-release.md` | Contains removed app component paths in Chinese release docs. | Should eventually match current README/architecture contract wording. | `STALE_GENERATED_REFERENCE` | D-08 | Out of M15 allowed edit list; record for follow-up. | Release docs can preserve stale ownership hints. | Future docs lane stale path grep |

## Result

M15 updates all allowed top-level NO_GO surfaces and required validation passed. Remaining stale component-path references are out of M15 scope and keep `D-08`/`D-11` open for a follow-up documentation/tooling lane.
