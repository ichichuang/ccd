# APP-001 layout runtime extraction

Status: DONE

Boundary:
- Moved pure layout runtime calculation into `packages/vue-app-platform`.
- Kept app wiring, stores, and layout component consumption in `apps/web-demo`.

Changed surfaces:
- `packages/vue-app-platform/src/layoutRuntime.ts`
- `packages/vue-app-platform/src/layoutRuntime.spec.ts`
- `packages/vue-app-platform/src/index.ts`
- `packages/vue-app-platform/package.json`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- app imports consuming layout runtime from `@ccd/vue-app-platform`

Validation:
- `pnpm --filter @ccd/vue-app-platform test`
- `pnpm --filter @ccd/vue-app-platform build`
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm e2e:layout`

Evidence:
- `command-logs/APP-001-20260529-171227-vue-app-platform-test.log`
- `command-logs/APP-001-20260529-171235-vue-app-platform-build.log`
- `command-logs/APP-001-20260529-171235-web-demo-type-check.log`
- `command-logs/APP-001-20260529-171248-pnpm-e2e-layout.log`

Residual risk:
- `pnpm-lock.yaml` still needs workspace lockfile refresh after all package manifest changes.
