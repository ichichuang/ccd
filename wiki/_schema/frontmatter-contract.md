---
title_en: Frontmatter Contract
title_zh: Frontmatter 合约
aliases:
  - Frontmatter Contract
  - Frontmatter 合约
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

# Frontmatter Contract

Every canonical page must include:

```yaml
title_en: Canonical English title
title_zh: Chinese display title
aliases: []
tags: []
tags_zh: []
status: draft | verified | published | deprecated
confidence: 0.0
source_langs: []
source_paths: []
last_reviewed: YYYY-MM-DD
wiki_owner: LLM-maintained CCD architecture wiki
```

## Rules

- `source_paths` must point to repo evidence paths or explicit uploaded/external source identifiers.
- Canonical filenames use English kebab-case.
- `title_en` should match the H1 closely.
- `title_zh` is a display title, not a second canonical body.
- `aliases` should include real search terms, legacy names, abbreviations, and Chinese reader terms.
