# CCD Change Summary

## 2026-05-29 P1 Platform Extraction Update

Active evidence directory: `docs/ai-runs/20260529-170536-ccd-p1-platform-extraction-and-boundaries/`.

Implemented P1 lanes:

- `APP-001`: extracted layout runtime calculation into `packages/vue-app-platform`.
- `APP-002`: moved pure theme derivation to `@ccd/design-tokens/theme-engine` and DOM/storage theme application to `@ccd/vue-app-platform`.
- `ARCH-003`: removed app package public exports and excluded private apps from public API snapshot enforcement.
- `ARCH-004`: verified `createCapabilityBridge` ownership and documentation alignment.
- `ARCH-005`: audited dependency ownership and updated package-local dependency policy without upgrades.
- `BUILD-001`: reduced global px-to-rem selector blacklist reliance.
- `COMP-001`: moved ProForm engine/renderers/tests into `packages/vue-ui`; app now injects storage/date runtime adapters.
- `COMP-002`: moved ProTable engine/renderers/tests into `packages/vue-ui`; app now provides URL sync and record overlay wiring.
- `COMP-003`: moved PrimeDialog into `packages/vue-ui`; app now injects runtime config.
- `COMP-004`: verified examples consume public package/app entries.
- `DOC-002`: synced P1 docs, status, risk, and evidence records.
- `E2E-006`: centralized Playwright auth `storageState`.
- `E2E-007`: added CI Playwright artifact upload using `actions/upload-artifact@v7`.
- `E2E-008`: verified retry policy remains deterministic.
- `GOV-002`: synced blocker matrix.
- `GOV-004`: refreshed generated governance outputs through official commands.
- `HTTP-002` / `HTTP-003`: kept HTTP contracts/core paths unimplemented and app-local HTTP infrastructure in place.
- `HTTP-004`: split app-local HTTP policies from interceptors without moving runtime code into contracts/core.
- `UI-002` / `UI-003`: added CCD-owned PrimeVue wrappers and documented public API policy.

Approval-gated P1 lanes remain blocked unless owner/operator approval is recorded in `.ai/runtime/owner_decisions.md` or `docs/ai-plan/DECISIONS.md`.

Final validation for the implementable P1 scope passed on 2026-05-29. The final state is `CONDITIONAL_GO_FOR_IMPLEMENTABLE_P1`: all implementable P1 tasks are complete; HTTP-001, HTTP-007, UI-001, and GOV-003 remain blocked by explicit approval gates.

## Summary

This run executed the P1 platform extraction and boundary plan with evidence-backed implementation, blocker, and deferral records. Source changes moved app-owned reusable UI/platform logic into the approved packages while preserving the `packages/contracts -> packages/core -> apps/*` topology. No dependency upgrades, Vite migration, auth-flow rewrite, remote GitHub configuration, branch switch, commit, stage, push, reset, clean, or generated governance manual edit was performed.

## Changed areas

| Area                         | Files                                                                                                                                   | Reason                                                                                 | Milestone                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| Platform packages            | `packages/vue-app-platform/**`, `packages/design-tokens/src/theme-engine/**`                                                            | Own layout/runtime and pure theme derivation outside app entrypoints.                  | APP-001/APP-002                          |
| UI package                   | `packages/vue-ui/**`                                                                                                                    | Own ProForm, ProTable, PrimeDialog, and CCD PrimeVue façade components.                | COMP-001/COMP-002/COMP-003/UI-002/UI-003 |
| App wiring                   | `apps/web-demo/src/plugins/**`, `apps/web-demo/src/hooks/modules/**`, layout/view imports                                               | Keep runtime adapters, routes, stores, and app-specific wiring in the app.             | COMP/UI/HTTP                             |
| HTTP app policies            | `apps/web-demo/src/utils/http/policies/**`                                                                                              | Split app-local HTTP policies without moving browser/runtime code into contracts/core. | HTTP-004                                 |
| E2E/CI                       | `e2e/**`, `.github/workflows/ci.yml`                                                                                                    | Reuse auth storage state and upload local Playwright artifacts.                        | E2E-006/E2E-007                          |
| Planning and evidence docs   | `docs/ai-plan/**`, `ccd-architecture-optimization-plan/**`, `docs/ai-runs/20260529-170536-ccd-p1-platform-extraction-and-boundaries/**` | Record P1 statuses, blockers, validations, reports, and risks.                         | DOC/GOV                                  |
| Generated governance outputs | `docs/generated/**`, `.ai/generated/**`                                                                                                 | Official governance/API commands regenerated outputs; no manual generated edits.       | GOV-004                                  |

