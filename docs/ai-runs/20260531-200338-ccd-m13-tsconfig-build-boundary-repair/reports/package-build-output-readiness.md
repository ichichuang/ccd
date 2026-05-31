# Package build output readiness

## Readiness Table

| package | root export | import output | types output | build config | readiness |
|---|---|---|---|---|---|
| `@ccd/vue-ui` | yes | `packages/vue-ui/dist/index.js` | `packages/vue-ui/dist/index.d.ts` | `packages/vue-ui/tsconfig.build.json`, `packages/vue-ui/vite.config.ts` | ready |
| `@ccd/vue-charts` | yes | `packages/vue-charts/dist/index.js` | `packages/vue-charts/dist/index.d.ts` | `packages/vue-charts/tsconfig.build.json`, `packages/vue-charts/vite.config.ts` | ready |

## Evidence

- `pnpm ci:prepare-internal` rebuilt both package outputs successfully.
- `pnpm ci:smoke:packages` resolved `@ccd/vue-ui` and `@ccd/vue-charts` and verified required dist files.
- App type-checks passed after source include removal, so no missing declaration/export blocker was found.

Relevant logs:

- `command-logs/012_pnpm_ci_prepare_internal_after_patch.log`
- `command-logs/013_pnpm_ci_smoke_packages.log`
- `command-logs/014_web_demo_type_check_after_patch.log`
- `command-logs/015_desktop_type_check_after_patch.log`

