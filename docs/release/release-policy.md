# CCD Release Policy

CCD releases are promoted only from the deterministic workspace runtime. The repository root is orchestration-only, and `apps/web-demo` is the only browser release source.

## Release gates

A release candidate must pass:

1. `pnpm validate:release`
2. `pnpm api:report`
3. `pnpm supply:check`
4. `pnpm arch:graphs`
5. artifact review for `apps/web-demo/dist`

The root `src/` directory and removed runtime archive paths must not produce release artifacts.

## Runtime verification

Each release candidate records:

- Node version
- pnpm version
- Turbo version
- mise status
- active workspace root
- runtime fingerprint
- dependency graph checksum

Use `pnpm runtime:summary` and `pnpm arch:graphs` for the canonical evidence.

## Rollback rules

Rollback uses the last known-good release artifact and graph checksum. Do not rebuild from removed archive paths; use the last known-good release artifact and Git history for audit.

## Artifact retention

Retain release audit reports, generated graphs, API reports, and build checksums for each promoted candidate. Runtime build outputs may be regenerated from source, lockfile, and the recorded runtime fingerprint.

## Release freeze policy

During freeze, only release-blocking fixes may touch:

- `apps/web-demo/**`
- `packages/contracts/**`
- `packages/core/**`
- `.github/workflows/**`
- `scripts/architecture/**`
- `scripts/governance/**`

Governance changes during freeze must replace or simplify existing checks, not add new independent layers.

## Hotfix policy

Hotfixes must branch from the release baseline, preserve `apps/web-demo` as the only browser runtime source, run `pnpm validate:release`, and attach the generated release audit report.
