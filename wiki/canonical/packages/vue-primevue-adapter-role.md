---
title_en: Vue PrimeVue Adapter Role
title_zh: Vue PrimeVue 适配器职责
aliases:
  - packages/vue-primevue-adapter
  - PrimeVue adapter
  - PrimeVue 适配层
tags:
  - packages
  - primevue
  - ui
tags_zh:
  - 包
  - PrimeVue
  - 界面
status: verified
confidence: 0.93
source_langs:
  - en
source_paths:
  - docs/generated/api-surface-report.md
  - docs/en/architecture-contract.md
  - docs/governance/primevue-i18n-verification.md
  - packages/vue-primevue-adapter/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/vue-primevue-adapter Package Boundary

## Owner boundary

`packages/vue-primevue-adapter` owns PrimeVue theme, PT, locale, runtime installation, services, message/toast/confirm facades, and integration adapters. PrimeVue remains the approved UI ecosystem.

## Public exports

The generated API report lists adapter exports such as `createPrimeVueAdapterConfig`, `installPrimeVueRuntime`, `installPrimeVueServices`, PrimeVue global components, service hooks, locale helpers, and message/toast APIs.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed dependencies are PrimeVue integration dependencies and package-level UI adapter contracts. App bootstrap installs PrimeVue through this adapter.

## Forbidden moves

Do not replace PrimeVue, add Reka UI, expand raw app-side `primevue/*` or `@primevue/*` imports, or turn app plugins into a second PrimeVue authority without a future owner-approved lane.

## Validation commands

```bash
pnpm api:report
pnpm arch:boundaries
pnpm lint:check
pnpm governance:gate
```

## Related pages

- [[vue-ui-role]]
- [[strategic-guardrails]]
- [[product-scope-boundary]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/generated/api-surface-report.md`
- `docs/en/architecture-contract.md`
- `docs/governance/primevue-i18n-verification.md`
- `packages/vue-primevue-adapter/**`
