# CCD Runtime Repair Ledger

- Target path: `.ai/runtime/repair_list.md`
- Template source: `.ai/runtime/repair_list.template.md`
- Owner decisions: `.ai/runtime/owner_decisions.md`
- Rule coverage: `.ai/runtime/rule_coverage_matrix.md`
- Generated JSON target: `.ai/runtime/repair-ledger.json`
- Runtime state policy: `.ai/runtime/repair_list.md` is local runtime state; `pnpm ai:sync` may create it from `.ai/runtime/repair_list.template.md` when missing, but must not overwrite it once it exists.
- Last regenerated: 2026-06-09
- Reset basis: 2026-06-09 deep-research issue analysis + current post-merge runtime repair ledger.
- Cleanup rule applied: all completed repair task lines were removed. This file contains only open, deferred, blocked, or re-opened work.
- Owner decision: keep the current CCD repository and perform staged modernization, not a full rebuild.

## 0. Purpose

This ledger is the canonical AI-readable repair and modernization plan for CCD after the 2026-06-09 deep-research audit.

The current scope remains **CCD architecture system completion**, not business-product development. CCD should remain a governed multi-runtime platform skeleton:

- `apps/web-demo` demonstrates browser-side architecture capabilities.
- `apps/desktop` demonstrates Tauri desktop packaging, IPC, permissions, windows, security, and desktop runtime adapter capabilities.
- `packages/contracts` and `packages/core` stay runtime-neutral.
- Runtime capabilities are injected through contracts and app adapters.
- Runtime APIs appear only in app adapter layers or approved runtime-specific boundaries.
- Root package remains orchestration-only.

The deep-research audit found no current P0 blocker. P1 closure has completed the governance, delivery-command, catalog, desktop-security, and CI/local validation cleanup. The remaining open work is isolated modernization lanes, audit-readback, cleanup, and deferred strategic guardrails.

## 1. Ledger Format Contract

- Open, deferred, blocked, or re-opened tasks use unchecked task lines.
- Completed task lines are intentionally not kept in this cleaned runtime ledger.
- Each actionable task must start with `- [ ] [Module] Task`.
- The `Module` label must include priority, for example `[P1-Validate-AllInOneGate]` or `[P2-Vite8-IsolatedLane]`.
- Do not mark a task complete until implementation and relevant validation commands pass.
- During the next cleanup pass, remove completed task lines from this runtime ledger again.

Parser compatibility:

- `scripts/migrate-ledger.mjs` must parse `- [ ] [Module] Task`.
- Legacy icon lines are migration-only and should not be introduced into this ledger.

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
| P2 | 8 | Medium-priority modernization and isolated dependency lanes. |
| P3 | 6 | Cleanup, documentation, audit-readback, and developer-experience issues. |
| P4 | 10 | Strategic deferred or blocked guardrails that should remain open until owner decisions change. |
| Total | 24 | All completed tasks from the previous ledger were removed. |

## 4. P1 — Closed Governance, Security, and Delivery Defects

### Rationale

P1 closure completed the delivery and governance contract hardening identified by the 2026-06-09 audit. Completed task lines are intentionally removed from this runtime ledger so only unresolved work remains.

### Tasks

No open P1 tasks remain. The unresolved task lines below are P2, P3, and P4 only.

## 5. P2 — Medium Priority Modernization and Isolated Lanes

### Rationale

These items are real, but they should not be mixed into governance cleanup or architecture-boundary repair. Vite major migration and dependency modernization must remain isolated lanes.

### Vite major lane

No open Vite major lane tasks remain. The Vite 8 isolated compatibility lane was completed on `modernize/vite8-compat` with inventory, Rolldown/Oxc config migration, bundle budget validation, deployment build validation, and full governance validation.

### Dependency modernization lanes

- [x] [P2-Deps-RuntimeStack] Upgrade Vue runtime ecosystem only in an isolated compatibility lane.
  - Affected packages: `vue`, `vue-router`, `vue-i18n`, `pinia`, `unocss`, and related runtime plugins.
  - Acceptance: route behavior, i18n, state, UnoCSS, and browser app behavior remain stable.
  - Validation: targeted runtime tests, `pnpm type-check`, `pnpm test:run`, `pnpm e2e:qa`, `pnpm validate`.

