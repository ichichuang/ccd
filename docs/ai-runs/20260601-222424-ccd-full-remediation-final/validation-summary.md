# Final Validation Summary

All required final validation commands exited 0. Raw command output and exit codes are in `command-logs/` and `validation-summary.tsv`.

## Required Matrix

| Command                                                                | Result |
| ---------------------------------------------------------------------- | ------ |
| `git diff --check`                                                     | PASS   |
| `pnpm docs:commands`                                                   | PASS   |
| `pnpm project:doctor`                                                  | PASS   |
| `pnpm ai:doctor`                                                       | PASS   |
| `pnpm ai:doctor --open`                                                | PASS   |
| `pnpm codex:preflight`                                                 | PASS   |
| `pnpm ci:prepare-internal`                                             | PASS   |
| `pnpm ci:smoke:packages`                                               | PASS   |
| `pnpm arch:runtime`                                                    | PASS   |
| `pnpm arch:boundaries`                                                 | PASS   |
| `pnpm api:report`                                                      | PASS   |
| `pnpm ai:guard -- --format=json`                                       | PASS   |
| `pnpm validate:governance`                                             | PASS   |
| `pnpm type-check`                                                      | PASS   |
| `pnpm test:run`                                                        | PASS   |
| `pnpm --filter @ccd/web-demo test`                                     | PASS   |
| `pnpm build:web-demo`                                                  | PASS   |
| `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts` | PASS   |
| `git diff --exit-code -- apps/web-demo/src/types/auto-imports.d.ts`    | PASS   |
| `pnpm build:desktop`                                                   | PASS   |

## Supplemental Checks

| Command / method                                    | Result |
| --------------------------------------------------- | ------ |
| `pnpm drift-check`                                  | PASS   |
| `git status --short --branch --untracked-files=all` | PASS   |
| Preview server + unauthenticated screenshot         | PASS   |
| Authenticated Playwright PrimeVue route smoke       | PASS   |
