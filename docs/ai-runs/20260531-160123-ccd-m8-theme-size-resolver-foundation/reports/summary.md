# M8 Theme-Size Resolver Foundation Summary

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Run directory: `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/`
- Existing M8 evidence before this lane: none beyond the newly created run directory.
- Baseline dirty state: inherited M1-M7a tracked/untracked artifacts; no cleanup, reset, stage, commit, push, rebase, or rewrite was performed.

## Implementation

- Final status: `M8_THEME_SIZE_RESOLVER_FOUNDATION_DONE`.
- Option used: A.
- Eligible helper count: 6.
- Moved/exposed helper count: 6.
- Verified-existing helper count: 1 theme engine package ownership group.
- DOM/preload functions moved: no.
- Pinia stores moved: no.
- `localStorage` behavior changed: no.
- Visual/runtime behavior changed: no intended behavior change; pure formulas are parity-tested.
- Package manifests changed: no.
- `pnpm-lock.yaml` changed: no.
- Generated outputs changed: yes, through `pnpm api:report` / `pnpm validate:governance` command generation only.

## Changed Source Files

- `packages/design-tokens/src/sizeResolver.ts`
- `packages/design-tokens/src/sizeResolver.spec.ts`
- `packages/design-tokens/src/index.ts`
- `packages/design-tokens/src/size.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.spec.ts`

## Command Results So Far

| command | result |
|---|---|
| `git diff --check` | pass, exit 0 |
| `pnpm docs:commands` | pass, exit 0 |
| `pnpm project:doctor` | pass, exit 0 |
| `pnpm ai:doctor --open` | pass, exit 0 |
| `pnpm codex:preflight` | pass, exit 0 |
| `pnpm arch:runtime` | pass, exit 0 |
| `pnpm arch:boundaries` | pass, exit 0 |
| `pnpm api:report` | pass, exit 0 |
| `pnpm ai:guard -- --format=json` | pass, exit 0 |
| `pnpm validate:governance` | pass, exit 0 |
| `pnpm --filter @ccd/design-tokens build` | pass, exit 0 |
| `pnpm --filter @ccd/design-tokens test` | pass, exit 0; package script found no files due cwd/include mismatch |
| `pnpm exec vitest run packages/design-tokens/src/sizeResolver.spec.ts` | pass, exit 0; 1 file / 5 tests |
| `pnpm exec vitest run apps/web-demo/src/utils/theme/sizeEngine.spec.ts` | pass, exit 0; 1 file / 8 tests |
| `pnpm --filter @ccd/vue-app-platform test` | pass, exit 0; 5 files / 17 tests |
| `pnpm --filter @ccd/vue-app-platform build` | pass, exit 0 |
| `pnpm --filter @ccd/web-demo type-check` | pass, exit 0 |
| `pnpm --filter @ccd/web-demo test` | pass, exit 0; 45 files / 331 tests |
| `pnpm type-check` | pass, exit 0 |
| `pnpm test:run` | pass, exit 0 |
| `pnpm build:web-demo` | pass, exit 0 |

## Boundary Checks

- `packages/design-tokens/src/sizeResolver.ts` has no `document`, `window`, storage, navigator/screen, `import.meta.env`, Pinia, app alias, or preload references.
- App-owned runtime surfaces remain in `apps/web-demo/src/utils/theme/sizeEngine.ts`, `apps/web-demo/src/stores/modules/system/size.ts`, and `apps/web-demo/src/stores/modules/system/device.ts`.
- Manifest/lockfile diff check is empty.
- Generated diffs are limited to `.ai/generated/**` and `docs/generated/**`; `.ai/governance/api-snapshots/ccd__vue-app-platform.json` remains inherited untracked state from earlier lanes.

## Issue Status

- `B-07`: `BLOCKED`
- `B-08`: `OPEN`
- `D-016`: `PROPOSED`
- `D-017`: `PROPOSED`
- `C-06`: `OPEN`
- `G-03`: `BLOCKED`

## Remaining Blockers / Next Lane

- `B-07` remains blocked by unresolved safeStorage crypto ownership approval; M8 only records non-crypto/runtime-neutral foundation progress.
- `B-08` remains open because DOM/preload/store runtime ownership was intentionally not moved.
- `D-016` and `D-017` remain proposed; M8 did not approve safeStorage or PrimeVue migration.
- Recommended next lane: explicit owner decision for remaining app runtime facades before any DOM/storage/store movement.
