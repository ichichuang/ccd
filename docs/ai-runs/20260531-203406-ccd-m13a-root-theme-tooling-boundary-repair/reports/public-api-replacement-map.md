# Public API Replacement Map

Run: `docs/ai-runs/20260531-203406-ccd-m13a-root-theme-tooling-boundary-repair/`

| old app-source import | public package replacement | symbols | package export status | notes |
|---|---|---|---|---|
| `../apps/web-demo/src/utils/theme/color.ts` | `@ccd/design-tokens/theme-engine` | `parseColor`, `toHex`, `darken`, `lighten`, `mix`, `contrastRatio` | `./theme-engine` subpath already exported by `packages/design-tokens/package.json`; M13a added narrow public barrel re-exports | Pure color helpers stay in `packages/design-tokens/src/theme-engine/color.ts`; no app runtime movement. |
| `../apps/web-demo/src/utils/theme/engine` | `@ccd/design-tokens/theme-engine` | `generateThemeVars` | already exported before M13a | Root tooling now skips the app compatibility facade. |
| `../apps/web-demo/src/utils/theme/validate` | `@ccd/design-tokens/theme-engine` | `THEME_CONTRAST_PAIR_SPECS`, `assessTokenContrast`, `DecorativeValidationMode` | `assessTokenContrast` and type already exported; M13a added `THEME_CONTRAST_PAIR_SPECS` | Root validation consumes package-owned validation metadata directly. |

## Regression Coverage

- `scripts/architecture/validate-boundaries.mjs` now scans `scripts/**` import specifiers and reports app theme utility imports from `apps/web-demo/src/utils/theme/**`, `@/utils/theme/**`, or app-local `src/utils/theme/**`.
- `scripts/ci/package-resolution-smoke.mjs` now resolves `@ccd/design-tokens/theme-engine` and checks `packages/design-tokens/dist/theme-engine/index.d.ts` plus `index.js`.
- `packages/design-tokens/src/theme-engine/index.spec.ts` verifies the public barrel exposes root tooling helpers.
