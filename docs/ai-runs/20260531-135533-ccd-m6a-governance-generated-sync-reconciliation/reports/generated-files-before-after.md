# M6a Generated Files Before and After

## Before M6a

Baseline logs:

- `command-logs/001-git-branch-show-current.log`: `main`
- `command-logs/002-git-rev-parse-short-head.log`: `cc255d1a`
- `command-logs/003-git-status-short-untracked-all.log`: full dirty/untracked state
- `command-logs/005-generated-git-diff-name-status.log`: generated tracked diff
- `command-logs/006-generated-git-diff-stat.log`: generated tracked diff stat

Baseline generated tracked diff:

```text
M .ai/generated/governance-report.json
M docs/generated/api-surface-report.json
M docs/generated/api-surface-report.md
M docs/generated/governance-report.md
M docs/generated/graphs/README.md
M docs/generated/graphs/dependency-graph.json
M docs/generated/graphs/package-dependency-graph.mmd
```

Baseline generated untracked file:

```text
?? .ai/governance/api-snapshots/ccd__vue-app-platform.json
```

## Pre-Fix Command Effects

Standalone `pnpm api:report`:

- Log: `command-logs/021-pnpm-api-report.log`
- Result: pass, exit 0.
- Effect: `docs/generated/api-surface-report.json` checksum changed to raw generator formatting.

Standalone `pnpm governance:refresh`:

- Log: `command-logs/030-pnpm-governance-refresh.log`
- Result: pass, exit 0.
- Effect: generated files changed to generator formatting; `docs/generated/sbom.json` appeared dirty in `command-logs/033-after-governance-refresh-generated-git-status-short.log`.

Subsequent `pnpm validate:governance`:

- Log: `command-logs/040-after-refresh-pnpm-validate-governance.log`
- Result: fail, exit 1.
- Effect: gate normalized generated outputs back to Prettier formatting and detected that generated artifacts changed during the gate.

## Applied Generator Fixes

Changed generator scripts:

```text
M scripts/architecture/check-api-surface.mjs
M scripts/normalize-generated-output.mjs
```

Generated outputs were synchronized only through generation commands:

- `pnpm api:report`
- `pnpm governance:refresh`
- `pnpm validate:governance`

## After M6a

After the fixes, generated output checksums are stable across standalone generation and the gate:

- `command-logs/087-stability-shasum-diff-after-api-fix.log`: exit 0, no diff.
- `command-logs/091-stability-shasum-diff-validate-vs-refresh-after-fixes.log`: exit 0, no diff.

Current generated tracked diff remains the same semantic generated update relative to `HEAD`:

```text
M .ai/generated/governance-report.json
M docs/generated/api-surface-report.json
M docs/generated/api-surface-report.md
M docs/generated/governance-report.md
M docs/generated/graphs/README.md
M docs/generated/graphs/dependency-graph.json
M docs/generated/graphs/package-dependency-graph.mmd
```

Current generated untracked file remains:

```text
?? .ai/governance/api-snapshots/ccd__vue-app-platform.json
```

This is expected in the current dirty worktree. `pnpm validate:governance` now passes because the generated diff is stable before and after the gate.
