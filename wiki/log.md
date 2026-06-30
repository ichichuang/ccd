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
last_reviewed: '2026-06-30'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Wiki Log

## [2026-06-30] decisions | ProTreeTable server/lazy adapter contract decision

- Updated [[adr-009-pro-tree-table-api-decision]] with the P2-B2 server/lazy adapter contract decision.
- Preserved current `lazy` and `loadChildren` behavior as the local child-loading contract.
- Documented future root/server adapter shape, root and child load payloads, error/retry context,
  root-only pagination ownership, filter/sort ownership, selection/expansion snapshots, durable child
  persistence ownership, stale response handling, and CCD-owned event payload rules.
- Rejected `ProTableLoadParams` reuse for tree server/lazy contracts and kept `ProTable treeMode`
  rejected.
- Synchronized the ProTreeTable README server/lazy status note without changing runtime source,
  generated reports, dependencies, or flat `ProTable` files.

## [2026-06-30] decisions | ProTreeTable filtering contract decision

- Updated [[adr-009-pro-tree-table-api-decision]] with the P2-B1 filtering contract research and docs-only decision.
- Recorded that `filterable` remains typed but unwired and does not enable PrimeVue filters, local filtering, or server/lazy filtering.
- Documented local/server filtering options, parent/descendant semantics, collapsed-branch reveal behavior, lazy-unloaded child boundaries, future filter state shape, and runtime acceptance criteria.
- Synchronized the ProTreeTable README filtering status note without changing runtime source, generated reports, dependencies, or flat `ProTable` files.

## [2026-06-30] decisions | ProTreeTable P2-A closure and P2-B stabilization

- Updated [[adr-009-pro-tree-table-api-decision]] as the P2-B0 stabilization status sync and issue list.
- Recorded P2-A1 through P2-A6 as complete, with P2-A6 as a read-only decision gate.
- Preserved the decision to keep `ProTreeTable` as an independent experimental wrapper and continue rejecting `ProTable treeMode` for now.
- Added the prioritized P2-B stabilization backlog, acceptance criteria, rollback plan, and future runtime feature decision gates.
- Synchronized the ProTreeTable README status note and decision indexes without changing runtime source, generated reports, dependencies, or flat `ProTable` files.

## [2026-06-30] decisions | ProTreeTable API decision

- Added [[adr-009-pro-tree-table-api-decision]] as the P2-A0 design-only decision for future Tree table support.
- Recorded the decision to start with an experimental `ProTreeTable` wrapper inside `@ccd/vue-ui` instead of extending flat `ProTable` with `treeMode`.
- Deferred tree editing, virtual scrolling, Shift-click tree range selection, footer groups, advanced tree group styling, server persistence, and shared headless hierarchy work.
- Preserved current runtime behavior: no package exports, generated reports, dependencies, or ProTable implementation files changed.

## [2026-06-12] web-demo-architecture-console | Retire example surface

- Branch: `ui/web-demo-architecture-console` from `origin/main`.
- Added [[web-demo-architecture-console]] as the canonical page for the focused web-demo Architecture Console.
- Documented the route taxonomy `/dashboard`, `/architecture`, `/runtime`, `/ui`, `/system`, and `/desktop`.
- Recorded route-count evidence: 99 retired `/example` records and 106 registered records before rebuild; 24 static business records and 30 registered records after rebuild.
- Updated web-demo role, app-local shared candidates, quickstart, validation gates, application-boundaries indexes, Chinese presentation indexes, and wiki navigation.
- Preserved P4 strategic guardrails: no HTTP/core promotion, no safeStorage/shared-utils promotion, no PrimeVue replacement, no desktop/Tauri refactor.

## [2026-06-11] ingest | Initial CCD architecture wiki generation

- Source repo/ref: `https://github.com/ichichuang/ccd` @ `main`.
- Observed GitHub search commit for many repository paths: `b1c755e35a633d0d6303a62828fa51e339d39915`.
- Pattern source: uploaded `llm-wiki.md`.
- Planning input: uploaded `deep-research-report.md`.
- Generated canonical domains: architecture, packages, apps, runtime, governance, decisions, operations.
- Generated presentation domains: `indexes-zh/**` and `maps-zh/**` markdown fallback maps.
- Generated evidence views: `source-coverage.md`, `orphan-pages.md`, `missing-frontmatter.md`, `low-confidence-pages.md`.
- Validation performed locally on generated staging package: canonical frontmatter fields, English canonical filenames, non-empty `source_paths`, Chinese index backlinks, index/log existence, excluded build/cache directories, and ZIP root layout.
- Repository mutation: none. No remote writes, no commits, no PRs, no GitHub settings changes.

## [2026-06-11] wiki-only-policy | Legacy documentation retirement

- Branch: `docs/retire-legacy-docs` from `origin/main`.
- Root `README.md` and `README.en.md` are thin portals to `wiki/index.md`, `wiki/indexes-zh/开始阅读.md`, `wiki/indexes/ai-entry.md`, command surface, and validation gates.
- Wiki validation covers frontmatter, wikilinks, markdown links, source-path provenance, duplicate basenames, confidence, orphans, and generated wiki summaries.
- Generated governance evidence targets `wiki/generated/**`.
- Historical material is retained in Git history only under the owner-approved retirement policy.
