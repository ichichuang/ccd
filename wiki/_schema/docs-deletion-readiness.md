---
title_en: Docs Deletion Readiness
title_zh: docs 删除就绪标准
aliases:
  - Docs Deletion Readiness
  - docs 删除就绪标准
tags:
  - schema
  - wiki-governance
tags_zh:
  - 模式
  - Wiki 治理
status: published
confidence: 0.93
source_langs:
  - en
  - zh
source_paths:
  - uploaded://llm-wiki.md
  - README.en.md
  - docs/documentation-system.md
  - docs/README.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# `/docs` Deletion Readiness

`/docs` must not be deleted until all criteria pass.

## Required criteria

- Every current `/docs` item is mapped in `wiki/indexes/migration-map.md`.
- Each mapped item has a disposition: canonical page, raw archive, generated view, compatibility shim, skipped/obsolete, or not-yet-migrated.
- Every canonical page has required frontmatter and non-empty `source_paths`.
- Chinese presentation views exist without duplicating canonical bodies.
- README and README.en.md have cut over to `/wiki` as the architecture KB portal.
- Link validation passes for wiki links and repo path references.
- Generated evidence remains reachable from `wiki/generated/**` or evidence indexes.
- Historical docs that must survive `/docs` deletion are archived under `wiki/raw/repo-archive/**` or another immutable evidence location.
- `pnpm docs:commands`, `pnpm governance:gate`, and targeted runtime/desktop commands pass in a real checkout.
