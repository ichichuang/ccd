---
title_en: Command Surface
title_zh: 命令表面
aliases:
  - package scripts
  - Command contract
  - 命令契约
tags:
  - governance
  - commands
  - operations
tags_zh:
  - 治理
  - 命令
  - 运维
status: verified
confidence: 0.95
source_langs:
  - en
source_paths:
  - package.json
  - README.en.md
  - wiki/**
  - .ai/README.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Command Surface

`package.json` is the command source of truth. Documentation must not invent commands. Before documenting or invoking a command, confirm it exists in `scripts`.

## Canonical command groups

| Group             | Commands                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Project health    | `pnpm project:doctor`, `pnpm ccd:doctor`, `pnpm ccd:fix`, `pnpm validate`                                                    |
| Governance        | `pnpm governance:refresh`, `pnpm governance:gate`, `pnpm governance:github-workflows`, `pnpm wiki:commands`                  |
| Architecture      | `pnpm arch:boundaries`, `pnpm arch:runtime`, `pnpm api:report`, `pnpm arch:graphs`                                           |
| Build             | `pnpm ci:prepare-internal`, `pnpm build:web-demo`, `pnpm build:desktop`, `pnpm build:ci`, `pnpm vercel:build`                |
| Desktop           | `pnpm desktop:security`, `pnpm desktop:smoke`, `pnpm desktop:smoke:dev`, `pnpm desktop:smoke:release`, `pnpm budget:desktop` |
| Quality           | `pnpm type-check`, `pnpm lint:check`, `pnpm test:run`, `pnpm e2e:qa`                                                         |
| Dependency policy | `pnpm deps:catalog:check`, `pnpm deps:scan`, `pnpm supply:check`                                                             |
| AI control plane  | `pnpm ai:sync`, `pnpm ai:sync:codex`, `pnpm ai:doctor`, `pnpm codex:preflight`                                               |

## Documentation rule

Run or at least validate `pnpm wiki:commands` before merging documentation changes that mention commands.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `package.json`
- `README.en.md`
- `wiki/**`
- `.ai/README.md`

## Related pages

- [[validation-gates]]
- [[execute-reliability]]
- [[ci-and-deploy]]
