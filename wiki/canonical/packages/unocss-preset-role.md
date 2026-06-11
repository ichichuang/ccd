---
title_en: UnoCSS Preset Role
title_zh: UnoCSS 预设职责
aliases:
  - packages/unocss-preset
  - UnoCSS preset
  - UnoCSS 预设
tags:
  - packages
  - unocss
  - styling
tags_zh:
  - 包
  - 样式
  - UnoCSS
status: verified
confidence: 0.88
source_langs:
  - en
source_paths:
  - docs/generated/api-surface-report.md
  - docs/en/architecture-contract.md
  - package.json
  - packages/unocss-preset/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/unocss-preset Package Boundary

## Owner boundary

`packages/unocss-preset` owns shared UnoCSS preset configuration, safelist behavior, semantic shortcuts, icon collection helpers, and build-time style integration helpers.

## Public exports

The generated API report records export subpaths `.`, `./browser`, `./safelist`, and `./theme`, plus config and theme helper symbols.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed dependencies should match build-time style tooling and token integration needs.

## Forbidden moves

Do not add app runtime stores, router behavior, HTTP, Tauri, browser storage, or UI component ownership to this package.

## Validation commands

```bash
pnpm ci:smoke:unocss-tokens
pnpm arch:boundaries
pnpm api:report
pnpm type-check
```

## Related pages

- [[design-tokens-role]]
- [[package-responsibility-matrix]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/generated/api-surface-report.md`
- `docs/en/architecture-contract.md`
- `package.json`
- `packages/unocss-preset/**`
