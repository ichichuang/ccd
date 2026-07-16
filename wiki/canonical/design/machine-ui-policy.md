---
title_en: Machine UI Policy
title_zh: 机器 UI 策略
aliases:
  - machine-ui-policy
  - CCD Machine UI Policy
tags:
  - design
  - ui
  - governance
  - policy
tags_zh:
  - 设计
  - UI
  - 治理
  - 策略
status: published
confidence: 0.95
source_langs:
  - en
source_paths:
  - .ai/governance/policies/ui.json
  - .ai/governance/ui/schemas/**
  - .ai/governance/ui/profiles/ccd-architectural-glass.json
  - .ai/governance/ui/exceptions.json
  - .ai/governance/ui/scripts/validate-ui-policy.mjs
last_reviewed: '2026-07-15'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Machine UI Policy

The CCD Machine UI Policy is the canonical machine-readable UI governance artifact for the CCD monorepo. P3 implementation is complete: the policy records 68 rules, schemas, the Product UI Profile, an empty exception registry, fixtures, and a deterministic validator. Application-source enforcement remains baseline-only because the source scanner is not implemented.

## Policy Location

- `.ai/governance/policies/ui.json`

## Validation

```bash
node .ai/governance/ui/scripts/validate-ui-policy.mjs
pnpm ui:policy:validate
```

## Scope

The policy covers 14 semantic-obligation clusters:

1. Component priority and native-structural boundaries
2. Form abstraction and ownership
3. Chart ownership and ECharts theming
4. Feedback, overlays, and focus ownership
5. PrimeVue PassThrough ownership and conflict prevention
6. Deep-selector prohibition and finite exact eligibility
7. Visual constants, inline styles, UnoCSS boundaries
8. Themes, contrast, and color contract
9. Responsive ownership and breakpoints
10. Layout roots, scrolling, and safe areas
11. Material, glass safety, z-index, optical depth, borders, shadows
12. Product UI Profile and product-language review
13. Accessibility, state visibility, theme-state preservation
14. Motion ownership, reduced motion, cleanup, performance, runtime-state ownership, listener lifecycle, initialization idempotency, UI-only behavior preservation

## Rule Model

- 68 canonical rules: `CCD-UI-001` through `CCD-UI-068`.
- Each rule maps from one current P2 candidate requirement (`P2C-REQ-XXXX`).
- Candidate dispositions: `permanent-rule` or `human-review-only` across the exact 68-member handoff inventory.
- Rule enforcement states: `schema-validated`, `source-scanner-not-yet-implemented`, or `human-review-only`.
- Four future Page Contract deferrals remain a separate non-candidate collection.
- Exception eligibility is narrowly scoped to the deep-selector rule (`CCD-UI-064`).

## Schemas

- `.ai/governance/ui/schemas/ui-policy.schema.json`
- `.ai/governance/ui/schemas/product-ui-profile.schema.json`
- `.ai/governance/ui/schemas/ui-exception.schema.json`
- `.ai/governance/ui/schemas/ui-exception-registry.schema.json`

## Product UI Profile

Current profile: `CCD Architectural Glass` at `.ai/governance/ui/profiles/ccd-architectural-glass.json`.

## Exception Registry

`.ai/governance/ui/exceptions.json` contains exactly zero real exceptions. Valid and invalid exception examples live only in fixtures.

## Fixtures

- `.ai/governance/ui/fixtures/schema-valid/**`
- `.ai/governance/ui/fixtures/schema-invalid/**`
- `.ai/governance/ui/fixtures/rule-cases.json`

## Lifecycle

- P3 Machine UI Policy: complete.
- Policy schemas, Product UI Profile, exception registry, fixtures, and validator: present.
- Source scanner: not implemented.
- Page Contract Schema: not created.
- P4 AI cold-start atomic replacement: complete.
- P5 routing/synchronization: not started.

```text
P3_COMPLETE=yes
MACHINE_UI_POLICY_COMPLETE=yes
MACHINE_UI_POLICY_PRESENT=yes
POLICY_SCHEMAS_PRESENT=yes
PRODUCT_UI_PROFILE_PRESENT=yes
EXCEPTION_REGISTRY_PRESENT=yes
EXCEPTION_COUNT=0
POLICY_FIXTURES_PRESENT=yes
POLICY_VALIDATOR_PRESENT=yes
P4_STARTED=yes
P4_COMPLETE=yes
COLD_START_ATOMIC_REPLACEMENT_COMPLETE=yes
AGENTS_TRACKED=yes
CLAUDE_TRACKED=yes
CLAUDE_ADAPTER_TRACKED=yes
ADAPTER_MANIFEST_COLD_START_COMPLETE=yes
ADAPTER_GENERATION_DETERMINISTIC=yes
AI_SYNC_IDEMPOTENT=yes
FRESH_CLONE_ENTRYPOINTS_PASS=yes
SOURCE_SCANNER_IMPLEMENTED=no
PAGE_CONTRACT_CREATED=no
PROJECT_UI_DISCOVERED=no
PROJECT_UI_ROUTED=no
PROJECT_UI_SYNCHRONIZED=no
PROJECT_UI_ADAPTER_ACTIVATED=no
P5_STARTED=no
```
