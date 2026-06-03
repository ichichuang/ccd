# M3 Implementation Report

## Status

Local validation: `PASS`

Full validation ladder: pending.

## Contract Changes

Added type-only contract:

- `BackendApiResponseEnvelope<TData>` in `packages/contracts/src/http/response.ts`

Exported through:

- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/index.ts`

No Zod, Alova, DOM, browser, app alias, or runtime imports were added to `@ccd/contracts`.

## App Naming Changes

| Old name | New name | Owner |
| --- | --- | --- |
| Backend `ApiResponse<T>` | `BackendApiResponseEnvelope<TData>` | `@ccd/contracts` |
| HTTP runtime `ApiResponse<T>` | `HttpClientResponseEnvelope<T>` | app HTTP runtime |
| Transport `HttpResponseEnvelope<TData, TMetadata>` | unchanged | `@ccd/contracts` |

`apps/web-demo/src/types/api.ts` now re-exports the package-owned backend envelope type. App HTTP runtime types remain app-owned.

## Runtime Boundaries Preserved

No app HTTP runtime, Alova instance, interceptors, auth refresh, notification policy, upload manager, Zod response schemas, browser download/upload runtime, generated registry, dependency manifest, or package manifest was moved or changed.

## Guard Update

`scripts/ai-architecture-guard.mjs` now rejects ambiguous `ApiResponse` definitions in:

- `apps/web-demo/src/types/api.ts`
- `apps/web-demo/src/utils/http/types.ts`

This is deterministic hardening scoped to M3 response contract drift prevention.

## Local Validation

| Command | Result | Evidence |
| --- | --- | --- |
| `rg "\\bApiResponse\\b" apps packages scripts` | PASS | `command-logs/m3-rg-apiresponse-after-cleanup.log` |
| `pnpm --filter @ccd/contracts type-check` | PASS | `command-logs/m3-focused-contracts-type-check-initial.log` |
| `pnpm --filter @ccd/contracts build` | PASS | `command-logs/m3-focused-contracts-build-before-web-demo-rerun.log` |
| `pnpm --filter @ccd/web-demo type-check` | FAIL_THEN_PASS | `command-logs/m3-focused-web-demo-type-check-initial.log`, `command-logs/m3-focused-web-demo-type-check-rerun-after-contracts-build.log` |
| `pnpm exec vitest --root . run apps/web-demo/src/api/example/users.spec.ts apps/web-demo/src/utils/http/requestLayer.spec.ts` | PASS | `command-logs/m3-focused-api-tests-initial.log` |
| Focused `pnpm ai:guard` check | PASS | `command-logs/m3-focused-ai-guard-api-response-name.log` |

The initial web-demo type-check failed because `@ccd/contracts` package `dist` did not yet include the new export. After the allowed contracts build, the rerun passed.
