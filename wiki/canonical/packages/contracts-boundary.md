---
title_en: '@ccd/contracts Boundary'
title_zh: '@ccd/contracts 边界'
aliases:
  - packages/contracts
  - Contracts package
  - 契约包
tags:
  - packages
  - contracts
  - runtime-neutral
tags_zh:
  - 包
  - 契约
  - 运行时无关
status: verified
confidence: 0.96
source_langs:
  - en
source_paths:
  - packages/contracts/src/index.ts
  - docs/generated/api-surface-report.md
  - README.en.md
  - docs/en/architecture-contract.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/contracts Package Boundary

## Owner boundary

`packages/contracts` contains interfaces, DTOs, and cross-runtime contracts only. It is the public ABI layer for runtime capability types, HTTP policy types, desktop IPC command types, storage contracts, routing contracts, and shared DTO shapes.

## Public exports

The root export path `.` exposes type-only contract surfaces from `packages/contracts/src/index.ts`, including `RuntimeCapabilities`, `StorageAdapter`, `SafeStorageAdapter`, `DesktopIpcCommandName`, `HttpRequestConfig`, `BackendRouteContract`, and related DTO/type exports.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed imports are type-safe and runtime-neutral. The package should not need app packages, Vue runtime packages, browser APIs, Node APIs, Tauri APIs, storage, network, timers, or crypto.

## Forbidden moves

Do not move concrete HTTP/alova runtime, safeStorage crypto/compression/migration, UI components, app stores, app routers, or Tauri `invoke()` behavior into `packages/contracts`.

## Validation commands

```bash
pnpm api:report
pnpm arch:runtime
pnpm arch:boundaries
pnpm type-check
```

## Related pages

- [[monorepo-topology]]
- [[core-boundary]]
- [[runtime-isolation]]
- [[desktop-tauri-backend-boundary]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `packages/contracts/src/index.ts`
- `docs/generated/api-surface-report.md`
- `README.en.md`
- `docs/en/architecture-contract.md`
