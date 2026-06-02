# M6 Build / Generated Boundary Review

## Decision

Status: `CLASSIFIED_APP_BUILD_AND_GENERATED_OWNED`.

M6 found no approved governed build package owner. Build utilities and generated
registries remain app build-owned or generated-owned under the current topology.

## Build-owned app surfaces

| Surface | Classification | Reason |
| --- | --- | --- |
| `apps/web-demo/build/compress.ts` | `APP_OWNED_BUILD_UTILITY` | Web-demo Vite compression policy; no shared package owner. |
| `apps/web-demo/build/html.ts` | `APP_OWNED_BUILD_UTILITY` | Web-demo HTML brand/API hint injection. |
| `apps/web-demo/build/info.ts` | `APP_OWNED_BUILD_UTILITY` | Web-demo build metadata injection. |
| `apps/web-demo/build/optimize.ts` | `APP_OWNED_BUILD_UTILITY` | Web-demo dependency optimization policy. |
| `apps/web-demo/build/performance.ts` | `APP_OWNED_BUILD_UTILITY` | Opt-in web-demo bundle visualizer hook. |
| `apps/web-demo/build/plugins.ts` | `APP_OWNED_BUILD_UTILITY` | Owns concrete Vite plugin wiring and generator configuration. |
| `apps/web-demo/build/resolvers/primevue.ts` | `APP_OWNED_BUILD_BOUNDARY` | Central build-only boundary for `PrimeVueResolver()`, enforced by drift-check. |
| `apps/web-demo/build/utils.ts` | `APP_OWNED_BUILD_UTILITY` | Reads root package metadata and writes env into `process.env`. |
| `apps/web-demo/vite.config.ts` | `APP_OWNED_BUILD_CONFIG` | Concrete app build/dev server/proxy/chunk policy. |
| `apps/desktop/vite.config.ts` | `APP_OWNED_BUILD_CONFIG` | Concrete desktop Vite/Tauri app build policy. |

## Generated-owned surfaces

| Surface | Owner command | M6 classification |
| --- | --- | --- |
| `apps/web-demo/src/types/auto-imports.d.ts` | `pnpm build:web-demo` plus prettier normalization | `GENERATED_OWNED` |
| `apps/web-demo/src/types/components.d.ts` | `pnpm build:web-demo` | `GENERATED_OWNED` |
| `apps/web-demo/src/views/example/components/icons/configs/iconLists.generated.ts` | web-demo build plugin | `GENERATED_OWNED` |
| `docs/generated/api-surface-report.json` | `pnpm api:report` | `GENERATED_OWNED` |
| `docs/generated/api-surface-report.md` | `pnpm api:report` / governance gate | `GENERATED_OWNED` |
| `docs/generated/governance-report.md` | `pnpm validate:governance` / `pnpm arch:report` | `GENERATED_OWNED` |
| `docs/generated/graphs/**` | `pnpm validate:governance` / `pnpm arch:graphs` | `GENERATED_OWNED` |

## Why no package migration

- D-A002 forbids package manifest and lockfile changes.
- No governed build package exists in the active topology.
- Existing build utilities are app-specific: they depend on web-demo env keys,
  root package metadata, Vite plugin wiring, generated app type paths, app icon
  showcase paths, and concrete dev-server/proxy policy.
- Moving these files without a package owner would create an ungoverned shared
  layer rather than reduce risk.

## Guard posture

- `scripts/drift-check.mjs` already asserts the PrimeVue resolver boundary and
  centrally checks `PrimeVueResolver()`.
- `scripts/lint-staged-safe.mjs` blocks committing tracked generated files.
- `pnpm validate:governance` regenerates governance artifacts and checks sync.

## Outcome

M6 performed no source migration. Build and generated surfaces are exhaustively
classified and remain with their current owners.