- [x] [P2-Deps-Vueuse] Upgrade `@vueuse/core` only in an isolated compatibility lane.
  - Affected paths: hooks, auto-import configuration, packages using VueUse.
  - Acceptance: hooks and auto-import behavior remain stable; existing Rolldown/VueUse annotation warnings are tracked separately from the upgrade decision.
  - Completed on `modernize/vueuse-compat`: upgraded catalog-managed `@vueuse/core` from `^13.9.0` to `^14.3.0`; lockfile resolved `@vueuse/core`, `@vueuse/shared`, and `@vueuse/metadata` to `14.3.0`.
  - Validation: `pnpm --filter @ccd/vue-hooks test`, `pnpm --filter @ccd/vue-hooks type-check`, `pnpm --filter @ccd/vue-ui test`, `pnpm --filter @ccd/vue-ui type-check`, `pnpm --filter @ccd/vue-charts test`, `pnpm --filter @ccd/vue-charts type-check`, `pnpm --filter @ccd/web-demo test`, `pnpm --filter @ccd/web-demo type-check`.

- [x] [P2-Deps-ESLint] Upgrade ESLint ecosystem only if lint behavior remains deterministic.
  - Affected paths: `eslint.config.ts`, lint scripts, Vue/TS lint plugins.
  - Acceptance: lint output is stable and not noisier; no rule weakening is introduced just to pass.
  - Completed on `modernize/eslint-compat`: upgraded catalog-managed `eslint` from `^9.39.2` to `^10.4.1`, `@eslint/js` from `^9.39.2` to `^10.0.1`, `typescript-eslint` from `^8.53.1` to `^8.61.0`, `eslint-plugin-vue` from `^9.31.0` to `^10.9.2`, `vue-eslint-parser` from `^10.2.0` to `^10.4.1`, and `globals` from `^17.1.0` to `^17.6.0`.
  - Config compatibility: removed obsolete `vue/script-setup-uses-vars` references because `eslint-plugin-vue` v10 removed the rule and `vue-eslint-parser` v9+ handles `<script setup>` usage; scoped the new `vue/no-required-prop-with-default` advisory off only for the existing `PrimeDialog` wrapper contract to keep this dependency lane out of PrimeVue/UI contract changes.
  - Validation: `pnpm exec vitest run scripts/eslint-rules/no-hardcoded-colors.spec.ts`, `pnpm deps:catalog:check`, `pnpm lint:check`, `pnpm check`.

- [x] [P2-Deps-PrimeVue] Upgrade PrimeVue only after adapter API compatibility is verified.
  - Affected paths: `packages/vue-primevue-adapter/**`, `packages/vue-ui/**`, `apps/web-demo/**`.
  - Acceptance: PrimeVue remains the UI ecosystem; theme, PassThrough, services, locale mapping, and global config stay adapter-owned.
  - Completed on `modernize/primevue-adapter-compat`: aligned catalog-managed `primevue`, `@primevue/core`, `@primevue/forms`, `@primevue/icons`, and `@primevue/auto-import-resolver` from `^4.5.4` to `^4.5.5`; lockfile resolved `@primevue/metadata` to `4.5.5` while stable `@primeuix/themes` remained `2.0.3`.
  - Compatibility evidence: official PrimeVue 4.5.5 release notes identify this as a patch release; package metadata keeps `@primevue/core` peer dependency at `vue: ^3.5.0`; current CCD Vue catalog is `^3.5.35`.
  - Validation: `pnpm --filter @ccd/vue-primevue-adapter type-check`, `pnpm --filter @ccd/vue-primevue-adapter test`, `pnpm --filter @ccd/vue-ui type-check`, `pnpm --filter @ccd/vue-ui test`, `pnpm exec vitest run apps/web-demo/src/plugins/modules/primevue.spec.ts scripts/architecture/primevue-boundary-policy.spec.ts`.

- [ ] [P2-Deps-Alova] Upgrade alova only after request tests and app-owned runtime boundaries are sufficient.
  - Affected paths: `apps/web-demo/src/utils/http/**`, HTTP contracts, API modules.
  - Acceptance: alova runtime stays app-owned; interceptors, auth refresh, retry/cache/dedup, error mapping, and schema validation remain stable.
  - Validation: request-layer tests, `pnpm arch:runtime`, `pnpm api:report`, `pnpm validate`.

- [ ] [P2-Deps-Playwright] Upgrade Playwright only after CI browser install/cache behavior is confirmed.
  - Affected paths: Playwright config, e2e tests, CI workflow, browser cache/install docs.
  - Acceptance: E2E remains stable locally and in CI.
  - Validation: `pnpm e2e:smoke`, `pnpm e2e:layout`, `pnpm e2e:visual`, `pnpm e2e:qa`, CI run.

