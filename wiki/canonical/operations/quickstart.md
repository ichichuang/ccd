---
title_en: Quickstart
title_zh: 快速开始
aliases:
  - Getting started
  - Onboarding
  - 快速上手
tags:
  - operations
  - quickstart
  - onboarding
tags_zh:
  - 运维
  - 快速开始
  - 入门
status: verified
confidence: 0.88
source_langs:
  - zh
  - en
source_paths:
  - README.md
  - README.en.md
  - docs/zh/01-quickstart.md
  - package.json
  - mise.toml
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Quickstart

Use Node.js `24.x` and pnpm `>= 10.0.0`. Node 24 is an intentional repository policy, not a temporary minimum.

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
pnpm install --frozen-lockfile
pnpm dev:web-demo
```

## First reading path

1. `wiki/index.md`
2. `wiki/indexes-zh/开始阅读.md` for Chinese presentation navigation
3. [[monorepo-topology]]
4. [[package-responsibility-matrix]]
5. [[runtime-isolation]]
6. [[command-surface]]
7. [[validation-gates]]

## Safe first validation

```bash
pnpm docs:commands
pnpm project:doctor
pnpm arch:runtime
pnpm arch:boundaries
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.md`
- `README.en.md`
- `docs/zh/01-quickstart.md`
- `package.json`
- `mise.toml`

## Related pages

- [[monorepo-topology]]
- [[command-surface]]
- [[validation-gates]]
