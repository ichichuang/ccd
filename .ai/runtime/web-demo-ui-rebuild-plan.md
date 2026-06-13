# Web Demo Architecture Console Rebuild Plan

Status: active lane tracked by `.ai/runtime/repair_list.md`.

## Evidence

- Route inventory: `wiki/generated/web-demo-ui-inventory.md`
- Current route spec baseline: `apps/web-demo/src/router/modules/example.spec.ts`
- Current counts: 99 `/example` route records, 100 static business route records, 106 registered route records.
- Current view burden: 89 Vue files under `apps/web-demo/src/views/example`.

## Target

Replace the legacy `/example` museum with a focused CCD Architecture Console:

- `/dashboard`: Architecture Control Center.
- `/architecture`: topology, packages, runtime boundaries, governance.
- `/runtime`: HTTP/alova, safeStorage, browser runtime, state/runtime ownership.
- `/ui`: PrimeVue adapter, ProForm, ProTable, charts, feedback.
- `/system`: theme, size/breakpoints, layout, UnoCSS.
- `/desktop`: read-only desktop/Tauri boundary mirror.

## Implementation Rules

- Keep all new shells app-local under `apps/web-demo/src/views/architecture-console/**`.
- Preserve `main.ts`, `App.vue`, router infrastructure, stores, HTTP runtime, safeStorage runtime, layout runtime, and login behavior unless a tiny compatibility adaptation is required.
- Delete old `/example` router/view files only after new routes, i18n, route smoke tests, and focused build checks pass.
- Keep P4 strategic guardrails visible and untouched.

## Validation Ladder

1. Focused route/i18n tests.
2. Focused web-demo type-check.
3. `pnpm ai:guard`.
4. Wiki refresh/validate/commands after wiki updates.
5. Final full validation ladder requested by the lane before PR.
