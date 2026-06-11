---
title_en: Product Scope Boundary
title_zh: 产品范围边界
aliases:
  - Scope boundary
  - No RMM expansion
  - 产品边界
  - 范围边界
tags:
  - governance
  - scope
  - guardrails
tags_zh:
  - 治理
  - 范围
  - 守卫
status: verified
confidence: 0.9
source_langs:
  - en
source_paths:
  - README.en.md
  - README.md
  - docs/governance/product-lines.md
  - docs/governance/strategic-guardrails.md
  - .ai/runtime/repair_list.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Product Scope Boundary

CCD is a deterministic multi-runtime platform architecture repository. The current wiki must not expand repository scope into product/RMM/document-management work, new organization creation, a starter repository, a standalone design-system repository, or product-line implementation.

## Current non-goals

- No product/RMM/document-management scope expansion.
- No new organization or repository as a substitute for current-repo architecture repair.
- No starter extraction until stable public APIs and release policy exist.
- No standalone design-system split until token/UI/PrimeVue boundaries are stable and approved.
- No UI ecosystem replacement without owner-approved gap analysis.
- No dependency modernization lane mixed with runtime, UI, desktop, or governance cleanup.

## Future lane rule

Future scope expansion must record owner approval, scope, allowed paths, forbidden paths, prerequisites, validation, rollback, and evidence before implementation begins.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.en.md`
- `README.md`
- `docs/governance/product-lines.md`
- `docs/governance/strategic-guardrails.md`
- `.ai/runtime/repair_list.md`

## Related pages

- [[strategic-guardrails]]
- [[release-policy]]
- [[package-responsibility-matrix]]