- [ ] [P2-Deps-Tauri] Synchronize Tauri JS API, CLI, Rust `tauri`, and `tauri-build` versions with an explicit minor/patch policy.
  - Affected paths: `apps/desktop/package.json`, root manifest/catalog, `apps/desktop/src-tauri/Cargo.toml`, `apps/desktop/src-tauri/Cargo.lock`.
  - Acceptance: JS API, CLI, Rust crate, and build crate are aligned by an explicit policy; no new plugin or permission is enabled as part of version sync.
  - Validation: `pnpm build:desktop`, `pnpm desktop:security`, `cargo check --locked --manifest-path apps/desktop/src-tauri/Cargo.toml`.

- [ ] [P2-Deps-Validation] For every dependency modernization lane, run targeted checks first and then full validation.
  - Acceptance: each lane records a current outdated/scan snapshot, affected ecosystem, compatibility notes, rollback risk, and validation results.
  - Validation: `pnpm deps:outdated`, `pnpm deps:scan`, `pnpm supply:check`, targeted tests, `pnpm validate`.

## 6. P3 — Low Priority Cleanup, Documentation, and DX

### Rationale

These issues do not block the architecture, but they reduce contributor clarity, portability, auditability, and source-tree cleanliness.

### Tasks

- [ ] [P3-PackageCleanup-CrossPlatform] Standardize package build cleanup on Node-based artifact cleanup.
  - Source finding: some packages still use shell-specific cleanup such as `rm -f` while others use the central Node cleaner.
  - Affected paths: `packages/design-tokens/package.json`, `packages/vue-hooks/package.json`, other package manifests for consistency.
  - Acceptance: package cleanup is cross-platform and routed through `scripts/clean-artifacts.mjs` or an equivalent Node-based wrapper.
  - Validation: package builds, `pnpm build:ci`, `pnpm validate`.

- [ ] [P3-HistoricalArtifacts-Archive] Archive or relocate historical and generated-adjacent artifacts from active source areas.
  - Source finding: `output/playwright/**` and `ccd-public-layer-repair-plan-package/**` add noise on `main`.
  - Affected paths: `output/playwright/**`, `ccd-public-layer-repair-plan-package/**`, docs/history/archive paths if created.
  - Acceptance: active source-of-truth areas are not mixed with stale screenshots, planning packages, or historical repair material unless explicitly labeled as historical evidence.
  - Validation: `pnpm governance:gate`, `pnpm project:doctor`, docs review.

- [ ] [P3-NodeEngine-Policy] Decide and document whether the strict Node 24 engine lane is intentional.
  - Source finding: root `node: "24.x"` is stricter than the minimum required by current tooling, which may increase contributor friction.
  - Affected paths: root `package.json`, `mise.toml`, README setup docs, CI workflow.
  - Acceptance: either keep Node 24 as an intentional repository policy and document why, or relax the engine policy to the supported toolchain baseline.
  - Validation: `pnpm project:doctor`, `pnpm docs:commands`, CI install/build.

- [ ] [P3-Audit-RemoteGovernanceReadback] Maintain direct GitHub branch-protection and required-check readback evidence.
  - Source finding: the audit could not fully verify actual branch-protection rules or required-check names.
  - Affected paths: `docs/governance/github-governance.md`, `.ai/runtime/governance-snapshots/**`.
  - Acceptance: current `main` protection, required checks, review policy, conversation resolution, linear history, force-push/delete restrictions, and workflow job names are captured by a reproducible readback process.
  - Validation: GitHub settings readback when authorized, `pnpm governance:github-workflows`, docs review.

- [ ] [P3-Audit-DesktopScopeLineReview] Perform a line-by-line review of Tauri capability files and security scopes.
  - Source finding: the audit could verify the existence of capability and security-scope files but did not inspect every permission line in detail.
  - Affected paths: `apps/desktop/src-tauri/capabilities/**`, `apps/desktop/src-tauri/security-scopes.json`, `apps/desktop/src-tauri/tauri.conf.json`.
  - Acceptance: every enabled, denied, and planned desktop capability has documented rationale, threat model, and validation coverage.
  - Validation: `pnpm desktop:security`, desktop smoke, security-scope snapshot.

