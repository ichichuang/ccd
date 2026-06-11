---
title_en: Desktop Security Baseline
title_zh: 桌面端安全基线
aliases:
  - Tauri security baseline
  - Desktop security
  - 桌面安全
tags:
  - governance
  - desktop
  - security
  - tauri
tags_zh:
  - 治理
  - 桌面端
  - 安全
  - Tauri
status: verified
confidence: 0.97
source_langs:
  - en
source_paths:
  - wiki/**
  - apps/desktop/src-tauri/tauri.conf.json
  - apps/desktop/src-tauri/capabilities/default.json
  - apps/desktop/src-tauri/security-scopes.json
  - apps/desktop/src-tauri/Cargo.toml
  - apps/desktop/src-tauri/src/main.rs
  - apps/desktop/src/adapters/index.ts
  - scripts/architecture/desktop-security-rules.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Desktop Security Baseline

The current desktop security baseline remains least-privilege.

## Current posture

- `apps/desktop/src-tauri/tauri.conf.json` defines an explicit CSP and one `main` window.
- `assetProtocol.enable` is false with an empty scope.
- `capabilities/default.json` defines one local `default` capability for the `main` window and grants no Tauri core or plugin permissions.
- `security-scopes.json` sets `defaultDecision` to `deny`.
- Filesystem, shell, dialog, clipboard, updater, opener, notification, HTTP, and external-navigation surfaces are disabled with empty `allow` lists and `deny: ["*"]`.
- `Cargo.toml` uses `tauri` and `tauri-build` with empty feature arrays and no `tauri-plugin-*` crates.
- `src/main.rs` does not register Rust command handlers.
- `apps/desktop/src/adapters/index.ts` is the current frontend adapter using `@tauri-apps/api/core` `invoke()`.

## Validation commands

```bash
pnpm desktop:security
pnpm desktop:smoke
pnpm build:desktop
cargo check --locked --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Deferred security lanes

Rust command handlers, structured Rust-side IPC errors, updater, and deep-link support remain P4 strategic guardrails. The first valid step is owner/security approval and scoped lane planning, not implementation.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/**`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/capabilities/default.json`
- `apps/desktop/src-tauri/security-scopes.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/src/main.rs`
- `apps/desktop/src/adapters/index.ts`
- `scripts/architecture/desktop-security-rules.mjs`

## Related pages

- [[desktop-role]]
- [[desktop-runtime]]
- [[desktop-tauri-backend-boundary]]
- [[strategic-guardrails]]
