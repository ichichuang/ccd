---
title_en: Runtime Promotion Checklist
title_zh: 运行时提升检查表
aliases:
  - Promotion checklist
  - Runtime promotion
  - 运行时提升
tags:
  - operations
  - runtime
  - checklist
tags_zh:
  - 运维
  - 运行时
  - 检查表
status: verified
confidence: 0.88
source_langs:
  - en
source_paths:
  - docs/release/runtime-promotion-checklist.md
  - docs/en/architecture-contract.md
  - docs/runtime/runtime-isolation.md
  - docs/adr/ADR-006-approval-gated-architecture-lanes.md
  - docs/governance/strategic-guardrails.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Runtime Promotion Checklist

Runtime promotion means moving a capability from app-local ownership to a governed package or cross-runtime contract. Current policy prefers app adapters first and forbids broad runtime promotion without owner approval.

## Required before promotion

- Owner approval with scope, allowed paths, forbidden paths, validation, rollback, and evidence.
- Clear classification: contract, runtime-neutral facade, pure utility, Vue composable, UI primitive, adapter, or app runtime.
- Source evidence that app-local ownership is insufficient.
- Public export plan when a package boundary is involved.
- Runtime leak check and package boundary check.
- Generated API report review.

## Blocked examples under current policy

- alova HTTP runtime to `packages/core` or shared HTTP runtime.
- safeStorage concrete runtime to `@ccd/shared-utils`.
- Tauri `invoke()` outside `apps/desktop/src/adapters/**`.
- Browser storage/network runtime into `packages/core`.

## Validation commands

```bash
pnpm docs:commands
pnpm arch:runtime
pnpm arch:boundaries
pnpm api:report
pnpm governance:gate
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/release/runtime-promotion-checklist.md`
- `docs/en/architecture-contract.md`
- `docs/runtime/runtime-isolation.md`
- `docs/adr/ADR-006-approval-gated-architecture-lanes.md`
- `docs/governance/strategic-guardrails.md`

## Related pages

- [[public-capability-placement]]
- [[http-runtime-ownership]]
- [[safe-storage-runtime-ownership]]
- [[strategic-guardrails]]
