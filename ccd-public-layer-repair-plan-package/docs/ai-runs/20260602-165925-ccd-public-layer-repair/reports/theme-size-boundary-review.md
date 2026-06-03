# M7 Theme/Size Boundary Review

## Scope

Milestone: `M7`

Task: `M7-T01`

Objective: confirm which theme/size logic is already package-owned and which behavior remains app-owned.

## Evidence

- `command-logs/m7-theme-size-file-inventory.log`
- `command-logs/m7-theme-size-definitions.log`

Representative files inspected:

- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.spec.ts`
- `apps/desktop/src/theme/index.ts`
- `packages/design-tokens/src/sizeResolver.ts`
- `packages/design-tokens/src/theme-engine/index.ts`
- `packages/vue-app-platform/src/themeRuntime.ts`

## Findings

### Package-owned pure derivation

Pure token derivation is already package-owned:

- `@ccd/design-tokens/theme-engine` owns theme derivation, validation, diffing, patching, metrics, token graph, and generated theme variables.
- `@ccd/design-tokens` owns size presets, size variable generation, root font-size decisions, layout dimension decisions, scoped content size variables, and device/size token constants.

The web-demo facade delegates these pure APIs instead of duplicating derivation logic.

### Existing capability-injected theme writer

`packages/vue-app-platform/src/themeRuntime.ts` already owns `applyThemeVars(vars, options)`.

The writer is capability-injected:

- target is passed by the app.
- storage is optional and passed by the app.
- storage keys are passed by the app.

`apps/web-demo/src/utils/theme/engine.ts` keeps the app-owned facade by injecting:

- `document.documentElement`
- `localStorage`
- app runtime storage keys

This boundary is consistent with the runtime-neutral/package-owner rule.

### Remaining app-owned size writer behavior

`apps/web-demo/src/utils/theme/sizeEngine.ts` still owns several browser and app behaviors:

- `applySizeTheme` writes size CSS variables to `document.documentElement`.
- `applyRuntimeSizeUpdate` writes runtime font-size and layout variables and updates `root.dataset.fontScale`.
- `applyRootFontSize` preserves legacy direct `setProperty` semantics.
- `applyAllSizeVars` merges size, root font, and layout variables in a single `cssText` write for preload.
- `preload` reads `localStorage`, decodes safeStorage-packed payloads, falls back to JSON, derives device/breakpoint/pixel-ratio context, and applies all variables before app mount.

The app-owned preload path is a first-paint behavior surface. Moving the writer during this plan would require visual and responsive validation and could change FOUC timing.

### Desktop behavior

`apps/desktop/src/theme/index.ts` separately writes desktop design-system variables from `@ccd/design-tokens`.

Desktop does not use the web-demo size preload path. Any shared writer extraction would need to preserve the desktop setup independently.

## Boundary conclusion

- Theme derivation: package-owned.
- Theme DOM/storage write: already package-owned through `@ccd/vue-app-platform` with app capability injection.
- Size derivation: package-owned.
- Size DOM/preload/storage/device facade: app-owned for this plan.

No source change was made for `M7-T01`.
