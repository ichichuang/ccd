---
title_en: UI Source Enforcement
title_zh: UI 源码治理
aliases:
  - UI Source Enforcement
  - UI 源码治理
tags:
  - design
  - governance
status: published
confidence: 0.95
source_langs:
  - en
source_paths:
  - .ai/governance/ui/source-enforcement.json
  - .ai/governance/ui/source-coverage.json
  - .ai/governance/ui/source-baseline.json
last_reviewed: '2026-07-19'
wiki_owner: LLM-maintained CCD architecture wiki
---

# UI Source Enforcement

CCD has an active static UI source scanner and strict source-enforcement ratchet. The scanner reads the frozen machine UI policy, source coverage, parser, scope, owner, detector, diagnostic, exception, and canonical baseline authority without modifying application or package source.

The deterministic canonical P5 debt baseline is adopted at `.ai/governance/ui/source-baseline.json`. It records 393 accepted historical findings across 554 governed P5 files and 20 nonoverlapping scopes. Those findings are historical debt, not proof of compliance. Product debt was not repaired, and the real exception registry remains empty.

## Terminal scanner lifecycle

```text
SOURCE_SCANNER_CODE_AVAILABLE=yes
SOURCE_SCANNER_AUDIT_AVAILABLE=yes
SOURCE_SCANNER_IMPLEMENTED=yes
SOURCE_ENFORCEMENT_ACTIVE=yes
CANONICAL_SOURCE_BASELINE_PRESENT=yes
STRICT_SOURCE_RATCHET_ACTIVE=yes
PRODUCT_DEBT_REPAIRED=no
REAL_EXCEPTION_COUNT=0
PAGE_CONTRACT_CREATED=no
LEGACY_SKILLS_RETIRED=no
LEGACY_RULES_RETIRED=no
P6_5_BASELINE_RATCHET_ACTIVATION=yes
```

The scanner executes 12 source detectors across 24 source-enforceable rules and 22 assisted rules. Eight schema-owned rules remain schema-validated, and 14 human-review-only rules remain outside deterministic source authority. Page Contract work has not started, and all legacy Skills and rules remain present.

The ratchet rejects new fingerprints, count increases, new-file findings, stale entries, count decreases without explicit baseline pruning, removed files, moved debt, repository or baseline-commit drift, policy or manifest digest drift, and scanner-module digest drift.

## Commands

- `pnpm ui:source:scan -- --format json` performs the live audit against the canonical baseline.
- `pnpm ui:source:validate` validates authority, fixtures, acquisition modes, parsers, scopes, owners, diagnostics, safety, performance, baseline identity, and the strict ratchet.
- `node .ai/governance/ui/scripts/scan-ui-source.mjs --ref f8acb7fbbfef0c681affb74e08336ec8bc72bca0 --check-baseline --format json` reproduces and checks the accepted P5 source authority from Git objects.

P6 implementation and local commit are completed by P6.6. P6.7 performs external push, CI, deployment, and remote-authority acceptance. Remote acceptance is operational evidence and is not encoded as a repository lifecycle marker.
