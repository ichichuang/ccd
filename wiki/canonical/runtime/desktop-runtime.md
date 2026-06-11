---
title_en: Desktop Runtime
title_zh: 桌面端运行时
aliases:
  - Tauri runtime
  - Desktop shell runtime
  - Tauri 运行时
tags:
  - runtime
  - desktop
  - tauri
tags_zh:
  - 运行时
  - 桌面端
  - Tauri
status: verified
confidence: 0.96
source_langs:
  - en
source_paths:
  - wiki/**
  - wiki/**
  - apps/desktop/src/adapters/index.ts
  - apps/desktop/src-tauri/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Desktop Runtime

## Allowed runtime surfaces

`apps/desktop` is a dedicated Tauri v2 shell with its own frontend entry, desktop adapters, and `src-tauri` backend boundary. Tauri APIs and `invoke()` are allowed only in `apps/desktop/src/adapters/**`.

## Forbidden promotions

Do not add Rust commands, structured IPC errors, updater, deep-link, shell, fs, HTTP plugin, opener, notification, clipboard, or external navigation surfaces without future owner/security approval.

## Adapter ownership

Desktop adapters translate contract-defined capabilities to Tauri frontend IPC calls. They validate payloads and keep `invoke()` out of UI code.

## Validation commands

```bash
pnpm desktop:security
pnpm desktop:smoke:dev
pnpm desktop:smoke:release
pnpm desktop:smoke
pnpm build:desktop
cargo check --locked --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/**`
- `wiki/**`
- `apps/desktop/src/adapters/index.ts`
- `apps/desktop/src-tauri/**`

## Related pages

- [[desktop-role]]
- [[desktop-tauri-backend-boundary]]
- [[desktop-security-baseline]]
- [[adr-008-desktop-backend-ipc-and-updater-policy]]
