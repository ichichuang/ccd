# M8 Behavior Parity Notes

## Preserved Behavior

- App import surface remains compatible: existing imports from `@/utils/theme/sizeEngine` still expose `generateSizeVars`, `decideRootFontSize`, and `decideLayoutDimensions`.
- DOM writes still occur only in app facade functions.
- Preload still reads `localStorage` through the existing app-owned first-paint exception and still uses `unpackDataSync` fallback behavior.
- Pinia store behavior, persistence key, serializer, and `syncAction` flow were not changed.
- Device and breakpoint browser collection stayed app-owned.
- Theme visual/runtime behavior was not changed.

## Parity Tests

- `pnpm exec vitest run packages/design-tokens/src/sizeResolver.spec.ts`: package resolver formulas and fallbacks.
- `pnpm exec vitest run apps/web-demo/src/utils/theme/sizeEngine.spec.ts`: app facade delegation parity.
- `pnpm --filter @ccd/web-demo test`: filtered app test suite, including theme/size/store specs.

## Known Non-Behavioral Test Note

`pnpm --filter @ccd/design-tokens test` still exits 0 with `--passWithNoTests` because the package-local Vitest script runs from package cwd while the root include pattern is `packages/**/*.spec.ts`. M8 therefore records the explicit root Vitest command for the new resolver spec as the focused package test.

## ESM Build Note

The first filtered web-demo test after adding the package export failed because the built `dist/index.js` emitted `./sizeResolver` without a `.js` extension. M8 fixed source import/export specifiers in the new resolver path and rebuilt `@ccd/design-tokens`; the filtered web-demo test then passed.