## Architecture impact

The approved topology remains `packages/contracts -> packages/core -> apps/*`. No runtime API was added to `packages/contracts` or `packages/core`; HTTP contract and guard enforcement work remains blocked pending owner decisions.

## Runtime behavior impact

Runtime behavior is intended to stay equivalent. The only deliberate wiring changes are package extraction boundaries, app-local adapter injection, HTTP policy factoring, Playwright auth-state reuse, and CI artifact upload. Login/auth semantics, alova request architecture location, PrimeVue service installation, Vite major version, and dependency versions were not changed.

## Type-safety impact

Final `pnpm type-check`, focused lane tests, and full `pnpm test:run` pass.

## Governance impact

The repair ledger now records completed, blocked, and deferred items with evidence. `pnpm validate:governance` passes after an official generated-sync rerun. GitHub remote/.github mutations remain approval-gated.

## Security impact

No secrets, auth files, token providers, production deploy config, or auth-flow files were modified. A `gh auth status` diagnostic logged only masked token output while investigating the governance gate.

## Performance impact

Desktop budget passes at 515302 bytes against a 2500000 byte limit. Web build passes. Vite 8 and dependency modernization were not performed.

## UI/accessibility impact

Final Playwright `e2e:smoke`, `e2e:layout`, `e2e:perf`, `e2e:visual`, and `e2e:qa:prepared` pass for the implementable P1 scope.

## Validation evidence

| Validation           | Result                             | Evidence                                                                                                                                                                                                                         |
| -------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Final install        | PASS                               | `docs/ai-runs/20260529-170536-ccd-p1-platform-extraction-and-boundaries/command-logs/FINAL-20260529-184310-01-pnpm-install-frozen-lockfile.log`                                                                                  |
| Final type/lint/test | PASS, lint has 2 existing warnings | `FINAL-20260529-190032-06-pnpm-type-check-after-tieredmenu-forwarding.log`, `FINAL-20260529-190145-08-pnpm-lint-check-after-tieredmenu-forwarding.log`, `FINAL-20260529-190127-07-pnpm-test-run-after-tieredmenu-forwarding.log` |
| Final builds         | PASS                               | `FINAL-20260529-190159-09-pnpm-build-web-demo-after-tieredmenu-forwarding.log`, `FINAL-20260529-190234-10-pnpm-build-desktop-after-tieredmenu-forwarding.log`, `FINAL-20260529-190615-17-pnpm-build-ci.log`                      |
| Final E2E            | PASS                               | `FINAL-20260529-190429-16-pnpm-e2e-qa-prepared.log`                                                                                                                                                                              |
| Governance           | PASS                               | `FINAL-20260529-190615-17-pnpm-build-ci.log`                                                                                                                                                                                     |

## Known risks

The final decision is `CONDITIONAL_GO_FOR_IMPLEMENTABLE_P1`. Residual risks are approval-gated P1 items and broader non-P1 work: Vite 8 migration, dependency modernization, Login Diorama, and remote GitHub governance.

## Rollback summary

Rollback should be targeted by lane. Source rollback surfaces are the extracted package directories, app compatibility wiring, HTTP policy modules, E2E auth-state helper, CI artifact upload step, and package/governance policy files. Do not use broad reset/clean without explicit approval.

## Next action

Resolve or explicitly approve exactly one blocked lane next: HTTP contracts, auth/offline behavior, UI guard enforcement policy, remote GitHub governance, Vite 8 isolated migration, dependency modernization, Login Diorama, or later P2+ strategic work.
