---
title_en: Wiki Validation Summary
title_zh: Wiki 验证摘要
aliases:
  - validation summary
  - 验证摘要
tags:
  - generated
  - validation
tags_zh:
  - 生成视图
  - 验证
status: published
confidence: 0.86
source_langs:
  - en
source_paths:
  - wiki/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Wiki Validation Summary

Generated locally for this package.

```json
{
  "canonical_frontmatter_required_fields": {
    "ok": true,
    "errors": []
  },
  "canonical_english_filenames": {
    "ok": true,
    "errors": []
  },
  "canonical_source_paths_non_empty": {
    "ok": true,
    "errors": []
  },
  "chinese_presentation_backlinks": {
    "ok": true,
    "errors": []
  },
  "index_and_log_exist": {
    "ok": true,
    "errors": []
  },
  "excluded_build_cache_dirs": {
    "ok": true,
    "errors": []
  },
  "staging_only_no_repo_mutation": {
    "ok": true,
    "note": "Generated only under /mnt/data/ccd-wiki-staging/wiki; no local repository checkout or remote mutation was performed."
  },
  "repo_command_validation": {
    "ok": false,
    "skipped": true,
    "note": "Skipped `pnpm docs:commands` and `git diff --check` because the environment could not clone github.com and the GitHub connector is read-only. Command existence was cross-checked against fetched `package.json`."
  }
}
```
