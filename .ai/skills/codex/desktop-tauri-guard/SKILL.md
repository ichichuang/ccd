---
name: desktop-tauri-guard
description: 'Desktop branch guardrails for Vue 3 + Tauri v2. Use when tasks touch src-tauri, desktop bridge APIs, capability drift, or desktop-specific E2E/snapshot cleanup.'
---

# Desktop Tauri Guard

Use this skill for Tauri v2 desktop work so Web/Desktop behavior stays bridged and drift checks remain enforceable.

## Workflow

1. Read desktop bridge surfaces before editing:
   - `src/utils/desktopWindow.ts`
   - `src/router/utils/helper.ts`
   - `src/utils/env.ts`
2. Inspect desktop config and permission surfaces:
   - `src-tauri/capabilities/default.json`
   - `src-tauri/tauri.conf.json`
   - `scripts/sync-desktop-config.mjs`
3. If routes/pages are removed or renamed, clean stale visual assets:
   - `e2e/__snapshots__/**`
   - `test-results/**`
   - Remove obsolete `example`-related baselines.
4. Keep drift protection aligned:
   - Update `scripts/drift-check.mjs` when adding new desktop invariants.
5. Validate with smallest useful ladder:
   - `pnpm sync:desktop-config`
   - `pnpm check:drift`
   - `pnpm type-check`
   - Run targeted Playwright specs only when UI/snapshot behavior changed.

## Trigger Examples

- "修复桌面端 window.open 行为"
- "更新 Tauri v2 capabilities 并做漂移防线"
- "清理 desktop 分支 example 快照残留"
- "同步 src-tauri 配置并验证双端桥接"

## Rules

- Prefer bridge helpers over direct platform API calls in business files.
- Keep `isTauri()` split + Web fallback as the default pattern.
- Any desktop capability change must be paired with drift/config checks.
- Do not leave obsolete E2E baseline assets after route/page cleanup.
