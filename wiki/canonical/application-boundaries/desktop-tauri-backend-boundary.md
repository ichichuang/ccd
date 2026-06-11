---
title_en: Desktop Tauri Backend Boundary
title_zh: 桌面端 Tauri 后端边界
aliases:
  - src-tauri boundary
  - Tauri backend
  - 桌面后端边界
tags:
  - application-boundaries
  - desktop
  - tauri
  - ipc
tags_zh:
  - 应用边界
  - 桌面端
  - Tauri
  - IPC
status: verified
confidence: 0.96
source_langs:
  - en
source_paths:
  - wiki/**
  - wiki/**
  - wiki/**
  - apps/desktop/src/adapters/index.ts
  - apps/desktop/src-tauri/src/main.rs
  - apps/desktop/src-tauri/Cargo.toml
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Desktop Tauri Backend Boundary

The backend boundary for the desktop shell is `apps/desktop/src-tauri/**`. Current Rust code builds and runs the default Tauri app without registering Rust command handlers. Current frontend `invoke()` usage is contained in `apps/desktop/src/adapters/index.ts`, where payloads are validated before typed command names from `@ccd/contracts` are invoked.

## Current state

- `apps/desktop/src-tauri/Cargo.toml` depends only on `tauri` and `tauri-build` with empty feature arrays.
- `apps/desktop/src-tauri/src/main.rs` runs `tauri::Builder::default()` and does not register command handlers.
- `apps/desktop/src/adapters/index.ts` imports `invoke` from `@tauri-apps/api/core` and owns typed frontend adapter calls.
- No Tauri plugin permissions are granted by default.

## Future backend IPC lane rule

Real Rust command handlers and structured Rust IPC errors are P4 strategic guardrails. They must only be added through a future owner-approved backend IPC lane with a contract-first design, named command list, permission scope, validation commands, security rationale, and rollback plan.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/**`
- `wiki/**`
- `wiki/**`
- `apps/desktop/src/adapters/index.ts`
- `apps/desktop/src-tauri/src/main.rs`
- `apps/desktop/src-tauri/Cargo.toml`

## Related pages

- [[desktop-role]]
- [[desktop-runtime]]
- [[desktop-security-baseline]]
- [[adr-008-desktop-backend-ipc-and-updater-policy]]
