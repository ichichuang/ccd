# CHANGE SUMMARY

## M0 — Baseline and plan activation

- Created evidence directory `docs/ai-runs/20260602-101057-ccd-post-go-app-public-layer-m0-baseline/`.
- Read root AI protocol, current root `docs/ai-plan/*.md`, and the post-GO plan package `docs/ai-plan/*.md`.
- Ran all M0 baseline validation commands successfully.
- Recorded the pre-existing untracked plan package as task input; no source migration started.

## M1 — Full apps public-capability inventory

- Created evidence directory `docs/ai-runs/20260602-101620-ccd-post-go-app-public-layer-m1-inventory/`.
- Inventoried 448 tracked `apps/**` files across `apps/desktop` and `apps/web-demo`.
- Produced required reports:
  - `reports/apps-public-capability-inventory.md`
  - `reports/candidate-dependency-map.md`
  - `reports/app-owned-justification-register.md`
- Identified 17 file-level candidates that require M2 batch planning or owner review.
- Made no production source, manifest, lockfile, generated registry, or guard changes.

## M2 — Migration batch planning

- Created evidence directory `docs/ai-runs/20260602-102647-ccd-post-go-app-public-layer-m2-batch-planning/`.
- Produced migration batch planning reports:
  - `reports/migration-batch-plan.md`
  - `reports/candidate-review-table.md`
  - `reports/risk-notes.md`
  - `reports/summary.md`
- Approved only `M3-DESKTOP-THEME` for narrow M3 implementation review against existing `@ccd/design-tokens` APIs.
- Deferred route access, system preference guards, DTO/Zod schemas, DateUtils, safeStorage crypto/compression, HTTP runtime, and build-package movement.
- Ran M2 validation successfully with no production source, manifest, lockfile, generated registry, or guard source changes.

## M3 — Pure utility and token migration

- Created evidence directory `docs/ai-runs/20260602-103451-ccd-post-go-app-public-layer-m3-pure-utility-token-migration/`.
- Migrated desktop duplicated theme derivation to `generateThemeVars` from `@ccd/design-tokens/theme-engine`.
- Migrated desktop duplicated size scale derivation to `generateSizeVars` and package `resolveSizePreset` from `@ccd/design-tokens`.
- Preserved app-owned DOM root writes, layout dimensions, root font size, dialog width, and PrimeVue size source.
- Fixed the initial desktop type-check failure by importing `generateThemeVars` from the package subpath that actually exports it.
- Ran M3 validation successfully after the import-path fix.

## M4 — Hooks and app-platform applicability review

- Created evidence directory `docs/ai-runs/20260602-104234-ccd-post-go-app-public-layer-m4-hooks-platform-review/`.
- Classified M4 as `NOT_APPLICABLE`: no additional hook/platform source migration is eligible under current rules.
- Confirmed reusable lifecycle/directive primitives are already owned by `@ccd/vue-hooks`.
- Confirmed platform bootstrap/runtime helpers are already owned by `@ccd/vue-app-platform`.
- Kept app hook surfaces app-owned or app compatibility facades because they depend on app router, store, i18n, DOM, DateUtils, API, or runtime policy.
- Ran M4 hook/platform validation successfully.

## M5 — UI and PrimeVue wrapper review

- Created evidence directory `docs/ai-runs/20260602-104926-ccd-post-go-app-public-layer-m5-ui-primevue-review/`.
- Classified M5 as `NOT_APPLICABLE`: no production app UI/PrimeVue wrapper source remains eligible for migration.
- Confirmed direct app PrimeVue findings are build resolver, generated registry, or dependency manifest surfaces.
- Confirmed `@ccd/vue-ui` and `@ccd/vue-primevue-adapter` remain the governed UI/PrimeVue package owners.
- Ran M5 UI/PrimeVue validation successfully.
- Recorded and normalized build-produced `auto-imports.d.ts` formatting drift with an empty post-prettier diff.
