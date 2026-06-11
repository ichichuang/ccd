---
title_en: Desktop Role
title_zh: 桌面端职责
aliases:
  - apps/desktop
  - Tauri desktop shell
  - 桌面运行时外壳
tags:
  - application-boundaries
  - desktop
  - tauri
tags_zh:
  - 应用边界
  - 桌面端
  - Tauri
status: verified
confidence: 0.95
source_langs:
  - en
source_paths:
  - README.md
  - README.en.md
  - wiki/**
  - wiki/**
  - apps/desktop/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Desktop Role

`apps/desktop` is the dedicated Tauri v2 runtime shell for CCD. It has its own frontend entry, desktop adapters, and `apps/desktop/src-tauri/**` backend boundary. It is not a full duplicate of `apps/web-demo`.

## Owned surfaces

- Vue 3 + Vite desktop frontend running inside a Tauri WebView.
- Desktop app adapters under `apps/desktop/src/adapters/**`.
- Tauri backend boundary under `apps/desktop/src-tauri/**`.
- Desktop app bootstrap/theme integration that is app-local and explicitly classified.
- Consumption of shared packages through public exports after internal package preparation.

## Forbidden promotions

- Do not scatter `@tauri-apps/*` imports or `invoke()` outside desktop adapters.
- Do not add Rust command handlers without a real backend capability and audited typed IPC boundary.
- Do not enable updater, deep-link, shell, fs, http, opener, notification, clipboard, or other sensitive plugins without an owner/security-approved trust model.

## Validation commands

```bash
pnpm dev:desktop
pnpm build:desktop
pnpm desktop:security
pnpm desktop:smoke
pnpm budget:desktop
cargo check --locked --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.md`
- `README.en.md`
- `wiki/**`
- `wiki/**`
- `apps/desktop/**`

## Related pages

- [[desktop-runtime]]
- [[desktop-tauri-backend-boundary]]
- [[desktop-security-baseline]]
- [[strategic-guardrails]]
