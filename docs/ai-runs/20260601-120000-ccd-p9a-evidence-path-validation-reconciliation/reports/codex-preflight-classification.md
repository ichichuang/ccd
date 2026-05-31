# codex:preflight Classification

Generated: 2026-06-01  
Log: `command-logs/05-pnpm-codex-preflight.log`

## Result

**FAIL** (exit code 1) — classified as **P9A_INHERITED_CODEX_PREFLIGHT_EXCEPTION_RECORDED**

## Failure points

| check | status | classification |
|---|---|---|
| package.json parse | OK | — |
| required paths/deps/skills | OK | — |
| canonical AI assets | OK | — |
| retired path `.cursor` | **FAIL** | inherited local IDE directory at repo root |
| ai architecture guard | OK | — |
| ai workspace doctor | **FAIL** | architecture drift — message: run `pnpm ai:sync`, then `pnpm ai:doctor` |

## Inherited exception rationale

1. **`.cursor/`** — local Cursor IDE plans; removing or gitignoring is **out of P9a/P10 scope** (would delete/discard local artifacts; not authorized).
2. **ai:sync drift** — running `pnpm ai:sync` in this lane could regenerate adapters/manifests outside approved commit groups; deferred to future owner lane.

## Owner acceptance (implicit in P10 authorization)

Local commits may proceed when:
- all **other** P10 validation commands pass, and
- this exception is documented (this file + P10 summary).

## Not claimed

- Full validation clean: **no**
- GO status: **no**
