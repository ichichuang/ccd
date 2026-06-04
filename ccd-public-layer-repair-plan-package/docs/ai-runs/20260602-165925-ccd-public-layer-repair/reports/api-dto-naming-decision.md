# M3-T02 API/DTO Naming Decision

## Status

Task status: `DONE`

This is a naming/design artifact. No source implementation files were changed.

## Decision

Use explicit response envelope names:

- `BackendApiResponseEnvelope<TData>` for backend standard responses shaped as `{ code: number; message: string; data: TData }`.
- `HttpClientResponseEnvelope<TData>` for the app HTTP client response shape currently declared in `apps/web-demo/src/utils/http/types.ts` with `success`, optional `data`, optional paging, and optional `code/message`.
- Keep existing `HttpResponseEnvelope<TData, TMetadata>` in `@ccd/contracts` unchanged for transport response data plus metadata.

## Recommended M3-T03 Source Lane

After source approval:

1. Add `BackendApiResponseEnvelope<TData>` to `packages/contracts/src/http/response.ts` or a nearby type-only contract file.
2. Export it through `packages/contracts/src/http/index.ts` and `packages/contracts/src/index.ts`.
3. Rename app backend API imports from `ApiResponse` to `BackendApiResponseEnvelope`.
4. Rename app HTTP runtime `ApiResponse` to `HttpClientResponseEnvelope`.
5. Keep app-local deprecated aliases only if needed to avoid broad churn, and remove ambiguity from new code.

## Rejected Names

| Name | Reason rejected |
| --- | --- |
| `ApiResponse` | Already ambiguous and currently maps to incompatible shapes. |
| `HttpResponseEnvelope` for backend `{ code, message, data }` | Existing `@ccd/contracts` type already uses this name for transport metadata envelope. |
| `BackendResponseEnvelope` | Acceptable but less explicit than `BackendApiResponseEnvelope` in this repo, where HTTP transport envelopes already exist. |
| `ApiResult` | Too vague and does not encode backend/client distinction. |

## Boundaries

- Do not move Alova instance, methods, interceptors, auth refresh, notifications, upload/download runtime, or Zod schemas.
- Do not add Zod to `@ccd/contracts`.
- Do not edit manifests or lockfiles.
- Do not change runtime response unwrapping semantics.

## Validation Requirements For M3-T03/M3-T04

- `pnpm --filter @ccd/contracts type-check`
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm type-check`
- `pnpm lint:check`
- `pnpm test:run` or targeted API/HTTP tests if source imports change
- Search evidence that incompatible duplicate `ApiResponse` definitions no longer remain in active app source, or are explicitly deprecated compatibility aliases.

## Current Blocker

M3 source implementation is blocked until the operator approves continuing source changes in the dirty `main` working tree or provides an isolated worktree.
