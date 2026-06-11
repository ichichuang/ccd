---
title_en: Strategic Guardrails
title_zh: 战略守卫
aliases:
  - P4 guardrails
  - Deferred strategic items
  - P4 守卫
  - 战略延期
tags:
  - governance
  - guardrails
  - p4
tags_zh:
  - 治理
  - 守卫
  - P4
status: verified
confidence: 0.97
source_langs:
  - en
source_paths:
  - wiki/**
  - .ai/runtime/repair_list.md
  - README.en.md
  - README.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Strategic Guardrails

P0, P1, P2, and P3 repair work is closed for the current architecture program. The remaining P4 entries are non-actionable strategic guardrails, not implementation tasks.

## Current P4 registry

| Guardrail                            | Status   | Operating meaning                                                           |
| ------------------------------------ | -------- | --------------------------------------------------------------------------- |
| `P4-Desktop-RustCommands`            | Deferred | Add Rust command handlers only in a future approved backend IPC lane.       |
| `P4-Desktop-RustErrors`              | Deferred | Structured Rust errors only after real Rust commands exist.                 |
| `P4-Desktop-UpdaterDeepLink-Blocked` | Blocked  | Updater and deep-link remain disabled until a trust model is approved.      |
| `P4-NewOrganization-Deferred`        | Deferred | Do not create a new GitHub organization/repository as repair work.          |
| `P4-Starter-Deferred`                | Deferred | Starter extraction waits for stable public package APIs and release policy. |
| `P4-DesignSystem-Deferred`           | Deferred | Standalone design-system split waits for stable UI/token boundaries.        |
| `P4-RekaUI-Deferred`                 | Deferred | PrimeVue remains approved; Reka UI requires specific gap analysis.          |
| `P4-TanStackQuery-Deferred`          | Deferred | Alova remains app-owned unless server-state evidence and approval exist.    |
| `P4-HttpCore-Blocked`                | Blocked  | Do not promote alova HTTP runtime into core/shared.                         |
| `P4-SafeStorageShared-Blocked`       | Blocked  | Do not promote safeStorage concrete runtime into `@ccd/shared-utils`.       |

## Operating rule

When a future request mentions any guardrail, treat it as blocked or deferred by default. The first valid step is an owner-decision update and scoped lane plan.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/**`
- `.ai/runtime/repair_list.md`
- `README.en.md`
- `README.md`

## Related pages

- [[desktop-security-baseline]]
- [[http-runtime-ownership]]
- [[safe-storage-runtime-ownership]]
- [[product-scope-boundary]]
