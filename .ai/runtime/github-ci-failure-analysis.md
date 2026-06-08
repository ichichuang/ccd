# GitHub CI Failure Analysis

## 1. Baseline

- Repository: `ichichuang/ccd`
- Branch: `main`
- Initial `git status --short`: `?? .ai/runtime/github-ci-failure-analysis.md`
- Local `HEAD`: `ae02e2a275c7ca03a99c801b2f7b8da70e5beb5f`
- Initial `origin/main`: `ae02e2a275c7ca03a99c801b2f7b8da70e5beb5f`
- Post-`git fetch origin` `origin/main`: `ae02e2a275c7ca03a99c801b2f7b8da70e5beb5f`
- `origin/main...HEAD`: `0 0`
- Remote: `origin git@github.com:ichichuang/ccd.git`
- `gh auth status`: authenticated as `ichichuang`; token value was redacted by `gh`.
- Local runtime observed by `pnpm validate`: Node `v24.11.1`, pnpm `10.28.2`, Turbo `2.9.14`.

The failures are on pushed `origin/main`, not local-only residue. The latest failing `headSha` is `ae02e2a275c7ca03a99c801b2f7b8da70e5beb5f`.

## 2. Failing Check Summary

| Check                                    |        Run ID |        Job ID | Workflow file                  | Job            | Failing step              | Exact failed command                        | Classification                                                 |
| ---------------------------------------- | ------------: | ------------: | ------------------------------ | -------------- | ------------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| `CI Guardian / Core Quality (push)`      | `27111873632` | `80011231332` | `.github/workflows/ci.yml`     | `Core Quality` | `Unit Tests`              | `bash scripts/exec.sh pnpm test:run`        | flaky or timeout / environment difference between local and CI |
| `CI Guardian / E2E QA (push)`            | `27111873632` | `80011231330` | `.github/workflows/ci.yml`     | `E2E QA`       | `Run Playwright QA suite` | `bash scripts/exec.sh pnpm e2e:qa:prepared` | repository-code failure                                        |
| `Deploy to GitHub Pages / build (push)`  | `27111873693` | `80011231341` | `.github/workflows/deploy.yml` | `build`        | `Unit Tests`              | `bash scripts/exec.sh pnpm test:run`        | downstream duplicate of unit timeout                           |
| `Deploy to GitHub Pages / deploy (push)` | `27111873693` | `80011368461` | `.github/workflows/deploy.yml` | `deploy`       | none; job skipped         | none                                        | downstream failure caused by failed `build` job                |

Dependency context:

- Check-runs API for `ae02e2a275c7ca03a99c801b2f7b8da70e5beb5f` returned failed `Core Quality`, failed `E2E QA`, failed Pages `build`, and skipped Pages `deploy`.
- Vercel commit status for the same SHA was successful, so install/deploy dependency context outside GitHub Actions did not indicate a package resolution failure.
- GitHub Actions install/cache steps completed before the failing commands. No missing secret, permission, or cache failure was found.

## 3. Per-Failure Evidence And Root Cause

### CI Guardian / Core Quality

- Run URL: `https://github.com/ichichuang/ccd/actions/runs/27111873632`
- Job URL: `https://github.com/ichichuang/ccd/actions/runs/27111873632/job/80011231332`
- Workflow definition: `.github/workflows/ci.yml` runs `bash scripts/exec.sh pnpm test:run` in `Core Quality`.
- Package script: `test:run` runs package builds, then `vitest run`.
- Annotation: `apps/web-demo/src/router/modules/example.spec.ts:402` timed out after Vitest's default `5000ms`.
- First relevant error excerpt: `web-demo route module smoke coverage > resolves every lazy component import target` failed with `Error: Test timed out in 5000ms`.
- Final error excerpt: `Test Files 1 failed | 101 passed (102)`, `Tests 1 failed | 545 passed (546)`, `[FAIL] command: pnpm test:run`.

Root cause:

- The route smoke test resolved every lazy route component import with one unbounded `Promise.all`.
- CI had enough transform/import pressure for that single test to exceed the default 5s Vitest timeout.
- Route coverage itself was valid and should not be removed. The repair keeps the full route inventory, lazy import/default export, redirect, metadata, locale, and nested-helper non-registration coverage, but resolves lazy components in bounded batches and gives only that heavy smoke assertion a 20s ceiling.

