# M1 Risk Notes

## Post-merge note

This document records the pre-merge execution and closeout state of the public-layer repair and post-GO apps public-layer certification lane. PR #38 has since been merged into `main`. Historical statements such as "ready for human review", "branch remains unmerged", or "do not merge" refer to the execution-time branch state rather than the current `main` branch state. Any residual risks noted here remain future improvement lanes, not blockers to the completed merge.

| Risk | Status | Note |
| --- | --- | --- |
| Candidate over-migration | OPEN | 17 file-level candidates require M2 review before code movement. |
| Package manifest/lockfile need | OPEN | DTO/Zod, date/dayjs, lz-string, and build-package candidates are not eligible without explicit approval. |
| App-owned runtime code moved accidentally | MITIGATED | M1 made no source changes. |
| Generated registry drift | MITIGATED | M1 did not regenerate app component registries; governance validation left no tracked drift. |
| PrimeVue residual surfaces | OPEN | Current direct surfaces remain package-owned, generated, app build config, or test mocks; M1 did not weaken guards. |
