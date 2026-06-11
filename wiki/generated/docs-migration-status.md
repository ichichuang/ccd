---
title_en: Docs Migration Status
title_zh: docs 迁移状态
aliases:
  - migration status
  - 迁移状态
tags:
  - generated
  - migration
tags_zh:
  - 生成视图
  - 迁移
status: published
confidence: 0.90
source_langs:
  - en
source_paths:
  - wiki/indexes/migration-map.md
  - docs/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Docs Migration Status

Generated view from `pnpm wiki:refresh`. It summarizes readiness; the exact file-level map is [[migration-map]].

| Metric                          | Value |
| ------------------------------- | ----: |
| `docs/**` files inventoried     |  2618 |
| Canonical page dispositions     |    50 |
| Raw archive dispositions        |  2537 |
| Generated evidence dispositions |    19 |
| Compatibility shims             |     1 |
| Obsolete/skip dispositions      |    11 |
| Blockers                        |     0 |
| `/docs` deletion ready          |    No |

## Current result

`/docs` is kept as a legacy compatibility and evidence layer in this lane.

## Deletion blockers

- Raw archive preservation complete: Raw archive rows are indexed, but historical `/docs` files are not fully copied into immutable `wiki/raw/repo-archive/**` paths.
- Repository validation recorded: This generated report does not embed final command logs; final PR report must list fresh validation results.
