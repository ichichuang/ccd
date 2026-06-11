---
title_en: Release Policy
title_zh: 发布策略
aliases:
  - Release governance
  - Versioning
  - 发布治理
tags:
  - operations
  - release
  - governance
tags_zh:
  - 运维
  - 发布
  - 治理
status: verified
confidence: 0.86
source_langs:
  - en
  - zh
source_paths:
  - wiki/**
  - wiki/**
  - package.json
  - scripts/architecture/check-release-governance.mjs
  - scripts/architecture/release-audit.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Release Policy

Release work is governed by repository policy, package API surface checks, generated governance evidence, and release audit commands. This page is the wiki-level entry; executable truth remains in scripts and package manifests.

## Release principles

- Release topology changes must preserve package boundaries and public exports.
- Generated API reports and snapshots are evidence for public surface changes.
- Dependency modernization, Vite major migration, UI changes, and desktop security changes remain isolated lanes.
- Runtime promotions require explicit approval and validation.

## Validation commands

```bash
pnpm release:governance
pnpm release:audit
pnpm validate:release
pnpm api:report
pnpm governance:gate
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/**`
- `wiki/**`
- `package.json`
- `scripts/architecture/check-release-governance.mjs`
- `scripts/architecture/release-audit.mjs`

## Related pages

- [[runtime-promotion-checklist]]
- [[dependency-governance]]
- [[generated-artifact-policy]]