- [ ] [P3-Audit-PrimeVueI18nDocs] Complete official-doc verification for PrimeVue and vue-i18n version-specific behavior.
  - Source finding: the audit had limited access to some official PrimeVue/vue-i18n docs and avoided strong version-specific claims.
  - Affected paths: `packages/vue-primevue-adapter/**`, `packages/vue-app-platform/**`, `apps/web-demo/src/locales/**`, ADR/docs.
  - Acceptance: current PrimeVue v4 usage, PassThrough/theme patterns, locale mapping, and vue-i18n composition API usage are verified against official sources and documented.
  - Validation: docs review, adapter/i18n tests, `pnpm docs:commands`.

## 7. P4 — Strategic Deferred and Blocked Guardrails

### Rationale

These entries intentionally remain open to prevent premature strategic or product work. Do not implement them in architecture repair lanes unless owner decisions change.

### Tasks

- [ ] [P4-Desktop-RustCommands] Add Rust command handlers only through audited typed IPC boundaries when backend commands are actually introduced.
  - Owner decision: non-actionable until a real desktop backend capability is approved.
  - Prerequisites: contract-first IPC design, Rust command threat model, scoped Tauri permission rationale, frontend adapter validation, rollback plan.
  - Validation guardrail: `pnpm desktop:security`, `pnpm desktop:smoke:dev`, `pnpm desktop:smoke:release`, `pnpm build:desktop`, Rust tests when commands exist.

- [ ] [P4-Desktop-RustErrors] Use structured Rust-side IPC error types instead of string-only errors when commands are introduced.
  - Owner decision: non-actionable until Rust IPC commands exist.
  - Prerequisites: stable command contract, frontend error mapping contract, Rust error enum or typed error envelope.
  - Validation guardrail: Rust tests, IPC adapter tests, `pnpm governance:gate`.

- [ ] [P4-Desktop-UpdaterDeepLink-Blocked] Do not enable updater or deep-link runtime until a desktop security model is approved.
  - Owner decision: blocked by desktop trust-model requirements.
  - Prerequisites: trusted update source, signature validation, allowed URL schemes, downgrade behavior, failure handling, scoped Tauri permissions, owner approval, rollback plan.
  - Validation guardrail: `pnpm desktop:security`, `pnpm desktop:smoke:release`, `pnpm governance:gate`.

- [ ] [P4-NewOrganization-Deferred] Do not create a new GitHub organization or new repository until current repository governance and architecture are stable and explicitly approved.
  - Owner decision: current repository remains the architecture target.
  - Prerequisites: stable governance baseline, publication/release strategy, migration plan, owner approval, rollback/archival plan.
  - Validation guardrail: remote mutation scope remains limited to explicitly approved governance tasks.

- [ ] [P4-Starter-Deferred] Create `ccd-vue-starter` only after public package APIs and release policy are stable.
  - Owner decision: starter extraction is deferred.
  - Prerequisites: stable `@ccd/contracts`, `@ccd/core`, `@ccd/vue-ui`, `@ccd/vue-primevue-adapter`, package publication policy, template maintenance owner, separate repository approval.
  - Validation guardrail: `pnpm api:report`, `pnpm project:doctor`, `pnpm governance:gate`.

- [ ] [P4-DesignSystem-Deferred] Split a standalone design-system repository only after UI primitives and adapter boundaries are stable.
  - Owner decision: keep tokens, UI primitives, and PrimeVue adapter in the current monorepo for now.
  - Prerequisites: UI primitive API stability, package publication policy, token compatibility plan, consumer migration plan, owner approval.
  - Validation guardrail: `pnpm arch:boundaries`, `pnpm api:report`, `pnpm docs:commands`, `pnpm governance:gate`.

- [ ] [P4-RekaUI-Deferred] Evaluate Reka UI only for specific headless primitive gaps after PrimeVue adapter boundaries are stable.
  - Owner decision: PrimeVue remains the UI ecosystem.
  - Prerequisites: gap analysis, PrimeVue adapter boundary review, dependency impact review, owner approval, migration/rollback plan.
  - Validation guardrail: dependency catalog/supply checks and PrimeVue boundary guards remain green.

- [ ] [P4-TanStackQuery-Deferred] Evaluate TanStack Query Vue only if server-state complexity exceeds what alova plus explicit adapters can cleanly handle.
  - Owner decision: alova remains app-owned and sufficient until source evidence proves otherwise.
  - Prerequisites: server-state complexity evidence, HTTP adapter impact review, cache/invalidation policy, owner approval, rollback plan.
  - Validation guardrail: app-owned HTTP tests, `pnpm arch:runtime`, `pnpm api:report`, dependency catalog checks.

