---
title_en: Troubleshooting
title_zh: 故障排查
aliases:
  - Troubleshooting contract
  - Debugging
  - 故障处理
tags:
  - operations
  - troubleshooting
tags_zh:
  - 运维
  - 故障排查
status: verified
confidence: 0.82
source_langs:
  - en
  - zh
source_paths:
  - wiki/**
  - wiki/**
  - README.en.md
  - package.json
  - .github/workflows/ci.yml
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Troubleshooting

Troubleshooting starts from the smallest failing command and escalates only as needed. Do not replace targeted diagnosis with broad rebuilds, broad dependency upgrades, or architecture moves.

## Common first checks

```bash
pnpm wiki:commands
pnpm project:doctor
pnpm arch:runtime
pnpm arch:boundaries
pnpm type-check
pnpm lint:check
```

## Architecture failures

- Runtime leak: inspect exact file and runtime surface, then compare against `.ai/governance/policies/runtime.json`.
- Package boundary failure: check imports, deep imports, app-to-app imports, source globs, and public exports.
- API surface drift: run `pnpm api:report` and review generated output.
- Generated drift: fix source/generator, do not hand-edit generated files.
- Desktop security failure: inspect `apps/desktop/src-tauri/**`, `apps/desktop/src/adapters/**`, and `scripts/architecture/desktop-security-rules.mjs`.

## Escalation

Use `pnpm governance:gate` when a change touches architecture, governance, public API, dependency policy, generated evidence, or runtime boundaries. Use `pnpm validate` before merge-level confidence.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/**`
- `wiki/**`
- `README.en.md`
- `package.json`
- `.github/workflows/ci.yml`

## Related pages

- [[command-surface]]
- [[validation-gates]]
- [[desktop-security-baseline]]
