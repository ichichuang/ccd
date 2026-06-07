# CSS Px-To-Rem Audit

- Date: 2026-06-08
- Scope: `apps/web-demo/vite.config.ts`, authored styles under `apps/web-demo/src/**`
- Task: `[P2-CSS-PxToRemAudit]`

## Current Build Configuration

`postcss-pxtorem` is configured only for build commands:

- Enabled when `command === 'build'`.
- `rootValue: 16`.
- `propList: ['*']` with border-width properties excluded.
- `mediaQuery: true`.
- `minPixelValue: 1`.
- `unitPrecision: 4`.
- `replace: true`.

## Current Exclusions

File-level exclusions:

- `node_modules`
- `uno.css`
- `__uno` / `__uno.css`
- `virtual:uno`
- `@unocss`

Selector blacklist:

- `html`
- `:root`
- `.el-*`
- `.ant-*`
- `.van-*`
- explicit `no-rem` opt-out

## Authored CSS Still Using Px

Source scan found `29` authored `.vue` / `.scss` / `.css` files with literal `px` values. The remaining authored use cases are mostly:

- app global animation/effect geometry: `animate-lite.scss`, `ambient-orb-animations.scss`, `custom-nprogress.scss`, `theme/transitions.scss`
- global/reset tokens and safe-area fallbacks: `reset.scss`
- app-authored PrimeVue overrides: `custom-primevue.scss`
- local layout/loading styles: `layouts/index.vue`, `layouts/components/LoadingFallback.vue`
- example/dashboard/demo view geometry and documented arbitrary sizing examples

These authored style files still need build-time conversion where fixed CSS geometry should scale with the root font size. They are not third-party package CSS.

## Non-PostCSS Px Surfaces

Source scan found `12` `.ts` / `.tsx` files with literal `px` values. These are mostly runtime strings such as table column widths, chart/dashboard config widths, tests, and generated icon names. They are not converted by PostCSS and should be handled by typed UI contracts or tokenized configuration if future tasks require it.

UnoCSS arbitrary classes such as `w-[280px]` and `min-h-[200px]` are generated utilities, not authored CSS declarations processed by `postcss-pxtorem`.

## Conclusion

- Current pxtorem use is still needed for authored global/scoped CSS that contains fixed geometry.
- Generated UnoCSS CSS and third-party package CSS are protected by file-level excludes.
- Dependence on selector blacklist is already reduced to root/select third-party prefix/explicit opt-out cases.
- Further token-first migration should target authored app styles and runtime sizing strings incrementally, not by disabling pxtorem globally.

## Token-First Status

Current behavior already prefers token and utility generation over global px conversion for generated styles:

- UnoCSS generated CSS is excluded by file path and virtual module patterns.
- Authored templates commonly use semantic shortcuts, CSS variables, viewport units, and arbitrary UnoCSS utilities where the design system already owns the emitted CSS.
- Build-time pxtorem remains scoped to authored CSS files that still contain fixed pixel geometry.

This means the active repair path is incremental token migration of authored CSS and runtime sizing strings, not broad pxtorem removal.

## Selector Blacklist Risk

The active selector blacklist is intentionally short:

- root document selectors: `html`, `:root`
- non-PrimeVue third-party prefixes retained as compatibility guards: `.el-*`, `.ant-*`, `.van-*`
- explicit author opt-out: `no-rem`

Generated CSS and third-party package CSS are protected by file-level excludes instead of a long selector blacklist. This reduces the risk that new generated utilities require manual selector blacklist additions.

## PrimeVue And Third-Party CSS Boundary

PrimeVue, `@primevue/*`, and `@primeuix/*` package assets resolve through `node_modules` and are covered by the file-level `node_modules` exclusion in `apps/web-demo/vite.config.ts`. Runtime theme CSS injected by PrimeVue styled mode is not authored app CSS processed by the local PostCSS pipeline.

The app-authored `apps/web-demo/src/assets/styles/custom-primevue.scss` file is intentionally not excluded. It contains CCD-owned PrimeVue override selectors and should continue to follow the same authored-style conversion policy as the rest of `apps/web-demo/src/assets/styles/**`.

Do not add a broad `.p-*` selector blacklist for PrimeVue. Future third-party CSS sources should be protected with file-level excludes when they enter the build graph as package/generated CSS; app-owned overrides should migrate toward tokens and CSS variables incrementally.
