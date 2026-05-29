# HTTP-003 App HTTP Infra Path

Status: DONE

Boundary:
- Kept `apps/web-demo/src/utils/http/**` as the current app-local HTTP infra path to avoid broad import churn.
- Did not move alova/browser/fetch runtime into contracts or core.
- Added policy modules inside the app HTTP infra path under HTTP-004.

Validation:
- PASS `pnpm arch:runtime`
- PASS `pnpm --filter @ccd/web-demo type-check`
- PASS HTTP focused Vitest

Evidence:
- `command-logs/HTTP-002-003-*-arch-runtime.log`
- `command-logs/HTTP-003-004-*-web-demo-type-check-rerun.log`
- `command-logs/HTTP-004-*-http-vitest.log`

Residual risk:
- Long-term relocation to `apps/web-demo/src/adapters/http/**` should wait until HTTP contracts/policy decisions are approved.
