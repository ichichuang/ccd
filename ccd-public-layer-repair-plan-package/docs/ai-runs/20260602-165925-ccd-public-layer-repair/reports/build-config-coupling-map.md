# M6-T01 Build Config Coupling Map

## Status

- Task status: `DONE`
- Approval ID: `M6-PLAN-SCOPE-EXECUTION-APPROVED`
- Source changes: none
- Manual generated edits: none

## Evidence

- `../command-logs/m6-001-pre-run-checks.log`
- `../command-logs/m6-007-build-file-inventory-current.log`
- `../command-logs/m6-010-build-coupling-rg-current-rerun.log`
- `../command-logs/m6-011-read-vite-config.log`
- `../command-logs/m6-012-read-build-source-files.log`
- `../command-logs/m6-013-read-build-source-continuation.log`

## Coupling Summary

The `apps/web-demo` build surface is app/build-owned and coupled to:

- Vite config APIs: `defineConfig`, `loadEnv`, `ConfigEnv`, plugin hooks.
- Rollup output policy: `manualChunks`, chunk names, `experimentalMinChunkSize`, treeshake side-effect rules.
- esbuild policy: `optimizeDeps.esbuildOptions`, build minifier, `drop`, and `pure`.
- PostCSS/Sass policy: `postcss-pxtorem`, file excludes, selector blacklist, modern Sass API.
- Node build runtime: `fs`, `path`, `module`, `url`, package metadata, `process.env`.
- App constants and runtime policy: brand metadata, runtime storage/query keys, theme fallback generation, lottie alias.
- Plugin composition: Vue, Vue JSX, UnoCSS, AutoImport, Components, compression, bundle visualizer, build info.
- Generated ownership: `src/types/auto-imports.d.ts`, `src/types/components.d.ts`, and icon list generation.
- PrimeVue build boundary: `apps/web-demo/build/resolvers/primevue.ts` centrally owns `PrimeVueResolver()`.

## Classification

| Surface | Classification | Reason |
| --- | --- | --- |
| `apps/web-demo/vite.config.ts` | App/build-owned | App root, env loading, proxy, Rollup/esbuild/PostCSS/Sass policy, chunking, aliases. |
| `apps/web-demo/build/plugins.ts` | App/build-owned | Vite plugin composition, generated icon registry, app resolver, filesystem scanning, dev watcher. |
| `apps/web-demo/build/resolvers/primevue.ts` | Governed build resolver boundary | Central build-only `PrimeVueResolver()` wrapper already classified by guard/drift tooling. |
| `apps/web-demo/build/html.ts` | App/build-owned | Brand/runtime constants, API resource hints, first-paint theme fallback. |
| `apps/web-demo/build/utils.ts` | App/build-owned | Root package metadata, env mutation, aliases, filesystem size reporting. |
| `apps/web-demo/build/optimize.ts` | App/build-owned | App-specific prebundle list aligned with SchemaForm, PrimeVue shell, and route usage. |
| `apps/web-demo/build/compress.ts` | Build/deploy policy | Optional gzip/brotli artifacts are deployment-specific. |
| `apps/web-demo/build/performance.ts` | Bundle analysis policy | Opt-in visualizer artifact only. |

## Conclusion

No build config extraction or cleanup is approved in M6. A future `@ccd/build-config` or `@ccd/vite-config` lane would require explicit owner approval plus manifest, dependency, lockfile, Vite major-version, and generated-file review.