Local reproducibility:

- The timeout did not reproduce locally before the patch, which matches the CI-only timeout classification.
- It was still safe to reproduce the exact failing surface locally with the route spec and then the full `pnpm test:run`.

Repair label:

- `stabilize-route-lazy-import-smoke-test-ci-timeout`

### CI Guardian / E2E QA

- Run URL: `https://github.com/ichichuang/ccd/actions/runs/27111873632`
- Job URL: `https://github.com/ichichuang/ccd/actions/runs/27111873632/job/80011231330`
- Workflow definition: `.github/workflows/ci.yml` runs `bash scripts/exec.sh pnpm e2e:qa:prepared`.
- Package script: `e2e:qa:prepared` runs smoke, perf, layout, and visual Playwright suites.
- First relevant error excerpt: `e2e/layout-runtime-geometry.spec.ts:787:3` failed in `deep business route refresh does not expose not-found title during stabilization`.
- Received title probe evidence: `["", "页面未找到 - CCD", "仪表盘 - CCD", "仪表盘 - CCD"]`.
- Final error excerpt: `1 failed`, `20 passed`, `[FAIL] command: pnpm e2e:qa:prepared`.

Root cause:

- During authenticated dashboard reload, Vue Router initially resolves `#/dashboard` through the catch-all redirect to `/404` before static business routes are registered.
- The title updater deferred `/404` only while dynamic routes were not loaded. Once route state flipped to loaded, the same redirected `/404` could write the not-found title before app boot handoff completed.
- The deferred title source also allowed catch-all/not-found metadata to be reused as if it were the intended business route title source.
- The fix ignores catch-all/not-found redirected title sources and continues deferring a redirected `/404` while the app is not ready, but only when the redirected path is already known in the registered static route inventory. This keeps real unknown routes resolving to the not-found title.

Local reproducibility:

- Reproduced before the fix with the same title probe sequence as CI.
- After the fix, the targeted title-stabilization Playwright test passes, and the adjacent real-unknown-route title test passes inside the full layout suite.

Repair label:

- `fix-dashboard-reload-title-stabilization`

### Deploy to GitHub Pages / build

- Run URL: `https://github.com/ichichuang/ccd/actions/runs/27111873693`
- Job URL: `https://github.com/ichichuang/ccd/actions/runs/27111873693/job/80011231341`
- Workflow definition: `.github/workflows/deploy.yml` runs `bash scripts/exec.sh pnpm test:run` before Pages build/upload.
- Failing step: `Unit Tests`.
- Exact failed command: `bash scripts/exec.sh pnpm test:run`.
- Annotation: `apps/web-demo/src/router/modules/example.spec.ts:402` timed out after `5000ms`.

Root cause:

- Same route smoke test timeout as `CI Guardian / Core Quality`.
- Pages build did not reach the Pages-specific build, setup, upload, or deploy steps.

Repair label:

- `stabilize-route-lazy-import-smoke-test-ci-timeout`

### Deploy to GitHub Pages / deploy

- Run URL: `https://github.com/ichichuang/ccd/actions/runs/27111873693`
- Job URL: `https://github.com/ichichuang/ccd/actions/runs/27111873693/job/80011368461`
- Workflow definition: `.github/workflows/deploy.yml` sets `deploy` with `needs: build`.
- Status: skipped.

Root cause:

- Downstream skipped state caused by failed Pages `build` job.
- No Pages configuration, Pages permission, missing secret, artifact upload, or deploy-action root failure was reached.

Repair label:

- none.

## 4. Changed Files

- `apps/web-demo/src/router/modules/example.spec.ts`
  - Added bounded lazy route component import resolution.
  - Added a per-test timeout only for the full lazy-import smoke assertion.
  - Preserved registered route inventory, lazy import/default export, redirect, metadata, locale, and nested module coverage.
- `apps/web-demo/src/hooks/layout/usePageTitle.ts`
  - Added boot-aware deferred title options.
  - Prevented catch-all/not-found redirected metadata from becoming the deferred business title source.
- `apps/web-demo/src/router/utils/guardEffects.ts`
  - Passed app-ready state and known redirected route detection into title deferral.
  - Continued deferring transient `/404` titles only for registered business routes before app-ready handoff.
