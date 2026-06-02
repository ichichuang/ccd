# M1 Risk Notes

| Risk | Status | Note |
| --- | --- | --- |
| Candidate over-migration | OPEN | 17 file-level candidates require M2 review before code movement. |
| Package manifest/lockfile need | OPEN | DTO/Zod, date/dayjs, lz-string, and build-package candidates are not eligible without explicit approval. |
| App-owned runtime code moved accidentally | MITIGATED | M1 made no source changes. |
| Generated registry drift | MITIGATED | M1 did not regenerate app component registries; governance validation left no tracked drift. |
| PrimeVue residual surfaces | OPEN | Current direct surfaces remain package-owned, generated, app build config, or test mocks; M1 did not weaken guards. |
