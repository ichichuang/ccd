# P23 — Future Owner Decision Menu (PROPOSED only)

- Date: 2026-06-01
- Lane: P23 conditional-go residual debt final review
- Status of every item below: **`PROPOSED`** — none are approved by this document.

This menu enumerates the only lanes that can further reduce CONDITIONAL_GO residual debt. Each requires an explicit owner/operator/product decision recorded in `.ai/runtime/owner_decisions.md` and `docs/ai-plan/DECISIONS.md` before any implementation. Listing here is **not** approval and does **not** change CONDITIONAL_GO, C-06, G-02, or M12.

> ID note: identifiers `D-020`–`D-024` are P23 decision-menu labels for the residual-debt closure lanes. `docs/ai-plan/DECISIONS.md` already uses heading IDs `D-019`/`D-020`/`D-021` for unrelated earlier decisions (M10 / M11 / M13a), so these P23 menu items are recorded in DECISIONS.md under a dedicated, non-colliding "P23 future owner decision menu" section that cross-references this file.

---

## D-020 — PrimeVue bootstrap install adapter lane (R1/R4)

- Status: `PROPOSED`
- Targets: C-06 rows R1 (`apps/desktop/src/plugins/index.ts`), R4 (`apps/web-demo/src/plugins/modules/primevue.ts`)
- Proposal: introduce an adapter-owned bootstrap API in `@ccd/vue-primevue-adapter` (e.g. `installPrimeVueRuntime`) that owns the `primevue/config` plugin install, then migrate both desktop and web plugin entrypoints to it, preserving locale, size-store coupling, and the `PRIME_DIALOG_RUNTIME_CONFIG_KEY` provide.
- Why owner-gated: adds a new public adapter bootstrap surface and is global install architecture (M6 Option C); both apps must migrate together to keep parity.
- Expected risk: high — desktop and web PrimeVue runtime install + dialog provide regression.
- Required validation if approved: `pnpm ai:guard -- --format=json`, `pnpm --filter @ccd/web-demo type-check/test`, `pnpm build:web-demo`, `pnpm build:desktop`, desktop smoke.
- Decision required from: owner.

## D-021 — PrimeVue build resolver / generated registry lane (R2/R5)

- Status: `PROPOSED`
- Targets: C-06 rows R2 (`apps/web-demo/build/plugins.ts`), R5 (`apps/web-demo/src/types/components.d.ts`)
- Proposal: move the `@primevue/auto-import-resolver` `PrimeVueResolver` into a governed build package or change the `unplugin-vue-components` resolver/registry so generated component types reference `@ccd/vue-ui`/adapter facades instead of raw `primevue/*`; regenerate `components.d.ts` from the new output.
- Why owner-gated: build-time resolver drives template auto-import and tree-shaking; the generated registry is tool-owned (manual edits forbidden). Byte-compatible output must be proven through a build/generator lane.
- Expected risk: high — build/auto-import/tree-shake regression and generated-typing drift.
- Required validation if approved: `drift-check`, `pnpm build:web-demo`, `components.d.ts` regen, `pnpm type-check`, `pnpm api:report`.
- Decision required from: operator (build toolchain) + owner.

## D-022 — AppPrimeVueGlobals global shell facade lane (R3)

- Status: `PROPOSED`
- Targets: C-06 row R3 (`apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`)
- Proposal: provide adapter/vue-ui global-shell facades for Toast / ConfirmPopup / DynamicDialog plus composable re-exports, preserving the six Toast groups, locale watch, route dialog reset, and `window.$toast` / `$message` behavior, then migrate the layout host off direct `primevue/*` imports.
- Why owner-gated: behavior-critical global overlay host; adapter currently wraps the APIs but not the host components.
- Expected risk: high — global toast/dialog/confirm UX regression across the app.
- Required validation if approved: visual smoke, `pnpm --filter @ccd/web-demo test`, e2e toast-group coverage, `pnpm ai:guard -- --format=json`.
- Decision required from: owner.

## D-023 — G-02 operator/product closure wave

- Status: `PROPOSED`
- Targets: all 78 open repair-ledger tasks (P1-Guard ×8, P2-Vite8 ×8, P2-Deps ×7, P2-GitHub ×2, P3-Login ×47, P4-Deferred ×6)
- Proposal: open separate owner/operator/product-approved lanes per task group — owner guard Decisions 2/3/4 + signoff (P1-Guard); isolated Vite 8 branch (P2-Vite8); single dependency lanes (P2-Deps); `.github/**` mutation approval (P2-GitHub); M11 product/operator approval + prerequisites (P3-Login); strategic owner decisions + desktop drift CI scope (P4) — each closing tasks only with implementation/decision evidence per repair-ledger closure rules 1–8.
- Why owner-gated: P22 confirmed zero tasks satisfy closure rules without external decisions or actual implementation evidence.
- Expected risk: medium-to-high depending on lane (toolchain/dependency/auth-product surfaces).
- Required validation if approved: lane-specific matrices plus `pnpm ai:doctor --open`, `pnpm validate:governance`, `git diff --check`.
- Decision required from: owner + operator + product (per group).

## D-024 — Showcase exception cleanup decision

- Status: `PROPOSED`
- Targets: D-017 Option D showcase exception (`apps/web-demo/src/views/example/components/primevue-collection/**`) and M12 slice E3
- Proposal: owner/product decides whether the PrimeVue showcase collection stays a permanent long-lived demo exception or is migrated/retired; if cleanup is chosen, define scope and validation for converting showcase imports.
- Why owner-gated: showcase is intentionally PrimeVue-facing demo content; cleanup vs. permanence is a product/owner call, not an architecture-safe auto-reduction.
- Expected risk: low-to-medium — demo-only surface, but broad file count.
- Required validation if approved: `pnpm ai:guard -- --format=json`, focused UI smoke for touched showcase pages.
- Decision required from: owner + product.

---

## Summary

| menu_id | lane | residual target | decision owner | status |
| --- | --- | --- | --- | --- |
| D-020 | bootstrap install adapter | C-06 R1/R4 | owner | PROPOSED |
| D-021 | build resolver / generated registry | C-06 R2/R5 | operator + owner | PROPOSED |
| D-022 | global shell facade | C-06 R3 | owner | PROPOSED |
| D-023 | G-02 closure wave | G-02 (78 tasks) | owner + operator + product | PROPOSED |
| D-024 | showcase exception cleanup | M12 E3 / showcase | owner + product | PROPOSED |

None of the above is approved. Until an owner/operator/product records a decision, CONDITIONAL_GO holds and full GO stays unauthorized.
