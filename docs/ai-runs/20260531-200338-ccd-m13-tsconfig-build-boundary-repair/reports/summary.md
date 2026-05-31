# M13 tsconfig build boundary repair summary

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Run directory: `docs/ai-runs/20260531-200338-ccd-m13-tsconfig-build-boundary-repair/`
- Initial `git diff --check`: passed
- Existing workspace state: dirty/untracked artifacts were present before M13; no cleanup, reset, staging, commit, push, branch switch, or history rewrite was performed.

## Result

- Final M13 status: `M13_TSCONFIG_BUILD_BOUNDARY_REPAIRED_F04_OPEN`
- App package source include count before: 8
- App package source include count after: 0
- `apps/web-demo/tsconfig.json`: removed 5 package source include globs for `@ccd/vue-ui` and `@ccd/vue-charts`.
- `apps/desktop/tsconfig.json`: removed 3 package source include globs for `@ccd/vue-ui`.
- Project references changed: no.
- Runtime source files changed by M13: no.
- Package manifests changed by M13: no.
- Package declaration/export blocker found: no.
- Generated files changed: yes, by required generator commands (`pnpm api:report`, `pnpm validate:governance`), not by manual edits.

## Guarding

- `scripts/architecture/validate-boundaries.mjs` now rejects app tsconfig includes that point at `packages/*/src/**`.
- `scripts/ci/package-resolution-smoke.mjs` now checks `@ccd/vue-ui` and `@ccd/vue-charts` package resolution plus `dist/index.d.ts` and `dist/index.js` readiness.

## Issue Status

- `F-01`: `DONE`
- `F-02`: `DONE`
- `F-03`: `DONE`
- `F-04`: `OPEN`; root theme tooling scripts still deep-import app theme utilities and were outside this lane's explicit allowed file list.

