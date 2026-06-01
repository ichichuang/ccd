# Validation Summary — P20

All required gates passed (2026-06-01).

| Command | Result |
|---|---|
| `git diff --check` | pass |
| `pnpm docs:commands` | pass (283 files) |
| `pnpm project:doctor` | pass |
| `pnpm ai:doctor` | pass |
| `pnpm ai:doctor --open` | pass (78 open, owner-accepted) |
| `pnpm codex:preflight` | pass |
| `pnpm arch:runtime` | pass |
| `pnpm arch:boundaries` | pass |
| `pnpm api:report` | pass (generated outputs not staged) |
| `pnpm ai:guard -- --format=json` | pass |
| `pnpm validate:governance` | pass |
| `pnpm --filter @ccd/vue-primevue-adapter build` | pass |
| `pnpm --filter @ccd/vue-ui test` | pass (20 tests, incl. CcdTag) |
| `pnpm --filter @ccd/web-demo type-check` | pass |
| `pnpm --filter @ccd/web-demo test` | pass (339 tests) |
| `pnpm type-check` | pass |
| `pnpm test:run` | pass (456 tests) |
| `pnpm build:web-demo` | pass |
| `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts` | pass |
| `git diff -- apps/web-demo/src/types/auto-imports.d.ts` | empty |
| `pnpm build:desktop` | pass |

Logs: `command-logs/`

## Final status

- Architecture status: `CONDITIONAL_GO`
- P20 lane status: `P20_C06_RESIDUAL_ALLOWLIST_REDUCED`
- Full GO: not authorized
- Push: not performed