- `apps/web-demo/src/hooks/layout/usePageTitle.spec.ts`
  - Added coverage for catch-all title source rejection and app-ready deferral behavior.
- `.ai/runtime/github-ci-failure-analysis.md`
  - Updated with CI evidence, root cause, changed files, and validation results.

## 5. Before And After Validation

Before:

| Surface      | Evidence                                         | Result                                              |
| ------------ | ------------------------------------------------ | --------------------------------------------------- |
| Core Quality | GitHub run `27111873632`, `pnpm test:run`        | failed on `example.spec.ts` 5s timeout              |
| E2E QA       | GitHub run `27111873632`, `pnpm e2e:qa:prepared` | failed on title probe containing `页面未找到 - CCD` |
| Pages build  | GitHub run `27111873693`, `pnpm test:run`        | failed on same unit timeout before Pages build      |
| Pages deploy | GitHub run `27111873693`                         | skipped because `build` failed                      |

After local repair:

| Command                                                                                                                                                               | Result                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @ccd/web-demo exec vitest run src/router/modules/example.spec.ts`                                                                                      | passed, 7 tests; lazy import assertion `2284ms` on final targeted run                                       |
| `pnpm --filter @ccd/web-demo exec vitest run src/hooks/layout/usePageTitle.spec.ts`                                                                                   | passed, 7 tests                                                                                             |
| `pnpm test:run`                                                                                                                                                       | passed, 102 test files and 548 tests; route spec `3388ms`, lazy import assertion `2870ms` on final full run |
| `pnpm exec playwright test e2e/layout-runtime-geometry.spec.ts --grep "deep business route refresh does not expose not-found title during stabilization" --workers=1` | passed, 1 test                                                                                              |
| `pnpm e2e:qa:prepared`                                                                                                                                                | passed: smoke 10, perf 2, layout 21, visual 4                                                               |
| `pnpm build:web-demo`                                                                                                                                                 | passed, 11 Turbo build tasks                                                                                |
| `pnpm type-check`                                                                                                                                                     | passed, 22 Turbo tasks                                                                                      |
| `pnpm lint:check`                                                                                                                                                     | passed                                                                                                      |
| `pnpm governance:gate`                                                                                                                                                | passed                                                                                                      |
| `pnpm validate`                                                                                                                                                       | passed; governance, runtime, type-check, and build all succeeded                                            |

## 6. Local Reproduction Commands

Safe commands used for local reproduction and validation:

```bash
pnpm --filter @ccd/web-demo exec vitest run src/router/modules/example.spec.ts
pnpm --filter @ccd/web-demo exec vitest run src/hooks/layout/usePageTitle.spec.ts
pnpm test:run
pnpm exec playwright test e2e/layout-runtime-geometry.spec.ts --grep "deep business route refresh does not expose not-found title during stabilization" --workers=1
pnpm e2e:qa:prepared
pnpm build:web-demo
pnpm type-check
pnpm lint:check
pnpm governance:gate
pnpm validate
```

No deploy, publish, remote mutation, reset, clean, rebase, stash, or GitHub settings mutation commands were used.

## 7. GitHub Pages Assessment

GitHub Pages deploy was not the root failure.

- Pages `build` failed at the shared `Unit Tests` step.
- Pages build/upload/deploy action steps did not run.
- Pages `deploy` was skipped solely because `deploy` depends on `build`.
- If the new pushed run reaches Pages build/upload/deploy, any new Pages-specific failure should be treated as a new failure, not the original root cause.

## 8. Local-Only Residue Assessment

No checked failure was caused by local-only residue.

- Local `HEAD` equaled post-fetch `origin/main` before repair.
- `origin/main...HEAD` was `0 0`.
- The failed GitHub check-runs all used `headSha` `ae02e2a275c7ca03a99c801b2f7b8da70e5beb5f`.
- The only initial local residue was this untracked analysis report.

## 9. Recommended Next Codex Goal

After this repair is pushed, monitor the new `main` runs for `CI Guardian` and `Deploy to GitHub Pages`. If any new failure appears, analyze the new failing command and logs as a separate CI triage goal rather than broadening this patch.
