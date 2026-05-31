# M6a Generated Sync Drift Diagnosis

## 1. Baseline Generated Diff

Baseline generated diff was captured in:

- `command-logs/005-generated-git-diff-name-status.log`
- `command-logs/006-generated-git-diff-stat.log`
- `command-logs/003-git-status-short-untracked-all.log`

Tracked generated files already dirty at baseline:

- `.ai/generated/governance-report.json`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`
- `docs/generated/governance-report.md`
- `docs/generated/graphs/README.md`
- `docs/generated/graphs/dependency-graph.json`
- `docs/generated/graphs/package-dependency-graph.mmd`

Untracked generated API snapshot already present:

- `.ai/governance/api-snapshots/ccd__vue-app-platform.json`

## 2. Files Changed by `pnpm validate:governance`

Initial M6a reproduction in `command-logs/010-reproduce-pnpm-validate-governance.log` passed because the worktree was already in the gate-normalized generated state.

The drift was reproduced after pre-fix `pnpm governance:refresh` in `command-logs/040-after-refresh-pnpm-validate-governance.log`. The gate changed these generated files during its final normalization step and failed:

- `.ai/generated/governance-report.json`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`
- `docs/generated/governance-report.md`
- `docs/generated/graphs/README.md`
- `docs/generated/graphs/dependency-graph.json`
- `docs/generated/graphs/package-dependency-graph.mmd`

After the generator fixes, `command-logs/060-after-normalizer-fix-pnpm-validate-governance.log` and `command-logs/084-after-api-generator-fix-pnpm-validate-governance.log` both passed.

## 3. Files Changed by `pnpm governance:refresh`

Before the fix, `pnpm governance:refresh` passed but left generated files in generator formatting, not gate formatting. See:

- `command-logs/030-pnpm-governance-refresh.log`
- `command-logs/031-after-governance-refresh-generated-git-diff-name-status.log`
- `command-logs/034-after-governance-refresh-generated-shasum.log`

It also surfaced `docs/generated/sbom.json` as dirty until the gate regenerated and normalized the generated set.

After the fix, `pnpm governance:refresh` passed and produced the same generated checksums as `pnpm validate:governance`. Evidence:

- `command-logs/088-after-api-generator-fix-pnpm-governance-refresh.log`
- `command-logs/091-stability-shasum-diff-validate-vs-refresh-after-fixes.log`

## 4. Files Changed by `pnpm api:report`

Before the API generator fix, standalone `pnpm api:report` changed `docs/generated/api-surface-report.json` checksum from gate formatting to raw `JSON.stringify` formatting. Evidence:

- `command-logs/021-pnpm-api-report.log`
- `command-logs/025-after-api-report-generated-shasum.log`

After the fix, standalone `pnpm api:report` formats API report outputs and snapshots immediately. `pnpm validate:governance` did not change checksums afterward:

- `command-logs/080-after-api-generator-fix-pnpm-api-report.log`
- `command-logs/087-stability-shasum-diff-after-api-fix.log`

## 5. Whether Repeated Generation Is Stable

Yes. After the fixes:

- `pnpm api:report` followed by `pnpm validate:governance` produced identical generated checksums.
- `pnpm validate:governance` followed by `pnpm governance:refresh` produced identical generated checksums.

Evidence:

- `command-logs/087-stability-shasum-diff-after-api-fix.log`
- `command-logs/091-stability-shasum-diff-validate-vs-refresh-after-fixes.log`

## 6. Whether Drift Is Caused by Stale Generated Artifacts

Partially. The baseline generated files were stale relative to current topology and API policy changes, which explains the tracked generated diff against `HEAD`.

However, the M6a blocker was not only stale generated content. The failing cycle after `pnpm governance:refresh` was caused by inconsistent formatting between standalone generation commands and the gate's final canonical normalization.

## 7. Whether Drift Is Caused by Nondeterministic Generator Output

No nondeterministic content was found after the fixes. The observed checksum changes were deterministic formatting toggles, not unstable ordering, random data, or time data.

## 8. Whether Drift Is Caused by Evidence or Report Files Being Included in Generated Inputs

No. The inspected generators use policy, manifest, lockfile, workspace, and Turbo inputs. The risk scan in `command-logs/070-generator-instability-risk-scan.log` found no `docs/ai-runs/**`, `reports/**`, or `command-logs/**` inputs in the relevant generators.

## 9. Whether Drift Is Caused by Ordering, Timestamps, Absolute Paths, Path Separators, or Unstable JSON Serialization

- Ordering: not the blocker after adding sorted generated traversal in `scripts/normalize-generated-output.mjs`.
- Timestamps: not observed in the relevant generated outputs.
- Absolute paths: generator scripts use `process.cwd()` internally for file access, but generated outputs use repository-relative paths.
- Path separators: not observed as a blocker.
- JSON serialization: yes. Raw `JSON.stringify(..., null, 2)` output and Prettier-formatted JSON output were different. Standalone `pnpm api:report` and pre-fix `pnpm governance:refresh` wrote raw generator JSON, while gate normalized with Prettier before its sync check.

## 10. Recommended Fix

Applied:

- Keep `scripts/governance/gate.mjs` sync behavior strict.
- Make `scripts/normalize-generated-output.mjs` perform the same Prettier pass as the gate, include API snapshots, and traverse files deterministically.
- Make `scripts/architecture/check-api-surface.mjs` format API report outputs and snapshots after writing, so standalone `pnpm api:report` is stable before `pnpm validate:governance`.

Do not weaken `pnpm validate:governance`. Do not manually edit generated outputs. Keep generated outputs dirty until the eventual authorized commit includes them.
