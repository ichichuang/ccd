---
title_en: Source Provenance Policy
title_zh: 来源与证据策略
aliases:
  - Source Provenance Policy
  - 来源与证据策略
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
  - wiki/**
  - README.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Source Provenance Policy

Every significant architecture claim must trace to source evidence.

## Evidence hierarchy

1. Current repository source files, configs, manifests, workflows, scripts, and package exports.
2. `.ai/**` governance and AI control-plane files.
3. ADRs and governance docs.
4. Generated reports and snapshots as evidence views.
5. Historical docs and run archives as raw evidence, not canonical narrative.

## Wiki rule

Canonical pages compile evidence; they do not replace evidence. Generated-view pages under `wiki/generated/**` summarize coverage and drift status only.
