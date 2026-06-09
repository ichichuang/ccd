# Vite 8 Isolated Compatibility Inventory

Branch: `modernize/vite8-compat`
Target Vite: `8.0.16`
Date: 2026-06-09

## Scope

This lane is limited to Vite 8, Rolldown, Oxc, and Vite config compatibility.

Explicitly excluded: Vue, Vue Router, VueUse, TypeScript, ESLint, PrimeVue, alova, Playwright, Tauri, desktop security, safeStorage, HTTP runtime, UI refactor, runtime promotion, product work, and global `@ccd/*` aliases.

## Official Migration Inputs

- Vite 8 uses Rolldown and Oxc instead of Rollup and esbuild.
- `build.rollupOptions` is deprecated; use `build.rolldownOptions`.
- `worker.rollupOptions` is deprecated; no worker config exists in CCD.
- `optimizeDeps.esbuildOptions` is deprecated; use `optimizeDeps.rolldownOptions`.
- Top-level `esbuild` is deprecated; use `oxc` for transforms and Rolldown/Oxc minifier options for build-time drop/pure behavior.
- `build.minify: "esbuild"` is deprecated; default client minification is Oxc.
- CSS minification defaults to Lightning CSS.
- Function-form `manualChunks` is deprecated; Rolldown `output.codeSplitting` is the supported replacement.
- `build.commonjsOptions` is deprecated/no-op in Vite 8.

## Inventory

| Surface                              | Vite/Rollup/esbuild behavior                                                                             | Vite 8 action                                                                                                                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm-workspace.yaml`                | Catalog pins `vite: ^7.3.3`; PostCSS resolves below Vite 8's internal PostCSS floor.                     | Updated `vite` catalog to `^8.0.16`; aligned `postcss` to `^8.5.15` only to avoid duplicate PostCSS plugin types in Vite config validation.                                        |
| `apps/web-demo/vite.config.ts`       | `optimizeDeps.esbuildOptions.keepNames`; `target: "esnext"`.                                             | Migrated `keepNames` to `optimizeDeps.rolldownOptions.output.keepNames`; did not carry `target` because Vite 8 docs list no direct dep-optimizer target conversion.                |
| `apps/web-demo/vite.config.ts`       | Top-level `esbuild.drop` / `esbuild.pure` controlled debugger and selected console calls.                | Removed top-level `esbuild`; moved debugger control to `build.rolldownOptions.output.minify.compress` and selected console pure calls to Rolldown `treeshake.manualPureFunctions`. |
| `apps/web-demo/vite.config.ts`       | `build.rollupOptions` owned input, treeshake, output naming, chunking, and ECharts side-effect behavior. | Renamed to `build.rolldownOptions` and kept equivalent input, output naming, and treeshake intent.                                                                                 |
| `apps/web-demo/vite.config.ts`       | Rollup `experimentalMinChunkSize` merged sub-2KB chunks.                                                 | Removed; no direct Rolldown global equivalent. Vendor chunk grouping uses `codeSplitting.groups[].minSize` and budgets validate the resulting output.                              |
| `apps/web-demo/vite.config.ts`       | Function `manualChunks` produced `vendor-core`, `vendor-heavy`, and `vendor-ui`.                         | Replaced with Rolldown `output.codeSplitting.groups` using dynamic `name(id)` and `minSize`.                                                                                       |
| `apps/web-demo/vite.config.ts`       | `build.commonjsOptions` declared node_modules defaults.                                                  | Removed because Vite 8 marks it deprecated/no-op; common CJS interop is handled by Rolldown.                                                                                       |
| `apps/web-demo/vite.config.ts`       | `build.minify: "esbuild"`.                                                                               | Replaced with `build.minify: "oxc"` and explicit `cssMinify: "lightningcss"`.                                                                                                      |
| `apps/web-demo/build/plugins.ts`     | ECharts plugin returns `moduleSideEffects: false` from `resolveId`.                                      | Kept; it is build-only and must be validated under Rolldown.                                                                                                                       |
| `apps/web-demo/build/plugins.ts`     | AutoImport transformed default JS/Vue include patterns and app-local `$t` imports.                       | Scoped AutoImport transforms to `apps/web-demo/src/**` and excluded linked package `dist/**` so app-only imports are not injected into package bundles under Rolldown.             |
| `apps/web-demo/build/compress.ts`    | `vite-plugin-compression` emits optional gzip/brotli files.                                              | Kept as build-layer optional precompression, controlled by `VITE_COMPRESSION`.                                                                                                     |
| `apps/web-demo/build/html.ts`        | `transformIndexHtml` brand/resource hint injection.                                                      | Kept; Vite plugin hook remains supported.                                                                                                                                          |
| `apps/web-demo/build/info.ts`        | `configResolved`, `buildStart`, `buildEnd`, `closeBundle` metadata/timing.                               | Kept; standard Vite/Rollup-compatible plugin hooks.                                                                                                                                |
| `apps/web-demo/build/performance.ts` | `rollup-plugin-visualizer` opt-in bundle report.                                                         | Kept; optional and disabled unless `VITE_BUILD_ANALYZE=true`.                                                                                                                      |
| `apps/desktop/vite.config.ts`        | Vue and UnoCSS only; no Rollup/esbuild options.                                                          | No config migration required.                                                                                                                                                      |
| `apps/desktop/build/html.ts`         | `transformIndexHtml` desktop metadata injection.                                                         | Kept; Vite plugin hook remains supported.                                                                                                                                          |
| `packages/vue-ui/vite.config.ts`     | Library `build.rollupOptions.external`.                                                                  | Renamed to `build.rolldownOptions.external`.                                                                                                                                       |
| `packages/vue-charts/vite.config.ts` | Library `build.rollupOptions.external` and `output.chunkFileNames`.                                      | Renamed to `build.rolldownOptions` with the same external and output policy.                                                                                                       |
| `vitest.config.ts`                   | Top-level `esbuild` config for classic JSX.                                                              | Replaced with top-level `oxc.jsx` classic JSX config.                                                                                                                              |
| `turbo.json`                         | Treats Vite configs and lockfile as global build inputs.                                                 | No change required.                                                                                                                                                                |
| `vercel.json`                        | Frozen pnpm install and `pnpm vercel:build`.                                                             | No change required.                                                                                                                                                                |
| `.github/workflows/*.yml`            | Node 24, pnpm 10.28.2, frozen install, build/e2e gates.                                                  | No change required.                                                                                                                                                                |

## Dependency Policy

No runtime ecosystem package was upgraded in this lane. Existing peer ranges for `@vitejs/plugin-vue@6.0.3`, `@vitejs/plugin-vue-jsx@5.1.3`, `unocss@66.6.0`, and `vite-plugin-compression@0.5.1` allow Vite 8. `vitest@4.0.18` has its own `vite ^6 || ^7` dependency; upgrading Vitest remains out of scope for this Vite app/package compatibility lane.

The only non-Vite catalog floor change is `postcss: ^8.5.15`, matching Vite 8's internal PostCSS floor so `apps/web-demo/vite.config.ts` can type-check its PostCSS plugin list without duplicate PostCSS type identities.

`Dependency modernization` remains open/deferred in `.ai/runtime/repair_list.md`.
