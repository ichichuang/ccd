# HTTP-001 Contracts Implementation

## Scope

- Baseline: `main` at `d618e1a815c7bba51c74cd9354e8dffacf75df34`.
- Implemented only type-level HTTP contracts under `packages/contracts/src/http/**`.
- Exported the new HTTP contract types from `packages/contracts/src/index.ts`.
- Did not implement `packages/core/src/http/**`.
- Did not move or modify `apps/web-demo/src/utils/http/**`.
- Did not change runtime HTTP behavior, dependencies, Vite config, GitHub remote, `.github/**`, auth flow, Login Diorama, P4 implementation, or app runtime code.

## Contract Files

- `packages/contracts/src/http/auth.ts`
- `packages/contracts/src/http/error.ts`
- `packages/contracts/src/http/request.ts`
- `packages/contracts/src/http/response.ts`
- `packages/contracts/src/http/retry.ts`
- `packages/contracts/src/http/timeout.ts`
- `packages/contracts/src/http/transport.ts`
- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/index.ts`

## Validation Evidence

- `command-logs/01-pnpm-filter-contracts-build.log`
- `command-logs/02-pnpm-filter-contracts-type-check.log`
- `command-logs/03-pnpm-api-report.log`
- `command-logs/04-pnpm-arch-runtime.log`
- `command-logs/05-pnpm-validate-governance.log`
- `command-logs/05b-pnpm-validate-governance-rerun.log`
- `command-logs/06-pnpm-type-check.log`
- `command-logs/07-pnpm-test-run.log`
- `command-logs/08-pnpm-docs-commands.log`
- `command-logs/09-pnpm-ai-doctor.log`
- `command-logs/10-pnpm-codex-preflight.log`
- `command-logs/11-forbidden-runtime-token-scan.log`

## Notes

- The first `pnpm validate:governance` run failed only because `api:report` generated an updated API surface report for the new exports. The rerun passed after generated artifacts were synchronized by the official command.
- No contracts package tests were added because `packages/contracts/tsconfig.json` includes `src/**/*.ts`; adding Vitest specs there would compile test files into package output without a tooling change.
