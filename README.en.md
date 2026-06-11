# CCD AI Portal

CCD is a self-protecting deterministic multi-runtime platform architecture repository.

## Canonical Reading Path

- Architecture wiki: [`wiki/index.md`](./wiki/index.md)
- AI maintainer entry: [`wiki/indexes/ai-entry.md`](./wiki/indexes/ai-entry.md)
- Chinese presentation entry: [`wiki/indexes-zh/开始阅读.md`](./wiki/indexes-zh/开始阅读.md)
- Generated evidence index: [`wiki/indexes/generated-evidence-index.md`](./wiki/indexes/generated-evidence-index.md)
- `/docs` migration status: [`wiki/generated/docs-migration-status.md`](./wiki/generated/docs-migration-status.md)
- `/docs` deletion readiness: [`wiki/generated/docs-deletion-readiness-report.md`](./wiki/generated/docs-deletion-readiness-report.md)

`/wiki` is the maintained architecture knowledge base. `/docs` is retained only as legacy compatibility and historical evidence until deletion readiness passes.

## Hard Architecture Invariant

```text
packages/contracts -> packages/core -> apps/*
```

- `packages/contracts` contains interfaces, DTOs, and shared types only.
- `packages/core` remains runtime-neutral and depends only on `@ccd/contracts`.
- Runtime APIs stay in app adapters or approved app-owned runtime infrastructure.
- Do not add global `@ccd/*` TypeScript aliases.
- Do not move alova HTTP runtime or safeStorage runtime.
- Do not implement P4 strategic guardrails without a future owner-approved lane.

## Validation

Before documenting or invoking a command, confirm it exists in root `package.json`.

```bash
pnpm wiki:validate
pnpm docs:commands
pnpm codex:preflight
pnpm governance:gate
pnpm validate
```

See [`wiki/canonical/governance/command-surface.md`](./wiki/canonical/governance/command-surface.md), [`wiki/canonical/governance/validation-gates.md`](./wiki/canonical/governance/validation-gates.md), and [`wiki/canonical/governance/future-owner-approved-lanes.md`](./wiki/canonical/governance/future-owner-approved-lanes.md).
