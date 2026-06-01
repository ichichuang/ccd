# D-021 Risk Notes

## Controlled Risks

- Component auto-import resolver behavior is build-sensitive; `drift-check` now verifies the boundary call path.
- Generated registry correctness is type-sensitive; the generated file hash was compared before and after `pnpm build:web-demo`.
- `auto-imports.d.ts` is formatted differently by the generator; Prettier normalized it and a clean diff was verified.

## Non-Changes

- No manual edit to `apps/web-demo/src/types/components.d.ts`.
- No package manifest or lockfile change.
- No dependency move into `@ccd/vue-primevue-adapter`.
- No Clawd/theme, safeStorage crypto, HMAC, WebCrypto, or lz-string ownership change.
- No runtime app behavior change.

## Residual Risks

- C-06 remains open for `AppPrimeVueGlobals` and the showcase exception.
- G-02 remains unchanged at 78 open tasks.
- Full GO is still unauthorized until the remaining approved residual lanes and final validation matrix pass.
