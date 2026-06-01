# API Surface Drift Root Cause

## Failure Surface

Baseline `pnpm validate:governance` failed at governance artifact sync and reported only:

- `docs/generated/api-surface-report.md`
- `docs/generated/api-surface-report.json`

No runtime source, package manifest, lockfile, PrimeVue allowlist, or Clawd/theme file drift was introduced by the gate.

## Root Cause

P20 added `CcdTag` to the public `@ccd/vue-ui` exports, but the generated API surface report had not been regenerated and committed.

Evidence:

- source grep found `CcdTag` in `packages/vue-ui/src/index.ts`
- baseline grep found no `CcdTag` entry in `docs/generated/api-surface-report.md`
- post-sync grep found `CcdTag` in both generated report formats

## Owning Fix

The drift was resolved only through owning commands:

- `pnpm api:report`
- `pnpm validate:governance`

No manual edits were made to generated files.

