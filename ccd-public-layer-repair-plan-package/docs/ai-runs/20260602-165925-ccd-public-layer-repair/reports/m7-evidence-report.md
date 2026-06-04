# M7 Evidence Report

## Outcome

- Milestone: `M7 - Theme/size facade hardening`
- Approval ID: `M7-PLAN-SCOPE-EXECUTION-APPROVED`
- Status: `DONE`
- Timestamp: `2026-06-03T08:24:51+0800`
- Stop condition: Stop after M7; do not advance to M8.

## Required Initial Checks

| Check | Result | Evidence |
| --- | --- | --- |
| `pwd` matches approved worktree | PASS | `../command-logs/001-pwd.log` |
| Branch matches approved branch | PASS | `../command-logs/002-branch.log` |
| HEAD recorded | PASS | `../command-logs/003-head.log` |
| `git status --short` recorded | PASS | `../command-logs/004-status-short.log` |
| Protected manifest diff recorded | PASS, empty diff | `../command-logs/005-protected-manifests-diff.log` |
| M1-T03 marked `DONE` | PASS | `../command-logs/038-m7-initial-check-summary.log` |
| M2 marked `DONE` | PASS | `../command-logs/038-m7-initial-check-summary.log` |
| M3 marked `DONE` | PASS | `../command-logs/038-m7-initial-check-summary.log` |
| M4 marked `DONE` | PASS | `../command-logs/038-m7-initial-check-summary.log` |
| M5 marked `DONE` / `DEFERRED` per approved stop state | PASS | `../command-logs/038-m7-initial-check-summary.log` |
| M6 marked `DONE` and `STOP_AFTER_M6` | PASS | `../command-logs/038-m7-initial-check-summary.log`, `../command-logs/039-m6-stop-after-confirmation.log` |
| `reports/m6-evidence-report.md` exists and records M6 validation | PASS | `../command-logs/038-m7-initial-check-summary.log` |
| `reports/build-config-coupling-map.md` exists | PASS | `../command-logs/038-m7-initial-check-summary.log` |
| `reports/build-owner-decision.md` exists | PASS | `../command-logs/038-m7-initial-check-summary.log` |
| Historical M7/M8 rows in `STATUS.md` were detected and treated as historical only | PASS | `../command-logs/038-m7-initial-check-summary.log` |

## Exact PLAN.md M7 Scope

Title:

`Milestone M7 — Theme/size facade hardening`

Purpose:

Confirm theme/size app facades are correctly app-owned and optionally extract only the remaining generic DOM writer if it fits existing package ownership.

Scope:

Review `utils/theme/engine.ts`, `utils/theme/sizeEngine.ts`, desktop theme setup, design-tokens APIs, and vue-app-platform theme runtime APIs. Implement a small size DOM writer only if low-risk and no manifest change is required.

Out of scope:

No visual redesign, token rewrite, persisted key change, PrimeVue theme rewrite, or desktop/web behavioral divergence.

Evidence: `../command-logs/020-plan-m7-section.log`.

## Current Theme/Size Boundary Findings

Representative code inspected:

- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.ts`
- `apps/web-demo/src/App.vue`
- `apps/web-demo/src/stores/modules/system/size.ts`
- `apps/desktop/src/theme/index.ts`
- `packages/vue-app-platform/src/themeRuntime.ts`
- `packages/vue-app-platform/src/index.ts`
- `packages/design-tokens/src/sizeResolver.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.spec.ts`

Current-state findings:

- Theme derivation remains package-owned in `@ccd/design-tokens`.
- Theme DOM/storage write already remains package-owned through `@ccd/vue-app-platform/applyThemeVars(...)`, with app-owned target/storage capabilities injected by `apps/web-demo/src/utils/theme/engine.ts`.
- Size derivation remains package-owned in `@ccd/design-tokens`.
- Size DOM application remains app-owned because `apps/web-demo/src/utils/theme/sizeEngine.ts` still owns root `cssText` writes, `root.dataset.fontScale`, preload-time persisted state reads, safeStorage decoding fallback, device/breakpoint/pixel-ratio context assembly, and the single-write first-paint path.
- Desktop still owns a separate size/theme writer path in `apps/desktop/src/theme/index.ts`.

Supporting evidence:

- `../command-logs/025-m7-theme-size-rg.log`
- `../command-logs/026-web-theme-engine.log`
- `../command-logs/027-web-size-engine.log`
- `../command-logs/028-vue-app-platform-theme-runtime.log`
- `../command-logs/029-desktop-theme-index.log`
- `../command-logs/031-web-app-vue.log`
- `../command-logs/032-web-size-store.log`
- `../command-logs/036-web-size-engine-spec.log`
- `../command-logs/033-historical-theme-size-boundary-review.log`
- `../command-logs/034-historical-size-writer-decision.log`
- `../command-logs/035-historical-theme-size-validation.log`

## Scope Gate Decision

Current M7 remains decision-only.

The optional size DOM writer extraction is still not low-risk because the candidate surface is not just a generic CSS variable helper:

- it must preserve the preload first-paint path;
- it reads persisted state before Pinia mounts;
- it decodes safeStorage-packed payloads with JSON fallback;
- it depends on app-local device and breakpoint helpers;
- it writes `data-font-scale` and layout variables alongside root font variables; and
- desktop uses a separate writer contract that would need independent preservation.

Therefore:

- `M7-T01` is `DONE` as a current-state boundary re-audit.
- `M7-T02` is `DONE` as a reaffirmed owner decision.
- `M7-T03` is `NOT_APPLICABLE`.
- `M7-T04` is `NOT_APPLICABLE` because no theme/size source changed.

No source files under `apps/web-demo/src/utils/theme/**`, `apps/desktop/src/theme/**`, `packages/design-tokens/**`, or `packages/vue-app-platform/src/**` were edited for current M7.
