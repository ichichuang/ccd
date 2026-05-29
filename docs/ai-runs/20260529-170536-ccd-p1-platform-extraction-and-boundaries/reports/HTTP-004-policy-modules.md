# HTTP-004 Policy Modules

Status: DONE

Boundary:
- Split app HTTP policy logic into `apps/web-demo/src/utils/http/policies/**`.
- Policies cover auth refresh, error mapping, notification, response decoding, and schema validation.
- Added focused unit tests for the policy modules.

Validation:
- PASS `pnpm exec vitest run apps/web-demo/src/utils/http`
- PASS `pnpm --filter @ccd/web-demo type-check`

Evidence:
- `command-logs/HTTP-004-*-http-vitest.log`
- `command-logs/HTTP-003-004-*-web-demo-type-check-rerun.log`

Residual risk:
- Product-specific 401/offline retry behavior remains blocked under HTTP-007.
