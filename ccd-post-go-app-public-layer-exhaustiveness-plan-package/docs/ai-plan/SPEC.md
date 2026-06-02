# SPEC — Post-GO Apps Public-Layer Exhaustiveness

## Problem statement

CCD reached Full GO, but the owner now wants a post-GO exhaustive check to ensure no reusable/common module remains incorrectly owned by `apps/**`.

## Goal

Audit every app-local module under `apps/**`, identify all common/shared/public capabilities, migrate all valid candidates into governed packages, and prove that every remaining app-local module is intentionally app-owned.

## Non-goals

- Do not touch Clawd/theme issues.
- Do not change safeStorage crypto/HMAC/WebCrypto ownership unless a new approved contract-based lane proves necessity.
- Do not change lz-string ownership unless a new dependency/manifest lane is approved.
- Do not move app route views just because code is reusable-looking.
- Do not force generated files or app integration shells into common packages when that would weaken ownership.
- Do not declare new architecture issues without evidence.

## Functional requirements

1. Produce a full `apps/**` public-capability inventory.
2. Classify each candidate as migrate, app-owned, generated-owned, runtime-adapter, compatibility facade, demo/showcase, or blocked.
3. Migrate every eligible common capability to its correct governed package.
4. Preserve behavior and public API compatibility.
5. Update imports, tests, API surfaces, topology/governance reports, and docs.
6. Add or strengthen guards so regressions are blocked.
7. Produce final evidence proving no unclassified app-local public/common capability remains.

## Non-functional requirements

- Type-safe TypeScript.
- Vue 3 Composition API compatible.
- No unnecessary dependencies.
- No broad rewrites.
- No degraded web/desktop behavior.
- No unstable generated drift.
- Clean final working tree.

## Acceptance criteria

- `apps/**` inventory is complete.
- Every reusable/common app module has a destination or a documented app-owned reason.
- All approved migrations are implemented.
- New guarded regressions are enforced.
- Final validation matrix passes.
- Final report states `APP_PUBLIC_LAYER_EXHAUSTIVENESS_CERTIFIED` or a precise blocked status.
