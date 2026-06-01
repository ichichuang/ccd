# Validation Summary

## Baseline

- `git diff --check`: pass
- `pnpm validate:governance`: expected fail before sync; changed only `docs/generated/api-surface-report.{md,json}`

## Sync And Stability

- `pnpm api:report`: pass
- `pnpm validate:governance`: pass
- second `pnpm validate:governance`: pass

## Final Validation Matrix

- `git diff --check`: pass
- `pnpm docs:commands`: pass
- `pnpm ai:doctor`: pass
- `pnpm ai:doctor --open`: pass, 78 open tasks
- `pnpm ai:guard -- --format=json`: pass
- `pnpm api:report`: pass
- `pnpm validate:governance`: pass
- `pnpm type-check`: pass
- `pnpm test:run`: pass, 81 files / 456 tests
- `pnpm build:web-demo`: pass
- `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts`: pass
- `git diff -- apps/web-demo/src/types/auto-imports.d.ts`: empty
- `pnpm build:desktop`: pass

## Final Dirty Scope

The final dirty tree is limited to:

- `docs/generated/api-surface-report.md`
- `docs/generated/api-surface-report.json`
- `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`
- `docs/ai-plan/FINAL_GO_NO_GO.md`
- `docs/ai-plan/STATUS.md`
- `docs/ai-runs/20260601-164744-ccd-p21a-api-surface-generated-sync-after-ccdtag/**`

