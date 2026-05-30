# packages/vue-hooks TSX Test Tooling Decision

## Decision

Implementation remains blocked until the lane explicitly approves `tsconfig` and Vitest config changes.

Minimal approved direction, once unblocked: enable Vue TSX at the package type layer and the Vitest transform/discovery layer. Do not rely on the current root `esbuild.jsxFactory: 'h'` path, because that path still depends on generated `h(...)`/`Fragment` runtime names and does not satisfy the target of TSX render returns without `h()` or manual Vue API value imports.

## Evidence

- `packages/vue-hooks/tsconfig.json` already includes `src/**/*.tsx`, but `pnpm exec tsc -p packages/vue-hooks/tsconfig.json --showConfig` shows no effective `jsx` or `jsxImportSource` option. Strict TSX type-checking is therefore not actually enabled for package compilation.
- `packages/vue-ui/tsconfig.json` extends Vue's DOM tsconfig and its effective config includes `jsx: "preserve"` and `jsxImportSource: "vue"`. Existing TSX package usage follows that model.
- `vitest.config.ts` test include patterns currently cover `*.spec.ts` and `*.test.ts` only. They do not discover `*.spec.tsx` or `*.test.tsx`.
- `vitest.config.ts` currently uses `vue()` and `AutoImport(...)`, but does not install `@vitejs/plugin-vue-jsx`. It has `esbuild.jsxFactory: 'h'` and `jsxFragment: 'Fragment'`, which is not sufficient for the no-manual-`h` target.
- `@vitejs/plugin-vue-jsx` is already present in root `package.json` and installed locally as `5.1.3`; no dependency change is required.
- Existing TSX surfaces in `apps/web-demo/build/plugins.ts` and `packages/vue-ui/vite.config.ts` already use `vueJsx()`, so using the same plugin in root Vitest is consistent with repository practice.
- `eslint.config.ts` already includes TSX parsing and lint coverage for `**/*.tsx`, and root lint scripts include `packages/**/*.{vue,ts,tsx,js,jsx}`.
- `packages/vue-hooks/package.json` test script explicitly names `packages/vue-hooks/src/createAutoMittHook.spec.ts`; if that spec is renamed to `.tsx`, the package script must be updated in the same implementation lane.

## Minimal Change Set After Approval

1. `packages/vue-hooks/tsconfig.json`
   - Add:
     - `"jsx": "preserve"`
     - `"jsxImportSource": "vue"`
   - Keep the existing `extends`, `types: []`, build output, and package boundary settings unchanged.

2. `vitest.config.ts`
   - Import `vueJsx` from `@vitejs/plugin-vue-jsx`.
   - Add `vueJsx()` after `vue()` in the root Vitest plugin list.
   - Expand test include/exclude globs so `*.spec.tsx` and `*.test.tsx` are covered, including DOM-specific TSX globs where the existing `.dom.spec.ts` split already applies.
   - Leave the existing `esbuild` JSX settings in place unless a follow-up lane approves cleanup; removing them would be broader than this decision.

3. `packages/vue-hooks/package.json`
   - When `createAutoMittHook.spec.ts` is actually renamed to `createAutoMittHook.spec.tsx`, update only that explicit package test target, or replace the package-local explicit list with a scoped deterministic TS/TSX spec pattern if approved.

## Rejected Alternatives

- Extending `packages/vue-hooks/tsconfig.json` from `@vue/tsconfig/tsconfig.dom.json`: broader than necessary and changes more compiler defaults than this lane needs.
- Adding auto-import declaration generation/types to `packages/vue-hooks`: broader than necessary. A TSX harness can avoid manual Vue API value imports by using a plain component object with a TSX render return.
- Relying on `esbuild.jsxFactory: 'h'`: fails the stated direction because the generated render path still depends on `h`/`Fragment` names.
- Dependency or Vite major changes: explicitly out of scope and not needed because `@vitejs/plugin-vue-jsx` is already installed.

## Risks

- Adding `vueJsx()` to root `vitest.config.ts` affects all Vitest transforms, not only `packages/vue-hooks`. The risk is small because the same plugin is already used by app/package Vite configs, but validation should include root governance plus focused package tests.
- Expanding Vitest include globs may discover future `*.spec.tsx` tests automatically. Current repository search found no existing `.spec.tsx` or `.test.tsx` files.
- `packages/vue-hooks/tsconfig.json` currently includes test files in package compilation. A renamed `.spec.tsx` will remain inside the package type/build surface unless a separate lane changes test/build boundaries.
- Keeping `types: []` means tests should not depend on global auto-import type declarations for Vue APIs. TSX element typing should come from `jsxImportSource: "vue"` instead.

## Validation Run

- `pnpm docs:commands`: passed.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm validate:governance`: passed.
- `pnpm --filter @ccd/vue-hooks type-check`: passed.
- `pnpm --filter @ccd/vue-hooks test`: passed, 5 files / 15 tests.
- `git diff --check`: passed.
- `git status --short --untracked-files=all`: recorded in command logs.

## Changed Files In This Lane

- Added evidence logs under `docs/ai-runs/20260530-145401-ccd-vue-hooks-tsx-test-tooling-decision/command-logs/`.
- Added this report under `docs/ai-runs/20260530-145401-ccd-vue-hooks-tsx-test-tooling-decision/reports/`.
- Did not modify `packages/vue-hooks/tsconfig.json`, `vitest.config.ts`, root dependencies, Vite version, GitHub remote, HTTP/P4 surfaces, generated governance files, or unrelated packages.
