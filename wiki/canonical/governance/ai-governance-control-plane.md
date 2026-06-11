---
title_en: AI Governance Control Plane
title_zh: AI 治理控制面
aliases:
  - .ai control plane
  - AI workspace
  - AI 控制面
tags:
  - governance
  - ai
  - control-plane
tags_zh:
  - 治理
  - AI
  - 控制面
status: verified
confidence: 0.94
source_langs:
  - en
source_paths:
  - .ai/README.md
  - .ai/protocol/**
  - .ai/rules/**
  - .ai/skills/**
  - .ai/manifests/**
  - .ai/governance/policies/**
  - .ai/runtime/repair_list.md
  - README.en.md
  - wiki/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# AI Governance Control Plane

`.ai/**` is the canonical control plane for AI execution, architecture policy, generated adapters, and machine-enforced repository governance. The wiki summarizes this plane but does not replace it.

## Canonical AI paths

| Path                              | Role                                                       |
| --------------------------------- | ---------------------------------------------------------- |
| `.ai/protocol/**`                 | Agent entrypoints, adapter contracts, protocol versioning. |
| `.ai/rules/**`                    | Architecture and implementation laws.                      |
| `.ai/skills/**`                   | Local AI execution skills.                                 |
| `.ai/manifests/**`                | Generated routing, rule, and skill locks.                  |
| `.ai/governance/policies/**`      | Machine-readable architecture policy engine.               |
| `.ai/governance/api-snapshots/**` | Public API immutability baselines.                         |
| `.ai/generated/**`                | Generated governance reports.                              |
| `.ai/runtime/**`                  | Local runtime ledger and execution state.                  |
| `.ai/orchestration/**`            | Agent and role orchestration manifests.                    |

## Wiki relationship

The wiki is the compiled knowledge layer. `.ai/**`, scripts, generated reports, and current source files remain evidence and enforcement surfaces.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `.ai/README.md`
- `.ai/protocol/**`
- `.ai/rules/**`
- `.ai/skills/**`
- `.ai/manifests/**`
- `.ai/governance/policies/**`
- `.ai/runtime/repair_list.md`
- `README.en.md`
- `wiki/**`

## Related pages

- [[generated-artifact-policy]]
- [[validation-gates]]
- [[strategic-guardrails]]
- [[source-provenance-policy]]
