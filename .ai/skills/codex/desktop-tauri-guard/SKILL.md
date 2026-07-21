---
name: desktop-tauri-guard
description: Guard Vue and Tauri v2 desktop boundaries, capabilities, and configuration drift.
---

# Desktop Tauri Guard

1. Inspect `apps/desktop/src/adapters/**`, `apps/desktop/src-tauri/capabilities/default.json`, and `apps/desktop/src-tauri/tauri.conf.json` before editing.
2. Keep `@tauri-apps/*` imports and `invoke()` inside desktop adapters.
3. Preserve a browser fallback where a shared UI path requires one.
4. Update `scripts/sync-desktop-config.mjs` or `scripts/drift-check.mjs` when changing governed desktop configuration.
5. Validate with `pnpm sync:desktop-config`, `pnpm check:drift`, `pnpm arch:runtime`, `pnpm type-check`, and `pnpm build:desktop` as applicable.
