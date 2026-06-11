---
title_en: Future Owner-approved Lanes
title_zh: 未来 Owner 批准车道
aliases:
  - Owner-approved lanes
  - Future lanes
  - 未来批准车道
  - Owner 批准车道
tags:
  - governance
  - strategic-guardrails
  - future-lanes
tags_zh:
  - 治理
  - 战略守卫
  - 未来车道
status: verified
confidence: 0.93
source_langs:
  - en
  - zh
source_paths:
  - .ai/runtime/repair_list.md
  - .ai/runtime/owner_decisions.md
  - docs/governance/strategic-guardrails.md
  - docs/adr/ADR-006-approval-gated-architecture-lanes.md
  - docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Future Owner-approved Lanes

Current `main` treats P4 items as non-actionable strategic guardrails. A future lane can only implement one of those topics after the owner records explicit approval, scope, prerequisites, validation, rollback, and evidence. This page documents the gate; it does not approve implementation.

## Deferred or blocked topics

- Rust command handlers and structured Rust IPC errors.
- Tauri updater, deep-link runtime, and sensitive desktop plugins.
- New GitHub organization, new repository, `ccd-vue-starter`, or standalone design-system repository.
- Reka UI or TanStack Query Vue evaluation.
- Promoting alova HTTP runtime into `packages/core` or a generic shared request package.
- Promoting safeStorage crypto, compression, serializer, migration, maintenance, or runtime facade into `@ccd/shared-utils`.
- Dependency upgrades or major toolchain changes outside isolated owner-approved lanes.

## Approval requirements

Each future lane must preserve the current architecture unless the owner explicitly changes it:

- `packages/contracts` remains interfaces and shared types only.
- `packages/core` remains runtime-neutral.
- Runtime APIs stay in app adapters or approved app-owned runtime infrastructure.
- No global `@ccd/*` TypeScript aliases are added to root `tsconfig.base.json`.
- GitHub remote governance settings are not mutated unless the lane explicitly authorizes remote governance work.

## Evidence paths

- `.ai/runtime/repair_list.md`
- `.ai/runtime/owner_decisions.md`
- `docs/governance/strategic-guardrails.md`
- `docs/adr/ADR-006-approval-gated-architecture-lanes.md`
- `docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md`

## Related pages

- [[strategic-guardrails]]
- [[product-scope-boundary]]
- [[http-runtime-ownership]]
- [[safe-storage-runtime-ownership]]
- [[desktop-tauri-backend-boundary]]
