# M5 Validation Summary

| Command | Log | Result | Notes |
| --- | --- | --- | --- |
| `pnpm ai:guard -- --format=json` | `command-logs/pnpm-ai-guard-format-json.log` | PASS | `ok: true`, no findings. |
| `pnpm --filter @ccd/vue-ui test` | `command-logs/pnpm-filter-vue-ui-test.log` | PASS | 9 files, 21 tests passed. |
| `pnpm --filter @ccd/vue-primevue-adapter build` | `command-logs/pnpm-filter-vue-primevue-adapter-build.log` | PASS | TypeScript build passed. |
| `pnpm --filter @ccd/web-demo test` | `command-logs/pnpm-filter-web-demo-test.log` | PASS | 48 files, 339 tests passed. |
| `pnpm build:web-demo` | `command-logs/pnpm-build-web-demo.log` | PASS | Web demo build completed. |
| `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts` | `command-logs/pnpm-prettier-auto-imports.log` | PASS | Generated auto-imports normalized. |
| `git diff -- apps/web-demo/src/types/auto-imports.d.ts` | `command-logs/post-prettier-auto-imports-diff.log` | PASS | Empty diff after prettier normalization. |
| `git diff --check` | `command-logs/git-diff-check.log` | PASS | No whitespace errors. |
| `pnpm docs:commands` | `command-logs/pnpm-docs-commands.log` | PASS | 390 documentation files scanned. |
| `pnpm validate:governance` | `command-logs/pnpm-validate-governance.log` | PASS | Unified governance gate passed. |

## Generated artifact note

`pnpm build:web-demo` left a formatting-only diff in
`apps/web-demo/src/types/auto-imports.d.ts`. The diff was recorded in
`command-logs/post-build-auto-imports-generated-diff.log`, normalized with
`pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts`, and
verified empty with `command-logs/post-prettier-auto-imports-diff.log`.
