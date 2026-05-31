# M11 Hook-Facade Convergence Summary

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Run directory: `docs/ai-runs/20260531-192122-ccd-m11-hook-facade-convergence/`
- Baseline dirty state: inherited tracked and untracked M1-M10 artifacts were present. M11 did not clean, reset, revert, stage, commit, push, rebase, or rewrite history.

## Result

- Final status: `M11_HOOK_FACADE_CONVERGENCE_VERIFIED`.
- Production source moved: no.
- Package public exports added: no.
- Package manifests or lockfile changed: no.
- PrimeVue imports or allowlists changed: no.
- Dialog UX semantics changed: no.
- ProTable URL sync semantics changed: no.
- ProForm/ProTable plugin wiring changed: no.

## Implementation

M11 added focused tests that lock the current app-facade behavior:

- `apps/web-demo/src/hooks/modules/useAutoMitt.spec.ts`
- `apps/web-demo/src/hooks/modules/useDialog.spec.ts`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.spec.ts`

## Ownership Conclusions

- `useAutoMitt.ts` is a thin app event-map facade over `@ccd/vue-hooks/createAutoMittHook`.
- `useDialog.tsx` remains an app i18n/content facade over `@ccd/vue-ui` dialog core.
- `useProTableUrlSync.ts` remains app-owned because it calls app router APIs and owns route query semantics.
- `proform.ts` and `protable.ts` remain app plugin integration shells that inject app capabilities into `@ccd/vue-ui`.

## Residual Risks

- `B-01`, `B-02`, and `B-12` remain open watch items; M11 verifies current safe boundaries but does not remove the app facades.
- Future extraction of dialog builders or URL query helpers needs explicit behavior parity fixtures before moving code.
- The workspace still contains inherited dirty/untracked artifacts from earlier lanes.

## Validation

Validation command logs are under `command-logs/`.

| command | result |
| --- | --- |
| `pnpm --filter @ccd/vue-hooks test` | pass |
| `pnpm --filter @ccd/vue-ui test` | pass |
| `pnpm exec vitest run packages/vue-hooks/src/createAutoMittHook.spec.tsx` | pass |
| `pnpm exec vitest run packages/vue-ui/src/PrimeDialog/useDialog.spec.ts` | pass |
| `pnpm exec vitest run apps/web-demo/src/hooks/modules/useAutoMitt.spec.ts apps/web-demo/src/hooks/modules/useDialog.spec.ts apps/web-demo/src/hooks/modules/useProTableUrlSync.spec.ts` | pass |
| `pnpm --filter @ccd/web-demo test` | pass |
| `pnpm --filter @ccd/vue-hooks build` | pass |
| `pnpm --filter @ccd/vue-ui build` | pass |
| `pnpm --filter @ccd/web-demo type-check` | pass |
| `git diff --check` | pass |
| `pnpm docs:commands` | pass |
| `pnpm project:doctor` | pass |
| `pnpm ai:doctor --open` | pass |
| `pnpm codex:preflight` | pass |
| `pnpm arch:runtime` | pass |
| `pnpm arch:boundaries` | pass |
| `pnpm api:report` | pass |
| `pnpm ai:guard -- --format=json` | pass |
| `pnpm validate:governance` | pass |
| `pnpm type-check` | pass |
| `pnpm test:run` | pass |
| `pnpm build:web-demo` | pass |
