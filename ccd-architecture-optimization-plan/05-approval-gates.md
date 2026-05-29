# 05 — 审批门禁

Approval structure is now recorded in:

- `docs/adr/ADR-006-approval-gated-architecture-lanes.md`
- `docs/ai-plan/DECISIONS.md`
- `.ai/runtime/owner_decisions.md`

## 必须审批后才能开始的事项

| Gate                     | 涉及路径                                                              | 审批人            | 不审批的处理                        |
| ------------------------ | --------------------------------------------------------------------- | ----------------- | ----------------------------------- |
| UI boundary policy       | `packages/vue-ui/**`, `packages/vue-primevue-adapter/**`, `apps/*/**` | Owner / Architect | 只做 audit，不加 guard              |
| HTTP contracts/core path | `packages/contracts/src/http/**`, `packages/core/src/http/**`         | Owner / Architect | 保持 `network.ts` 和 app HTTP infra |
| Guard strictness         | `scripts/ai-architecture-guard.mjs`, `.ai/rules/**`                   | Owner / Architect | 标记 BLOCKED，不硬加规则            |
| GitHub governance        | `.github/**`, branch protection, required checks                      | Operator          | 只写本地计划，不改远端              |
| Vite 8                   | `package.json`, `pnpm-lock.yaml`, Vite configs                        | Operator          | 只做 inventory                      |
| Dependency modernization | `package.json`, `pnpm-lock.yaml`                                      | Operator          | 不升级，不改 lockfile               |
| Login Diorama            | `apps/web-demo/src/views/login/**`, auth flow                         | Product / Owner   | P3 deferred                         |
| P4 strategic work        | org/starter/design-system/Reka/TanStack                               | Owner             | Deferred                            |

## 审批记录格式

```md
## ADR-YYYYMMDD-<topic>

- Decision:
- Approved by:
- Date:
- Scope:
- Allowed paths:
- Forbidden paths:
- Validation required:
- Rollback plan:
```
