# M2 Migration Batch Plan

## Scope

M2 is a planning lane. It does not migrate production source, does not change
package manifests, and does not change the lockfile.

Evidence inputs:

- `docs/ai-runs/20260602-101620-ccd-post-go-app-public-layer-m1-inventory/reports/candidate-dependency-map.md`
- `docs/ai-runs/20260602-101620-ccd-post-go-app-public-layer-m1-inventory/reports/app-owned-justification-register.md`
- `command-logs/design-token-api-evidence.log`
- `command-logs/package-owner-manifests.log`
- `command-logs/candidate-test-surface-search.log`

## Batch A — Pure utilities and deterministic helpers

Status: `PARTIAL_APPROVED_FOR_M3_REVIEW`.

Approved candidate:

- `M3-DESKTOP-THEME`
  - Current owner: `apps/desktop/src/theme/index.ts`
  - Target package: `@ccd/design-tokens`
  - Public API shape: reuse existing `generateThemeVars`, `generateSizeVars`,
    and `resolveSizePreset` APIs; no new export is planned in M2.
  - Source file changes: M3 may replace duplicated app-local var derivation
    with existing package APIs while keeping `setupDesktopDesignSystem()` and
    `document.documentElement` writes app-owned.
  - Tests: `pnpm --filter @ccd/design-tokens test`,
    `pnpm --filter @ccd/desktop type-check`, `pnpm build:desktop`,
    `pnpm arch:runtime`, `pnpm validate:governance`.
  - Governance changes: none planned.
  - Rollback: revert the M3 lane commit and re-run the same commands.
  - Behavior risk: low to medium; risk is CSS variable parity in the desktop
    app.

Deferred candidates:

- `M3-ROUTE-ACCESS` remains M3 review-only until route/menu type ownership is
  explicit and tests can prove parity.
- `M3-SYSTEM-PREF-GUARDS` is deferred because the current guard depends on
  app-owned system preference payload types.
- `M3-DTO-CONTRACTS` is deferred because Zod schema movement would require a
  manifest/dependency decision. Type-only extraction may be revisited only with
  a narrower contract proposal.
- `BLOCK-DATEUTILS`, `BLOCK-SAFESTORAGE-CRYPTO`, and
  `BLOCK-SAFESTORAGE-COMPRESSION` remain not eligible under existing decisions.

## Batch B — Vue composables

Status: `NOT_APPLICABLE_NOW`.

No M1 candidate is approved for immediate migration to `@ccd/vue-hooks`.
Current hook-like app surfaces are app compatibility facades, app i18n/router
wrappers, or `DateUtils` integration surfaces.

M4 may be skipped unless M3 produces a new platform helper with explicit inputs.

## Batch C — Design tokens, theme, size, and device leftovers

Status: `APPROVED_FOR_M3_REVIEW`.

This is the same concrete work as `M3-DESKTOP-THEME`: desktop pure theme/size
var derivation should be reviewed against existing `@ccd/design-tokens` APIs.
The app-owned DOM write and PrimeVue size source remain in `apps/desktop`.

No manifest, lockfile, generated file, or web-demo theme facade change is
planned.

## Batch D — UI primitives and PrimeVue wrappers

Status: `NOT_APPLICABLE_NOW`.

M1 found no remaining production app direct PrimeVue import that is safe and
approved for this plan. Existing surfaces are governed package wrappers,
generated registries, build-only resolver boundaries, test mocks, or already
documented app/plugin facades.

M5 should validate guard posture and record `NOT_APPLICABLE` unless a later
evidence pass finds a new direct app UI surface.

## Batch E — Platform lifecycle/bootstrap/global-shell helpers

Status: `DEFERRED`.

`M3-ROUTE-ACCESS` may become a `@ccd/vue-app-platform` helper only if the route
and menu contracts can be expressed without app singleton, store, router, or
i18n coupling. No app bootstrap, route table, Pinia store, plugin install, or
global shell ownership is approved for movement in M2.

## Batch F — Build/generator boundary utilities

Status: `CLASSIFY_APP_OWNED_OR_GENERATED`.

`apps/web-demo/build/**`, `apps/web-demo/vite.config.ts`, and generated
registries remain app/build-owned because this repository has no governed
build package owner and D-A002 forbids manifest/lockfile changes. M6 should
record the classification, preserve generated-file ownership, and avoid manual
generated edits.

## Batch G — Docs/status/guard hardening

Status: `APPROVED_FOR_M7`.

M7 should update the app-owned register and strengthen guard coverage only if
the guard can be made deterministic without manifest or lockfile changes.
Guard hardening must not weaken existing PrimeVue, runtime, generated-file, or
package-boundary checks.

## Independently Reviewable Lane Order

1. M3: review and, if parity is proven, migrate desktop pure theme/size var
   derivation to existing `@ccd/design-tokens` APIs.
2. M4: record `NOT_APPLICABLE` unless new hook/platform work is proven by M3.
3. M5: validate UI/PrimeVue guard posture and record no eligible source move.
4. M6: classify build/generated app surfaces and preserve owner boundaries.
5. M7: update app-owned justifications and add practical deterministic guards.
6. M8: run the final validation matrix and certify or block.

## Acceptance Check

All batches are independently reviewable. No M2-approved path requires package
manifest or lockfile changes.
