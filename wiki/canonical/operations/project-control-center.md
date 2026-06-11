---
title_en: Project Control Center
title_zh: 项目主控中心
aliases:
  - Project control center
  - Operations control surface
  - 项目主控中心
tags:
  - operations
  - commands
  - governance
tags_zh:
  - 运维
  - 命令
  - 治理
status: verified
confidence: 0.91
source_langs:
  - en
  - zh
source_paths:
  - wiki/**
  - wiki/**
  - package.json
  - scripts/project-config.mjs
  - scripts/validate-workspace.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Project Control Center

The project control center is the operational entry for repository health, command selection, generated governance checks, and validation sequencing. It is not a new runtime surface and does not replace executable truth in `package.json`, `scripts/**`, or `.github/workflows/**`.

## Current command surface

- `pnpm project:doctor` checks project metadata and governed configuration.
- `pnpm wiki:commands` validates documented `pnpm` command references against root `package.json`.
- `pnpm wiki:validate` validates wiki frontmatter, wikilinks, source provenance, and current wiki source provenance.
- `pnpm check` is the fast local feedback gate.
- `pnpm validate` is the full local validation gate.
- `pnpm build:ci` is the CI Core Quality parity gate.

Before documenting any command, confirm it exists in `package.json`. Generated facts under `wiki/generated/**`, `.ai/generated/**`, and `.ai/governance/api-snapshots/**` must be refreshed through their owning scripts, not hand-edited.

## Boundary

The control center is a navigation and governance concept. It must not become an application runtime, a new public API, or a replacement for the existing script and workflow gates.

## Evidence paths

- `wiki/**`
- `wiki/**`
- `package.json`
- `scripts/project-config.mjs`
- `scripts/validate-workspace.mjs`

## Related pages

- [[command-surface]]
- [[validation-gates]]
- [[generated-artifact-policy]]
