# CCD Architecture Issue Repair Log

## 0. Machine-Readable Summary

```yaml
document_version: 2026-06-01.p11
last_updated: 2026-06-01
repository: /Users/cc/MyPorject/ccd
baseline_branch: main
baseline_commit: cc255d1a
latest_remote_commit: 0de90f64
current_lane: P11 remote state surface reconciliation
source_of_truth_files:
  - README.md
  - docs/en/architecture-contract.md
  - docs/zh/02-architecture.md
  - docs/architecture/ownership-boundaries.md
  - docs/adr/ADR-005-common-platform-layer-terminology.md
  - docs/adr/ADR-006-approval-gated-architecture-lanes.md
  - docs/ai-plan/DECISIONS.md
  - docs/ai-plan/STATUS.md
  - docs/runtime/runtime-isolation.md
  - docs/runtime/web-runtime.md
  - docs/runtime/desktop-runtime.md
  - .ai/governance/policies/topology.json
  - .ai/governance/policies/runtime.json
  - .ai/governance/policies/api.json
  - scripts/architecture/validate-boundaries.mjs
  - scripts/architecture/check-runtime-leaks.mjs
  - scripts/architecture/check-api-surface.mjs
  - scripts/ai-architecture-guard.mjs
  - .dependency-cruiser.cjs
  - pnpm-workspace.yaml
  - package.json
total_issue_count: 46
previous_issue_count: 45
open_issue_count: 22
p0_count: 22
p1_count: 22
blocked_count: 1
new_issue_ids: [B-11, B-12, D-11, E-07, F-04]
status_markers:
  needs_review: [A-03, D-06]
  partially_obsolete: [B-03, C-04, D-09, D-10, D-11]
  superseded: []
  duplicate: []
  blocked: [G-03]
  done:
    [
      C-01,
      C-02,
      C-03,
      C-05,
      D-01,
      D-02,
      D-03,
      D-04,
      D-05,
      D-07,
      D-08,
      E-01,
      E-02,
      E-03,
      E-04,
      E-05,
      E-06,
      E-07,
      F-01,
      F-02,
      F-03,
      F-04,
      G-01,
      B-07,
      B-08,
    ]
generated_files_policy: do_not_edit_manually; regenerate only with pnpm governance:refresh, pnpm api:report, or the owning generator command
source_changes_allowed: false
final_status_decision: NO_GO
```

Baseline evidence:

- Current repair log input: `CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md`
- Preferred target path materialized by this lane: `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`
- Current git branch at baseline: `main`
- Short commit hash at baseline: `cc255d1a`
- Baseline dirty state before edits: untracked `CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md`
- Previous run evidence directory: `docs/ai-runs/20260531-090155-ccd-architecture-issue-log-ai-restructure/`
- Current M1 run evidence directory: `docs/ai-runs/20260531-093147-ccd-m1-topology-truth-source-alignment/`
- Current M2 run evidence directory: `docs/ai-runs/20260531-095818-ccd-m2-governance-api-surface-repair/`
- Current M3 run evidence directory: `docs/ai-runs/20260531-101606-ccd-m3-browser-runtime-boundary/`
- Current M4 run evidence directory: `docs/ai-runs/20260531-104447-ccd-m4-primevue-app-local-classification/`
- Current M5 run evidence directory: `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/`
- Current M6 run evidence directory: `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/`
- Current M6a run evidence directory: `docs/ai-runs/20260531-135533-ccd-m6a-governance-generated-sync-reconciliation/`
- Current M7 run evidence directory: `docs/ai-runs/20260531-144505-ccd-m7-safe-storage-codec-foundation/`
- Current M7a run evidence directory: `docs/ai-runs/20260531-153347-ccd-m7a-web-demo-filtered-test-cwd-repair/`
- Current M8 run evidence directory: `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/`
- Current M9 run evidence directory: `docs/ai-runs/20260531-163507-ccd-m9-device-runtime-resolver-foundation/`
- Current M10 run evidence directory: `docs/ai-runs/20260531-185509-ccd-m10-system-store-pure-state-extraction/`
- Current M11 run evidence directory: `docs/ai-runs/20260531-192122-ccd-m11-hook-facade-convergence/`
- Current M13 run evidence directory: `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/`
- Current M13a run evidence directory: `docs/ai-runs/20260531-203406-ccd-m13a-root-theme-tooling-boundary-repair/`
- Current M14 run evidence directory: `docs/ai-runs/20260531-212101-ccd-m14-status-ledger-reconciliation/`
- Current M15 run evidence directory: `docs/ai-runs/20260531-215707-ccd-m15-no-go-surface-sync-review-package/`
- Current M16 run evidence directory: `docs/ai-runs/20260531-223500-ccd-m16-stale-doc-tooling-reference-cleanup/`
- Current M16a run evidence directory: `docs/ai-runs/20260531-230000-ccd-m16a-ledger-evidence-polish/`

Post-review note:

- `C-03` is `DONE` only for topology/package-manifest dependency enforcement in `scripts/architecture/validate-boundaries.mjs`.
- Browser runtime boundary expansion is not included in `C-03`; M3 now closes `C-01`, `C-02`, and `C-05`, makes `C-04` partially obsolete, and leaves `C-06` open for PrimeVue-specific work.
- `D-04` is `DONE` for API policy/report coverage after `@ccd/vue-app-platform` was included through topology-driven API discovery and `pnpm api:report`.
- `C-01`, `C-02`, and `C-05` are `DONE` for M3 policy/script/docs/evidence coverage: runtime classes are policy-backed, exact file/surface exceptions are registered, and new unclassified production runtime access fails `pnpm arch:runtime`.
- `C-04` is `PARTIALLY_OBSOLETE`: browser runtime boundary enforcement now lives in the runtime checker rather than dependency-cruiser, while dependency import boundaries remain in `pnpm arch:boundaries`.
- `C-06` remains `OPEN`; M4 classified current PrimeVue surfaces and confirmed existing imports are allowed by current guard policy, but app direct imports still depend on exact allowlists and the showcase exception.
- `B-12` is new: `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts` and `apps/web-demo/src/plugins/modules/protable.ts` are classified as app-local ProTable URL-sync compatibility surfaces; router coupling stays app-owned and injected into `@ccd/vue-ui`.
- M5 produced extraction/API planning evidence only. It did not migrate runtime source, package manifests, lockfiles, generated outputs, or PrimeVue allowlists.
- `B-07` is now `BLOCKED`: safeStorage crypto uses Web Crypto/fallback runtime and logger coupling, so the owner must decide app-only adapter versus approved web-library package before any source migration.
- `C-06` remains `OPEN`; M5 found 0 allowlist rows removable without source migration and grouped 7 future reduction targets.
- M6 produced proposed owner-decision packets for `B-07` and `C-06` plus M7-M14 implementation lane briefs. It did not record owner approval and did not migrate source code.
- `B-07` remains `BLOCKED` until an owner approves the safeStorage crypto owner path. `C-06` remains `OPEN` until a concrete PrimeVue reduction policy and source migration lane are approved.
- M6a reconciled the generated artifact sync blocker by making standalone generated-output commands and the governance gate use the same canonical formatting. `pnpm validate:governance` now passes; M6 final status is `M6_DECISION_PACKET_READY`.
- M7 established the non-crypto JSON codec foundation as already package-owned in `@ccd/shared-utils` and already consumed by `apps/web-demo/src/utils/safeStorage/core.ts`. Compression extraction remains future work because `@ccd/shared-utils` does not declare `lz-string` and M7 forbids package manifest/lockfile changes. `B-07` remains `BLOCKED`; no crypto/HMAC/Web Crypto/runtime behavior moved.
- M7a repaired the filtered web-demo test cwd failure in `apps/web-demo/src/utils/http/requestLayer.spec.ts` by deriving test scan roots from `import.meta.url` instead of `process.cwd()`. `pnpm --filter @ccd/web-demo test`, root `pnpm test:run`, and required governance validation now pass. M7 strict validation is closed as `M7_SCOPE_ACCEPTED_VALIDATION_CLOSED`.
- M8 moved/exposed pure size resolver helpers from the app size facade into `@ccd/design-tokens` while preserving app facade imports. DOM writes, `localStorage` preload, browser device collectors, and Pinia stores remain app-owned. `B-04` and `B-09` record foundation progress only; `B-07`, `B-08`, `D-016`, `D-017`, `C-06`, and `G-03` are not unlocked.
- M9 moved/exposed pure device, OS, breakpoint, orientation, and viewport metric resolvers into `@ccd/design-tokens` while keeping browser collectors, listeners, `visualViewport`, rAF/timer lifecycle, and Pinia state app-owned.
- M10 extracted only pure layout visibility reducer helpers into `@ccd/vue-app-platform` and delegated from `apps/web-demo/src/stores/modules/system/layout.ts`. Pinia store ownership, persisted keys/payloads, `syncAction`, loading counters, mobile drawer runtime state, app singleton access, and browser runtime lifecycle remain app-owned. M10 final status is partial because size/device helpers were already covered by M8/M9 and other system store logic is out of scope.
- M11 made no production behavior move. It verified `useAutoMitt`, `useDialog`, `useProTableUrlSync`, `proform.ts`, and `protable.ts` as app compatibility/plugin facades over package-owned primitives or adapter keys, and added focused app facade tests for event cleanup binding, dialog translated defaults/callback semantics, and ProTable URL query sync. `B-01`, `B-02`, and `B-12` remain open watch items.
- M13 removed all app tsconfig package source include bypasses for `@ccd/vue-ui` and `@ccd/vue-charts`, added package-output smoke coverage, and added an `arch:boundaries` app-tsconfig guard against future `packages/*/src/**` includes. `F-01`, `F-02`, and `F-03` are `DONE`; `F-04` remains `OPEN` because root theme tooling script repair is outside this lane's explicit allowed file list.
- M13a removed root theme tooling imports from `apps/web-demo/src/utils/theme/**`, replaced them with `@ccd/design-tokens/theme-engine` public exports, and added a precise `scripts/**` boundary guard for root-to-app theme imports. `F-04` is now `DONE`. `B-07` remains `BLOCKED`, `B-08` remains `OPEN`, `D-016` remains `PROPOSED`, `D-017` remains `PROPOSED`, `C-06` remains `OPEN`, and `G-03` remains `BLOCKED`.
- M14 reconciled lane status, issue status, blockers, generated outputs, and dirty-tree classification after M1-M13a. Required validation passed, but `pnpm ai:doctor --open` still reports 80 open tasks; `B-07`, `B-08`, `C-06`, `D-016`, `D-017`, and `G-03` remain unresolved. Final status is `M14_STATUS_LEDGER_RECONCILED_NO_GO`; do not treat the architecture repair set as complete.
- M16 cleans stale documentation and tooling text/path references left out of M15 scope. It updates `docs/ai-plan/PLAN.md`, `docs/zh/04-project-control-center.md`, and `docs/zh/08-release.md` to match current `@ccd/vue-ui` ownership and app integration facade classification, but it does not resolve blockers, fabricate approvals, manually edit generated files, stage, commit, push, clean, or modify runtime source. `D-08` is now `DONE`; `D-11` is `PARTIALLY_OBSOLETE` because planning docs and scaffold imports are aligned while `scripts/ai-architecture-guard.mjs` allowlist reduction remains owner-approved M12 work; `G-02` remains `OPEN` because 80 repair-ledger tasks remain open.
- M16a syncs ledger §0 YAML and G-02 wording with the M16 issue table, reconciles M16 complete changed-files evidence, and records `M16A_LEDGER_EVIDENCE_POLISHED` without changing substantive issue statuses, runtime source, manifests, lockfile, blocker outcomes, or top-level `NO_GO`.
- P11 reconciles status surfaces after manual P10g push to `origin/main` at `0de90f64`. Updates `FINAL_GO_NO_GO.md`, `STATUS.md`, `DECISIONS.md` historical notes, and ledger §0 to reflect remote state. Does not change runtime source, package manifests, lockfile, generated files manually, or top-level `NO_GO`. C-06, G-02, G-03, and M12 remain OPEN/BLOCKED.

## 1. Codex Operating Contract

Hard rule: `common platform layer` means the governed package set under `packages/*`. It does not mean `packages/core`.

`packages/core` is only the minimal runtime-neutral orchestration/facade package. It may depend only on `@ccd/contracts`. It must not become a shared frontend bucket.

Allowed actions in this lane:

- Create M6 decision evidence under `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/**`.
- Update non-generated architecture/runtime docs, the decision log, and the issue log with owner-decision requirements and implementation lane briefs.
- Prepare decision options for `B-07` safeStorage crypto ownership and `C-06` PrimeVue allowlist reduction without approving implementation.
- Split future implementation into small M7-M14 lanes with allowed paths, forbidden paths, validation, rollback, and residual risk.
- Run read-only, documentation, architecture, and governance validation commands required by the M6 decision lane.

Forbidden actions in this lane:

- Do not move source code.
- Do not fix implementation issues.
- Do not add public exports from `apps/*`.
- Do not create or preserve app-local public common barrels under `apps/*` unless they are explicitly classified as temporary compatibility facades or app-only infrastructure.
- Do not modify app/package runtime source behavior.
- Do not move hooks, stores, utils, components, theme systems, UnoCSS systems, color systems, size systems, breakpoint systems, or PrimeVue integrations into `packages/core` unless the code is strictly runtime-neutral orchestration over injected contracts.
- Do not edit generated governance outputs under `docs/generated/**`, `.ai/generated/**`, or `.ai/governance/api-snapshots/**` manually.
- Do not modify dependencies, `pnpm-lock.yaml`, Vite major versions, GitHub remote settings, `.github/**`, auth behavior, HTTP runtime behavior, or generated AI protocol files.
- Do not commit, stage, push, reset, clean, rebase, or rewrite history.
- Do not migrate source code or mix feature/runtime implementation work into this topology lane.
- Do not mark C-06 done while app direct PrimeVue imports still require exact allowlists or the showcase exception.
- Do not remove PrimeVue allowlist entries in M6.
- Do not move safeStorage crypto into `packages/core`, `packages/contracts`, or any package before B-07 owner decision.

## 2. Architecture Ownership Matrix

| capability_kind                                                             | owning_package_or_path                                                                                       | allowed_runtime                                             | forbidden_destinations                                                                | validation_commands                                                                     | related_issue_ids                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------- |
| DTOs, interfaces, cross-runtime contracts                                   | `packages/contracts`                                                                                         | runtime-neutral types only                                  | `apps/*`, runtime implementations, Vue/browser/Tauri libraries                        | `pnpm --filter @ccd/contracts build`, `pnpm api:report`, `pnpm arch:runtime`            | D-10, E-06                               |
| Runtime-neutral orchestration over injected adapters                        | `packages/core`                                                                                              | runtime-neutral only                                        | Vue, PrimeVue, browser globals, Tauri, storage, timers, `packages/*` frontend buckets | `pnpm build:core`, `pnpm arch:runtime`, `pnpm arch:boundaries`                          | A-01, C-01, D-10                         |
| Theme/color/size/breakpoint token primitives                                | `packages/design-tokens`                                                                                     | runtime-neutral package                                     | `apps/web-demo/src/utils/theme/**`, `packages/core`                                   | `pnpm --filter @ccd/design-tokens test`, `pnpm api:report`                              | B-03, B-04, B-09, B-10, B-11, F-04       |
| Pure utilities and generic helpers                                          | `packages/shared-utils`                                                                                      | runtime-neutral package                                     | app utility barrels, `packages/core` unless injected orchestration                    | `pnpm --filter @ccd/shared-utils test`, `pnpm arch:boundaries`                          | B-05, B-06, B-08                         |
| UnoCSS preset, safelist, shortcuts, theme bridge                            | `packages/unocss-preset`                                                                                     | node-build and build-time styling helpers                   | app-local duplicated styling systems, `packages/core`                                 | `pnpm --filter @ccd/unocss-preset build`, `pnpm ci:smoke:unocss-tokens`                 | C-04                                     |
| Vue/browser composables                                                     | `packages/vue-hooks`                                                                                         | web-library; browser access must be intentional and guarded | `packages/core`, app-local generic hooks                                              | `pnpm --filter @ccd/vue-hooks test`, `pnpm arch:boundaries`                             | B-01, E-02                               |
| App bootstrap, platform lifecycle, layout runtime, preloader, theme runtime | `packages/vue-app-platform`                                                                                  | web-library                                                 | `packages/core`, app utils when reusable, generated app-only facades                  | `pnpm --filter @ccd/vue-app-platform test`, `pnpm api:report`                           | B-03, B-04, B-10, D-04, E-03             |
| CCD-owned Vue UI primitives and public component APIs                       | `packages/vue-ui`                                                                                            | web-library                                                 | app public component barrels, raw PrimeVue public re-export bucket, `packages/core`   | `pnpm --filter @ccd/vue-ui test`, `pnpm api:report`, `pnpm ai:guard`                    | B-02, B-12, C-06, D-08, D-11, E-04       |
| PrimeVue theme, PT, locale, services, integration adapters                  | `packages/vue-primevue-adapter`                                                                              | web-library                                                 | app feature code, `packages/core`, raw public PrimeVue buckets                        | `pnpm --filter @ccd/vue-primevue-adapter test`, `pnpm ai:guard`                         | C-06, E-05                               |
| Chart runtime and helpers                                                   | `packages/vue-charts`                                                                                        | web-library                                                 | app chart wrappers when reusable, `packages/core`                                     | `pnpm --filter @ccd/vue-charts build`, `pnpm api:report`                                | E-07, F-01                               |
| Browser app shell, routing, views, stores, concrete app adapters            | `apps/web-demo`                                                                                              | web app runtime                                             | public platform exports, package imports from apps                                    | `pnpm --filter @ccd/web-demo type-check`, `pnpm build:web-demo`, `pnpm arch:boundaries` | A-03, B-01..B-12, C-02, C-05, F-01       |
| Tauri app shell and desktop adapters                                        | `apps/desktop`                                                                                               | desktop app runtime; Tauri only in `src/adapters/**`        | packages except typed contracts; Tauri outside desktop adapters                       | `pnpm --filter @ccd/desktop type-check`, `pnpm build:desktop`, `pnpm arch:boundaries`   | D-07, E-05, F-02                         |
| Governance policies and validators                                          | `.ai/governance/**`, `scripts/architecture/**`, `scripts/governance/**`, `scripts/ai-architecture-guard.mjs` | node tooling                                                | generated manual edits, app source imports unless explicitly tool-owned               | `pnpm validate:governance`, `pnpm arch:runtime`, `pnpm arch:boundaries`                 | C-01..C-06, D-01..D-11, E-01..E-07, F-04 |

## 3. Issue Taxonomy

| category                                           | definition                                                                                          | related_issue_ids |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------- |
| A terminology and decision drift                   | Naming, ADR status, or decision wording can steer agents toward the wrong architecture.             | A-01, A-02, A-03  |
| B app-local shared capability residue              | App-local hooks, utils, stores, layout, storage, or theme code behaves like reusable platform code. | B-01..B-12        |
| C runtime and adapter boundary gaps                | Runtime access or guard coverage does not match the adapter-only architecture contract.             | C-01..C-06        |
| D governance, documentation, and API surface drift | Docs, generated reports, API policy, or AI tooling do not match current package ownership.          | D-01..D-11        |
| E package topology and dependency policy mismatch  | `package.json` workspace dependencies and topology policy disagree.                                 | E-01..E-07        |
| F TypeScript and build-output boundary issues      | App TS configs or scripts bypass workspace package build/public export boundaries.                  | F-01..F-04        |
| G completion status and blocker drift              | Planning status, open tasks, and blockers can be misread as final architecture completion.          | G-01..G-03        |

## 4. Master Issue Registry

