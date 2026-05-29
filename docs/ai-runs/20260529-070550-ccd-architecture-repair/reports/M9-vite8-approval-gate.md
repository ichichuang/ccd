# M9 Vite 8 Approval Gate Report

## Scope

- Lane: M9 / `P2-Vite8-*`.
- No branch, worktree, dependency, lockfile, or Vite config migration was performed.
- This report records the current Vite/Rollup/esbuild surface and the approval gate.

## Current Inventory

Evidence log:

- `command-logs/M9-T1-20260529-081820-vite-inventory.log`

Vite config files:

- `apps/web-demo/vite.config.ts`
- `apps/desktop/vite.config.ts`
- `packages/vue-ui/vite.config.ts`
- `packages/vue-charts/vite.config.ts`

Current Vite-related package surface:

- `vite`
- `@vitejs/plugin-vue`
- `@vitejs/plugin-vue-jsx`
- `vite-plugin-compression`
- `vite-plugin-progress`
- `rollup-plugin-visualizer`
- `vitest`

Migration-sensitive current config:

- `apps/web-demo/vite.config.ts`
  - `optimizeDeps.esbuildOptions`
  - top-level `esbuild.drop` and `esbuild.pure`
  - `build.rollupOptions.treeshake`
  - `build.rollupOptions.output.experimentalMinChunkSize`
  - `build.rollupOptions.output.manualChunks`
  - `build.minify: 'esbuild'`
- `apps/web-demo/build/plugins.ts`
  - custom `echarts-treeshake-enhance` plugin
  - `vite-plugin-progress`
  - `unplugin-auto-import/vite`
  - `unplugin-vue-components/vite`
  - `unocss/vite`
- `apps/web-demo/build/compress.ts`
  - `vite-plugin-compression`
- `apps/web-demo/build/performance.ts`
  - `rollup-plugin-visualizer`
- `packages/vue-ui/vite.config.ts`
  - library build with `rollupOptions.external`
- `packages/vue-charts/vite.config.ts`
  - library build with `rollupOptions.external` and `output.chunkFileNames`
- `apps/desktop/vite.config.ts`
  - Vue + UnoCSS app config, `server.strictPort`

## Approval Gate

The remaining Vite 8 tasks require an isolated branch/worktree and dependency/toolchain changes. Those actions are explicitly approval-gated by the operator instructions, so they remain BLOCKED pending approval.

No official Vite 8 migration facts were applied in this run because the migration lane was not approved. The next approved run must review current official Vite documentation before changing options.
