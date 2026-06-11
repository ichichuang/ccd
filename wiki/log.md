---
title_en: Wiki Log
title_zh: Wiki 日志
aliases:
  - Change log
  - 维护日志
tags:
  - log
  - published
tags_zh:
  - 日志
  - 已发布
status: published
confidence: 0.95
source_langs:
  - en
source_paths:
  - wiki/**
  - uploaded://llm-wiki.md
  - uploaded://deep-research-report.md
  - https://github.com/ichichuang/ccd
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Wiki Log

## [2026-06-11] ingest | Initial CCD architecture wiki generation

- Source repo/ref: `https://github.com/ichichuang/ccd` @ `main`.
- Observed GitHub search commit for many repository paths: `b1c755e35a633d0d6303a62828fa51e339d39915`.
- Pattern source: uploaded `llm-wiki.md`.
- Planning input: uploaded `deep-research-report.md`.
- Generated canonical domains: architecture, packages, apps, runtime, governance, decisions, operations.
- Generated presentation domains: `indexes-zh/**` and `maps-zh/**` markdown fallback maps.
- Generated evidence views: `source-coverage.md`, `docs-migration-status.md`, `orphan-pages.md`, `missing-frontmatter.md`, `low-confidence-pages.md`.
- Validation performed locally on generated staging package: canonical frontmatter fields, English canonical filenames, non-empty `source_paths`, Chinese index backlinks, index/log existence, excluded build/cache directories, and ZIP root layout.
- Repository mutation: none. No remote writes, no commits, no PRs, no GitHub settings changes, no `/docs` deletion.

## [2026-06-11] cutover-readiness | README portal and docs migration inventory

- Branch: `docs/wiki-cutover-readiness` from `origin/main`.
- Actual remote heads check: `git ls-remote --heads origin` returned only `refs/heads/main`; stale local remote-tracking refs were not treated as live heads.
- Renamed wiki app role domain from `wiki/canonical/apps/**` to `wiki/canonical/application-boundaries/**` and updated the domain index to avoid ambiguity with source `apps/**`.
- Added `pnpm wiki:refresh` and `pnpm wiki:validate` for frontmatter, wikilink, source-path, migration inventory, and deletion-readiness checks.
- Rebuilt `README.md` and `README.en.md` as thin portals to `wiki/index.md`, `wiki/indexes-zh/开始阅读.md`, `wiki/indexes/ai-entry.md`, and generated evidence indexes.
- Converted `docs/README.md` into a legacy compatibility shim because `/docs` deletion readiness did not pass.
- Generated exact `/docs` inventory from `find docs -type f`: 2,618 files, 0 unmapped blockers, 50 canonical dispositions, 2,537 raw archive dispositions, 19 generated evidence dispositions, 1 compatibility shim, and 11 obsolete/skip dispositions.
- `/docs` deletion decision: keep `/docs`; raw archive preservation is index-level only and not fully copied into immutable `wiki/raw/repo-archive/**` paths.
- Validation performed before final lane validation: `pnpm wiki:refresh`, `pnpm wiki:validate`, `pnpm docs:commands`.
