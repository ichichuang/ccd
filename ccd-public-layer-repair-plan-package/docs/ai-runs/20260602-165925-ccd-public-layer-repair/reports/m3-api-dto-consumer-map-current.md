# M3 API/DTO Consumer Map Current

## Status

`DONE`

## Definitions Found

| Path | Current name | Shape | M3 action |
| --- | --- | --- | --- |
| `apps/web-demo/src/types/api.ts` | `ApiResponse<T>` | `{ code: number; message: string; data: T }` | Replace with type-only `BackendApiResponseEnvelope<TData>` owned by `@ccd/contracts`. |
| `apps/web-demo/src/utils/http/types.ts` | `ApiResponse<T>` | `{ success: boolean; data?: T; message?: string; code?: number; total?: number; page?: number; pageSize?: number }` | Rename to app-owned `HttpClientResponseEnvelope<TData>`. |
| `packages/contracts/src/http/response.ts` | `HttpResponseEnvelope<TData, TMetadata>` | `{ data: TData; metadata: TMetadata }` | Keep unchanged as transport metadata envelope. |

## Consumer Groups

| Group | Files | M3 action |
| --- | --- | --- |
| Backend API module example | `apps/web-demo/src/api/example/users.ts`, `.spec.ts` | Use `BackendApiResponseEnvelope<TData>` for backend `{ code, message, data }` envelopes; keep Zod schemas app-owned. |
| Backend response comments/examples | `apps/web-demo/src/api/auth/auth.api.ts`, `apps/web-demo/src/api/system/system.api.ts`, `apps/web-demo/src/views/example/common/types.vue` | Rename explanatory text/snippets to explicit envelope names. |
| HTTP runtime config/types | `apps/web-demo/src/utils/http/types.ts`, `apps/web-demo/src/utils/http/**` | Keep runtime app-owned; rename ambiguous response interface only. |
| Contracts | `packages/contracts/src/http/**`, `packages/contracts/src/index.ts` | Add type-only backend envelope export without Zod, Alova, DOM, browser, or app imports. |
| Guard | `scripts/ai-architecture-guard.mjs` | Add deterministic duplicate-name guard scoped to the known app response type locations. |

## Boundaries

- Zod schemas remain app-local.
- Alova instance, request methods, interceptors, auth refresh, notification policy, upload/download runtime, browser APIs, and HTTP runtime behavior remain app-owned.
- No package manifest, dependency manifest, lockfile, new package, or production config change is required.

## Evidence

- `command-logs/m3-read-api-http-type-surfaces.log`
- `command-logs/m3-rg-api-response-consumers.log`
- `command-logs/m3-read-api-users-and-examples.log`
- `command-logs/m3-rg-apiresponse-active-source.log`