- [ ] [P4-HttpCore-Blocked] Do not promote alova HTTP runtime into `packages/core` or a new generic shared request package.
  - Block reason: HTTP runtime, interceptors, auth refresh, policies, UI notification behavior, and app validation remain app-owned.
  - Allowed work: type-only HTTP contracts in `packages/contracts/src/http/**` and app-owned adapter/runtime hardening.
  - Validation guardrail: `pnpm arch:runtime`, `pnpm api:report`, app HTTP tests, `pnpm governance:gate`.

- [ ] [P4-SafeStorageShared-Blocked] Do not promote safeStorage crypto, compression, serializer, migration, maintenance, or runtime facade to `@ccd/shared-utils`.
  - Block reason: safeStorage runtime remains app-owned.
  - Allowed work: storage capability contracts and regression guards.
  - Validation guardrail: safeStorage tests, no-shared-move guard, `pnpm arch:runtime`, `pnpm governance:gate`.

## 8. Validation Matrix

Use the smallest valid validation set first, then escalate.

| Change type | Minimum validation | Full validation |
| ----------- | ------------------ | --------------- |
| Ledger Markdown change | `pnpm ai:sync`, `pnpm ai:doctor --open`, `pnpm codex:preflight` | `pnpm governance:gate` |
| Script surface / command docs | `pnpm docs:commands`, `pnpm ai:doctor --open` | `pnpm validate` |
| Canonical validator | targeted `node scripts/validate-workspace.mjs full` smoke if created | `pnpm validate`, CI |
| Dependency catalog centralization | `pnpm deps:catalog:check`, `pnpm deps:scan`, `pnpm supply:check` | `pnpm validate` |
| Desktop security | `pnpm desktop:security`, desktop smoke | `pnpm build:desktop`, cargo desktop check, `pnpm validate` |
| Runtime boundaries | `pnpm arch:runtime`, `pnpm arch:boundaries` | `pnpm validate` |
| Package/public API | `pnpm api:report`, package build | `pnpm build:ci`, `pnpm validate` |
| Vite major lane | targeted web/desktop/package builds | `pnpm build:ci`, `pnpm vercel:build`, `pnpm e2e:qa`, budgets |
| Dependency lane | targeted ecosystem tests | `pnpm validate` |
| Generated/docs artifacts | `pnpm docs:commands`, `pnpm governance:gate` | `pnpm validate` |
| Remote governance readback | GitHub settings/API readback when authorized | `pnpm governance:github-workflows`, docs review |

## 9. Recommended Execution Order

Execute in this order unless the owner explicitly overrides it:

1. Keep this runtime ledger parseable and aligned with AI protocol references.
2. Clean package build cleanup portability and historical artifacts.
3. Decide and document the Node engine policy.
4. Complete audit-readback gaps for remote governance, desktop scopes, PrimeVue, and vue-i18n.
5. Run Vite major migration only in an isolated branch.
6. Run dependency modernization only in isolated ecosystem lanes.
7. Revisit P4 strategic items only after explicit owner approval.

## 10. Anti-Patterns

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

## 11. Completion Criteria

This ledger is considered stable only when:

- `.ai/runtime/repair_list.md` exists locally and is used by AI workflows.
- This file contains no stale completed repair task lines.
- `scripts/migrate-ledger.mjs` can generate `.ai/runtime/repair-ledger.json` from this Markdown.
- `pnpm ai:sync` preserves existing local Markdown ledger content.
- `pnpm ai:doctor --open` lists open tasks from this Markdown.
- `pnpm codex:preflight` checks Markdown paths.
- `pnpm ai:sync`, `pnpm ai:doctor --open`, `pnpm codex:preflight`, and `pnpm governance:gate` pass.
- The canonical all-in-one validation command is truthful.
- Root script surface is reduced or clearly classified.
- Dependency catalogs are centralized without unauthorized upgrades.
- Desktop security posture is explicit and validated.
- Vite major and dependency modernization remain isolated lanes until intentionally executed.

## 12. How to Use This Checklist

Place this Markdown file at `/.ai/runtime/repair_list.md`.

Each actionable task can be checked off only after implementation and relevant validation commands pass. When a task is completed, mark it complete in the working ledger and include validation evidence in the commit or repair note. During the next cleanup pass, remove completed task lines from this runtime ledger so it remains focused on unresolved repair work.
