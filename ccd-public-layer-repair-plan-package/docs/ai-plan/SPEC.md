# SPEC — CCD Apps Public-Layer Repair and Hardening

## Problem statement

The prior `apps/**` public-layer audit concluded that no immediately safe, approved app-local public capability remained eligible for direct migration. However, the current structure still contains unresolved structural risks: route/menu/access contracts are app-local and ambient-global, API/DTO response contracts are fragmented, system preference contracts are tied to app-local Zod schemas, sync runtime and build config have reusable potential but no approved package owner, and several app-local facades need stronger guard coverage to prevent regressions.

This project must repair the eligible issues while preserving behavior and respecting existing architecture ownership boundaries.

## Goals

1. Make route/menu/access contracts explicit and package-owned where safe.
2. Move only safe pure route/menu/access helpers after type ownership is explicit.
3. Normalize API/DTO response contracts and remove ambiguous duplicate naming.
4. Split system preference type contracts from app-local Zod schema ownership.
5. Record explicit owner decisions for sync runtime and build config surfaces.
6. Keep app stores, plugin shells, route views, generated files, runtime adapters, and compatibility facades app-owned unless a milestone proves safe extraction.
7. Add or strengthen deterministic guards that prevent app-local public-layer regressions.
8. Produce validation evidence and final go/no-go artifacts.

## Non-goals

- Do not perform broad rewrites.
- Do not move app route views simply because they look reusable.
- Do not move Pinia stores into public packages.
- Do not move SafeStorage crypto/HMAC/WebCrypto, lz-string compression, DateUtils, or app HTTP runtime adapters without a separate owner decision.
- Do not move Zod schemas into `@ccd/contracts` unless dependency ownership is approved.
- Do not create new package owners or edit manifests/lockfiles without approval.
- Do not manually edit generated registries.
- Do not change authentication semantics, route access semantics, storage semantics, visual behavior, or runtime behavior except where explicitly required by a milestone.
- Do not commit or push unless explicitly requested.

## Stakeholders

- Repository owner and maintainer.
- Future AI coding agent executing the plan.
- Human reviewer validating architecture, risk, and evidence.
- Developers consuming `apps/**` and `packages/**` APIs.

## Functional requirements

1. Inventory current route/menu/access, API/DTO, system preference, sync, build, theme/size, store, UI, SafeStorage, DateUtils, HTTP, and generated surfaces before implementation.
2. Classify each app-local candidate as one of:
   - `MIGRATE_NOW`
   - `TYPE_ONLY_CONTRACT`
   - `APP_OWNED_RUNTIME_ADAPTER`
   - `APP_COMPATIBILITY_FACADE`
   - `GENERATED_OWNED`
   - `DEFERRED_OWNER_DECISION`
   - `NOT_SAFE_TO_MOVE`
   - `NOT_APPLICABLE`
3. Implement type-only contracts only when they require no new runtime dependency.
4. Implement runtime helper movement only when dependency direction is clean and tests prove parity.
5. Preserve app-local facades where they inject router, store, i18n, DOM, storage, window, browser, PrimeVue, or generated capabilities.
6. Add tests for migrated or normalized contracts and helpers.
7. Update public package exports and app imports only through approved package boundaries.
8. Record decisions, risks, validation results, and evidence under `docs/ai-plan` and `docs/ai-runs`.

## Non-functional requirements

- Type-safe TypeScript.
- Vue 3 Composition API compatibility.
- No unnecessary dependencies.
- No manifest or lockfile changes unless explicitly approved.
- No generated drift unless produced by owning generators.
- No degraded web-demo or desktop behavior.
- No weakened governance, architecture, runtime, or AI guard checks.
- Clear rollback path per milestone.

## Technical constraints

- The repository is a pnpm workspace with apps under `apps/*` and packages under `packages/*`.
- Known scripts include type checking, linting, test, build, governance, runtime, boundary, and guard commands. Exact availability must be inspected before execution.
- `@ccd/contracts` must remain runtime-neutral unless a separate approved decision changes this.
- Existing package owner boundaries must be respected.
- Existing generated files must be updated only by their owning generators.

## Compatibility constraints

- Keep existing import compatibility where app facades exist for historical app paths.
- Preserve route names, route meta semantics, menu filtering semantics, and redirect safety behavior.
- Preserve system preference sync payload shape unless explicitly versioned.
- Preserve persisted state compatibility or provide migration logic with tests.
- Preserve web-demo and desktop behavior.

## Performance expectations

- No measurable increase in startup, route navigation, layout, or theme/size update cost.
- No unnecessary runtime dependencies in packages.
- No bundle-size regression without explicit explanation and approval.
- Keep tree-shaking-friendly exports where possible.

## Security expectations

- Preserve and test safe redirect rejection behavior.
- Preserve role/auth logic semantics.
- Do not weaken HTTP, auth, token refresh, storage, crypto, or sync boundaries.
- Do not expose secrets or credentials in logs.
- Do not access external services without approval.

## Accessibility expectations

This work is mostly architecture and contracts. If UI behavior changes are introduced by theme/size or PrimeVue-related work, run visual, responsive, keyboard, and accessibility smoke checks for affected screens.

## Data and privacy expectations

- No production data access.
- No database migrations.
- No credential handling.
- Local persisted storage migrations must preserve user data where applicable and must be reversible or explicitly documented.

## External integrations

No external integrations are required for the base plan. GitHub, CI, cloud services, package registries, deployment systems, and private APIs require explicit approval before access or mutation.

## Dependencies

No dependency additions, removals, replacements, or upgrades are approved by default. Any manifest or lockfile change must stop for approval and record a decision.

## Acceptance criteria

1. Route/menu/access type contracts are explicit or a precise blocked decision is recorded.
2. Safe pure helpers are migrated to the correct governed package, or each non-migration is justified.
3. API/DTO response contract naming is unambiguous and type contracts are package-owned where safe.
4. System preference type contracts are split from app-local schema/runtime ownership where safe.
5. Sync and build config owner decisions are recorded; no unauthorized package creation occurs.
6. Stores, UI plugin shells, SafeStorage, DateUtils, HTTP runtime, generated registries, and route views are either unchanged or explicitly justified.
7. Guard coverage prevents recurrence of the key issues.
8. Required validation matrix passes or final status is blocked with precise evidence.
9. Final artifacts are complete and internally consistent.

## Definition of done

The project is done when all milestones are `DONE`, `DEFERRED`, `NOT_APPLICABLE`, or `BLOCKED` with evidence; final validation is complete; final artifacts are produced; risks are updated; and the final go/no-go decision is recorded.
