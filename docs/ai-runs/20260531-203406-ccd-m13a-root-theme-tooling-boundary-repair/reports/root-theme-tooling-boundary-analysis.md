# Root Theme Tooling Boundary Analysis

Run: `docs/ai-runs/20260531-203406-ccd-m13a-root-theme-tooling-boundary-repair/`

## Boundary Table

| script | current_import | current_import_kind | imported_symbol | app_source_dependency | public_package_alternative | package_export_available | behavior_risk | required_change | tests_required | related_issue_ids |
|---|---|---|---|---|---|---|---|---|---|---|
| `scripts/upgrade-all-themes.mjs` | `../apps/web-demo/src/utils/theme/color.ts` | relative filesystem app-source deep import | `parseColor`, `toHex`, `darken`, `lighten`, `mix`, `contrastRatio` | yes, app theme utility source | `@ccd/design-tokens/theme-engine` | subpath export existed; M13a added narrow public re-exports for pure color helpers | low; helpers are pure, runtime-neutral, and already package-owned | replace import with public package subpath; add focused public-barrel spec | theme-engine spec, design-tokens build, script execution, token validation, boundary validation | F-04 |
| `scripts/validate-token-contrast.ts` | `../apps/web-demo/src/utils/theme/engine` | relative filesystem app-source deep import | `generateThemeVars` | yes, app theme facade | `@ccd/design-tokens/theme-engine` | yes; `generateThemeVars` already exported | low; app facade already re-exported this pure package helper | replace import with public package subpath | token contrast script, `pnpm validate:tokens`, design-tokens build, boundary validation | F-04 |
| `scripts/validate-token-contrast.ts` | `../apps/web-demo/src/utils/theme/validate` | relative filesystem app-source deep import | `THEME_CONTRAST_PAIR_SPECS`, `assessTokenContrast`, `DecorativeValidationMode` | yes, app theme validation utility source | `@ccd/design-tokens/theme-engine` | subpath export existed; `assessTokenContrast` and type already exported; M13a added `THEME_CONTRAST_PAIR_SPECS` | low; helper and specs are pure validation metadata already package-owned | replace import with public package subpath; add focused public-barrel spec | theme-engine spec, token contrast script, `pnpm validate:tokens`, API report, boundary validation | F-04 |

## Outcome

- Target root app-theme import count before: 3 matched import lines.
- Target root app-theme import count after: 0 matched import lines.
- App runtime source changed: no.
- Package manifest changed: no.
- Design-tokens export surface changed: yes, through `packages/design-tokens/src/theme-engine/index.ts` only.
- Public package replacement used: `@ccd/design-tokens/theme-engine`.

## Evidence Logs

- Before scan: `command-logs/baseline-grep-theme-imports.log`
- After target scan: `command-logs/after-target-root-theme-imports.log`
- Boundary validation: `command-logs/focused-arch-boundaries.log`
