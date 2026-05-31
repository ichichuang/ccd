# M7a Web-Demo Filtered Test CWD Repair Summary

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Run directory: `docs/ai-runs/20260531-153347-ccd-m7a-web-demo-filtered-test-cwd-repair/`
- Baseline dirty state: inherited M1-M7 tracked and untracked artifacts; no cleanup, reset, stage, commit, push, rebase, or rewrite was performed.
- Baseline `git diff --check`: pass, exit 0.

## Fix

`apps/web-demo/src/utils/http/requestLayer.spec.ts` now derives the web-demo package root from `import.meta.url` instead of treating `process.cwd()` as the repository root.

The failing filtered command previously ran with cwd `/Users/cc/MyPorject/ccd/apps/web-demo`, so the test constructed:

`/Users/cc/MyPorject/ccd/apps/web-demo/apps/web-demo/src/utils/http`

The fixed spec scans package-local `src/**` paths from `webDemoRoot` and keeps violation reporting relative to the repository root.

## Changed Files

- `apps/web-demo/src/utils/http/requestLayer.spec.ts`
- `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`
- `docs/ai-plan/DECISIONS.md`
- `docs/ai-runs/20260531-153347-ccd-m7a-web-demo-filtered-test-cwd-repair/reports/summary.md`
- `docs/ai-runs/20260531-153347-ccd-m7a-web-demo-filtered-test-cwd-repair/reports/cwd-path-failure-diagnosis.md`
- `docs/ai-runs/20260531-153347-ccd-m7a-web-demo-filtered-test-cwd-repair/reports/validation-closure.md`
- `docs/ai-runs/20260531-153347-ccd-m7a-web-demo-filtered-test-cwd-repair/command-logs/**`

## Scope Result

- Production HTTP runtime files changed: no
- SafeStorage runtime files changed: no
- Source behavior changed: no
- Test behavior changed: yes, path normalization only
- Package manifests changed: no
- `pnpm-lock.yaml` changed: no
- Generated files manually edited: no
- Generated output changes newly introduced by M7a: no new generated status class; generated artifacts were already dirty before this lane.

## Status Results

- M7a status: `M7A_FILTERED_TEST_CWD_REPAIRED`
- M7 strict validation status: `M7_SCOPE_ACCEPTED_VALIDATION_CLOSED`
- `B-07`: `BLOCKED`
- `B-08`: `OPEN`, pending `lz-string` dependency/manifest approval for compression extraction
- `D-016`: `PROPOSED`
- `C-06`: `OPEN`
- `G-03`: `BLOCKED`

## Command Results

| command | result |
|---|---|
| `pnpm --filter @ccd/web-demo test` before | fail, exit 1; cwd-sensitive duplicated `apps/web-demo` path |
| `pnpm --filter @ccd/web-demo test` after | pass, exit 0; 45 files / 329 tests |
| `pnpm test:run` | pass, exit 0; 74 files / 429 tests |
| `pnpm type-check` | pass, exit 0 |
| required governance/architecture validation | pass, exit 0 for all commands in `validation-closure.md` |

## Remaining Blockers

- `B-07` crypto/Web Crypto/HMAC movement remains blocked pending owner approval.
- `B-08` compression extraction remains dependency/manifest blocked.
- `C-06` PrimeVue allowlist reduction remains open.
- `G-03` remains blocked for final go/no-go owner/operator decisions.

## Recommended Next Lane

Proceed to the next approved non-crypto lane only. Do not start safeStorage crypto movement or PrimeVue allowlist reduction without explicit owner approval for `D-016` or `D-017`.
