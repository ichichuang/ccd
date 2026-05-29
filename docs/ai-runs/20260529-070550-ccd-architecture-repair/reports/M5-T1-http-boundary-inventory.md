# M5-T1 HTTP Boundary Inventory

## Scope

- Target tasks: `P1-HttpContract-*`
- Target areas:
  - `packages/contracts/src/**`
  - `packages/core/src/**`
  - `apps/web-demo/src/adapters/**`
  - `apps/web-demo/src/utils/http/**`
  - `apps/web-demo/src/api/**`
- Evidence: `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-T1-20260529-075115-http-boundary-inventory.log`

## Boundary map

| Layer | Current files | Finding |
|---|---|---|
| Contracts | `packages/contracts/src/network.ts` | Runtime-neutral generic `NetworkClient`, `NetworkRequest`, and `NetworkResponse` exist. No `packages/contracts/src/http/**` directory exists. |
| Core | `packages/core/src/index.ts` | No HTTP orchestration currently exists in core. Core remains runtime-neutral. |
| App adapter | `apps/web-demo/src/adapters/http.adapter.ts` | Owns Zod payload parsing and backend route shape validation. |
| App HTTP infrastructure | `apps/web-demo/src/utils/http/**` | Owns alova instance, request methods, interceptors, errors, validation, connection, and upload/download helpers. Existing rules explicitly name this path as approved infrastructure. |
| API modules | `apps/web-demo/src/api/**` | Mix of mock APIs, direct method wrappers (`get/post/put/del`), and alova Method builders used by `useHttpRequest`. |
| Consumers | `apps/web-demo/src/hooks/**`, `views/**`, `components/**` | Preferred request-state path is `useHttpRequest` for Method builders; some demo/app surfaces call API wrapper functions directly. |

## Request/runtime findings

- Alova is still the primary request toolkit via `apps/web-demo/src/utils/http/instance.ts`.
- `beforeRequest` injects CSRF/signature/auth headers and reads auth through `@/infra/auth/tokenProvider`, not Pinia.
- `responseHandler` owns HTTP status handling, 401 refresh/retry, global notification, response unwrap/decryption, and Zod response schema validation.
- `apps/web-demo/src/utils/http/methods.ts` owns `get`, `post`, `put`, `del`, `patch`, `head`, upload, download, retry, cache, deduplication, cancellation, and raw-header `getRaw`.
- No direct `@/stores`, `pinia`, `@/router`, `vue-router`, `localStorage`, or `sessionStorage` import was found in `utils/http`, `adapters/http.adapter.ts`, or `api/**` outside tests.
- Raw `fetch` exists in approved/infrastructure-like surfaces:
  - `utils/http/interceptors.ts#defaultRefreshTokenExecutor`
  - `utils/http/methods.ts#getRaw`
  - `utils/http/connection.ts#performHealthCheck`
- Raw `fetch` also exists outside the HTTP lane in `LoadingLottie.vue` and `utils/date/timezone.ts`; those are not changed in M5 and should be handled by a later guard/policy lane if needed.

## Zod boundary findings

- `parseZodHttpPayload()` is centralized in `apps/web-demo/src/adapters/http.adapter.ts`.
- `responseSchema` is supported by `RequestConfig` and consumed in both alova response handling and `getRaw`.
- Stable schema examples already exist in `api/example/users.ts`, `api/system/system.api.ts`, `api/auth/auth.api.ts`, `api/example/todos.ts`, and `api/example/httpAdvanced.ts`.
- No blanket schema migration is justified in this lane.

## Contract/core proposal

- Do not add `packages/contracts/src/http/**` without operator approval.
- Existing `packages/contracts/src/network.ts` can remain the runtime-neutral low-level contract for now.
- A future approved contract lane may add explicit request config, retry, timeout, error, auth, and response policy types under `packages/contracts/src/http/**`, provided they do not import browser APIs, fetch, timers, storage, router, Pinia, alova, or Zod runtime values.
- No `packages/core/src/http/**` orchestration is needed based on current inventory; adding one now would be speculative.

## Blockers

- Contract edits under `packages/contracts/src/http/**` require explicit operator approval.
- Moving `apps/web-demo/src/utils/http/**` to `apps/web-demo/src/adapters/http/**` would be a broad import-path migration and conflicts with existing canonical HTTP rules naming `@/utils/http/**`; do not do it in this lane without approval.
