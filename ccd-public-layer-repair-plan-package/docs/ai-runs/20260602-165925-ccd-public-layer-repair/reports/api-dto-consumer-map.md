# M3-T01 API/DTO Consumer Map

## Status

Task status: `DONE`

This is a read-only audit. No source implementation files were changed.

## Evidence

- `command-logs/m3-api-response-consumer-rg.log`
- `command-logs/m3-api-response-file-summary.log`
- `command-logs/m3-api-response-definitions.log`
- `command-logs/m3-http-runtime-boundary-rg.log`

## Current Response Contract Definitions

| Path | Current name | Shape | Classification |
| --- | --- | --- | --- |
| `apps/web-demo/src/types/api.ts` | `ApiResponse<T>` | `{ code: number; message: string; data: T }` | Backend standard envelope candidate for `@ccd/contracts`. |
| `apps/web-demo/src/utils/http/types.ts` | `ApiResponse<T>` | `{ success: boolean; data?: T; message?: string; code?: number; total?: number; page?: number; pageSize?: number }` | HTTP client/app runtime response shape; ambiguous duplicate name. |
| `packages/contracts/src/http/response.ts` | `HttpResponseEnvelope<TData, TMetadata>` | `{ data: TData; metadata: TMetadata }` with transport metadata | Existing transport envelope; do not reuse this name for backend API envelope. |

## Consumer Groups

| Group | Files | Observed contracts | Ownership conclusion |
| --- | --- | --- | --- |
| Backend API modules | `apps/web-demo/src/api/example/users.ts`, `apps/web-demo/src/api/system/system.api.ts`, comments in `auth.api.ts` | `ApiResponse`, Zod `responseSchema`, DTO schemas | Backend response envelope can be type-only in `@ccd/contracts`; schemas stay app-owned. |
| HTTP runtime | `apps/web-demo/src/utils/http/**`, `apps/web-demo/src/hooks/modules/useHttpRequest.ts` | `RequestConfig`, `AlovaRequestConfig`, `responseSchema`, `ZodType`, Alova `Method` | App-owned HTTP runtime; do not move Alova/Zod runtime into contracts. |
| System route DTO | `apps/web-demo/src/types/dto/system.dto.ts` | `SystemAsyncRouteItem`, `SystemAsyncRoutesRawRes`, `ZodType<RouteMeta>` | Route payload type can later compose route contract; Zod schema and Vue Router `RouteMeta` remain app-owned. |
| Existing package HTTP contracts | `packages/contracts/src/http/**`, `packages/contracts/src/index.ts` | `HttpResponseEnvelope`, `HttpResponseMetadata` | Keep as transport metadata envelope; may add backend envelope alongside it. |
| ProTable package API config | `packages/vue-ui/src/ProTable/**` | local `RequestConfig`, `ProTableApiConfig` | This is package-local ProTable request config, not the app HTTP `RequestConfig`; avoid false-positive migration. |
| Examples/specs | `apps/web-demo/src/views/example/**`, `apps/web-demo/src/api/example/users.spec.ts`, HTTP specs | `ApiResponse`, `RequestConfig`, `ZodType`, `responseSchema` | Update only if source implementation renames contracts. |

## Key Findings

- Two incompatible `ApiResponse<T>` meanings exist in app-local surfaces.
- Existing `@ccd/contracts` already owns `HttpResponseEnvelope`, but that name means transport data plus metadata, not backend `{ code, message, data }`.
- Zod and Alova remain app HTTP runtime dependencies and should not enter `@ccd/contracts`.
- `RequestConfig` in `packages/vue-ui` is a package-local table request config, not a consumer of app HTTP runtime.

## Acceptance Criteria

- API/DTO response consumers mapped: PASS.
- Duplicate ambiguous naming identified: PASS.
- Runtime/schema boundaries distinguished from type-only contract candidates: PASS.
- M3 source implementation remains blocked by workspace approval gate: BLOCKED.
