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
  - .ai/governance/ui/source-enforcement.json
  - .ai/governance/ui/source-coverage.json
  - .ai/governance/ui/source-baseline.json
  - .ai/governance/ui/schemas/**
  - .ai/governance/ui/profiles/ccd-architectural-glass.json
  - .ai/governance/ui/exceptions.json
  - .ai/governance/ui/scripts/validate-ui-policy.mjs
last_reviewed: '2026-07-19'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Machine UI Policy

The CCD Machine UI Policy is the canonical machine-readable UI governance artifact for the CCD monorepo. P3 implementation is complete: the policy records 68 rules, schemas, the Product UI Profile, an empty exception registry, fixtures, and a deterministic validator. P5 project-ui routing and synchronization are terminal. P6 source scanning is implemented, the canonical P5 debt baseline is adopted, and the strict new-fingerprint and count-increase ratchet is active.

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
- P3 `ui.json` retains each rule's original policy disposition and historical enforcement metadata; `source-scanner-not-yet-implemented` is historical P3 metadata, not the current effective P6 enforcement state.
- Effective P6 source classification and final enforcement are owned by `.ai/governance/ui/source-coverage.json`.
- 24 rules are `source-scanner-enforced`; 22 are `source-scanner-assisted-human-review`; eight remain `schema-validated`; 14 remain `human-review-only`.
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
- Source scanner: implemented with the canonical P5 debt baseline and active strict ratchet.
- Page Contract Schema: not created.
- P4 AI cold-start atomic replacement: complete.
- P5 project-ui discovery, routing, synchronization, and adapter activation: complete.
- Legacy Skills and rules: retained.

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
P5_STARTED=yes
P5_COMPLETE=yes
PROJECT_UI_DISCOVERED=yes
PROJECT_UI_ROUTED=yes
PROJECT_UI_SYNCHRONIZED=yes
PROJECT_UI_ADAPTER_ACTIVATED=yes
PROJECT_UI_LOCKED=yes
PROJECT_UI_CODEX_SYNC_CONTRACT_COMPLETE=yes
PROJECT_UI_CLAUDE_SYNC_CONTRACT_COMPLETE=yes
SKILL_ROUTING_MANIFEST_CURRENT=yes
ROUTING_SCOPE_REGISTRY_COMPLETE=yes
SKILLS_LOCK_CURRENT=yes
RULE_INDEX_CURRENT=yes
NODE_PYTHON_ROUTER_PARITY=yes
GENERIC_UI_ROUTES_TO_PROJECT_UI=yes
MOTION_ROUTING_CONDITIONAL=yes
NON_UI_ROUTING_PRESERVED=yes
ADAPTER_PROJECT_UI_MAPPING_COMPLETE=yes
CODEX_ADAPTER_PROJECT_UI_ACTIVE=yes
CLAUDE_ADAPTER_PROJECT_UI_ACTIVE=yes
SOURCE_SCANNER_IMPLEMENTED=yes
PAGE_CONTRACT_CREATED=no
LEGACY_SKILLS_RETIRED=no
LEGACY_RULES_RETIRED=no
SOURCE_ENFORCEMENT_ACTIVE=yes
```