| id   | category | priority | status             | module                         | owner_layer                                     | current_paths                                                                                                                                                                   | target_paths                                                               | problem_summary                                                                                                                                              | risk                                                                                            | recommended_lane    | validation                                                                                  | evidence_files                                                                                                                                                                                        | related_files                                                                                                              | supersedes_or_duplicate_of | notes                                                                                                                                                    |
| ---- | -------- | -------- | ------------------ | ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-01 | A        | P0       | OPEN               | terminology                    | architecture docs                               | `README.md`, `docs/en/architecture-contract.md`, `docs/adr/ADR-005-common-platform-layer-terminology.md`                                                                        | non-generated docs                                                         | Common platform terminology can be misread as `packages/core`.                                                                                               | Wrong migrations into core.                                                                     | M0, M14             | `pnpm docs:commands`                                                                        | baseline scan                                                                                                                                                                                         | `docs/architecture/ownership-boundaries.md`                                                                                |                            | Keep rule prominent.                                                                                                                                     |
| A-02 | A        | P1       | OPEN               | ADR status                     | architecture decisions                          | `docs/adr/ADR-005-common-platform-layer-terminology.md`, `docs/adr/ADR-006-approval-gated-architecture-lanes.md`, `docs/ai-plan/DECISIONS.md`                                   | ADR/decision docs                                                          | ADRs are `Proposed` while adopted by docs/plans.                                                                                                             | Approval ambiguity.                                                                             | M14                 | `pnpm docs:commands`, `pnpm ai:doctor --open`                                               | ADR scan                                                                                                                                                                                              |                                                                                                                            |                            | Requires owner decision.                                                                                                                                 |
| A-03 | A        | P1       | NEEDS_REVIEW       | app-local allowances           | apps/web-demo                                   | `README.md`, `docs/zh/02-architecture.md`, `docs/en/architecture-contract.md`                                                                                                   | docs plus lane plan                                                        | App-local candidate allowance conflicts with no-public-app-common goal.                                                                                      | App becomes hidden platform layer.                                                              | M4, M5, M14         | `pnpm docs:commands`, reviewer checklist                                                    | M4/M5 app-local evidence                                                                                                                                                                              | `apps/web-demo/src/hooks/**`, `apps/web-demo/src/utils/**`                                                                 |                            | M5/M6 narrow candidates into facades, app-owned runtime, package targets, and owner decisions.                                                           |
| B-01 | B        | P1       | OPEN               | event hook                     | `@ccd/vue-hooks` plus app binding               | `apps/web-demo/src/hooks/modules/useAutoMitt.ts`                                                                                                                                | `packages/vue-hooks` with app event map binding                            | App exposes generic event hook wrapper.                                                                                                                      | App-local shared hook grows.                                                                    | M11                 | `pnpm --filter @ccd/vue-hooks test`, web-demo type-check                                    | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/system-store-and-hook-facade-plan.md`                                                                                                   | `packages/vue-hooks/src/createAutoMittHook.ts`, `apps/web-demo/src/utils/mitt.ts`                                          |                            | Keep as thin app event-map facade; generic factory already package-owned.                                                                                |
| B-02 | B        | P1       | OPEN               | dialog facade                  | `@ccd/vue-ui` plus app i18n adapter             | `apps/web-demo/src/hooks/modules/useDialog.tsx`                                                                                                                                 | `packages/vue-ui`, app i18n adapter                                        | App owns dialog convenience API and i18n coupling.                                                                                                           | Shared UI behavior remains app-local.                                                           | M11                 | `pnpm --filter @ccd/vue-ui test`, web-demo type-check                                       | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/system-store-and-hook-facade-plan.md`                                                                                                   | `packages/vue-ui/src/PrimeDialog/**`                                                                                       |                            | Keep app translations in facade; only reusable dialog primitives belong in vue-ui.                                                                       |
| B-03 | B        | P0       | PARTIALLY_OBSOLETE | theme facade                   | design-tokens, vue-app-platform, app adapter    | `apps/web-demo/src/utils/theme/engine.ts`                                                                                                                                       | `packages/design-tokens`, `packages/vue-app-platform`, app storage adapter | Facade now delegates pure/theme runtime work but still directly uses `document` and `localStorage`.                                                          | Runtime boundary remains unclear.                                                               | M8                  | `pnpm arch:runtime`, `pnpm e2e:visual`                                                      | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/theme-size-device-plan.md`                                                                                                              | `packages/design-tokens/src/theme-engine/**`, `packages/vue-app-platform/src/themeRuntime.ts`                              |                            | M5 confirms facade should shrink; no source migration in planning lane.                                                                                  |
| B-04 | B        | P0       | OPEN               | size system                    | design-tokens, vue-app-platform                 | `apps/web-demo/src/utils/theme/sizeEngine.ts`                                                                                                                                   | `packages/design-tokens`, `packages/vue-app-platform`, app adapter         | M8 moved pure size calculation to `packages/design-tokens`; DOM CSS writes, storage, preload, and device sync remain app-owned.                              | Remaining DOM/preload/device runtime still needs app adapter or injected target cleanup.        | M8/M9               | `pnpm e2e:layout`, `pnpm e2e:visual`                                                        | `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/reports/summary.md`                                                                                                               | `apps/web-demo/src/stores/modules/system/size.ts`, `apps/web-demo/src/utils/deviceSync.ts`                                 |                            | M8 foundation progress only; do not claim DOM/preload/store cleanup complete.                                                                            |
| B-05 | B        | P0       | OPEN               | safeStorage barrel             | contracts/shared-utils/app adapter              | `apps/web-demo/src/utils/safeStorage/index.ts`                                                                                                                                  | `packages/contracts`, `packages/shared-utils`, app storage adapter         | App has package-like safeStorage public barrel.                                                                                                              | Apps directory becomes common package.                                                          | M7                  | `pnpm arch:boundaries`, focused storage tests                                               | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/safe-storage-plan.md`, `docs/ai-runs/20260531-144505-ccd-m7-safe-storage-codec-foundation/reports/safe-storage-codec-dependency-map.md` | `apps/web-demo/src/utils/safeStorage/**`                                                                                   |                            | M5 keeps barrel as temporary app-private compatibility facade only; M7 changed no app exports.                                                           |
| B-06 | B        | P0       | OPEN               | safeStorage core               | contracts/shared-utils/app adapter              | `apps/web-demo/src/utils/safeStorage/core.ts`                                                                                                                                   | `packages/contracts`, `packages/shared-utils`, app adapter                 | Codec, obfuscation, key resolution, env, DOM, and logger are mixed.                                                                                          | Runtime-neutral helpers remain trapped in app.                                                  | M7                  | `pnpm test:run`, focused safeStorage tests                                                  | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/safe-storage-plan.md`, `docs/ai-runs/20260531-144505-ccd-m7-safe-storage-codec-foundation/reports/behavior-compatibility-notes.md`      | `packages/shared-utils/src/storageCodec.ts`                                                                                |                            | M7 confirms JSON storage codec helpers are already package-owned in `@ccd/shared-utils` and consumed by `core.ts`; key/env/logger/crypto stay app-owned. |
| B-07 | B        | P1       | DONE               | crypto helper                  | app-owned runtime                               | `apps/web-demo/src/utils/safeStorage/crypto.ts`                                                                                                                                 | app-only (terminal)                                                        | Web Crypto/HMAC/crypto-es remain app-local per D-016 Option A.                                                                                               | N/A — owner approved app ownership.                                                             | P1                  | `pnpm arch:runtime`, web-demo tests                                                         | `docs/ai-runs/20260601-101000-ccd-p1-d016-safe-storage-crypto-decision/reports/summary.md`                                                                                                            | `docs/ai-plan/DECISIONS.md` D-016                                                                                          |                            | P1 owner approved Option A 2026-06-01; crypto migration is not pending.                                                                                  |
| B-08 | B        | P1       | DONE               | compression helper             | app-owned runtime                               | `apps/web-demo/src/utils/safeStorage/lzstring.ts`                                                                                                                               | app-only (terminal)                                                        | lz-string compression remains app-local per D-019 Option A.                                                                                                  | N/A — owner approved app ownership.                                                             | P2                  | web-demo type-check                                                                         | `docs/ai-runs/20260601-102000-ccd-p2-b08-compression-lz-string-decision/reports/b08-compression-analysis.md`                                                                                          | `docs/ai-plan/DECISIONS.md` D-019                                                                                          |                            | P2 owner approved Option A 2026-06-01; no shared-utils manifest lane.                                                                                    |
| B-09 | B        | P0       | OPEN               | size store                     | app store plus platform APIs                    | `apps/web-demo/src/stores/modules/system/size.ts`                                                                                                                               | app store, `packages/design-tokens`, `packages/vue-app-platform`           | M8 removed pure size calculation from the app facade, but the Pinia store still owns concrete state, persistence, and sync.                                  | Store remains app-owned and must not become package implementation.                             | M8/M10              | size store specs, `pnpm e2e:layout`                                                         | `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/reports/remaining-app-facade-scope.md`                                                                                            | `apps/web-demo/src/utils/theme/sizeEngine.ts`                                                                              |                            | M8 foundation progress only; M10 owns any future pure state extraction.                                                                                  |
| B-10 | B        | P0       | OPEN               | device breakpoint runtime      | design-tokens/vue-app-platform plus app adapter | `apps/web-demo/src/stores/modules/system/device.ts`, `apps/web-demo/src/utils/deviceSync.ts`                                                                                    | pure resolver packages plus app browser listener                           | Device/breakpoint logic directly uses browser globals.                                                                                                       | Breakpoint system remains app-bound.                                                            | M9/M10              | device specs, layout e2e                                                                    | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/theme-size-device-plan.md`                                                                                                              | `packages/design-tokens/src/breakpoints.ts`                                                                                |                            | M5 separates pure resolver inputs from app browser collection/listeners.                                                                                 |
| B-11 | B        | P1       | OPEN               | theme switch hook              | vue-app-platform plus app adapter               | `apps/web-demo/src/hooks/modules/useThemeSwitch.ts`                                                                                                                             | `packages/vue-app-platform`, app UI integration                            | Theme transition hook manipulates DOM, timers, view transitions, and `localStorage`.                                                                         | Reusable theme runtime remains app-local.                                                       | M8/M10              | `pnpm e2e:visual`, `pnpm arch:runtime`                                                      | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/theme-size-device-plan.md`                                                                                                              | `apps/web-demo/src/utils/theme/transitions.ts`, `apps/web-demo/src/utils/theme/mode.ts`                                    |                            | M5 keeps animation/UX integration app-owned and plans package primitives only.                                                                           |
| B-12 | B        | P1       | OPEN               | ProTable URL sync facade       | `@ccd/vue-ui` plus app router adapter           | `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`, `apps/web-demo/src/plugins/modules/protable.ts`                                                                        | app router adapter injected into `@ccd/vue-ui`                             | ProTable URL sync is public-looking app hook code and depends on app router state.                                                                           | Router coupling may leak into `packages/vue-ui` or become hidden app platform API.              | M11                 | web-demo type-check, focused ProTable URL sync tests if changed                             | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/system-store-and-hook-facade-plan.md`                                                                                                   | `packages/vue-ui/src/ProTable/engine/hooks/useProTableUrlSync.ts`                                                          |                            | M5 confirms it remains an app-local router adapter facade.                                                                                               |
| C-01 | C        | P0       | DONE               | runtime policy                 | governance                                      | `.ai/governance/policies/runtime.json`                                                                                                                                          | runtime policy by package class                                            | Runtime surface scan now covers apps and governed packages with runtime classes.                                                                             | New unclassified production runtime access fails `pnpm arch:runtime`.                           | M3                  | `pnpm arch:runtime`                                                                         | `docs/ai-runs/20260531-101606-ccd-m3-browser-runtime-boundary/reports/runtime-surface-inventory.md`                                                                                                   | `scripts/architecture/check-runtime-leaks.mjs`                                                                             |                            | 387 inventory rows; 301 production file/surface pairs classified.                                                                                        |
| C-02 | C        | P0       | DONE               | web adapter boundary           | governance/apps                                 | `.ai/governance/policies/runtime.json`, `apps/web-demo/src/**`                                                                                                                  | web adapter policy plus approved infrastructure exceptions                 | Browser adapter path allowance and exact app-local exceptions are encoded.                                                                                   | Existing debt is classified; new unclassified browser runtime fails.                            | M3                  | `pnpm arch:runtime`, `pnpm arch:boundaries`                                                 | `docs/ai-runs/20260531-101606-ccd-m3-browser-runtime-boundary/reports/exceptions-register.md`                                                                                                         | `apps/web-demo/src/adapters/**`                                                                                            |                            | 297 exact file/surface exceptions plus adapter path allowances.                                                                                          |
| C-03 | C        | P0       | DONE               | topology boundary validator    | governance script                               | `scripts/architecture/validate-boundaries.mjs`                                                                                                                                  | topology-aware validator                                                   | Validator now enforces `allowedWorkspaceDependencies` against manifest workspace refs.                                                                       | Policy drift is caught by `pnpm arch:boundaries`.                                               | M1                  | `pnpm arch:boundaries`, `pnpm validate:governance`                                          | `docs/ai-runs/20260531-093147-ccd-m1-topology-truth-source-alignment/command-logs/analysis-topology-compare-before.md`                                                                                | `.ai/governance/policies/topology.json`, `packages/*/package.json`, `apps/*/package.json`                                  |                            | M1 added manifest/policy enforcement only; browser runtime boundary remains M3 scope.                                                                    |
| C-04 | C        | P1       | PARTIALLY_OBSOLETE | dependency-cruiser             | architecture tooling                            | `.dependency-cruiser.cjs`, `scripts/architecture/check-runtime-leaks.mjs`                                                                                                       | depcruise plus runtime checker                                             | Browser runtime rules are enforced by runtime checker instead of dependency-cruiser.                                                                         | Dependency-cruiser still owns import graph boundaries; runtime surface enforcement is separate. | M3                  | `pnpm arch:runtime`, `pnpm arch:boundaries`                                                 | `docs/ai-runs/20260531-101606-ccd-m3-browser-runtime-boundary/command-logs/analysis-arch-boundaries-tauri-before.log`                                                                                 | `.dependency-cruiser.cjs`                                                                                                  |                            | No depcruise rule added to avoid false-positive floods.                                                                                                  |
| C-05 | C        | P0       | DONE               | runtime docs vs code           | docs/apps                                       | `docs/runtime/runtime-isolation.md`, `apps/web-demo/src/utils/**`, `apps/web-demo/src/stores/**`                                                                                | exception policy plus migration lanes                                      | Runtime docs now cite exact exceptions and M4/M5 migration lanes.                                                                                            | Reviewers can distinguish classified debt from new violations.                                  | M3                  | `pnpm docs:commands`, `pnpm arch:runtime`                                                   | `docs/ai-runs/20260531-101606-ccd-m3-browser-runtime-boundary/reports/runtime-boundary-policy.md`                                                                                                     | `.ai/governance/policies/runtime.json`                                                                                     |                            | Source debt remains for M4/M5; policy/docs gap closed.                                                                                                   |
| C-06 | C        | P1       | OPEN               | PrimeVue boundary              | vue-ui/adapter/apps                             | `docs/en/architecture-contract.md`, `scripts/ai-architecture-guard.mjs`                                                                                                         | `packages/vue-ui`, `packages/vue-primevue-adapter`                         | Direct app PrimeVue imports are governed by exact allowlists, generated typing, app shell/plugin exceptions, and the showcase exception.                     | New feature imports may bypass wrappers if not guarded.                                         | M3, M4, M5, M12, P3 | `pnpm ai:guard`, `pnpm api:report`                                                          | `docs/ai-runs/20260601-103000-ccd-p3-d017-primevue-reduction-decision/reports/summary.md`                                                                                                             | `docs/ai-plan/DECISIONS.md` D-017                                                                                          |                            | P3 approved guard posture Options A+D; allowlist debt remains; M12 reduction not authorized.                                                             |
| D-01 | D        | P0       | DONE               | governance report              | generated docs/policy                           | `docs/generated/governance-report.md`, `packages/contracts/package.json`                                                                                                        | topology policy/generator                                                  | Report now matches contracts manifest: no workspace deps.                                                                                                    | Generated report no longer asserts contracts -> design-tokens.                                  | M1                  | `pnpm arch:report`, `pnpm validate:governance`                                              | M1 generated report log                                                                                                                                                                               | `.ai/governance/policies/topology.json`                                                                                    |                            | Generated report regenerated, not hand-edited.                                                                                                           |
| D-02 | D        | P0       | DONE               | governance report              | generated docs/policy                           | `docs/generated/governance-report.md`, `packages/vue-hooks/package.json`                                                                                                        | topology policy/generator                                                  | Report now includes vue-hooks -> shared-utils.                                                                                                               | Topology graph matches manifest edge.                                                           | M1                  | `pnpm arch:report`, `pnpm validate:governance`                                              | M1 package diff scan                                                                                                                                                                                  | `.ai/governance/policies/topology.json`                                                                                    |                            | Mirrors E-02.                                                                                                                                            |
| D-03 | D        | P0       | DONE               | governance report              | generated docs/policy                           | `docs/generated/governance-report.md`, `packages/vue-ui/package.json`                                                                                                           | topology policy/generator                                                  | Report now includes vue-ui platform deps.                                                                                                                    | UI package graph is auditable through topology/report.                                          | M1                  | `pnpm arch:report`, `pnpm validate:governance`                                              | M1 package diff scan                                                                                                                                                                                  | `.ai/governance/policies/topology.json`                                                                                    |                            | Mirrors E-04.                                                                                                                                            |
| D-04 | D        | P0       | DONE               | API surface                    | governance API                                  | `.ai/governance/policies/api.json`, `docs/generated/api-surface-report.md`, `packages/vue-app-platform/package.json`                                                            | API policy and report                                                      | Public package `@ccd/vue-app-platform` is now included in API policy/report coverage.                                                                        | Resolved for API snapshot/report omission.                                                      | M2                  | `pnpm api:report`                                                                           | `docs/ai-runs/20260531-095818-ccd-m2-governance-api-surface-repair/command-logs/analysis-topology-public-api-vs-report-after.tsv`                                                                     | `scripts/architecture/check-api-surface.mjs`                                                                               |                            | Generated report and snapshot were regenerated by `pnpm api:report`.                                                                                     |
| D-05 | D        | P1       | DONE               | README matrix                  | docs                                            | `README.md`                                                                                                                                                                     | docs                                                                       | README package graph/responsibility matrix is not fully aligned with current package set.                                                                    | New agents get stale ownership hints.                                                           | M14, M15            | `pnpm docs:commands`                                                                        | M15 README surface sync                                                                                                                                                                               | `docs/en/architecture-contract.md`                                                                                         |                            | M15 aligns README package responsibilities with current workspace package set, including `vue-app-platform`.                                             |
| D-06 | D        | P1       | NEEDS_REVIEW       | web runtime docs               | docs/apps                                       | `docs/runtime/web-runtime.md`, `apps/web-demo/package.json`                                                                                                                     | docs                                                                       | Dependency wording mostly matches manifests but app-local candidate list needs reclassification after extractions.                                           | Runtime docs overstate candidate ownership.                                                     | M14                 | `pnpm docs:commands`                                                                        | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/summary.md`                                                                                                                             | `README.md`, `docs/en/architecture-contract.md`                                                                            |                            | M5/M6 update candidate precision, but final docs reconciliation remains M14.                                                                             |
| D-07 | D        | P1       | DONE               | desktop runtime docs           | docs/apps                                       | `docs/runtime/desktop-runtime.md`, `apps/desktop/package.json`                                                                                                                  | docs and topology policy                                                   | Desktop docs now list current governed workspace dependencies.                                                                                               | Desktop review uses manifest-aligned dependency set.                                            | M1                  | `pnpm docs:commands`, `pnpm arch:boundaries`                                                | M1 package diff scan                                                                                                                                                                                  | `.ai/governance/policies/topology.json`                                                                                    |                            | Mirrors E-05.                                                                                                                                            |
| D-08 | D        | P1       | DONE               | ownership docs                 | docs/vue-ui                                     | `README.md`, `docs/architecture/ownership-boundaries.md`, `docs/zh/02-architecture.md`, `docs/ai-plan/PLAN.md`, `docs/zh/04-project-control-center.md`, `docs/zh/08-release.md` | docs                                                                       | Docs no longer name removed app component paths as app-local candidates in non-historical surfaces.                                                          | Codex may migrate backwards or inspect nonexistent paths.                                       | M14, M15, M16       | `pnpm docs:commands`                                                                        | M16 stale path grep                                                                                                                                                                                   | `packages/vue-ui/src/PrimeDialog/**`, `packages/vue-ui/src/ProForm/**`, `packages/vue-ui/src/ProTable/**`                  |                            | M15 fixed README; M16 fixed PLAN and Chinese contributor/release docs. Historical `docs/ai-runs/**` evidence is intentionally preserved.                 |
| D-09 | D        | P1       | PARTIALLY_OBSOLETE | generated graph                | generated docs                                  | `docs/generated/graphs/workspace-graph.mmd`, `docs/generated/graphs/package-dependency-graph.mmd`                                                                               | graph generator                                                            | Graph output is still policy-sourced, but topology policy is now manifest-enforced.                                                                          | Drift hiding risk is reduced; edge-class labeling is still future work.                         | M1/M2               | `pnpm arch:graphs`, `pnpm arch:boundaries`                                                  | generated graph scan                                                                                                                                                                                  | `scripts/architecture/generate-dependency-graphs.mjs`                                                                      |                            | Generated graph refreshed by gate; no manual generated edits.                                                                                            |
| D-10 | D        | P1       | PARTIALLY_OBSOLETE | HTTP boundary docs             | contracts/core/apps                             | `docs/ai-plan/DECISIONS.md`, `packages/contracts/src/http/**`, `apps/web-demo/src/utils/http/**`                                                                                | contracts for types, app infra for runtime                                 | Older wording says HTTP contracts are future/blocked, but type-only HTTP contracts now exist and core remains blocked.                                       | Agents may either duplicate or migrate runtime to core.                                         | M14                 | `pnpm arch:runtime`, HTTP tests                                                             | contracts scan                                                                                                                                                                                        | `packages/core/src/index.ts`, `docs/runtime/web-runtime.md`                                                                |                            | Reconcile status with D-014 and current source.                                                                                                          |
| D-11 | D        | P1       | PARTIALLY_OBSOLETE | AI scaffolds/guards            | scripts/docs                                    | `scripts/ai-route-view-scaffold.mjs`, `scripts/ai-architecture-guard.mjs`, `docs/ai-plan/PLAN.md`                                                                               | current package public APIs                                                | Planning docs and scaffold imports now use `@ccd/vue-ui`; guard allowlists still reference removed app component paths pending owner-approved M12 reduction. | Generated code or guards can target nonexistent app APIs.                                       | M12/M14/M15/M16     | `pnpm codex:preflight`, `pnpm ai:guard`                                                     | M16 stale path grep                                                                                                                                                                                   | `packages/vue-ui/src/index.ts`                                                                                             |                            | M15 fixed scaffold type imports; M16 fixed `docs/ai-plan/PLAN.md`. PrimeVue guard allowlist reduction remains owner-approved M12 work outside M16 scope. |
| E-01 | E        | P0       | DONE               | topology enforcement           | governance                                      | `.ai/governance/policies/topology.json`, `scripts/architecture/validate-boundaries.mjs`                                                                                         | topology-aware validator                                                   | Allowed workspace dependencies are enforced against manifests.                                                                                               | Policy-only boundary removed.                                                                   | M1                  | `pnpm arch:boundaries`, `pnpm validate:governance`                                          | M1 topology comparison                                                                                                                                                                                | `packages/*/package.json`, `apps/*/package.json`                                                                           |                            | Root cause for E-02..E-07 closed.                                                                                                                        |
| E-02 | E        | P0       | DONE               | vue-hooks deps                 | `@ccd/vue-hooks`                                | `packages/vue-hooks/package.json`, `.ai/governance/policies/topology.json`                                                                                                      | topology policy                                                            | Policy now allows `@ccd/shared-utils`.                                                                                                                       | Dependency report matches manifest.                                                             | M1                  | `pnpm arch:boundaries`, `pnpm validate:governance`                                          | package diff scan                                                                                                                                                                                     | `docs/generated/governance-report.md`                                                                                      |                            |                                                                                                                                                          |
| E-03 | E        | P0       | DONE               | vue-app-platform deps          | `@ccd/vue-app-platform`                         | `packages/vue-app-platform/package.json`, `.ai/governance/policies/topology.json`                                                                                               | topology policy                                                            | Policy now allows `@ccd/design-tokens`.                                                                                                                      | Platform dependency is explicit.                                                                | M1                  | `pnpm arch:boundaries`, `pnpm validate:governance`                                          | package diff scan                                                                                                                                                                                     | `docs/generated/governance-report.md`                                                                                      |                            | API surface gap remains D-04/M2.                                                                                                                         |
| E-04 | E        | P0       | DONE               | vue-ui deps                    | `@ccd/vue-ui`                                   | `packages/vue-ui/package.json`, `.ai/governance/policies/topology.json`                                                                                                         | topology policy                                                            | Policy now allows design-tokens/shared-utils/vue-hooks.                                                                                                      | UI package graph can be audited.                                                                | M1                  | `pnpm arch:boundaries`, `pnpm validate:governance`                                          | package diff scan                                                                                                                                                                                     | `docs/generated/governance-report.md`                                                                                      |                            |                                                                                                                                                          |
| E-05 | E        | P0       | DONE               | desktop deps                   | `@ccd/desktop`                                  | `apps/desktop/package.json`, `.ai/governance/policies/topology.json`                                                                                                            | topology policy                                                            | Policy now allows desktop's current platform package deps.                                                                                                   | Desktop build and governance agree on workspace deps.                                           | M1                  | `pnpm arch:boundaries`, `pnpm docs:commands`                                                | package diff scan                                                                                                                                                                                     | `docs/runtime/desktop-runtime.md`                                                                                          |                            |                                                                                                                                                          |
| E-06 | E        | P1       | DONE               | contracts allowed deps         | `@ccd/contracts`                                | `.ai/governance/policies/topology.json`, `packages/contracts/package.json`                                                                                                      | topology policy                                                            | Policy now allows no contracts workspace deps.                                                                                                               | Future token imports into ABI are no longer pre-approved.                                       | M1                  | `pnpm arch:boundaries`, `pnpm validate:governance`                                          | package diff scan                                                                                                                                                                                     | `docs/generated/governance-report.md`                                                                                      |                            |                                                                                                                                                          |
| E-07 | E        | P0       | DONE               | vue-charts deps                | `@ccd/vue-charts`                               | `packages/vue-charts/package.json`, `.ai/governance/policies/topology.json`, `docs/generated/governance-report.md`                                                              | topology policy/generator                                                  | Policy/report now include `@ccd/design-tokens`.                                                                                                              | Chart package dependency drift is tracked.                                                      | M1                  | `pnpm arch:boundaries`, `pnpm validate:governance`, `pnpm api:report`                       | package diff scan                                                                                                                                                                                     | `packages/vue-charts/src/**`                                                                                               |                            | New scan finding closed in M1.                                                                                                                           |
| F-01 | F        | P1       | DONE               | web-demo tsconfig              | TS build boundary                               | `apps/web-demo/tsconfig.json`                                                                                                                                                   | package exports/build outputs                                              | App no longer includes `../../packages/vue-ui/src/**` or `../../packages/vue-charts/src/**`.                                                                 | Regression guarded by package smoke and `arch:boundaries`.                                      | M13                 | web-demo type-check/build                                                                   | `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/reports/tsconfig-boundary-analysis.md`                                                                                           | `packages/vue-ui/package.json`, `packages/vue-charts/package.json`, `scripts/ci/package-resolution-smoke.mjs`              |                            | M13 source include count changed from 5 to 0 for web-demo.                                                                                               |
| F-02 | F        | P1       | DONE               | desktop tsconfig               | TS build boundary                               | `apps/desktop/tsconfig.json`                                                                                                                                                    | package exports/build outputs plus existing references                     | Desktop no longer includes `../../packages/vue-ui/src/**`.                                                                                                   | Regression guarded by package smoke and `arch:boundaries`.                                      | M13                 | desktop type-check/build                                                                    | `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/reports/tsconfig-boundary-analysis.md`                                                                                           | `packages/vue-ui/package.json`, `scripts/ci/package-resolution-smoke.mjs`                                                  |                            | M13 source include count changed from 3 to 0 for desktop.                                                                                                |
| F-03 | F        | P1       | DONE               | boundary masked by tsconfig    | TS build boundary                               | `tsconfig.base.json`, `apps/web-demo/tsconfig.json`, `apps/desktop/tsconfig.json`, `scripts/architecture/validate-boundaries.mjs`                                               | root no global `@ccd/*`; app configs consume exports                       | Root still avoids global `@ccd/*` paths and app source includes are removed.                                                                                 | New app tsconfig package source includes now fail `pnpm arch:boundaries`.                       | M13                 | `pnpm arch:boundaries`, `pnpm type-check`                                                   | `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/reports/validation-closure.md`                                                                                                   | `.dependency-cruiser.cjs`, `scripts/architecture/validate-boundaries.mjs`                                                  |                            | M13 added a non-invasive tsconfig include guard.                                                                                                         |
| F-04 | F        | P1       | DONE               | root scripts import app source | tooling/build boundary                          | `scripts/upgrade-all-themes.mjs`, `scripts/validate-token-contrast.ts`                                                                                                          | `@ccd/design-tokens/theme-engine` public API                               | Root theme tooling no longer imports app theme utilities.                                                                                                    | Regression guarded by `scripts/architecture/validate-boundaries.mjs` root tooling import scan.  | M13a                | `pnpm validate:tokens`, `pnpm arch:boundaries`, `pnpm api:report`, `pnpm ci:smoke:packages` | `docs/ai-runs/20260531-203406-ccd-m13a-root-theme-tooling-boundary-repair/reports/root-theme-tooling-boundary-analysis.md`                                                                            | `packages/design-tokens/src/theme-engine/index.ts`, `scripts/upgrade-all-themes.mjs`, `scripts/validate-token-contrast.ts` |                            | Root target import count changed from 3 matched app-theme import lines to 0.                                                                             |
| G-01 | G        | P1       | DONE               | planning status                | docs/ai-plan                                    | `docs/ai-plan/STATUS.md`                                                                                                                                                        | status docs                                                                | Status can be read as planning completion, not architecture completion.                                                                                      | False GO.                                                                                       | M14, M15            | docs check                                                                                  | M15 status surface sync                                                                                                                                                                               | `docs/ai-plan/FINAL_GO_NO_GO.md`                                                                                           |                            | M15 updates STATUS and FINAL_GO_NO_GO to current M14 NO_GO.                                                                                              |
| G-02 | G        | P1       | OPEN               | open tasks                     | runtime ledger/status                           | `docs/ai-plan/STATUS.md`, `.ai/runtime/repair_list.md`                                                                                                                          | task ledger                                                                | `pnpm ai:doctor --open` reports 80 open tasks; P7 classified all 80 as blocked/deferred/future-lane.                                                         | Incomplete work hidden by summary.                                                              | M14, M15, M16, P7   | `pnpm ai:doctor --open`                                                                     | `docs/ai-runs/20260601-105000-ccd-p7-repair-ledger-reconciliation/reports/task-reconciliation.md`                                                                                                     | `.ai/runtime/repair_list.md`                                                                                               |                            | P7 classified 80 tasks; 0 closed without evidence; G-02 remains OPEN.                                                                                    |
| G-03 | G        | P0       | BLOCKED            | blockers                       | docs/ai-plan                                    | `docs/ai-plan/STATUS.md`, `docs/ai-plan/FINAL_GO_NO_GO.md`                                                                                                                      | owner/operator decisions                                                   | Blockers remain for guard scope, Vite, dependencies, Login Diorama, final GO.                                                                                | Architecture cannot be declared complete.                                                       | M14                 | final go/no-go review                                                                       | status scan                                                                                                                                                                                           | `docs/ai-plan/DECISIONS.md`, `.ai/runtime/owner_decisions.md`                                                              |                            | Blocking decision owners must be named.                                                                                                                  |

## 5. Per-Issue Details

### A-01 - Common platform terminology drift

- Status: OPEN
- Priority: P0
- Category: A terminology and decision drift
- Owner layer: architecture docs
- Current paths: `README.md`, `docs/en/architecture-contract.md`, `docs/adr/ADR-005-common-platform-layer-terminology.md`
- Target paths: non-generated architecture docs
- Problem: Agents can misread common platform work as `packages/core` work.
- Risk: Hooks, utils, components, theme, UnoCSS, or PrimeVue code may be moved into `packages/core`.
- Architecture decision: Use `common platform layer` for governed `packages/*`; `packages/core` stays runtime-neutral.
- Required action: Keep terminology consistent and prominent.
- Forbidden action: Do not move shared frontend code into `packages/core`.
- Validation commands: `pnpm docs:commands`, `pnpm validate:governance`
- Evidence to capture: grep for `common core layer`, `core shared bucket`, and `common platform layer`.
- Related files: `docs/architecture/ownership-boundaries.md`
- Related policies: ADR-005, topology policy
- Repair notes: Documentation lane only.
- Residual risk: Prompt wording can still override docs if not repeated.
- Last updated: 2026-05-31

### A-02 - ADR status drift

- Status: OPEN
- Priority: P1
- Category: A terminology and decision drift
- Owner layer: architecture decisions
- Current paths: `docs/adr/ADR-005-common-platform-layer-terminology.md`, `docs/adr/ADR-006-approval-gated-architecture-lanes.md`, `docs/ai-plan/DECISIONS.md`
- Target paths: ADR and decision docs
- Problem: ADRs remain `Proposed` while their rules are used as active constraints.
- Risk: Codex may treat active constraints as optional.
- Architecture decision: Adopted rules need approved status or explicit proposal status.
- Required action: Owner review to approve or keep proposed with explicit effect.
- Forbidden action: Do not silently upgrade ADR status without owner evidence.
- Validation commands: `pnpm docs:commands`, `pnpm ai:doctor --open`
- Evidence to capture: ADR status diff and decision log mapping.
- Related files: `docs/ai-plan/STATUS.md`
- Related policies: ADR-005, ADR-006
- Repair notes: Approval-gated doc change.
- Residual risk: Status remains ambiguous until owner decides.
- Last updated: 2026-05-31

### A-03 - App-local allowance conflict

- Status: NEEDS_REVIEW
- Priority: P1
- Category: A terminology and decision drift
- Owner layer: apps/web-demo
- Current paths: `README.md`, `docs/zh/02-architecture.md`, `docs/en/architecture-contract.md`
- Target paths: docs plus migration lanes
- Problem: Docs allow app-local shared candidates while the target rule forbids app-local public common APIs.
- Risk: App code remains a hidden platform layer.
- Architecture decision: App-local candidates must be temporary facades, app-only infrastructure, or migration candidates.
- Required action: Reclassify each candidate.
- Forbidden action: Do not preserve app-local public barrels as permanent platform APIs.
- Validation commands: `pnpm docs:commands`
- Evidence to capture: current app candidate inventory and owner target.
- Related files: `apps/web-demo/src/hooks/modules/useAutoMitt.ts`, `apps/web-demo/src/utils/safeStorage/index.ts`
- Related policies: ownership boundaries
- Repair notes: Partially obsolete because ProForm/ProTable/PrimeDialog moved to `packages/vue-ui`.
- M5 planning outcome: App-local candidates are now split into app-only runtime, thin compatibility facades, package extraction candidates, and B-07 owner-decision blocker.
- Residual risk: Remaining hooks/utils/stores still need lane decisions.
- Last updated: 2026-05-31

### B-01 - App-local event hook wrapper

- Status: OPEN
- Priority: P1
- Category: B app-local shared capability residue
- Owner layer: `@ccd/vue-hooks` plus app event binding
- Current paths: `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- Target paths: `packages/vue-hooks` and app event-map binding
- Problem: App retains a generic event hook wrapper.
- Risk: App hook becomes reusable API outside platform governance.
- Architecture decision: Common composable factory belongs in `packages/vue-hooks`; app owns emitter/event map.
- Required action: Keep wrapper thin or move reusable behavior to package.
- Forbidden action: Do not move event runtime to `packages/core`.
- Validation commands: `pnpm --filter @ccd/vue-hooks test`, `pnpm --filter @ccd/web-demo type-check`
- Evidence to capture: imports from `useAutoMitt` and `createAutoMittHook`.
- Related files: `packages/vue-hooks/src/createAutoMittHook.ts`, `apps/web-demo/src/utils/mitt.ts`
- Related policies: topology policy
- Repair notes: Current wrapper is thin but public-app-local in practice.
- M5 planning outcome: Keep `useAutoMitt.ts` as app event-map binding over `createAutoMittHook`; move no app event map into the package.
- M11 verification: `apps/web-demo/src/hooks/modules/useAutoMitt.ts` remains a thin app binding over `@ccd/vue-hooks/createAutoMittHook`; focused app facade test locks emitter binding, emit forwarding, and unmount cleanup delegation.
- Residual risk: Wrapper may grow new generic behavior.
- Last updated: 2026-05-31

### B-02 - App-local dialog facade

- Status: OPEN
- Priority: P1
- Category: B app-local shared capability residue
- Owner layer: `@ccd/vue-ui` plus app i18n adapter
- Current paths: `apps/web-demo/src/hooks/modules/useDialog.tsx`
- Target paths: `packages/vue-ui`, app i18n adapter
- Problem: App owns dialog convenience methods and translated defaults.
- Risk: Shared UI workflow remains app-only.
- Architecture decision: CCD-owned dialog primitives belong in `packages/vue-ui`; app owns locale text injection.
- Required action: Split generic dialog action builder from app translations if reused.
- Forbidden action: Do not expose raw PrimeVue as app public API.
- Validation commands: `pnpm --filter @ccd/vue-ui test`, web-demo type-check
- Evidence to capture: dialog imports and consumers.
- Related files: `packages/vue-ui/src/PrimeDialog/**`
- Related policies: PrimeVue boundary decision D-003
- Repair notes: `useDialogCore` already lives in `packages/vue-ui`.
- M5 planning outcome: Keep i18n/default text in app facade; reusable dialog primitives stay in `packages/vue-ui`.
- M11 verification: `useDialog.tsx` remains app-owned because translated labels, default messages, severity mapping, close commands, and callback wiring are app UX semantics; focused app facade tests cover these defaults without moving source.
- Residual risk: App facade remains broad.
- Last updated: 2026-05-31

### B-03 - Theme facade runtime access

- Status: PARTIALLY_OBSOLETE
- Priority: P0
- Category: B app-local shared capability residue
- Owner layer: design-tokens, vue-app-platform, app adapter
- Current paths: `apps/web-demo/src/utils/theme/engine.ts`
- Target paths: `packages/design-tokens`, `packages/vue-app-platform`, app storage adapter
- Problem: Facade delegates pure work but still directly passes `document.documentElement` and `localStorage`.
- Risk: Runtime boundary remains in app utility facade.
- Architecture decision: Pure token derivation belongs in design-tokens; DOM application belongs in vue-app-platform with injected capabilities.
- Required action: Convert app facade to compatibility wrapper or adapter-injected boundary.
- Forbidden action: Do not move DOM/storage access into `packages/core`.
- Validation commands: `pnpm arch:runtime`, `pnpm e2e:visual`
- Evidence to capture: line evidence for DOM/storage and package delegation.
- Related files: `packages/design-tokens/src/theme-engine/index.ts`, `packages/vue-app-platform/src/themeRuntime.ts`
- Related policies: runtime policy
- Repair notes: Improved since original issue; not DONE.
- M5 planning outcome: `engine.ts` is a compatibility facade over package primitives; future source lane should shrink DOM/storage calls behind app-injected capabilities.
- M8 outcome: Theme pure derivation was verified as already package-owned by `@ccd/design-tokens/theme-engine`; `applyTheme` remains an app compatibility wrapper injecting `document.documentElement`, `localStorage`, and app storage keys into `@ccd/vue-app-platform`.
- Residual risk: Compatibility facade can expand.
- Last updated: 2026-05-31

### B-04 - Size system in app utils

- Status: OPEN
- Priority: P0
- Category: B app-local shared capability residue
- Owner layer: design-tokens, vue-app-platform, app adapter
- Current paths: `apps/web-demo/src/utils/theme/sizeEngine.ts`
- Target paths: `packages/design-tokens`, `packages/vue-app-platform`, app adapter
- Problem: Size variable generation, layout dimensions, DOM writes, storage, and device sync are mixed.
- Risk: Size/breakpoint platform logic is not reusable or enforceable.
- Architecture decision: Pure calculation belongs in platform packages; browser effects stay app-side.
- Required action: Plan extraction into pure calculation, runtime application, and app preload adapter.
- Forbidden action: Do not move size system into `packages/core`.
- Validation commands: `pnpm e2e:layout`, `pnpm e2e:visual`, web-demo build
- Evidence to capture: DOM write and storage line evidence.
- Related files: `apps/web-demo/src/stores/modules/system/size.ts`, `apps/web-demo/src/utils/deviceSync.ts`
- Related policies: ownership boundaries
- Repair notes: High-risk visual lane.
- M5 planning outcome: Split pure size calculations to `packages/design-tokens`, runtime application helpers to `packages/vue-app-platform`, and preload/storage/device reads to app adapters.
- M8 outcome: `packages/design-tokens/src/sizeResolver.ts` now owns pure size variable generation, root font decision, layout dimension decision, runtime font variable derivation, preset fallback, and scoped content variable derivation. `apps/web-demo/src/utils/theme/sizeEngine.ts` remains the app compatibility facade and delegates those pure helpers while keeping DOM/preload/browser runtime behavior app-owned.
- Residual risk: Theme/size visual regressions.
- Last updated: 2026-05-31

### B-05 - SafeStorage app barrel

- Status: OPEN
- Priority: P0
- Category: B app-local shared capability residue
- Owner layer: contracts/shared-utils/app adapter
- Current paths: `apps/web-demo/src/utils/safeStorage/index.ts`
- Target paths: `packages/contracts`, `packages/shared-utils`, app adapter
- Problem: SafeStorage exposes a package-like app barrel.
- Risk: Other app code treats app utils as a public platform package.
- Architecture decision: Types in contracts, pure helpers in shared-utils, browser runtime in app adapter.
- Required action: Classify barrel as compatibility facade or split.
- Forbidden action: Do not export app barrel from `apps/*`.
- Validation commands: `pnpm arch:boundaries`, focused storage tests
- Evidence to capture: exported symbols and consumers.
- Related files: `apps/web-demo/src/utils/safeStorage/core.ts`, `apps/web-demo/src/utils/safeStorage/safeStorage.ts`
- Related policies: topology export policy
- Repair notes: Existing direct app imports need inventory.
- M5 planning outcome: Treat `index.ts` as temporary app-private facade only; package APIs must come from contracts/shared-utils, not from `apps/*`.
- M7 outcome: No app compatibility exports changed. `index.ts` remains an app-private compatibility facade while JSON codec helpers are consumed from `@ccd/shared-utils`.
- Residual risk: Migration can affect persisted data.
- Last updated: 2026-05-31

### B-06 - SafeStorage mixed responsibilities

- Status: OPEN
- Priority: P0
- Category: B app-local shared capability residue
- Owner layer: contracts/shared-utils/app adapter
- Current paths: `apps/web-demo/src/utils/safeStorage/core.ts`
- Target paths: `packages/contracts`, `packages/shared-utils`, app adapter
- Problem: Codec, obfuscation, browser key resolution, env, and logger concerns are mixed.
- Risk: Pure logic cannot be reused and runtime logic may move to wrong package.
- Architecture decision: Extract only runtime-neutral codec/types first.
- Required action: Split pure codec from browser storage/key resolver.
- Forbidden action: Do not encode browser APIs in contracts/core.
- Validation commands: `pnpm test:run`, focused safeStorage tests
- Evidence to capture: storage/env/document/window usage.
- Related files: `packages/shared-utils/src/storageCodec.ts`, `packages/contracts/src/storage.ts`
- Related policies: runtime policy
- Repair notes: Treat as source migration lane, not M0.
- M5 planning outcome: Extract only deterministic codec/pack/unpack/obfuscation helpers in a later source lane; key resolution, env, logger, DOM, and storage stay app-owned.
- M7 outcome: JSON storage codec helpers (`stringifyJsonStorageValue`, `parseJsonStorageValue`) are already established in `packages/shared-utils/src/storageCodec.ts` and already consumed by `core.ts`. No additional core movement was safe because compression requires an undeclared `lz-string` dependency and crypto/runtime behavior is blocked.
- Residual risk: Backward-compatible storage migration required.
- Last updated: 2026-05-31

### B-07 - SafeStorage crypto helper classification

- Status: DONE
- Priority: P1
- Category: B app-local shared capability residue
- Owner layer: app-owned runtime (terminal)
- Current paths: `apps/web-demo/src/utils/safeStorage/crypto.ts`
- Target paths: app-only (no package migration)
- Problem: Resolved — owner approved app ownership (D-016 Option A).
- Risk: Mitigated — crypto must not move to packages without a new owner decision.
- Architecture decision: Crypto runtime remains app-owned per D-016 APPROVED.
- Required action: None for crypto migration; P4 may perform non-crypto facade cleanup only.
- Forbidden action: Do not move Web Crypto implementation into contracts/core/shared-utils.
- Validation commands: `pnpm arch:runtime`, web-demo tests
- Evidence to capture: P1 decision run.
- Related files: `packages/contracts/src/crypto.ts` (type shape only)
- Related policies: runtime policy
- Repair notes: P1 owner approved Option A on 2026-06-01. Evidence: `docs/ai-runs/20260601-101000-ccd-p1-d016-safe-storage-crypto-decision/`.
- Last updated: 2026-06-01

### B-08 - Compression helper in app utils

- Status: DONE
- Priority: P1
- Category: B app-local shared capability residue
- Owner layer: app-owned runtime (terminal)
- Current paths: `apps/web-demo/src/utils/safeStorage/lzstring.ts`
- Target paths: app-only (no shared-utils migration)
- Problem: Resolved — owner approved app ownership (D-019 Option A).
- Risk: Mitigated — persisted format unchanged while compression stays app-local.
- Architecture decision: Compression remains app-owned; no lz-string in `@ccd/shared-utils`.
- Required action: None; P5 skipped.
- Forbidden action: Do not add lz-string to shared-utils without new owner/manifest approval.
- Validation commands: web-demo type-check
- Evidence to capture: P2 decision run.
- Related files: `apps/web-demo/src/utils/safeStorage/index.ts`
- Related policies: topology policy
- Repair notes: P2 owner approved Option A on 2026-06-01. Evidence: `docs/ai-runs/20260601-102000-ccd-p2-b08-compression-lz-string-decision/`.
- Last updated: 2026-06-01
- Last updated: 2026-05-31

### B-09 - Size store owns platform logic

- Status: OPEN
- Priority: P0
- Category: B app-local shared capability residue
- Owner layer: app store plus platform APIs
- Current paths: `apps/web-demo/src/stores/modules/system/size.ts`
- Target paths: app store, `packages/design-tokens`, `packages/vue-app-platform`
- Problem: Pinia store handles platform calculation and runtime side effects.
- Risk: Store becomes shared platform implementation.
- Architecture decision: Store owns concrete app state; platform owns pure/runtime primitives.
- Required action: Plan extraction with adapter injection.
- Forbidden action: Do not move Pinia store into packages.
- Validation commands: size store spec, `pnpm e2e:layout`
- Evidence to capture: imports from sizeEngine and persistence behavior.
- Related files: `apps/web-demo/src/utils/theme/sizeEngine.ts`
- Related policies: state/data flow rules
- Repair notes: Requires visual validation.
- M5 planning outcome: Keep Pinia store and persistence decisions app-owned; only extract reusable size state transitions/runtime helpers later.
- M8 outcome: Size store imports still resolve through the app `sizeEngine.ts` compatibility facade, so Pinia state, persisted key, safeStorage serializer, `localStorage`, and `syncAction` behavior are unchanged. The moved foundation is limited to pure resolver helpers in `@ccd/design-tokens`.
- Residual risk: Layout drift.
- Last updated: 2026-05-31

### B-10 - Device and breakpoint runtime in app

- Status: OPEN
- Priority: P0
- Category: B app-local shared capability residue
- Owner layer: design-tokens/vue-app-platform plus app adapter
- Current paths: `apps/web-demo/src/stores/modules/system/device.ts`, `apps/web-demo/src/utils/deviceSync.ts`
- Target paths: pure resolver packages plus app browser listener
- Problem: Device and breakpoint logic directly uses `window`, `screen`, and `navigator`.
- Risk: Breakpoint system cannot be reused without app runtime.
- Architecture decision: Pure resolver in platform packages; browser listener in app infrastructure.
- Required action: Split pure detection inputs from browser collection.
- Forbidden action: Do not move browser detection into `packages/core`.
- Validation commands: device specs, layout e2e, `pnpm arch:runtime`
- Evidence to capture: runtime global use and consumers.
- Related files: `packages/design-tokens/src/breakpoints.ts`
- Related policies: runtime policy
- Repair notes: Coordinate with B-04.
- M5 planning outcome: Split pure breakpoint/device resolver inputs from app browser collectors and listeners.
- Residual risk: Device detection behavior changes.
- Last updated: 2026-05-31

### B-11 - Theme switch hook owns DOM and storage runtime

- Status: OPEN
- Priority: P1
- Category: B app-local shared capability residue
- Owner layer: vue-app-platform plus app adapter
- Current paths: `apps/web-demo/src/hooks/modules/useThemeSwitch.ts`
- Target paths: `packages/vue-app-platform` and app integration
- Problem: Theme transition hook owns DOM elements, root CSS variables, timers, View Transition API, and `localStorage`.
- Risk: Theme runtime remains app-local and hard to reuse.
- Architecture decision: Reusable theme runtime primitives belong in vue-app-platform; app owns concrete UX integration.
- Required action: Plan extraction after theme/size owner decisions.
- Forbidden action: Do not migrate DOM/timer logic into `packages/core`.
- Validation commands: `pnpm e2e:visual`, `pnpm arch:runtime`
- Evidence to capture: runtime surface map for hook.
- Related files: `apps/web-demo/src/utils/theme/transitions.ts`, `apps/web-demo/src/utils/theme/mode.ts`
- Related policies: runtime policy
- Repair notes: New scan finding.
- M5 planning outcome: Keep concrete animation/UX integration app-owned; only reusable theme transition primitives may move to `packages/vue-app-platform`.
- Residual risk: Animation and visual regressions.
- Last updated: 2026-05-31

### B-12 - ProTable URL sync facade depends on app router

- Status: OPEN
- Priority: P1
- Category: B app-local shared capability residue
- Owner layer: `@ccd/vue-ui` plus app router adapter
- Current paths: `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`, `apps/web-demo/src/plugins/modules/protable.ts`
- Target paths: app router adapter injected into `@ccd/vue-ui`
- Problem: ProTable URL sync is public-looking app hook code and directly depends on app router state.
- Risk: Router coupling may leak into `packages/vue-ui` or become hidden app platform API.
- Architecture decision: `packages/vue-ui` owns the ProTable adapter key and types; app owns concrete router integration.
- Required action: Keep `useProTableUrlSync.ts` as a thin app-local compatibility facade unless a future owner approves a package-level router abstraction.
- Forbidden action: Do not move `useRoute()` / `useRouter()` coupling into `packages/vue-ui` or `packages/core`.
- Validation commands: web-demo type-check, focused ProTable URL sync tests if source changes
- Evidence to capture: URL sync imports, app plugin provider, and ProTable adapter key usage.
- Related files: `packages/vue-ui/src/ProTable/engine/hooks/useProTableUrlSync.ts`, `apps/web-demo/src/plugins/modules/protable.ts`
- Related policies: topology policy, app-local classification model
- Repair notes: New M4 classification finding.
- M5 planning outcome: Confirmed as app-local router adapter facade over the `@ccd/vue-ui` adapter key; no `useRoute()`/`useRouter()` in packages.
- M11 verification: `useProTableUrlSync.ts` remains app-owned because it calls `useRoute()` / `useRouter()` and owns query read/write semantics; focused app facade tests cover default keys, custom keys, push/replace mode, disabled mode, and watcher cleanup.
- Residual risk: Facade may grow router-specific behavior beyond adapter glue.
- Last updated: 2026-05-31

### C-01 - Runtime scan coverage gap

- Status: DONE
- Priority: P0
- Category: C runtime and adapter boundary gaps
- Owner layer: governance
- Current paths: `.ai/governance/policies/runtime.json`
- Target paths: runtime policy by package class
- Problem: Runtime surface scan now covers apps and governed packages with explicit runtime class semantics.
- Risk: New runtime access fails unless it is in an adapter path allowance or exact file/surface exception.
- Architecture decision: Runtime classes are encoded in `.ai/governance/policies/runtime.json`.
- Required action: Keep runtime class policy and exact exception registry current.
- Forbidden action: Do not broad-block web-library runtime and do not add broad allowlist globs.
- Validation commands: `pnpm arch:runtime`
- Evidence to capture: runtime policy and package surface map.
- Related files: `scripts/architecture/check-runtime-leaks.mjs`
- Related policies: runtime policy
- Repair notes: M3 added runtime surface roots, package/app runtime classes, adapter path allowances, and exact exceptions. Inventory currently has 387 rows, 301 production file/surface pairs, 297 exact exception pairs, and 0 unclassified findings.
- Residual risk: Existing classified debt remains in app-local and web-library sources until M4/M5 source lanes.
- Last updated: 2026-05-31

### C-02 - Web adapter boundary missing

- Status: DONE
- Priority: P0
- Category: C runtime and adapter boundary gaps
- Owner layer: governance/apps
- Current paths: `.ai/governance/policies/runtime.json`, `apps/web-demo/src/**`
- Target paths: web adapter policy plus approved exceptions
- Problem: Browser API restrictions are encoded through adapter path allowances and exact app-local exceptions.
- Risk: Existing debt persists but is classified and no longer silent.
- Architecture decision: Runtime APIs belong in adapters first; app-local exceptions require exact file/surface policy entries.
- Required action: Move or reclassify existing app-local runtime debt in M4/M5.
- Forbidden action: Do not add new non-adapter runtime access without exact classification.
- Validation commands: `pnpm arch:runtime`, `pnpm arch:boundaries`
- Evidence to capture: runtime surface file map.
- Related files: `apps/web-demo/src/adapters/logger.adapter.ts`, `apps/web-demo/src/adapters/http.adapter.ts`
- Related policies: runtime policy
- Repair notes: M3 registered 297 exact file/surface exceptions and keeps web adapters as the app-owned runtime boundary.
- Residual risk: App-local hooks, stores, utils, and views still need source cleanup in later lanes.
- Last updated: 2026-05-31

### C-03 - Topology boundary validator incomplete

- Status: DONE
- Priority: P0
- Category: C runtime and adapter boundary gaps
- Owner layer: governance tooling
- Current paths: `scripts/architecture/validate-boundaries.mjs`
- Target paths: topology-aware validator
- Problem: The validator now compares package manifests with topology allowed workspace deps.
- Risk: Future dependency drift fails `pnpm arch:boundaries` instead of passing silently.
- Architecture decision: Topology policy must be machine-enforced.
- Required action: Complete in M1; keep enforcement active.
- Forbidden action: Do not fix by editing generated report manually.
- Validation commands: `pnpm arch:boundaries`, `pnpm validate:governance`
- Evidence to capture: M1 before/after topology comparison output.
- Related files: `.ai/governance/policies/topology.json`
- Related policies: topology policy
- Repair notes: M1 added manifest workspace dependency comparison in `scripts/architecture/validate-boundaries.mjs`.
- Residual risk: None for manifest/topology edge drift; browser runtime boundary enforcement moved to M3 runtime policy/checker.
- Last updated: 2026-05-31

### C-04 - dependency-cruiser rules incomplete

- Status: PARTIALLY_OBSOLETE
- Priority: P1
- Category: C runtime and adapter boundary gaps
- Owner layer: architecture tooling
- Current paths: `.dependency-cruiser.cjs`
- Target paths: depcruise plus architecture scripts
- Problem: Dependency-cruiser still focuses on import/dependency boundaries; runtime surface enforcement now lives in `check-runtime-leaks.mjs`.
- Risk: Agents may expect all runtime findings under `pnpm arch:boundaries` instead of `pnpm arch:runtime`.
- Architecture decision: Keep dependency-cruiser for graph/import rules and use runtime checker for AST runtime surfaces to avoid false-positive floods.
- Required action: Add dependency-cruiser rules only for import-level runtime leaks that can be expressed safely.
- Forbidden action: Do not block approved app infrastructure accidentally.
- Validation commands: `pnpm arch:boundaries`
- Evidence to capture: dependency-cruiser output and runtime checker output.
- Related files: `scripts/ai-architecture-guard.mjs`
- Related policies: topology and runtime policies
- Repair notes: M3 did not add browser runtime depcruise rules; exact runtime surface classification is enforced by `pnpm arch:runtime`.
- Residual risk: Import graph and runtime AST validation remain split across two commands.
- Last updated: 2026-05-31

### C-05 - Runtime docs say adapters only while code has exceptions

- Status: DONE
- Priority: P0
- Category: C runtime and adapter boundary gaps
- Owner layer: docs/governance/apps
- Current paths: `docs/runtime/runtime-isolation.md`, `apps/web-demo/src/utils/**`, `apps/web-demo/src/stores/**`
- Target paths: runtime exception policy and migration lanes
- Problem: Docs now distinguish adapter ownership from exact classified app-local runtime debt.
- Risk: Source debt remains, but reviewers can distinguish it from new violations.
- Architecture decision: Temporary exceptions must be documented, owned, and expirable.
- Required action: Keep exception index synchronized when source lanes move runtime access.
- Forbidden action: Do not pretend current runtime access is already fully adapter-contained.
- Validation commands: `pnpm docs:commands`, `pnpm arch:runtime`
- Evidence to capture: runtime surface index.
- Related files: `.ai/governance/policies/runtime.json`
- Related policies: runtime policy
- Repair notes: M3 updated runtime docs and evidence reports with exact exception registry and migration lanes.
- Residual risk: Runtime debt persists until source lanes run.
- Last updated: 2026-05-31

### C-06 - PrimeVue boundary remains allowlist-heavy

- Status: OPEN
- Priority: P1
- Category: C runtime and adapter boundary gaps
- Owner layer: vue-ui/vue-primevue-adapter/apps
- Current paths: `docs/en/architecture-contract.md`, `scripts/ai-architecture-guard.mjs`
- Target paths: `packages/vue-ui`, `packages/vue-primevue-adapter`
- Problem: Exact allowlists, generated typing, app shell/plugin exceptions, and the path-scoped showcase exception are still required.
- Risk: New app direct PrimeVue imports need policy review and may bypass CCD-owned wrappers if allowlists grow.
- Architecture decision: D-003 and D-011 allow exact app exceptions and the `primevue-collection/**` showcase exception; migration remains future work.
- Required action: Keep exceptions explicit and shrink exact app allowlist over time.
- Forbidden action: Do not raw re-export PrimeVue from `packages/vue-ui`.
- Validation commands: `pnpm ai:guard`, `pnpm api:report`
- Evidence to capture: PrimeVue direct import inventory.
- Related files: `docs/ai-plan/DECISIONS.md`, `docs/ai-runs/20260531-104447-ccd-m4-primevue-app-local-classification/reports/primevue-boundary-inventory.md`
- Related policies: D-003, D-011
- Repair notes: M4 inventory found 163 source PrimeVue/@PrimeVue/@PrimeUIX import rows and 0 unallowed rows under current policy. C-06 stays open because direct app imports still rely on exceptions rather than complete wrapper migration.
- M5 planning outcome: No allowlist row can be removed safely without source migration; future reductions are grouped by plugin/global shell, generated registry, showcase exception, ProForm/ProTable/Dialog wrappers, and exact legacy/demo entries.
- M6 decision packet: `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/reports/c06-primevue-allowlist-decision.md` recommends retaining exact allowlists/showcase exceptions until M12 migrates one feature area at a time. No reduction policy is approved in M6.
- Residual risk: New direct imports may require owner allowlist updates.
- Last updated: 2026-05-31

### D-01 - Governance report contracts dependency drift

- Status: DONE
- Priority: P0
- Category: D governance, documentation, and API surface drift
- Owner layer: generated docs/policy
- Current paths: `docs/generated/governance-report.md`, `packages/contracts/package.json`
- Target paths: topology policy/generator
- Problem: Generated report now says `@ccd/contracts` has no declared workspace dependencies.
- Risk: Resolved for contracts topology edge.
- Architecture decision: Manifests and topology must align; generated files are regenerated, not edited.
- Required action: Complete in M1 by fixing topology and regenerating report.
- Forbidden action: Do not edit `docs/generated/governance-report.md` manually.
- Validation commands: `pnpm arch:report`, `pnpm validate:governance`
- Evidence to capture: package diff and generated report after generator.
- Related files: `.ai/governance/policies/topology.json`
- Related policies: generated files policy
- Repair notes: Mirrors E-06; generated report was regenerated by command, not manually edited.
- Residual risk: Generated graph semantics remain D-09.
- Last updated: 2026-05-31

### D-02 - Governance report vue-hooks dependency drift

- Status: DONE
- Priority: P0
- Category: D governance, documentation, and API surface drift
- Owner layer: generated docs/policy
- Current paths: `docs/generated/governance-report.md`, `packages/vue-hooks/package.json`
- Target paths: topology policy/generator
- Problem: Report now includes `@ccd/vue-hooks -> @ccd/shared-utils`.
- Risk: Resolved for vue-hooks topology edge.
- Architecture decision: Topology policy must reflect real allowed workspace deps.
- Required action: Complete in M1 by aligning policy and regenerating report.
- Forbidden action: Do not remove manifest deps without source review.
- Validation commands: `pnpm arch:report`, `pnpm validate:governance`
- Evidence to capture: package diff output.
- Related files: `.ai/governance/policies/topology.json`
- Related policies: topology policy
- Repair notes: Mirrors E-02.
- Residual risk: None for this edge.
- Last updated: 2026-05-31

### D-03 - Governance report vue-ui dependency drift

- Status: DONE
- Priority: P0
- Category: D governance, documentation, and API surface drift
- Owner layer: generated docs/policy
- Current paths: `docs/generated/governance-report.md`, `packages/vue-ui/package.json`
- Target paths: topology policy/generator
- Problem: Report now includes vue-ui platform package dependencies.
- Risk: Resolved for vue-ui topology graph.
- Architecture decision: `@ccd/vue-ui` may depend on approved platform packages, but policy must say so.
- Required action: Complete in M1 by aligning topology and generated report.
- Forbidden action: Do not edit generated report manually.
- Validation commands: `pnpm arch:report`, `pnpm validate:governance`
- Evidence to capture: manifest/policy diff.
- Related files: `.ai/governance/policies/topology.json`
- Related policies: topology policy
- Repair notes: Mirrors E-04.
- Residual risk: None for this edge; future additions are covered by C-03 enforcement.
- Last updated: 2026-05-31

### D-04 - API surface missing vue-app-platform

- Status: DONE
- Priority: P0
- Category: D governance, documentation, and API surface drift
- Owner layer: governance API
- Current paths: `.ai/governance/policies/api.json`, `docs/generated/api-surface-report.md`, `packages/vue-app-platform/package.json`
- Target paths: API policy and generated report
- Problem: `@ccd/vue-app-platform` is public in topology and is now included in API policy/report.
- Risk: Resolved for this package; public API changes are now snapshotted.
- Architecture decision: Every public platform package must be in API surface governance.
- Required action: Keep API discovery topology-driven and regenerate with `pnpm api:report`.
- Forbidden action: Do not hand-edit generated API report or snapshots.
- Validation commands: `pnpm api:report`
- Evidence to capture: API report includes `@ccd/vue-app-platform`.
- Related files: `scripts/architecture/check-api-surface.mjs`
- Related policies: API policy
- Repair notes: M2 added `@ccd/vue-app-platform` to API policy, changed API discovery to topology/publicApi plus package exports, and regenerated API report/snapshot through `pnpm api:report`.
- Residual risk: Future topology public packages without API policy entries now fail `pnpm api:report` instead of being silently omitted.
- Last updated: 2026-05-31

### D-05 - README package matrix incomplete

- Status: DONE
- Priority: P1
- Category: D governance, documentation, and API surface drift
- Owner layer: docs
- Current paths: `README.md`
- Target paths: docs
- Problem: README package graph/responsibility matrix is now aligned for the current workspace package set.
- Risk: Resolved for top-level README package ownership hints.
- Architecture decision: README must mirror architecture contract.
- Required action: Keep README aligned with architecture contract during future topology changes.
- Forbidden action: Do not use README as policy source over `.ai/governance/**`.
- Validation commands: `pnpm docs:commands`
- Evidence to capture: README diff and docs command output.
- Related files: `docs/en/architecture-contract.md`
- Related policies: topology policy
- Repair notes: M15 added missing `packages/design-tokens`, `packages/unocss-preset`, and `packages/vue-app-platform` matrix rows and synchronized current `NO_GO` status.
- Residual risk: README can drift again because it is not generated.
- Last updated: 2026-05-31

### D-06 - Web runtime docs candidate list needs review

- Status: NEEDS_REVIEW
- Priority: P1
- Category: D governance, documentation, and API surface drift
- Owner layer: docs/apps
- Current paths: `docs/runtime/web-runtime.md`, `apps/web-demo/package.json`
- Target paths: docs
- Problem: Workspace dependency list now matches current manifest, but app-local candidate list still needs post-extraction review.
- Risk: Docs preserve old app-local ownership.
- Architecture decision: Candidates must be temporary compatibility facades, app-only infrastructure, or migration candidates.
- Required action: Reclassify after M1/M4 evidence.
- Forbidden action: Do not delete candidate notes without replacement index.
- Validation commands: `pnpm docs:commands`
- Evidence to capture: package manifest diff and candidate inventory.
- Related files: `README.md`, `docs/en/architecture-contract.md`
- Related policies: ownership boundaries
- Repair notes: M1 fixed missing `@ccd/vue-app-platform` dependency wording; candidate list remains NEEDS_REVIEW.
- M5 planning outcome: Web runtime docs now reference the extraction readiness split, but final stale-doc reconciliation remains an M14 task after source lanes or owner decisions.
- Residual risk: Candidate list can mislead future lanes.
- Last updated: 2026-05-31

### D-07 - Desktop runtime docs stale

- Status: DONE
- Priority: P1
- Category: D governance, documentation, and API surface drift
- Owner layer: docs/apps
- Current paths: `docs/runtime/desktop-runtime.md`, `apps/desktop/package.json`
- Target paths: docs or topology policy
- Problem: Desktop docs now list current governed workspace package dependencies.
- Risk: Resolved for desktop runtime dependency wording.
- Architecture decision: Desktop may use approved platform packages only if topology policy records them.
- Required action: Complete in M1 by updating topology policy and desktop runtime docs.
- Forbidden action: Do not mutate desktop dependencies in documentation lane.
- Validation commands: `pnpm docs:commands`, `pnpm arch:boundaries`
- Evidence to capture: package diff and desktop build.
- Related files: `.ai/governance/policies/topology.json`
- Related policies: topology policy
- Repair notes: Mirrors E-05.
- Residual risk: Runtime behavior remains unchanged; broader desktop runtime assumptions remain outside M1.
- Last updated: 2026-05-31

### D-08 - Ownership docs reference removed app components

- Status: DONE
- Priority: P1
- Category: D governance, documentation, and API surface drift
- Owner layer: docs/vue-ui
- Current paths: `README.md`, `docs/architecture/ownership-boundaries.md`, `docs/zh/02-architecture.md`, `docs/ai-plan/PLAN.md`, `docs/zh/04-project-control-center.md`, `docs/zh/08-release.md`
- Target paths: docs
- Problem: Some docs still list `apps/web-demo/src/components/PrimeDialog|ProForm|ProTable` as app-local candidates or do-not-move paths.
- Risk: Codex may inspect nonexistent paths or move components backwards.
- Architecture decision: Active owner is `packages/vue-ui`.
- Required action: Completed in M16 for `docs/ai-plan/PLAN.md`, `docs/zh/04-project-control-center.md`, and `docs/zh/08-release.md`; historical `docs/ai-runs/**` evidence remains intentionally preserved.
- Forbidden action: Do not recreate app component barrels.
- Validation commands: `pnpm docs:commands`
- Evidence to capture: stale path grep and `packages/vue-ui/src/**` inventory.
- Related files: `packages/vue-ui/src/PrimeDialog/**`, `packages/vue-ui/src/ProForm/**`, `packages/vue-ui/src/ProTable/**`
- Related policies: ownership boundaries
- Repair notes: M15 fixed top-level README references. M16 fixed `docs/ai-plan/PLAN.md`, `docs/zh/04-project-control-center.md`, and `docs/zh/08-release.md` to classify ProForm/ProTable/PrimeDialog as `@ccd/vue-ui` owned and list app plugin/facade integration paths instead.
- Residual risk: Historical docs under `docs/ai-runs/**` remain historical and should not be rewritten.
- Last updated: 2026-05-31

### D-09 - Workspace graph is not actual manifest dependency graph

- Status: PARTIALLY_OBSOLETE
- Priority: P1
- Category: D governance, documentation, and API surface drift
- Owner layer: generated docs
- Current paths: `docs/generated/graphs/workspace-graph.mmd`, `docs/generated/graphs/package-dependency-graph.mmd`
- Target paths: graph generator
- Problem: Generated graph still reflects topology policy, but topology policy is now enforced against manifest workspace deps.
- Risk: Drift hiding risk is reduced; graph edge-class labels remain implicit.
- Architecture decision: Governance graph may use topology only while `arch:boundaries` enforces policy/manifest equality.
- Required action: Optional future generator improvement can label policy, manifest, and release edges explicitly.
- Forbidden action: Do not manually edit graph outputs.
- Validation commands: `pnpm arch:graphs`
- Evidence to capture: graph before/after and manifest diff.
- Related files: `scripts/architecture/generate-dependency-graphs.mjs`
- Related policies: generated files policy
- Repair notes: M1 gate regenerated graph outputs after topology policy alignment.
- Residual risk: Graph semantics still need owner agreement if separate policy/manifest/release edge classes are required.
- Last updated: 2026-05-31

### D-10 - HTTP boundary status needs reconciliation

- Status: PARTIALLY_OBSOLETE
- Priority: P1
- Category: D governance, documentation, and API surface drift
- Owner layer: contracts/core/apps
- Current paths: `docs/ai-plan/DECISIONS.md`, `packages/contracts/src/http/**`, `apps/web-demo/src/utils/http/**`
- Target paths: contracts for types, app infra for runtime
- Problem: Older issue wording treats HTTP contracts as future/blocked, but type-only contracts currently exist.
- Risk: Agents duplicate contracts or move runtime HTTP into `packages/core`.
- Architecture decision: D-014 approves type-only contracts; `packages/core/src/http/**` remains blocked.
- Required action: Reconcile docs/status without changing runtime behavior.
- Forbidden action: Do not change auth/HTTP runtime behavior in doc lane.
- Validation commands: `pnpm arch:runtime`, focused HTTP tests if source changes later
- Evidence to capture: contracts/http inventory and D-014 citation.
- Related files: `packages/core/src/index.ts`, `docs/runtime/web-runtime.md`
- Related policies: D-014
- Repair notes: Not a duplicate; original risk still matters.
- Residual risk: Contracts may be used before app integration policy is set.
- Last updated: 2026-05-31

### D-11 - AI scaffolds and guards reference removed app component paths

- Status: PARTIALLY_OBSOLETE
- Priority: P1
- Category: D governance, documentation, and API surface drift
- Owner layer: AI tooling/docs
- Current paths: `scripts/ai-route-view-scaffold.mjs`, `scripts/ai-architecture-guard.mjs`, `docs/ai-plan/PLAN.md`
- Target paths: current package public APIs
- Problem: Some AI planning/tooling surfaces still reference app component paths removed by platform extraction.
- Risk: New generated code or planning instructions can target nonexistent app APIs.
- Architecture decision: ProForm, ProTable, and PrimeDialog active owner is `packages/vue-ui`.
- Required action: Update remaining planning docs and guard reduction scope after owner approval.
- Forbidden action: Do not recreate app component compatibility barrels without explicit classification.
- Validation commands: `pnpm codex:preflight`, `pnpm ai:guard`
- Evidence to capture: stale path grep.
- Related files: `packages/vue-ui/src/index.ts`
- Related policies: AI governance rules
- Repair notes: M15 updated route scaffold type imports to generate from `@ccd/vue-ui`. M16 updated `docs/ai-plan/PLAN.md` to reference `packages/vue-ui` and app plugin/facade paths. `scripts/ai-architecture-guard.mjs` still contains removed app component allowlist rows pending owner-approved M12 reduction.
- Residual risk: Guard allowlist rows can still mention removed app component paths until an approved M12 lane updates them.
- Last updated: 2026-05-31

### E-01 - Topology dependency policy not enforced

- Status: DONE
- Priority: P0
- Category: E package topology and dependency policy mismatch
- Owner layer: governance
- Current paths: `.ai/governance/policies/topology.json`, `scripts/architecture/validate-boundaries.mjs`
- Target paths: topology-aware validator
- Problem: Allowed workspace dependencies are now checked against manifests.
- Risk: Resolved for workspace dependency edge drift.
- Architecture decision: Topology policy must be machine-enforced.
- Required action: Complete in M1 through `scripts/architecture/validate-boundaries.mjs`.
- Forbidden action: Do not silence drift by editing generated files only.
- Validation commands: `pnpm arch:boundaries`, `pnpm validate:governance`
- Evidence to capture: package diff before/after.
- Related files: `packages/*/package.json`, `apps/*/package.json`
- Related policies: topology policy
- Repair notes: M1 prerequisite closed after policy alignment.
- Residual risk: None for manifest/topology drift.
- Last updated: 2026-05-31

### E-02 - vue-hooks allowed deps mismatch

- Status: DONE
- Priority: P0
- Category: E package topology and dependency policy mismatch
- Owner layer: `@ccd/vue-hooks`
- Current paths: `packages/vue-hooks/package.json`, `.ai/governance/policies/topology.json`
- Target paths: topology policy
- Problem: Policy now allows actual workspace dependency `@ccd/shared-utils`.
- Risk: Resolved for vue-hooks package graph.
- Architecture decision: Allow legitimate package dependencies explicitly.
- Required action: Complete in M1.
- Forbidden action: Do not remove dependency just to satisfy stale policy.
- Validation commands: `pnpm arch:boundaries`, `pnpm validate:governance`
- Evidence to capture: package diff scan.
- Related files: `docs/generated/governance-report.md`
- Related policies: topology policy
- Repair notes: M1.
- Residual risk: None once enforced and regenerated.
- Last updated: 2026-05-31

### E-03 - vue-app-platform allowed deps mismatch

- Status: DONE
- Priority: P0
- Category: E package topology and dependency policy mismatch
- Owner layer: `@ccd/vue-app-platform`
- Current paths: `packages/vue-app-platform/package.json`, `.ai/governance/policies/topology.json`
- Target paths: topology policy
- Problem: Policy now allows actual workspace dependency `@ccd/design-tokens`.
- Risk: Resolved for topology graph.
- Architecture decision: vue-app-platform may use design tokens if policy records it.
- Required action: Complete in M1 for topology; API policy/report remains D-04.
- Forbidden action: Do not remove valid dependency without source review.
- Validation commands: `pnpm arch:boundaries`, `pnpm validate:governance`
- Evidence to capture: package diff scan.
- Related files: `docs/generated/governance-report.md`
- Related policies: topology policy
- Repair notes: M1.
- Residual risk: API policy/report still omit this package under D-04/M2.
- Last updated: 2026-05-31

### E-04 - vue-ui allowed deps mismatch

- Status: DONE
- Priority: P0
- Category: E package topology and dependency policy mismatch
- Owner layer: `@ccd/vue-ui`
- Current paths: `packages/vue-ui/package.json`, `.ai/governance/policies/topology.json`
- Target paths: topology policy
- Problem: Policy now allows design-tokens, shared-utils, and vue-hooks.
- Risk: Resolved for UI package topology graph.
- Architecture decision: Shared UI may depend on approved platform packages.
- Required action: Complete in M1.
- Forbidden action: Do not move UI dependencies into core.
- Validation commands: `pnpm arch:boundaries`, `pnpm validate:governance`
- Evidence to capture: package diff scan.
- Related files: `docs/generated/governance-report.md`
- Related policies: topology policy
- Repair notes: M1.
- Residual risk: None for this topology edge.
- Last updated: 2026-05-31

### E-05 - desktop allowed deps mismatch

- Status: DONE
- Priority: P0
- Category: E package topology and dependency policy mismatch
- Owner layer: `@ccd/desktop`
- Current paths: `apps/desktop/package.json`, `.ai/governance/policies/topology.json`
- Target paths: topology policy or manifest
- Problem: Policy now allows desktop's current workspace package dependencies.
- Risk: Resolved for desktop manifest/topology agreement.
- Architecture decision: Desktop may use only approved platform packages, and policy/docs must agree.
- Required action: Complete in M1 by approving the actual app-level platform deps in topology.
- Forbidden action: Do not edit dependencies in doc lane.
- Validation commands: `pnpm arch:boundaries`, `pnpm validate:governance`, `pnpm docs:commands`
- Evidence to capture: package diff scan.
- Related files: `docs/runtime/desktop-runtime.md`
- Related policies: topology policy
- Repair notes: M1 aligned policy and docs; no dependency manifest changes.
- Residual risk: Runtime behavior remains unchanged; deeper desktop runtime audit is outside M1.
- Last updated: 2026-05-31

### E-06 - contracts allowed deps questionable

- Status: DONE
- Priority: P1
- Category: E package topology and dependency policy mismatch
- Owner layer: `@ccd/contracts`
- Current paths: `.ai/governance/policies/topology.json`, `packages/contracts/package.json`
- Target paths: topology policy
- Problem: Policy now allows no workspace dependencies for contracts.
- Risk: Future token implementation imports into ABI layer are no longer pre-approved by topology.
- Architecture decision: Contracts default to no workspace deps unless type-only need is proven.
- Required action: Complete in M1 by removing stale allowed dep.
- Forbidden action: Do not add design-token runtime to contracts.
- Validation commands: `pnpm arch:boundaries`, `pnpm validate:governance`
- Evidence to capture: policy diff and contracts package manifest.
- Related files: `docs/generated/governance-report.md`
- Related policies: topology policy
- Repair notes: M1.
- Residual risk: Future type-only exceptions must be explicitly reviewed.
- Last updated: 2026-05-31

### E-07 - vue-charts allowed deps mismatch

- Status: DONE
- Priority: P0
- Category: E package topology and dependency policy mismatch
- Owner layer: `@ccd/vue-charts`
- Current paths: `packages/vue-charts/package.json`, `.ai/governance/policies/topology.json`, `docs/generated/governance-report.md`
- Target paths: topology policy/generator
- Problem: Policy/report now include actual workspace dependency `@ccd/design-tokens`.
- Risk: Resolved for chart package topology graph.
- Architecture decision: Chart package dependencies must be explicit in topology.
- Required action: Complete in M1.
- Forbidden action: Do not edit generated governance report manually.
- Validation commands: `pnpm arch:boundaries`, `pnpm validate:governance`, `pnpm api:report`
- Evidence to capture: package diff and regenerated report.
- Related files: `packages/vue-charts/src/**`
- Related policies: topology policy
- Repair notes: New scan finding closed in M1.
- Residual risk: None for this topology edge.
- Last updated: 2026-05-31

### F-01 - web-demo tsconfig includes package source

- Status: DONE
- Priority: P1
- Category: F TypeScript and build-output boundary issues
- Owner layer: TS build boundary
- Current paths: `apps/web-demo/tsconfig.json`
- Target paths: package references or public package outputs
- Problem: App previously included package source for vue-ui and vue-charts.
- Risk: Reintroduction would bypass package build output and public exports.
- Architecture decision: Apps consume packages through workspace package boundaries.
- Required action: Completed in M13 by removing raw package source include globs.
- Forbidden action: Do not add global `@ccd/*` paths to root tsconfig.
- Validation commands: `pnpm ci:prepare-internal`, `pnpm ci:smoke:packages`, web-demo type-check/build
- Evidence captured: `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/reports/tsconfig-boundary-analysis.md`
- Related files: `packages/vue-ui/package.json`, `packages/vue-charts/package.json`
- Related policies: architecture contract TypeScript rule
- Repair notes: Package declarations from `@ccd/vue-ui` and `@ccd/vue-charts` were sufficient; no project reference change was required.
- Residual risk: None known for app tsconfig source includes; guard prevents recurrence.
- Last updated: 2026-05-31

### F-02 - desktop tsconfig includes package source

- Status: DONE
- Priority: P1
- Category: F TypeScript and build-output boundary issues
- Owner layer: TS build boundary
- Current paths: `apps/desktop/tsconfig.json`
- Target paths: package references or public package outputs
- Problem: Desktop previously included `../../packages/vue-ui/src/**`.
- Risk: Reintroduction would bypass package build output.
- Architecture decision: Apps consume package outputs/references, not raw source globs.
- Required action: Completed in M13 by removing raw package source include globs.
- Forbidden action: Do not loosen package exports.
- Validation commands: `pnpm ci:prepare-internal`, `pnpm ci:smoke:packages`, desktop type-check/build
- Evidence captured: `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/reports/tsconfig-boundary-analysis.md`
- Related files: `packages/vue-ui/package.json`
- Related policies: architecture contract TypeScript rule
- Repair notes: Package declarations from `@ccd/vue-ui` were sufficient; existing desktop references remain unchanged.
- Residual risk: None known for app tsconfig source includes; guard prevents recurrence.
- Last updated: 2026-05-31

### F-03 - App TS source includes mask boundaries

- Status: DONE
- Priority: P1
- Category: F TypeScript and build-output boundary issues
- Owner layer: TS build boundary
- Current paths: `tsconfig.base.json`, `apps/web-demo/tsconfig.json`, `apps/desktop/tsconfig.json`
- Target paths: root no global `@ccd/*`; app configs consume public outputs
- Problem: Root avoids global paths, and M13 removed the app source include bypasses that weakened boundaries.
- Risk: New app tsconfig package source includes would make type-check and runtime package resolution disagree.
- Architecture decision: Preserve root package-boundary model.
- Required action: Completed in M13 by adding an app-tsconfig package source include guard to `scripts/architecture/validate-boundaries.mjs`.
- Forbidden action: Do not solve by adding root `@ccd/*` aliases.
- Validation commands: `pnpm arch:boundaries`, `pnpm type-check`
- Evidence captured: `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/reports/validation-closure.md`
- Related files: `.dependency-cruiser.cjs`, `scripts/architecture/validate-boundaries.mjs`
- Related policies: architecture contract TypeScript rule
- Repair notes: `tsconfig.base.json` remains free of global `@ccd/*` paths.
- Residual risk: None known for app tsconfig source includes.
- Last updated: 2026-05-31

### F-04 - Root scripts deep-import app theme source

- Status: DONE
- Priority: P1
- Category: F TypeScript and build-output boundary issues
- Owner layer: tooling/build boundary
- Current paths: `scripts/upgrade-all-themes.mjs`, `scripts/validate-token-contrast.ts`
- Target paths: `@ccd/design-tokens/theme-engine` public API
- Problem: Root scripts imported `apps/web-demo/src/utils/theme/**` directly.
- Risk: Repaired for target root theme tooling; regression guarded by `pnpm arch:boundaries`.
- Architecture decision: Root scripts should depend on package public APIs or explicitly tool-owned sources.
- Required action: Completed in M13a by replacing app-source imports with `@ccd/design-tokens/theme-engine` public exports.
- Forbidden action: Do not move app theme runtime into `packages/core`.
- Validation commands: `pnpm validate:tokens`, `pnpm arch:boundaries`, `pnpm api:report`, `pnpm ci:smoke:packages`
- Evidence captured: `docs/ai-runs/20260531-203406-ccd-m13a-root-theme-tooling-boundary-repair/reports/root-theme-tooling-boundary-analysis.md`
- Related files: `packages/design-tokens/src/theme-engine/index.ts`, `scripts/upgrade-all-themes.mjs`, `scripts/validate-token-contrast.ts`
- Related policies: topology and root orchestration rules
- Repair notes: M13a exported pure theme color helpers and contrast pair specs through `@ccd/design-tokens/theme-engine`, updated root scripts to consume that subpath, and added a `scripts/**` boundary check against app theme utility imports.
- Residual risk: None known for target root theme tooling imports.
- Last updated: 2026-05-31

### G-01 - Planning-only state can be misread

- Status: DONE
- Priority: P1
- Category: G completion status and blocker drift
- Owner layer: docs/ai-plan
- Current paths: `docs/ai-plan/STATUS.md`
- Target paths: status docs
- Problem: Current top-level status docs now state M14/M15 `NO_GO` instead of planning completion.
- Risk: Resolved for `STATUS.md` and `FINAL_GO_NO_GO.md`.
- Architecture decision: Planning-only lanes must say no source implementation occurred.
- Required action: Keep status surfaces synchronized with future lane results.
- Forbidden action: Do not mark architecture complete without validation evidence.
- Validation commands: docs check
- Evidence to capture: status diff and command output.
- Related files: `docs/ai-plan/FINAL_GO_NO_GO.md`
- Related policies: evidence policy
- Repair notes: M15 replaced stale P4/P1 conditional status with current `NO_GO` and unresolved blocker tables.
- Residual risk: Human readers may skip blocker table, so top-level `NO_GO` must remain prominent.
- Last updated: 2026-05-31

### G-02 - Open task count remains unresolved

- Status: OPEN
- Priority: P1
- Category: G completion status and blocker drift
- Owner layer: runtime ledger/status
- Current paths: `docs/ai-plan/STATUS.md`, `.ai/runtime/repair_list.md`
- Target paths: task ledger/status docs
- Problem: Current M14/M15/M16 evidence records 80 open tasks.
- Risk: Work appears complete while open tasks remain.
- Architecture decision: Open tasks need DONE, DEFERRED, or BLOCKED evidence.
- Required action: Resolve, defer, or explicitly disposition open tasks with evidence in future lanes.
- Forbidden action: Do not close tasks without evidence.
- Validation commands: `pnpm ai:doctor --open`
- Evidence to capture: command log and blocker classification.
- Related files: `docs/ai-plan/PLAN.md`, `docs/ai-runs/20260531-223500-ccd-m16-stale-doc-tooling-reference-cleanup/command-logs/005-pnpm-ai-doctor-open.log`
- Related policies: evidence policy
- Repair notes: M14, M15, and M16 all surface 80 open tasks; P7 (2026-06-01) classified all 80 tasks (9 owner-blocked guard, 1 future HTTP lane, 22 operator-blocked deps/vite/github, 43 operator-blocked login, 5 deferred strategic, 1 owner-blocked desktop CI); 0 tasks closed without evidence.
- Residual risk: Open count remains 80 until owner/operator accepts deferred debt or approves implementation lanes.
- Last updated: 2026-06-01

### G-03 - Blockers remain

- Status: BLOCKED
- Priority: P0
- Category: G completion status and blocker drift
- Owner layer: owner/operator/product/security decisions
- Current paths: `docs/ai-plan/STATUS.md`, `docs/ai-plan/FINAL_GO_NO_GO.md`
- Target paths: owner decision records
- Problem: Blockers remain for guard scope, Vite, dependencies, Login Diorama, and final GO.
- Risk: Architecture completion is overstated.
- Architecture decision: No final GO while blockers remain unresolved or unaccepted.
- Required action: Owner/operator decisions per blocker.
- Forbidden action: Do not implement blocked lanes without approval.
- Validation commands: final go/no-go review, `pnpm ai:doctor --open`
- Evidence to capture: blocker owner, decision, and command output.
- Related files: `docs/ai-plan/DECISIONS.md`, `.ai/runtime/owner_decisions.md`
- Related policies: ADR-006
- Repair notes: The blocking condition is decision ownership, not technical failure.
- Residual risk: Work remains blocked until decisions are recorded.
- Last updated: 2026-05-31

## 6. Problem Directory

| problem_type                     | issue_ids                                                                    | affected_modules                           | related_files                                                                                                                              | target_owner_package                               | recommended_repair_lane | blocking_decision                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| Common platform/core terminology | A-01, A-02                                                                   | docs, ADRs                                 | `README.md`, ADR-005, ADR-006                                                                                                              | architecture docs                                  | M14                     | Owner approval for ADR status                                                              |
| App-local shared candidates      | A-03, B-01, B-02, B-03, B-04, B-05, B-06, B-07, B-08, B-09, B-10, B-11, B-12 | web-demo hooks/utils/stores/layout/plugins | `apps/web-demo/src/hooks/**`, `apps/web-demo/src/utils/**`, `apps/web-demo/src/stores/**`, `apps/web-demo/src/plugins/modules/protable.ts` | owning platform packages                           | M4, M5, M6, M7-M11      | B-07 crypto owner decision plus owner approval for source lanes                            |
| Browser runtime outside adapters | B-03, B-04, B-09, B-10, B-11, C-02, C-05                                     | web-demo app runtime                       | `apps/web-demo/src/utils/theme/**`, `apps/web-demo/src/stores/modules/system/**`, classified app views/hooks/layouts                       | app adapters plus platform packages                | M5/source lanes         | M3 exact exceptions registered; M5 plans split but source cleanup remains                  |
| Tauri runtime boundary           | D-07, E-05                                                                   | desktop app                                | `apps/desktop/src/adapters/index.ts`, `apps/desktop/package.json`                                                                          | desktop adapters                                   | M1                      | Closed for manifest/topology/docs alignment; future runtime audit only if behavior changes |
| PrimeVue direct import debt      | C-06, D-11                                                                   | app shell/views, vue-ui, adapter           | `scripts/ai-architecture-guard.mjs`, D-003/D-011 allowlists, M4 inventory, M5 allowlist plan, M6 decision packet                           | `packages/vue-ui`, `packages/vue-primevue-adapter` | M3, M4, M5, M6, M12     | Owner approval for allowlist changes and source migration before removals                  |
| Generated governance/API drift   | D-04, D-09                                                                   | generated reports, policies                | `docs/generated/**`, `.ai/governance/policies/**`                                                                                          | governance                                         | M2                      | API policy and graph semantics remain; D-01..D-03 and E-01..E-07 closed in M1              |
| TS/package source boundary       | F-01, F-02, F-03, F-04                                                       | app tsconfig, root scripts                 | `apps/*/tsconfig.json`, `scripts/validate-token-contrast.ts`, `scripts/upgrade-all-themes.mjs`                                             | package public outputs/tooling                     | M13 plus M13a           | App tsconfig boundary is repaired; root theme tooling app imports are repaired and guarded |
| Completion/blocker drift         | G-01, G-02, G-03                                                             | planning docs, runtime ledger              | `docs/ai-plan/STATUS.md`, `.ai/runtime/repair_list.md`                                                                                     | docs/owner decisions                               | M14                     | Owner/operator/product blockers                                                            |

## 7. File Index

| file path                                                                   | role                         | owner layer        | related issue IDs                                                      | current classification                 | target classification                                            | allowed actions                                                                                                                | forbidden actions                                                                                 | validation required after change                                       |
| --------------------------------------------------------------------------- | ---------------------------- | ------------------ | ---------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `README.md`                                                                 | repo architecture overview   | docs               | A-01, A-03, D-05, D-08                                                 | architecture-source-of-truth-candidate | current architecture docs                                        | update wording in doc lane                                                                                                     | do not edit generated adapters                                                                    | `pnpm docs:commands`                                                   |
| `docs/en/architecture-contract.md`                                          | AI architecture contract     | docs               | A-01, A-03, B-12, C-06, D-06                                           | architecture-source-of-truth           | architecture-source-of-truth                                     | update classification wording after evidence                                                                                   | do not contradict topology policy                                                                 | `pnpm docs:commands`                                                   |
| `docs/zh/02-architecture.md`                                                | Chinese architecture doc     | docs               | A-03, B-12, C-06, D-08                                                 | architecture-source-of-truth           | current architecture docs                                        | update stale ownership and classification wording                                                                              | do not change generated files                                                                     | `pnpm docs:commands`                                                   |
| `docs/architecture/ownership-boundaries.md`                                 | ownership matrix             | docs               | A-01, A-03, B-12, C-06, D-08                                           | architecture-source-of-truth           | architecture-source-of-truth                                     | update stale app component entries and boundary classifications                                                                | do not add source changes                                                                         | `pnpm docs:commands`                                                   |
| `docs/adr/ADR-005-common-platform-layer-terminology.md`                     | ADR                          | decisions          | A-01, A-02                                                             | architecture-source-of-truth           | approved/proposed ADR                                            | owner-approved status update                                                                                                   | do not silently approve                                                                           | `pnpm docs:commands`                                                   |
| `docs/adr/ADR-006-approval-gated-architecture-lanes.md`                     | ADR                          | decisions          | A-02, G-03                                                             | architecture-source-of-truth           | approved/proposed ADR                                            | owner-approved status update                                                                                                   | do not bypass approval gates                                                                      | `pnpm docs:commands`                                                   |
| `docs/ai-plan/DECISIONS.md`                                                 | decision log                 | docs/decisions     | A-02, B-07, C-06, D-10, G-03                                           | architecture-source-of-truth           | decision source                                                  | update with evidence                                                                                                           | do not override ADRs without owner                                                                | `pnpm ai:doctor --open`                                                |
| `docs/ai-plan/STATUS.md`                                                    | status ledger                | docs/plan          | G-01, G-02, G-03, D-06                                                 | status-source                          | evidence-backed status                                           | update blocker/status facts                                                                                                    | do not mark DONE without commands                                                                 | `pnpm ai:doctor --open`                                                |
| `docs/ai-plan/FINAL_GO_NO_GO.md`                                            | final decision doc           | docs/plan          | G-01, G-03                                                             | status-source                          | final gate evidence                                              | update when final gate reruns                                                                                                  | do not declare GO with blockers                                                                   | final validation matrix                                                |
| `docs/ai-plan/PLAN.md`                                                      | execution plan               | docs/plan          | D-11, G-02                                                             | stale-doc-candidate                    | current plan                                                     | update stale app component paths                                                                                               | do not edit historical run logs                                                                   | `pnpm docs:commands`                                                   |
| `docs/runtime/runtime-isolation.md`                                         | runtime isolation doc        | docs/runtime       | A-03, C-05                                                             | architecture-source-of-truth           | runtime policy doc                                               | add exception/classification policy references                                                                                 | do not pretend code is fully migrated                                                             | `pnpm docs:commands`, `pnpm arch:runtime`                              |
| `docs/runtime/web-runtime.md`                                               | web runtime doc              | docs/runtime       | A-03, B-12, C-05, C-06, D-06                                           | stale-doc-candidate                    | current runtime doc                                              | update candidate/dependency facts                                                                                              | do not change app source                                                                          | `pnpm docs:commands`                                                   |
| `docs/runtime/desktop-runtime.md`                                           | desktop runtime doc          | docs/runtime       | D-07, E-05                                                             | stale-doc-candidate                    | current runtime doc                                              | update allowed deps or cite policy                                                                                             | do not mutate dependencies                                                                        | `pnpm docs:commands`                                                   |
| `.ai/governance/policies/topology.json`                                     | topology policy              | governance         | C-03, D-01, D-02, D-03, D-09, E-01, E-02, E-03, E-04, E-05, E-06, E-07 | policy-source                          | enforced topology policy                                         | update only in M1                                                                                                              | do not hand-edit generated reports instead                                                        | `pnpm validate:governance`                                             |
| `.ai/governance/policies/runtime.json`                                      | runtime policy               | governance         | C-01, C-02, C-05                                                       | policy-source                          | runtime boundary policy                                          | maintain runtime classes, adapter allowances, and exact exceptions                                                             | do not add broad false-positive guard or broad app globs                                          | `pnpm arch:runtime`                                                    |
| `.ai/governance/policies/api.json`                                          | API policy                   | governance         | D-04                                                                   | policy-source                          | API surface source                                               | keep topology public API packages present in policy                                                                            | do not hand-edit API report                                                                       | `pnpm api:report`                                                      |
| `scripts/architecture/validate-boundaries.mjs`                              | boundary validator           | governance script  | C-03, E-01, F-03                                                       | architecture-script                    | topology-enforcing script plus app-tsconfig source-include guard | maintain manifest/policy checks and app package-source include guard                                                           | do not weaken existing checks                                                                     | `pnpm arch:boundaries`                                                 |
| `scripts/ci/package-resolution-smoke.mjs`                                   | package output smoke         | governance script  | F-01, F-02, F-03                                                       | architecture-script                    | build-output readiness smoke                                     | verify app-consumed package exports and dist outputs after `pnpm ci:prepare-internal`                                          | do not replace package exports with source path checks                                            | `pnpm ci:smoke:packages`                                               |
| `scripts/architecture/check-runtime-leaks.mjs`                              | runtime leak checker         | governance script  | C-01, C-02, C-04, C-05                                                 | architecture-script                    | runtime policy checker                                           | enforce runtime classes and emit inventory/exception reports                                                                   | do not hide strict contracts/core leaks                                                           | `pnpm arch:runtime`                                                    |
| `scripts/architecture/check-api-surface.mjs`                                | API surface generator        | governance script  | D-04                                                                   | architecture-script                    | topology-driven API generator                                    | discover public platform packages from topology `publicApi` and package exports                                                | do not edit output manually                                                                       | `pnpm api:report`                                                      |
| `scripts/architecture/generate-dependency-graphs.mjs`                       | graph generator              | governance script  | D-09                                                                   | architecture-script                    | graph generator                                                  | distinguish edge classes                                                                                                       | do not edit generated graphs manually                                                             | `pnpm arch:graphs`                                                     |
| `scripts/ai-architecture-guard.mjs`                                         | AI guard                     | governance script  | C-04, C-06, D-11                                                       | architecture-script                    | current guard                                                    | update stale allowlists in approved lane                                                                                       | do not broad-block approved infra                                                                 | `pnpm ai:guard`                                                        |
| `.dependency-cruiser.cjs`                                                   | dependency rules             | governance config  | C-04, F-03                                                             | architecture-script                    | architecture-script                                              | add scoped boundary rules                                                                                                      | do not duplicate false-positive checks                                                            | `pnpm arch:boundaries`                                                 |
| `pnpm-workspace.yaml`                                                       | workspace config             | root orchestration | E-01                                                                   | policy-source                          | workspace source                                                 | inspect only unless topology lane                                                                                              | do not change package topology in M0                                                              | `pnpm project:doctor`                                                  |
| `package.json`                                                              | root scripts/deps            | root orchestration | E-01, validation matrix                                                | policy-source                          | root orchestration                                               | inspect scripts                                                                                                                | do not change deps/scripts in M0                                                                  | command-specific                                                       |
| `tsconfig.base.json`                                                        | TS base config               | root tooling       | F-03                                                                   | policy-source                          | package-boundary config                                          | keep no global `@ccd/*` paths                                                                                                  | do not add global aliases                                                                         | `pnpm type-check`                                                      |
| `docs/generated/governance-report.md`                                       | generated governance report  | generated          | D-01, D-02, D-03, E-07                                                 | generated-output-do-not-edit           | generated-output                                                 | regenerate with command                                                                                                        | do not manual edit                                                                                | `pnpm arch:report`                                                     |
| `docs/generated/api-surface-report.md`                                      | generated API report         | generated          | D-04                                                                   | generated-output-do-not-edit           | generated-output                                                 | regenerate with `pnpm api:report`                                                                                              | do not manual edit                                                                                | `pnpm api:report`                                                      |
| `docs/generated/api-surface-report.json`                                    | generated API report         | generated          | D-04                                                                   | generated-output-do-not-edit           | generated-output                                                 | regenerate with `pnpm api:report`                                                                                              | do not manual edit                                                                                | `pnpm api:report`                                                      |
| `docs/ai-runs/20260531-093147-ccd-m1-topology-truth-source-alignment/**`    | M1 evidence                  | docs/ai-runs       | C-03, D-01, D-02, D-03, D-07, E-01..E-07                               | run-evidence                           | run-evidence                                                     | add command logs and reports for this lane                                                                                     | do not rewrite historical run logs                                                                | command-specific                                                       |
| `docs/ai-runs/20260531-095818-ccd-m2-governance-api-surface-repair/**`      | M2 evidence                  | docs/ai-runs       | D-04                                                                   | run-evidence                           | run-evidence                                                     | record API discovery table, command logs, and summary                                                                          | do not rewrite historical run logs                                                                | command-specific                                                       |
| `docs/ai-runs/20260531-101606-ccd-m3-browser-runtime-boundary/**`           | M3 evidence                  | docs/ai-runs       | C-01, C-02, C-04, C-05, C-06                                           | run-evidence                           | run-evidence                                                     | record runtime inventory, exceptions, policy summary, and command logs                                                         | do not rewrite historical run logs                                                                | command-specific                                                       |
| `docs/ai-runs/20260531-104447-ccd-m4-primevue-app-local-classification/**`  | M4 evidence                  | docs/ai-runs       | A-03, B-01..B-12, C-06, D-06                                           | run-evidence                           | run-evidence                                                     | record PrimeVue boundary inventory, app-local shared candidate classifications, M5 recommendations, and command logs           | do not rewrite historical run logs                                                                | command-specific                                                       |
| `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/**`                   | M5 evidence                  | docs/ai-runs       | A-03, B-01..B-12, C-06, D-06                                           | run-evidence                           | run-evidence                                                     | record dependency map, target API plan, safeStorage/theme/size/device/store/hook/PrimeVue reduction planning, and command logs | do not rewrite historical run logs                                                                | command-specific                                                       |
| `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/**`              | M6 evidence                  | docs/ai-runs       | B-07, C-06, F-01..F-04, G-01..G-03                                     | run-evidence                           | run-evidence                                                     | record owner-decision packets, lane split, approval checklist, and command logs                                                | do not rewrite historical run logs or treat proposed decisions as approved                        | command-specific                                                       |
| `docs/ai-runs/20260531-144505-ccd-m7-safe-storage-codec-foundation/**`      | M7 evidence                  | docs/ai-runs       | B-05, B-06, B-07, B-08                                                 | run-evidence                           | run-evidence                                                     | record codec dependency map, compatibility notes, blocked crypto scope, summary, and command logs                              | do not rewrite historical run logs or treat blocked crypto as approved                            | command-specific                                                       |
| `docs/ai-runs/20260531-153347-ccd-m7a-web-demo-filtered-test-cwd-repair/**` | M7a evidence                 | docs/ai-runs       | M7 validation closure, D-10                                            | run-evidence                           | run-evidence                                                     | record cwd path diagnosis, validation closure, summary, and command logs                                                       | do not rewrite historical run logs or treat test repair as HTTP behavior migration                | command-specific                                                       |
| `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/**`     | M8 evidence                  | docs/ai-runs       | B-03, B-04, B-09, B-11, F-04                                           | run-evidence                           | run-evidence                                                     | record resolver eligibility, dependency map, parity notes, facade scope, summary, and command logs                             | do not rewrite historical run logs or treat pure resolver foundation as DOM/preload/store cleanup | command-specific                                                       |
| `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/**`    | M13 evidence                 | docs/ai-runs       | F-01, F-02, F-03, F-04                                                 | run-evidence                           | run-evidence                                                     | record tsconfig boundary analysis, package output readiness, validation closure, and command logs                              | do not rewrite historical run logs or treat F-04 as repaired                                      | command-specific                                                       |
| `docs/generated/graphs/workspace-graph.mmd`                                 | generated graph              | generated          | D-09                                                                   | generated-output-do-not-edit           | generated-output                                                 | regenerate with `pnpm arch:graphs`                                                                                             | do not manual edit                                                                                | `pnpm arch:graphs`                                                     |
| `docs/generated/graphs/package-dependency-graph.mmd`                        | generated graph              | generated          | D-09                                                                   | generated-output-do-not-edit           | generated-output                                                 | regenerate with `pnpm arch:graphs`                                                                                             | do not manual edit                                                                                | `pnpm arch:graphs`                                                     |
| `docs/generated/graphs/dependency-graph.json`                               | generated graph manifest     | generated          | D-09                                                                   | generated-output-do-not-edit           | generated-output                                                 | regenerate with `pnpm arch:graphs`                                                                                             | do not manual edit                                                                                | `pnpm arch:graphs`                                                     |
| `docs/generated/graphs/README.md`                                           | generated graph index        | generated          | D-09                                                                   | generated-output-do-not-edit           | generated-output                                                 | regenerate with `pnpm arch:graphs`                                                                                             | do not manual edit                                                                                | `pnpm arch:graphs`                                                     |
| `.ai/governance/api-snapshots/**`                                           | generated API snapshots      | generated          | D-04                                                                   | generated-output-do-not-edit           | generated-output                                                 | regenerate via API tool                                                                                                        | do not manual edit                                                                                | `pnpm api:report`                                                      |
| `packages/contracts/package.json`                                           | package manifest             | contracts          | D-01, E-06                                                             | platform-package-public-api            | package manifest                                                 | update only in topology/API lane                                                                                               | do not add runtime deps casually                                                                  | contracts build                                                        |
| `packages/contracts/src/index.ts`                                           | package public API           | contracts          | D-10                                                                   | platform-package-public-api            | platform-package-public-api                                      | type-only exports                                                                                                              | do not export runtime implementations                                                             | `pnpm --filter @ccd/contracts build`                                   |
| `packages/contracts/src/http/**`                                            | HTTP contracts               | contracts          | D-10                                                                   | platform-package-public-api            | type-only contracts                                              | type-only contract edits                                                                                                       | no runtime/browser/app imports                                                                    | contracts build, `pnpm arch:runtime`                                   |
| `packages/contracts/src/storage.ts`                                         | storage contracts            | contracts          | B-06                                                                   | platform-package-public-api            | type-only contracts                                              | add interfaces only if approved                                                                                                | no browser storage implementation                                                                 | contracts build                                                        |
| `packages/contracts/src/crypto.ts`                                          | crypto contracts             | contracts          | B-07                                                                   | platform-package-public-api            | type-only contracts                                              | add interface shape if approved                                                                                                | no Web Crypto implementation                                                                      | contracts build                                                        |
| `packages/core/package.json`                                                | package manifest             | core               | A-01                                                                   | runtime-neutral-package                | runtime-neutral-package                                          | preserve only `@ccd/contracts` dep                                                                                             | no Vue/browser deps                                                                               | `pnpm build:core`                                                      |
| `packages/core/src/index.ts`                                                | core runtime facade          | core               | A-01, D-10                                                             | runtime-neutral-package                | runtime-neutral-package                                          | injected adapter orchestration only                                                                                            | no frontend/runtime logic                                                                         | `pnpm arch:runtime`                                                    |
| `packages/design-tokens/package.json`                                       | package manifest             | design tokens      | B-03, B-04, F-04                                                       | platform-package-public-api            | token package manifest                                           | preserve `./theme-engine` package export subpath                                                                               | no app imports                                                                                    | package build, package smoke                                           |
| `packages/design-tokens/src/theme-engine/**`                                | theme engine                 | design tokens      | B-03, F-04                                                             | runtime-neutral-package                | token primitives                                                 | pure token/public barrel changes for root tooling                                                                              | no DOM/storage                                                                                    | package tests, token validation                                        |
| `packages/design-tokens/src/sizeResolver.ts`                                | pure size resolver           | design tokens      | B-04, B-09, F-04                                                       | runtime-neutral-package                | token primitives                                                 | pure size/theme-size resolver helpers; M8-established public root exports                                                      | no DOM/storage/app imports/browser globals                                                        | design-tokens resolver spec, package build                             |
| `packages/design-tokens/src/sizeResolver.spec.ts`                           | pure size resolver tests     | design tokens      | B-04, B-09                                                             | test-only                              | test evidence                                                    | focused formula and fallback parity tests                                                                                      | no runtime source behavior                                                                        | `pnpm exec vitest run packages/design-tokens/src/sizeResolver.spec.ts` |
| `packages/design-tokens/src/size.ts`                                        | size preset source           | design tokens      | B-04                                                                   | runtime-neutral-package                | token primitives                                                 | preserve preset constants and ESM-safe imports                                                                                 | no DOM/storage/app imports                                                                        | package build                                                          |
| `packages/design-tokens/src/breakpoints.ts`                                 | breakpoint tokens            | design tokens      | B-10                                                                   | runtime-neutral-package                | token primitives                                                 | pure constants                                                                                                                 | no browser detection                                                                              | package tests                                                          |
| `packages/shared-utils/package.json`                                        | package manifest             | shared-utils       | B-05, E-04                                                             | platform-package-public-api            | package manifest                                                 | update only with topology lane                                                                                                 | no app deps                                                                                       | package tests                                                          |
| `packages/shared-utils/src/storageCodec.ts`                                 | pure storage codec           | shared-utils       | B-06                                                                   | runtime-neutral-package                | pure utility                                                     | pure helper edits; M7-established JSON codec foundation                                                                        | no runtime globals                                                                                | shared-utils tests                                                     |
| `packages/shared-utils/src/createCapabilityBridge.ts`                       | capability bridge            | shared-utils       | B-01                                                                   | runtime-neutral-package                | pure utility                                                     | pure helper edits                                                                                                              | no app coupling                                                                                   | shared-utils tests                                                     |
| `packages/unocss-preset/package.json`                                       | package manifest             | unocss preset      | C-04                                                                   | node-build-package                     | node-build-package                                               | build-time styling edits                                                                                                       | no app runtime coupling                                                                           | package build                                                          |
| `packages/vue-hooks/package.json`                                           | package manifest             | vue-hooks          | E-02                                                                   | web-library-package                    | policy-aligned manifest                                          | update topology/manifest in M1                                                                                                 | no core dependency                                                                                | package tests                                                          |
| `packages/vue-hooks/src/createAutoMittHook.ts`                              | hook factory                 | vue-hooks          | B-01                                                                   | web-library-package                    | hook primitive                                                   | reusable hook edits                                                                                                            | no app event map inside package                                                                   | package tests                                                          |
| `packages/vue-app-platform/package.json`                                    | package manifest             | vue-app-platform   | D-04, E-03                                                             | platform-package-public-api            | API-governed package                                             | add API governance                                                                                                             | no app-specific router/store logic                                                                | package tests, API report                                              |
| `packages/vue-app-platform/src/themeRuntime.ts`                             | theme runtime primitive      | vue-app-platform   | B-03, B-11                                                             | web-library-package                    | platform runtime primitive                                       | injected DOM/storage target edits                                                                                              | no app stores                                                                                     | package tests                                                          |
| `packages/vue-app-platform/src/layoutRuntime.ts`                            | layout runtime primitive     | vue-app-platform   | B-10                                                                   | web-library-package                    | platform runtime primitive                                       | pure layout runtime edits                                                                                                      | no app store coupling                                                                             | package tests                                                          |
| `packages/vue-ui/package.json`                                              | package manifest             | vue-ui             | D-08, E-04, F-01, F-02                                                 | platform-package-public-api            | policy-aligned manifest with dist exports                        | package public API edits only if declaration gaps are proven                                                                   | no app imports or source export fallback                                                          | package build, API report, package smoke                               |
| `packages/vue-ui/src/index.ts`                                              | vue-ui public API            | vue-ui             | D-11                                                                   | platform-package-public-api            | API-governed public API                                          | export CCD-owned APIs                                                                                                          | no raw PrimeVue bucket                                                                            | API report                                                             |
| `packages/vue-ui/src/PrimeDialog/**`                                        | dialog primitive             | vue-ui             | B-02, D-08                                                             | platform-package-public-api            | UI primitive                                                     | UI primitive edits                                                                                                             | no app i18n hardcoding                                                                            | package tests                                                          |
| `packages/vue-ui/src/ProForm/**`                                            | ProForm primitive            | vue-ui             | D-08, D-11                                                             | platform-package-public-api            | UI primitive                                                     | UI primitive edits                                                                                                             | no app-local import aliases                                                                       | package tests                                                          |
| `packages/vue-ui/src/ProTable/**`                                           | ProTable primitive           | vue-ui             | B-12, D-08, D-11                                                       | platform-package-public-api            | UI primitive plus injected app adapters                          | UI primitive edits                                                                                                             | no app-local import aliases or router coupling in package                                         | package tests                                                          |
| `packages/vue-primevue-adapter/package.json`                                | package manifest             | PrimeVue adapter   | C-06, E-05                                                             | web-library-package                    | policy-aligned manifest                                          | update topology if approved                                                                                                    | no app feature code                                                                               | adapter tests                                                          |
| `packages/vue-primevue-adapter/src/services.ts`                             | PrimeVue services            | PrimeVue adapter   | C-06                                                                   | web-library-package                    | adapter primitive                                                | service adapter edits                                                                                                          | no app business logic                                                                             | adapter tests                                                          |
| `packages/vue-charts/package.json`                                          | package manifest             | vue-charts         | E-07, F-01                                                             | web-library-package                    | policy-aligned manifest with dist exports                        | update topology/API only if required                                                                                           | no app data/query logic or source export fallback                                                 | package build, package smoke                                           |
| `packages/vue-charts/src/**`                                                | chart runtime                | vue-charts         | E-07                                                                   | web-library-package                    | chart runtime                                                    | chart helper edits                                                                                                             | no app state coupling                                                                             | package build                                                          |
| `apps/web-demo/package.json`                                                | app manifest                 | web app            | D-06, E-01                                                             | app-shell                              | app manifest                                                     | update only in approved lane                                                                                                   | no dependency changes in M0                                                                       | web-demo build                                                         |
| `apps/web-demo/tsconfig.json`                                               | app TS config                | web app            | F-01, F-03                                                             | app-build-config                       | package-boundary config                                          | M13 removed package source includes; keep app-local includes only                                                              | do not add global aliases or `../../packages/*/src/**` includes                                   | web-demo type-check                                                    |
| `apps/web-demo/src/adapters/http.adapter.ts`                                | app HTTP adapter             | web app            | C-02, D-10                                                             | app-adapter                            | app-adapter                                                      | app validation adapter edits                                                                                                   | no package exports from app                                                                       | focused tests                                                          |
| `apps/web-demo/src/adapters/logger.adapter.ts`                              | app logger adapter           | web app            | C-02                                                                   | app-adapter                            | app-adapter                                                      | app logger edits                                                                                                               | no package exports from app                                                                       | web-demo type-check                                                    |
| `apps/web-demo/src/adapters/charts/UseEcharts.vue`                          | app chart adapter            | web app            | C-02                                                                   | app-adapter                            | app-adapter                                                      | chart app integration                                                                                                          | no generic package logic                                                                          | web-demo build                                                         |
| `apps/web-demo/src/hooks/modules/useAutoMitt.ts`                            | app hook facade              | web app            | B-01                                                                   | app-local-compat-facade                | app binding over vue-hooks                                       | keep thin binding                                                                                                              | do not grow generic hook logic                                                                    | web-demo type-check                                                    |
| `apps/web-demo/src/hooks/modules/useDialog.tsx`                             | app dialog facade            | web app            | B-02                                                                   | app-local-compat-facade                | app i18n adapter                                                 | keep app i18n binding                                                                                                          | no raw public UI barrel                                                                           | web-demo type-check                                                    |
| `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`                     | app ProTable URL sync facade | web app            | B-12                                                                   | app-local-compat-facade                | app router adapter injected into vue-ui                          | keep thin binding                                                                                                              | do not move `useRoute`/`useRouter` into `packages/vue-ui` or `packages/core`                      | web-demo type-check                                                    |
| `apps/web-demo/src/hooks/modules/useThemeSwitch.ts`                         | theme transition hook        | web app            | B-11, C-02                                                             | app-local-shared-candidate             | platform primitive plus app integration                          | classify and plan                                                                                                              | no implementation in M0                                                                           | e2e visual after changes                                               |
| `apps/web-demo/src/hooks/modules/useAuth.ts`                                | auth hook                    | web app            | D-10, G-03                                                             | app-runtime                            | app-specific auth runtime                                        | edit only in auth lane                                                                                                         | no auth behavior in M0                                                                            | HTTP/auth tests                                                        |
| `apps/web-demo/src/hooks/modules/useHttpRequest.ts`                         | HTTP hook                    | web app            | D-10                                                                   | app-runtime-infrastructure             | app HTTP infrastructure                                          | edit only in HTTP lane                                                                                                         | no contracts/core move in M0                                                                      | HTTP tests                                                             |
| `apps/web-demo/src/utils/http/**`                                           | app HTTP infra               | web app            | D-10, C-02                                                             | app-runtime-infrastructure             | app HTTP infrastructure                                          | edit runtime only in HTTP lane; test-only path normalization allowed in M7a                                                    | no runtime behavior change in M7a                                                                 | focused HTTP tests                                                     |
| `apps/web-demo/src/utils/theme/engine.ts`                                   | theme facade                 | web app            | B-03, F-04                                                             | app-local-compat-facade                | app adapter facade                                               | keep compatibility thin                                                                                                        | no DOM/storage in core                                                                            | e2e visual                                                             |
| `apps/web-demo/src/utils/theme/sizeEngine.ts`                               | size runtime                 | web app            | B-04, B-09, F-04                                                       | app-local-compat-facade                | platform primitive plus app adapter                              | keep compatibility imports; delegate pure resolvers to `@ccd/design-tokens`; keep DOM/preload runtime app-owned                | no store/preload/browser behavior movement in M8                                                  | focused size spec, web-demo tests, layout/visual                       |
| `apps/web-demo/src/utils/theme/sizeEngine.spec.ts`                          | size facade tests            | web app            | B-04, B-09                                                             | test-only                              | test evidence                                                    | verify app facade delegation parity                                                                                            | no runtime source behavior                                                                        | focused size spec, filtered web-demo test                              |
| `apps/web-demo/src/utils/theme/color.ts`                                    | theme color helper           | web app            | F-04                                                                   | app-local-shared-candidate             | design-tokens public API                                         | move only in source lane                                                                                                       | no script deep import long-term                                                                   | token validation                                                       |
| `apps/web-demo/src/utils/theme/validate.ts`                                 | theme validation helper      | web app            | F-04                                                                   | app-local-shared-candidate             | design-tokens public API                                         | move only in source lane                                                                                                       | no script deep import long-term                                                                   | token validation                                                       |
| `apps/web-demo/src/utils/theme/transitions.ts`                              | theme transitions            | web app            | B-11                                                                   | app-local-shared-candidate             | vue-app-platform primitive                                       | classify and plan                                                                                                              | no source change in M0                                                                            | e2e visual                                                             |
| `apps/web-demo/src/utils/theme/mode.ts`                                     | theme mode helper            | web app            | B-11                                                                   | app-local-shared-candidate             | platform/app adapter split                                       | classify and plan                                                                                                              | no source change in M0                                                                            | e2e visual                                                             |
| `apps/web-demo/src/utils/deviceSync.ts`                                     | device sync helper           | web app            | B-10                                                                   | app-local-shared-candidate             | pure resolver plus app adapter                                   | classify and plan                                                                                                              | no browser globals in packages/core                                                               | device/layout tests                                                    |
| `apps/web-demo/src/utils/safeStorage/index.ts`                              | app safeStorage barrel       | web app            | B-05                                                                   | app-local-compat-facade                | app adapter/private facade                                       | classify compatibility                                                                                                         | no public app export                                                                              | storage tests                                                          |
| `apps/web-demo/src/utils/safeStorage/core.ts`                               | safeStorage core             | web app            | B-06, F-04                                                             | app-local-shared-candidate             | shared-utils plus app adapter                                    | split in source lane; M7 confirmed existing JSON helper delegation to shared-utils                                             | no secrets/log output                                                                             | storage tests                                                          |
| `apps/web-demo/src/utils/safeStorage/crypto.ts`                             | crypto helper                | web app            | B-07                                                                   | app-adapter-candidate                  | app adapter or web-library                                       | classify first                                                                                                                 | no core move                                                                                      | storage/crypto tests                                                   |
| `apps/web-demo/src/utils/safeStorage/lzstring.ts`                           | compression helper           | web app            | B-08                                                                   | app-local-shared-candidate             | shared-utils or app-private                                      | migrate only after dependency/manifest approval and parity fixtures                                                            | no runtime coupling or undeclared package dependency                                              | storage tests                                                          |
| `apps/web-demo/src/utils/safeStorage/safeStorage.ts`                        | storage adapter facade       | web app            | B-05, B-06                                                             | app-runtime-infrastructure             | app adapter/private facade                                       | edit in storage lane                                                                                                           | no package export from app                                                                        | storage tests                                                          |
| `apps/web-demo/src/utils/safeStorage/piniaSerializer.ts`                    | Pinia serializer             | web app            | B-05                                                                   | app-runtime-infrastructure             | app serializer                                                   | edit in storage lane                                                                                                           | no shared public app barrel                                                                       | storage tests                                                          |
| `apps/web-demo/src/utils/safeStorage/storageMaintenance.ts`                 | storage maintenance          | web app            | B-05, B-06                                                             | app-runtime-infrastructure             | app adapter/private facade                                       | edit in storage lane                                                                                                           | no core move                                                                                      | storage tests                                                          |
| `apps/web-demo/src/stores/modules/system/size.ts`                           | size store                   | web app            | B-09                                                                   | app-store                              | app store                                                        | app state edits only in source lane                                                                                            | no platform logic expansion                                                                       | store tests, e2e layout                                                |
| `apps/web-demo/src/stores/modules/system/device.ts`                         | device store                 | web app            | B-10                                                                   | app-store                              | app store plus browser adapter                                   | app state edits only in source lane                                                                                            | no browser logic in core                                                                          | device tests                                                           |
| `apps/web-demo/src/stores/modules/system/theme.ts`                          | theme store                  | web app            | B-11, C-02                                                             | app-store                              | app store                                                        | app state edits only in source lane                                                                                            | no platform runtime expansion                                                                     | store/visual tests                                                     |
| `apps/web-demo/src/stores/modules/session/user.ts`                          | user store                   | web app            | C-02, D-10                                                             | app-store                              | app store                                                        | edit only in auth lane                                                                                                         | no auth behavior in M0                                                                            | auth tests                                                             |
| `apps/web-demo/src/stores/modules/session/permission.ts`                    | permission store             | web app            | C-02, D-10                                                             | app-store                              | app store                                                        | edit only in auth/router lane                                                                                                  | no behavior in M0                                                                                 | permission tests                                                       |
| `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`                        | layout compatibility facade  | web app            | A-03                                                                   | app-local-compat-facade                | facade over vue-app-platform                                     | keep thin facade                                                                                                               | no new logic                                                                                      | layout tests                                                           |
| `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`               | app global PrimeVue shell    | web app            | C-06                                                                   | app-plugin                             | app shell integration                                            | allowed exact app integration                                                                                                  | no feature-specific wrappers                                                                      | ai guard                                                               |
| `apps/web-demo/src/plugins/**`                                              | app plugin wiring            | web app            | A-03, B-12, C-06                                                       | app-plugin                             | app-specific wiring                                              | app plugin wiring only                                                                                                         | no public common barrels                                                                          | web-demo build                                                         |
| `apps/web-demo/src/views/**`                                                | app views/examples           | web app            | C-06, C-02                                                             | app-view                               | app view                                                         | app feature edits in source lanes                                                                                              | no platform exports                                                                               | e2e/layout visual if touched                                           |
| `apps/desktop/package.json`                                                 | app manifest                 | desktop app        | D-07, E-05                                                             | app-shell                              | app manifest                                                     | update only in approved lane                                                                                                   | no dep changes in M0                                                                              | desktop build                                                          |
| `apps/desktop/tsconfig.json`                                                | app TS config                | desktop app        | F-02, F-03                                                             | app-build-config                       | package-boundary config                                          | M13 removed package source includes; keep app-local includes and existing references only                                      | no global alias workaround or `../../packages/*/src/**` includes                                  | desktop type-check                                                     |
| `apps/desktop/src/adapters/index.ts`                                        | Tauri adapter                | desktop app        | D-07, E-05                                                             | desktop-adapter                        | desktop-adapter                                                  | Tauri invoke allowed here                                                                                                      | no Tauri outside adapters                                                                         | `pnpm arch:boundaries`                                                 |
| `apps/desktop/src/main.ts`                                                  | desktop bootstrap            | desktop app        | D-07                                                                   | app-shell                              | app shell                                                        | app bootstrap edits                                                                                                            | no Tauri invoke here                                                                              | desktop build                                                          |
| `apps/desktop/src/theme/index.ts`                                           | desktop design system setup  | desktop app        | D-07, E-05                                                             | app-runtime-infrastructure             | app integration over platform packages                           | edit in desktop lane                                                                                                           | no generic platform logic if reusable                                                             | desktop build                                                          |
| `scripts/upgrade-all-themes.mjs`                                            | theme tooling script         | root tooling       | F-04                                                                   | architecture-script                    | tool using package APIs                                          | consume `@ccd/design-tokens/theme-engine` public exports                                                                       | no app source deep import                                                                         | script run                                                             |
| `scripts/validate-token-contrast.ts`                                        | token validation script      | root tooling       | F-04                                                                   | architecture-script                    | tool using package APIs                                          | consume `@ccd/design-tokens/theme-engine` public exports                                                                       | no app source deep import                                                                         | `pnpm validate:tokens`                                                 |

## 8. Package Index

M3 runtime policy now mirrors this package index in `.ai/governance/policies/runtime.json`: contracts/core are strict runtime-neutral, design-tokens/shared-utils are runtime-neutral with classified cleanup debt, unocss-preset is node-build, vue packages are web-library, and apps are runtime integration owners with exact exceptions.

| package name                | path                            | expected layer                    | actual dependencies                                                                                                                                                                   | expected allowed dependencies from topology policy                                                                                                                                    | mismatch summary                                            | public API governance status            | related issue IDs                  | recommended action                                                                                                                                                                                                    |
| --------------------------- | ------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ccd/contracts`            | `packages/contracts`            | contracts                         | none                                                                                                                                                                                  | none                                                                                                                                                                                  | none observed                                               | included in API report                  | D-01, E-06, D-10, B-06, B-07       | keep type-only; M6 proposes no crypto implementation here and requires owner approval before any crypto contract expansion                                                                                            |
| `@ccd/core`                 | `packages/core`                 | core                              | `@ccd/contracts`                                                                                                                                                                      | `@ccd/contracts`                                                                                                                                                                      | none observed                                               | included in API report                  | A-01, D-10                         | preserve minimal facade                                                                                                                                                                                               |
| `@ccd/design-tokens`        | `packages/design-tokens`        | frontend-platform/runtime-neutral | none                                                                                                                                                                                  | none                                                                                                                                                                                  | `@ccd/design-tokens/theme-engine` used by M13a root tooling | included in API report                  | B-03, B-04, B-09, B-10, F-04       | source for pure theme, size, breakpoint, and M8 size resolver logic; no DOM/storage/browser globals                                                                                                                   |
| `@ccd/shared-utils`         | `packages/shared-utils`         | frontend-platform/runtime-neutral | none workspace; external `lodash-es`, `uuid`                                                                                                                                          | none workspace                                                                                                                                                                        | none observed                                               | included in API report                  | B-05, B-06, B-08                   | owns M7 JSON storage codec helpers; compression extraction requires `lz-string` dependency approval or an owner-approved parity-safe alternative                                                                      |
| `@ccd/unocss-preset`        | `packages/unocss-preset`        | frontend-platform/node-build      | `@ccd/design-tokens`                                                                                                                                                                  | `@ccd/design-tokens`                                                                                                                                                                  | none observed                                               | included in API report                  | C-04                               | preserve build-time scope                                                                                                                                                                                             |
| `@ccd/vue-hooks`            | `packages/vue-hooks`            | frontend-platform/web-library     | `@ccd/shared-utils`                                                                                                                                                                   | `@ccd/shared-utils`                                                                                                                                                                   | none observed                                               | included in API report                  | B-01, E-02                         | preserve hook/shared-utils edge; keep app event maps outside                                                                                                                                                          |
| `@ccd/vue-app-platform`     | `packages/vue-app-platform`     | frontend-platform/web-library     | `@ccd/design-tokens`                                                                                                                                                                  | `@ccd/design-tokens`                                                                                                                                                                  | none observed                                               | included in API policy/report           | B-03, B-04, B-10, B-11, D-04, E-03 | own injected theme/size/device runtime primitives, not app stores                                                                                                                                                     |
| `@ccd/vue-ui`               | `packages/vue-ui`               | frontend-platform/web-library     | `@ccd/design-tokens`, `@ccd/shared-utils`, `@ccd/vue-hooks`                                                                                                                           | `@ccd/design-tokens`, `@ccd/shared-utils`, `@ccd/vue-hooks`                                                                                                                           | none observed                                               | included in API report                  | B-02, B-12, C-06, D-08, D-11, E-04 | keep CCD public APIs and adapter keys; no app router/i18n coupling                                                                                                                                                    |
| `@ccd/vue-primevue-adapter` | `packages/vue-primevue-adapter` | frontend-platform/web-library     | `@ccd/design-tokens`                                                                                                                                                                  | `@ccd/design-tokens`                                                                                                                                                                  | none observed                                               | included in API report                  | C-06                               | preserve adapter role; M6 proposes M12 source migration before any allowlist removal                                                                                                                                  |
| `@ccd/vue-charts`           | `packages/vue-charts`           | frontend-platform/web-library     | `@ccd/design-tokens`                                                                                                                                                                  | `@ccd/design-tokens`                                                                                                                                                                  | none observed                                               | included in API report                  | E-07, F-01                         | preserve chart/token edge                                                                                                                                                                                             |
| `@ccd/web-demo`             | `apps/web-demo`                 | apps/web runtime                  | all approved platform packages                                                                                                                                                        | same set in topology                                                                                                                                                                  | none observed in workspace deps                             | publicApi false, should not be exported | A-03, B-01..B-12, C-02, C-06, F-01 | keep app shell/adapters/views/stores/facades; M7 leaves safeStorage crypto/runtime/compression facade app-owned where dependency or owner approval is missing; C-06 allowlist reduction requires M12 source migration |
| `@ccd/desktop`              | `apps/desktop`                  | apps/desktop runtime              | `@ccd/contracts`, `@ccd/core`, `@ccd/design-tokens`, `@ccd/shared-utils`, `@ccd/unocss-preset`, `@ccd/vue-app-platform`, `@ccd/vue-hooks`, `@ccd/vue-primevue-adapter`, `@ccd/vue-ui` | `@ccd/contracts`, `@ccd/core`, `@ccd/design-tokens`, `@ccd/shared-utils`, `@ccd/unocss-preset`, `@ccd/vue-app-platform`, `@ccd/vue-hooks`, `@ccd/vue-primevue-adapter`, `@ccd/vue-ui` | none observed                                               | publicApi false                         | D-07, E-05, F-02                   | keep app shell dependency set explicit                                                                                                                                                                                |

## 9. Runtime Boundary Index

| runtime surface                                              | allowed paths                                                                       | observed paths                                                                                                      | issue IDs                                      | migration target                                          | validation command                           |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| browser globals: `window`, `document`, `navigator`, `screen` | adapters, exact app exceptions, and exact web-library package exceptions only       | M3 inventory rows plus M5 split plan for theme/size/device/store/hooks                                              | B-03, B-04, B-10, B-11, C-01, C-02, C-05, D-07 | pure package resolvers plus app/browser adapters          | `pnpm arch:runtime`, `pnpm arch:boundaries`  |
| `localStorage` / `sessionStorage`                            | app storage adapters or exact app infrastructure exceptions; not contracts/core     | M3 exact exceptions plus M5 safeStorage/theme/size storage split                                                    | B-03, B-04, B-05, B-06, B-09, B-11, C-02, C-05 | storage contracts + shared codecs + app adapter           | `pnpm arch:runtime`, storage tests           |
| `fetch` / `XMLHttpRequest`                                   | exact HTTP infrastructure exceptions; not business views/stores; not contracts/core | M3 exact exceptions include `apps/web-demo/src/utils/http/**` and approved recovery/runtime paths                   | C-02, C-05, D-10                               | app HTTP infra plus contracts types                       | `pnpm arch:runtime`, HTTP focused tests      |
| timers: `setTimeout`, `setInterval`, `requestAnimationFrame` | exact app infrastructure and web-library package exceptions; not contracts/core     | M3 exact exceptions include app hooks/router/stores and `packages/vue-*` runtime primitives                         | B-11, C-01, C-02                               | package runtime classes plus adapter/exception policy     | `pnpm arch:runtime`                          |
| `console`                                                    | app logger adapters or exact diagnostics exceptions; not contracts/core             | M3 exact exceptions include package diagnostics and app logging debt                                                | C-01, C-02, C-05                               | logger injection or package-scoped diagnostics cleanup    | `pnpm arch:runtime`                          |
| crypto / Web Crypto                                          | app adapter or exact app infrastructure exception; type contracts only in contracts | M3 exact exceptions include sync/socket, HTTP methods/upload manager, and safeStorage crypto; M5 marks B-07 blocked | B-07, C-02                                     | owner-approved app adapter or web-library runtime adapter | `pnpm arch:runtime`, storage tests           |
| `navigator/window/document/screen` in views/examples         | exact app-view exceptions only                                                      | M3 inventory classifies app views/examples as `web-app-view`                                                        | C-02, C-05                                     | app-only classification or platform extraction if reused  | `pnpm e2e:layout`, `pnpm e2e:visual`         |
| Tauri `invoke` and `@tauri-apps/*`                           | `apps/desktop/src/adapters/**` only                                                 | `apps/desktop/src/adapters/index.ts`                                                                                | D-07, E-05                                     | desktop adapter                                           | `pnpm arch:boundaries`, `pnpm build:desktop` |

## 10. Migration Lane Plan

### M0 documentation restructuring and index generation

- objective: Produce this AI-friendly repair log, command logs, and summary report only.
- allowed paths: `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, `docs/ai-runs/20260531-090155-ccd-architecture-issue-log-ai-restructure/**`
- forbidden paths: source code, generated governance outputs, package manifests, lockfile, `.github/**`
- issues covered: all issues for classification only
- prerequisites: baseline git branch, commit, status; required source-of-truth reads
- commands to run before changes: `git branch --show-current`, `git rev-parse --short HEAD`, `git status --short --untracked-files=all`
- commands to run after changes: `git diff --check`, `pnpm docs:commands`, `pnpm ai:doctor --open`, `pnpm codex:preflight`, `pnpm validate:governance`
- expected evidence: target document, summary report, command logs
- rollback plan: delete only M0-created target doc/run directory if owner rejects the doc lane
- residual risk: scan is grep/tooling assisted and future source changes can make indexes stale

### M1 topology truth-source alignment

- objective: Align topology policy, package manifests, governance report, and graph generator semantics.
- allowed paths: `.ai/governance/policies/topology.json`, `scripts/architecture/**`, `scripts/governance/**`, generated outputs only by generator
- forbidden paths: app runtime source, dependencies unless owner-approved, manual generated edits
- issues covered: C-03, D-01, D-02, D-03, D-09, E-01..E-07
- prerequisites: owner approval for policy truth-source edits
- commands to run before changes: package manifest/policy diff, `pnpm project:doctor`
- commands to run after changes: `pnpm arch:report`, `pnpm validate:governance`, `pnpm arch:boundaries`
- expected evidence: policy diff, generated output diff from commands, package diff log
- rollback plan: revert policy/script/generated-command outputs together
- residual risk: new enforcement can surface preexisting failures

### M2 governance and API surface repair

- objective: Add missing public packages to API governance and make API surface discovery topology-driven.
- allowed paths: `.ai/governance/policies/api.json`, `scripts/architecture/check-api-surface.mjs`, API governance wording docs, generated API outputs by command
- forbidden paths: app source compatibility barrels, package public exports unless separately approved
- issues covered: D-04; D-11 remains outside this API-surface-only lane
- prerequisites: confirmed `@ccd/vue-app-platform` has topology `publicApi: true` and explicit package exports
- commands to run before changes: API policy/report grep and topology publicApi versus API report package table
- commands to run after changes: `pnpm api:report`, `pnpm codex:preflight`, `pnpm validate:governance`
- expected evidence: API policy/report/snapshot include `@ccd/vue-app-platform`
- rollback plan: revert API policy/tooling and generated API outputs together
- residual risk: future topology public packages missing from API policy now fail API report generation

### M3 runtime boundary policy expansion

- objective: Encode runtime-neutral, web-library, node-build, web-app, and desktop-app runtime classes.
- allowed paths: `.ai/governance/policies/runtime.json`, `scripts/architecture/**`, `scripts/ai-architecture-guard.mjs`, non-generated runtime docs
- forbidden paths: implementation migration, broad false-positive guards, contracts/core runtime code
- issues covered: C-01, C-02, C-04, C-05, C-06
- note: C-03 is closed for topology manifest/policy enforcement only; M3 still owns browser/runtime boundary expansion.
- prerequisites: exception policy and owner signoff on guard strictness
- commands to run before changes: runtime surface scan, `pnpm arch:runtime`, `pnpm ai:guard`
- commands to run after changes: `pnpm arch:runtime`, `pnpm arch:boundaries`, `pnpm ai:guard`, `pnpm validate:governance`
- expected evidence: explicit runtime classes and exception list
- rollback plan: revert policy/guard changes as one lane
- residual risk: initial guard expansion can break on intentional web-library runtime use
- result: `M3_RUNTIME_BOUNDARY_ENFORCED` for runtime policy/checker/docs/evidence. `pnpm arch:runtime` now classifies 387 inventory rows with 0 unclassified production findings and fails on new unclassified file/surface pairs. C-06 PrimeVue direct import migration remains open for M4.

### M4 app-local shared candidate classification

- objective: Classify app-local hooks, utils, stores, plugin wrappers, and facades as app-only, compatibility facade, or migration candidate.
- allowed paths: docs/plans first; source paths only in later approved lanes
- forbidden paths: implementation extraction in classification-only run, `packages/core`
- issues covered: A-03, B-01, B-02, B-03, B-04, B-05, B-06, B-07, B-08, B-09, B-10, B-11, B-12, C-06, D-06
- prerequisites: M1/M3 policy clarity
- commands to run before changes: import inventory, consumer graph, focused tests inventory
- commands to run after changes: docs checks and architecture/governance guards for classification-only; targeted tests if source later changes
- expected evidence: PrimeVue boundary inventory and app-local candidate list with owner package and compatibility status
- rollback plan: revert classification doc changes
- residual risk: classification can become stale if source moves first
- result: M4 classified 163 PrimeVue import rows and 71 app-local shared candidate rows. C-06 remains open; B-12 was added for the ProTable URL sync app router facade.

### M5 safeStorage/theme/size/device extraction planning

- objective: Plan extraction of safeStorage, theme, size, device, system stores, and app-local facades without changing runtime behavior.
- allowed paths: non-generated architecture/runtime docs, `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, and `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/**`
- forbidden paths: runtime source, package manifests, lockfiles, generated outputs, `packages/core`, PrimeVue allowlists, auth/HTTP behavior changes, broad UI rewrites
- issues covered: A-03, B-01, B-02, B-03, B-04, B-05, B-06, B-07, B-08, B-09, B-10, B-11, B-12, C-06, D-06
- prerequisites: M3/M4 evidence, package public API inspection, app dependency/consumer mapping
- commands to run before changes: branch/commit/status, safeStorage/theme/device/store/hook import scans, M4 PrimeVue allowlist evidence scans
- commands to run after changes: `git diff --check`, `pnpm docs:commands`, `pnpm project:doctor`, `pnpm ai:doctor --open`, `pnpm codex:preflight`, `pnpm arch:runtime`, `pnpm arch:boundaries`, `pnpm validate:governance`, `pnpm api:report`
- expected evidence: extraction candidate dependency map, package target API plan, safeStorage plan, theme/size/device plan, system-store/hook facade plan, PrimeVue allowlist reduction plan, summary, and command logs
- rollback plan: revert only M5 non-generated docs and the M5 run evidence directory
- residual risk: persisted storage and visual behavior remain high-blast-radius for future source lanes; B-07 crypto owner decision remains unresolved
- result: `M5_PARTIAL`. Planning evidence exists, but B-07 is `BLOCKED` and C-06 remains `OPEN` because 0 allowlist rows can be removed safely without source migration.

## 11. M5 Extraction Readiness

| area                          | target owner                                                             | source-lane action                                                                                                                                                        | blocked_or_open_issue_ids | evidence                                                                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| safeStorage contracts/codecs  | `packages/contracts`, `packages/shared-utils`, app adapter               | Add/consume type-only storage contracts and pure codec/compression helpers; keep key/env/logger/storage runtime app-owned.                                                | B-05, B-06, B-08          | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/safe-storage-plan.md`                                                                                                                         |
| safeStorage crypto            | app adapter or approved web-library package                              | Do not move Web Crypto/fallback implementation until owner decides scope; M6 recommends non-crypto codec first and crypto app-owned by default unless approved otherwise. | B-07 BLOCKED              | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/safe-storage-plan.md`, `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/reports/b07-safe-storage-crypto-owner-decision.md`          |
| theme facade and theme switch | `packages/design-tokens`, `packages/vue-app-platform`, app integration   | Keep app facade thin; move only reusable token/runtime primitives with injected DOM/storage targets.                                                                      | B-03, B-11                | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/theme-size-device-plan.md`                                                                                                                    |
| size and device               | `packages/design-tokens`, `packages/vue-app-platform`, app adapter/store | M8 established pure size resolver helpers in `@ccd/design-tokens`; device/browser collectors, preload, persistence, and Pinia state remain app-owned for M9/M10.          | B-04, B-09, B-10          | `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/reports/summary.md`                                                                                                                     |
| system stores                 | app store plus package primitives                                        | Keep Pinia stores app-owned; extract only pure state transitions or runtime primitives.                                                                                   | B-09, B-10, B-11          | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/system-store-and-hook-facade-plan.md`                                                                                                         |
| hook/facade surfaces          | `packages/vue-hooks`, `packages/vue-ui`, app adapters                    | Keep `useAutoMitt`, `useDialog`, and `useProTableUrlSync` as thin app bindings over package primitives/adapter keys.                                                      | B-01, B-02, B-12          | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/system-store-and-hook-facade-plan.md`                                                                                                         |
| PrimeVue allowlist reduction  | `packages/vue-ui`, `packages/vue-primevue-adapter`, app shell            | Remove no allowlist row in M5/M6; future source lanes must migrate exact legacy/demo imports before shrinking policy.                                                     | C-06 OPEN                 | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/primevue-allowlist-reduction-plan.md`, `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/reports/c06-primevue-allowlist-decision.md` |

### M6 owner decision packet and implementation lane split

- objective: Prepare owner-decision packets for `B-07` and `C-06`, keep blocked/open statuses honest, and split future implementation into small approvable lanes.
- issue IDs covered: B-07, C-06, F-01..F-04, G-01..G-03 for planning only
- allowed paths: `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, `docs/ai-plan/DECISIONS.md`, non-generated architecture/runtime docs, and `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/**`
- forbidden paths: runtime source, package manifests, lockfile, generated outputs, PrimeVue imports/allowlists, implementation behavior
- source files likely touched: none
- package files likely touched: none
- generated files expected: none
- prerequisites: M5 evidence, current branch/commit/status logs, B-07/C-06 searches
- owner decisions required: none to prepare; required before B-07 implementation and before C-06 allowlist reduction
- validation commands: `git diff --check`, `pnpm docs:commands`, `pnpm project:doctor`, `pnpm ai:doctor --open`, `pnpm codex:preflight`, `pnpm arch:runtime`, `pnpm arch:boundaries`, `pnpm validate:governance`, `pnpm api:report`, `pnpm ai:guard -- --format=json`
- rollback plan: revert M6 non-generated docs and delete only the M6 run evidence directory
- residual risk: proposed decisions can be mistaken as owner approval unless status remains `PROPOSED`
- expected final status: `M6_DECISION_PACKET_READY`; `B-07` remains `BLOCKED`, `C-06` remains `OPEN`

M6a post-validation:

- objective: Reconcile generated artifact sync drift blocking M6 validation without expanding decision scope or changing runtime behavior.
- issue IDs covered: D generated governance drift and G completion status only; no B-07/C-06 implementation approval.
- allowed paths used: `scripts/normalize-generated-output.mjs`, `scripts/architecture/check-api-surface.mjs`, generated outputs via generation commands, M6/M6a evidence reports, and this issue log.
- forbidden paths preserved: runtime source, package manifests, lockfile, PrimeVue imports/allowlists, implementation behavior.
- generated files changed: yes, through `pnpm api:report`, `pnpm governance:refresh`, and `pnpm validate:governance`.
- validation evidence: `docs/ai-runs/20260531-135533-ccd-m6a-governance-generated-sync-reconciliation/command-logs/084-after-api-generator-fix-pnpm-validate-governance.log`, `docs/ai-runs/20260531-135533-ccd-m6a-governance-generated-sync-reconciliation/command-logs/087-stability-shasum-diff-after-api-fix.log`, `docs/ai-runs/20260531-135533-ccd-m6a-governance-generated-sync-reconciliation/command-logs/091-stability-shasum-diff-validate-vs-refresh-after-fixes.log`
- result: `M6A_GOVERNANCE_SYNC_RECONCILED`; M6 final status is `M6_DECISION_PACKET_READY`.

M6b owner decision review:

- objective: Review the prepared M6 decision packet and record owner/operator approval status for D-016 and D-017 without implementation.
- issue IDs covered: B-07, C-06, D-016, D-017, G-03 for decision recording only.
- allowed paths used: `docs/ai-plan/DECISIONS.md`, this issue log, and `docs/ai-runs/20260531-142414-ccd-m6b-owner-decision-review/**`.
- forbidden paths preserved: runtime source, package manifests, lockfile, generated manual edits, PrimeVue imports/allowlists, implementation behavior.
- decision evidence: no explicit owner approval, rejection, deferral, or revision request was found for D-016 or D-017.
- result: `M6B_NO_OWNER_APPROVAL_RECORDED`; `D-016` and `D-017` remain `PROPOSED`, `B-07` remains `BLOCKED`, `C-06` remains `OPEN`, and `G-03` remains `BLOCKED`.
- lane authorization: `M7-safeStorage-codec-foundation` may proceed only for non-crypto codec/compression work that does not touch crypto/HMAC/Web Crypto behavior; `M12-primevue-allowlist-reduction` remains blocked until owner approval.

### M7 safeStorage codec foundation

- objective: Extract or consume pure safeStorage codec/compression helpers while leaving key/env/logger/storage runtime app-owned.
- issue IDs covered: B-05, B-06, B-08; B-07 only as an explicit blocker
- allowed paths: `packages/contracts/src/storage.ts`, `packages/shared-utils/src/storageCodec.ts`, optional `packages/shared-utils/src/storageCompression.ts`, `apps/web-demo/src/utils/safeStorage/{core,lzstring,index,safeStorage,piniaSerializer,storageMaintenance}.ts`, `apps/web-demo/src/plugins/modules/proform.ts`, focused tests
- forbidden paths: `packages/core/**`, Web Crypto implementation moves, package manifest/lockfile changes unless owner-approved, auth/HTTP changes
- source files likely touched: safeStorage codec/core/facade and ProForm draft injection
- package files likely touched: shared-utils/contracts source and tests only; manifests only if a new public entrypoint is explicitly approved
- generated files expected: API report outputs only if public contracts/exports change through `pnpm api:report`
- prerequisites: M6 `B-07` decision remains unresolved; persisted storage fixture inventory exists
- owner decisions required: B-07 crypto owner decision if crypto code is touched; otherwise none for non-crypto codec foundation
- validation commands: shared-utils tests, focused safeStorage/Pinia serializer/ProForm draft tests, `pnpm --filter @ccd/web-demo type-check`, `pnpm arch:runtime`, `pnpm arch:boundaries`, `pnpm api:report` if exports change
- rollback plan: revert codec/package/app facade edits together; restore old app safeStorage facade behavior
- residual risk: persisted payload compatibility and previous-key fallback regressions
- expected final status: `M7_SCOPE_ACCEPTED_VALIDATION_CLOSED`; `B-07` remains `BLOCKED` if no owner decision is approved
- M7 implementation result: JSON codec foundation is established by the existing `packages/shared-utils/src/storageCodec.ts` helpers and the existing `safeStorage/core.ts` delegation to `@ccd/shared-utils`. Runtime source files were not changed because adding another helper would duplicate existing package-owned behavior.
- M7 compression result: `apps/web-demo/src/utils/safeStorage/lzstring.ts` remains app-owned. It imports `lz-string`, but `@ccd/shared-utils` does not declare that dependency and M7 forbids package manifest/lockfile changes. Future compression extraction requires dependency approval plus exact `compressToBase64` / `decompressFromBase64` parity tests.
- M7 crypto result: `B-07` remains `BLOCKED`; no crypto/HMAC/Web Crypto/app logger/import.meta.env/key resolution/browser storage behavior moved.
- M7a validation closure: `pnpm --filter @ccd/web-demo test` failed because `requestLayer.spec.ts` treated filtered package cwd as repo root and constructed `apps/web-demo/apps/web-demo/src/utils/http`. M7a changed only test path normalization, and `pnpm --filter @ccd/web-demo test`, root `pnpm test:run`, `pnpm type-check`, and required governance commands now pass. Final M7 scope status is `M7_SCOPE_ACCEPTED_VALIDATION_CLOSED`.

### M7a web-demo filtered test cwd path repair

- objective: Repair the cwd-sensitive test path that blocked strict M7 validation without changing HTTP or safeStorage runtime behavior.
- issue IDs covered: M7 validation closure, D-10 test boundary evidence only
- allowed paths used: `apps/web-demo/src/utils/http/requestLayer.spec.ts`, this issue log, `docs/ai-plan/DECISIONS.md`, and `docs/ai-runs/20260531-153347-ccd-m7a-web-demo-filtered-test-cwd-repair/**`
- forbidden paths preserved: HTTP runtime implementation, safeStorage runtime, crypto/HMAC/Web Crypto, package manifests, lockfile, generated manual edits, PrimeVue imports/allowlists
- root cause: `process.cwd()` is repo root under root Vitest but package root under `pnpm --filter @ccd/web-demo test`; hardcoded `apps/web-demo/...` paths duplicated the package segment.
- fix: derive `webDemoRoot` from `import.meta.url`, derive `repoRoot` from `webDemoRoot`, scan package-local `src/**` paths, and keep violation reporting repo-relative.
- validation result: `pnpm --filter @ccd/web-demo test` passes with 45 files / 329 tests; `pnpm test:run` passes with 74 files / 429 tests; `pnpm type-check` passes; required governance validation passes.
- generated files changed: existing generated dirty state remains; M7a did not manually edit generated files.
- package manifests changed: no.
- runtime source behavior changed: no.
- result: `M7A_FILTERED_TEST_CWD_REPAIRED`; M7 strict validation is closed as `M7_SCOPE_ACCEPTED_VALIDATION_CLOSED`.
- residual blockers: `B-07` remains `BLOCKED`, `B-08` remains dependency/manifest blocked, `D-016` remains `PROPOSED`, `C-06` remains `OPEN`, and `G-03` remains `BLOCKED`.

### M8 theme-size-resolver-foundation

- objective: Move or expose pure theme/size resolver logic through owning packages and keep DOM/storage application injected.
- issue IDs covered: B-03, B-04, B-09, B-11, F-04
- allowed paths: `packages/design-tokens/src/**`, `packages/vue-app-platform/src/themeRuntime.ts`, app theme facades under `apps/web-demo/src/utils/theme/**`, focused theme/size tests
- forbidden paths: `packages/core/**`, raw app-store moves into packages, broad UI rewrites, dependency changes, lockfile changes
- source files likely touched: `engine.ts`, `sizeEngine.ts`, `mode.ts`, `transitions.ts`, `lottieThemeUtils.ts`
- package files likely touched: design-tokens and vue-app-platform public source/tests; manifests only if approved export changes require them
- generated files expected: API report outputs if package exports change
- prerequisites: parity fixtures for size vars, theme vars, mode resolution, first-paint behavior
- owner decisions required: package public API approval for any new exported resolver
- validation commands: design-tokens tests, vue-app-platform tests, theme/size store specs, `pnpm validate:tokens`, `pnpm e2e:layout`, `pnpm e2e:visual`, `pnpm arch:runtime`
- rollback plan: revert package exports and app facade calls together
- residual risk: first-frame theme/size flicker and visual regressions
- expected final status: `M8_THEME_SIZE_RESOLVER_FOUNDATION_DONE`
- implementation result: `packages/design-tokens/src/sizeResolver.ts` now owns pure size resolver helpers and exports them through `@ccd/design-tokens`. `apps/web-demo/src/utils/theme/sizeEngine.ts` remains a compatibility facade, re-exporting/delegating pure helpers while retaining DOM writes, preload, browser storage, and app device collectors.
- behavior result: Pinia store behavior, persisted keys, `localStorage` preload fallback, visual/runtime theme and size behavior, app facade imports, package manifests, and lockfile are unchanged.
- validation evidence: `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/command-logs/`.
- issue status result: `B-04` and `B-09` record pure resolver foundation progress only; `B-07` remains `BLOCKED`, `B-08` remains `OPEN`, `D-016` remains `PROPOSED`, `D-017` remains `PROPOSED`, `C-06` remains `OPEN`, and `G-03` remains `BLOCKED`.

### M9 device-runtime-resolver-foundation

- objective: Split pure device/OS/breakpoint resolution from app browser collectors and listeners.
- issue IDs covered: B-10, B-09, B-04
- allowed paths: `packages/design-tokens/src/breakpoints.ts`, optional package resolver file, `packages/vue-app-platform/src/layoutRuntime.ts`, `apps/web-demo/src/utils/deviceSync.ts`, `apps/web-demo/src/stores/modules/system/device.ts`, focused tests
- forbidden paths: moving browser listeners into `packages/core` or contracts, broad runtime allowlists, unrelated layout rewrites
- source files likely touched: `deviceSync.ts`, `device.ts`, package resolver/runtime files
- package files likely touched: design-tokens/vue-app-platform source/tests; manifests only if export changes are approved
- generated files expected: API report outputs if package exports change
- prerequisites: UA/maxTouchPoints/screen-short-side fixture matrix including iPadOS
- owner decisions required: owner choice for whether OS resolver belongs in design-tokens, vue-app-platform, or app-only type surface
- validation commands: device specs, layout runtime tests, `pnpm e2e:layout`, `pnpm arch:runtime`, `pnpm arch:boundaries`
- rollback plan: restore app-local resolver path and remove package resolver exports
- residual risk: responsive layout and mobile/tablet classification drift
- expected final status: `M9_DEVICE_RESOLVER_FOUNDATION_DONE`

### M10 system-store-pure-state-extraction

- objective: Extract only pure state machines/resolvers from system stores while keeping Pinia containers app-owned.
- issue IDs covered: A-03, B-09, B-10, B-11
- allowed paths: `apps/web-demo/src/stores/modules/system/**`, `packages/design-tokens/src/**`, `packages/vue-app-platform/src/**`, focused store tests
- forbidden paths: moving Pinia stores into packages, changing persisted keys without migration fixtures, auth/HTTP changes
- source files likely touched: `theme.ts`, `size.ts`, `device.ts`, `layout.ts`, `locale.ts`
- package files likely touched: design-tokens/vue-app-platform pure helpers only
- generated files expected: none unless package API changes require `pnpm api:report`
- prerequisites: M8/M9 resolver foundations or explicit parity fixtures
- owner decisions required: approval for any new package state-machine export
- validation commands: system store specs, `pnpm --filter @ccd/web-demo type-check`, `pnpm e2e:layout`, `pnpm e2e:visual`, `pnpm arch:runtime`
- rollback plan: revert package helper calls and restore store-local pure logic
- residual risk: persisted preferences, sync events, and first-paint behavior
- expected final status: `M10_SYSTEM_STORE_PURE_STATE_DONE`
- implementation result: `packages/vue-app-platform/src/layoutRuntime.ts` now owns pure layout visibility parent/child constraints, mode-hidden module constraints, and module restore-cache reduction through explicit inputs. `apps/web-demo/src/stores/modules/system/layout.ts` delegates these helpers while preserving Pinia state ownership and store public API.
- behavior result: store ID, state shape, persisted key/pick list, persisted payload format, `syncAction`, loading counters, mobile drawer runtime state, device-store dependency, app singleton access, and browser runtime behavior are unchanged.
- validation evidence: `docs/ai-runs/20260531-185509-ccd-m10-system-store-pure-state-extraction/command-logs/`.
- issue status result: `M10_SYSTEM_STORE_PURE_STATE_EXTRACTION_PARTIAL`; size/device pure helpers are verified as already package-owned from M8/M9, while Pinia mutations, persistence, runtime listeners, lifecycle, and sync behavior remain app-owned by scope.

### M11 hook-facade-convergence

- objective: Thin app hook/plugin facades around package-owned primitives without moving app router/i18n/storage bindings into packages.
- issue IDs covered: B-01, B-02, B-05, B-06, B-12
- allowed paths: `apps/web-demo/src/hooks/modules/{useAutoMitt,useDialog,useProTableUrlSync}.ts*`, `apps/web-demo/src/plugins/modules/{proform,protable}.ts`, `packages/vue-hooks/src/createAutoMittHook.ts`, `packages/vue-ui/src/{PrimeDialog,ProTable,ProForm}/**`, focused tests
- forbidden paths: app route/i18n imports in `packages/vue-ui`, storage/runtime implementation in packages without injection, raw app public exports
- source files likely touched: app hook facades and package adapter-key/type surfaces
- package files likely touched: vue-hooks/vue-ui source/tests; manifests only if approved public exports change
- generated files expected: API report outputs if public API changes
- prerequisites: M7 safeStorage facade stability for ProForm draft storage
- owner decisions required: public API approval for any new vue-ui/vue-hooks exported facade helper
- validation commands: vue-hooks tests, vue-ui dialog/ProTable/ProForm tests, web-demo type-check, focused ProTable URL sync tests, `pnpm api:report`
- rollback plan: restore app facade implementations and remove added package exports
- residual risk: router query sync, translated dialog defaults, and draft storage behavior
- expected final status: `M11_HOOK_FACADE_CONVERGENCE_DONE`
- implementation result: no production facade or package source was moved; `apps/web-demo/src/hooks/modules/useAutoMitt.spec.ts`, `useDialog.spec.ts`, and `useProTableUrlSync.spec.ts` were added to lock current compatibility facade behavior.
- behavior result: app event map binding, dialog translated content/labels/severity/callbacks, ProTable route query semantics, and ProForm/ProTable plugin wiring remain unchanged.
- validation evidence: `docs/ai-runs/20260531-192122-ccd-m11-hook-facade-convergence/command-logs/`.
- issue status result: `M11_HOOK_FACADE_CONVERGENCE_VERIFIED`; B-01, B-02, and B-12 remain open because the app facades intentionally remain in place.

### M12 primevue-allowlist-reduction

- objective: Reduce PrimeVue direct app allowlists one feature area at a time after wrapper/adapter migration.
- issue IDs covered: C-06, D-11
- allowed paths: `packages/vue-ui/src/**`, `packages/vue-primevue-adapter/src/**`, `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`, exact migrated app feature/example files, `scripts/ai-architecture-guard.mjs`, generated type registry only through its owning generator
- forbidden paths: broad allowlist globs, raw PrimeVue public re-export buckets, manual generated type edits, unrelated UI rewrites
- source files likely touched: one selected feature/demo/global-shell group at a time
- package files likely touched: vue-ui/vue-primevue-adapter wrappers/adapters and tests
- generated files expected: generated component typings only if generator output is intentionally refreshed
- prerequisites: owner approval of reduction group and visual validation budget
- owner decisions required: C-06 concrete reduction policy and approval for any showcase exception shrinkage
- validation commands: `pnpm ai:guard -- --format=json`, `pnpm api:report`, package tests/builds, web-demo type-check, focused visual/e2e smoke for touched UI
- rollback plan: restore allowlist row and migrated feature imports together
- residual risk: UI behavior and showcase coverage regressions
- expected final status: `M12_PRIMEVUE_ALLOWLIST_REDUCTION_PARTIAL` until all exact app/showcase rows are migrated

### M13 tsconfig-build-boundary-repair

- objective: Remove package source include bypasses in app tsconfigs and clarify remaining root script app-source imports.
- issue IDs covered: F-01, F-02, F-03, F-04
- allowed paths: `apps/*/tsconfig.json`, package tsconfigs/references, package public APIs if approved, `scripts/ci/package-resolution-smoke.mjs`, `scripts/architecture/validate-boundaries.mjs`
- forbidden paths: root global `@ccd/*` aliases, dependency changes, lockfile changes, generated manual edits
- source files likely touched: app tsconfigs and governance/smoke scripts
- package files likely touched: package public exports/build configs only if required by missing declarations
- generated files expected: none unless API/package report generators are intentionally run
- prerequisites: package builds emit required declarations; app builds can consume outputs
- owner decisions required: none for app tsconfig source include removal; build/reference strategy only if package public API additions are needed
- validation commands: `pnpm ci:prepare-internal`, `pnpm ci:smoke:packages`, app type-checks, `pnpm type-check`, `pnpm build:web-demo`, `pnpm build:desktop`, `pnpm arch:boundaries`
- rollback plan: revert TS config/tooling changes
- residual risk: F-04 root theme tooling imports remain future tooling-boundary work
- expected final status: `M13_TSCONFIG_BUILD_BOUNDARY_REPAIRED_F04_OPEN`
- implementation result: `apps/web-demo/tsconfig.json` package source include count changed from 5 to 0; `apps/desktop/tsconfig.json` package source include count changed from 3 to 0. Project references, runtime source, package manifests, dependencies, and lockfile were not changed.
- validation evidence: `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/command-logs/`.
- issue status result: `F-01`, `F-02`, and `F-03` are `DONE`; `F-04` remains `OPEN`.

### M13a root-theme-tooling-boundary-repair

- objective: Remove root theme tooling imports from app theme utilities and consume governed package public APIs.
- issue IDs covered: F-04
- allowed paths used: `scripts/upgrade-all-themes.mjs`, `scripts/validate-token-contrast.ts`, `scripts/architecture/validate-boundaries.mjs`, `scripts/ci/package-resolution-smoke.mjs`, `packages/design-tokens/src/theme-engine/index.ts`, `packages/design-tokens/src/theme-engine/index.spec.ts`, non-generated docs, and M13a run evidence.
- forbidden paths preserved: no `apps/web-demo/src/**` runtime behavior, `apps/desktop/src/**`, package manifests, lockfile, dependencies, safeStorage crypto/HMAC/Web Crypto, PrimeVue allowlists, or generated manual edits were changed.
- public package replacements: `@ccd/design-tokens/theme-engine` replaced app `color.ts`, app `engine.ts`, and app `validate.ts` root script imports.
- generated files: API/governance outputs may be regenerated only through commands; no manual generated edits.
- validation commands: `pnpm exec vitest run packages/design-tokens/src/theme-engine/index.spec.ts`, `pnpm --filter @ccd/design-tokens build`, `pnpm exec tsx scripts/validate-token-contrast.ts`, `pnpm validate:tokens`, `node scripts/upgrade-all-themes.mjs`, `pnpm ci:smoke:packages`, `pnpm arch:boundaries`, `pnpm api:report`, plus required full validation matrix.
- rollback plan: revert M13a script/public-barrel/validator/smoke/doc/evidence changes.
- residual risk: full validation must remain green after report updates and generated-output commands.
- expected final status: `M13A_ROOT_THEME_TOOLING_BOUNDARY_REPAIRED`
- implementation result: target root app-theme import count changed from 3 matched import lines to 0; `F-04` is `DONE`.

### M14 status-and-ledger-reconciliation

- objective: Align docs, status, ADRs, blockers, runtime ledger, and final go/no-go state with current evidence.
- issue IDs covered: A-01, A-02, A-03, D-05, D-06, D-07, D-08, D-10, G-01, G-02, G-03
- allowed paths: non-generated docs under `README.md`, `docs/**`, `.ai/runtime/repair_list.md`, `.ai/runtime/owner_decisions.md` only if owner approves
- forbidden paths: source implementation, generated manual edits, blocked lane implementation, owner-decision fabrication
- source files likely touched: none
- package files likely touched: none
- generated files expected: none unless owning generator commands are intentionally run
- prerequisites: latest `pnpm ai:doctor --open`, stale doc grep, owner/operator decisions for any status changes
- owner decisions required: ADR status approval, final blocker disposition, any owner-decision records moved from `PROPOSED` to `APPROVED`
- validation commands: `pnpm docs:commands`, `pnpm ai:doctor --open`, `pnpm codex:preflight`, `pnpm validate:governance`, `git diff --check`
- rollback plan: revert status/doc/ledger edits
- residual risk: status changes without owner evidence are invalid
- expected final status: `M14_STATUS_LEDGER_RECONCILED` only if blockers are explicitly represented and no false DONE/GO state remains
- implementation result: `M14_STATUS_LEDGER_RECONCILED_NO_GO`. Required validation passed and the ledger is now explicit, but `B-07`, `B-08`, `C-06`, `D-016`, `D-017`, `G-03`, and 80 `pnpm ai:doctor --open` tasks remain unresolved or blocked/deferred. No source migration, blocker approval, generated manual edit, staging, or commit was performed.

### M15 no-go-surface-sync-review-package

- objective: Synchronize top-level status surfaces with accepted M14 `NO_GO` and prepare a human review package.
- issue IDs covered: D-05, D-08, D-11, G-01, G-02, G-03 plus blocker surfacing for B-07, B-08, C-06, D-016, D-017.
- allowed paths used: `README.md`, `docs/ai-plan/STATUS.md`, `docs/ai-plan/FINAL_GO_NO_GO.md`, `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, `docs/ai-plan/DECISIONS.md`, `scripts/ai-route-view-scaffold.mjs`, and M15 run evidence.
- forbidden paths preserved: app/desktop runtime source, package implementation source behavior, package manifests, lockfile, generated manual edits, PrimeVue imports/allowlists, safeStorage crypto/HMAC/Web Crypto, staging, committing, pushing, cleaning, reset, rebase, and history rewrite.
- implementation result: top-level README/status/final NO_GO surfaces now state M14 reconciliation passed, full GO is not authorized, `B-07`, `B-08`, `C-06`, `D-016`, `D-017`, and `G-03` remain unresolved, and `pnpm ai:doctor --open` still reports 80 open tasks.
- scaffold result: `scripts/ai-route-view-scaffold.mjs` now generates `FormSchema` and `ProTableColumn` type imports from `@ccd/vue-ui` instead of removed app component paths.
- issue status result: `D-05` and `G-01` are `DONE`; `D-08`, `D-11`, and `G-02` remain `OPEN`; `B-07` remains `BLOCKED`; `B-08` remains `OPEN`; `C-06` remains `OPEN`; `D-016` remains `PROPOSED`; `D-017` remains `PROPOSED`; `G-03` remains `BLOCKED`.
- residual scope note: stale component-path references in `docs/ai-plan/PLAN.md`, `docs/zh/04-project-control-center.md`, and `docs/zh/08-release.md` are recorded in M15 drift evidence but not modified because they are outside the M15 allowed edit list.
- validation result: required M15 validation passed. `node scripts/ai-route-view-scaffold.mjs --help` exits 1 because the script has no help mode; the safe scaffold `--dry-run` exits 0.
- final status: `M15_NO_GO_SURFACE_SYNCHRONIZED`.

### M16 stale-doc-tooling-reference-cleanup

- objective: Clean up stale documentation and tooling text/path references left out of M15 scope without changing runtime behavior or owner-decision statuses.
- issue IDs covered: D-08, D-11, G-02 plus blocker preservation for B-07, B-08, C-06, D-016, D-017, G-03.
- allowed paths used: `docs/ai-plan/PLAN.md`, `docs/zh/04-project-control-center.md`, `docs/zh/08-release.md`, `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, `docs/ai-plan/STATUS.md`, `docs/ai-plan/FINAL_GO_NO_GO.md`, and M16 run evidence.
- forbidden paths preserved: app/desktop runtime source, package implementation source behavior, package manifests, lockfile, generated manual edits, PrimeVue imports/allowlists, safeStorage crypto/HMAC/Web Crypto, staging, committing, pushing, cleaning, reset, rebase, and history rewrite.
- implementation result: `docs/ai-plan/PLAN.md`, `docs/zh/04-project-control-center.md`, and `docs/zh/08-release.md` now classify ProForm/ProTable/PrimeDialog as `@ccd/vue-ui` owned and list app plugin/facade integration paths instead of removed app component directories.
- scaffold result: no M16 scaffold change; M15 already aligned generated type imports to `@ccd/vue-ui`.
- issue status result: `D-08` is `DONE`; `D-11` is `PARTIALLY_OBSOLETE`; `G-02` remains `OPEN`; `B-07` remains `BLOCKED`; `B-08` remains `OPEN`; `C-06` remains `OPEN`; `D-016` remains `PROPOSED`; `D-017` remains `PROPOSED`; `G-03` remains `BLOCKED`.
- residual scope note: `scripts/ai-architecture-guard.mjs` still contains removed app component allowlist rows; owner-approved M12 reduction remains future work. Historical `docs/ai-runs/**` evidence is intentionally preserved.
- final status: `M16_STALE_REFERENCES_CLEANED`.

### M16a ledger-evidence-polish

- objective: Synchronize ledger §0 YAML, G-02 repair notes, and M16 evidence diff bookkeeping without changing issue substantive statuses, runtime behavior, or owner-decision outcomes.
- issue IDs covered: G-02 (wording only); D-08 and D-11 statuses unchanged (`DONE`, `PARTIALLY_OBSOLETE`).
- allowed paths used: `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, `docs/ai-plan/STATUS.md`, M16 retroactive diff log under `docs/ai-runs/20260531-223500-ccd-m16-stale-doc-tooling-reference-cleanup/command-logs/019-m16-complete-file-diff-name-status.log`, and M16a run evidence.
- forbidden paths preserved: app/desktop runtime source, package implementation source behavior, package manifests, lockfile, generated manual edits, PrimeVue imports/allowlists, safeStorage crypto/HMAC/Web Crypto, blocker approval fabrication, staging, committing, pushing, cleaning, reset, rebase, and history rewrite.
- implementation result: §0 machine-readable summary now includes `D-08` in `done` and `D-11` in `partially_obsolete`; G-02 table row and per-issue detail now reference M16 evidence; M16 complete changed-files log reconciled with M16 summary.
- issue status result: no substantive issue status changes; `G-02` remains `OPEN`; `B-07` remains `BLOCKED`; `B-08` remains `OPEN`; `C-06` remains `OPEN`; `D-016` remains `PROPOSED`; `D-017` remains `PROPOSED`; `G-03` remains `BLOCKED`.
- explicit preservation note: M16 lane conclusion `M16_STALE_REFERENCES_CLEANED` is unchanged; top-level final architecture status remains `NO_GO`.
- final status: `M16A_LEDGER_EVIDENCE_POLISHED`.

### P0 post-m16-blocker-baseline

- objective: Confirm repository state, blocker state, evidence stability, and working tree classification before blocker-resolution lanes.
- issue IDs covered: baseline for B-07, B-08, C-06, D-016, D-017, G-02, G-03, M12, review package.
- allowed paths used: `docs/ai-runs/20260601-100000-ccd-p0-post-m16-blocker-baseline/**`, minimal ledger reference updates only if stale.
- forbidden paths preserved: runtime source, manifests, lockfile, generated manual edits, git stage/commit/push/clean.
- validation result: governance matrix passed; `pnpm codex:preflight` failed on inherited `.cursor` presence and ai:sync drift note.
- ledger note: M16a evidence directory referenced in STATUS/ledger is missing on disk (`P0_LEDGER_INCONSISTENT` sub-note).
- final status: `P0_BLOCKER_BASELINE_CONFIRMED`.

### P1 d016-safe-storage-crypto-decision

- objective: Record owner approval for D-016 Option A (app-owned crypto).
- issue IDs covered: D-016, B-07.
- allowed paths used: `docs/ai-plan/DECISIONS.md`, `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, P1 evidence.
- forbidden paths preserved: `apps/web-demo/src/utils/safeStorage/crypto.ts`, manifests, lockfile, runtime behavior.
- issue status result: `D-016` → `APPROVED`; `B-07` → `DONE` (app-owned terminal boundary).
- final status: `P1_D016_APPROVED`.

### P2 b08-compression-lz-string-decision

- objective: Record owner approval for B-08 Option A (app-owned compression).
- issue IDs covered: B-08, D-019 (new).
- allowed paths used: `docs/ai-plan/DECISIONS.md`, `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, P2 evidence.
- forbidden paths preserved: package.json, pnpm-lock.yaml, compression implementation.
- issue status result: `B-08` → `DONE`; `D-019` → `APPROVED`.
- final status: `P2_B08_APP_OWNED_DECIDED`; P5 skipped.

### P3 d017-primevue-reduction-decision

- objective: Record owner approval for D-017 Options A+D (guard posture only).
- issue IDs covered: D-017, C-06 (status note), M12 (remains blocked).
- allowed paths used: `docs/ai-plan/DECISIONS.md`, `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, P3 evidence.
- forbidden paths preserved: PrimeVue imports, allowlists, guard script edits.
- issue status result: `D-017` → `APPROVED`; `C-06` remains `OPEN`; M12 remains blocked (Option E not approved).
- final status: `P3_D017_APPROVED`; P6 skipped.

### P4 safe-storage-non-crypto-cleanup

- objective: Implement only non-crypto safeStorage cleanup authorized by P1 D-016 Option A.
- issue IDs covered: B-07 (preserved DONE), B-08 (preserved DONE).
- allowed paths used: `apps/web-demo/src/utils/safeStorage/index.ts` (facade boundary comment only).
- forbidden paths preserved: `crypto.ts`, compression migration, manifests, payload format.
- implementation result: audit confirmed M7 JSON codec already package-owned; added ownership boundary comment to public facade; no crypto/compression movement.
- validation result: piniaSerializer spec passed; type-check and arch:runtime passed.
- final status: `P4_SAFE_STORAGE_NOOP_CONFIRMED`.

### P7 repair-ledger-reconciliation

- objective: Classify 80 open repair-ledger tasks; do not close without evidence.
- issue IDs covered: G-02, G-03 (context).
- allowed paths used: `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`, P7 evidence.
- implementation result: all 80 tasks classified in grouped reconciliation table; 0 checkbox closures in `.ai/runtime/repair_list.md`.
- issue status result: `G-02` remains `OPEN`; `G-03` remains `BLOCKED`.
- final status: `P7_REPAIR_LEDGER_CLASSIFIED_NONZERO`.

### P8 final-go-no-go-reconciliation

- objective: Re-evaluate GO/NO_GO after P1–P7 with full validation matrix.
- issue IDs covered: G-03, top-level status surfaces.
- allowed paths used: `docs/ai-plan/FINAL_GO_NO_GO.md`, `docs/ai-plan/STATUS.md`, P8 evidence.
- validation result: full matrix pass except inherited `pnpm codex:preflight` failure (`.cursor` + ai:sync drift).
- issue status result: top-level remains `NO_GO`; B-07/B-08 DONE; D-016/D-017/D-019 APPROVED; C-06/G-02/G-03 unchanged in blocking effect.
- final status: `P8_FINAL_NO_GO`.

### P9 review-package-and-commit-plan

- objective: Prepare human-reviewable change package for M1–P8 work without staging or committing.
- issue IDs covered: review/commit package (OPEN).
- allowed paths used: `docs/ai-runs/20260601-107000-ccd-p9-review-package/**`, STATUS reference to P9 package.
- forbidden paths preserved: no stage/commit/push/clean; no source implementation beyond P4 comment.
- implementation result: dirty-file classification, commit grouping proposal (G1–G6), exclusion list.
- validation result: type-check, test:run, ai:guard, validate:governance passed in P9 subset.
- final status: `P9_REVIEW_PACKAGE_READY`.

### P10f auto-imports and vue-charts build repair (2026-06-01)

- evidence: `docs/ai-runs/20260601-020401-ccd-p10f-auto-imports-vue-charts-build-repair/`
- baseline HEAD: `ab1d23d6`; final HEAD: `ab1d23d6` (no commit)
- auto-imports: `LOCAL_FORMATTING_DRIFT` — unplugin-auto-import single-line output vs Prettier multi-line HEAD; cleared via `prettier --write`
- vue-charts: `BUILD_OUTPUT_PREPARATION_REQUIRED` — `dist/index.d.ts` from `pnpm --filter @ccd/vue-charts build`; no manifest/config change
- validation: full P10f matrix PASS including `build:web-demo`, `build:desktop`
- final status: `P10F_PUSH_READINESS_RESTORED`; architecture remains **NO_GO**; push not authorized

## 12. Validation Matrix

| command                    | validates issue types                                                       | expected use                          | generated output risk                                                                   |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| `pnpm docs:commands`       | A, D, G docs command references                                             | M0/M6/M14 docs lanes                  | none expected                                                                           |
| `pnpm project:doctor`      | root project metadata, package/workspace consistency                        | M1 prerequisite                       | may sync project metadata only if command does so; inspect diff                         |
| `pnpm ai:doctor --open`    | G status/open task inventory, AI governance health                          | M0/M6/M14                             | none expected                                                                           |
| `pnpm codex:preflight`     | AI protocol and required files                                              | M0/M2/M6/M14                          | none expected                                                                           |
| `pnpm validate:governance` | governance gate, generated sync checks, architecture gate                   | M0/M1/M2/M3/M6/M14                    | should not generate; may fail on drift                                                  |
| `pnpm arch:runtime`        | C runtime-neutral leaks and root decommission checks                        | M3/M5                                 | none expected                                                                           |
| `pnpm arch:boundaries`     | C/E/F boundary checks, depcruise, topology manifest/policy edge enforcement | M1/M3/M6/M13                          | none expected                                                                           |
| `pnpm arch:report`         | D/E generated governance report from topology policy                        | M1                                    | writes `docs/generated/governance-report.md` and `.ai/generated/governance-report.json` |
| `pnpm api:report`          | D API surface, topology public platform package exports                     | M2                                    | writes `docs/generated/api-surface-report.*` and snapshots if policy changes            |
| `pnpm governance:refresh`  | D/E generated governance outputs                                            | M1 only if intentionally regenerating | writes generated reports/graphs/SBOM                                                    |
| `pnpm type-check`          | F TS boundary, package/app type health                                      | M13/source lanes                      | none expected                                                                           |
| `pnpm test:run`            | B source extraction behavior                                                | M5/source lanes                       | none expected                                                                           |
| `pnpm build:web-demo`      | B/C/F web app runtime/build                                                 | M7-M13/source lanes                   | writes app dist only                                                                    |
| `pnpm build:desktop`       | D/E/F desktop runtime/build                                                 | M1/M13/source lanes                   | writes app dist only                                                                    |
| `pnpm build:ci`            | final broad validation                                                      | final/source lanes only               | writes build outputs                                                                    |
| `pnpm e2e:layout`          | B-04/B-09/B-10 layout and responsive runtime                                | M5/source lanes                       | test artifacts/screenshots possible                                                     |
| `pnpm e2e:visual`          | B-03/B-04/B-11 theme/visual runtime                                         | M5/source lanes                       | test artifacts/screenshots possible                                                     |

## 13. Evidence Log Template

```yaml
run_id:
date:
lane:
baseline_commit:
files_changed:
issues_touched:
commands_run:
  - command:
    result:
    log:
generated_outputs_changed: false
source_behavior_changed: false
source_changes_allowed: false
residual_risks:
next_blocker:
final_status:
```

## 14. Update Rules

- Every issue status change must include evidence.
- Do not mark `DONE` without command output references.
- Do not mark `BLOCKED` without naming the blocking decision owner.
- Do not remove issue IDs.
- If a new issue is found, assign the next stable ID in the matching category.
- If category boundaries change, keep old ID stable and add aliases.
- Generated files must be regenerated by commands, not manually edited.
- Source implementation must occur in a separate approved lane.
- Preserve historical `docs/ai-runs/**` evidence. Do not rewrite old run logs to make them match current paths.
- `apps/*` may not become public platform package surfaces.
- `packages/core` remains a minimal runtime-neutral facade and may depend only on `@ccd/contracts`.
