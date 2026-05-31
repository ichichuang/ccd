# Pre-Commit Unblock Validation

After quarantine, hook-critical commands:

| command | exit | blocks pre-commit? |
|---|---|---|
| `pnpm ai:doctor` | 0 | was blocking via `.cursor` — **resolved** |
| `pnpm type-check` | (verified in P10b pre-commit) | required by hook |
| `pnpm drift-check` | (verified at commit time) | required by hook |

## codex:preflight

**Pass** after quarantine (previously failed on `.cursor` + ai:sync drift).

## Conclusion

Pre-commit hook blocker for `.cursor` is **removed**. P10b local commits may proceed without `--no-verify`.
