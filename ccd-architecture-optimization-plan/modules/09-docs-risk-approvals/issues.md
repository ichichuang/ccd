# 文档、风险与审批闭环 — Issue Details

## DOC-001

- Priority: `P0`
- Severity: `High`
- Status: `OPEN`

### Paths

- `docs/architecture/adr/**`
- `docs/ai-plan/DECISIONS.md`
- `.ai/runtime/owner_decisions.md`

### Problem

多个 BLOCKED 项需要 owner/operator 决策，但缺少集中 ADR 输出结构。

### Best solution

新增 ADR 目录并为 UI boundary、HTTP contracts、guard scope、GitHub governance、Vite lane 分别建 ADR；owner_decisions.md 只做索引和状态。

### Validation

```bash
pnpm docs:commands
```

## DOC-002

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `docs/ai-plan/RISK_REGISTER.md`
- `docs/ai-plan/NEXT_ACTIONS.md`
- `docs/ai-plan/FINAL_GO_NO_GO.md`

### Problem

风险与行动项需要从 milestone 叙事转为 blocker/task ledger，便于统计。

### Best solution

建立 issue ledger：id/module/priority/path/owner/status/exit criteria/evidence；所有 docs 用同一 ID。

### Validation

```bash
pnpm ai:doctor --open && docs consistency check
```

## DOC-003

- Priority: `P3`
- Severity: `Medium`
- Status: `DEFERRED`

### Paths

- `apps/web-demo/src/views/login/**`
- `docs/ai-plan/PLAN.md`

### Problem

Login Diorama 属于 P3 feature/refactor，当前不应早于 P1/P2 稳定性工作。

### Best solution

维持 blocked/deferred；待 E2E、UI boundary、HTTP/auth retry policy 稳定后再开单独 feature lane。

### Validation

```bash
owner approval + auth/e2e regression
```

## DOC-004

- Priority: `P4`
- Severity: `Low`
- Status: `DEFERRED`

### Paths

- `docs/ai-plan/PLAN.md`
- `docs/ai-plan/FINAL_GO_NO_GO.md`

### Problem

新组织、starter、design-system、Reka/TanStack 等战略工作超出当前 repair scope。

### Best solution

保持 P4 deferred；必须有独立 business case、owner approval、branch strategy。

### Validation

```bash
owner approval only
```
