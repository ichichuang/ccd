# CCD Change Summary

## Summary

This run converted the repair ledger into evidence-backed implementation, blocker, and deferral records. Minimal source changes were limited to ProTable typing/helper boundary repair, web-demo pxtorem file exclusions, and DateUtils import casing cleanup. No dependency upgrades, Vite migration, auth-flow rewrite, remote GitHub configuration, branch switch, commit, stage, push, reset, clean, or generated governance manual edit was performed.

## Changed areas

| Area | Files | Reason | Milestone |
|---|---|---|---|
| ProTable helper boundary | `apps/web-demo/src/components/ProTable/**`, `apps/web-demo/src/views/example/components/primevue-collection/pro-table/shared/apiExecutor.ts` | Remove helper boundary/type debt while preserving runtime behavior. | M3 |
| CSS pxtorem exclusion | `apps/web-demo/vite.config.ts` | Exclude UnoCSS virtual/generated styles from global px-to-rem conversion while preserving `node_modules` exclusion. | M8 |
| DateUtils casing/import cleanup | `apps/web-demo/src/utils/date/index.ts`, `apps/web-demo/src/views/example/utils/http-advanced.vue`, `apps/web-demo/src/views/example/architecture/router-meta/keep-alive.vue` | Route imports through the stable date barrel and avoid direct casing-sensitive path usage. | M12 |
| Owner/blocker ledger | `.ai/runtime/owner_decisions.md`, `.ai/runtime/repair_list.md`, `.ai/runtime/repair-ledger.json` | Classify open tasks as validated, BLOCKED, or DEFERRED with evidence. | M4-M14 |
| Planning and evidence docs | `docs/ai-plan/**`, `docs/ai-runs/20260529-070550-ccd-architecture-repair/**` | Record plan, status, validation, reports, screenshots, logs, decisions, risks, and final go/no-go. | M0-M14 |
| Generated governance outputs | `docs/generated/**`, `.ai/generated/**`, `.ai/governance/api-snapshots/**` | Official governance/API commands regenerated outputs; no manual generated edits. | M3/M4/M5/M7/M14 |

## Architecture impact

The approved topology remains `packages/contracts -> packages/core -> apps/*`. No runtime API was added to `packages/contracts` or `packages/core`; HTTP contract and guard enforcement work remains blocked pending owner decisions.

## Runtime behavior impact

No intentional runtime behavior change was introduced outside the ProTable helper path and web-demo build CSS conversion config. Login/auth, alova request architecture, PrimeVue service wiring, Vite major version, and dependency versions were not changed.

## Type-safety impact

ProTable types and DateUtils exports/imports were tightened. Final `pnpm type-check`, focused tests, and full `pnpm test:run` pass.

## Governance impact

The repair ledger now records completed, blocked, and deferred items with evidence. `pnpm validate:governance` passes after an official generated-sync rerun. GitHub remote/.github mutations remain approval-gated.

## Security impact

No secrets, auth files, token providers, production deploy config, or auth-flow files were modified. A `gh auth status` diagnostic logged only masked token output while investigating the governance gate.

## Performance impact

Desktop budget passes at 495207 bytes against a 2500000 byte limit. Web build passes at 4.71 MB. Vite 8 and dependency modernization were not performed.

## UI/accessibility impact

M8 captured login/dashboard/chart production screenshots. Table-heavy production validation remains blocked because the ProTable route renders `.p-datatable` height `0`; A/B evidence shows this predates and is unrelated to the pxtorem exclusion patch.

## Validation evidence

| Validation | Result | Evidence |
|---|---|---|
| Final install | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101210-pnpm-install-frozen-lockfile.log` |
| Final type/lint/test | PASS, lint has 2 existing warnings | `M14-final-20260529-101300-pnpm-type-check.log`, `M14-final-20260529-101310-pnpm-lint-check.log`, `M14-final-20260529-101320-pnpm-test-run.log` |
| Final builds | PASS | `M14-final-20260529-101330-pnpm-build-web-demo.log`, `M14-final-20260529-101340-pnpm-build-desktop.log`, `M14-final-20260529-101410-pnpm-build-ci.log` |
| Governance | PASS after generated-sync rerun | `M14-final-20260529-101409-pnpm-validate-governance-generated-sync-rerun.log` |
| Ledger open audit | PASS, all open items BLOCKED/DEFERRED | `M14-final-20260529-101440-pnpm-ai-doctor-open.log`, `M14-final-20260529-101442-open-actionable-unblocked-scan.log` |

## Known risks

The final decision remains `NO_GO` until owner/operator blockers are resolved or accepted. Highest residual risks are Vite 8 migration, dependency modernization, and M8 table-heavy/e2e layout debt.

## Rollback summary

Rollback should be targeted by lane. Source rollback surfaces are the ProTable files, `apps/web-demo/vite.config.ts`, and the three DateUtils import files. Planning/evidence docs can be reverted as documentation if the operator rejects this ledger sweep. Do not use broad reset/clean without explicit approval.

## Next action

Resolve B-007 first if UI validation must be clean, or approve exactly one blocked lane: UI guard policy, HTTP contracts, Vite 8 isolated migration, dependency modernization, Login Diorama, `.github/**` governance, or P4 strategic work.
