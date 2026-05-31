# M7a CWD Path Failure Diagnosis

## Diagnosis Table

| failing_command | failing_spec | failing_path | current_cwd | expected_repo_root | expected_package_root | path_construction_source | reason_for_duplicate_apps_web_demo | candidate_fix | source_behavior_changed | related_issue_ids |
|---|---|---|---|---|---|---|---|---|---|---|
| `pnpm --filter @ccd/web-demo test` | `apps/web-demo/src/utils/http/requestLayer.spec.ts` | `/Users/cc/MyPorject/ccd/apps/web-demo/apps/web-demo/src/utils/http` | `/Users/cc/MyPorject/ccd/apps/web-demo` | `/Users/cc/MyPorject/ccd` | `/Users/cc/MyPorject/ccd/apps/web-demo` | `const repoRoot = process.cwd()` plus `path.join(repoRoot, 'apps/web-demo/src/utils/http')` | Filtered pnpm scripts run from the package directory, not the repository root, so the hardcoded `apps/web-demo` segment was appended to an already package-local cwd. | Derive `webDemoRoot` from `import.meta.url`, then derive `repoRoot` from `webDemoRoot`; scan `src/**` paths from the package root and keep relative violation reporting against repo root. | no | M7 validation closure; D-10 test boundary evidence |

## Root Cause

`requestLayer.spec.ts` used `process.cwd()` as if it were always the repository root. That assumption is valid for root `pnpm test:run`, but false for `pnpm --filter @ccd/web-demo test`, where pnpm executes the package script from `apps/web-demo`.

## Fix

The spec now derives stable paths from the test file URL:

- `currentFileDir = path.dirname(fileURLToPath(import.meta.url))`
- `webDemoRoot = path.resolve(currentFileDir, '../../..')`
- `repoRoot = path.resolve(webDemoRoot, '../..')`

The source scan paths now use `webDemoRoot`, while violation messages still use `path.relative(repoRoot, file)` so assertion output remains repository-relative.

## Scope Guard

Only test path resolution changed. HTTP runtime behavior, auth behavior, retry behavior, API adapter behavior, safeStorage behavior, package manifests, and lockfile were not changed.
