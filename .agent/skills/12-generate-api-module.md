# Skill 01: Generate API Module (New APIs land in src/api first)

## Goal

When the task involves "new API / backend integration / new request", implement it in **`src/api/<module>/<feature>.ts`** first (flat two-level structure), then consume it from hooks.

## Inputs (provide these)

- **module**: Business domain (e.g. `user` / `dashboard` / `system`)
- **feature**: Feature file name (e.g. `login` / `profile` / `list`)
- **HTTP**: method + url (whether `/api` prefix is needed depends on backend/proxy; usually relative path in service)
- **Params/response**: If you provide field structure, MUST add DTO types (NO `any`)
- **Auth**: Whether token/header is needed (if project interceptors already handle it, state "no extra handling needed")

## Pre-check (mandatory)

Read and follow:

- `@docs/ai-specs/PROJECT_PROTOCOL.md`
- `@docs/ai-specs/GOLDEN_SAMPLES/ApiModuleExample.ts` (API module definition example)
- `@.cursor/rules/12-api-layer.mdc` (flat structure + NO default export + NO generic export names)
- `@.cursor/rules/00-core-architecture.mdc` (NO fetch/axios, NO any)

## Task (what AI does)

1. Add/update the API definition in `src/api/<module>/<feature>.ts` (do NOT create any third-level directories)
2. In the same file:
   - Write DTO types first: `<Domain><Feature>Req/Res/DTO` (e.g. `UserLoginReq` / `UserLoginRes`)
   - Write Method builder: `build<Domain><Feature>Method(client, ...)`
   - Write convenience function (optional): `request<Domain><Feature>(...)` (MUST use Alova/`@/utils/http` internally)
3. Ensure export names do not pollute global namespace (AutoImport scans `src/api/**/*`)

## Output (required)

- Full content of modified `src/api/<module>/<feature>.ts` (or clear description of new exports/types)

## Non-goals (forbidden)

- FORBIDDEN: Adding URL/request building logic in views/components
- FORBIDDEN: `export default`
- FORBIDDEN: Generic export names: `get/list/data/request/config/params`, etc.
- FORBIDDEN: `fetch`/`axios`
- FORBIDDEN: `any`

## Validation Checklist (self-check)

- [ ] File path is `src/api/<module>/<feature>.ts`, no third-level directories
- [ ] No `export default`
- [ ] Export names have domain prefix (e.g. `buildUserLoginMethod` / `requestUserLogin`)
- [ ] DTO types are `UserLoginReq/UserLoginRes` (domain + feature prefix)
- [ ] Actual requests use Alova only (`alovaInstance`/`@/utils/http/*`), no fetch/axios

## Prompt Template (copy & use)

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md
Reference @docs/ai-specs/GOLDEN_SAMPLES/ApiModuleExample.ts
Follow @.cursor/rules/00-core-architecture.mdc and @.cursor/rules/12-api-layer.mdc

Task: Add new API (API module)

module = <module>
feature = <feature>

API:
- method: <GET|POST|PUT|DELETE|PATCH>
- url: <path>

In src/api/<module>/<feature>.ts:
1) Define DTO types: <Domain><Feature>Req / <Domain><Feature>Res (e.g. UserLoginReq/UserLoginRes)
2) Export build<Domain><Feature>Method(client, ...) (returns Method<T>)
3) Also export request<Domain><Feature>(...) convenience function (MUST use Alova/`@/utils/http` internally)

Forbidden:
- export default
- Generic export names (get/list/data/request/config/params)
```
