# APP-002 Theme Engine Extraction

Status: DONE

Boundary:
- Moved pure theme derivation/compile/diff/validation modules to `packages/design-tokens/src/theme-engine/**`.
- Added `@ccd/design-tokens/theme-engine` package subpath export.
- Added `packages/vue-app-platform/src/themeRuntime.ts` for DOM/storage application through injected runtime targets.
- Kept `apps/web-demo/src/utils/theme/engine.ts` as an app compatibility facade.

Validation:
- PASS `pnpm --filter @ccd/design-tokens build`
- PASS `pnpm --filter @ccd/vue-app-platform build`
- PASS `pnpm --filter @ccd/vue-app-platform test`
- PASS `pnpm validate:tokens`
- PASS focused theme Vitest files under `apps/web-demo/src/utils/theme/**`

Evidence:
- `command-logs/APP-002-*-design-tokens-build*.log`
- `command-logs/APP-002-*-vue-app-platform-build*.log`
- `command-logs/APP-002-*-vue-app-platform-test*.log`
- `command-logs/APP-002-*-pnpm-validate-tokens.log`
- `command-logs/APP-002-*-theme-focused-vitest.log`

Residual risk:
- App facade remains for import compatibility; future cleanup may collapse callers onto package subpaths.
